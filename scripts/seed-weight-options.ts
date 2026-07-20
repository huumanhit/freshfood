import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding weight options for a few products...");
  
  // Find first 4 active products
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    take: 4,
  });

  if (products.length === 0) {
    console.log("No active products found!");
    return;
  }

  const weightOptionsTemplates = [
    [
      { name: "10g", price: 15000, salePrice: 12000 },
      { name: "20g", price: 28000, salePrice: null },
      { name: "50g", price: 65000, salePrice: 58000 },
    ],
    [
      { name: "100g", price: 25000, salePrice: null },
      { name: "200g", price: 48000, salePrice: 45000 },
    ],
    [
      { name: "10g", price: 18000, salePrice: 15000 },
      { name: "20g", price: 34000, salePrice: 30000 },
      { name: "30g", price: 50000, salePrice: null },
    ],
    [
      { name: "50g", price: 35000, salePrice: 32000 },
      { name: "100g", price: 65000, salePrice: null },
    ],
  ];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const options = weightOptionsTemplates[i % weightOptionsTemplates.length];
    
    await prisma.product.update({
      where: { id: product.id },
      data: {
        weightOptions: options,
      },
    });
    console.log(`Updated product: ${product.name} (ID: ${product.id}) with options:`, options.map(o => o.name).join(", "));
  }

  console.log("Seed options completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
