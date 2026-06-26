-- ============================================================================
-- Migration: 0054_rename_areas_to_projects
-- Purpose:   Rename the Area domain to Project without replacing or copying data.
-- Depends:   0010_create_units, 0027_create_owner_portal_units_overview_view,
--            0053_create_dynamic_rbac
-- ============================================================================

BEGIN;

DO $$
BEGIN
    IF to_regclass('public.areas') IS NULL THEN
        RAISE EXCEPTION 'Expected source table public.areas does not exist';
    END IF;

    IF to_regclass('public.projects') IS NOT NULL THEN
        RAISE EXCEPTION 'Target table public.projects already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'units'
          AND column_name = 'area_id'
    ) THEN
        RAISE EXCEPTION 'Expected source column public.units.area_id does not exist';
    END IF;
END $$;

ALTER TABLE areas RENAME TO projects;
ALTER TABLE projects RENAME CONSTRAINT pk_areas TO pk_projects;
ALTER INDEX ux_areas_name RENAME TO ux_projects_name;

-- Existing seed or operator-entered labels can still expose the retired domain
-- word. Abort before the update if normalizing those names would create a
-- duplicate under the case-insensitive service contract.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM projects
        GROUP BY lower(
            regexp_replace(
                regexp_replace(name, '\mareas\M', 'projects', 'gi'),
                '\marea\M', 'project', 'gi'))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Project terminology migration would create duplicate project names';
    END IF;
END $$;

UPDATE projects
SET name = regexp_replace(
        regexp_replace(
            regexp_replace(
                regexp_replace(name, '\mAREAS\M', 'PROJECTS', 'g'),
                '\mAREA\M', 'PROJECT', 'g'),
            '\mAreas\M', 'Projects', 'g'),
        '\mArea\M', 'Project', 'g'),
    description = CASE
        WHEN description IS NULL THEN NULL
        ELSE regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(description, '\mAREAS\M', 'PROJECTS', 'g'),
                    '\mAREA\M', 'PROJECT', 'g'),
                '\mAreas\M', 'Projects', 'g'),
            '\mArea\M', 'Project', 'g')
    END;

UPDATE projects
SET name = regexp_replace(
        regexp_replace(name, '\mareas\M', 'projects', 'gi'),
        '\marea\M', 'project', 'gi'),
    description = CASE
        WHEN description IS NULL THEN NULL
        ELSE regexp_replace(
            regexp_replace(description, '\mareas\M', 'projects', 'gi'),
            '\marea\M', 'project', 'gi')
    END;

ALTER TABLE units RENAME COLUMN area_id TO project_id;
ALTER TABLE units RENAME CONSTRAINT fk_units_area_id TO fk_units_project_id;
ALTER INDEX ix_units_area_id RENAME TO ix_units_project_id;

ALTER VIEW owner_portal_units_overview
    RENAME COLUMN area_id TO project_id;

COMMENT ON VIEW owner_portal_units_overview IS
    'Owner Portal read model: non-deleted unit inventory per owner. '
    'Each unit references its resort project through project_id. '
    'Source: units. Scope frozen per DB-OP-01.';

-- Permission keys are persisted data and must move with the application policy.
INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT role_template_id, 'projects:manage', created_at
FROM rbac_role_template_permissions
WHERE permission_key = 'areas:manage'
ON CONFLICT (role_template_id, permission_key) DO NOTHING;

DELETE FROM rbac_role_template_permissions
WHERE permission_key = 'areas:manage';

INSERT INTO rbac_admin_user_permission_overrides
    (admin_user_id, permission_key, modifier_type, created_at, updated_at)
SELECT admin_user_id, 'projects:manage', modifier_type, created_at, updated_at
FROM rbac_admin_user_permission_overrides
WHERE permission_key = 'areas:manage'
ON CONFLICT (admin_user_id, permission_key) DO NOTHING;

DELETE FROM rbac_admin_user_permission_overrides
WHERE permission_key = 'areas:manage';

-- Existing JWTs can contain the retired permission key. Force all admin sessions
-- through the normal token-stamp validation path after this vocabulary change.
UPDATE admin_users
SET updated_at = CURRENT_TIMESTAMP;

COMMIT;
