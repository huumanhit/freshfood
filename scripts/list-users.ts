import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => db.$disconnect());
