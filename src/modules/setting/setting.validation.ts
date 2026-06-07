import { z } from 'zod';

// ─── Hero Banner ────────────────────────────────────────────────────────────

export const bannerSlideSchema = z.object({
  id: z.string().optional().nullable(),
  mediaType: z.enum(['image', 'video']).default('image'),
  mediaUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(), // preview cho video
  heading: z.string().optional().nullable(),
  subheading: z.string().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const heroBannerSchema = z.object({
  items: z.array(bannerSlideSchema).default([]),
});

export type BannerSlide = z.infer<typeof bannerSlideSchema>;
export type HeroBannerSchema = z.infer<typeof heroBannerSchema>;

// ─── Logo ────────────────────────────────────────────────────────────────────

export const LogoSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  darkImageUrl: z.string().optional().nullable(), // logo cho dark mode
  alt: z.string().optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
});

export type LogoSchemaType = z.infer<typeof LogoSchema>;

// ─── Homepage Sections ───────────────────────────────────────────────────────

export const homepageSectionsSchema = z.object({
  showNewArrivals: z.boolean().default(true),
  showFlashSales: z.boolean().default(true),
});

export type HomepageSectionsSchemaType = z.infer<typeof homepageSectionsSchema>;

// ─── Store Info ──────────────────────────────────────────────────────────────

export const storeInfoSchema = z.object({
  storeName: z.string().min(1).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  name: z.string().min(1).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type StoreInfoSchemaType = z.infer<typeof storeInfoSchema>;

// ─── Social Links ────────────────────────────────────────────────────────────

export const socialLinksSchema = z.object({
  facebook: z.string().url().optional().nullable(),
  instagram: z.string().url().optional().nullable(),
  tiktok: z.string().url().optional().nullable(),
  youtube: z.string().url().optional().nullable(),
  zalo: z.string().optional().nullable(),
});

export type SocialLinksSchemaType = z.infer<typeof socialLinksSchema>;

// ─── SEO Meta ────────────────────────────────────────────────────────────────

export const seoMetaSchema = z.object({
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type SeoMetaSchemaType = z.infer<typeof seoMetaSchema>;

// ─── System Config ───────────────────────────────────────────────────────────

export const systemConfigSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional().nullable(),
});

export type SystemConfigSchemaType = z.infer<typeof systemConfigSchema>;
