import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

// GET /api/admin/delivery/drivers — last known location for each active driver
export async function GET() {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Find the most recent location per driver within the last 4 hours
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const locations = await db.driverLocation.findMany({
    where: { createdAt: { gte: cutoff } },
    distinct: ["userId"],
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
  });

  return NextResponse.json({
    drivers: locations.map((l) => ({
      userId: l.userId,
      name: l.user.name,
      phone: l.user.phone,
      lat: Number(l.lat),
      lng: Number(l.lng),
      accuracy: l.accuracy ? Number(l.accuracy) : null,
      orderId: l.orderId,
      lastUpdated: l.createdAt,
    })),
  });
}
