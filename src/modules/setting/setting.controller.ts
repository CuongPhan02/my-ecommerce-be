import { FastifyReply, FastifyRequest } from 'fastify';
import { SettingService } from './setting.service';
import { SettingRepository } from './setting.repository';
import {
  HeroBannerSchema,
  LogoSchemaType,
  HomepageSectionsSchemaType,
  StoreInfoSchemaType,
  SocialLinksSchemaType,
  SeoMetaSchemaType,
  SystemConfigSchemaType,
} from './setting.validation';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

export const settingController = (fastify: any) => {
  const settingRepository = new SettingRepository(fastify.db);
  const settingService = new SettingService(settingRepository);

  return {
    // ─── Hero Banner ────────────────────────────────────────────────────────

    getHeroBannerHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getHeroBanner();
        return sendResponseSuccess(200, reply, 'Get hero banner success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting hero banner');
      }
    },

    upsertHeroBannerHandler: async (
      req: FastifyRequest<{ Body: HeroBannerSchema }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertHeroBanner(req.body);
        return sendResponseSuccess(200, reply, 'Update hero banner success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating hero banner');
      }
    },

    // ─── Logo ───────────────────────────────────────────────────────────────

    getLogoHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getLogo();
        return sendResponseSuccess(200, reply, 'Get logo success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting logo');
      }
    },

    updateLogoHandler: async (
      req: FastifyRequest<{ Body: LogoSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertLogo(req.body);
        return sendResponseSuccess(200, reply, 'Update logo success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating logo');
      }
    },

    // ─── Homepage Sections ───────────────────────────────────────────────────

    getHomepageSectionsHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getHomepageSections();
        return sendResponseSuccess(200, reply, 'Get homepage sections success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting homepage sections');
      }
    },

    upsertHomepageSectionsHandler: async (
      req: FastifyRequest<{ Body: HomepageSectionsSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertHomepageSections(req.body);
        return sendResponseSuccess(200, reply, 'Update homepage sections success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating homepage sections');
      }
    },

    // ─── Store Info ──────────────────────────────────────────────────────────

    getStoreInfoHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getStoreInfo();
        return sendResponseSuccess(200, reply, 'Get store info success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting store info');
      }
    },

    upsertStoreInfoHandler: async (
      req: FastifyRequest<{ Body: StoreInfoSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertStoreInfo(req.body);
        return sendResponseSuccess(200, reply, 'Update store info success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating store info');
      }
    },

    // ─── Social Links ─────────────────────────────────────────────────────────

    getSocialLinksHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getSocialLinks();
        return sendResponseSuccess(200, reply, 'Get social links success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting social links');
      }
    },

    upsertSocialLinksHandler: async (
      req: FastifyRequest<{ Body: SocialLinksSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertSocialLinks(req.body);
        return sendResponseSuccess(200, reply, 'Update social links success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating social links');
      }
    },

    // ─── SEO Meta ─────────────────────────────────────────────────────────────

    getSeoMetaHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getSeoMeta();
        return sendResponseSuccess(200, reply, 'Get SEO meta success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting SEO meta');
      }
    },

    upsertSeoMetaHandler: async (
      req: FastifyRequest<{ Body: SeoMetaSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertSeoMeta(req.body);
        return sendResponseSuccess(200, reply, 'Update SEO meta success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating SEO meta');
      }
    },

    // ─── System Config ────────────────────────────────────────────────────────

    getSystemConfigHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getSystemConfig();
        return sendResponseSuccess(200, reply, 'Get system config success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error getting system config');
      }
    },

    upsertSystemConfigHandler: async (
      req: FastifyRequest<{ Body: SystemConfigSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertSystemConfig(req.body);
        return sendResponseSuccess(200, reply, 'Update system config success', result);
      } catch (error: any) {
        return sendResponseError(500, reply, error.message || 'Error updating system config');
      }
    },
  };
};
