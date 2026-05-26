export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 rounded-lg" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-10 w-72 bg-gray-200 rounded-xl" />
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          {[40, 24, 16, 12, 10].map((w, i) => (
            <div key={i} className={`h-4 w-${w} bg-gray-200 rounded`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="h-10 w-10 bg-gray-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
              <div className="h-3 w-2/5 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
