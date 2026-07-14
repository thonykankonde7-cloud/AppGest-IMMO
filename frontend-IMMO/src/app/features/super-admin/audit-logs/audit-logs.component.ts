import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  template: `
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>📜 Audit Logs</h2>
        <p>Historique des actions système</p>
      </div>

      <button mat-raised-button color="primary" (click)="loadLogs()">
        <mat-icon>refresh</mat-icon>
        Actualiser
      </button>
    </div>

    <!-- FILTER -->
    <mat-form-field appearance="outline" class="search">
      <mat-label>Recherche</mat-label>
      <input matInput (input)="applyFilter($event)" placeholder="Utilisateur, action..." />
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <!-- TABLE -->
    <mat-card class="card">

      <table mat-table [dataSource]="filteredLogs" class="table">

        <!-- USER -->
        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
          <td mat-cell *matCellDef="let log">{{ log.user_name }}</td>
        </ng-container>

        <!-- ACTION -->
        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let log">
            <span class="badge">{{ log.action }}</span>
          </td>
        </ng-container>

        <!-- ENTITY -->
        <ng-container matColumnDef="entity">
          <th mat-header-cell *matHeaderCellDef>Entité</th>
          <td mat-cell *matCellDef="let log">{{ log.entity }}</td>
        </ng-container>

        <!-- DESCRIPTION -->
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let log">{{ log.description }}</td>
        </ng-container>

        <!-- DATE -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let log">
            {{ log.created_at | date:'short' }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

      </table>

    </mat-card>

  </div>
  `,
  styles: [`
    .page{
      padding:20px;
    }

    .header{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:15px;
      flex-wrap:wrap;
    }

    .search{
      width:100%;
      max-width:400px;
      margin-bottom:15px;
    }

    .card{
      padding:10px;
      border-radius:12px;
    }

    .table{
      width:100%;
    }

    .badge{
      background:#e8f5e9;
      color:#2e7d32;
      padding:4px 10px;
      border-radius:20px;
      font-size:12px;
    }

    @media(max-width:768px){
      .page{ padding:12px; }
    }
  `]
})
export class AuditLogsComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/audit-logs';

  logs: any[] = [];
  filteredLogs: any[] = [];

  displayedColumns = [
    'user',
    'action',
    'entity',
    'description',
    'date'
  ];

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  getToken(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('token') || '';
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  loadLogs() {
    this.http.get<any>(this.apiUrl, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.logs = res.logs || [];
          this.filteredLogs = this.logs;
        },
        error: () => {
          this.snack.open('Erreur chargement logs', 'OK', { duration: 3000 });
        }
      });
  }

  applyFilter(event: any) {
    const value = event.target.value.toLowerCase();

    this.filteredLogs = this.logs.filter(log =>
      log.user_name?.toLowerCase().includes(value) ||
      log.action?.toLowerCase().includes(value) ||
      log.entity?.toLowerCase().includes(value)
    );
  }
}