import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackbar: MatSnackBar) {}

  openSnackBar(message: string, type: 'success' | 'error' = 'success') {

    const panelClass =
      type === 'error' ? ['black-snackbar'] : ['green-snackbar'];

    this.snackbar.open(message, 'Fermer', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
      panelClass
    });
  }
}