import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>⚠️ Confirmation</h2>

    <div mat-dialog-content>
      <p>
        Voulez-vous vraiment supprimer l’agence
        <strong>{{ data.name }}</strong> ?
      </p>

      <p style="color:red; font-size: 13px;">
        Cette action est irréversible.
      </p>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Non</button>
      <button mat-raised-button color="warn" (click)="close(true)">
        Oui, supprimer
      </button>
    </div>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}