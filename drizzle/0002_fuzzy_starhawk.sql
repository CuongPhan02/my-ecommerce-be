CREATE TYPE "public"."navigation_type" AS ENUM('MAIN_LINK', 'CATEGORY_GROUP', 'CATEGORY_ITEM');--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('IMPORT', 'ADJUST', 'EXPORT');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('PENDING', 'APPROVED', 'HIDDEN');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."voucher_type" AS ENUM('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'VENDOR';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'SALES';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'EDITOR';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'INVENTORY';--> statement-breakpoint
CREATE TABLE "product_attribute_option" (
	"product_id" text NOT NULL,
	"attribute_value_id" text NOT NULL,
	CONSTRAINT "product_attribute_option_product_id_attribute_value_id_pk" PRIMARY KEY("product_id","attribute_value_id")
);
--> statement-breakpoint
CREATE TABLE "refund_request" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "refund_status" DEFAULT 'PENDING',
	"amount" double precision NOT NULL,
	"refund_method" text,
	"reject_reason" text,
	"internal_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refund_request_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "navigation" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "navigation_type" NOT NULL,
	"label" text NOT NULL,
	"href" text,
	"category_type" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"parent_id" text,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"is_system" boolean DEFAULT false,
	"is_mega_menu" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"product_variant_id" text NOT NULL,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"purchase_price" double precision,
	"supplier" text,
	"reason" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_variant_id" text,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"tags" text[],
	"status" "review_status" DEFAULT 'PENDING' NOT NULL,
	"admin_reply" text,
	"admin_reply_at" timestamp,
	"admin_reply_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" "voucher_type" NOT NULL,
	"discount_value" double precision NOT NULL,
	"min_order_value" double precision DEFAULT 0,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expiration_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "volunteer" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_method" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"fee" double precision NOT NULL,
	"estimated_days" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_media_id_unique";--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "receiver_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "attribute_value" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "is_home_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipping_method" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipping_fee" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "staff_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "product_attribute_option" ADD CONSTRAINT "product_attribute_option_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_option" ADD CONSTRAINT "product_attribute_option_attribute_value_id_attribute_value_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_value"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_request" ADD CONSTRAINT "refund_request_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_request" ADD CONSTRAINT "refund_request_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_admin_reply_by_users_id_fk" FOREIGN KEY ("admin_reply_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "navigation_parent_idx" ON "navigation" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "inventory_transaction_variant_idx" ON "inventory_transaction" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "review_product_idx" ON "review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_status_idx" ON "review" USING btree ("status");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_staff_code_unique" UNIQUE("staff_code");