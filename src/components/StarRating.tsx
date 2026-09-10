import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

export function StarRating({ rating, size = 'sm', showValue = false, count }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = Math.max(0, Math.min(1, rating - (n - 1)));
          return (
            <div key={n} className="relative">
              <Star className={`${sizeClass} text-neutral-300`} />
              {fill > 0 && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={`${sizeClass} fill-secondary-400 text-secondary-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`${textClass} font-semibold text-neutral-700`}>{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className={`${textClass} text-neutral-400`}>({count})</span>
      )}
    </div>
  );
}
