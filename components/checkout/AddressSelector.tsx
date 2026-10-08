"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, ChevronDown, X, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Ward {
  code: number;
  name: string;
  district: string;
}

interface AddressSelectorProps {
  ward: string;
  onWardChange: (v: string) => void;
  onDistrictChange?: (v: string) => void;
  error?: string;
}

let cachedWards: Ward[] | null = null;

async function fetchHcmcWards(): Promise<Ward[]> {
  if (cachedWards && cachedWards.length > 0) {
    return cachedWards;
  }

  // Primary: v1, code 79 = TP.HCM, depth=3 → flatten wards with districts
  try {
    const detail = await fetch("https://provinces.open-api.vn/api/p/79?depth=3").then((r) =>
      r.ok ? r.json() : Promise.reject()
    );
    const wards: Ward[] = (detail.districts ?? []).flatMap(
      (d: { name: string; wards?: { code: number; name: string }[] }) =>
        (d.wards ?? []).map((w) => ({
          code: w.code,
          name: w.name,
          district: d.name,
        }))
    );
    if (wards.length > 0) {
      cachedWards = wards;
      return wards;
    }
  } catch {
    // fall through to v2
  }

  // Fallback: v2 (34 provinces)
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
      const rawWards: { code: number; name: string }[] =
        detail.wards ?? detail.communes ?? [];
      const wards: Ward[] = rawWards.map((w) => ({
        code: w.code,
        name: w.name,
        district: "",
      }));
      if (wards.length > 0) {
        cachedWards = wards;
        return wards;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

function removeVietnameseDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
}

export function AddressSelector({
  ward,
  onWardChange,
  onDistrictChange,
  error,
}: AddressSelectorProps) {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cachedWards && cachedWards.length > 0) {
      setWards(cachedWards);
      return;
    }
    setLoading(true);
    fetchHcmcWards()
      .then(setWards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedWardObj = useMemo(() => {
    if (!ward) return null;
    return (
      wards.find(
        (w) =>
          w.name.toLowerCase() === ward.toLowerCase() ||
          `${w.name} (${w.district})`.toLowerCase() === ward.toLowerCase() ||
          `${w.name}, ${w.district}`.toLowerCase() === ward.toLowerCase()
      ) ?? null
    );
  }, [wards, ward]);

  const displayValue = useMemo(() => {
    if (isOpen) return search;
    if (selectedWardObj) {
      return selectedWardObj.district
        ? `${selectedWardObj.name} (${selectedWardObj.district})`
        : selectedWardObj.name;
    }
    return ward || "";
  }, [isOpen, search, selectedWardObj, ward]);

  const filtered = useMemo(() => {
    const q = removeVietnameseDiacritics(search);
    if (!q) return wards;
    return wards.filter((w) => {
      const normWard = removeVietnameseDiacritics(w.name);
      const normDistrict = removeVietnameseDiacritics(w.district);
      const combined = `${normWard} ${normDistrict}`;
      return normWard.includes(q) || normDistrict.includes(q) || combined.includes(q);
    });
  }, [wards, search]);

  const handleSelect = (w: Ward) => {
    onWardChange(w.name);
    onDistrictChange?.(w.district);
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWardChange("");
    onDistrictChange?.("");
    setSearch("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const placeholderText = useMemo(() => {
    if (loading) return "Đang tải dữ liệu phường/xã...";
    if (isOpen && selectedWardObj) {
      return selectedWardObj.district
        ? `${selectedWardObj.name} (${selectedWardObj.district})`
        : selectedWardObj.name;
    }
    return "Tìm hoặc chọn phường / xã...";
  }, [loading, isOpen, selectedWardObj]);

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

      {/* Ward — single unified searchable dropdown */}
      <div className="sm:col-span-2 space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>

        <div ref={containerRef} className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length > 0) {
                    handleSelect(filtered[0]);
                  }
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                }
              }}
              placeholder={placeholderText}
              disabled={loading}
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-white px-3.5 pr-16 text-sm h-10 transition-all",
                "placeholder:text-gray-400 text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                error && "border-red-300 focus:ring-red-400"
              )}
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <>
                  {(ward || search) && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Xóa lựa chọn"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      if (!isOpen) {
                        setIsOpen(true);
                        inputRef.current?.focus();
                      } else {
                        setIsOpen(false);
                        setSearch("");
                      }
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dropdown list */}
          {isOpen && !loading && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl transition-all">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                  Không tìm thấy phường/xã phù hợp
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filtered.map((w) => {
                    const isSelected =
                      ward.toLowerCase() === w.name.toLowerCase() ||
                      ward.toLowerCase() === `${w.name} (${w.district})`.toLowerCase();

                    return (
                      <button
                        key={`${w.code}-${w.district}`}
                        type="button"
                        onClick={() => handleSelect(w)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors",
                          isSelected
                            ? "bg-green-50 text-[#16a34a] font-medium"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isSelected ? "text-[#16a34a]" : "text-gray-400"
                            )}
                          />
                          <span className="truncate">{w.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {w.district && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-normal">
                              {w.district}
                            </span>
                          )}
                          {isSelected && <Check className="h-4 w-4 text-[#16a34a] shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
