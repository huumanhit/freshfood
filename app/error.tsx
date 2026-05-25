"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Đã có lỗi xảy ra</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Xin lỗi, đã có lỗi không mong muốn. Vui lòng thử lại.
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
