-- Update the gateway check constraint to include PayPal
ALTER TABLE order_enrollments 
DROP CONSTRAINT IF EXISTS order_enrollments_gateway_check;

ALTER TABLE order_enrollments 
ADD CONSTRAINT order_enrollments_gateway_check 
CHECK (gateway IN ('razorpay', 'stripe', 'paypal'));