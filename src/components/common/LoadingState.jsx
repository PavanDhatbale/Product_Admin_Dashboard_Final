export default function LoadingState() {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="w-full animate-pulse" aria-label="Loading products">
      {/* Desktop Skeleton Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-12 gap-4">
          <div className="col-span-4 h-4 bg-slate-200 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-200 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-200 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-200 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {skeletonRows.map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0"></div>
                <div className="space-y-1.5 w-full">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-slate-200 rounded w-12"></div>
              </div>
              <div className="col-span-2">
                <div className="h-5 bg-slate-200 rounded-md w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Skeleton Cards */}
      <div className="block md:hidden space-y-3">
        {skeletonRows.slice(0, 4).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-5 bg-slate-200 rounded-md w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
