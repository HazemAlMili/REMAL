-- ============================================================================
-- Migration: 0053_create_dynamic_rbac
-- Purpose:   Add data-driven admin role templates and per-user overrides.
-- ============================================================================

BEGIN;

CREATE TABLE rbac_role_templates (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP    NOT NULL,
    CONSTRAINT pk_rbac_role_templates PRIMARY KEY (id),
    CONSTRAINT uq_rbac_role_templates_name UNIQUE (name)
);

CREATE TABLE rbac_role_template_permissions (
    role_template_id UUID        NOT NULL,
    permission_key   VARCHAR(50) NOT NULL,
    created_at       TIMESTAMP   NOT NULL,
    CONSTRAINT pk_rbac_role_template_permissions
        PRIMARY KEY (role_template_id, permission_key),
    CONSTRAINT fk_rbac_role_template_permissions_role_template_id
        FOREIGN KEY (role_template_id)
        REFERENCES rbac_role_templates (id)
        ON DELETE CASCADE
);

CREATE TABLE rbac_admin_user_permission_overrides (
    admin_user_id UUID        NOT NULL,
    permission_key VARCHAR(50) NOT NULL,
    modifier_type  VARCHAR(10) NOT NULL,
    created_at     TIMESTAMP   NOT NULL,
    updated_at     TIMESTAMP   NOT NULL,
    CONSTRAINT pk_rbac_admin_user_permission_overrides
        PRIMARY KEY (admin_user_id, permission_key),
    CONSTRAINT fk_rbac_admin_user_permission_overrides_admin_user_id
        FOREIGN KEY (admin_user_id)
        REFERENCES admin_users (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_rbac_admin_user_permission_overrides_modifier_type
        CHECK (modifier_type IN ('grant', 'deny'))
);

ALTER TABLE admin_users
    ADD COLUMN role_template_id UUID NULL;

ALTER TABLE admin_users
    ADD CONSTRAINT fk_admin_users_role_template_id
    FOREIGN KEY (role_template_id)
    REFERENCES rbac_role_templates (id)
    ON DELETE RESTRICT;

CREATE INDEX ix_admin_users_role_template_id
    ON admin_users (role_template_id);

INSERT INTO rbac_role_templates
    (id, name, description, is_system, is_active, created_at, updated_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'SuperAdmin', 'Full platform administration.', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000002', 'Sales', 'CRM, booking, client, and inventory read access.', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000003', 'Finance', 'Finance operations and reporting access.', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10000000-0000-0000-0000-000000000004', 'Tech', 'Inventory and analytics read access.', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT '10000000-0000-0000-0000-000000000001'::uuid, permission_key, CURRENT_TIMESTAMP
FROM unnest(ARRAY[
    'crm:read', 'crm:write', 'crm:assign',
    'bookings:read', 'bookings:write',
    'finance:overview', 'finance:manage', 'finance:payouts',
    'units:read', 'units:manage',
    'owners:read', 'owners:manage',
    'clients:read', 'clients:write', 'clients:reset_password',
    'reviews:moderate', 'areas:manage', 'amenities:manage',
    'analytics:read', 'settings:admin'
]) AS permission_key;

INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT '10000000-0000-0000-0000-000000000002'::uuid, permission_key, CURRENT_TIMESTAMP
FROM unnest(ARRAY[
    'crm:read', 'crm:write', 'crm:assign',
    'bookings:read', 'bookings:write',
    'reviews:moderate',
    'clients:read', 'clients:write',
    'owners:read', 'units:read', 'analytics:read'
]) AS permission_key;

INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT '10000000-0000-0000-0000-000000000003'::uuid, permission_key, CURRENT_TIMESTAMP
FROM unnest(ARRAY[
    'finance:overview', 'finance:manage', 'finance:payouts',
    'bookings:read', 'clients:read', 'owners:read', 'analytics:read'
]) AS permission_key;

INSERT INTO rbac_role_template_permissions
    (role_template_id, permission_key, created_at)
SELECT '10000000-0000-0000-0000-000000000004'::uuid, permission_key, CURRENT_TIMESTAMP
FROM unnest(ARRAY['units:read', 'analytics:read']) AS permission_key;

UPDATE admin_users
SET role_template_id = CASE role
    WHEN 'super_admin' THEN '10000000-0000-0000-0000-000000000001'::uuid
    WHEN 'sales'       THEN '10000000-0000-0000-0000-000000000002'::uuid
    WHEN 'finance'     THEN '10000000-0000-0000-0000-000000000003'::uuid
    WHEN 'tech'        THEN '10000000-0000-0000-0000-000000000004'::uuid
END;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM admin_users WHERE role_template_id IS NULL) THEN
        RAISE EXCEPTION 'RBAC backfill failed: at least one admin role has no system template mapping';
    END IF;
END $$;

ALTER TABLE admin_users
    ALTER COLUMN role_template_id SET NOT NULL;

ALTER TABLE admin_users
    DROP CONSTRAINT ck_admin_users_role;

ALTER TABLE admin_users
    ALTER COLUMN role DROP NOT NULL;

COMMIT;
