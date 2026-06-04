import { Database } from '@/plugins/database';
import { navigations } from '@/db/schema/navigate';
import { settings } from '@/db/schema/settings';
import {
  categories,
  collections,
  attributes,
  attributeValues,
} from '@/db/schema/products';
import { eq, asc } from 'drizzle-orm';

export type CreateNavigationDTO = typeof navigations.$inferInsert;
export type UpdateNavigationDTO = Partial<CreateNavigationDTO>;

export class NavigationRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getMegaMenuData() {
    const [cats, cols, attrs, attrVals] = await Promise.all([
      this.db.select().from(categories),
      this.db.select().from(collections).where(eq(collections.isActive, true)),
      this.db.select().from(attributes),
      this.db.select().from(attributeValues),
    ]);

    // Format attributes with their values
    const attributesWithValues = attrs.map((attr: any) => ({
      ...attr,
      values: attrVals.filter((v: any) => v.attributeId === attr.id),
    }));

    return {
      categories: cats,
      collections: cols,
      attributes: attributesWithValues,
    };
  }

  private async formatNavigationItem(nav: any, megaMenuData?: any) {
    if (!nav) return nav;
    if (!nav.isMegaMenu) {
      return {
        ...nav,
        megaMenu: null,
      };
    }

    const data = megaMenuData || (await this.getMegaMenuData());
    const config = nav.metadata?.megaMenu;

    // Backward compatibility: if metadata.megaMenu is undefined/null, return all items
    if (config === undefined || config === null) {
      return {
        ...nav,
        megaMenu: data,
      };
    }

    const categoryIds = config.categoryIds || [];
    const collectionIds = config.collectionIds || [];
    const attributeIds = config.attributeIds || [];

    const filteredCategories = data.categories.filter((c: any) =>
      categoryIds.includes(c.id)
    );
    const filteredCollections = data.collections.filter((c: any) =>
      collectionIds.includes(c.id)
    );
    const filteredAttributes = data.attributes.filter((a: any) =>
      attributeIds.includes(a.id)
    );

    return {
      ...nav,
      megaMenu: {
        categories: filteredCategories,
        collections: filteredCollections,
        attributes: filteredAttributes,
      },
    };
  }

  async create(data: CreateNavigationDTO & { megaMenu?: any }) {
    const { megaMenu, ...insertData } = data;

    if (megaMenu !== undefined) {
      if (megaMenu) {
        const categoryIds = megaMenu.categories?.map((c: any) => c.id) || [];
        const collectionIds = megaMenu.collections?.map((c: any) => c.id) || [];
        const attributeIds = megaMenu.attributes?.map((a: any) => a.id) || [];

        insertData.metadata = {
          ...(insertData.metadata as any || {}),
          megaMenu: {
            categoryIds,
            collectionIds,
            attributeIds,
          },
        };
      }
    }

    const [result] = await this.db.insert(navigations).values(insertData).returning();
    return await this.formatNavigationItem(result);
  }

  async initSystemNavigations(menus: CreateNavigationDTO[]) {
    const existingSystemNavs = await this.db
      .select()
      .from(navigations)
      .where(eq(navigations.isSystem, true));

    const existingLabels = existingSystemNavs.map((nav) => nav.label);
    const toInsert = menus.filter(
      (menu) => !existingLabels.includes(menu.label)
    );

    if (toInsert.length > 0) {
      await this.db.insert(navigations).values(toInsert);
    }

    return {
      inserted: toInsert.length,
      skipped: menus.length - toInsert.length,
    };
  }

  async getAll() {
    const allNavigations = await this.db
      .select()
      .from(navigations)
      .orderBy(asc(navigations.displayOrder));
    const megaMenuData = await this.getMegaMenuData();
    return await Promise.all(
      allNavigations.map((nav) => this.formatNavigationItem(nav, megaMenuData))
    );
  }

  async getTree() {
    // Lấy toàn bộ navigation và sắp xếp theo displayOrder
    const allNavigations = await this.db
      .select()
      .from(navigations)
      .orderBy(asc(navigations.displayOrder));

    // Lấy mega menu data dùng chung cho các node có isMegaMenu = true
    const megaMenuData = await this.getMegaMenuData();

    // Xây dựng cây (Tree)
    const navMap = new Map();
    const tree: any[] = [];

    // Khởi tạo map và thêm mảng children rỗng cho mỗi item
    const formattedNavigations = await Promise.all(
      allNavigations.map((nav) => this.formatNavigationItem(nav, megaMenuData))
    );

    formattedNavigations.forEach((nav: any) => {
      navMap.set(nav.id, {
        ...nav,
        children: [],
      });
    });

    // Lặp qua để gắn children vào parent
    allNavigations.forEach((nav: any) => {
      const mappedNav = navMap.get(nav.id);
      if (nav.parentId) {
        const parent = navMap.get(nav.parentId);
        if (parent) {
          parent.children.push(mappedNav);
        } else {
          // Trường hợp parentId không tồn tại (lỗi data), đẩy vào root tạm
          tree.push(mappedNav);
        }
      } else {
        tree.push(mappedNav);
      }
    });

    return tree;
  }

  async getById(id: string) {
    const [result] = await this.db
      .select()
      .from(navigations)
      .where(eq(navigations.id, id));
    if (!result) return null;
    return await this.formatNavigationItem(result);
  }

  async update(id: string, data: UpdateNavigationDTO & { megaMenu?: any }) {
    const { megaMenu, ...updateData } = data;

    if (megaMenu !== undefined) {
      // Fetch the existing navigation item to get current metadata
      const existing = await this.getById(id);
      const existingMetadata = existing?.metadata as any || {};

      if (megaMenu) {
        const categoryIds = megaMenu.categories?.map((c: any) => c.id) || [];
        const collectionIds = megaMenu.collections?.map((c: any) => c.id) || [];
        const attributeIds = megaMenu.attributes?.map((a: any) => a.id) || [];

        updateData.metadata = {
          ...existingMetadata,
          megaMenu: {
            categoryIds,
            collectionIds,
            attributeIds,
          },
        };
      } else {
        const newMetadata = { ...existingMetadata };
        delete newMetadata.megaMenu;
        updateData.metadata = newMetadata;
      }
    }

    const [result] = await this.db
      .update(navigations)
      .set(updateData)
      .where(eq(navigations.id, id))
      .returning();

    return await this.formatNavigationItem(result);
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(navigations)
      .where(eq(navigations.id, id))
      .returning();
    return result;
  }
}
