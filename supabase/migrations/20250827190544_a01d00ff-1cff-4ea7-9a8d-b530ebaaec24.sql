-- Update order enrollment to paid status for testing
UPDATE order_enrollments 
SET status = 'paid'::payment_status, updated_at = now()
WHERE id = '57fd5f87-5425-456f-ad55-da23929221e6';