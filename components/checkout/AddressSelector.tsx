"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

interface Ward { code: number; name: string; }

interface AddressSelectorProps {
  ward: string;
  onWardChange: (v: string) => void;
  error?: string;
}

async function fetchHcmcWards(): Promise<Ward[]> {
  // Try v2 first (2025 data — 34 provinces, wards renamed)
  try {
    const list = await fetch("https://provinces.open-api.vn/api/v2/province?depth=1").then((r) =>
      r.ok ? r.json() : Promise.reject()
    );
    const hcmc = (list as { code: number; name: string }[]).find(
      (p) => p.name.toLowerCase().includes("hồ chí minh")
    );
    if (hcmc) {
      const detail = await fetch(
        `https://provinces.open-api.vn/api/v2/province/${hcmc.code}?depth=2`
      ).then((r) => (r.ok ? r.json() : Promise.reject()));
      const wards: Ward[] = detail.wards ?? detail.communes ?? [];
      if (wards.length > 0) return wards;
    }
  } catch {
    // fall through to v1
  }

  // Fallback: v1, code 79 = TP.HCM, depth=3 → flatten wards from all districts
  const detail = await fetch("https://provinces.open-api.vn/api/p/79?depth=3").then((r) =>
    r.json()
  );
  const wards: Ward[] = (detail.districts ?? []).flatMap(
    (d: { wards?: Ward[] }) => d.wards ?? []
  );
  return wards;
}

export function AddressSelector({ ward, onWardChange, error }: AddressSelectorProps) {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchHcmcWards()
      .then(setWards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wards;
    return wards.filter((w) => w.name.toLowerCase().includes(q));
  }, [wards, search]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Province — locked */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </label>
        <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 select-none">
          Hồ Chí Minh
        </div>
      </div>

      {/* Ward — searchable select spanning 2 cols */}
      <div className="sm:col-span-2 space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm phường/xã..."
            className="w-36 shrink-0 rounded-xl border border-gray-200 px-3 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
          />
          <div className="relative flex-1">
            <select
              value={ward}
              onChange={(e) => { onWardChange(e.target.value); setSearch(""); }}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent disabled:opacity-50 appearance-none"
            >
              <option value="">{loading ? "Đang tải..." : "Chọn phường / xã"}</option>
              {filtered.map((w) => (
                <option key={w.code} value={w.name}>{w.name}</option>
              ))}
            </select>
            {loading && (
              <Loader2 className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
