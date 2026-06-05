import { Database } from '@/plugins/database';
import { reviews, products, users, productVariants, orders, orderItems } from '@/db/schema';
import { eq, and, desc, asc, sql, or, like } from 'drizzle-orm';
import { ReviewQueryType } from './review.validate';
import { formatVND } from '@/utils/lib';

export class ReviewRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getPurchasedProductVariantId(userId: string, productId: string): Promise<string | null> {
    const result = await this.db
      .select({ productVariantId: orderItems.productVariantId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.status, 'DELIVERED'),
          eq(productVariants.productId, productId)
        )
      )
      .limit(1);
    return result.length > 0 && result[0] ? result[0].productVariantId : null;
  }

  async hasUserPurchasedProduct(userId: string, productId: string, _productVariantId?: string): Promise<boolean> {
    // Luôn kiểm tra xem người dùng đã mua sản phẩm này chưa (bất kỳ biến thể nào)
    const result = await this.db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.status, 'DELIVERED'),
          eq(productVariants.productId, productId)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  async hasUserReviewedProduct(userId: string, productId: string, _productVariantId?: string): Promise<boolean> {
    // Tối đa 1 đánh giá cho mỗi người dùng trên mỗi sản phẩm
    const existing = await this.db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, userId),
        eq(reviews.productId, productId)
      ),
    });
    return !!existing;
  }

  async create(data: {
    productId: string;
    productVariantId?: string | undefined;
    userId: string;
    rating: number;
    content: string;
    tags?: string[] | undefined;
  }) {
    // Tự động tìm biến thể người dùng đã mua thực tế trong đơn hàng để gán vào review
    let actualVariantId = data.productVariantId || null;
    const purchasedVariantId = await this.getPurchasedProductVariantId(data.userId, data.productId);
    if (purchasedVariantId) {
      actualVariantId = purchasedVariantId;
    }

    const [newReview] = await this.db
      .insert(reviews)
      .values({
        productId: data.productId,
        productVariantId: actualVariantId,
        userId: data.userId,
        rating: data.rating,
        content: data.content,
        tags: data.tags || null,
        status: 'PENDING', // Default to pending moderation
      })
      .returning();
    return newReview;
  }

  async findById(id: string) {
    const review = await this.db.query.reviews.findFirst({
      where: eq(reviews.id, id),
      with: {
        product: {
          with: {
            thumbnail: true,
          },
        },
        productVariant: {
          with: {
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
        user: true,
        repliedBy: true,
      },
    });

    return this.formatReview(review);
  }

  async updateReview(id: string, updateData: Partial<typeof reviews.$inferInsert>) {
    const [updated] = await this.db
      .update(reviews)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();
    return deleted;
  }

  async findAll(query: ReviewQueryType) {
    const { page = 1, limit = 10, search, status, rating, productId, sort = 'desc' } = query;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(reviews.status, status));
    }
    if (rating) {
      conditions.push(eq(reviews.rating, rating));
    }
    if (productId) {
      conditions.push(eq(reviews.productId, productId));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(reviews.content, searchPattern),
          sql`exists (
            select 1 from product p 
            where p.id = ${reviews.productId} 
            and p.name ilike ${searchPattern}
          )`,
          sql`exists (
            select 1 from users u 
            where u.id = ${reviews.userId} 
            and u.name ilike ${searchPattern}
          )`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await this.db.query.reviews.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: sort === 'asc' ? asc(reviews.createdAt) : desc(reviews.createdAt),
      with: {
        product: {
          with: {
            thumbnail: true,
          },
        },
        productVariant: {
          with: {
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
        user: true,
        repliedBy: true,
      },
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    return {
      data: results.map((review) => this.formatReview(review)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findApprovedByProductId(productId: string, query: { page: number; limit: number }) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const whereClause = and(
      eq(reviews.productId, productId),
      eq(reviews.status, 'APPROVED')
    );

    const results = await this.db.query.reviews.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: desc(reviews.createdAt),
      with: {
        productVariant: {
          with: {
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
        user: true,
        repliedBy: true,
      },
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    return {
      data: results.map((review) => this.formatReview(review)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private formatReview(review: any) {
    if (!review) return null;

    const variant = review.productVariant;
    const mappedAttributes = (variant?.attributes || []).map((attr: any) => {
      const valObj = attr.attributeValue;
      return {
        name: valObj?.attribute?.name || '',
        value: valObj?.value || '',
      };
    });

    const variantLabel = mappedAttributes
      .map((attr: any) => `${attr.name.toUpperCase()}: ${attr.value}`)
      .join(' | ');

    return {
      id: review.id,
      productId: review.productId,
      productVariantId: review.productVariantId,
      userId: review.userId,
      rating: review.rating,
      content: review.content,
      tags: review.tags || [],
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
            slug: review.product.slug,
            thumbnailUrl: review.product.thumbnail?.url || null,
          }
        : undefined,
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            priceFormatted: formatVND(variant.price),
            attributes: mappedAttributes,
            label: variantLabel,
          }
        : null,
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.name,
            email: review.user.email,
            avatarUrl: review.user.avatarUrl || null,
          }
        : null,
      reply: review.adminReply
        ? {
            content: review.adminReply,
            createdAt: review.adminReplyAt,
            repliedBy: review.repliedBy
              ? {
                  id: review.repliedBy.id,
                  name: review.repliedBy.name,
                }
              : null,
          }
        : null,
    };
  }
}
export type FormattedReviewType = ReturnType<ReviewRepository['formatReview']>;
