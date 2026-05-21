import { db, pool } from './config';
import { categories, collections } from './schema/products';
import { createId } from '@paralleldrive/cuid2';

export async function seedCategoriesAndCollections() {
  console.log('Starting to seed rich categories and collections...');

  // 1. Rich Categories (Fashion Category Hierarchy)
  const categoryData = [
    {
      name: 'Thời Trang Nam',
      slug: 'thoi-trang-nam',
      subcategories: [
        { name: 'Áo Thun Nam', slug: 'ao-thun-nam' },
        { name: 'Áo Sơ Mi Nam', slug: 'ao-so-mi-nam' },
        { name: 'Áo Khoác Nam', slug: 'ao-khoac-nam' },
        { name: 'Áo Polo Nam', slug: 'ao-polo-nam' },
        { name: 'Quần Jean Nam', slug: 'quan-jean-nam' },
        { name: 'Quần Tây Nam', slug: 'quan-tay-nam' },
        { name: 'Quần Short Nam', slug: 'quan-short-nam' },
        { name: 'Quần Jogger Nam', slug: 'quan-jogger-nam' },
      ],
    },
    {
      name: 'Thời Trang Nữ',
      slug: 'thoi-trang-nu',
      subcategories: [
        { name: 'Áo Thun Nữ', slug: 'ao-thun-nu' },
        { name: 'Áo Kiểu & Sơ Mi Nữ', slug: 'ao-kieu-so-mi-nu' },
        { name: 'Áo Khoác Nữ', slug: 'ao-khoac-nu' },
        { name: 'Đầm & Váy Nữ', slug: 'dam-vay-nu' },
        { name: 'Chân Váy', slug: 'chan-vay' },
        { name: 'Quần Jean Nữ', slug: 'quan-jean-nu' },
        { name: 'Quần Tây Nữ', slug: 'quan-tay-nu' },
        { name: 'Quần Short Nữ', slug: 'quan-short-nu' },
      ],
    },
    {
      name: 'Thời Trang Unisex & Streetwear',
      slug: 'thoi-trang-unisex-streetwear',
      subcategories: [
        { name: 'Áo Hoodie Unisex', slug: 'ao-hoodie-unisex' },
        { name: 'Áo Sweater Unisex', slug: 'ao-sweater-unisex' },
        { name: 'Quần Cargo Pants', slug: 'quan-cargo-pants' },
        { name: 'Áo Tee Oversize', slug: 'ao-tee-oversize' },
      ],
    },
    {
      name: 'Thời Trang Thể Thao',
      slug: 'thoi-trang-the-thao',
      subcategories: [
        { name: 'Đồ Bộ Thể Thao Nam', slug: 'do-bo-the-thao-nam' },
        { name: 'Đồ Bộ Thể Thao Nữ', slug: 'do-bo-the-thao-nui' },
        { name: 'Áo Tanktop Thể Thao', slug: 'ao-tanktop-the-thao' },
        { name: 'Quần Short Thể Thao', slug: 'quan-short-the-thao' },
      ],
    },
    {
      name: 'Đồ Mặc Nhà & Đồ Ngủ',
      slug: 'do-mac-nha-do-ngu',
      subcategories: [
        { name: 'Đồ Bộ Pijama', slug: 'do-bo-pijama' },
        { name: 'Váy Ngủ Lụa', slug: 'vay-ngu-lua' },
        { name: 'Đồ Bộ Cát Hàn', slug: 'do-bo-cat-han' },
      ],
    },
    {
      name: 'Giày Dép & Sandal',
      slug: 'giay-dep-sandal',
      subcategories: [
        { name: 'Sneakers Thể Thao', slug: 'sneakers-the-thao' },
        { name: 'Giày Tây & Loafers', slug: 'giay-tay-loafers' },
        { name: 'Sandal Năng Động', slug: 'sandal-nang-dong' },
        { name: 'Dép Quai Ngang', slug: 'dep-quai-ngang' },
      ],
    },
    {
      name: 'Phụ Kiện Thời Trang',
      slug: 'phu-kien-thoi-trang',
      subcategories: [
        { name: 'Túi Xách & Balo', slug: 'tui-xach-balo' },
        { name: 'Mắt Kính Thời Trang', slug: 'mat-kinh-thoi-trang' },
        { name: 'Thắt Lưng Da', slug: 'that-lung-da' },
        { name: 'Nón & Mũ Lưỡi Trai', slug: 'non-mu-luoi-trai' },
        { name: 'Vớ / Tất Cotton', slug: 'vo-tat-cotton' },
        { name: 'Trang Sức Minimalist', slug: 'trang-suc-minimalist' },
      ],
    },
  ];

  try {
    for (const cat of categoryData) {
      let parentId = '';
      const existingParent = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.slug, cat.slug),
      });

      if (existingParent) {
        parentId = existingParent.id;
        console.log(`Parent Category [${cat.name}] already exists.`);
      } else {
        const id = createId();
        await db.insert(categories).values({
          id,
          name: cat.name,
          slug: cat.slug,
        });
        parentId = id;
        console.log(`[Success] Inserted parent category: ${cat.name}`);
      }

      for (const sub of cat.subcategories) {
        const existingSub = await db.query.categories.findFirst({
          where: (categories, { eq }) => eq(categories.slug, sub.slug),
        });

        if (existingSub) {
          console.log(`  Subcategory [${sub.name}] already exists.`);
        } else {
          await db.insert(categories).values({
            id: createId(),
            name: sub.name,
            slug: sub.slug,
            parentId,
          });
          console.log(`  [Success] Inserted subcategory: ${sub.name}`);
        }
      }
    }

    // 2. Rich Collections
    const collectionData = [
      {
        name: 'Bộ Sưu Tập Mùa Hè 2026',
        slug: 'bo-suu-tap-mua-he-2026',
        description: 'Những thiết kế năng động, thoáng mát, mang đậm hơi thở của những chuyến đi mùa hè đầy nắng và gió.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Xu Hướng Mới',
        slug: 'xu-huong-moi',
        description: 'Khám phá các thiết kế thời trang dẫn đầu xu hướng mới nhất hiện nay.',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Thời Trang Công Sở',
        slug: 'thoi-trang-cong-so',
        description: 'Thanh lịch, hiện đại và tinh tế. Bộ sưu tập hoàn hảo dành cho môi trường văn phòng chuyên nghiệp.',
        imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Streetwear Năng Động',
        slug: 'streetwear-nang-dong',
        description: 'Tự do thể hiện cá tính riêng với các item streetwear chất chơi, bụi bặm và phá cách.',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Bộ Sưu Tập Thu Đông 2026',
        slug: 'bo-suu-tap-thu-dong-2026',
        description: 'Ấm áp, sang trọng và thời thượng với chất liệu len, nỉ dày dặn đón đầu mùa lạnh.',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Đồ Mặc Nhà Thoải Mái',
        slug: 'do-mac-nha-thoai-mai',
        description: 'Chất liệu lụa mềm mại, cotton co giãn mang đến sự thư giãn tuyệt đối cho không gian tổ ấm của bạn.',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Basic Essentials - Tối Giản',
        slug: 'basic-essentials-toi-gian',
        description: 'Các mẫu sản phẩm cơ bản, phối đồ cực dễ, chất lượng bền bỉ không lo lỗi mốt.',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Thời Trang Tiệc Tùng & Lễ Hội',
        slug: 'thoi-trang-tiec-tung-le-hoi',
        description: 'Nổi bật giữa đám đông với những chiếc đầm quyến rũ, những bộ vest lịch lãm và bắt mắt nhất.',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000',
        isActive: true,
      },
      {
        name: 'Limited Premium Drop - Giới Hạn',
        slug: 'limited-premium-drop-gioi-han',
        description: 'Dòng sản phẩm thiết kế cao cấp, sản xuất với số lượng có hạn cực kỳ độc quyền.',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
        isActive: true,
      },
    ];

    for (const col of collectionData) {
      const existingCol = await db.query.collections.findFirst({
        where: (collections, { eq }) => eq(collections.slug, col.slug),
      });

      if (existingCol) {
        console.log(`Collection [${col.name}] already exists.`);
      } else {
        await db.insert(collections).values({
          id: createId(),
          name: col.name,
          slug: col.slug,
          description: col.description,
          imageUrl: col.imageUrl,
          isActive: col.isActive,
        });
        console.log(`[Success] Inserted collection: ${col.name}`);
      }
    }

    console.log('Seeding rich categories and collections completed successfully!');
  } catch (error) {
    console.error('❌ Failed to seed rich categories and collections:', error);
  }
}

// Automatically execute when running the script directly
// seedCategoriesAndCollections().then(() => {
//   pool.end();
// });
