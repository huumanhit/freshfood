import { NextResponse } from "next/server";
import { ApiResponse, PaginationMeta } from "@/types/api";

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function paginatedResponse<T>(
  data: T,
  pagination: PaginationMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, pagination }, { status });
}

export function createdResponse<T>(data: T, message = "Created successfully"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
