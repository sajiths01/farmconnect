import { Sprout, Heart, Mail, Phone, MapPin } from 'lucide-react';
import type { Page } from '@/types';

interface FooterProps {
  navigate: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="mt-20 bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-white">FarmConnect</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Connecting farmers and customers for fresh, organic produce delivered farm-to-home.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary-400 transition-colors">
                  Browse Farms
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ name: 'orders' })} className="hover:text-primary-400 transition-colors">
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ name: 'sell' })} className="hover:text-primary-400 transition-colors">
                  Sell on FarmConnect
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                hello@farmconnect.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                +91 1800 123 4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                Pune, Maharashtra
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-4">Our Mission</h4>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Empowering local farmers with fair prices and bringing fresh, healthy produce to every home.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-400">
              <Heart className="w-4 h-4 fill-primary-400" />
              <span>Made with care for our farmers</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            &copy; 2026 FarmConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
