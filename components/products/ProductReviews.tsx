"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, MessageSquare, CheckCircle2, Loader2, ThumbsUp } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse } from "@/types/api";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Vui lòng chọn số sao").max(5),
  comment: z.string().max(1000).optional(),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = (readonly ? value : (hover || value)) > i;
        return (
          <button
            key={i}
            type={readonly ? "button" : "button"}
            disabled={readonly}
            onClick={() => !readonly && onChange?.(i + 1)}
            onMouseEnter={() => !readonly && setHover(i + 1)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={cn("transition-transform", !readonly && "hover:scale-110 active:scale-95")}
            aria-label={`${i + 1} sao`}
          >
            <Star className={cn(sizeClass, active ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
          </button>
        );
      })}
    </div>
  );
}

export function ProductReviews({ productId, averageRating = 0, reviewCount = 0 }: ProductReviewsProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Review[]>>(
        `/api/reviews?productId=${productId}`
      );
      return data.data ?? [];
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const ratingValue = watch("rating");

  const mutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      await axios.post("/api/reviews", { productId, ...values });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      reset();
      setShowForm(false);
    },
  });

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = reviews?.filter((r) => r.rating === star).length ?? 0;
    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <div id="reviews" className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#22c55e]" />
        Đánh giá sản phẩm
        {reviewCount > 0 && (
          <span className="text-sm font-normal text-gray-400">({reviewCount} đánh giá)</span>
        )}
      </h2>

      {/* Rating summary */}
      {reviewCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 rounded-2xl bg-gray-50 p-5 border border-gray-100">
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
            <StarRating value={Math.round(averageRating)} readonly size="md" />
            <span className="text-xs text-gray-400 mt-1">{reviewCount} đánh giá</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-5 text-right">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review CTA */}
      {isAuthenticated && !showForm && (
        <Button
          variant="outline"
          className="rounded-2xl border-[#22c55e] text-[#22c55e] hover:bg-green-50"
          onClick={() => setShowForm(true)}
        >
          <Star className="h-4 w-4 mr-2" />
          Viết đánh giá
        </Button>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="rounded-2xl border border-gray-200 p-5 space-y-4 bg-white shadow-sm"
        >
          <h3 className="font-semibold text-gray-800">Đánh giá của bạn</h3>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">Chọn số sao:</p>
            <StarRating
              value={ratingValue}
              onChange={(v) => setValue("rating", v, { shouldValidate: true })}
              size="lg"
            />
            {errors.rating && (
              <p className="text-xs text-red-500">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Nhận xét (tùy chọn):</label>
            <Textarea
              {...register("comment")}
              placeholder="Chia sẻ cảm nhận về sản phẩm..."
              className="rounded-xl resize-none"
              rows={4}
            />
            {errors.comment && (
              <p className="text-xs text-red-500">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setShowForm(false); reset(); }}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a]"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gửi đánh giá
            </Button>
          </div>
        </form>
      )}

      <Separator />

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={review.user.image ?? undefined} />
                <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                  {(review.user.name ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {review.user.name ?? "Khách hàng"}
                    </span>
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                )}
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1">
                  <ThumbsUp className="h-3 w-3" />
                  Hữu ích
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Star className="h-10 w-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Chưa có đánh giá. Hãy là người đầu tiên!</p>
        </div>
      )}
    </div>
  );
}
