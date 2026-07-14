const rolesPermissions = {

  // =====================================
  // SUPER ADMIN
  // contrôle total plateforme SaaS
  // =====================================
  super_admin: [

    '*',

    // SAAS
    'saas.read',
    'saas.create',
    'saas.update',
    'saas.delete',

    // AGENCIES
    'agencies.create',
    'agencies.read',
    'agencies.update',
    'agencies.delete',

    // USERS
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.status',

    // DASHBOARD
    'dashboard.read',

    // AUDIT LOGS
    'audit.read',

    // STATISTICS
    'statistics.read',

    // SUBSCRIPTIONS
    'subscriptions.read',
    'subscriptions.create',
    'subscriptions.update',
    'subscriptions.delete',

    // SETTINGS
    'settings.read',
    'settings.update'
  ],


  // =====================================
  // ADMIN (Agence)
  // =====================================
  admin: [

    // USERS
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.status',

    // BUILDINGS
    'buildings.create',
    'buildings.read',
    'buildings.update',
    'buildings.delete',

    // APARTMENTS
    'apartments.create',
    'apartments.read',
    'apartments.update',
    'apartments.delete',

    // TENANTS
    'tenants.create',
    'tenants.read',
    'tenants.update',
    'tenants.delete',

    // PAYMENTS
    'payments.create',
    'payments.read',
    'payments.pay',
    'payments.delete',

    // CONTRACTS
    'contracts.create',
    'contracts.read',
    'contracts.update',
    'contracts.delete',

    // DASHBOARD
    'dashboard.read',

    // NOTIFICATIONS
    'notifications.read'
  ],


  // =====================================
  // MANAGER
  // =====================================
  manager: [

    'users.read',
    'users.update',

    'buildings.read',

    'apartments.read',

    'tenants.read',

    'payments.read',

    'dashboard.read'
  ],


  // =====================================
  // AGENT IMMOBILIER
  // =====================================
  agent: [

    'users.read',

    'buildings.read',

    'apartments.read',

    'tenants.read',

    'dashboard.read'
  ],


  // =====================================
  // LOCATAIRE
  // =====================================
  tenant: [

    'profile.read',
    'profile.update',

    'payments.read',

    'notifications.read',

    'documents.read'
  ]
};


// =====================================
// MIDDLEWARE CHECK PERMISSION
// =====================================
function checkPermission(permission) {

  return (req, res, next) => {

    const role =
      res.locals.role;

    if (!role) {

      return res.status(401)
        .json({
          message:
            'Non authentifié'
        });
    }

    const permissions =
      rolesPermissions[role]
      || [];

    // SUPER ADMIN BYPASS
    if (
      permissions.includes('*')
    ) {
      return next();
    }

    // CHECK ACCESS
    if (
      !permissions.includes(
        permission
      )
    ) {

      return res.status(403)
        .json({
          message:
            `Permission refusée: ${permission}`
        });
    }

    next();
  };
}

module.exports = {
  checkPermission
};