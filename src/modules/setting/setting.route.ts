import { FastifyInstance } from 'fastify';
import { routeWithZod } from '@/utils/routeWithZod';
import { settingController } from './setting.controller';
import {
  heroBannerSchema,
  LogoSchema,
  homepageSectionsSchema,
  storeInfoSchema,
  socialLinksSchema,
  seoMetaSchema,
  systemConfigSchema,
} from './setting.validation';

import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
import { SETTING_DOCUMENTATION } from './setting.docs';

export const settingRoutes = (fastify: FastifyInstance) => {
  const controller = settingController(fastify);

  // ─────────────────────────────────────────────────────────────────────────
  // LOGO
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/logo
  routeWithZod(fastify, {
    url: '/logo',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_LOGO,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getLogoHandler,
  });

  // POST /api/settings/logo
  routeWithZod(fastify, {
    url: '/logo',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_LOGO,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.LOGO_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: LogoSchema,
    handler: controller.updateLogoHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // HERO BANNER (multi-slide)
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/hero-banner
  routeWithZod(fastify, {
    url: '/hero-banner',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_HERO_BANNER,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_HERO_BANNER,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getHeroBannerHandler,
  });

  // POST /api/settings/hero-banner
  routeWithZod(fastify, {
    url: '/hero-banner',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_HERO_BANNER,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_HERO_BANNER,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.HERO_BANNER_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: heroBannerSchema,
    handler: controller.upsertHeroBannerHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // HOMEPAGE SECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/homepage-sections
  routeWithZod(fastify, {
    url: '/homepage-sections',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_HOMEPAGE_SECTIONS,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_HOMEPAGE_SECTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getHomepageSectionsHandler,
  });

  // POST /api/settings/homepage-sections
  routeWithZod(fastify, {
    url: '/homepage-sections',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_HOMEPAGE_SECTIONS,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_HOMEPAGE_SECTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.HOMEPAGE_SECTIONS_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: homepageSectionsSchema,
    handler: controller.upsertHomepageSectionsHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STORE INFO (Thông tin cơ bản cửa hàng)
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/store-info
  routeWithZod(fastify, {
    url: '/store-info',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_STORE_INFO,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_STORE_INFO,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getStoreInfoHandler,
  });

  // POST /api/settings/store-info
  routeWithZod(fastify, {
    url: '/store-info',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_STORE_INFO,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_STORE_INFO,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.STORE_INFO_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: storeInfoSchema,
    handler: controller.upsertStoreInfoHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL LINKS (Mạng xã hội)
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/social-links
  routeWithZod(fastify, {
    url: '/social-links',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_SOCIAL_LINKS,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_SOCIAL_LINKS,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getSocialLinksHandler,
  });

  // POST /api/settings/social-links
  routeWithZod(fastify, {
    url: '/social-links',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_SOCIAL_LINKS,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_SOCIAL_LINKS,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.SOCIAL_LINKS_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: socialLinksSchema,
    handler: controller.upsertSocialLinksHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SEO META
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/seo-meta
  routeWithZod(fastify, {
    url: '/seo-meta',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_SEO_META,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_SEO_META,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getSeoMetaHandler,
  });

  // POST /api/settings/seo-meta
  routeWithZod(fastify, {
    url: '/seo-meta',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_SEO_META,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_SEO_META,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.SEO_META_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: seoMetaSchema,
    handler: controller.upsertSeoMetaHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM CONFIG (Cấu hình hệ thống)
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/system-config  (Admin only - không public maintenance key)
  routeWithZod(fastify, {
    url: '/system-config',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_SYSTEM_CONFIG,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_SYSTEM_CONFIG,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.getSystemConfigHandler,
  });

  // POST /api/settings/system-config
  routeWithZod(fastify, {
    url: '/system-config',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_SYSTEM_CONFIG,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_SYSTEM_CONFIG,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.SYSTEM_CONFIG_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.SUPER_ADMIN], // Chỉ SUPER_ADMIN mới được bật maintenance
    bodySchema: systemConfigSchema,
    handler: controller.upsertSystemConfigHandler,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SHIPPING CONFIG (Cấu hình Vận chuyển)
  // ─────────────────────────────────────────────────────────────────────────

  // GET /api/settings/shipping_config
  routeWithZod(fastify, {
    url: '/shipping_config',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: 'Lấy cấu hình vận chuyển',
      description: 'Dành cho Admin và Frontend lấy trạng thái bật/tắt vận chuyển',
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getShippingConfigHandler,
  });

  // POST /api/settings/shipping_config
  routeWithZod(fastify, {
    url: '/shipping_config',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: 'Cập nhật cấu hình vận chuyển',
      description: 'Dành cho Admin cập nhật cấu hình vận chuyển',
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: {
        type: 'object',
        properties: { enableShipping: { type: 'boolean' } }
      },
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.upsertShippingConfigHandler,
  });
};
