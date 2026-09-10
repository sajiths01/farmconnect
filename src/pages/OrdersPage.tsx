import { useEffect, useState } from 'react';
import { Package, ChevronRight, Clock, XCircle } from 'lucide-react';
import type { Order, OrderItem, Page } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { formatPrice, formatDateTime, statusLabel, isCancelable } from '@/lib/utils';

interface OrdersPageProps {
  navigate: (page: Page) => void;
}

export function OrdersPage({ navigate }: OrdersPageProps) {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ordersData) {
        setLoading(false);
        return;
      }

      const typedOrders = ordersData as Order[];
      setOrders(typedOrders);

      if (typedOrders.length > 0) {
        const orderIds = typedOrders.map(o => o.id);
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (itemsData) {
          const map: Record<string, OrderItem[]> = {};
          (itemsData as OrderItem[]).forEach(item => {
            if (!map[item.order_id]) map[item.order_id] = [];
            map[item.order_id].push(item);
          });
          setOrderItemsMap(map);
        }
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-48 skeleton rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5">
          <Package className="w-10 h-10 text-neutral-400" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">No orders yet</h1>
        <p className="mt-2 text-neutral-500">When you place an order, it will appear here.</p>
        <button
          onClick={() => navigate({ name: 'home' })}
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 transition-all"
        >
          Start shopping
        </button>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary-50 text-primary-700';
      case 'packed': return 'bg-secondary-50 text-secondary-700';
      case 'out_for_delivery': return 'bg-accent-50 text-accent-700';
      case 'delivered': return 'bg-success-50 text-success-700';
      case 'cancelled': return 'bg-error-50 text-error-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-semibold text-neutral-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order, i) => {
          const items = orderItemsMap[order.id] || [];

          const handleCancel = async (e: React.MouseEvent) => {
            e.stopPropagation();
            setCancellingId(order.id);
            const { error } = await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', order.id);
            setCancellingId(null);
            if (error) {
              show('Could not cancel order. Please try again.', 'error');
              return;
            }
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } as Order : o));
            show('Order cancelled successfully', 'success');
          };

          return (
            <div
              key={order.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="w-full text-left animate-fade-in-up bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
            >
              <button
                onClick={() => navigate({ name: 'order-tracking', orderId: order.id })}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-neutral-400">{formatDateTime(order.created_at)}</p>
                    <h3 className="font-semibold text-neutral-900 mt-0.5">
                      {items.length} {items.length === 1 ? 'item' : 'items'} &middot; {formatPrice(order.total)}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                    {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-neutral-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-sm font-medium text-neutral-700">{item.product_name}</span>
                      <span className="text-xs text-neutral-400">&times;{item.quantity}</span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <span className="text-xs text-neutral-400">+{items.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <span>{order.delivery_slot}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                    Track order
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {isCancelable(order.status) && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <button
                    onClick={handleCancel}
                    disabled={cancellingId === order.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-error-600 border border-error-200 hover:bg-error-50 transition-all disabled:opacity-50 active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
