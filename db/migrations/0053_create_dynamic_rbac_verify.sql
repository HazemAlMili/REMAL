-- Verification: 0053_create_dynamic_rbac
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    SELECT ARRAY_AGG(expected.table_name)
    INTO missing_tables
    FROM (VALUES
        ('rbac_role_templates'),
        ('rbac_role_template_permissions'),
        ('rbac_admin_user_permission_overrides')
    ) AS expected(table_name)
    WHERE to_regclass('public.' || expected.table_name) IS NULL;

    IF missing_tables IS NOT NULL THEN
        RAISE EXCEPTION 'Missing RBAC tables: %', array_to_string(missing_tables, ', ');
    END IF;

    IF EXISTS (SELECT 1 FROM admin_users WHERE role_template_id IS NULL) THEN
        RAISE EXCEPTION 'At least one admin user has no role template';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM admin_users AS admin
        JOIN rbac_role_templates AS template ON template.id = admin.role_template_id
        WHERE (admin.role = 'super_admin' AND template.name <> 'SuperAdmin')
           OR (admin.role = 'sales' AND template.name <> 'Sales')
           OR (admin.role = 'finance' AND template.name <> 'Finance')
           OR (admin.role = 'tech' AND template.name <> 'Tech')
    ) THEN
        RAISE EXCEPTION 'At least one legacy admin role was backfilled to the wrong role template';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (VALUES
            ('SuperAdmin', 20),
            ('Sales', 11),
            ('Finance', 7),
            ('Tech', 2)
        ) AS expected(name, permission_count)
        LEFT JOIN rbac_role_templates AS template
            ON template.name = expected.name AND template.is_system = TRUE
        LEFT JOIN rbac_role_template_permissions AS permission
            ON permission.role_template_id = template.id
        GROUP BY expected.name, expected.permission_count, template.id
        HAVING template.id IS NULL OR COUNT(permission.permission_key) <> expected.permission_count
    ) THEN
        RAISE EXCEPTION 'One or more system role templates have an unexpected permission count';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM rbac_role_template_permissions
        WHERE permission_key NOT IN (
            'crm:read', 'crm:write', 'crm:assign',
            'bookings:read', 'bookings:write',
            'finance:overview', 'finance:manage', 'finance:payouts',
            'units:read', 'units:manage',
            'owners:read', 'owners:manage',
            'clients:read', 'clients:write', 'clients:reset_password',
            'reviews:moderate', 'projects:manage', 'amenities:manage',
            'analytics:read', 'settings:admin'
        )
    ) THEN
        RAISE EXCEPTION 'Unknown permission key found in a system role template';
    END IF;
END $$;

SELECT
    template.name,
    template.is_system,
    COUNT(DISTINCT permission.permission_key) AS permission_count,
    COUNT(DISTINCT admin.id) AS assigned_user_count
FROM rbac_role_templates AS template
LEFT JOIN rbac_role_template_permissions AS permission
    ON permission.role_template_id = template.id
LEFT JOIN admin_users AS admin
    ON admin.role_template_id = template.id
GROUP BY template.id, template.name, template.is_system
ORDER BY template.is_system DESC, template.name;
