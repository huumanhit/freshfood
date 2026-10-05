import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const db = new PrismaClient();

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
  const excelPath = path.resolve(process.argv[2] || "template-san-pham-105-san-pham-FINAL.xlsx");
  console.log(`\n========================================`);
  console.log(`🚀 BẮT ĐẦU CLEAR DATA CŨ & IMPORT DATA MỚI`);
  console.log(`📂 Đọc file: ${excelPath}`);
  console.log(`🖼️  Hình ảnh sản phẩm: ĐỂ TRỐNG (sẽ cập nhật sau)`);
  console.log(`========================================\n`);

  const workbook = XLSX.readFile(excelPath);

  // =========================================================================
  // BƯỚC 1: XÓA SẠCH DỮ LIỆU CŨ LIÊN QUAN TỚI SẢN PHẨM & ĐƠN HÀNG MẪU
  // =========================================================================
  console.log("🧹 Đang dọn dẹp dữ liệu cũ...");

  // 1. DeliveryLog
  const delLogs = await db.deliveryLog.deleteMany({});
  console.log(`  - Đã xóa DeliveryLog: ${delLogs.count}`);

  // 2. TraceabilityLog
  const traceLogs = await db.traceabilityLog.deleteMany({});
  console.log(`  - Đã xóa TraceabilityLog: ${traceLogs.count}`);

  // 3. ReferralReward
  const refRewards = await db.referralReward.deleteMany({});
  console.log(`  - Đã xóa ReferralReward: ${refRewards.count}`);

  // 4. OrderItem
  const orderItems = await db.orderItem.deleteMany({});
  console.log(`  - Đã xóa OrderItem: ${orderItems.count}`);

  // 5. Order
  const orders = await db.order.deleteMany({});
  console.log(`  - Đã xóa Order: ${orders.count}`);

  // 6. MergeGroup
  const mergeGroups = await db.mergeGroup.deleteMany({});
  console.log(`  - Đã xóa MergeGroup: ${mergeGroups.count}`);

  // 7. CartItem
  const cartItems = await db.cartItem.deleteMany({});
  console.log(`  - Đã xóa CartItem: ${cartItems.count}`);

  // 8. Review
  const reviews = await db.review.deleteMany({});
  console.log(`  - Đã xóa Review: ${reviews.count}`);

  // 9. Wishlist
  const wishlists = await db.wishlist.deleteMany({});
  console.log(`  - Đã xóa Wishlist: ${wishlists.count}`);

  // 10. ShoppingListItem & ShoppingList
  const shopItems = await db.shoppingListItem.deleteMany({});
  const shopLists = await db.shoppingList.deleteMany({});
  console.log(`  - Đã xóa ShoppingList(Item): ${shopLists.count} (${shopItems.count} items)`);

  // 11. ProductBatch
  const batches = await db.productBatch.deleteMany({});
  console.log(`  - Đã xóa ProductBatch: ${batches.count}`);

  // 12. ProductImage
  const pImages = await db.productImage.deleteMany({});
  console.log(`  - Đã xóa ProductImage: ${pImages.count}`);

  // 13. Product
  const prods = await db.product.deleteMany({});
  console.log(`  - Đã xóa Product: ${prods.count}`);

  // 14. Category
  const cats = await db.category.deleteMany({});
  console.log(`  - Đã xóa Category: ${cats.count}`);

  console.log("✨ Toàn bộ dữ liệu sản phẩm cũ đã được dọn sạch!\n");

  // =========================================================================
  // BƯỚC 2: IMPORT DANH MỤC
  // =========================================================================
  console.log("📂 Đang import Danh mục mới...");
  const catSheet = workbook.Sheets["Danh muc"] ?? workbook.Sheets["Danh mục"] ?? workbook.Sheets[workbook.SheetNames[0]];
  const catRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(catSheet, { defval: "" });

  const categoryMap = new Map<string, string>(); // slug -> id

  for (const [i, rawRow] of catRows.entries()) {
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawRow)) {
      row[k.trim()] = v;
    }

    const name = String(row["Tên danh mục"] ?? row["ten_danh_muc"] ?? "").trim();
    if (!name) continue;

    const slug = String(row["Slug"] ?? row["slug"] ?? "").trim() || toSlug(name);
    const sortOrder = Number(row["Thứ tự"] ?? row["thu_tu"] ?? i + 1) || i + 1;

    const cat = await db.category.create({
      data: {
        name,
        slug,
        sortOrder,
        description: `${name} tươi sạch chất lượng cao, giao nhanh trong ngày`,
        image: null,
        isActive: true,
      },
    });

    categoryMap.set(slug, cat.id);
    console.log(`  ✅ [${cat.sortOrder}] ${cat.name} (${cat.slug})`);
  }

  // =========================================================================
  // BƯỚC 3: IMPORT SẢN PHẨM TỪ SHEET 'San pham' (ĐỂ TRỐNG HÌNH ẢNH)
  // =========================================================================
  console.log("\n🛒 Đang import Sản phẩm mới từ sheet 'San pham'...");
  const prodSheet = workbook.Sheets["San pham"] ?? workbook.Sheets["Sản phẩm"] ?? workbook.Sheets[workbook.SheetNames[1]];
  if (!prodSheet) {
    throw new Error("Không tìm thấy sheet 'San pham' hoặc 'Sản phẩm'");
  }

  const rawProdRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(prodSheet, { defval: "" });
  console.log(`📋 Tổng số dòng sản phẩm trong file: ${rawProdRows.length}\n`);

  let created = 0;
  let skipped = 0;

  for (const rawRow of rawProdRows) {
    // Chuẩn hóa tên cột (loại bỏ khoảng trắng thừa ở tiêu đề)
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawRow)) {
      row[k.trim()] = v;
    }

    const name = String(row["Tên sản phẩm"] ?? row["ten_san_pham"] ?? "").trim();
    if (!name) {
      skipped++;
      continue;
    }

    const catSlug = String(row["Danh mục (slug)"] ?? row["danh_muc"] ?? "").trim();
    const categoryId = categoryMap.get(catSlug);
    if (!categoryId) {
      console.warn(`  ⚠️ Bỏ qua "${name}" — không tìm thấy danh mục: "${catSlug}"`);
      skipped++;
      continue;
    }

    const priceRaw = String(row["Giá bán (đ)"] ?? row["gia_ban"] ?? "0").replace(/[^0-9]/g, "");
    const price = Number(priceRaw) || 0;
    if (!price) {
      console.warn(`  ⚠️ Bỏ qua "${name}" — giá bán không hợp lệ: "${priceRaw}"`);
      skipped++;
      continue;
    }

    const salePriceRaw = String(row["Giá sale (đ)"] ?? row["gia_sale"] ?? "").replace(/[^0-9]/g, "");
    const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

    const unit = String(row["Đơn vị"] ?? row["don_vi"] ?? "kg").trim().toLowerCase() || "kg";
    const origin = String(row["Xuất xứ"] ?? row["xuat_xu"] ?? "Chợ Đầu Mối Hóc Môn").trim();
    const stock = Number(row["Tồn kho"] ?? row["ton_kho"] ?? 10) || 10;
    const shortDescription = String(
      row["Mô tả ngắn"] ?? row["mo_ta_ngan"] ?? "Bao ăn, 1 đổi 1 (hoặc hoàn tiền), hàng tươi ngon"
    ).trim();

    // Link ảnh: Nếu người dùng có nhập URL cụ thể trong Excel thì mới lưu, còn lại để trống hoàn toàn
    const imageUrl = String(row["Link ảnh"] ?? row["link_anh"] ?? "").trim();

    const isOrganic = parseBoolean(row["Hữu cơ"] ?? row["huu_co"]);
    const isFeatured = parseBoolean(row["Nổi bật"] ?? row["noi_bat"]);
    const isCore = parseBoolean(row["Thiết yếu"] ?? row["thiet_yeu"]);

    const slug = toSlug(name);

    const product = await db.product.create({
      data: {
        name,
        slug,
        categoryId,
        price,
        salePrice,
        unit,
        origin,
        stock,
        shortDescription,
        description: `<p>${shortDescription}</p><ul><li>Xuất xứ: ${origin}</li><li>Đơn vị: ${unit}</li><li>Quy cách: Tuyển chọn tươi ngon hàng ngày</li></ul>`,
        isOrganic,
        isFeatured,
        isCore,
        status: "ACTIVE",
      },
    });

    // Chỉ tạo ảnh khi người dùng đã nhập link ảnh trong file Excel, không tự động gán ảnh mẫu
    if (imageUrl) {
      await db.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    const saleTxt = salePrice ? ` (Sale: ${salePrice.toLocaleString()}đ)` : "";
    console.log(`  ✅ [${created + 1}] ${name} | ${price.toLocaleString()}đ${saleTxt} | ${unit} | ${catSlug}`);
    created++;
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 HOÀN TẤT CLEAR & IMPORT DỮ LIỆU!
   - Danh mục tạo mới : ${categoryMap.size}
   - Sản phẩm tạo mới : ${created} (Hình ảnh để trống)
   - Bỏ qua           : ${skipped}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch((err) => {
    console.error("❌ Lỗi trong quá trình chạy:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
