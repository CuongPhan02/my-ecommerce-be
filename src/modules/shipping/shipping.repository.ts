import { Database } from '@/plugins/database';
import { CreateShippingInput, UpdateShippingInput } from './shipping.validate';
import { shippingMethods } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export class ShippingRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getAllMethods() {
    return this.db.query.shippingMethods.findMany({
      orderBy: [desc(shippingMethods.createdAt)],
    });
  }

  async getActiveMethods() {
    return this.db.query.shippingMethods.findMany({
      where: eq(shippingMethods.isActive, true),
      orderBy: [desc(shippingMethods.createdAt)],
    });
  }

  async getMethodById(id: string) {
    return this.db.query.shippingMethods.findFirst({
      where: eq(shippingMethods.id, id),
    });
  }

  async createMethod(data: CreateShippingInput) {
    const [method] = await this.db
      .insert(shippingMethods)
      .values(data)
      .returning();
    return method;
  }

  async updateMethod(id: string, data: UpdateShippingInput) {
    const [updated] = await this.db
      .update(shippingMethods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shippingMethods.id, id))
      .returning();
    return updated;
  }

  async deleteMethod(id: string) {
    return this.db.delete(shippingMethods).where(eq(shippingMethods.id, id));
  }
}
