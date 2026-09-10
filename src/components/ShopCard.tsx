import { Star, MapPin, BadgeCheck, Leaf, Clock } from 'lucide-react';
import type { Shop } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ShopCardProps {
  shop: Shop;
  onClick: () => void;
  index?: number;
}

export function ShopCard({ shop, onClick, index = 0 }: ShopCardProps) {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group text-left animate-fade-in-up bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-xl hover:border-primary-300/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={shop.image_url}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {shop.is_organic && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold shadow-sm">
              <Leaf className="w-3 h-3" />
              Organic
            </span>
          )}
          {shop.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-primary-700 text-xs font-semibold shadow-sm">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
        {!shop.is_open && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-900/80 text-white text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Closed
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-neutral-900 leading-tight group-hover:text-primary-700 transition-colors">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />
            <span className="text-sm font-semibold text-neutral-700">{shop.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({shop.review_count})</span>
          </div>
        </div>

        <p className="mt-1 text-sm text-neutral-500 line-clamp-1">{shop.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span className="line-clamp-1">{shop.location}</span>
          </div>
          <span className="text-sm font-semibold text-primary-600 shrink-0 ml-2">
            {shop.distance_km} km
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            by {shop.owner_name}
          </span>
          <span className="text-sm font-semibold text-neutral-700">
            from {formatPrice(30)}
          </span>
        </div>
      </div>
    </button>
  );
}
