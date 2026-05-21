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
    return setting
      ? setting.value
      : {
          storeName: null,
          contactEmail: null,
          phone: null,
          address: null,
        };
  }

  async upsertStoreInfo(data: StoreInfoSchemaType) {
    return await this.repo.upsertSetting(STORE_INFO_KEY, data);
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
    return setting
      ? setting.value
      : {
          metaTitle: null,
          metaDescription: null,
          metaKeywords: null,
          ogImage: null,
        };
  }

  async upsertSeoMeta(data: SeoMetaSchemaType) {
    return await this.repo.upsertSetting(SEO_META_KEY, data);
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
