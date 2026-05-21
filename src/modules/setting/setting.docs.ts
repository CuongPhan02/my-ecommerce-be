export const NAVIGATION_TAG = 'Navigation';
export const BANNER_TAG = 'Banner';
export const LOGO_TAG = 'Logo';

export const SETTING_DOCUMENTATION = {
  SETTING: 'Settings',

  SETTING_SUMMARIES: {
    // Existing
    GET_LOGO: 'Get logo configuration (Public)',
    UPDATE_LOGO: 'Update logo configuration (Admin)',
    GET_HERO_BANNER: 'Get hero banner slides (Public)',
    UPDATE_HERO_BANNER: 'Update hero banner slides (Admin)',
    GET_HOMEPAGE_SECTIONS: 'Get homepage section visibility (Public)',
    UPDATE_HOMEPAGE_SECTIONS: 'Update homepage section visibility (Admin)',
    // New
    GET_STORE_INFO: 'Get basic store information (Public)',
    UPDATE_STORE_INFO: 'Update basic store information (Admin)',
    GET_SOCIAL_LINKS: 'Get store social media links (Public)',
    UPDATE_SOCIAL_LINKS: 'Update store social media links (Admin)',
    GET_SEO_META: 'Get homepage SEO meta tags (Public)',
    UPDATE_SEO_META: 'Update homepage SEO meta tags (Admin)',
    GET_SYSTEM_CONFIG: 'Get system configuration (Admin)',
    UPDATE_SYSTEM_CONFIG: 'Update system configuration - maintenance mode (Admin)',
  },

  SETTING_DESCRIPTIONS: {
    GET_HERO_BANNER: 'Lấy danh sách banner slides hiển thị trên trang chủ (hỗ trợ cả ảnh và video).',
    UPDATE_HERO_BANNER: 'Cập nhật toàn bộ danh sách banner slides. Gửi mảng items rỗng để xoá hết banner.',
    GET_HOMEPAGE_SECTIONS: 'Lấy cấu hình hiển thị các section trên trang chủ.',
    UPDATE_HOMEPAGE_SECTIONS: 'Cập nhật cấu hình hiển thị section trang chủ.',
    GET_STORE_INFO: 'Lấy thông tin cơ bản của cửa hàng: tên, email, điện thoại, địa chỉ.',
    UPDATE_STORE_INFO: 'Cập nhật thông tin cơ bản của cửa hàng.',
    GET_SOCIAL_LINKS: 'Lấy đường dẫn mạng xã hội của cửa hàng.',
    UPDATE_SOCIAL_LINKS: 'Cập nhật đường dẫn mạng xã hội.',
    GET_SEO_META: 'Lấy cấu hình SEO meta tags cho trang chủ.',
    UPDATE_SEO_META: 'Cập nhật SEO meta title, description, keywords cho trang chủ.',
    GET_SYSTEM_CONFIG: 'Lấy cấu hình hệ thống (maintenance mode, v.v.)',
    UPDATE_SYSTEM_CONFIG: 'Bật/tắt chế độ bảo trì và các cấu hình kỹ thuật.',
  },

  REQUEST_BODY: {
    // ─── Hero Banner (multi-slide) ────────────────────────────────────────
    HERO_BANNER_SCHEMAS: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', nullable: true },
              mediaType: { type: 'string', enum: ['image', 'video'], default: 'image' },
              mediaUrl: { type: 'string', nullable: true },
              thumbnailUrl: { type: 'string', nullable: true, description: 'Preview thumbnail cho video' },
              heading: { type: 'string', nullable: true },
              subheading: { type: 'string', nullable: true },
              buttonText: { type: 'string', nullable: true },
              buttonLink: { type: 'string', nullable: true },
              displayOrder: { type: 'integer', default: 0 },
              isActive: { type: 'boolean', default: true },
            },
          },
        },
      },
    },

    // ─── Logo ────────────────────────────────────────────────────────────
    LOGO_SCHEMAS: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', nullable: true, description: 'URL logo chính (light mode)' },
        darkImageUrl: { type: 'string', nullable: true, description: 'URL logo dark mode' },
        alt: { type: 'string', nullable: true },
        width: { type: 'integer', nullable: true },
        height: { type: 'integer', nullable: true },
      },
    },

    // ─── Homepage Sections ────────────────────────────────────────────────
    HOMEPAGE_SECTIONS_SCHEMAS: {
      type: 'object',
      properties: {
        showNewArrivals: { type: 'boolean', default: true },
        showFlashSales: { type: 'boolean', default: true },
      },
    },

    // ─── Store Info ───────────────────────────────────────────────────────
    STORE_INFO_SCHEMAS: {
      type: 'object',
      properties: {
        storeName: { type: 'string', nullable: true, description: 'Tên cửa hàng' },
        contactEmail: { type: 'string', nullable: true, description: 'Email liên hệ' },
        phone: { type: 'string', nullable: true, description: 'Số điện thoại' },
        address: { type: 'string', nullable: true, description: 'Địa chỉ cửa hàng' },
      },
    },

    // ─── Social Links ─────────────────────────────────────────────────────
    SOCIAL_LINKS_SCHEMAS: {
      type: 'object',
      properties: {
        facebook: { type: 'string', nullable: true, description: 'URL trang Facebook' },
        instagram: { type: 'string', nullable: true, description: 'URL trang Instagram' },
        tiktok: { type: 'string', nullable: true, description: 'URL trang TikTok' },
        youtube: { type: 'string', nullable: true, description: 'URL kênh YouTube' },
        zalo: { type: 'string', nullable: true, description: 'Số Zalo hoặc URL Zalo OA' },
      },
    },

    // ─── SEO Meta ─────────────────────────────────────────────────────────
    SEO_META_SCHEMAS: {
      type: 'object',
      properties: {
        metaTitle: { type: 'string', nullable: true, description: 'Meta title cho trang chủ' },
        metaDescription: { type: 'string', nullable: true, description: 'Meta description trang chủ' },
        metaKeywords: { type: 'string', nullable: true, description: 'Từ khoá SEO, phân cách bằng dấu phẩy' },
        ogImage: { type: 'string', nullable: true, description: 'URL ảnh OG (Open Graph) cho social share' },
      },
    },

    // ─── System Config ────────────────────────────────────────────────────
    SYSTEM_CONFIG_SCHEMAS: {
      type: 'object',
      properties: {
        maintenanceMode: {
          type: 'boolean',
          default: false,
          description: 'Bật chế độ bảo trì – tạm dừng mọi giao dịch',
        },
        maintenanceMessage: {
          type: 'string',
          nullable: true,
          description: 'Thông báo hiển thị khi đang bảo trì',
        },
      },
    },
  },
};
