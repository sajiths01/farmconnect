import { useEffect, useState } from 'react';
import { Store, Package, TrendingUp, DollarSign, Clock, CheckCircle2, Plus, ArrowLeft, Leaf, AlertCircle } from 'lucide-react';
import type { Page, FarmerApplication, Order, OrderItem, Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime, statusLabel } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface FarmerDashboardPageProps {
  navigate: (page: Page) => void;
}

export function FarmerDashboardPage({ navigate }: FarmerDashboardPageProps) {
  const { show } = useToast();
  const [application, setApplication] = useState<FarmerApplication | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'vegetables' as 'vegetables' | 'fruits',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    image_url: 'https://images.pexels.com/photos/33622710/pexels-photo-33622710.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    is_organic: false,
  });

  useEffect(() => {
    async function loadData() {
      const [appRes, ordersRes, productsRes] = await Promise.all([
        supabase.from('farmer_applications').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      if (appRes.data) setApplication(appRes.data as FarmerApplication);
      if (ordersRes.data) {
        const typedOrders = ordersRes.data as Order[];
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
      }
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAddProduct = async () => {
    if (!application) {
      show('Please submit a farm application first', 'error');
      return;
    }
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity) {
      show('Please fill in all required fields', 'error');
      return;
    }

    // Find shop by matching farm name from application
    const { data: shopData } = await supabase
      .from('shops')
      .select('id')
      .eq('name', application.farm_name)
      .maybeSingle();

    if (!shopData) {
      show('Your shop is not approved yet. Products can be added after approval.', 'error');
      return;
    }

    const { error } = await supabase.from('products').insert({
      shop_id: (shopData as { id: string }).id,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit,
      quantity: parseInt(newProduct.quantity),
      description: newProduct.description.trim(),
      image_url: newProduct.image_url,
      is_organic: newProduct.is_organic,
      harvest_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      show('Could not add product', 'error');
      return;
    }

    show('Product added!', 'success');
    setNewProduct({
      name: '', category: 'vegetables', price: '', unit: 'kg', quantity: '',
      description: '', image_url: 'https://images.pexels.com/photos/33622710/pexels-photo-33622710.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      is_organic: false,
    });
    setShowAddProduct(false);

    // Reload products
    const { data: updatedProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(20);
    if (updatedProducts) setProducts(updatedProducts as Product[]);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 w-48 skeleton rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
  const totalProducts = products.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </button>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-neutral-900">Farmer Dashboard</h1>
          <p className="mt-1 text-neutral-500">
            {application ? `Welcome, ${application.owner_name}!` : 'Manage your farm shop and orders'}
          </p>
        </div>
        {application && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
            application.status === 'approved' ? 'bg-success-50 text-success-700' :
            application.status === 'rejected' ? 'bg-error-50 text-error-700' :
            'bg-secondary-50 text-secondary-700'
          }`}>
            {application.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : 'Pending approval'}
          </span>
        )}
      </div>

      {/* Application status banner */}
      {application && application.status === 'pending' && (
        <div className="mb-6 bg-secondary-50 border border-secondary-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-neutral-800">Your application is under review</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              We're reviewing your farm details for {application.farm_name}. You'll be able to add products once your shop is approved (usually 2-3 business days).
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'primary' },
          { icon: Package, label: 'Total Orders', value: orders.length.toString(), color: 'secondary' },
          { icon: Clock, label: 'Pending Orders', value: pendingOrders.toString(), color: 'accent' },
          { icon: Store, label: 'Products Listed', value: totalProducts.toString(), color: 'primary' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-200/60 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="font-display text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products section */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary-500" />
            Your Products
          </h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {showAddProduct && (
          <div className="p-5 bg-neutral-50 border-b border-neutral-100 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Fresh Tomatoes"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value as 'vegetables' | 'fruits' })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="60"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 no-spinner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Unit</label>
                <select
                  value={newProduct.unit}
                  onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="kg">per kg</option>
                  <option value="bunch">per bunch</option>
                  <option value="dozen">per dozen</option>
                  <option value="piece">per piece</option>
                  <option value="basket">per basket</option>
                  <option value="head">per head</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Available quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  placeholder="50"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 no-spinner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Fresh, organic tomatoes..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setNewProduct({ ...newProduct, is_organic: !newProduct.is_organic })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  newProduct.is_organic
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Organic
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-all"
              >
                Save product
              </button>
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 rounded-lg bg-white text-neutral-600 text-sm font-semibold border border-neutral-200 hover:border-neutral-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No products listed yet.</p>
            <p className="text-sm text-neutral-400 mt-1">Click "Add Product" to list your first produce.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {products.slice(0, 8).map(product => (
              <div key={product.id} className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors">
                <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900">{product.name}</p>
                  <p className="text-xs text-neutral-400 capitalize">{product.category} &middot; {product.quantity} {product.unit} available</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm text-neutral-900">{formatPrice(product.price)}</p>
                  <p className="text-xs text-neutral-400">/{product.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h2 className="font-display text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Recent Orders
          </h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.slice(0, 6).map(order => {
              const items = orderItemsMap[order.id] || [];
              return (
                <div key={order.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm text-neutral-900">{order.customer_name}</p>
                      <p className="text-xs text-neutral-400">{formatDateTime(order.created_at)}</p>
                    </div>
                    <span className="font-display text-lg font-semibold text-primary-700">{formatPrice(Number(order.total))}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {items.map((item, i) => (
                      <span key={i} className="text-xs bg-neutral-100 rounded-lg px-2 py-1 text-neutral-600">
                        {item.product_name} &times; {item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary-600">
                      {statusLabel(order.status)}
                    </span>
                    <span className="text-xs text-neutral-400">&middot; {order.delivery_slot}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
