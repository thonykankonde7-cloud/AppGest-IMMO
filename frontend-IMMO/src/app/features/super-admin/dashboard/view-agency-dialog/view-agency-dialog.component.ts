import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-view-agency-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="header">
      <h2>🏢 {{ data.name }}</h2>

      <span class="badge" [ngClass]="data.status">
        {{ data.status }}
      </span>
    </div>

    <div class="content">

      <div class="card">
        <h4>📦 Plan</h4>
        <p>{{ data.plan_name || 'Aucun plan' }}</p>
      </div>

      <div class="card">
        <h4>📅 Fin abonnement</h4>
        <p>{{ data.end_date | date:'mediumDate' }}</p>
      </div>

      <div class="card">
        <h4>🆔 ID agence</h4>
        <p>{{ data.id }}</p>
      </div>

    </div>

    <div class="footer">
      <button mat-button mat-dialog-close>Fermer</button>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .header h2 {
      font-size: 15px;
      margin: 0;
    }

    .badge {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .expired {
      background: #ffebee;
      color: #d32f2f;
    }

    .content {
      display: grid;
      gap: 10px;
    }

    .card {
      background: #f8fafc;
      padding: 8px;
      border-radius: 10px;
      border: 1px solid #eee;
    }

    .card h4 {
      margin: 0 0 5px;
      font-size: 12px;
      color: #666;
    }

    .card p {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #222;
    }

    .footer {
      margin-top: 15px;
      text-align: right;
    }
  `]
})
export class ViewAgencyDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}