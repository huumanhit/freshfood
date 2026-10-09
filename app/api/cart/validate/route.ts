export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const validateSchema = z.object({
  productIds: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productIds } = validateSchema.parse(body);

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stock: true,
        status: true,
      },
    });

    const foundMap = new Map(products.map((p) => [p.id, p]));
    const results = productIds.map((id) => {
      const p = foundMap.get(id);
      if (!p) {
        return {
          id,
          name: "Sản phẩm không tồn tại",
          price: 0,
          salePrice: null,
          stock: 0,
          status: "INACTIVE",
        };
      }
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        salePrice: p.salePrice != null ? Number(p.salePrice) : null,
        stock: p.stock,
        status: p.status,
      };
    });

    return successResponse({ products: results });
  } catch (error) {
    return handleApiError(error);
  }
}
