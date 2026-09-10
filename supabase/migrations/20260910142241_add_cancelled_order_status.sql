/*
# Add "cancelled" order status

1. Modified Tables
- `orders`: ALTER the `status` CHECK constraint to include 'cancelled'
2. Security
- No RLS policy changes
3. Notes
- The old constraint is dropped and replaced with one that includes 'cancelled'
- Existing data is not affected
*/

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'));
