"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastVisitDate = localStorage.getItem("ff_last_visit_date");
      const isNewVisitor = lastVisitDate !== today;

      if (isNewVisitor) {
        localStorage.setItem("ff_last_visit_date", today);
      }

      const payload = JSON.stringify({ isNewVisitor, path: pathname });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track-visit", blob);
      } else {
        fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // silently ignore
    }
  }, [pathname]);

  return null;
}
