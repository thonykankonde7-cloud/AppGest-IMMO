
import {
  Router,
  RouterModule,
  NavigationEnd
} from '@angular/router';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Subject,
  filter,
  takeUntil
} from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  template: `
    <!-- MOBILE HEADER -->
    <header class="mobile-header">

      <button
        class="menu-btn"
        (click)="toggleSidebar()">

        <mat-icon>menu</mat-icon>

      </button>

    </header>

    <!-- OVERLAY -->
    <div
      *ngIf="sidebarOpen"
      class="overlay"
      (click)="closeSidebar()">
    </div>

    <!-- SIDEBAR -->
    <aside
  class="sidebar"
  [class.open]="sidebarOpen"
  [class.collapsed]="sidebarCollapsed">

      <!-- LOGO -->
      <div class="logo">

<div class="brand">

  <mat-icon>apartment</mat-icon>

  <div *ngIf="!sidebarCollapsed">
    <h2>AppGest</h2>
    <small>IMMOBILIER</small>
  </div>

</div>

<div class="actions">

  <button
    class="collapse-btn"
    (click)="toggleCollapse()">

    <mat-icon>
      {{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}
    </mat-icon>

  </button>

  <button
    class="close-btn"
    (click)="closeSidebar()">

    <mat-icon>close</mat-icon>

  </button>

</div>

</div>


      <!-- MENU -->
      <ul class="menu">

        <!-- DASHBOARD -->
        <li
          [routerLink]="dashboardRoute"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{
            exact: true
          }"
          (click)="closeMobile()">

          <mat-icon>
            dashboard
          </mat-icon>

          <span *ngIf="!sidebarCollapsed">
    Tableau de bord
  </span>

        </li>

       <!-- SUPER ADMIN -->
<ng-container *ngIf="role === 'super_admin'">


<!-- AGENCES -->
<li
  routerLink="/super-admin/agencies"
  routerLinkActive="active"
  (click)="closeMobile()">

<mat-icon>business</mat-icon>

<span *ngIf="!sidebarCollapsed">
  Agences
</span>

</li>

<!-- ABONNEMENTS -->
<li
  routerLink="/super-admin/subscriptions"
  routerLinkActive="active"
  (click)="closeMobile()">

  <mat-icon>
    workspace_premium
  </mat-icon>
  <span *ngIf="!sidebarCollapsed">
  Plans & Abonnements
  </span>

</li>

<!-- WALLET SAAS -->
<li
  routerLink="/super-admin/wallet"
  routerLinkActive="active"
  (click)="closeMobile()">

  <mat-icon>account_balance_wallet</mat-icon>
  <span *ngIf="!sidebarCollapsed">
  Portefeuille & Retrait
  </span>

</li>

<!-- PARAMÈTRES SAAS -->
<li
  routerLink="/super-admin/saas-settings"
  routerLinkActive="active"
  (click)="closeMobile()">

  <mat-icon>
    settings_suggest
  </mat-icon>
  <span *ngIf="!sidebarCollapsed">
  Paramètres SaaS
  </span>

</li>

<!-- LOGS AUDIT -->
<li
  routerLink="/super-admin/audit-logs"
  routerLinkActive="active"
  (click)="closeMobile()">

  <mat-icon>
    security
  </mat-icon>
  <span *ngIf="!sidebarCollapsed">
  Logs Audit
  </span>
</li>

<!-- STATISTIQUES GLOBALES -->
<li
  routerLink="/super-admin/global-stats"
  routerLinkActive="active"
  (click)="closeMobile()">

  <mat-icon>
    analytics
  </mat-icon>
  <span *ngIf="!sidebarCollapsed">
  Statistiques Globales
  </span>
</li>
</ng-container>

<!-- ADMIN -->
<ng-container *ngIf="role === 'admin'">

  <!-- Immeubles -->
  <li
    routerLink="/admin/buildings"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>business</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Immeubles
  </span>
    
  </li>

  <!-- Appartements -->
  <li
    routerLink="/admin/apartments"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>apartment</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Appartements
  </span>
    
  </li>

  <!-- Locataires -->
  <li
    routerLink="/admin/tenants"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>groups</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Locataires
  </span>
    
  </li>

  <!-- Contrats -->
  <li
    routerLink="/admin/contrats"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>description</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Contrats
  </span>
    
  </li>

  <!-- Paiements -->
  <li
    routerLink="/admin/payments"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>payments</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Paiements
  </span>
    
  </li>

  <!-- Factures -->
  <li
    routerLink="/admin/bill"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>receipt_long</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Factures
  </span>
    
  </li>

  <!-- Dépenses -->
  <li
    routerLink="/admin/expenses"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>money_off</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Dépenses
  </span>
    
  </li>

  <!-- Maintenance -->
  <li
    routerLink="/admin/maintenances"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>build</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Maintenance
  </span>
    
  </li>

  <!-- Documents -->
  <li
    routerLink="/admin/documents"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>folder</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Documents
  </span>
    
  </li>

  <!-- Rapports -->
  <li
    routerLink="/admin/rapports"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>analytics</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Rapports
  </span>
    
  </li>

  <!-- Utilisateurs -->
  <li
    routerLink="/admin/users"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>people</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Utilisateurs
  </span>
    
  </li>

  <!-- Permissions -->
  <li
    routerLink="/admin/permissions"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>admin_panel_settings</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Permissions
  </span>
    
  </li>

  <!-- Notifications -->
  <li
    routerLink="/admin/notifications"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>notifications</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Notifications
  </span>
    
  </li>

  <!-- Support -->
  <li
    routerLink="/admin/support"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>support_agent</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Support
  </span>
    
  </li>

  <!-- Journal -->
  <li
    routerLink="/admin/audit-logs"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>history</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Journal d'activités
  </span>
    
  </li>

  <!-- Abonnement -->
  <li
    routerLink="/admin/abonnement"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>workspace_premium</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Mon abonnement
  </span>
    
  </li>

  <!-- Profil -->
  <li
    routerLink="/admin/profil"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>person</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Profil
  </span>
   
  </li>

  <!-- Paramètres -->
  <li
    routerLink="/admin/settings"
    routerLinkActive="active"
    (click)="closeMobile()">
    <mat-icon>settings</mat-icon>
    <span *ngIf="!sidebarCollapsed">
    Paramètres
  </span>
    
  </li>

</ng-container>

      </ul>

      <!-- FOOTER -->
      <div class="logout">

      <button (click)="logout()">

<mat-icon>logout</mat-icon>

<span *ngIf="!sidebarCollapsed">
  Déconnexion
</span>

</button>

      </div>

    </aside>
  `,
  styles: [`
    *{
      box-sizing:border-box;
    }
    :host{
  display:block;
  flex-shrink:0;
}

.sidebar{

width:260px;
height:100vh;

display:flex;
flex-direction:column;

background:linear-gradient(
    180deg,
    #2e7d32,
    #1b5e20
);

overflow:hidden;

transition:
    width .3s,
    transform .3s;
}

.menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

    /* MOBILE HEADER */
    .mobile-header{
      display:none;
      position:fixed;
      top:0;
      left:0;
      right:0;
      height:65px;
      background:#1b5e20;
      color:#fff;
      z-index:1100;
      padding:0 20px;
      align-items:center;
      justify-content:space-between;
    }

    .mobile-logo{
      display:flex;
      align-items:center;
      gap:10px;
      font-weight:700;
    }

    .menu-btn{
      border:none;
      background:none;
      color:#fff;
      cursor:pointer;
    }

    /* SIDEBAR */
    .sidebar {
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  transition: width .3s ease;
}

.sidebar.collapsed {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
}

.sidebar.collapsed .brand div,
.sidebar.collapsed .menu span,
.sidebar.collapsed .logout span {
  display:none;
}

.sidebar.collapsed .menu li {
  justify-content:center;
  padding:0;
}

.sidebar.collapsed .logo {
  justify-content:center;
}

.actions{
  display:flex;
  align-items:center;
  gap:5px;
}

.collapse-btn{
  border:none;
  background:none;
  color:white;
  cursor:pointer;
}

    /* LOGO */
    .logo{
      height:75px;
      padding:20px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      border-bottom:1px solid rgba(255,255,255,.08);
    }

    .brand{
      display:flex;
      align-items:center;
      gap:12px;
    }

    .brand h2{
      margin:0;
      font-size:18px;
    }

    .brand small{
      opacity:.7;
      font-size:11px;
    }

    .close-btn{
      display:none;
      border:none;
      background:none;
      color:#fff;
      cursor:pointer;
    }

    /* MENU */
    .menu{
      flex:1;
      overflow-y:auto;

      list-style:none;
      padding:15px;
      margin:0;
    }

    .menu li{
      height:50px;

      display:flex;
      align-items:center;
      gap:14px;

      padding:0 16px;
      margin-bottom:8px;

      border-radius:14px;
      cursor:pointer;
      transition:.25s;
    }

    .menu li:hover{
      background:rgba(255,255,255,.12);
    }

    .menu li{
    color:#fff;
}

.menu li mat-icon{
    color:#fff;
}

    .active{
    background:rgba(255,255,255,.18) !important;
    color:#fff !important;
    font-weight:600;
}

.active mat-icon{
    color:#fff !important;
}

    /* FOOTER */
    .logout{
      padding:20px;
      border-top:1px solid rgba(255,255,255,.08);
    }

    .logout button{
      width:100%;
      height:48px;

      border:none;
      border-radius:14px;

      background:#e53935;
      color:#fff;

      display:flex;
      align-items:center;
      justify-content:center;
      gap:10px;

      cursor:pointer;
    }

    /* OVERLAY */
    .overlay{
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.45);
      z-index:999;
    }

    /* MOBILE */
    @media (max-width:768px){

:host{

    position:fixed;

    left:0;
    top:0;
    bottom:0;

    width:0;

    z-index:1200;

    overflow:visible;

    //pointer-events:none;
}

.mobile-header{
    display:flex;
}

.sidebar{

    position:fixed;

    left:0;
    top:0;
    bottom:0;

    width:260px;

    transform:translateX(-100%);

    pointer-events:auto;

    z-index:1201;
}

.sidebar.open{
    transform:translateX(0);
}

.close-btn{
    display:block;
}

}
  
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Input() sidebarCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  role = '';
  sidebarOpen = false;
  dashboardRoute = '/';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role') ?? '';
    }

    const routes: Record<string, string> = {
      super_admin: '/super-admin/dashboard',
      admin: '/admin/dashboard',
      agent: '/agent/dashboard',
      tenant: '/tenant/dashboard'
    };

    this.dashboardRoute = routes[this.role] ?? '/';

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.closeMobile());
  }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.collapsedChange.emit(this.sidebarCollapsed);

    localStorage.setItem(
      'sidebarCollapsed',
      String(this.sidebarCollapsed)
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  closeMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}