import { Plus, Check, Leaf } from 'lucide-react';
import type { Product, Shop } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  shop?: Shop;
  index?: number;
}

export function ProductCard({ product, shop, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCart();
  const cartItem = items.find(item => item.product.id === product.id);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAdd = () => {
    if (shop) {
      addItem(product, shop);
    }
  };

  const inStock = product.quantity > 0;

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="group animate-fade-in-up bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
    >
      <div className="relative h-36 overflow-hidden bg-neutral-100">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={product.image_url}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {product.is_organic && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs font-semibold shadow-sm">
            <Leaf className="w-3 h-3" />
            Organic
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-neutral-600">Out of stock</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-sm text-neutral-900 line-clamp-1">{product.name}</h4>
        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{product.description}</p>

        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            Harvested {formatDate(product.harvest_date)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <span className="font-display text-lg font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-neutral-400 ml-1">/{product.unit}</span>
          </div>

          {cartItem ? (
            <div className="flex items-center gap-1.5 bg-primary-50 rounded-full p-1">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-full bg-white text-primary-700 flex items-center justify-center shadow-sm hover:bg-primary-100 transition-colors text-lg leading-none"
              >
                &minus;
              </button>
              <span className="font-semibold text-sm text-primary-700 w-5 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                disabled={cartItem.quantity >= product.quantity}
                className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
