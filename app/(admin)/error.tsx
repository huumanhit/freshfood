"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
      <h2 className="text-xl font-bold text-gray-800">Đã có lỗi xảy ra</h2>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {error.message || "Lỗi không mong muốn. Vui lòng thử lại."}
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 font-mono">ID: {error.digest}</p>
      )}
      <Button
        onClick={reset}
        className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
      >
        Thử lại
      </Button>
    </div>
  );
}
