import { useState } from 'react';
import { ArrowLeft, Trash2, ShoppingBag, Truck, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import type { Page, PaymentMethod } from '@/types';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { formatPrice, DELIVERY_SLOTS, generateOrderId } from '@/lib/utils';

interface CartPageProps {
  navigate: (page: Page) => void;
}

export function CartPage({ navigate }: CartPageProps) {
  const { items, removeItem, updateQuantity, totalAmount, clearCart, shopId } = useCart();
  const { show } = useToast();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'confirmation'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const deliveryFee = totalAmount > 0 ? (totalAmount > 500 ? 0 : 40) : 0;
  const grandTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      show('Please fill in all details', 'error');
      return;
    }
    setPlacing(true);
    try {
      const orderId = generateOrderId();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          delivery_slot: deliverySlot,
          total: grandTotal,
          status: 'confirmed',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: (orderData as { id: string }).id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        unit: item.product.unit,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderRef(orderId);
      setCheckoutStep('confirmation');
      clearCart();
      show('Order placed successfully!', 'success');
    } catch {
      show('Could not place order. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  // Confirmation step
  if (checkoutStep === 'confirmation' && orderRef) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-neutral-900">Order confirmed!</h1>
          <p className="mt-2 text-neutral-500">Your fresh produce is on its way from the farm.</p>
          <div className="mt-6 bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
              <span className="text-sm text-neutral-500">Order reference</span>
              <span className="font-mono font-semibold text-neutral-900">{orderRef}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">Delivery slot</span>
              <span className="font-semibold text-neutral-900 text-sm">{deliverySlot}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">Payment</span>
              <span className="font-semibold text-neutral-900 text-sm">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : 'Card'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
              <span className="text-sm text-neutral-500">Delivery address</span>
              <span className="font-semibold text-neutral-900 text-sm text-right max-w-[60%]">{deliveryAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Total paid</span>
              <span className="font-display text-xl font-semibold text-primary-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate({ name: 'order-tracking', orderId: orderRef })}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 transition-all"
            >
              Track my order
            </button>
            <button
              onClick={() => navigate({ name: 'home' })}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-neutral-700 font-semibold border border-neutral-200 hover:border-primary-300 transition-all"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-neutral-400" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Browse our farms and add some fresh produce!</p>
        <button
          onClick={() => navigate({ name: 'home' })}
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 transition-all"
        >
          Browse farms
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue shopping
      </button>

      <h1 className="font-display text-3xl font-semibold text-neutral-900 mb-6">
        {checkoutStep === 'cart' ? 'Your cart' : 'Checkout'}
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: items or form */}
        <div>
          {checkoutStep === 'cart' && (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.product.id}
                  className="flex gap-4 bg-white rounded-2xl border border-neutral-200/60 p-4 shadow-sm animate-fade-in"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-neutral-900">{item.product.name}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">from {item.shop.name}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-neutral-400 hover:text-error-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-neutral-50 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white text-neutral-700 flex items-center justify-center shadow-sm hover:bg-neutral-100 text-lg leading-none"
                        >
                          &minus;
                        </button>
                        <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.quantity}
                          className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm hover:bg-primary-700 disabled:opacity-40 text-lg leading-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-semibold text-neutral-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <p className="text-xs text-neutral-400">{formatPrice(item.product.price)}/{item.product.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {checkoutStep === 'details' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Delivery details</h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Delivery address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="House number, street, area, city, pincode"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Delivery slot</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DELIVERY_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setDeliverySlot(slot)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            deliverySlot === slot
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Payment method</h3>
                <div className="space-y-2">
                  {[
                    { key: 'cod' as const, label: 'Cash on Delivery', desc: 'Pay when you receive' },
                    { key: 'upi' as const, label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                    { key: 'card' as const, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        paymentMethod === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div>
                        <p className={`font-semibold text-sm ${paymentMethod === key ? 'text-primary-700' : 'text-neutral-900'}`}>{label}</p>
                        <p className="text-xs text-neutral-400">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${paymentMethod === key ? 'border-primary-600 bg-primary-600' : 'border-neutral-300'}`}>
                        {paymentMethod === key && <div className="w-2 h-2 rounded-full bg-white mx-auto mt-[3px]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCheckoutStep('cart')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to cart
              </button>
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div>
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm sticky top-20">
            <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Order summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-semibold text-neutral-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Delivery fee</span>
                <span className="font-semibold text-neutral-900">
                  {deliveryFee === 0 ? <span className="text-primary-600">FREE</span> : formatPrice(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-neutral-400 pt-1">
                  Free delivery on orders above {formatPrice(500)}
                </p>
              )}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-display text-2xl font-semibold text-primary-700">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {shopId && (
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
                <Truck className="w-4 h-4 text-primary-500" />
                <span>Delivery from {items[0]?.shop.name}</span>
              </div>
            )}

            {checkoutStep === 'cart' ? (
              <button
                onClick={() => setCheckoutStep('details')}
                className="mt-5 w-full py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 hover:shadow-md transition-all active:scale-95"
              >
                Proceed to checkout
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-5 w-full py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-60"
              >
                {placing ? 'Placing order...' : `Place order ${formatPrice(grandTotal)}`}
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                24h delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
