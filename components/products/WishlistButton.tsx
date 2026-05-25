"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({ productId, className, size = "md" }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggle, isPending } = useWishlist();
  const router = useRouter();
  const inList = isInWishlist(productId);

  const sizeClass = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }[size];

  const iconSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    toggle(productId);
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={inList ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-60",
        sizeClass,
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={inList ? "filled" : "empty"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              iconSize,
              "transition-colors duration-200",
              inList ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
