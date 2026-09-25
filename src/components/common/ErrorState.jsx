import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  message = 'An error occurred while loading products.',
  onRetry,
}) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Unable to load products
      </h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" icon={RefreshCw}>
          Retry Request
        </Button>
      )}
    </div>
  );
}
