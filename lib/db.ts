import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildUrl(base: string | undefined): string {
  if (!base) return "";
  // Serverless: cap each function instance to 1 connection so session-mode
  // poolers (Supabase Supavisor, pgBouncer) are never exhausted.
  if (base.includes("connection_limit=")) return base;
  return base + (base.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=20";
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: { db: { url: buildUrl(process.env.DATABASE_URL) } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
