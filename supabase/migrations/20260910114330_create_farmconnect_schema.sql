/*
# FarmConnect — Farm-to-Home Marketplace Schema

## Overview
Creates the full database schema for FarmConnect, a platform connecting farmers directly with customers for fresh produce. This is a no-auth (single-tenant) app — anyone can browse, order, and register as a farmer without signing in.

## New Tables

1. **shops** — Farmer digital shops
   - id (uuid PK)
   - name (text) — farm/shop name
   - owner_name (text) — farmer's name
   - phone (text) — contact phone
   - description (text) — shop bio
   - location (text) — human-readable address
   - latitude (numeric) — shop pin latitude
   - longitude (numeric) — shop pin longitude
   - produce_type (text) — 'vegetables', 'fruits', or 'both'
   - is_open (boolean) — shop open/closed status
   - is_verified (boolean) — verification status
   - is_organic (boolean) — organic certification
   - image_url (text) — shop banner image
   - rating (numeric) — average rating (0-5)
   - review_count (int) — number of reviews
   - distance_km (numeric) — distance from customer (for display)
   - created_at (timestamptz)

2. **products** — Produce listings
   - id (uuid PK)
   - shop_id (uuid FK → shops)
   - name (text)
   - category (text) — 'vegetables' or 'fruits'
   - price (numeric) — price per unit
   - unit (text) — 'kg', 'bunch', 'dozen', etc.
   - quantity (int) — available stock
   - harvest_date (date) — when harvested
   - image_url (text)
   - description (text)
   - is_organic (boolean)
   - created_at (timestamptz)

3. **orders** — Customer orders
   - id (uuid PK)
   - customer_name (text)
   - customer_phone (text)
   - delivery_address (text)
   - delivery_slot (text) — selected delivery window
   - total (numeric) — order total
   - status (text) — 'confirmed', 'packed', 'out_for_delivery', 'delivered'
   - payment_method (text)
   - created_at (timestamptz)

4. **order_items** — Items in an order
   - id (uuid PK)
   - order_id (uuid FK → orders)
   - product_id (uuid FK → products)
   - product_name (text) — snapshot at order time
   - quantity (int)
   - price (numeric) — snapshot at order time
   - unit (text)

5. **farmer_applications** — Farmer onboarding applications
   - id (uuid PK)
   - farm_name (text)
   - owner_name (text)
   - phone (text)
   - location (text)
   - produce_type (text)
   - status (text) — 'pending', 'approved', 'rejected'
   - created_at (timestamptz)

6. **reviews** — Shop ratings & reviews
   - id (uuid PK)
   - shop_id (uuid FK → shops)
   - order_id (uuid FK → orders)
   - customer_name (text)
   - rating (int) — 1-5
   - comment (text)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` since this is a no-auth public marketplace.
- All CRUD operations are open to anon + authenticated (data is intentionally shared/public).

## Seed Data
- 6 shops with varied produce types, locations, ratings, and organic certifications
- 20+ products across shops
- Sample reviews for shops
*/

-- ===== SHOPS =====
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL,
  latitude numeric(9,6) NOT NULL DEFAULT 0,
  longitude numeric(9,6) NOT NULL DEFAULT 0,
  produce_type text NOT NULL DEFAULT 'both' CHECK (produce_type IN ('vegetables', 'fruits', 'both')),
  is_open boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT true,
  is_organic boolean NOT NULL DEFAULT false,
  image_url text NOT NULL DEFAULT '',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  distance_km numeric(5,1) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shops" ON shops;
CREATE POLICY "anon_select_shops" ON shops FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shops" ON shops;
CREATE POLICY "anon_insert_shops" ON shops FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shops" ON shops;
CREATE POLICY "anon_update_shops" ON shops FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shops" ON shops;
CREATE POLICY "anon_delete_shops" ON shops FOR DELETE
  TO anon, authenticated USING (true);

-- ===== PRODUCTS =====
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('vegetables', 'fruits')),
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  quantity int NOT NULL DEFAULT 0,
  harvest_date date,
  image_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_organic boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ===== ORDERS =====
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  delivery_slot text NOT NULL,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'packed', 'out_for_delivery', 'delivered')),
  payment_method text NOT NULL DEFAULT 'cod',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ===== ORDER_ITEMS =====
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg'
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

-- ===== FARMER_APPLICATIONS =====
CREATE TABLE IF NOT EXISTS farmer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  produce_type text NOT NULL DEFAULT 'both' CHECK (produce_type IN ('vegetables', 'fruits', 'both')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_farmer_applications" ON farmer_applications;
CREATE POLICY "anon_select_farmer_applications" ON farmer_applications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_farmer_applications" ON farmer_applications;
CREATE POLICY "anon_insert_farmer_applications" ON farmer_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_farmer_applications" ON farmer_applications;
CREATE POLICY "anon_update_farmer_applications" ON farmer_applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_farmer_applications" ON farmer_applications;
CREATE POLICY "anon_delete_farmer_applications" ON farmer_applications FOR DELETE
  TO anon, authenticated USING (true);

-- ===== REVIEWS =====
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ===== SEED DATA =====

-- Shops
INSERT INTO shops (name, owner_name, phone, description, location, latitude, longitude, produce_type, is_open, is_verified, is_organic, image_url, rating, review_count, distance_km) VALUES
('Green Valley Farm', 'Rajesh Patel', '+91 98765 43210', 'Family-run organic farm nestled in the valley, growing seasonal vegetables with sustainable practices passed down three generations.', 'Green Valley, Pune outskirts', 18.5204, 73.8567, 'vegetables', true, true, true, 'https://images.pexels.com/photos/1517195/pexels-photo-1517195.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.80, 127, 3.2),
('Sunrise Orchards', 'Meena Sharma', '+91 98123 45678', 'Orchard specializing in hand-picked seasonal fruits. Our mangoes and guavas are picked at peak ripeness for maximum flavor.', 'Sunrise Hills, Nashik', 19.9975, 73.7898, 'fruits', true, true, false, 'https://images.pexels.com/photos/9914033/pexels-photo-9914033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.65, 89, 5.8),
('Riverside Collective', 'Amit Kumar', '+91 98000 11111', 'A cooperative of 12 small farmers along the river, offering a diverse range of vegetables and fruits grown without synthetic pesticides.', 'Riverside Village, Baramati', 18.1500, 74.5800, 'both', true, true, true, 'https://images.pexels.com/photos/34690874/pexels-photo-34690874.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.90, 203, 7.1),
('Hilltop Greens', 'Sunita Desai', '+91 98765 99999', 'Specializing in leafy greens and herbs grown hydroponically on our hilltop farm. Pesticide-free and harvested daily.', 'Hilltop Road, Lonavala', 18.7546, 73.4062, 'vegetables', true, true, true, 'https://images.pexels.com/photos/11287047/pexels-photo-11287047.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.75, 156, 4.5),
('Golden Harvest Farm', 'Vikram Singh', '+91 98222 33333', 'Traditional farm using modern organic techniques. Known for our heirloom tomatoes and seasonal fruit varieties.', 'Golden Fields, Satara', 17.6805, 74.0183, 'both', true, true, false, 'https://images.pexels.com/photos/20313557/pexels-photo-20313557.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.55, 78, 9.2),
('Earth & Roots Co-op', 'Priya Nair', '+91 98444 55555', 'A women-led cooperative growing root vegetables, tubers, and seasonal fruits with regenerative farming methods.', 'Earth Village, Kolhapur', 16.7050, 74.2433, 'both', false, true, true, 'https://images.pexels.com/photos/33554298/pexels-photo-33554298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.85, 112, 12.3)
ON CONFLICT DO NOTHING;

-- Products for Green Valley Farm (vegetables, organic)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Roma Tomatoes', 'vegetables', 60.00, 'kg', 45, '2026-09-08', 'https://images.pexels.com/photos/14920999/pexels-photo-14920999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Firm, meaty Roma tomatoes perfect for sauces and salads. Vine-ripened.', true),
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Cherry Tomatoes', 'vegetables', 80.00, 'kg', 30, '2026-09-09', 'https://images.pexels.com/photos/14657386/pexels-photo-14657386.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sweet bite-sized cherry tomatoes, great for snacking and salads.', true),
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Fresh Carrots', 'vegetables', 40.00, 'kg', 60, '2026-09-07', 'https://images.pexels.com/photos/38802742/pexels-photo-38802742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sweet, crunchy organic carrots harvested this week.', true),
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Green Lettuce', 'vegetables', 30.00, 'head', 25, '2026-09-09', 'https://images.pexels.com/photos/11287047/pexels-photo-11287047.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Crisp butterhead lettuce, freshly harvested and washed.', true)
ON CONFLICT DO NOTHING;

-- Products for Sunrise Orchards (fruits)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Fresh Apples', 'fruits', 120.00, 'kg', 80, '2026-09-06', 'https://images.pexels.com/photos/6337264/pexels-photo-6337264.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Crisp, juicy apples picked at peak ripeness from our hillside orchard.', false),
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Basket Apples', 'fruits', 350.00, 'basket', 20, '2026-09-06', 'https://images.pexels.com/photos/9602170/pexels-photo-9602170.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A full wicker basket of mixed apple varieties — perfect for families.', false),
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Fresh Strawberries', 'fruits', 150.00, 'basket', 15, '2026-09-09', 'https://images.pexels.com/photos/36646970/pexels-photo-36646970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sweet, ripe strawberries hand-picked this morning.', false),
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Strawberry Basket', 'fruits', 200.00, 'basket', 10, '2026-09-09', 'https://images.pexels.com/photos/17536722/pexels-photo-17536722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Generous basket of field-fresh strawberries from our berry patch.', false)
ON CONFLICT DO NOTHING;

-- Products for Riverside Collective (both, organic)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Mixed Vegetable Basket', 'vegetables', 250.00, 'basket', 30, '2026-09-08', 'https://images.pexels.com/photos/33622710/pexels-photo-33622710.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A curated basket of seasonal vegetables from our 12 cooperative farms.', true),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Fresh Broccoli', 'vegetables', 70.00, 'kg', 20, '2026-09-07', 'https://images.pexels.com/photos/38113691/pexels-photo-38113691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Tender organic broccoli heads, harvested at peak freshness.', true),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Sweet Corn', 'vegetables', 35.00, 'piece', 50, '2026-09-09', 'https://images.pexels.com/photos/24031437/pexels-photo-24031437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Fresh-picked sweet corn, perfect for grilling or boiling.', true),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Ripe Bananas', 'fruits', 50.00, 'dozen', 40, '2026-09-08', 'https://images.pexels.com/photos/47305/bananas-banana-shrub-fruits-yellow-47305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Naturally ripened bananas from our riverside plantation.', true)
ON CONFLICT DO NOTHING;

-- Products for Hilltop Greens (vegetables, organic, hydroponic)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Hilltop Greens'), 'Hydroponic Lettuce', 'vegetables', 35.00, 'head', 40, '2026-09-10', 'https://images.pexels.com/photos/11287049/pexels-photo-11287049.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Pesticide-free hydroponically grown lettuce, crisp and clean.', true),
((SELECT id FROM shops WHERE name = 'Hilltop Greens'), 'Garden Lettuce', 'vegetables', 32.00, 'head', 35, '2026-09-10', 'https://images.pexels.com/photos/11287048/pexels-photo-11287048.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Bright green garden lettuce, harvested daily from our hydroponic beds.', true),
((SELECT id FROM shops WHERE name = 'Hilltop Greens'), 'Cherry Tomato Mix', 'vegetables', 90.00, 'kg', 25, '2026-09-09', 'https://images.pexels.com/photos/18254763/pexels-photo-18254763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Colorful mix of red and yellow cherry tomatoes, extra sweet.', true)
ON CONFLICT DO NOTHING;

-- Products for Golden Harvest Farm (both, non-organic)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Golden Harvest Farm'), 'Heirloom Tomatoes', 'vegetables', 75.00, 'kg', 35, '2026-09-07', 'https://images.pexels.com/photos/36108055/pexels-photo-36108055.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Premium heirloom tomato varieties in a rainbow of colors.', false),
((SELECT id FROM shops WHERE name = 'Golden Harvest Farm'), 'Green Tomatoes', 'vegetables', 45.00, 'kg', 20, '2026-09-08', 'https://images.pexels.com/photos/9893205/pexels-photo-9893205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Firm green tomatoes, perfect for frying or chutneys.', false),
((SELECT id FROM shops WHERE name = 'Golden Harvest Farm'), 'Red Apples', 'fruits', 110.00, 'kg', 60, '2026-09-05', 'https://images.pexels.com/photos/34949143/pexels-photo-34949143.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Classic red apples from our heritage orchard rows.', false),
((SELECT id FROM shops WHERE name = 'Golden Harvest Farm'), 'Single Apple', 'fruits', 25.00, 'piece', 100, '2026-09-05', 'https://images.pexels.com/photos/34949146/pexels-photo-34949146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Individual tree-ripened apples, ideal for a quick healthy snack.', false)
ON CONFLICT DO NOTHING;

-- Products for Earth & Roots Co-op (both, organic)
INSERT INTO products (shop_id, name, category, price, unit, quantity, harvest_date, image_url, description, is_organic) VALUES
((SELECT id FROM shops WHERE name = 'Earth & Roots Co-op'), 'Fresh Carrots', 'vegetables', 45.00, 'kg', 50, '2026-09-08', 'https://images.pexels.com/photos/38802742/pexels-photo-38802742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Regeneratively farmed carrots with tops, sweet and crunchy.', true),
((SELECT id FROM shops WHERE name = 'Earth & Roots Co-op'), 'Market Vegetables', 'vegetables', 180.00, 'basket', 15, '2026-09-08', 'https://images.pexels.com/photos/319798/pexels-photo-319798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A vibrant assortment of seasonal vegetables from our women-led cooperative.', true),
((SELECT id FROM shops WHERE name = 'Earth & Roots Co-op'), 'Fresh Fruits Mix', 'fruits', 220.00, 'basket', 12, '2026-09-07', 'https://images.pexels.com/photos/33329206/pexels-photo-33329206.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A colorful basket of seasonal fruits — apples, bananas, and more.', true),
((SELECT id FROM shops WHERE name = 'Earth & Roots Co-op'), 'Colorful Fruit Basket', 'fruits', 280.00, 'basket', 8, '2026-09-07', 'https://images.pexels.com/photos/15222245/pexels-photo-15222245.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A premium assortment of the freshest seasonal fruits, beautifully arranged.', true)
ON CONFLICT DO NOTHING;

-- Reviews
INSERT INTO reviews (shop_id, customer_name, rating, comment) VALUES
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Ananya R.', 5, 'The tomatoes were incredibly fresh and flavorful. You can taste the difference with organic!'),
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Karthik M.', 5, 'Best carrots I have had in years. Will definitely order again.'),
((SELECT id FROM shops WHERE name = 'Green Valley Farm'), 'Deepa S.', 4, 'Great quality produce, delivery was on time.'),
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Rohan P.', 5, 'The apples are crisp and sweet. My kids love them!'),
((SELECT id FROM shops WHERE name = 'Sunrise Orchards'), 'Lakshmi V.', 4, 'Strawberries were delicious but some were a bit soft.'),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Arjun N.', 5, 'The mixed basket is amazing value. So much variety and everything fresh.'),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Fatima K.', 5, 'Love supporting a cooperative. The broccoli was the freshest I have ever bought.'),
((SELECT id FROM shops WHERE name = 'Riverside Collective'), 'Sanjay G.', 5, 'Excellent quality and great cause. The corn was incredibly sweet.'),
((SELECT id FROM shops WHERE name = 'Hilltop Greens'), 'Meera J.', 5, 'The hydroponic lettuce lasts so much longer than store-bought. Worth every rupee.'),
((SELECT id FROM shops WHERE name = 'Hilltop Greens'), 'Nikhil T.', 4, 'Very fresh greens, wish they had more variety.'),
((SELECT id FROM shops WHERE name = 'Golden Harvest Farm'), 'Pooja D.', 5, 'The heirloom tomatoes are stunning — so many colors and incredible flavor.'),
((SELECT id FROM shops WHERE name = 'Earth & Roots Co-op'), 'Ritu B.', 5, 'Love supporting women farmers. The produce quality is outstanding.')
ON CONFLICT DO NOTHING;