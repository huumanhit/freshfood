export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

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

    // FKs (safe to re-run)
    await run(`DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await run(`DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_mergeGroupId_fkey"
        FOREIGN KEY ("mergeGroupId") REFERENCES "merge_groups"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await prisma.$disconnect();
  } catch {
    // Never crash the server on migration failure
  }
}
