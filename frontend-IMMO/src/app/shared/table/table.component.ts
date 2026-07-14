import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatPaginator
} from '@angular/material/paginator';

import {
  MatTableDataSource
} from '@angular/material/table';

import {
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatTooltipModule
  ],
  template: `

<div class="table-responsive">

<div class="toolbar">

<input
type="text"
placeholder="Recherche..."
#txt
(keyup)="search(txt.value)">

</div>

<table
mat-table
matSort
[dataSource]="dataSource">

<ng-container
*ngFor="let column of columns"
[matColumnDef]="column">

<th
mat-header-cell
*matHeaderCellDef>

{{ headers[column] || (column | titlecase) }}

</th>

<td
mat-cell
*matCellDef="let row">

<ng-container *ngIf="badges.includes(column); else checkDate">

  <span
    class="badge"
    [ngClass]="row[column] || ''">

    {{ badgeLabels[row[column]] || row[column] || '-' }}

  </span>

</ng-container>

<ng-template #checkDate>

<ng-container *ngIf="dates.includes(column); else normal">

{{ row[column] | date:'dd/MM/yyyy' }}

</ng-container>

</ng-template>

<ng-template #normal>

{{ row[column] }}

</ng-template>

</td>

</ng-container>

<ng-container
matColumnDef="actions"
*ngIf="showActions">

<th
mat-header-cell
*matHeaderCellDef>

Actions

<td
  mat-cell
  *matCellDef="let row">

  <!-- Voir -->
  <button
    *ngIf="showView"
    mat-icon-button
    color="primary"
    matTooltip="Voir les détails"
    (click)="view.emit(row)">

    <mat-icon>visibility</mat-icon>

  </button>

  <!-- Modifier -->
  <button
    *ngIf="showEdit"
    mat-icon-button
    color="primary"
    matTooltip="Modifier"
    (click)="edit.emit(row)">

    <mat-icon>edit</mat-icon>

  </button>

  <!-- Supprimer -->
  <button
    *ngIf="showDelete"
    mat-icon-button
    color="warn"
    matTooltip="Supprimer"
    (click)="delete.emit(row)">

    <mat-icon>delete</mat-icon>

  </button>

  <!-- Approuver -->
  <button
    *ngIf="showApprove && row.status === 'pending'"
    mat-icon-button
    color="primary"
    matTooltip="Approuver"
    (click)="approve.emit(row)">

    <mat-icon>check_circle</mat-icon>

  </button>

  <!-- Rejeter -->
  <button
    *ngIf="showReject && row.status === 'pending'"
    mat-icon-button
    color="warn"
    matTooltip="Rejeter"
    (click)="reject.emit(row)">

    <mat-icon>cancel</mat-icon>

  </button>

</td>

</ng-container>

<tr
mat-header-row
*matHeaderRowDef="displayedColumns">
</tr>

<tr
mat-row
*matRowDef="let row; columns: displayedColumns"
(click)="rowClick.emit(row)">
</tr>

</table>

<mat-paginator
[pageSize]="pageSize"
[pageSizeOptions]="pageSizeOptions"
showFirstLastButtons>
</mat-paginator>

</div>

  `,
  styles: [`
.table-responsive{
overflow:auto;
}

table{
width:100%;
}

.toolbar{
margin-bottom:15px;
}

.toolbar input{
width:300px;
padding:10px;
border:1px solid #ddd;
border-radius:8px;
}

.badge{
padding:5px 12px;
border-radius:30px;
font-size:12px;
font-weight:bold;
}

.active{
background:#dcfce7;
color:#15803d;
}

.pending{
background:#fff3cd;
color:#b45309;
}

.partial {
  background: #e3f2fd;
  color: #1565c0;
}

.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.inactive{
background:#e2e8f0;
color:#475569;
}

.terminated{
background:#fee2e2;
color:#dc2626;
}

.available{
  background:#e8f5e9;
  color:#2e7d32;
}

.occupied{
  background:#ffebee;
  color:#c62828;
}

.maintenance{
  background:#fff8e1;
  color:#f9a825;
}

.empty {
  background: #f1f5f9;
  color: #64748b;
}

.badge{
  padding:6px 12px;
  border-radius:20px;
  font-size:12px;
  font-weight:600;
  display:inline-block;
}

.pending{
  background:#fff3cd;
  color:#b45309;
}

.approved{
  background:#dcfce7;
  color:#15803d;
}

.rejected{
  background:#fee2e2;
  color:#dc2626;
}

.expired{
  background:#fee2e2;
  color:#dc2626;
}

  `]
})
export class TableComponent
implements AfterViewInit, OnChanges {

// INPUT
  @Input() data: any[] = [];

  @Input() columns: string[] = [];
  
  @Input() headers: { [key:string]: string } = {};
  
  @Input() badges: string[] = [];
  
  @Input() dates: string[] = [];
  
  @Input() showActions = false;
  
  @Input() showView = false;
  
  @Input() showEdit = true;
  
  @Input() showDelete = true;
  
  @Input() pageSize = 5;
  
  @Input() pageSizeOptions = [5,10,20,50];
  
  @Output() view = new EventEmitter<any>();
  
  @Output() edit = new EventEmitter<any>();
  
  @Output() delete = new EventEmitter<any>();
  
  @Output() rowClick = new EventEmitter<any>();

  @Input() badgeLabels: { [key: string]: string } = {};

@Input() badgeClasses: { [key: string]: string } = {};

@Input() showApprove = false;

@Input() showReject = false;

@Output() approve = new EventEmitter<any>();

@Output() reject = new EventEmitter<any>();

@Input() badgeIcons: { [key: string]: string } = {};

//une propriété calculée
  displayedColumns: string[] = [];

  private updateColumns() {
  
    this.displayedColumns = [...this.columns];
  
    if (this.showActions) {
      this.displayedColumns.push('actions');
    }
  
  }

  dataSource =
    new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
sort!: MatSort;

  ngOnChanges() {

    this.dataSource.data = this.data;
  
    this.updateColumns();
  
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
  }

  search(value: string) {

    value = value.trim().toLowerCase();
  
    this.dataSource.filterPredicate = (data, filter) =>
  
      this.columns.some(col =>
        String(data[col] ?? '')
          .toLowerCase()
          .includes(filter)
      );
  
    this.dataSource.filter = value;
  
    if (this.paginator) {
      this.paginator.firstPage();
    }
  
  }

}