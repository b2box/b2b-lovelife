-- Rename China exchange rate column from CNY to CNY to CNY to USD for global buyers
ALTER TABLE pricing_settings 
RENAME COLUMN cn_cny_to_cny TO cn_cny_to_usd;