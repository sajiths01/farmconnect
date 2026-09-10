export function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
      <div className="h-44 skeleton" />
      <div className="p-4">
        <div className="h-5 w-3/4 skeleton rounded mb-2" />
        <div className="h-4 w-full skeleton rounded mb-1" />
        <div className="h-4 w-2/3 skeleton rounded mb-3" />
        <div className="h-4 w-1/2 skeleton rounded" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
      <div className="h-36 skeleton" />
      <div className="p-3">
        <div className="h-4 w-3/4 skeleton rounded mb-2" />
        <div className="h-3 w-full skeleton rounded mb-1" />
        <div className="h-3 w-1/2 skeleton rounded mb-3" />
        <div className="h-6 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}
