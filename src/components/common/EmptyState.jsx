import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  title = 'No products found',
  description = 'There are currently no products available in the catalog.',
}) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <PackageSearch size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
