import { Database } from '@/plugins/database';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateBrandInput,
  UpdateBrandInput,
} from './product.validate';
import { eq, inArray, count } from 'drizzle-orm';
import {
  attributes,
  attributeValues,
  attributeValuesToVariants,
  categories,
  productImages,
  products,
  productVariants,
  productsToCollections,
  collections,
  brands,
  productAttributeOptions,
} from '@/db/schema';
import { ilike, and, or, isNull, gte, gt, lte, desc, asc, exists } from 'drizzle-orm';
import { formatVND } from '@/utils/lib';

export interface GetProductsFilter {
  page: number;
  limit: number;
  search?: string | undefined;
  categoryId?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | undefined;
  brandId?: string | undefined;
  brandIds?: string[] | undefined;
  collectionId?: string | undefined;
  attributeValueIds?: string[] | undefined;
  isFlashSale?: boolean | undefined;
}

export class ProductRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  private async getOrCreateAttribute(tx: any, attributeCache: Map<string, string>, name: string): Promise<string> {
    const cachedId = attributeCache.get(name);
    if (cachedId) return cachedId;

    let attr = await tx.query.attributes.findFirst({
      where: eq(attributes.name, name),
    });

    if (!attr) {
      const [newAttr] = await tx
        .insert(attributes)
        .values({ name })
        .returning();
      attr = newAttr;
    }

    if (!attr) {
      throw new Error(`Không thể tạo thuộc tính: ${name}`);
    }

    attributeCache.set(name, attr.id);
    return attr.id;
  }

  private async getOrCreateAttributeValue(tx: any, attributeValueCache: Map<string, string>, attributeId: string, value: string): Promise<string> {
    const cacheKey = `${attributeId}:${value}`;
    const cachedId = attributeValueCache.get(cacheKey);
    if (cachedId) return cachedId;

    let val = await tx.query.attributeValues.findFirst({
      where: and(
        eq(attributeValues.attributeId, attributeId),
        eq(attributeValues.value, value)
      ),
    });

    if (!val) {
      const [newVal] = await tx
        .insert(attributeValues)
        .values({
          attributeId,
          value,
        })
        .returning();
      val = newVal;
    }

    if (!val) {
      throw new Error(`Không thể tạo giá trị thuộc tính: ${value}`);
    }

    attributeValueCache.set(cacheKey, val.id);
    return val.id;
  }

  async findCategoryById(id: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  }

  async findCategoryByName(name: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.name, name),
    });
  }

  async findCategoryBySlug(slug: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
  }

  async findProductBySlug(slug: string) {
    return this.db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  }

  async createProduct(data: CreateProductInput) {
    const {
      name,
      description,
      slug,
      categoryId,
      variants,
      mediaIds,
      collectionIds,
      type,
      brandId,
      summary,
      tags,
      thumbnailId,
      isFeatured,
      isRefunded,
      hasWarranty,
      metaTitle,
      metaDescription,
      metaImageId,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      disableShipping,
    } = data;

    return await this.db.transaction(async (tx) => {
      // 1. Create Product
      const [newProduct] = await tx
        .insert(products)
        .values({
          name,
          description,
          slug,
          categoryId,
          type,
          brandId,
          summary,
          tags,
          thumbnailId,
          isFeatured,
          isRefunded,
          hasWarranty,
          metaTitle,
          metaDescription,
          metaImageId,
          discountType,
          discountValue,
          discountStartDate: discountStartDate
            ? new Date(discountStartDate)
            : null,
          discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
          disableShipping,
        })
        .returning();

      if (!newProduct) {
        throw new Error('Không thể tạo sản phẩm');
      }

      // 2. Create Product Images
      if (mediaIds && mediaIds.length > 0) {
        await tx.insert(productImages).values(
          mediaIds.map((mediaId, index) => ({
            productId: newProduct.id,
            mediaId,
            displayOrder: index,
          }))
        );
      }

      // 2.5 Associate with Collections
      if (collectionIds && collectionIds.length > 0) {
        await tx
          .insert(productsToCollections)
          .values(
            collectionIds.map((collectionId) => ({
              productId: newProduct.id,
              collectionId,
            }))
          )
          .onConflictDoNothing();
      }

      const productId = newProduct.id;
      const { options } = data;

      // Cache for attributes and their values to avoid redundant queries/inserts and unique constraint conflicts
      const attributeCache = new Map<string, string>(); // name -> id
      const attributeValueCache = new Map<string, string>(); // `${attributeId}:${value}` -> id

      // 1.5. Create Product Options (If any)
      if (options && options.length > 0) {
        for (const option of options) {
          const attrId = await this.getOrCreateAttribute(tx, attributeCache, option.name);

          // Deduplicate option values case-insensitively while preserving original casing
          const uniqueValues: string[] = [];
          const seenValues = new Set<string>();
          for (const val of option.values) {
            const trimmed = val.trim();
            const lower = trimmed.toLowerCase();
            if (!seenValues.has(lower)) {
              seenValues.add(lower);
              uniqueValues.push(trimmed);
            }
          }

          // Handle values
          for (const valName of uniqueValues) {
            const valId = await this.getOrCreateAttributeValue(tx, attributeValueCache, attrId, valName);

            // Link to Product
            await tx
              .insert(productAttributeOptions)
              .values({
                productId,
                attributeValueId: valId,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 2. Create Variants
      if (variants && variants.length > 0) {
        // Deduplicate variants in request body to prevent duplicate inserts
        const uniqueVariants: NonNullable<CreateProductInput['variants']> = [];
        const seenSkus = new Set<string>();
        const seenAttributesStr = new Set<string>();

        for (const variant of variants) {
          const trimmedSku = variant.sku.trim();
          const lowerSku = trimmedSku.toLowerCase();

          // Generate a canonical string representing the variant's attributes
          const attributesStr = variant.attributes
            ? [...variant.attributes]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(a => `${a.name.toLowerCase().trim()}:${a.value.toLowerCase().trim()}`)
                .join(',')
            : '';

          // Skip duplicate SKUs in the same request
          if (seenSkus.has(lowerSku)) {
            continue;
          }
          // Skip duplicate attribute combinations in the same request
          if (attributesStr && seenAttributesStr.has(attributesStr)) {
            continue;
          }

          seenSkus.add(lowerSku);
          if (attributesStr) {
            seenAttributesStr.add(attributesStr);
          }
          uniqueVariants.push(variant);
        }

        for (const variant of uniqueVariants) {
          let finalSku = variant.sku.trim();

          // Check if the SKU already exists globally in the database
          let existVariant = await tx.query.productVariants.findFirst({
            where: eq(productVariants.sku, finalSku),
          });

          // If SKU already exists globally, append a unique suffix to keep it unique
          while (existVariant) {
            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            finalSku = `${variant.sku.trim()}-${randomSuffix}`;
            existVariant = await tx.query.productVariants.findFirst({
              where: eq(productVariants.sku, finalSku),
            });
          }

          // 3.1 Create Variant
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId: newProduct.id,
              sku: finalSku,
              price: variant.price,
              stockQuantity: variant.stock,
              purchasePrice: variant.purchasePrice ?? 0,
              lowStockQuantity: variant.lowStockQuantity ?? 0,
            })
            .returning();

          // 3.2 Handle Attributes
          if (variant.attributes && variant.attributes.length > 0) {
            for (const attr of variant.attributes) {
              const attributeId = await this.getOrCreateAttribute(tx, attributeCache, attr.name);
              const valueId = await this.getOrCreateAttributeValue(tx, attributeValueCache, attributeId, attr.value);

              if (valueId && newVariant) {
                // 3.3 Link Attribute Value to Variant
                await tx.insert(attributeValuesToVariants).values({
                  productVariantId: newVariant.id,
                  attributeValueId: valueId,
                });
              }
            }
          }
        }
      }

      return await this.getProductById(newProduct.id);
    });
  }

  private mapProductOptions(product: any) {
    if (!product) return null;

    const groupedOptions = (product.options || []).reduce(
      (acc: any[], curr: any) => {
        const attrName = curr.attributeValue?.attribute?.name;
        const val = curr.attributeValue?.value;

        if (attrName && val) {
          const existing = acc.find((item) => item.name === attrName);
          if (existing) {
            existing.values.push(val);
          } else {
            acc.push({ name: attrName, values: [val] });
          }
        }
        return acc;
      },
      []
    );

    const mappedVariants = (product.variants || []).map((v: any) => ({
      ...v,
      stock: v.stockQuantity,
      priceFormatted: formatVND(v.price),
    }));

    const totalStock = mappedVariants.reduce(
      (acc: number, variant: any) => acc + (variant.stock || 0),
      0
    );

    const {
      options,
      variants: oldVariants,
      tags,
      collections: rawCollections,
      ...rest
    } = product;
    return {
      ...rest,
      options: groupedOptions,
      variants: mappedVariants,
      collections: (rawCollections || []).map((c: any) => c.collection),
      stock: totalStock,
      tags: tags || [],
    };
  }

  async getAllProducts(query: GetProductsFilter) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      brandId,
      brandIds,
      collectionId,
      attributeValueIds,
      minPrice,
      maxPrice,
      sort,
      isFlashSale,
    } = query;

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      whereConditions.push(ilike(products.name, `%${search}%`));
    }

    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }

    if (brandId) {
      whereConditions.push(eq(products.brandId, brandId));
    }

    if (brandIds && brandIds.length > 0) {
      whereConditions.push(inArray(products.brandId, brandIds));
    }

    if (collectionId) {
      const collectionSubquery = this.db
        .select({ productId: productsToCollections.productId })
        .from(productsToCollections)
        .innerJoin(
          collections,
          eq(productsToCollections.collectionId, collections.id)
        )
        .where(
          or(
            eq(productsToCollections.collectionId, collectionId),
            eq(collections.slug, collectionId)
          )
        );

      whereConditions.push(inArray(products.id, collectionSubquery));
    }

    if (attributeValueIds && attributeValueIds.length > 0) {
      whereConditions.push(
        exists(
          this.db
            .select()
            .from(productAttributeOptions)
            .where(
              and(
                eq(productAttributeOptions.productId, products.id),
                inArray(
                  productAttributeOptions.attributeValueId,
                  attributeValueIds
                )
              )
            )
        )
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.push(
        exists(
          this.db
            .select()
            .from(productVariants)
            .where(
              and(
                eq(productVariants.productId, products.id),
                minPrice !== undefined
                  ? gte(productVariants.price, minPrice)
                  : undefined,
                maxPrice !== undefined
                  ? lte(productVariants.price, maxPrice)
                  : undefined
              )
            )
        )
      );
    }

    if (isFlashSale) {
      const now = new Date();
      whereConditions.push(
        and(
          gt(products.discountValue, 0), // Has discount
          or(
            isNull(products.discountStartDate),
            lte(products.discountStartDate, now)
          ), // Started or no start date
          or(
            isNull(products.discountEndDate),
            gte(products.discountEndDate, now)
          ) // Not yet ended or no end date
        )
      );
    }

    let orderBy;
    switch (sort) {
      case 'oldest':
        orderBy = asc(products.createdAt);
        break;
      case 'newest':
      default:
        orderBy = desc(products.createdAt);
        break;
    }

    const allProducts = await this.db.query.products.findMany({
      limit: limit,
      offset: offset,
      where: and(...whereConditions),
      orderBy: orderBy,
      with: {
        brand: true,
        thumbnail: true,
        metaImage: true,
        images: {
          with: {
            media: true,
          },
        },
        category: true,
        collections: {
          with: {
            collection: true,
          },
        },
        options: {
          with: {
            attributeValue: {
              with: {
                attribute: true,
              },
            },
          },
        },
        variants: {
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
      },
    });

    const [total] = await this.db
      .select({ count: count() })
      .from(products)
      .where(and(...whereConditions));

    return {
      products: allProducts.map((p) => this.mapProductOptions(p)),
      total: total?.count || 0,
    };
  }

  async getProductById(id: string) {
    const product = await this.db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        brand: true,
        thumbnail: true,
        metaImage: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
          with: {
            media: true,
          },
        },
        category: true,
        collections: {
          with: {
            collection: true,
          },
        },
        options: {
          with: {
            attributeValue: {
              with: {
                attribute: true,
              },
            },
          },
        },
        variants: {
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
      },
    });
    if (!product) return null;

    return this.mapProductOptions(product);
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const {
      variants,
      mediaIds,
      collectionIds,
      options,
      discountStartDate,
      discountEndDate,
      ...productData
    } = data;

    return await this.db.transaction(async (tx) => {
      // 0. Cache for attributes
      const attributeCache = new Map<string, string>();
      const attributeValueCache = new Map<string, string>();

      // 1. Prepare and Update basic product info
      const updatePayload: Record<string, any> = { ...productData };
      if (discountStartDate !== undefined) {
        updatePayload.discountStartDate = discountStartDate
          ? new Date(discountStartDate)
          : null;
      }
      if (discountEndDate !== undefined) {
        updatePayload.discountEndDate = discountEndDate
          ? new Date(discountEndDate)
          : null;
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx.update(products).set(updatePayload).where(eq(products.id, id));
      }

      // 2. Update Options (Sync)
      if (options !== undefined) {
        // Delete existing options
        await tx
          .delete(productAttributeOptions)
          .where(eq(productAttributeOptions.productId, id));

        // Insert new options
        if (options && options.length > 0) {
          for (const option of options) {
            const attrId = await this.getOrCreateAttribute(tx, attributeCache, option.name);

            // Handle values
            for (const valName of option.values) {
              const valId = await this.getOrCreateAttributeValue(tx, attributeValueCache, attrId, valName);

              // Link to Product
              await tx
                .insert(productAttributeOptions)
                .values({
                  productId: id,
                  attributeValueId: valId,
                })
                .onConflictDoNothing();
            }
          }
        }
      }

      // 3. Update Collections (Sync)
      if (collectionIds !== undefined) {
        // Delete existing associations
        await tx
          .delete(productsToCollections)
          .where(eq(productsToCollections.productId, id));

        // Insert new associations
        if (collectionIds && collectionIds.length > 0) {
          await tx.insert(productsToCollections).values(
            collectionIds.map((collectionId) => ({
              productId: id,
              collectionId,
            }))
          );
        }
      }

      // 4. Update Images (Sync)
      if (mediaIds !== undefined) {
        // Delete existing images
        await tx
          .delete(productImages)
          .where(eq(productImages.productId, id));

        // Insert new images
        if (mediaIds && mediaIds.length > 0) {
          await tx.insert(productImages).values(
            mediaIds.map((mediaId, index) => ({
              productId: id,
              mediaId,
              displayOrder: index,
            }))
          );
        }
      }

      // 5. Update Variants (Sync)
      if (variants !== undefined) {
        const existingVariants = await tx.query.productVariants.findMany({
          where: eq(productVariants.productId, id),
        });

        // 5.1 Deduplicate incoming variants
        const incomingVariants = variants || [];
        const uniqueIncoming: typeof incomingVariants = [];
        const seenSkus = new Set<string>();
        for (const v of incomingVariants) {
          const lowerSku = v.sku.trim().toLowerCase();
          if (!seenSkus.has(lowerSku)) {
            seenSkus.add(lowerSku);
            uniqueIncoming.push(v);
          }
        }

        const incomingSkus = uniqueIncoming.map(v => v.sku.trim());

        // 5.2 Delete variants not in incoming list
        const variantsToDelete = existingVariants.filter(v => !incomingSkus.includes(v.sku));
        if (variantsToDelete.length > 0) {
          await tx.delete(productVariants).where(
            inArray(productVariants.id, variantsToDelete.map(v => v.id))
          );
        }

        // 5.3 Update or Create
        for (const v of uniqueIncoming) {
          const existing = existingVariants.find(ev => ev.sku === v.sku);
          
          if (existing) {
            // Update existing variant
            await tx
              .update(productVariants)
              .set({
                price: v.price,
                stockQuantity: v.stock,
                purchasePrice: v.purchasePrice ?? 0,
                lowStockQuantity: v.lowStockQuantity ?? 0,
              })
              .where(eq(productVariants.id, existing.id));

            // Sync attributes for existing variant
            if (v.attributes) {
              await tx.delete(attributeValuesToVariants).where(eq(attributeValuesToVariants.productVariantId, existing.id));
              for (const attr of v.attributes) {
                const attributeId = await this.getOrCreateAttribute(tx, attributeCache, attr.name);
                const valueId = await this.getOrCreateAttributeValue(tx, attributeValueCache, attributeId, attr.value);
                await tx.insert(attributeValuesToVariants).values({
                  productVariantId: existing.id,
                  attributeValueId: valueId,
                });
              }
            }
          } else {
            // Create new variant
            const [newV] = await tx
              .insert(productVariants)
              .values({
                productId: id,
                sku: v.sku.trim(),
                price: v.price,
                stockQuantity: v.stock,
                purchasePrice: v.purchasePrice ?? 0,
                lowStockQuantity: v.lowStockQuantity ?? 0,
              })
              .returning();

            if (v.attributes && newV) {
              for (const attr of v.attributes) {
                const attributeId = await this.getOrCreateAttribute(tx, attributeCache, attr.name);
                const valueId = await this.getOrCreateAttributeValue(tx, attributeValueCache, attributeId, attr.value);
                await tx.insert(attributeValuesToVariants).values({
                  productVariantId: newV.id,
                  attributeValueId: valueId,
                });
              }
            }
          }
        }
      }

      return this.getProductById(id);
    });
  }

  async deleteProduct(id: string) {
    return await this.db.delete(products).where(eq(products.id, id));
  }

  async deleteManyProducts(ids: string[]) {
    return await this.db.delete(products).where(inArray(products.id, ids));
  }

  // --- Category Methods ---

  async createCategory(data: CreateCategoryInput) {
    const { name, slug, parentId } = data;
    const category = await this.db
      .insert(categories)
      .values({
        name,
        slug,
        parentId,
      })
      .returning()
      .then((rows) => rows[0]!);
    return category;
  }

  async getAllCategories(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const allCategories = await this.db.query.categories.findMany({
      limit: limit,
      offset: offset,
      with: {
        parent: true,
      },
    });
    const [total] = await this.db.select({ count: count() }).from(categories);

    return {
      categories: allCategories,
      total: total?.count || 0,
    };
  }

  async getCategoryById(id: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Cập nhật thời gian khuyến mãi (sale timer) cho sản phẩm
   * Chỉ update các trường discount, không ảnh hưởng tới thông tin khác
   */
  async updateSaleTimer(
    id: string,
    data: {
      discountType: 'PERCENTAGE' | 'FIXED';
      discountValue: number;
      discountStartDate?: string | null | undefined;
      discountEndDate?: string | null | undefined;
    }
  ) {
    const [updated] = await this.db
      .update(products)
      .set({
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountStartDate: data.discountStartDate
          ? new Date(data.discountStartDate)
          : null,
        discountEndDate: data.discountEndDate
          ? new Date(data.discountEndDate)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {

    return this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
  }

  async deleteCategory(id: string) {
    return this.db.delete(categories).where(eq(categories.id, id));
  }

  async deleteManyCategories(ids: string[]) {
    return this.db.delete(categories).where(inArray(categories.id, ids));
  }

  // --- Attribute Methods ---

  async createAttribute(data: CreateAttributeInput) {
    const { name, values } = data;

    return await this.db.transaction(async (tx) => {
      const [attribute] = await tx
        .insert(attributes)
        .values({ name })
        .returning();

      if (values && values.length > 0) {
        await tx.insert(attributeValues).values(
          values.map((v) => ({
            attributeId: attribute!.id,
            value: v.value,
            name: v.name,
          }))
        );
      }

      return attribute;
    });
  }

  async getAllAttributes(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const allAttributes = await this.db.query.attributes.findMany({
      limit: limit,
      offset: offset,
      with: {
        values: true,
      },
    });
    const [total] = await this.db.select({ count: count() }).from(attributes);
    return {
      attributes: allAttributes,
      total: total?.count || 0,
    };
  }

  async getAttributeById(id: string) {
    return this.db.query.attributes.findFirst({
      where: eq(attributes.id, id),
      with: {
        values: true,
      },
    });
  }

  async updateAttribute(id: string, data: UpdateAttributeInput) {
    const { name, values } = data;

    return await this.db.transaction(async (tx) => {
      // 1. Update attribute name
      let updatedAttribute;
      if (name) {
        [updatedAttribute] = await tx
          .update(attributes)
          .set({ name })
          .where(eq(attributes.id, id))
          .returning();
      } else {
        updatedAttribute = await tx.query.attributes.findFirst({
          where: eq(attributes.id, id),
        });
      }

      // 2. Sync values
      if (values !== undefined) {
        // Get existing values
        const existingValues = await tx.query.attributeValues.findMany({
          where: eq(attributeValues.attributeId, id),
        });
        const existingIds = existingValues.map((v) => v.id);
        const incomingIds = values
          .map((v) => v.id)
          .filter((id): id is string => !!id);

        // Delete values not in incoming list
        const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx
            .delete(attributeValues)
            .where(inArray(attributeValues.id, idsToDelete));
        }

        // Update or Insert incoming values
        for (const v of values) {
          if (v.id && existingIds.includes(v.id)) {
            // Update
            await tx
              .update(attributeValues)
              .set({ value: v.value, name: v.name })
              .where(eq(attributeValues.id, v.id));
          } else {
            // Insert
            await tx.insert(attributeValues).values({
              attributeId: id,
              value: v.value,
              name: v.name,
            });
          }
        }
      }

      return updatedAttribute;
    });
  }

  async deleteAttribute(id: string) {
    return this.db.delete(attributes).where(eq(attributes.id, id));
  }

  async deleteManyAttributes(ids: string[]) {
    return this.db.delete(attributes).where(inArray(attributes.id, ids));
  }

  // brand method
  async createBrand(data: CreateBrandInput) {
    const [brand] = await this.db.insert(brands).values(data).returning();
    return brand;
  }
  async getAllBrands(page: number = 1, limit: number = 100) {
    const offset = (page - 1) * limit;
    const allBrands = await this.db.query.brands.findMany({
      limit,
      offset,
      orderBy: asc(brands.name),
    });

    const [total] = await this.db.select({ count: count() }).from(brands);
    return {
      brands: allBrands,
      total: total?.count || 0,
    };
  }
  async getBrandBySlug(slug: string) {
    return this.db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });
  }
  async getBrandById(id: string) {
    return this.db.query.brands.findFirst({
      where: eq(brands.id, id),
    });
  }
  async updateBrand(id: string, data: UpdateBrandInput) {
    const [brand] = await this.db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();

    return brand;
  }
  async deleteBrand(id: string) {
    return this.db.delete(brands).where(eq(brands.id, id));
  }
  async deleteManyBrandsSchema(ids: string[]) {
    return this.db.delete(brands).where(inArray(brands.id, ids));
  }

  async getAttributesWithValues() {
    return this.db.query.attributes.findMany({
      with: {
        values: true,
      },
    });
  }
}
