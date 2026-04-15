BEGIN;

-- Safely detach the password hash column avoiding schema collisions mapping other owner data elements
ALTER TABLE owners DROP COLUMN IF EXISTS password_hash;

COMMIT;
