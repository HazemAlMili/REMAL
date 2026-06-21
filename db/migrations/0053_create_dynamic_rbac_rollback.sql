-- Rollback: 0053_create_dynamic_rbac
BEGIN;

UPDATE admin_users AS admin
SET role = CASE template.name
    WHEN 'SuperAdmin' THEN 'super_admin'
    WHEN 'Sales'      THEN 'sales'
    WHEN 'Finance'    THEN 'finance'
    WHEN 'Tech'       THEN 'tech'
    ELSE admin.role
END
FROM rbac_role_templates AS template
WHERE template.id = admin.role_template_id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM admin_users
        WHERE role IS NULL
           OR role NOT IN ('super_admin', 'sales', 'finance', 'tech')
    ) THEN
        RAISE EXCEPTION 'Cannot roll back RBAC while admins are assigned to custom roles; reassign them first';
    END IF;
END $$;

ALTER TABLE admin_users
    ALTER COLUMN role SET NOT NULL;

ALTER TABLE admin_users
    ADD CONSTRAINT ck_admin_users_role
    CHECK (role IN ('super_admin', 'sales', 'finance', 'tech'));

DROP INDEX ix_admin_users_role_template_id;

ALTER TABLE admin_users
    DROP CONSTRAINT fk_admin_users_role_template_id,
    DROP COLUMN role_template_id;

DROP TABLE rbac_admin_user_permission_overrides;
DROP TABLE rbac_role_template_permissions;
DROP TABLE rbac_role_templates;

COMMIT;
