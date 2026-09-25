import { Star, MessageSquare } from 'lucide-react';

/**
 * ProductReviews component.
 * Displays customer reviews returned by DummyJSON with star ratings and reviewer details.
 */
export default function ProductReviews({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={20} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">No Reviews Yet</h4>
        <p className="text-xs text-slate-500">This product has not received any customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Customer Reviews
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev, idx) => {
          const dateStr = rev.date
            ? new Date(rev.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '';

          return (
            <div
              key={`${rev.reviewerEmail || 'review'}-${idx}`}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3"
            >
              {/* Top row: Rating & Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < (rev.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-200'
                      }
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">
                    {rev.rating} / 5
                  </span>
                </div>
                {dateStr && (
                  <span className="text-xs text-slate-400">{dateStr}</span>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-sm text-slate-700 italic">
                &ldquo;{rev.comment || 'No comment provided'}&rdquo;
              </p>

              {/* Reviewer Details */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  {rev.reviewerName || 'Anonymous User'}
                </span>
                {rev.reviewerEmail && (
                  <span className="text-slate-400 truncate max-w-[180px]">
                    {rev.reviewerEmail}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
