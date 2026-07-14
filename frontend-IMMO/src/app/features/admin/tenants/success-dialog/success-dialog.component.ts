import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-container">

      <mat-icon class="success-icon">
        check_circle
      </mat-icon>

      <h2>Succès</h2>

      <p>{{ data.message }}</p>

      <button
        mat-raised-button
        color="primary"
        mat-dialog-close>
        OK
      </button>

    </div>
  `,
  styles: [`
    .success-container{
      text-align:center;
      padding:20px;
    }

    .success-icon{
      font-size:70px;
      width:70px;
      height:70px;
      color:#16a34a;
    }
  `]
})
export class SuccessDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data:any
  ) {}
}