import { CartProvider } from '@/lib/cart';
import { useRouter } from '@/lib/router';
import { ToastProvider } from '@/components/Toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ShopDetailPage } from '@/pages/ShopDetailPage';
import { CartPage } from '@/pages/CartPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { SellOnFarmConnectPage } from '@/pages/SellOnFarmConnectPage';
import { FarmerDashboardPage } from '@/pages/FarmerDashboardPage';

function AppContent() {
  const { page, navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header navigate={navigate} currentPage={page} />
      <main className="flex-1">
        {page.name === 'home' && <HomePage navigate={navigate} />}
        {page.name === 'shop' && <ShopDetailPage shopId={page.shopId} navigate={navigate} />}
        {page.name === 'cart' && <CartPage navigate={navigate} />}
        {page.name === 'orders' && <OrdersPage navigate={navigate} />}
        {page.name === 'order-tracking' && <OrderTrackingPage orderId={page.orderId} navigate={navigate} />}
        {page.name === 'sell' && <SellOnFarmConnectPage navigate={navigate} />}
        {page.name === 'farmer-dashboard' && <FarmerDashboardPage navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ToastProvider>
  );
}
