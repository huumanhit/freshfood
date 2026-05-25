import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ---- Admin user ----
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@freshfood.vn" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@freshfood.vn",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✔ Admin created: ${admin.email}`);

  // ---- Demo user ----
  const userPassword = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@freshfood.vn" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@freshfood.vn",
      password: userPassword,
      role: Role.USER,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✔ Demo user created: ${demoUser.email}`);

  // ---- Categories ----
  const categoryData = [
    { name: "Rau củ", description: "Rau củ tươi sạch", image: "/images/categories/vegetables.jpg" },
    { name: "Trái cây", description: "Trái cây tươi nhập khẩu và trong nước", image: "/images/categories/fruits.jpg" },
    { name: "Thịt & Hải sản", description: "Thịt tươi và hải sản sạch", image: "/images/categories/meat.jpg" },
    { name: "Sữa & Trứng", description: "Sản phẩm từ sữa và trứng", image: "/images/categories/dairy.jpg" },
    { name: "Ngũ cốc & Hạt", description: "Ngũ cốc và các loại hạt dinh dưỡng", image: "/images/categories/grains.jpg" },
    { name: "Thực phẩm hữu cơ", description: "100% hữu cơ, không hóa chất", image: "/images/categories/organic.jpg" },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.upsert({
        where: { slug: slugify(cat.name, { lower: true, locale: "vi" }) },
        update: {},
        create: {
          ...cat,
          slug: slugify(cat.name, { lower: true, locale: "vi" }),
        },
      })
    )
  );
  console.log(`  ✔ ${categories.length} categories created`);

  // ---- Sample products ----
  const productData = [
    {
      name: "Cà chua bi đỏ hữu cơ",
      price: 35000,
      salePrice: 29000,
      stock: 150,
      unit: "500g",
      origin: "Đà Lạt",
      isOrganic: true,
      isFeatured: true,
      categoryIndex: 0,
    },
    {
      name: "Rau cải xanh VietGAP",
      price: 18000,
      stock: 200,
      unit: "bó",
      origin: "Lâm Đồng",
      isOrganic: false,
      isFeatured: false,
      categoryIndex: 0,
    },
    {
      name: "Dưa hấu không hạt",
      price: 45000,
      salePrice: 38000,
      stock: 80,
      unit: "kg",
      origin: "Tiền Giang",
      isOrganic: false,
      isFeatured: true,
      categoryIndex: 1,
    },
    {
      name: "Xoài cát Hòa Lộc",
      price: 85000,
      stock: 60,
      unit: "kg",
      origin: "Tiền Giang",
      isOrganic: false,
      isFeatured: true,
      categoryIndex: 1,
    },
    {
      name: "Thịt bò Úc đông lạnh",
      price: 320000,
      salePrice: 280000,
      stock: 40,
      unit: "500g",
      origin: "Úc",
      isOrganic: false,
      isFeatured: true,
      categoryIndex: 2,
    },
  ];

  for (const p of productData) {
    const { categoryIndex, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: slugify(p.name, { lower: true, locale: "vi" }) },
      update: {},
      create: {
        ...rest,
        price: p.price,
        salePrice: p.salePrice ?? null,
        slug: slugify(p.name, { lower: true, locale: "vi" }),
        status: ProductStatus.ACTIVE,
        categoryId: categories[categoryIndex].id,
        shortDescription: `${p.name} - tươi ngon, an toàn`,
      },
    });
  }
  console.log(`  ✔ ${productData.length} products created`);

  // ---- Sample coupon ----
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 100000,
      maxDiscount: 50000,
      usageLimit: 1000,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("  ✔ Welcome coupon created");

  // ---- Hero banner ----
  await prisma.banner.upsert({
    where: { id: "banner-hero-1" },
    update: {},
    create: {
      id: "banner-hero-1",
      title: "Thực phẩm sạch mỗi ngày",
      subtitle: "Giao hàng tận nơi trong 2 giờ",
      image: "/images/banners/hero-1.jpg",
      linkUrl: "/products",
      position: "HERO",
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log("  ✔ Hero banner created");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
