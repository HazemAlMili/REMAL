-- Rollback: 0054_rename_areas_to_projects
BEGIN;

INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT role_template_id, 'areas:manage', created_at
FROM rbac_role_template_permissions
WHERE permission_key = 'projects:manage'
ON CONFLICT (role_template_id, permission_key) DO NOTHING;

DELETE FROM rbac_role_template_permissions
WHERE permission_key = 'projects:manage';

INSERT INTO rbac_admin_user_permission_overrides
    (admin_user_id, permission_key, modifier_type, created_at, updated_at)
SELECT admin_user_id, 'areas:manage', modifier_type, created_at, updated_at
FROM rbac_admin_user_permission_overrides
WHERE permission_key = 'projects:manage'
ON CONFLICT (admin_user_id, permission_key) DO NOTHING;

DELETE FROM rbac_admin_user_permission_overrides
WHERE permission_key = 'projects:manage';

UPDATE admin_users
SET updated_at = CURRENT_TIMESTAMP;

-- Project names and descriptions intentionally keep the new terminology.
-- Reversing arbitrary user-authored text would corrupt legitimate uses of the
-- word "project" that existed before this migration.

ALTER VIEW owner_portal_units_overview
    RENAME COLUMN project_id TO area_id;

COMMENT ON VIEW owner_portal_units_overview IS
    'Owner Portal read model: non-deleted unit inventory per owner. '
    'Tier 1 read-only view - no availability, booking, or finance data. '
    'Source: units. Scope frozen per DB-OP-01.';

ALTER TABLE units RENAME CONSTRAINT fk_units_project_id TO fk_units_area_id;
ALTER INDEX ix_units_project_id RENAME TO ix_units_area_id;
ALTER TABLE units RENAME COLUMN project_id TO area_id;

ALTER TABLE projects RENAME CONSTRAINT pk_projects TO pk_areas;
ALTER INDEX ux_projects_name RENAME TO ux_areas_name;
ALTER TABLE projects RENAME TO areas;

COMMIT;
