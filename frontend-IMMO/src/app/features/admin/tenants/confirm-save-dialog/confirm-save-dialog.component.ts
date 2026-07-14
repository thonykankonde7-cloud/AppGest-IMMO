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
  selector: 'app-confirm-save-dialog',
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
        <mat-icon color="primary">save</mat-icon>
      </div>

      <h2 mat-dialog-title>
        Confirmation
      </h2>

      <mat-dialog-content>
        <p>
          Voulez-vous vraiment
          <strong>{{ data.action }}</strong>
          ce locataire ?
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
          color="primary"
          (click)="close(true)">
          Oui, continuer
        </button>

      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .dialog-container{
      text-align:center;
      padding:10px;
    }

    .icon-container{
      display:flex;
      justify-content:center;
      margin-bottom:10px;
    }

    .icon-container mat-icon{
      font-size:60px;
      width:60px;
      height:60px;
    }
  `]
})
export class ConfirmSaveDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmSaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}