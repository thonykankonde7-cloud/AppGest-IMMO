import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import { Subject, debounceTime, filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    FormsModule
  ],
  template: `
 <header class="header">

<!-- SEARCH -->
<div class="search-box">

  <mat-icon class="search-icon">
    search
  </mat-icon>

  <input
    type="text"
    placeholder="Rechercher..."
    [(ngModel)]="searchText"
    (input)="onSearch()"
  />

</div>

<!-- RIGHT -->
<div class="right">

  <!-- NOTIFICATIONS (FIX PRO) -->
  <div class="notif">

    <mat-icon>
      notifications
    </mat-icon>

    <span
      class="badge"
      *ngIf="notifications > 0">
      {{ notifications }}
    </span>

  </div>

  <!-- USER -->
  <div class="user-info">

    <img
      *ngIf="photo"
      [src]="photo"
      class="avatar"
      alt="avatar"
    />

    <div
      *ngIf="!photo"
      class="default-avatar">

      <mat-icon>
        account_circle
      </mat-icon>

    </div>

    <div class="user-text">

      <span class="name">
        {{ fullname }}
      </span>

      <small class="role">
        {{ role }}
      </small>

    </div>

  </div>

</div>

</header>
  `,
  styles: [`
    * { box-sizing: border-box; }

.header {
  height: 70px;
  width: 100%;
  background: #fff;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 25px;

  position: sticky;
  top: 0;
  z-index: 998;

  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
}


/* SEARCH */
.search-box {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;

  display: flex;
  align-items: center;

  background: #f4f7fc;
  border-radius: 12px;
  padding: 8px 12px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  margin-left: 8px;
  font-size: 14px;
}

/* RIGHT */
.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

/* NOTIFICATIONS */
.notif {
  position: relative;
  cursor: pointer;
}

.notif mat-icon {
  font-size: 26px;
  color: #444;
  transition: 0.3s;
}

.notif mat-icon:hover {
  color: #1b5e20;
  transform: scale(1.1);
}

/* BADGE FIX */
.badge {
  position: absolute;
  top: -5px;
  right: -6px;

  background: #e53935;
  color: white;

  width: 18px;
  height: 18px;

  font-size: 11px;
  font-weight: 600;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* USER */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1b5e20;
}

.default-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f2f2f2;

  display: flex;
  align-items: center;
  justify-content: center;
}

.default-avatar mat-icon {
  font-size: 30px;
  color: #777;
}

/* TEXT */
.user-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 14px;
}

.role {
  font-size: 12px;
  color: #777;
  text-transform: capitalize;
}

/* MOBILE */
@media (max-width: 768px) {

  .search-box {
    display: none;
  }

  .user-text {
    display: none;
  }
}
  `]
})
export class HeaderComponent implements OnInit {

  role = '';
  photo = '';
  fullname = 'Utilisateur';

  searchText = '';
  notifications = 3;

  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {

    this.loadUser();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(value => {
      console.log('Recherche:', value);
    });

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log(event.urlAfterRedirects);
      });
  }

  loadUser() {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.role = user.role ?? '';
    this.fullname = user.fullname ?? user.name ?? 'Utilisateur';
    this.photo = user.avatar ?? user.picture ?? '';
  }

  onSearch() {
    this.searchSubject.next(this.searchText);
  }
}