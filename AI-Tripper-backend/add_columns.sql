-- Add new columns for user personalization
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_countries JSON;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vacation_types JSON;
ALTER TABLE users ADD COLUMN IF NOT EXISTS travel_style VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_range VARCHAR;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
