export type ProduceType = 'vegetables' | 'fruits' | 'both';
export type ProductCategory = 'vegetables' | 'fruits';
export type OrderStatus = 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'upi' | 'card';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  produce_type: ProduceType;
  is_open: boolean;
  is_verified: boolean;
  is_organic: boolean;
  image_url: string;
  rating: number;
  review_count: number;
  distance_km: number;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  quantity: number;
  harvest_date: string | null;
  image_url: string;
  description: string;
  is_organic: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_slot: string;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Review {
  id: string;
  shop_id: string;
  order_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FarmerApplication {
  id: string;
  farm_name: string;
  owner_name: string;
  phone: string;
  location: string;
  produce_type: ProduceType;
  status: ApplicationStatus;
  created_at: string;
}

export interface CartItem {
  product: Product;
  shop: Shop;
  quantity: number;
}

export interface ProductWithShop extends Product {
  shop?: Pick<Shop, 'id' | 'name' | 'location' | 'is_organic' | 'is_verified'>;
}

export type Page =
  | { name: 'home' }
  | { name: 'shop'; shopId: string }
  | { name: 'cart' }
  | { name: 'orders' }
  | { name: 'order-tracking'; orderId: string }
  | { name: 'sell' }
  | { name: 'farmer-dashboard' };
