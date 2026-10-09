import { Prisma } from "@prisma/client";
import { generateSlug } from "@/lib/utils";

/**
 * Builds a comprehensive search filter for products supporting:
 * 1. Accent-sensitive & insensitive matching (e.g., "thịt" and "thit")
 * 2. Accent-stripped matching via product slug & category slug
 * 3. Multi-word queries (e.g., "thịt heo", "cá hồi", "ba chỉ")
 * 4. Tag, origin, and SKU matching
 */
export function buildProductSearchFilter(search?: string | null): Prisma.ProductWhereInput[] {
  if (!search) return [];
  const q = search.trim();
  if (!q) return [];

  const slugQ = generateSlug(q);
  const words = slugQ.split("-").filter(Boolean);

  const conditions: Prisma.ProductWhereInput[] = [
    { name: { contains: q, mode: "insensitive" } },
    { category: { name: { contains: q, mode: "insensitive" } } },
    { tags: { contains: q, mode: "insensitive" } },
    { origin: { contains: q, mode: "insensitive" } },
  ];

  if (slugQ) {
    conditions.push(
      { slug: { contains: slugQ, mode: "insensitive" } },
      { category: { slug: { contains: slugQ, mode: "insensitive" } } },
      { tags: { contains: slugQ, mode: "insensitive" } }
    );
  }

  // Also match SKU directly if alphanumeric
  if (q.length >= 2) {
    conditions.push({ sku: { contains: q, mode: "insensitive" } });
  }

  // Multi-word support: every token must match in either slug, category slug, or tags
  if (words.length > 1) {
    conditions.push({
      AND: words.map((w) => ({
        OR: [
          { slug: { contains: w, mode: "insensitive" } },
          { category: { slug: { contains: w, mode: "insensitive" } } },
          { tags: { contains: w, mode: "insensitive" } },
        ],
      })),
    });
  }

  return conditions;
}
