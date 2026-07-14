import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import {
  Observable,
  map,
  startWith
} from 'rxjs';

export interface Plan {
  id?: number;
  name: string;
  description?: string;
  price: number;
  max_buildings: number;
  max_apartments: number;
  max_users: number;
  support_type?: string;
  icon?: string;
}

@Component({
  selector: 'app-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data ? '✏️ Modifier plan' : '➕ Créer plan SaaS' }}
    </h2>

    <mat-dialog-content>

      <mat-horizontal-stepper linear>

        <!-- STEP 1 -->
        <mat-step [stepControl]="form">

          <form [formGroup]="form">

            <ng-template matStepLabel>
              Informations
            </ng-template>

            <div class="form">

              <mat-form-field appearance="outline">
                <mat-label>Nom du plan</mat-label>
                <input
                  matInput
                  formControlName="name"
                />
                <mat-error>
                  Nom obligatoire
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  rows="3"
                  formControlName="description">
                </textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prix ($)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="price"
                />
              </mat-form-field>

            </div>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                matStepperNext
                [disabled]="form.invalid">

                Suivant
              </button>
            </div>

          </form>

        </mat-step>

        <!-- STEP 2 -->
        <mat-step>

          <ng-template matStepLabel>
            Limites
          </ng-template>

          <form [formGroup]="form">

            <div class="form">

              <mat-form-field appearance="outline">
                <mat-label>Max immeubles</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="max_buildings"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max appartements</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="max_apartments"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max utilisateurs</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="max_users"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Support</mat-label>

                <mat-select formControlName="support_type">

  <mat-option value="standard">
    Standard
  </mat-option>

  <mat-option value="priority">
    Priority
  </mat-option>

  <mat-option value="24/7">
    24/7 Support
  </mat-option>

</mat-select>

              </mat-form-field>

            </div>

            <div class="actions">

              <button
                mat-button
                matStepperPrevious>
                Retour
              </button>

              <button
                mat-raised-button
                color="primary"
                matStepperNext>
                Suivant
              </button>

            </div>

          </form>

        </mat-step>

        <!-- STEP 3 -->
        <mat-step>

          <ng-template matStepLabel>
            Icône
          </ng-template>

          <div class="form">

            <mat-form-field appearance="outline">

              <mat-label>Icône du plan</mat-label>

              <input
                matInput
                [formControl]="iconControl"
                [matAutocomplete]="auto"
              />

              <mat-autocomplete
                #auto="matAutocomplete">

                <mat-option
                  *ngFor="let icon of filteredIcons | async"
                  [value]="icon">

                  <mat-icon>
                    {{ icon }}
                  </mat-icon>

                  {{ icon }}

                </mat-option>

              </mat-autocomplete>

            </mat-form-field>

            <div class="icon-preview">
              <mat-icon>
                {{ iconControl.value }}
              </mat-icon>
            </div>

          </div>

          <div class="actions">

            <button
              mat-button
              matStepperPrevious>
              Retour
            </button>

            <button
  type="button"
  mat-raised-button
  color="primary"
  (click)="save()"
  [disabled]="loading || form.invalid">

  <mat-spinner
    *ngIf="loading"
    diameter="20">
  </mat-spinner>

  <span *ngIf="!loading">
    {{ data ? 'Modifier' : 'Créer' }}
  </span>

</button>

          </div>

        </mat-step>

      </mat-horizontal-stepper>

    </mat-dialog-content>
  `,
  styles: [`
    .form{
      display:flex;
      flex-direction:column;
      gap:14px;
      width:420px;
      padding-top:10px;
    }

    mat-form-field{
      width:100%;
    }

    .actions{
      display:flex;
      justify-content:flex-end;
      gap:10px;
      margin-top:15px;
    }

    .icon-preview{
      display:flex;
      justify-content:center;
      margin:20px 0;
    }

    .icon-preview mat-icon{
      font-size:60px;
      width:60px;
      height:60px;
      color:#1b5e20;
    }

    @media(max-width:768px){
      .form{
        width:100%;
      }
    }
  `]
})
export class PlanDialogComponent implements OnInit {

  apiUrl =
    'http://localhost:8080/subscriptions';

  loading = false;

  form: FormGroup;

  iconControl =
    new FormControl('star');

  icons: string[] = [
    'star',
    'business',
    'apartment',
    'home',
    'workspace_premium',
    'diamond',
    'rocket_launch',
    'bolt',
    'verified',
    'security'
  ];

  filteredIcons!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef:
      MatDialogRef<PlanDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: Plan | null,

    @Inject(PLATFORM_ID)
    private platformId: object
  ) {

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      max_buildings: [0],
      max_apartments: [0],
      max_users: [0],
      support_type: ['standard']
    });

    // MODE EDIT
    if (this.data) {

      this.form.patchValue({
        name: this.data.name,
        description:
          this.data.description,
        price: this.data.price,
        max_buildings:
          this.data.max_buildings,
        max_apartments:
          this.data.max_apartments,
        max_users:
          this.data.max_users,
        support_type:
          this.data.support_type
      });

      this.iconControl.setValue(
        this.data.icon || 'star'
      );
    }
  }

  ngOnInit(): void {

    this.filteredIcons =
      this.iconControl.valueChanges.pipe(
        startWith(''),
        map(value =>
          this.filterIcons(value || '')
        )
      );
  }

  filterIcons(value: string) {

    const filterValue =
      value.toLowerCase();

    return this.icons.filter(icon =>
      icon.toLowerCase()
        .includes(filterValue)
    );
  }

  getToken(): string {

    if (!isPlatformBrowser(
      this.platformId
    )) return '';

    return localStorage
      .getItem('token') || '';
  }

  getHeaders() {

    return new HttpHeaders({
      Authorization:
        `Bearer ${this.getToken()}`
    });
  }

  save(): void {

    console.log('CLICK SAVE');

    if (this.form.invalid) {
      console.log('FORM INVALID');
      console.log(this.form.value);
      return;
    }

    this.loading = true;

    const payload = {
      ...this.form.value,
      icon: this.iconControl.value
    };

    console.log('PAYLOAD = ', payload);

    const request = this.data?.id

      ? this.http.patch(
        `${this.apiUrl}/update`,
        {
          id: this.data.id,
          ...payload
        },
        {
          headers: this.getHeaders()
        }
      )

      : this.http.post(
        `${this.apiUrl}/create`,
        payload,
        {
          headers: this.getHeaders()
        }
      );

    request.subscribe({

      next: (res) => {

        console.log('SUCCESS', res);

        this.loading = false;

        this.dialogRef.close(true);
      },

      error: (err) => {

        console.error('ERROR API', err);

        this.loading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}