import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LayoutComponent } from './layout/layout.component';

const appName = 'AppGest-immeuble';

export const routes: Routes = [

  // =============================
  // HOME
  // =============================
  {
    path: '',
    component: HomeComponent,
    title: `Accueil - ${appName}`
  },

  // =============================
  // LOGIN
  // =============================
  {
    path: 'login',
    title: `Login - ${appName}`,
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // =============================
  // SUPER ADMIN
  // =============================
  {
    path: 'super-admin',
    component: LayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // DASHBOARD
      {
        path: 'dashboard',
        title: `Super Admin Dashboard - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // AGENCES
      {
        path: 'agencies',
        title: `Gestion Agences - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/agencies/agencies.component')
            .then(m => m.AgenciesComponent)
      },

      // VOIR DETAILS AGENCE
      {
        path: 'agencies/:id',
        loadComponent: () =>
          import('./features/super-admin/agencies/agency-details/agency-details.component')
            .then(m => m.AgencyDetailsComponent)
      },

      // ABONNEMENTS
      {
        path: 'subscriptions',
        title: `Abonnements - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/subscriptions/subscriptions.component')
            .then(m => m.SubscriptionsComponent)
      },

      // WALLET SAAS
{
  path: 'wallet',
  title: `Porte feuille SaaS - ${appName}`,
  loadComponent: () =>
    import('./features/super-admin/saas-wallet/saas-wallet.component')
      .then(m => m.SaasWalletComponent)
},

      // PARAMÈTRES SAAS
      {
        path: 'saas-settings',
        title: `Paramètres SaaS - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/saas-settings/saas-settings.component')
            .then(m => m.SaasSettingsComponent)
      },

      // LOGS AUDIT
      {
        path: 'audit-logs',
        title: `Logs Audit - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/audit-logs/audit-logs.component')
            .then(m => m.AuditLogsComponent)
      },

      // STATISTIQUES GLOBALES
      {
        path: 'global-stats',
        title: `Statistiques Globales - ${appName}`,
        loadComponent: () =>
          import('./features/super-admin/global-stats/global-stats.component')
            .then(m => m.GlobalStatsComponent)
      },
    ]
  },

// =============================
// ADMIN
// =============================
{
  path: 'admin',
  component: LayoutComponent,
  children: [

    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },

    // Dashboard
    {
      path: 'dashboard',
      title: `Dashboard - ${appName}`,
      loadComponent: () =>
        import('./features/admin/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
    },

    // Immeubles
    {
      path: 'buildings',
      title: `Immeubles - ${appName}`,
      loadComponent: () =>
        import('./features/admin/buildings/buildings.component')
          .then(m => m.BuildingsComponent)
    },

    // Locataires
    {
      path: 'tenants',
      title: `Locataires - ${appName}`,
      loadComponent: () =>
        import('./features/admin/tenants/tenants.component')
          .then(m => m.TenantsComponent)
    },


    // Appartement
    {
      path: 'apartments',
      title: `Appartements - ${appName}`,
      loadComponent: () =>
        import('./features/admin/apartments/apartments.component')
          .then(m => m.ApartmentsComponent)
    },

    // Contrats
    {
      path: 'contrats',
      title: `Contrats - ${appName}`,
      loadComponent: () =>
        import('./features/admin/contrats/contrats.component')
          .then(m => m.ContratsComponent)
    },

    // Paiements
    {
      path: 'payments',
      title: `Paiements - ${appName}`,
      loadComponent: () =>
        import('./features/admin/payments/payments.component')
          .then(m => m.PaymentsComponent)
    },

    // Factures
    {
      path: 'bill',
      title: `Factures - ${appName}`,
      loadComponent: () =>
        import('./features/admin/bill/bill.component')
          .then(m => m.BillComponent)
    },

    // Dépenses
    {
      path: 'expenses',
      title: `Dépenses - ${appName}`,
      loadComponent: () =>
        import('./features/admin/expenses/expenses.component')
          .then(m => m.ExpensesComponent)
    },

    // Maintenance
    {
      path: 'maintenances',
      title: `Maintenances - ${appName}`,
      loadComponent: () =>
        import('./features/admin/maintenances/maintenances.component')
          .then(m => m.MaintenancesComponent)
    },

    // Documents
    {
      path: 'documents',
      title: `Documents - ${appName}`,
      loadComponent: () =>
        import('./features/admin/documents/documents.component')
          .then(m => m.DocumentsComponent)
    },

    // Rapports
    {
      path: 'rapports',
      title: `Rapports - ${appName}`,
      loadComponent: () =>
        import('./features/admin/rapports/rapports.component')
          .then(m => m.RapportsComponent)
    },

    // Utilisateurs
    {
      path: 'users',
      title: `Utilisateurs - ${appName}`,
      loadComponent: () =>
        import('./features/admin/users/users.component')
          .then(m => m.UsersComponent)
    },

    // Permissions
    {
      path: 'permissions',
      title: `Permissions - ${appName}`,
      loadComponent: () =>
        import('./features/admin/permissions/permissions.component')
          .then(m => m.PermissionsComponent)
    },

    // Notifications
    {
      path: 'notifications',
      title: `Notifications - ${appName}`,
      loadComponent: () =>
        import('./features/admin/notifications/notifications.component')
          .then(m => m.NotificationsComponent)
    },

    // Support
    {
      path: 'support',
      title: `Support - ${appName}`,
      loadComponent: () =>
        import('./features/admin/support/support.component')
          .then(m => m.SupportComponent)
    },

    // Journal d'activités
    {
      path: 'audit-logs',
      title: `Journal des activités - ${appName}`,
      loadComponent: () =>
        import('./features/audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent)
    },

    // Abonnement
    {
      path: 'abonnement',
      title: `Mon Abonnement - ${appName}`,
      loadComponent: () =>
        import('./features/admin/abonnement/abonnement.component')
          .then(m => m.AbonnementComponent)
    },
    {
      path: 'demande-paiement',
      loadComponent: () =>
        import('./features/admin/abonnement/demande-paiement/demande-paiement.component')
          .then(m => m.DemandePaiementComponent)
    },

    // Profil
    {
      path: 'profil',
      title: `Profil - ${appName}`,
      loadComponent: () =>
        import('./features/admin/profil/profil.component')
          .then(m => m.ProfilComponent)
    },

    // Paramètres
    {
      path: 'settings',
      title: `Paramètres - ${appName}`,
      loadComponent: () =>
        import('./features/admin/settings/settings.component')
          .then(m => m.SettingsComponent)
    }

  ]
},

  // =============================
  // AGENT
  // =============================
  {
    path: 'agent',
    component: LayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        title: `Agent Dashboard - ${appName}`,
        loadComponent: () =>
          import('./features/agent/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      }
    ]
  },

  // =============================
  // TENANT
  // =============================
  {
    path: 'tenant',
    component: LayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        title: `Tenant Dashboard - ${appName}`,
        loadComponent: () =>
          import('./features/tenant/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      }
    ]
  },

  // =============================
  // FALLBACK
  // =============================
  {
    path: '**',
    redirectTo: ''
  }
];