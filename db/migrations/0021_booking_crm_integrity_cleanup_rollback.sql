-- Rollback for a no-op migration is also a no-op. 

DO $$
BEGIN
    RAISE NOTICE 'Skipping rollback as no cleanup modifications were performed.';
END $$;
