/**
 * Bulk upload ảnh sản phẩm lên Cloudinary + gắn vào DB
 *
 * Cách dùng:
 *   1. Tải ảnh từ Google Drive về folder: prisma/images/
 *   2. Đặt tên file = tên sản phẩm hoặc slug (không cần chính xác tuyệt đối)
 *      Ví dụ: "rau-muong-sach.jpg" hoặc "rau muống sạch.jpg"
 *   3. Chạy: npx tsx prisma/upload-images.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as FormData from "form-data";
import fetch from "node-fetch";

const db = new PrismaClient();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "dl51jugpu";
const UPLOAD_PRESET = "freshfood_uploads";
const IMAGES_DIR = path.join(__dirname, "images");

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

function similarity(a: string, b: string): number {
  a = toSlug(a); b = toSlug(b);
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const wordsA = new Set(a.split("-"));
  const wordsB = new Set(b.split("-"));
  const common = [...wordsA].filter(w => wordsB.has(w)).length;
  return common / Math.max(wordsA.size, wordsB.size);
}

async function uploadToCloudinary(filePath: string, fileName: string): Promise<string> {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", "freshfood/products");
  form.append("public_id", toSlug(path.parse(fileName).name));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form as unknown as BodyInit }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Cloudinary lỗi: ${JSON.stringify(err)}`);
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

async function main() {
  // Kiểm tra folder ảnh
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Đã tạo folder: prisma/images/`);
    console.log("   Hãy copy ảnh vào folder đó rồi chạy lại script.");
    process.exit(0);
  }

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    console.log("⚠️  Không có ảnh nào trong prisma/images/");
    console.log("   Copy ảnh vào folder đó rồi chạy lại.");
    process.exit(0);
  }

  console.log(`\n📸 Tìm thấy ${imageFiles.length} ảnh trong prisma/images/\n`);

  // Lấy tất cả sản phẩm từ DB
  const products = await db.product.findMany({
    select: { id: true, name: true, slug: true },
  });

  let uploaded = 0, skipped = 0, notFound = 0;

  for (const file of imageFiles) {
    const nameWithoutExt = path.parse(file).name;
    const filePath = path.join(IMAGES_DIR, file);

    // Tìm sản phẩm khớp nhất với tên file
    let bestMatch = { product: products[0], score: 0 };
    for (const p of products) {
      const score = Math.max(
        similarity(nameWithoutExt, p.name),
        similarity(nameWithoutExt, p.slug)
      );
      if (score > bestMatch.score) bestMatch = { product: p, score };
    }

    if (bestMatch.score < 0.4) {
      console.warn(`  ⚠️  Không khớp sản phẩm nào: "${file}" (score: ${bestMatch.score.toFixed(2)})`);
      notFound++;
      continue;
    }

    const product = bestMatch.product;
    console.log(`  📎 "${file}" → "${product.name}" (${(bestMatch.score * 100).toFixed(0)}% match)`);

    try {
      // Upload lên Cloudinary
      const url = await uploadToCloudinary(filePath, file);

      // Xóa ảnh cũ nếu có, gắn ảnh mới
      await db.productImage.deleteMany({ where: { productId: product.id, isPrimary: true } });
      await db.productImage.create({
        data: { productId: product.id, url, alt: product.name, isPrimary: true, sortOrder: 0 },
      });

      console.log(`     ✅ Upload thành công: ${url}`);
      uploaded++;
    } catch (err) {
      console.error(`     ❌ Lỗi upload: ${err}`);
      skipped++;
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Upload hoàn tất!
   Upload OK : ${uploaded}
   Lỗi       : ${skipped}
   Không khớp: ${notFound}
━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch(e => { console.error("❌ Lỗi:", e); process.exit(1); })
  .finally(() => db.$disconnect());
