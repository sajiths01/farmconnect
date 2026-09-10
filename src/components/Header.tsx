import { Sprout, ShoppingCart, Package, Store, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import type { Page } from '@/types';
import { useState } from 'react';

interface HeaderProps {
  navigate: (page: Page) => void;
  currentPage: Page;
}

export function Header({ navigate, currentPage }: HeaderProps) {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; page: Page; icon: typeof Package }[] = [
    { label: 'Browse Farms', page: { name: 'home' }, icon: Sprout },
    { label: 'My Orders', page: { name: 'orders' }, icon: Package },
    { label: 'Sell on FarmConnect', page: { name: 'sell' }, icon: Store },
  ];

  const isActive = (itemPage: Page) => {
    if (itemPage.name === 'home' && currentPage.name === 'home') return true;
    if (itemPage.name === 'orders' && (currentPage.name === 'orders' || currentPage.name === 'order-tracking')) return true;
    if (itemPage.name === 'sell' && (currentPage.name === 'sell' || currentPage.name === 'farmer-dashboard')) return true;
    return false;
  };

  const handleNav = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav({ name: 'home' })}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-primary-700 transition-all">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-display text-xl font-semibold text-neutral-900 block leading-none">
                FarmConnect
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
                FARM TO HOME
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, page, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleNav(page)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(page)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav({ name: 'cart' })}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentPage.name === 'cart'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center animate-bounce-subtle">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ label, page, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => handleNav(page)}
                  className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive(page)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
