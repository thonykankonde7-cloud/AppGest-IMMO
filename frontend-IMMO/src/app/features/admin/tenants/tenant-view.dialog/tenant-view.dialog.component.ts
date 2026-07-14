import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tenant-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Détails Locataire</h2>

    <mat-dialog-content>
      <p><b>Nom :</b> {{ data.fullname }}</p>
      <p><b>Téléphone :</b> {{ data.phone }}</p>
      <p><b>Email :</b> {{ data.email }}</p>
      <p><b>Adresse :</b> {{ data.address }}</p>
      <p><b>Carte :</b> {{ data.id_card }}</p>
      <p><b>Appartement :</b> {{ data.number }} - {{ data.building }}</p>
      <p><b>Début :</b> {{ data.contract_start | date }}</p>
      <p><b>Fin :</b> {{ data.contract_end | date }}</p>
      <p><b>Loyer :</b> {{ data.rent }} $</p>
      <p><b>Caution :</b> {{ data.deposit }} $</p>
      <p><b>Statut :</b> {{ data.status }}</p>
      <p><b>Notes :</b> {{ data.notes }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `
})
export class TenantViewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}