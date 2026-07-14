import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-building-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  template: `
  <h2 mat-dialog-title>
  {{ data ? '✏️ Modifier un immeuble' : '➕ Ajouter un immeuble' }}
</h2>

  <form [formGroup]="form" (ngSubmit)="submit()" class="form">

    <mat-form-field appearance="outline" class="full">
      <mat-label>Nom</mat-label>
      <input matInput formControlName="name">
    </mat-form-field>

    <mat-form-field appearance="outline" class="full">
      <mat-label>Adresse</mat-label>
      <input matInput formControlName="address">
    </mat-form-field>

    <mat-form-field appearance="outline" class="half">
      <mat-label>Étages</mat-label>
      <input matInput type="number" formControlName="total_floors">
    </mat-form-field>

    <mat-form-field appearance="outline" class="full">
  <mat-label>Description</mat-label>

  <textarea
    matInput
    rows="1"
    formControlName="description">
  </textarea>

</mat-form-field>

<mat-form-field appearance="outline" class="full">
  <mat-label>Ville</mat-label>
  <input matInput formControlName="city">
</mat-form-field>

    <div class="actions">
      <button mat-button type="button" (click)="close()">Annuler</button>
      <button
  mat-raised-button
  color="primary"
  type="submit">

  {{ data ? 'Mettre à jour' : 'Sauvegarder' }}

</button>
    </div>

  </form>
  `,
  styles: [`
    .form {
      display: grid;
      gap: 12px;
      padding: 10px;
    }

    .full { width: 100%; }
    .half { width: 100%; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }
  `]
})
export class AddBuildingDialogComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBuildingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      address: [this.data?.address || '', Validators.required],
      city: [this.data?.city || ''],
      total_floors: [this.data?.total_floors || 0],
      description: [this.data?.description || '']
    });
  
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}