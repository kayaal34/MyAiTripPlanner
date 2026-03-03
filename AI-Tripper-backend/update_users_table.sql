-- Add missing columns to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR,
ADD COLUMN IF NOT EXISTS gender VARCHAR,
ADD COLUMN IF NOT EXISTS age_range VARCHAR,
ADD COLUMN IF NOT EXISTS travel_style VARCHAR;

-- Verify columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
