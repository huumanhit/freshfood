export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { PrismaClient } = await import("@prisma/client");
  // Use DIRECT_URL to bypass the connection pooler — DDL requires a direct
  // connection; pgBouncer/Supavisor transaction mode rejects DDL.
  // connection_limit=1 so this one-shot client never opens more than 1 socket.
  const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  const prisma = new PrismaClient({
    datasources: { db: { url: directUrl + (directUrl.includes("?") ? "&" : "?") + "connection_limit=1" } },
  });

  try {

    // Fast sentinel check — if costPrice already exists, all migrations have run.
    // Avoids 30+ round-trips to Supabase on every cold start.
    const sentinel = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'costPrice'
      ) AS exists
    `;
    if (sentinel[0]?.exists) return;

    const run = async (sql: string) => {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch {
        // IF NOT EXISTS / already exists errors are fine
      }
    };

    // Enums
    await run(`DO $$ BEGIN
      CREATE TYPE "CustomerTier" AS ENUM ('BRONZE','SILVER','GOLD','PLATINUM');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await run(`DO $$ BEGIN
      ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'FAILED';
    EXCEPTION WHEN others THEN null; END $$`);

    // users
    await run(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "segment" "CustomerTier" NOT NULL DEFAULT 'BRONZE'`);
    await run(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referralCode" TEXT`);
    await run(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rewardBalance" DECIMAL(12,2) NOT NULL DEFAULT 0`);

    // products
    await run(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplierId" TEXT`);
    await run(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "soldCount" INTEGER NOT NULL DEFAULT 0`);
    await run(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0`);
    await run(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(12,2)`);

    // addresses
    await run(`ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION`);
    await run(`ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION`);
    await run(`ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "mapLink" TEXT`);

    // orders
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliverySlot" TEXT`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "referralPhone" TEXT`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transactionId" TEXT`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "mergeGroupId" TEXT`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "isMergeParent" BOOLEAN NOT NULL DEFAULT false`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "packingSlipPrinted" BOOLEAN NOT NULL DEFAULT false`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMPTZ`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMPTZ`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMPTZ`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "failedAt" TIMESTAMPTZ`);
    await run(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adminNote" TEXT`);

    // tables
    await run(`CREATE TABLE IF NOT EXISTS "suppliers" (
      "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "contactName" TEXT,
      "phone" TEXT, "email" TEXT, "address" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "merge_groups" (
      "id" TEXT NOT NULL PRIMARY KEY, "deliveryDate" TEXT NOT NULL, "deliverySlot" TEXT NOT NULL,
      "district" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'OPEN', "driverId" TEXT,
      "note" TEXT, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "customer_scores" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE,
      "totalScore" DECIMAL(8,2) NOT NULL DEFAULT 0, "orderCount" INTEGER NOT NULL DEFAULT 0,
      "totalSpent" DECIMAL(12,2) NOT NULL DEFAULT 0, "avgOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
      "lastOrderAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "customer_notes" (
      "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "adminId" TEXT NOT NULL,
      "content" TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "referral_rewards" (
      "id" TEXT NOT NULL PRIMARY KEY, "referrerId" TEXT NOT NULL, "refereeId" TEXT NOT NULL,
      "orderId" TEXT NOT NULL UNIQUE, "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "shopping_lists" (
      "id" TEXT NOT NULL PRIMARY KEY, "date" TEXT NOT NULL UNIQUE,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "shopping_list_items" (
      "id" TEXT NOT NULL PRIMARY KEY, "listId" TEXT NOT NULL, "productId" TEXT NOT NULL,
      "totalQty" INTEGER NOT NULL DEFAULT 0, "unit" TEXT NOT NULL DEFAULT 'kg',
      "checkedQty" INTEGER NOT NULL DEFAULT 0, "note" TEXT
    )`);

    // FKs
    await run(`DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await run(`DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_mergeGroupId_fkey"
        FOREIGN KEY ("mergeGroupId") REFERENCES "merge_groups"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

  } catch {
    // Never crash the server on migration failure
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
