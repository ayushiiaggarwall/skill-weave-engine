-- Update a specific order enrollment to paid status for testing
UPDATE order_enrollments 
SET status = 'paid', paid_at = now() 
WHERE user_id = 'c95e39b8-0fc3-42c5-a848-d65d9226caa7' 
  AND course_id = '98687631-3e9b-4c22-84fc-8fd3e7e734f7';