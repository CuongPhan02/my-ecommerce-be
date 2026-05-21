import { eq, desc, asc, ilike, or, and, count, inArray, SQL, isNotNull } from 'drizzle-orm';
import { Database } from '@/plugins/database';
import { users, profiles } from '@/db/schema';
import { UserQueryType } from './user.validation';
import { createId } from '@paralleldrive/cuid2';

export class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllUsers(query: UserQueryType) {
    const { page, limit, search, role, status, isSystem, sort, sortBy } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (status) {
      conditions.push(eq(users.isActive, status === 'ACTIVE'));
    }

    if (isSystem !== undefined) {
      const systemRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'SALES', 'EDITOR', 'INVENTORY'];
      if (isSystem) {
        conditions.push(inArray(users.role, systemRoles as any));
      } else {
        // Exclude system roles (only CUSTOMER, VENDOR)
        const nonSystemRoles = ['CUSTOMER', 'VENDOR'];
        conditions.push(inArray(users.role, nonSystemRoles as any));
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          users.phone ? ilike(users.phone, `%${search}%`) : undefined,
          users.staffCode ? ilike(users.staffCode, `%${search}%`) : undefined
        ) as SQL
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let sortColumn;
    if (sortBy === 'name') {
      sortColumn = users.name;
    } else if (sortBy === 'email') {
      sortColumn = users.email;
    } else if (sortBy === 'staffCode') {
      sortColumn = users.staffCode;
    } else if (sortBy === 'lastLogin') {
      sortColumn = users.lastLogin;
    } else {
      sortColumn = users.createdAt;
    }

    const sortOrder = sort === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          staffCode: users.staffCode,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: count() })
        .from(users)
        .where(whereClause)
        .then((res: any[]) => res[0]?.count ?? 0),
    ]);

    return {
      data,
      total: totalResult,
    };
  }

  async getUserById(id: string) {
    const result = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        staffCode: users.staffCode,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profile: {
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          bio: profiles.bio,
          birthday: profiles.birthday,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findUserByPhone(phone: string) {
    return this.db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
  }

  async createUser(data: any) {
    const userId = createId();
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    const isSystemRole = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'SALES', 'EDITOR', 'INVENTORY'].includes(data.role);

    return this.db.transaction(async (tx) => {
      let staffCode = null;
      if (isSystemRole) {
        const latestStaff = await tx
          .select({ staffCode: users.staffCode })
          .from(users)
          .where(isNotNull(users.staffCode))
          .orderBy(desc(users.staffCode))
          .limit(1);

        let nextNum = 1;
        const firstStaff = latestStaff[0];
        if (firstStaff && firstStaff.staffCode) {
          const match = firstStaff.staffCode.match(/STF-(\d+)/);
          if (match && match[1]) {
            nextNum = parseInt(match[1], 10) + 1;
          }
        }
        staffCode = `STF-${nextNum.toString().padStart(3, '0')}`;
      }

      const [newUser] = await tx
        .insert(users)
        .values({
          id: userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          isActive: data.isActive,
          password: data.password,
          emailVerified: true,
          staffCode,
        })
        .returning();

      await tx.insert(profiles).values({
        id: createId(),
        userId: userId,
        firstName: firstName as string,
        lastName: lastName as string,
      });

      return newUser;
    });
  }

  async updateUser(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.db.transaction(async (tx) => {
      if (data.role !== undefined) {
        const isSystemRole = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'SALES', 'EDITOR', 'INVENTORY'].includes(data.role);
        if (isSystemRole) {
          const currentUser = await tx.query.users.findFirst({
            where: eq(users.id, id),
          });
          if (currentUser && !currentUser.staffCode) {
            const latestStaff = await tx
              .select({ staffCode: users.staffCode })
              .from(users)
              .where(isNotNull(users.staffCode))
              .orderBy(desc(users.staffCode))
              .limit(1);

            let nextNum = 1;
            const firstStaff = latestStaff[0];
            if (firstStaff && firstStaff.staffCode) {
              const match = firstStaff.staffCode.match(/STF-(\d+)/);
              if (match && match[1]) {
                nextNum = parseInt(match[1], 10) + 1;
              }
            }
            updateData.staffCode = `STF-${nextNum.toString().padStart(3, '0')}`;
          }
        }
      }

      const [updatedUser] = await tx
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      // If name is updated, also update firstName and lastName in profiles
      if (data.name !== undefined) {
        const nameParts = data.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

        await tx
          .update(profiles)
          .set({
            firstName: firstName as string,
            lastName: lastName as string,
          })
          .where(eq(profiles.userId, id));
      }

      return updatedUser;
    });
  }

  async deleteUser(id: string) {
    return this.db.transaction(async (tx) => {
      // Delete profile first due to foreign key constraints if cascading is not set up
      await tx.delete(profiles).where(eq(profiles.userId, id));
      const [deletedUser] = await tx.delete(users).where(eq(users.id, id)).returning();
      return deletedUser;
    });
  }

  async bulkDeleteUsers(ids: string[]) {
    return this.db.transaction(async (tx) => {
      await tx.delete(profiles).where(inArray(profiles.userId, ids));
      const deletedUsers = await tx.delete(users).where(inArray(users.id, ids)).returning();
      return deletedUsers;
    });
  }
}
