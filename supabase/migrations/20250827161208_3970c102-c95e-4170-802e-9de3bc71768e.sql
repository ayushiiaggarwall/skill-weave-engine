-- Update the course that has null early_bird_end_date to have a proper end date
-- Setting it to a future date for demonstration (you can change this in the admin panel)
UPDATE course_pricing 
SET early_bird_end_date = '2025-09-10 23:59:59+00'
WHERE course_id = '98687631-3e9b-4c22-84fc-8fd3e7e734f7' 
AND early_bird_end_date IS NULL;