import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule
  ],
  template: `
  <div class="dashboard-container">

    <div class="dashboard">

      <!-- HEADER -->
      <div class="header">

        <div>
          <h1>👋 Bienvenue Agent</h1>
          <p>
            Gérez vos visites,
            prospects et appartements
          </p>
        </div>

      </div>

      <!-- STATS -->
      <div class="cards">

        <!-- VISITES -->
        <div class="card visits">

          <div class="icon">
            <mat-icon>
              event
            </mat-icon>
          </div>

          <div class="content">
            <span>Visites</span>
            <h2>
              {{
                stats.total_visits || 0
              }}
            </h2>
          </div>

        </div>

        <!-- TENANTS -->
        <div class="card tenants">

          <div class="icon">
            <mat-icon>
              groups
            </mat-icon>
          </div>

          <div class="content">
            <span>Locataires</span>
            <h2>
              {{
                stats.total_tenants || 0
              }}
            </h2>
          </div>

        </div>

        <!-- APARTMENTS -->
        <div class="card apartments">

          <div class="icon">
            <mat-icon>
              apartment
            </mat-icon>
          </div>

          <div class="content">
            <span>Disponibles</span>
            <h2>
              {{
                stats.total_apartments || 0
              }}
            </h2>
          </div>

        </div>

        <!-- PROSPECTS -->
        <div class="card prospects">

          <div class="icon">
            <mat-icon>
              person_search
            </mat-icon>
          </div>

          <div class="content">
            <span>Prospects</span>
            <h2>
              {{
                stats.total_leads || 0
              }}
            </h2>
          </div>

        </div>

      </div>

      <!-- QUICK ACTION -->
      <div class="section">

        <div class="section-header">
          <h3>⚡ Actions rapides</h3>
        </div>

        <div class="actions">

          <button
            (click)="go('/agent/visits')">

            + Ajouter visite
          </button>

          <button>
            + Nouveau prospect
          </button>

          <button
            (click)="go('/admin/apartments')">

            Voir appartements
          </button>

        </div>

      </div>

    </div>

  </div>
  `,
  styles: [`
    *{
      box-sizing:border-box;
    }

    :host{
      display:block;
      width:100%;
    }

    .dashboard-container{
      width:100%;
      overflow-x:hidden;
      background:#f5f7fb;
      min-height:100vh;
    }

    .dashboard{
      width:100%;
      padding:24px;
    }

    /* HEADER */
    .header{
      margin-bottom:30px;
    }

    .header h1{
      margin:0;
      color:#1565c0;
      font-size:30px;
      font-weight:700;
    }

    .header p{
      margin-top:8px;
      color:#777;
      font-size:15px;
    }

    /* GRID */
    .cards{
      display:grid;
      grid-template-columns:
      repeat(auto-fit,minmax(240px,1fr));
      gap:20px;
      margin-bottom:30px;
    }

    /* CARD */
    .card{
      background:white;
      border-radius:22px;
      padding:22px;
      display:flex;
      align-items:center;
      gap:18px;
      box-shadow:
      0 8px 25px rgba(0,0,0,.06);
      transition:.3s ease;
      min-width:0;
    }

    .card:hover{
      transform:
      translateY(-4px);
    }

    .icon{
      width:70px;
      height:70px;
      min-width:70px;
      border-radius:18px;
      display:flex;
      justify-content:center;
      align-items:center;
    }

    .icon mat-icon{
      color:white;
      font-size:34px;
      width:34px;
      height:34px;
    }

    .content{
      overflow:hidden;
    }

    .content span{
      color:#777;
      font-size:14px;
    }

    .content h2{
      margin:4px 0 0;
      font-size:28px;
      font-weight:700;
      color:#111;
    }

    /* COLORS */
    .visits .icon{
      background:#fb8c00;
    }

    .tenants .icon{
      background:#1976d2;
    }

    .apartments .icon{
      background:#7b1fa2;
    }

    .prospects .icon{
      background:#00897b;
    }

    /* SECTION */
    .section{
      background:white;
      border-radius:22px;
      padding:24px;
      box-shadow:
      0 8px 25px rgba(0,0,0,.06);
    }

    .section-header{
      margin-bottom:18px;
    }

    .section h3{
      margin:0;
      color:#222;
    }

    .actions{
      display:flex;
      flex-wrap:wrap;
      gap:14px;
    }

    .actions button{
      border:none;
      padding:14px 18px;
      border-radius:14px;
      background:#1565c0;
      color:white;
      cursor:pointer;
      font-weight:600;
      transition:.3s;
    }

    .actions button:hover{
      transform:translateY(-2px);
    }

    /* TABLET */
    @media (max-width:992px){

      .dashboard{
        padding:20px;
      }

      .cards{
        grid-template-columns:
        repeat(2,1fr);
      }
    }

    /* MOBILE */
    @media (max-width:768px){

      .dashboard{
        padding:16px;
        padding-top:85px;
      }

      .header h1{
        font-size:24px;
      }

      .cards{
        grid-template-columns:1fr;
      }

      .card{
        padding:18px;
      }

      .icon{
        width:58px;
        height:58px;
        min-width:58px;
      }

      .icon mat-icon{
        font-size:28px;
      }

      .content h2{
        font-size:22px;
      }

      .actions{
        flex-direction:column;
      }

      .actions button{
        width:100%;
      }
    }
  `]
})
export class DashboardComponent
implements OnInit {

  stats: any = {};

  private apiUrl =
  'http://localhost:8080/dashboard';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  getToken(): string {

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {
      return (
        localStorage.getItem(
          'token'
        ) || ''
      );
    }

    return '';
  }

  go(path: string) {
    this.router.navigate([path]);
  }

  loadStats() {

    const token =
      this.getToken();

    if (!token) {
      console.warn(
        '❌ Aucun token trouvé'
      );
      return;
    }

    const headers =
      new HttpHeaders({
        Authorization:
        `Bearer ${token}`
      });

    this.http.get<any>(
      `${this.apiUrl}/stats`,
      { headers }
    )
    .subscribe({

      next: (res) => {
        this.stats = res;
      },

      error: (err) => {
        console.error(
          'Dashboard error:',
          err
        );
      }
    });
  }
}