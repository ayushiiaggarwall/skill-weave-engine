-- Add combo pricing fields to pricing_settings table
ALTER TABLE pricing_settings 
ADD COLUMN inr_combo_early_bird integer DEFAULT 9999,
ADD COLUMN inr_combo_regular integer DEFAULT 14999,
ADD COLUMN inr_combo_mrp integer DEFAULT 24999,
ADD COLUMN usd_combo_early_bird integer DEFAULT 199,
ADD COLUMN usd_combo_regular integer DEFAULT 299,
ADD COLUMN usd_combo_mrp integer DEFAULT 499;