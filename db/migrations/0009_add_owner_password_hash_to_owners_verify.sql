-- Verify password_hash column was added and is correctly restricted matching EF configurations natively
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'owners'
          AND column_name = 'password_hash'
          AND data_type = 'character varying'
          AND character_maximum_length = 255
          AND is_nullable = 'NO'
    ) THEN
        RAISE EXCEPTION 'owners.password_hash column is missing or has incorrect type/length/nullability bounds';
    END IF;
END $$;
