-- Verification: 0054_rename_areas_to_projects
DO $$
BEGIN
    IF to_regclass('public.projects') IS NULL THEN
        RAISE EXCEPTION 'Missing public.projects table';
    END IF;

    IF to_regclass('public.areas') IS NOT NULL THEN
        RAISE EXCEPTION 'Retired public.areas table still exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'units'
          AND column_name = 'project_id'
          AND is_nullable = 'NO'
    ) OR EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'units'
          AND column_name = 'area_id'
    ) THEN
        RAISE EXCEPTION 'units project foreign-key column was not renamed correctly';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint constraint_record
        JOIN pg_class source_table ON source_table.oid = constraint_record.conrelid
        JOIN pg_class target_table ON target_table.oid = constraint_record.confrelid
        WHERE constraint_record.conname = 'fk_units_project_id'
          AND source_table.relname = 'units'
          AND target_table.relname = 'projects'
    ) THEN
        RAISE EXCEPTION 'fk_units_project_id does not reference projects';
    END IF;

    IF to_regclass('public.ix_units_project_id') IS NULL
       OR to_regclass('public.ux_projects_name') IS NULL THEN
        RAISE EXCEPTION 'Expected Project indexes are missing';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'owner_portal_units_overview'
          AND column_name = 'project_id'
    ) OR EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'owner_portal_units_overview'
          AND column_name = 'area_id'
    ) THEN
        RAISE EXCEPTION 'Owner portal unit view still exposes the retired area column';
    END IF;

    IF EXISTS (
        SELECT 1 FROM rbac_role_template_permissions
        WHERE permission_key = 'areas:manage'
    ) OR EXISTS (
        SELECT 1 FROM rbac_admin_user_permission_overrides
        WHERE permission_key = 'areas:manage'
    ) THEN
        RAISE EXCEPTION 'Retired areas:manage permission still exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM rbac_role_template_permissions permission
        JOIN rbac_role_templates template
          ON template.id = permission.role_template_id
        WHERE template.name = 'SuperAdmin'
          AND permission.permission_key = 'projects:manage'
    ) THEN
        RAISE EXCEPTION 'SuperAdmin is missing projects:manage';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM projects
        WHERE name ~* '\marea(s)?\M'
           OR description ~* '\marea(s)?\M'
    ) THEN
        RAISE EXCEPTION 'At least one project still exposes the retired Area terminology';
    END IF;
END $$;

SELECT
    (SELECT COUNT(*) FROM projects) AS project_count,
    (SELECT COUNT(*) FROM units WHERE project_id IS NOT NULL) AS linked_unit_count,
    (SELECT COUNT(*) FROM rbac_role_template_permissions
     WHERE permission_key = 'projects:manage') AS template_permission_count,
    (SELECT COUNT(*) FROM rbac_admin_user_permission_overrides
     WHERE permission_key = 'projects:manage') AS override_count;
