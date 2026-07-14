import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-status-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>
      ⚠️ Confirmation
    </h2>

    <div mat-dialog-content>
      <p>
        Voulez-vous vraiment
        <strong>
          {{ data.status === 'active' ? 'activer' : 'suspendre' }}
        </strong>
        l’agence
        <strong>{{ data.name }}</strong> ?
      </p>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Non</button>

      <button
        mat-raised-button
        [color]="data.status === 'active' ? 'primary' : 'warn'"
        (click)="close(true)">
        Oui, confirmer
      </button>
    </div>
  `
})
export class ConfirmStatusDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}