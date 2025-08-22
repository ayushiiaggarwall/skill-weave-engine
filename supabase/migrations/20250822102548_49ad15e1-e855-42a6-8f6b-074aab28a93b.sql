-- Update the payment status for the user who has paid
UPDATE order_enrollments 
SET status = 'paid', updated_at = now()
WHERE user_email = 'ayushiaggarwal030@gmail.com' 
AND order_id = 'order_R8LCUZchUAVV0a';