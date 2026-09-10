import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Star, Leaf, BadgeCheck, Clock, Package, ChevronRight } from 'lucide-react';
import type { Shop, Product, Review, Page } from '@/types';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { StarRating } from '@/components/StarRating';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { timeAgo } from '@/lib/utils';

interface ShopDetailPageProps {
  shopId: string;
  navigate: (page: Page) => void;
}

export function ShopDetailPage({ shopId, navigate }: ShopDetailPageProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetables' | 'fruits'>('all');

  useEffect(() => {
    async function loadShop() {
      setLoading(true);
      const [shopRes, productsRes, reviewsRes] = await Promise.all([
        supabase.from('shops').select('*').eq('id', shopId).maybeSingle(),
        supabase.from('products').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(10),
      ]);
      if (shopRes.data) setShop(shopRes.data as Shop);
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
      setLoading(false);
    }
    loadShop();
  }, [shopId]);

  const filteredProducts = categoryFilter === 'all'
    ? products
    : products.filter(p => p.category === categoryFilter);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-64 skeleton rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-600">Farm not found.</p>
        <button onClick={() => navigate({ name: 'home' })} className="mt-4 text-primary-600 font-semibold">
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate({ name: 'home' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/90 backdrop-blur text-sm font-semibold text-neutral-700 hover:bg-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shop info */}
        <div className="relative -mt-16 bg-white rounded-2xl shadow-lg border border-neutral-200/60 p-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {shop.is_organic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                    <Leaf className="w-3.5 h-3.5" />
                    Organic
                  </span>
                )}
                {shop.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified Farm
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${shop.is_open ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {shop.is_open ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900">{shop.name}</h1>
              <p className="mt-2 text-neutral-600 max-w-2xl leading-relaxed">{shop.description}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <div className="flex items-center gap-2 sm:justify-end">
                <StarRating rating={shop.rating} size="md" showValue />
              </div>
              <p className="text-sm text-neutral-400 mt-1">{shop.review_count} reviews</p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>{shop.location}</span>
              <span className="text-primary-600 font-semibold ml-1">{shop.distance_km} km away</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>{shop.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Package className="w-4 h-4 text-neutral-400" />
              <span>by {shop.owner_name}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-neutral-200">
          {[
            { key: 'products' as const, label: `Produce (${products.length})` },
            { key: 'reviews' as const, label: `Reviews (${reviews.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {activeTab === 'products' && (
          <div className="mt-6">
            {products.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {['all', 'vegetables', 'fruits'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat as typeof categoryFilter)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                      categoryFilter === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No produce available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} shop={shop} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="mt-6">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {reviews.map((review, i) => (
                  <div
                    key={review.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="animate-fade-in-up bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                          {review.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-neutral-900">{review.customer_name}</p>
                          <p className="text-xs text-neutral-400">{timeAgo(review.created_at)}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
