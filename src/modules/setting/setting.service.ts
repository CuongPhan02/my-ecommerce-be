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

const HERO_BANNER_KEY = 'HERO_BANNER';
const LOGO_KEY = 'LOGO';
const HOMEPAGE_SECTIONS_KEY = 'HOMEPAGE_SECTIONS';
const STORE_INFO_KEY = 'STORE_INFO';
const SOCIAL_LINKS_KEY = 'SOCIAL_LINKS';
const SEO_META_KEY = 'SEO_META';
const SYSTEM_CONFIG_KEY = 'SYSTEM_CONFIG';

export class SettingService {
  private repo: SettingRepository;

  constructor(repo: SettingRepository) {
    this.repo = repo;
  }

  // ─── Hero Banner ─────────────────────────────────────────────────────────

  async getHeroBanner() {
    const setting = await this.repo.getSettingByKey(HERO_BANNER_KEY);
    return setting ? setting.value : { items: [] };
  }

  async upsertHeroBanner(data: HeroBannerSchema) {
    return await this.repo.upsertSetting(HERO_BANNER_KEY, data);
  }

  // ─── Logo ─────────────────────────────────────────────────────────────────

  async getLogo() {
    const setting = await this.repo.getSettingByKey(LOGO_KEY);
    return setting ? setting.value : null;
  }

  async upsertLogo(data: LogoSchemaType) {
    return await this.repo.upsertSetting(LOGO_KEY, data);
  }

  // ─── Homepage Sections ────────────────────────────────────────────────────

  async getHomepageSections() {
    const setting = await this.repo.getSettingByKey(HOMEPAGE_SECTIONS_KEY);
    return setting
      ? setting.value
      : { showNewArrivals: true, showFlashSales: true };
  }

  async upsertHomepageSections(data: HomepageSectionsSchemaType) {
    return await this.repo.upsertSetting(HOMEPAGE_SECTIONS_KEY, data);
  }

  // ─── Store Info ───────────────────────────────────────────────────────────

  async getStoreInfo() {
    const setting = await this.repo.getSettingByKey(STORE_INFO_KEY);
    if (!setting) {
      return {
        name: null,
        email: null,
        phone: null,
        address: null,
        storeName: null,
        contactEmail: null,
      };
    }
    const val = (setting.value || {}) as any;
    return {
      name: val.name || val.storeName || null,
      email: val.email || val.contactEmail || null,
      phone: val.phone || null,
      address: val.address || null,
      storeName: val.storeName || val.name || null,
      contactEmail: val.contactEmail || val.email || null,
    };
  }

  async upsertStoreInfo(data: any) {
    const value = {
      name: data.name || data.storeName || null,
      email: data.email || data.contactEmail || null,
      phone: data.phone || null,
      address: data.address || null,
      storeName: data.storeName || data.name || null,
      contactEmail: data.contactEmail || data.email || null,
    };
    return await this.repo.upsertSetting(STORE_INFO_KEY, value);
  }

  // ─── Social Links ─────────────────────────────────────────────────────────

  async getSocialLinks() {
    const setting = await this.repo.getSettingByKey(SOCIAL_LINKS_KEY);
    return setting
      ? setting.value
      : {
          facebook: null,
          instagram: null,
          tiktok: null,
          youtube: null,
          zalo: null,
        };
  }

  async upsertSocialLinks(data: SocialLinksSchemaType) {
    return await this.repo.upsertSetting(SOCIAL_LINKS_KEY, data);
  }

  // ─── SEO Meta ─────────────────────────────────────────────────────────────

  async getSeoMeta() {
    const setting = await this.repo.getSettingByKey(SEO_META_KEY);
    if (!setting) {
      return {
        title: null,
        description: null,
        keywords: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        ogImage: null,
      };
    }
    const val = (setting.value || {}) as any;
    return {
      title: val.title || val.metaTitle || null,
      description: val.description || val.metaDescription || null,
      keywords: val.keywords || val.metaKeywords || null,
      metaTitle: val.metaTitle || val.title || null,
      metaDescription: val.metaDescription || val.description || null,
      metaKeywords: val.metaKeywords || val.keywords || null,
      ogImage: val.ogImage || null,
    };
  }

  async upsertSeoMeta(data: any) {
    const value = {
      title: data.title || data.metaTitle || null,
      description: data.description || data.metaDescription || null,
      keywords: data.keywords || data.metaKeywords || null,
      metaTitle: data.metaTitle || data.title || null,
      metaDescription: data.metaDescription || data.description || null,
      metaKeywords: data.metaKeywords || data.keywords || null,
      ogImage: data.ogImage || null,
    };
    return await this.repo.upsertSetting(SEO_META_KEY, value);
  }

  // ─── System Config ────────────────────────────────────────────────────────

  async getSystemConfig() {
    const setting = await this.repo.getSettingByKey(SYSTEM_CONFIG_KEY);
    return setting
      ? setting.value
      : { maintenanceMode: false, maintenanceMessage: null };
  }

  async upsertSystemConfig(data: SystemConfigSchemaType) {
    return await this.repo.upsertSetting(SYSTEM_CONFIG_KEY, data);
  }
}
