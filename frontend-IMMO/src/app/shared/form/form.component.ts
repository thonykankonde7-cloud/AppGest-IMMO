import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  template: `

<div class="card">

  <!-- HEADER -->
  <div class="card-header">

    <div>
      <h2>{{ title }}</h2>

      <p *ngIf="subtitle">
        {{ subtitle }}
      </p>

    </div>

    <ng-content select="[header-action]"></ng-content>

  </div>


  <!-- CONTENT -->
  <div class="form-grid">

    <ng-content></ng-content>

  </div>


  <!-- FOOTER -->
  <div class="actions">


  <button
  *ngIf="showCancel"
  type="button"
  class="btn-cancel"
  [matTooltip]="cancelTooltip"
  (click)="cancel.emit()"
  [disabled]="loading">

  {{ cancelText }}

</button>


<button
  type="button"
  class="btn-save"
  [matTooltip]="saveTooltip"
  (click)="save.emit()"
  [disabled]="loading">

  <span *ngIf="!loading">
    {{ saveText }}
  </span>

  <span *ngIf="loading">
    Chargement...
  </span>

</button>


  </div>


</div>


  `,
  styles: [`

.card {

 background:white;

 border-radius:20px;

 padding:28px;

 box-shadow:
 0 10px 30px rgba(0,0,0,.06);

 animation:
 fade .25s ease;

}

.card {

background:white;

border-radius:20px;

padding:28px;

margin-bottom:25px;

box-shadow:
0 10px 30px rgba(15,23,42,.08);

}


@keyframes fade {

 from {
  opacity:0;
  transform:translateY(10px);
 }

 to {
  opacity:1;
  transform:none;
 }

}



.card-header {

 display:flex;

 justify-content:space-between;

 align-items:flex-start;

 margin-bottom:25px;

}


.card-header h2 {

 margin:0;

 font-size:22px;

 font-weight:700;

 color:#1e293b;

}



.card-header p {

 margin:8px 0 0;

 color:#64748b;

 font-size:14px;

}



.form-grid {

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(300px,1fr));

gap:20px;

width:100%;

}


/* Elements projetés */

:host ::ng-deep input,
:host ::ng-deep select,
:host ::ng-deep textarea {


 width:100%;

 box-sizing:border-box;

 border:

 1px solid #dbe2ea;

 border-radius:12px;

 padding:0 15px;

 height:48px;

 font-size:14px;

 transition:.25s;

}



:host ::ng-deep textarea {

 height:120px;

 padding-top:12px;

 resize:vertical;

}



:host ::ng-deep input:focus,
:host ::ng-deep select:focus,
:host ::ng-deep textarea:focus {


 border-color:#16a34a;

 outline:none;

 box-shadow:

 0 0 0 4px rgba(22,163,74,.12);

}



/* Angular Material projeté */

:host ::ng-deep mat-form-field {
  width:100%;
}


:host ::ng-deep .mat-mdc-form-field {
  width:100%;
}


:host ::ng-deep .mat-mdc-text-field-wrapper {

  border-radius:12px;

}



.actions {

 margin-top:30px;

 display:flex;

 justify-content:flex-end;

 gap:15px;

}



button {


 height:46px;

 padding:0 28px;

 border-radius:12px;

 border:none;

 font-weight:600;

 cursor:pointer;

 transition:.25s;

}



button:disabled {

 opacity:.6;

 cursor:not-allowed;

}



.btn-save {


 background:

 linear-gradient(
 135deg,
 #16a34a,
 #22c55e
 );


 color:white;

}



.btn-save:hover:not(:disabled){

 transform:translateY(-2px);

}



.btn-cancel {


 background:#fee2e2;

 color:#991b1b;

}



.btn-cancel:hover:not(:disabled){

 background:#fecaca;

}



@media(max-width:768px){


.card {

 padding:20px;

}


.card-header {

 flex-direction:column;

 gap:15px;

}


.form-grid {

 grid-template-columns:1fr;

}



.actions {

 flex-direction:column-reverse;

}


button {

 width:100%;

}


}


`]
})
export class FormComponent {


  @Input()
  title = '';


  @Input()
  subtitle = '';



  @Input()
  saveText = 'Enregistrer';



  @Input()
  cancelText = 'Annuler';



  @Input()
  showCancel = true;



  /**
   * Gestion du chargement
   */
  @Input()
  loading = false;



  @Output()
  save = new EventEmitter<void>();



  @Output()
  cancel = new EventEmitter<void>();

  @Input()
  saveTooltip = 'Enregistrer les informations';
  
  @Input()
  cancelTooltip = 'Annuler';
}