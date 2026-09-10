import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Package, Truck, Home, MapPin, Clock, Phone, ShoppingBag, XCircle } from 'lucide-react';
import type { Order, OrderItem, Page } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { formatPrice, formatDateTime, ORDER_STATUS_STEPS, isCancelable, statusLabel } from '@/lib/utils';

interface OrderTrackingPageProps {
  orderId: string;
  navigate: (page: Page) => void;
}

const STATUS_ICONS: Record<string, typeof Package> = {
  confirmed: CheckCircle2,
  packed: Package,
  out_for_delivery: Truck,
  delivered: Home,
};

export function OrderTrackingPage({ orderId, navigate }: OrderTrackingPageProps) {
  const { show } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', orderId),
      ]);
      if (orderRes.data) setOrder(orderRes.data as Order);
      if (itemsRes.data) setItems(itemsRes.data as OrderItem[]);
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-32 skeleton rounded mb-6" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-600">Order not found.</p>
        <button onClick={() => navigate({ name: 'orders' })} className="mt-4 text-primary-600 font-semibold">
          Back to orders
        </button>
      </div>
    );
  }

  const currentStepIndex = ORDER_STATUS_STEPS.findIndex(s => s.key === order.status);
  const estimatedDelivery = order.delivery_slot;
  const isCancelled = order.status === 'cancelled';

  const handleCancel = async () => {
    setCancelling(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    setCancelling(false);
    if (error) {
      show('Could not cancel order. Please try again.', 'error');
      return;
    }
    setOrder({ ...order, status: 'cancelled' });
    show('Order cancelled successfully', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate({ name: 'orders' })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-neutral-500 font-medium">Order placed</p>
              <p className="font-semibold text-neutral-900">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 font-medium">Total</p>
              <p className="font-display text-xl font-semibold text-primary-700">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Status tracker */}
        <div className="p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-900 mb-1">Order status</h2>
          <p className="text-sm text-neutral-500 mb-6">
            {isCancelled
              ? 'This order has been cancelled.'
              : order.status === 'delivered'
              ? 'Your order has been delivered. Enjoy your fresh produce!'
              : `Estimated delivery: ${estimatedDelivery}`}
          </p>

          {isCancelled ? (
            <div className="flex items-center gap-3 bg-error-50 rounded-xl p-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-error-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-error-700">Order Cancelled</p>
                <p className="text-xs text-error-500 mt-0.5">This order was cancelled and will not be delivered.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
            {ORDER_STATUS_STEPS.map((step, i) => {
              const isComplete = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = STATUS_ICONS[step.key] || CheckCircle2;
              const isLast = i === ORDER_STATUS_STEPS.length - 1;

              return (
                <div key={step.key} className="flex gap-4 pb-8 last:pb-0 relative">
                  {!isLast && (
                    <div
                      className={`absolute left-[18px] top-10 bottom-0 w-0.5 ${isComplete ? 'bg-primary-500' : 'bg-neutral-200'}`}
                      style={{ height: 'calc(100% - 40px)' }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isComplete
                        ? 'bg-primary-600 text-white'
                        : isCurrent
                        ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-50'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <p
                      className={`font-semibold text-sm ${
                        isComplete || isCurrent ? 'text-neutral-900' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-primary-600 mt-0.5 animate-fade-in">
                        {step.key === 'confirmed' && 'Your order has been confirmed by the farmer.'}
                        {step.key === 'packed' && 'Your produce is being freshly harvested and packed.'}
                        {step.key === 'out_for_delivery' && 'Your order is on its way to your address.'}
                        {step.key === 'delivered' && 'Delivered successfully. Enjoy!'}
                      </p>
                    )}
                    {isComplete && (
                      <p className="text-xs text-neutral-400 mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="px-6 pb-6">
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-neutral-500">Delivery address</p>
                <p className="text-sm text-neutral-800">{order.delivery_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-neutral-500">Delivery slot</p>
                <p className="text-sm text-neutral-800">{order.delivery_slot}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-neutral-500">Contact</p>
                <p className="text-sm text-neutral-800">{order.customer_name} &middot; {order.customer_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 pb-6">
          <h3 className="font-display text-base font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-400" />
            Items in this order
          </h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{item.product_name}</p>
                  <p className="text-xs text-neutral-400">{item.quantity} &times; {formatPrice(item.price)}/{item.unit}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="font-semibold text-neutral-900">Total</span>
            <span className="font-display text-lg font-semibold text-primary-700">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {isCancelable(order.status) && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-4 w-full py-3 rounded-xl bg-white text-error-600 font-semibold border border-error-200 hover:bg-error-50 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {cancelling ? 'Cancelling...' : 'Cancel this order'}
        </button>
      )}

      <button
        onClick={() => navigate({ name: 'home' })}
        className="mt-4 w-full py-3 rounded-xl bg-white text-neutral-700 font-semibold border border-neutral-200 hover:border-primary-300 hover:text-primary-700 transition-all"
      >
        Continue shopping
      </button>
    </div>
  );
}
