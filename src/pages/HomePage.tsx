import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Leaf, Truck, Clock, ShieldCheck, Sprout, TrendingUp, ChevronRight, ShoppingCart } from 'lucide-react';
import type { Shop, Product, Page } from '@/types';
import { supabase } from '@/lib/supabase';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import { ShopCardSkeleton, ProductCardSkeleton } from '@/components/Skeletons';

interface HomePageProps {
  navigate: (page: Page) => void;
}

type FilterType = 'all' | 'vegetables' | 'fruits' | 'organic' | 'open_now';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Farms' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'fruits', label: 'Fruits' },
  { key: 'organic', label: 'Organic' },
  { key: 'open_now', label: 'Open Now' },
];

export function HomePage({ navigate }: HomePageProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'newest'>('distance');

  useEffect(() => {
    async function loadData() {
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from('shops').select('*').order('distance_km', { ascending: true }),
        supabase.from('products').select('*').limit(8),
      ]);
      if (shopsRes.data) setShops(shopsRes.data as Shop[]);
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (activeFilter === 'vegetables') {
      result = result.filter(s => s.produce_type === 'vegetables' || s.produce_type === 'both');
    } else if (activeFilter === 'fruits') {
      result = result.filter(s => s.produce_type === 'fruits' || s.produce_type === 'both');
    } else if (activeFilter === 'organic') {
      result = result.filter(s => s.is_organic);
    } else if (activeFilter === 'open_now') {
      result = result.filter(s => s.is_open);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.owner_name.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => a.distance_km - b.distance_km);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [shops, activeFilter, searchQuery, sortBy]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 25c-10 0-20 5-20 15h40c0-10-10-15-20-15z" fill="%2316a34a" /%3E%3C/svg%3E")',
          backgroundSize: '120px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-5">
                <Sprout className="w-4 h-4" />
                Farm-to-home in 24 hours
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.1]">
                Fresh from the farm,
                <br />
                <span className="text-primary-600">straight to your door.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 leading-relaxed max-w-lg">
                Order fresh, organic produce directly from local farmers. No middlemen, no cold storage — just real food from real farms.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('shops-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 hover:shadow-md transition-all active:scale-95"
                >
                  Browse Farms
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate({ name: 'sell' })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-neutral-700 font-semibold border border-neutral-200 hover:border-primary-300 hover:text-primary-700 transition-all"
                >
                  Sell your produce
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['R', 'M', 'A', 'S'].map((initial, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: ['#16a34a', '#f59e0b', '#ea580c', '#15803d'][i] }}
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <span><span className="font-semibold text-neutral-700">2,400+</span> happy customers</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1517195/pexels-photo-1517195.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Fresh farm produce"
                  className="w-full h-[320px] sm:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-neutral-900">100%</p>
                    <p className="text-xs text-neutral-500">Organic options</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-neutral-900">24h</p>
                    <p className="text-xs text-neutral-500">Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-neutral-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Farm-to-Home Delivery', desc: 'Within 24 hours of harvest' },
              { icon: ShieldCheck, title: 'Verified Farmers', desc: 'Every farm is quality-checked' },
              { icon: Leaf, title: 'Organic Options', desc: 'Pesticide-free produce' },
              { icon: TrendingUp, title: 'Fair Prices', desc: 'No middlemen markups' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{title}</p>
                  <p className="text-xs text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900">
              Fresh picks for you
            </h2>
            <p className="mt-1 text-neutral-500">Recently harvested produce from nearby farms</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => {
                const shop = shops.find(s => s.id === product.shop_id);
                return <ProductCard key={product.id} product={product} shop={shop} index={i} />;
              })}
        </div>
      </section>

      {/* Shops section */}
      <section id="shops-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900">
              Browse farms near you
            </h2>
            <p className="mt-1 text-neutral-500">Discover fresh produce from {shops.length || '6'} verified farms</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by farm name, location, or produce..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 cursor-pointer"
              >
                <option value="distance">Nearest first</option>
                <option value="rating">Top rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTERS.map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeFilter === filter.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium">No farms match your search</p>
            <p className="text-sm text-neutral-400 mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShops.map((shop, i) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                index={i}
                onClick={() => navigate({ name: 'shop', shopId: shop.id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 border border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 text-center mb-10">
            How FarmConnect works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Search, title: 'Browse & Choose', desc: 'Explore verified farms near you and pick the produce you want.' },
              { step: '02', icon: ShoppingCart, title: 'Place Your Order', desc: 'Add items to cart, choose a delivery slot, and place your order in minutes.' },
              { step: '03', icon: Clock, title: 'Farm-to-Home Delivery', desc: 'Your produce is harvested fresh and delivered to your door within 24 hours.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative bg-white rounded-2xl p-6 border border-neutral-200/60 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="font-display text-3xl font-semibold text-neutral-200">{step}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


