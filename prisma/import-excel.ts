/**
 * Import sản phẩm từ file Excel
 * Cách chạy: npx tsx prisma/import-excel.ts prisma/data.xlsx
 */

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const db = new PrismaClient();

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseBoolean(val: unknown): boolean {
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  return s === "có" || s === "yes" || s === "true" || s === "x" || s === "1";
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Thiếu đường dẫn file Excel");
    console.log("   Cách dùng: npx tsx prisma/import-excel.ts prisma/data.xlsx");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  console.log(`\n📂 Đọc file: ${absPath}\n`);

  const workbook = XLSX.readFile(absPath);

  // ── Sheet 1: Danh mục ──────────────────────────────────────────────────────
  const catSheet = workbook.Sheets["Danh muc"] ?? workbook.Sheets["Danh mục"] ?? workbook.Sheets[workbook.SheetNames[0]];
  const catRows = XLSX.utils.sheet_to_json<Record<string, string>>(catSheet, { defval: "" });

  console.log(`📂 Tìm thấy ${catRows.length} danh mục\n`);

  const categoryMap = new Map<string, string>(); // slug → id

  for (const [i, row] of catRows.entries()) {
    const name = String(row["Tên danh mục"] ?? row["ten_danh_muc"] ?? "").trim();
    if (!name) continue;

    const slug = String(row["Slug"] ?? row["slug"] ?? "").trim() || toSlug(name);
    const sortOrder = Number(row["Thứ tự"] ?? row["thu_tu"] ?? i + 1) || i + 1;

    const cat = await db.category.upsert({
      where: { slug },
      update: { name, sortOrder },
      create: { name, slug, sortOrder, isActive: true },
    });
    categoryMap.set(slug, cat.id);
    console.log(`  ✅ Danh mục: ${name} (${slug})`);
  }

  // ── Sheet 2: Sản phẩm ─────────────────────────────────────────────────────
  const prodSheet = workbook.Sheets["San pham"] ?? workbook.Sheets["Sản phẩm"] ?? workbook.Sheets[workbook.SheetNames[1]];
  if (!prodSheet) {
    console.error("❌ Không tìm thấy sheet 'San pham' hoặc 'Sản phẩm'");
    process.exit(1);
  }

  const prodRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(prodSheet, { defval: "" });
  console.log(`\n🛒 Tìm thấy ${prodRows.length} sản phẩm\n`);

  let created = 0, updated = 0, skipped = 0;

  for (const row of prodRows) {
    const name = String(row["Tên sản phẩm"] ?? row["ten_san_pham"] ?? "").trim();
    if (!name) continue;

    const catSlug = String(row["Danh mục (slug)"] ?? row["danh_muc"] ?? "").trim();
    const categoryId = categoryMap.get(catSlug);
    if (!categoryId) {
      console.warn(`  ⚠️  Bỏ qua "${name}" — không tìm thấy danh mục: "${catSlug}"`);
      skipped++;
      continue;
    }

    const price = Number(String(row["Giá bán (đ)"] ?? row["gia_ban"] ?? "0").replace(/[^0-9]/g, "")) || 0;
    const salePriceRaw = String(row["Giá sale (đ)"] ?? row["gia_sale"] ?? "").replace(/[^0-9]/g, "");
    const salePrice = salePriceRaw ? Number(salePriceRaw) : null;
    const unit = String(row["Đơn vị"] ?? row["don_vi"] ?? "kg").trim() || "kg";
    const origin = String(row["Xuất xứ"] ?? row["xuat_xu"] ?? "").trim();
    const stock = Number(row["Tồn kho"] ?? row["ton_kho"] ?? 0) || 0;
    const shortDescription = String(row["Mô tả ngắn"] ?? row["mo_ta_ngan"] ?? "").trim();
    const imageUrl = String(row["Link ảnh"] ?? row["link_anh"] ?? "").trim();
    const isOrganic = parseBoolean(row["Hữu cơ"] ?? row["huu_co"]);
    const isFeatured = parseBoolean(row["Nổi bật"] ?? row["noi_bat"]);
    const isCore = parseBoolean(row["Thiết yếu"] ?? row["thiet_yeu"]);

    if (!price) {
      console.warn(`  ⚠️  Bỏ qua "${name}" — giá bán không hợp lệ`);
      skipped++;
      continue;
    }

    const slug = toSlug(name);
    const existing = await db.product.findUnique({ where: { slug } });

    await db.product.upsert({
      where: { slug },
      update: { name, price, salePrice, unit, origin, stock, shortDescription, isOrganic, isFeatured, isCore, categoryId, status: "ACTIVE" },
      create: { name, slug, price, salePrice, unit, origin, stock, shortDescription, isOrganic, isFeatured, isCore, categoryId, status: "ACTIVE" },
    });

    // Gắn ảnh nếu có và chưa có ảnh
    if (imageUrl && !existing) {
      const product = await db.product.findUnique({ where: { slug } });
      if (product) {
        await db.productImage.create({
          data: { productId: product.id, url: imageUrl, alt: name, isPrimary: true, sortOrder: 0 },
        });
      }
    }

    if (existing) {
      console.log(`  ♻️  Cập nhật: ${name}`);
      updated++;
    } else {
      console.log(`  ✅ Tạo mới: ${name}`);
      created++;
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Import hoàn tất!
   Danh mục : ${categoryMap.size}
   Tạo mới  : ${created}
   Cập nhật : ${updated}
   Bỏ qua   : ${skipped}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch((e) => { console.error("❌ Lỗi:", e); process.exit(1); })
  .finally(() => db.$disconnect());
