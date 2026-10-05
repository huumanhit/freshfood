import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("\n========================================");
  console.log("🧹 TIẾN HÀNH DỌN DẸP TOÀN BỘ USER TEST ĐỂ BÀN GIAO");
  console.log("========================================\n");

  // Tìm tài khoản Super Admin cần giữ lại
  const admin = await db.user.findFirst({
    where: {
      role: { in: ["SUPER_ADMIN", "ADMIN"] },
    },
  });

  if (!admin) {
    throw new Error("❌ Không tìm thấy tài khoản Admin để bảo lưu!");
  }

  console.log(`🛡️  Bảo lưu tài khoản Quản trị viên:`);
  console.log(`   - Email: ${admin.email}`);
  console.log(`   - Tên  : ${admin.name}`);
  console.log(`   - Role : ${admin.role}\n`);

  // Xóa Address của các user test trước
  const delAddresses = await db.address.deleteMany({
    where: {
      userId: { not: admin.id },
    },
  });
  console.log(`  - Đã xóa địa chỉ test (Address): ${delAddresses.count}`);

  // Xóa CustomerScore của user test
  const delScores = await db.customerScore.deleteMany({
    where: {
      userId: { not: admin.id },
    },
  });
  console.log(`  - Đã xóa điểm khách hàng (CustomerScore): ${delScores.count}`);

  // Xóa Carts của user test nếu có
  const delCarts = await db.cart.deleteMany({
    where: {
      userId: { not: admin.id },
    },
  });
  console.log(`  - Đã xóa giỏ hàng (Cart): ${delCarts.count}`);

  // Xóa toàn bộ user test (role !== ADMIN / SUPER_ADMIN)
  const delUsers = await db.user.deleteMany({
    where: {
      id: { not: admin.id },
    },
  });
  console.log(`  - Đã xóa toàn bộ User test: ${delUsers.count}\n`);

  // Kiểm tra danh sách user còn lại
  const remainingUsers = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DỌN DẸP HOÀN TẤT! Dữ liệu người dùng còn lại:");
  console.log(JSON.stringify(remainingUsers, null, 2));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((err) => {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
