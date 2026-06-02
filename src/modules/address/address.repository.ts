import { eq, and } from 'drizzle-orm';
import { Database } from '@/plugins/database';
import { addresses } from '@/db/schema';
import { CreateAddressType, UpdateAddressType } from './address.validation';

export class AddressRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAddressesByUserId(userId: string) {
    return this.db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
    });
  }

  async getAddressById(id: string, userId: string) {
    return this.db.query.addresses.findFirst({
      where: and(eq(addresses.id, id), eq(addresses.userId, userId)),
    });
  }

  async createAddress(userId: string, data: CreateAddressType) {
    return this.db.transaction(async (tx) => {
      if (data.isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      const [newAddress] = await tx
        .insert(addresses)
        .values({
          ...data,
          userId,
        })
        .returning();

      return newAddress;
    });
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressType) {
    return this.db.transaction(async (tx) => {
      if (data.isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      const [updatedAddress] = await tx
        .update(addresses)
        .set(data)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning();

      return updatedAddress;
    });
  }

  async deleteAddress(id: string, userId: string) {
    const [deletedAddress] = await this.db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();

    return deletedAddress;
  }

  async setDefaultAddress(id: string, userId: string) {
    return this.db.transaction(async (tx) => {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));

      const [updatedAddress] = await tx
        .update(addresses)
        .set({ isDefault: true })
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning();

      return updatedAddress;
    });
  }
}
