import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  MatSelectModule
} from '@angular/material/select';

@Component({
  selector: 'app-saas-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
  <div class="page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h2>⚙️ Paramètres SaaS</h2>
        <p>
          Configuration globale
          de votre plateforme
        </p>
      </div>

      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="loading">

        <mat-icon>
          save
        </mat-icon>

        {{
          loading
          ? 'Sauvegarde...'
          : 'Enregistrer'
        }}
      </button>

    </div>

    <form [formGroup]="form">

      <!-- INFOS -->
      <mat-card class="card">

        <h3>
          <mat-icon>
            business
          </mat-icon>
          Informations SaaS
        </h3>

        <div class="grid">

          <mat-form-field appearance="outline">
            <mat-label>
              Nom plateforme
            </mat-label>

            <input
              matInput
              formControlName="app_name"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>
              Email support
            </mat-label>

            <input
              matInput
              formControlName="support_email"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>
              Téléphone support
            </mat-label>

            <input
              matInput
              formControlName="support_phone"
            />
          </mat-form-field>

        </div>

      </mat-card>

      <!-- FACTURATION -->
      <mat-card class="card">

        <h3>
          <mat-icon>
            payments
          </mat-icon>
          Facturation
        </h3>

        <div class="grid">

          <mat-form-field appearance="outline">
            <mat-label>
              Devise
            </mat-label>

            <mat-select
              formControlName="currency">

              <mat-option value="USD">
                USD ($)
              </mat-option>

              <mat-option value="CDF">
                CDF (FC)
              </mat-option>

              <mat-option value="EUR">
                EUR (€)
              </mat-option>

            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>
              TVA (%)
            </mat-label>

            <input
              matInput
              type="number"
              formControlName="tax"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>
              Essai gratuit (jours)
            </mat-label>

            <input
              matInput
              type="number"
              formControlName="trial_days"
            />
          </mat-form-field>

        </div>

      </mat-card>

      <!-- AUTH -->
      <mat-card class="card">

        <h3>
          <mat-icon>
            security
          </mat-icon>
          Authentification
        </h3>

        <div class="toggle-group">

          <mat-slide-toggle
            formControlName="google_login">

            Activer Google Login
          </mat-slide-toggle>

          <mat-slide-toggle
            formControlName="email_login">

            Activer Login Email
          </mat-slide-toggle>

          <mat-slide-toggle
            formControlName="registration_open">

            Autoriser inscription
          </mat-slide-toggle>

        </div>

      </mat-card>

      <!-- ABONNEMENTS -->
      <mat-card class="card">

        <h3>
          <mat-icon>
            workspace_premium
          </mat-icon>
          Abonnements
        </h3>

        <div class="toggle-group">

          <mat-slide-toggle
            formControlName="allow_free_plan">

            Autoriser plan gratuit
          </mat-slide-toggle>

          <mat-slide-toggle
            formControlName="auto_suspend">

            Suspension auto après expiration
          </mat-slide-toggle>

        </div>

      </mat-card>

    </form>

  </div>
  `,
  styles: [`
    *{
      box-sizing:border-box;
    }

    .page{
      padding:24px;
      background:#f5f7fa;
      min-height:100vh;
    }

    .header{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
      gap:20px;
      flex-wrap:wrap;
    }

    .header h2{
      margin:0;
      color:#1b5e20;
    }

    .header p{
      margin:5px 0 0;
      color:#666;
    }

    .card{
      padding:20px;
      border-radius:18px;
      margin-bottom:20px;
    }

    h3{
      display:flex;
      align-items:center;
      gap:8px;
      margin-bottom:20px;
      color:#1b5e20;
    }

    .grid{
      display:grid;
      grid-template-columns:
      repeat(auto-fit,minmax(250px,1fr));
      gap:15px;
    }

    mat-form-field{
      width:100%;
    }

    .toggle-group{
      display:flex;
      flex-direction:column;
      gap:15px;
    }

    @media(max-width:768px){

      .page{
        padding:15px;
      }

      .header{
        flex-direction:column;
        align-items:flex-start;
      }
    }
  `]
})
export class SaasSettingsComponent
implements OnInit {

  private apiUrl =
    'http://localhost:8080/saas-settings';

  loading = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,

    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  ngOnInit(): void {

    this.form =
      this.fb.group({

        app_name: [
          'AppGest IMMO',
          Validators.required
        ],

        support_email: [''],

        support_phone: [''],

        currency: ['USD'],

        tax: [0],

        trial_days: [7],

        google_login: [true],

        email_login: [true],

        registration_open: [true],

        allow_free_plan: [false],

        auto_suspend: [true]
      });

    this.loadSettings();
  }

  getHeaders() {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return {};
    }

    const token =
      localStorage.getItem(
        'token'
      );

    return {
      headers:
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      })
    };
  }

  loadSettings() {

    this.http.get<any>(
      this.apiUrl,
      this.getHeaders()
    ).subscribe({

      next: (res) => {

        if (res) {
          this.form.patchValue(res);
        }
      },

      error: () => {}
    });
  }

  save() {

    if (
      this.form.invalid
    ) return;

    this.loading = true;

    this.http.post(
      `${this.apiUrl}/save`,
      this.form.value,
      this.getHeaders()
    ).subscribe({

      next: () => {

        this.loading = false;

        this.snack.open(
          'Paramètres sauvegardés',
          'OK',
          {
            duration: 3000
          }
        );
      },

      error: () => {

        this.loading = false;

        this.snack.open(
          'Erreur sauvegarde',
          'OK',
          {
            duration: 3000
          }
        );
      }
    });
  }
}