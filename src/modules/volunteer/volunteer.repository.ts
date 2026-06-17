import { db } from '@/db/config';
import { volunteers } from '@/db/schema';
import { eq, ilike, or, and, desc, sql, inArray } from 'drizzle-orm';

export class VolunteerRepository {
  async create(data: { fullName: string; phone: string; email: string; message?: string | null }) {
    const [result] = await db
      .insert(volunteers)
      .values({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        ...(data.message !== undefined && data.message !== null && { message: data.message }),
      })
      .returning();
    return result;
  }

  async getList(query: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(volunteers.fullName, `%${search}%`),
          ilike(volunteers.email, `%${search}%`),
          ilike(volunteers.phone, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(volunteers)
      .where(whereClause);

    const items = await db
      .select()
      .from(volunteers)
      .where(whereClause)
      .orderBy(desc(volunteers.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalCountResult?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async delete(id: string) {
    const [result] = await db
      .delete(volunteers)
      .where(eq(volunteers.id, id))
      .returning();
    return result;
  }

  async getByIds(ids: string[]) {
    return db
      .select({
        id: volunteers.id,
        email: volunteers.email,
        fullName: volunteers.fullName,
      })
      .from(volunteers)
      .where(inArray(volunteers.id, ids));
  }

  async getAllEmails() {
    return db
      .select({
        id: volunteers.id,
        email: volunteers.email,
        fullName: volunteers.fullName,
      })
      .from(volunteers);
  }
}
