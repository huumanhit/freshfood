import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Mật khẩu mới tối thiểu 8 ký tự" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  if (!user?.password) return NextResponse.json({ error: "Tài khoản không có mật khẩu" }, { status: 400 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
