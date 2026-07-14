import {
  Component,
  Inject
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],

  template: `
<div class="dialog">

  <!-- ICON -->
  <div class="icon">
    <mat-icon [color]="data.type === 'details' ? 'primary' : 'warn'">
      {{ data.type === 'details' ? 'info' : 'warning' }}
    </mat-icon>
  </div>

  <!-- TITLE -->
  <h2 mat-dialog-title>
    {{ data.title || 'Confirmation' }}
  </h2>

  <!-- CONTENT -->
  <mat-dialog-content>

    <!-- ================= DETAILS PREMIUM ================= -->
    <div class="details-grid" *ngIf="data.type === 'details'">

      <div class="detail-card">
        <mat-icon>business</mat-icon>
        <div>
          <label>Agence</label>
          <span>{{ getValue('Agence') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>workspace_premium</mat-icon>
        <div>
          <label>Plan</label>
          <span>{{ getValue('Plan') }}</span>
        </div>
      </div>

      <div class="detail-card highlight">
        <mat-icon>payments</mat-icon>
        <div>
          <label>Montant</label>
          <span>{{ getValue('Montant') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>payment</mat-icon>
        <div>
          <label>Méthode</label>
          <span>{{ getValue('Méthode') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>phone</mat-icon>
        <div>
          <label>Téléphone</label>
          <span>{{ getValue('Téléphone') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>receipt</mat-icon>
        <div>
          <label>Transaction</label>
          <span>{{ getValue('Transaction') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>event</mat-icon>
        <div>
          <label>Date paiement</label>
          <span>{{ getValue('Date paiement') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>play_circle</mat-icon>
        <div>
          <label>Date début</label>
          <span>{{ getValue('Date début') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <mat-icon>stop_circle</mat-icon>
        <div>
          <label>Date fin</label>
          <span>{{ getValue('Date fin') }}</span>
        </div>
      </div>

      <!-- STATUT -->
      <div class="detail-card status-card">
        <mat-icon>info</mat-icon>
        <div>
          <label>Statut</label>
          <span class="status" [ngClass]="getStatusClass()">
            {{ getValue('Statut') }}
          </span>
        </div>
      </div>

    </div>

    <!-- ================= CONFIRM MODE ================= -->
    <p *ngIf="!data.type || data.type !== 'details'">
      {{ data.message }}
    </p>

  </mat-dialog-content>

  <!-- ACTIONS -->
  <mat-dialog-actions align="end">

    <button
      *ngIf="data.type !== 'details'"
      mat-button
      (click)="close(false)">
      Annuler
    </button>

    <button
      *ngIf="data.type !== 'details'"
      mat-raised-button
      color="warn"
      (click)="close(true)">
      Confirmer
    </button>

    <button
      *ngIf="data.type === 'details'"
      mat-raised-button
      color="primary"
      (click)="close(true)">
      Fermer
    </button>

  </mat-dialog-actions>

</div>
`,

styles: [`
:host {
  display: block;
}

.dialog {
  padding: 10px;
  text-align: center;
  min-width: 420px;
}

/* ================= ICON ================= */
.icon {
  width: 78px;
  height: 78px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(37,99,235,.12), rgba(99,102,241,.18));
  box-shadow: 0 10px 24px rgba(37,99,235,.12);
}

.icon mat-icon {
  font-size: 44px;
  width: 44px;
  height: 44px;
}

/* ================= TITLE ================= */
h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* ================= CONTENT ================= */
mat-dialog-content {
  margin-top: 14px;
  padding: 0 !important;
}

/* ================= GRID ================= */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* ================= CARD (COMPACT) ================= */
.detail-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 4px;   /* 🔥 réduit */
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

/* hover plus soft */
.detail-card:hover {
  transform: translateY(-1px);
  background: #eff6ff;
  box-shadow: 0 6px 14px rgba(0,0,0,0.05);
}

/* ================= ICON CARD ================= */
.detail-card mat-icon {
  color: #2563eb;
  font-size: 18px;   /* 🔥 réduit */
  width: 22px;
  height: 22px;
}

/* ================= TEXT ================= */
label {
  display: block;
  font-size: 10px;   /* 🔥 plus compact */
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 2px;
}

span {
  font-size: 13px;   /* 🔥 réduit */
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

/* ================= HIGHLIGHT ================= */
.highlight {
  background: linear-gradient(135deg, #dbeafe, #eef2ff);
  border: 1px solid #93c5fd;
}

/* ================= STATUS ================= */
.status.pending { color: #c2410c; }
.status.active { color: #166534; }
.status.completed { color: #2563eb; }
.status.rejected { color: #991b1b; }

/* ================= ACTIONS ================= */
mat-dialog-actions {
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

button {
  min-width: 110px;
  border-radius: 10px;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 600px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .dialog {
    min-width: auto;
    width: 100%;
  }
}
`]
})
export class ConfirmDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // ✅ SAFE ACCESS (NO Angular ERROR)
  getValue(label: string): string {
    return this.data?.content?.find((x: any) => x.label === label)?.value || '-';
  }

  // ✅ STATUS CLASS
  getStatusClass(): string {
    return (this.getValue('Statut') || '').toLowerCase();
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}