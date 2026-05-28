import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildUrl(base: string | undefined): string {
  if (!base) return "";
  if (base.includes("connection_limit=")) return base;
  return base + (base.includes("?") ? "&" : "?") + "connection_limit=3&pool_timeout=10";
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: { db: { url: buildUrl(process.env.DATABASE_URL) } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
