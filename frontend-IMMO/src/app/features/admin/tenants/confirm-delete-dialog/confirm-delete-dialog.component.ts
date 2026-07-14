import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">

      <div class="icon-container">
        <mat-icon color="warn">warning</mat-icon>
      </div>

      <h2 mat-dialog-title>
        Confirmation
      </h2>

      <mat-dialog-content>
        <p>
          Voulez-vous vraiment supprimer
          <strong>{{ data.name }}</strong> ?
        </p>

        <p class="warning">
          Cette action est irréversible.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">

        <button
          mat-stroked-button
          (click)="close(false)">
          Non
        </button>

        <button
          mat-raised-button
          color="warn"
          (click)="close(true)">
          Oui, supprimer
        </button>

      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 10px;
      text-align: center;
    }

    .icon-container {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }

    .icon-container mat-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: #dc2626;
    }

    .warning {
      color: #dc2626;
      font-weight: 600;
      margin-top: 10px;
    }

    mat-dialog-actions {
      margin-top: 20px;
    }
  `]
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