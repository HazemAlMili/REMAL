BEGIN;

-- Add the column with a default placeholder hash to satisfy the NOT NULL constraint for any existing dev/seed records
-- A standard bypass strategy is to assign a hardcoded placeholder to existing seeded logic, preventing constraint breaches locally.
ALTER TABLE owners ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '$2a$11$devplaceholderhash1234567890123456';

-- Drop the default immediately so future inserts enforce explicit hash assignments.
ALTER TABLE owners ALTER COLUMN password_hash DROP DEFAULT;

-- Attach documentation tracing resolving DB/EF structural gaps
COMMENT ON COLUMN owners.password_hash IS 'Stores hashed owner passwords. Backfilled with placeholder mapping on migration for any existing seeded rows to satisfy non-null bounds.';

COMMIT;
