import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, AppError } from "@/lib/api-error";
import { UPLOAD } from "@/constants/config";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) throw new AppError("No file provided", 400);
    if (file.size > UPLOAD.MAX_FILE_SIZE) {
      throw new AppError(`File quá lớn. Tối đa ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
    }
    if (!UPLOAD.ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new AppError("Chỉ chấp nhận file JPG, PNG, WebP", 400);
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "freshfood_uploads");
    cloudinaryFormData.append("folder", "freshfood/products");

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudinaryFormData }
    );

    if (!cloudinaryRes.ok) throw new AppError("Upload thất bại", 500);

    const cloudinaryData = await cloudinaryRes.json();

    return successResponse({
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
