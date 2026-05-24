import { Database } from '@/plugins/database';
import { carts, cartItems, productVariants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatVND } from '@/utils/lib';

export class CartRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getOrCreateCart(userId: string) {
    // Try to find existing cart
    let cart = await this.db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    // If not exists, create one
    if (!cart) {
      const [newCart] = await this.db
        .insert(carts)
        .values({ userId })
        .returning();
      if (!newCart) {
        throw new Error('Failed to create cart');
      }
      cart = newCart;
    }

    return cart;
  }

  async getCartDetails(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    // Fetch the cart with detailed relations
    const detailedCart = await this.db.query.carts.findFirst({
      where: eq(carts.id, cart.id),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: {
                  with: {
                    thumbnail: true,
                  },
                },
                attributes: {
                  with: {
                    attributeValue: {
                      with: {
                        attribute: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!detailedCart) return null;

    // Clean up and format the items details
    const formattedItems = (detailedCart.items || []).map((item) => {
      const variant = item.productVariant;
      const product = variant?.product;
      
      // Map attributes to simple name-value array
      const mappedAttributes = (variant?.attributes || []).map((attr) => {
        const valObj = attr.attributeValue;
        return {
          name: valObj?.attribute?.name || '',
          value: valObj?.value || '',
        };
      });

      return {
        id: item.id,
        quantity: item.quantity,
        productVariantId: item.productVariantId,
        variant: variant ? {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          priceFormatted: formatVND(variant.price),
          stockQuantity: variant.stockQuantity,
          attributes: mappedAttributes,
        } : null,
        product: product ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          thumbnailUrl: product.thumbnail?.url || null,
        } : null,
      };
    });

    return {
      id: detailedCart.id,
      userId: detailedCart.userId,
      createdAt: detailedCart.createdAt,
      updatedAt: detailedCart.updatedAt,
      items: formattedItems,
    };
  }

  async findProductVariant(variantId: string) {
    return this.db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
    });
  }

  async addItemToCart(cartId: string, productVariantId: string, quantity: number) {
    // Check if item already exists in the cart
    const existingItem = await this.db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productVariantId, productVariantId)
      ),
    });

    if (existingItem) {
      // Update quantity on conflict
      const [updatedItem] = await this.db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await this.db
        .insert(cartItems)
        .values({
          cartId,
          productVariantId,
          quantity,
        })
        .returning();
      return newItem;
    }
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    const [updatedItem] = await this.db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .returning();
    return updatedItem;
  }

  async removeItemFromCart(cartId: string, itemId: string) {
    const [deletedItem] = await this.db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .returning();
    return deletedItem;
  }

  async clearCart(cartId: string) {
    return this.db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartId));
  }
}
