export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// One-time endpoint to add missing columns from Phase 7 schema changes.
// Only callable by ADMIN.
export async function POST() {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes((session.user as { role?: string })?.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: string[] = [];

    const run = async (label: string, sql: string) => {
      try {
        await db.$executeRawUnsafe(sql);
        results.push(`✓ ${label}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // "already exists" errors are OK — column was already there
        if (msg.includes("already exists") || msg.includes("duplicate column")) {
          results.push(`= ${label} (already exists)`);
        } else {
          results.push(`✗ ${label}: ${msg}`);
        }
      }
    };

    // ── Enums ─────────────────────────────────────────────────────────────
    await run("enum CustomerTier", `DO $$ BEGIN
      CREATE TYPE "CustomerTier" AS ENUM ('BRONZE','SILVER','GOLD','PLATINUM');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await run("enum OrderStatus FAILED value", `DO $$ BEGIN
      ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'FAILED';
    EXCEPTION WHEN others THEN null; END $$`);

    // ── users ──────────────────────────────────────────────────────────────
    await run("users.segment", `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "segment" "CustomerTier" NOT NULL DEFAULT 'BRONZE'`);
    await run("users.referralCode", `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE`);

    // ── products ───────────────────────────────────────────────────────────
    await run("products.supplierId", `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplierId" TEXT`);
    await run("products.soldCount", `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "soldCount" INTEGER NOT NULL DEFAULT 0`);
    await run("products.viewCount", `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0`);

    // ── orders ─────────────────────────────────────────────────────────────
    await run("orders.deliverySlot", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliverySlot" TEXT`);
    await run("orders.referralPhone", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "referralPhone" TEXT`);
    await run("orders.transactionId", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transactionId" TEXT`);
    await run("orders.mergeGroupId", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "mergeGroupId" TEXT`);
    await run("orders.isMergeParent", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "isMergeParent" BOOLEAN NOT NULL DEFAULT false`);
    await run("orders.packingSlipPrinted", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "packingSlipPrinted" BOOLEAN NOT NULL DEFAULT false`);
    await run("orders.shippedAt", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMPTZ`);
    await run("orders.deliveredAt", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMPTZ`);
    await run("orders.cancelledAt", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMPTZ`);
    await run("orders.failedAt", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "failedAt" TIMESTAMPTZ`);

    // ── New tables ─────────────────────────────────────────────────────────
    await run("table suppliers", `CREATE TABLE IF NOT EXISTS "suppliers" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "contactName" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "address" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table merge_groups", `CREATE TABLE IF NOT EXISTS "merge_groups" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "deliveryDate" TEXT NOT NULL,
      "deliverySlot" TEXT NOT NULL,
      "district" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "driverId" TEXT,
      "note" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table customer_scores", `CREATE TABLE IF NOT EXISTS "customer_scores" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "totalScore" DECIMAL(8,2) NOT NULL DEFAULT 0,
      "orderCount" INTEGER NOT NULL DEFAULT 0,
      "totalSpent" DECIMAL(12,2) NOT NULL DEFAULT 0,
      "avgOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
      "lastOrderAt" TIMESTAMPTZ,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table customer_notes", `CREATE TABLE IF NOT EXISTS "customer_notes" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "adminId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table referral_rewards", `CREATE TABLE IF NOT EXISTS "referral_rewards" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "referrerId" TEXT NOT NULL,
      "refereeId" TEXT NOT NULL,
      "orderId" TEXT NOT NULL UNIQUE,
      "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table driver_locations", `CREATE TABLE IF NOT EXISTS "driver_locations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "driverId" TEXT NOT NULL,
      "lat" DECIMAL(10,7) NOT NULL,
      "lng" DECIMAL(10,7) NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table zalo_notifications", `CREATE TABLE IF NOT EXISTS "zalo_notifications" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "templateId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "sentAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table shopping_lists", `CREATE TABLE IF NOT EXISTS "shopping_lists" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" TEXT NOT NULL UNIQUE,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table shopping_list_items", `CREATE TABLE IF NOT EXISTS "shopping_list_items" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "listId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "totalQty" INTEGER NOT NULL DEFAULT 0,
      "unit" TEXT NOT NULL DEFAULT 'kg',
      "checkedQty" INTEGER NOT NULL DEFAULT 0,
      "note" TEXT
    )`);

    await run("table product_batches", `CREATE TABLE IF NOT EXISTS "product_batches" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "batchCode" TEXT NOT NULL,
      "supplierId" TEXT,
      "origin" TEXT,
      "harvestDate" DATE,
      "expiryDate" DATE,
      "quantity" DECIMAL(10,3),
      "unit" TEXT NOT NULL DEFAULT 'kg',
      "certifications" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table traceability_logs", `CREATE TABLE IF NOT EXISTS "traceability_logs" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "batchId" TEXT,
      "action" TEXT NOT NULL,
      "note" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run("table delivery_logs", `CREATE TABLE IF NOT EXISTS "delivery_logs" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "driverId" TEXT,
      "action" TEXT NOT NULL,
      "note" TEXT,
      "lat" DECIMAL(10,7),
      "lng" DECIMAL(10,7),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    // FK: suppliers on products
    await run("fk products.supplierId → suppliers", `DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    // FK: merge_groups on orders
    await run("fk orders.mergeGroupId → merge_groups", `DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_mergeGroupId_fkey"
        FOREIGN KEY ("mergeGroupId") REFERENCES "merge_groups"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
