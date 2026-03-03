-- Add remaining_routes column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS remaining_routes INTEGER DEFAULT 3 NOT NULL;

-- Set existing users to 3 free routes
UPDATE users SET remaining_routes = 3 WHERE remaining_routes IS NULL;

-- Users with active premium/pro subscriptions get unlimited (-1)
UPDATE users 
SET remaining_routes = -1 
WHERE id IN (
    SELECT user_id 
    FROM subscriptions 
    WHERE plan IN ('premium', 'pro') 
    AND status = 'active'
);
