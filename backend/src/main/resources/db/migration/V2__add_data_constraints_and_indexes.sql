ALTER TABLE users
    ADD CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN'));

ALTER TABLE products
    ADD CONSTRAINT ck_products_price CHECK (price >= 0);
ALTER TABLE products
    ADD CONSTRAINT ck_products_discount_price CHECK (discount_price IS NULL OR discount_price >= 0);
ALTER TABLE products
    ADD CONSTRAINT ck_products_stock_quantity CHECK (stock_quantity >= 0);

ALTER TABLE cart_items
    ADD CONSTRAINT ck_cart_items_quantity CHECK (quantity > 0);

ALTER TABLE orders
    ADD CONSTRAINT ck_orders_status
        CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'));
ALTER TABLE orders
    ADD CONSTRAINT ck_orders_total_amount CHECK (total_amount >= 0);

ALTER TABLE order_items
    ADD CONSTRAINT ck_order_items_quantity CHECK (quantity > 0);
ALTER TABLE order_items
    ADD CONSTRAINT ck_order_items_price CHECK (price >= 0);
ALTER TABLE order_items
    ADD CONSTRAINT ck_order_items_subtotal CHECK (subtotal >= 0);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);
