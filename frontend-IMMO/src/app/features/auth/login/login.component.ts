import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import {
  HttpClient,
} from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';

import {
  NgxUiLoaderService
} from 'ngx-ui-loader';
import { MatSnackBar } from '@angular/material/snack-bar';


declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  template: `
  <div class="login-container">

    <div class="card">

      <div class="logo">
        <mat-icon>apartment</mat-icon>
        <h2>AppGest IMMO</h2>
      </div>

      <p class="subtitle">
        Accédez à votre espace de gestion
      </p>

      <!-- EMAIL -->
      <input
        type="email"
        placeholder="Adresse email"
        [(ngModel)]="email"
      />

      <!-- PASSWORD -->
      <div class="password-field">

        <input
          [type]="hidePassword ? 'password' : 'text'"
          placeholder="Mot de passe"
          [(ngModel)]="password"
        />

        <mat-icon (click)="togglePassword()">
          {{ hidePassword ? 'visibility' : 'visibility_off' }}
        </mat-icon>

      </div>

      <!-- LOGIN BUTTON -->
      <button
        class="btn primary"
        (click)="login()"
        [disabled]="isLoading">

        {{ isLoading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <div class="divider">
        OU
      </div>

      <!-- GOOGLE BUTTON -->
      <div id="googleBtn"></div>

    </div>

  </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .login-container {
      width: 100%;
      min-height: 100vh;

      display: flex;
      justify-content: center;
      align-items: center;

      padding: 20px;

      background:
        linear-gradient(
          135deg,
          #1b5e20,
          #43a047
        );
    }

    .card {
      width: 100%;
      max-width: 380px;

      background: white;

      padding: 35px;
      border-radius: 18px;

      box-shadow:
        0 10px 30px rgba(0,0,0,0.15);

      animation: fadeIn .4s ease;
    }

    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      margin-bottom: 10px;
    }

    .logo mat-icon {
      color: #1b5e20;
      font-size: 34px;
      width: 34px;
      height: 34px;
    }

    .logo h2 {
      margin: 0;
      color: #1b5e20;
      font-size: 28px;
      font-weight: bold;
    }

    .subtitle {
      text-align: center;
      color: #777;
      margin-bottom: 25px;
    }

    input {
      width: 100%;

      padding: 14px;
      margin-bottom: 15px;

      border-radius: 10px;
      border: 1px solid #ddd;

      outline: none;

      transition: .3s;
      font-size: 14px;
    }

    input:focus {
      border-color: #2e7d32;
      box-shadow: 0 0 0 3px rgba(46,125,50,.1);
    }

    .password-field {
      position: relative;
    }

    .password-field mat-icon {
      position: absolute;
      top: 14px;
      right: 12px;

      cursor: pointer;
      color: #666;
    }

    .btn {
      width: 100%;

      border: none;
      border-radius: 10px;

      padding: 14px;

      cursor: pointer;

      font-size: 15px;
      font-weight: 600;

      transition: .3s;
    }

    .primary {
      background: #1b5e20;
      color: white;
    }

    .primary:hover {
      background: #2e7d32;
      transform: translateY(-2px);
    }

    .divider {
      margin: 20px 0;
      text-align: center;
      color: #999;
      font-size: 13px;
      position: relative;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40%;
      height: 1px;
      background: #ddd;
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    #googleBtn {
      display: flex;
      justify-content: center;
    }

    .btn:disabled {
  opacity: .7;
  cursor: not-allowed;
}

    @keyframes fadeIn {

      from {
        opacity: 0;
        transform: translateY(15px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {

  email = '';
  password = '';
  hidePassword = true;
  isLoading = false;

  private googleInitialized = false;
  private apiUrl = 'http://localhost:8080/auth';

  constructor(
    private router: Router,
    private http: HttpClient,
    private snack: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleLogin();
    }
  }

 // ================= GOOGLE INIT =================
 initGoogleLogin(): void {

  if (
    !isPlatformBrowser(
      this.platformId
    )
  ) return;

  let attempts = 0;

  const interval =
    setInterval(() => {

      attempts++;

      const googleReady =
        typeof window !== 'undefined' &&
        window.google &&
        window.google.accounts &&
        window.google.accounts.id;

      if (googleReady) {

        clearInterval(interval);

        console.log(
          '✅ Google chargé'
        );

        const googleBtn =
          document.getElementById(
            'googleBtn'
          );

        if (!googleBtn) return;

        googleBtn.innerHTML = '';

        window.google.accounts.id.initialize({
          client_id:
            '1044432086959-5r09cjdi3pd13tqm3bj2rpgsjfhlk60v.apps.googleusercontent.com',

          callback: (
            response: any
          ) => {
            this.handleGoogleLogin(
              response
            );
          }
        });

        window.google.accounts.id.renderButton(
          googleBtn,
          {
            theme: 'outline',
            size: 'large',
            width: 320
          }
        );
      }

      if (attempts > 30) {

        clearInterval(interval);

        console.error(
          '❌ Google script non chargé'
        );
      }

    }, 500);
}
// ================= GOOGLE LOGIN =================
handleGoogleLogin(response: any) {

  const token =
    response?.credential;

  if (!token) {

    this.showMessage(
      'Token Google invalide'
    );

    return;
  }

  this.isLoading = true;
  this.ngxService.start();

  this.http.post<any>(
    `${this.apiUrl}/google-login`,
    { token }
  ).subscribe({

    next: (res) => {

      this.isLoading = false;
      this.ngxService.stop();

      if (!res?.token) {

        this.showMessage(
          'Token introuvable'
        );

        return;
      }

      this.saveUser(res);

      this.showMessage(
        'Connexion Google réussie ✅'
      );

      this.redirectUser(
        res.user.role
      );
    },

    error: (err) => {

      this.isLoading = false;
      this.ngxService.stop();

      console.error(err);

      this.showMessage(
        err?.error?.message ||
        'Connexion Google échouée'
      );
    }
  });
}

  // ================= LOGIN CLASSIQUE =================
  login() {

    if (this.isLoading) return;
  
    if (!this.email?.trim() || !this.password?.trim()) {
  
      this.showMessage(
        'Email et mot de passe requis'
      );
  
      return;
    }
  
    this.isLoading = true;
    this.ngxService.start();
  
    this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email: this.email.trim(),
        password: this.password
      }
    ).subscribe({
  
      next: (res) => {
  
        this.isLoading = false;
        this.ngxService.stop();
  
        if (!res?.token) {
  
          this.showMessage(
            'Token introuvable'
          );
  
          return;
        }
  
        this.saveUser(res);
  
        this.showMessage(
          'Connexion réussie ✅'
        );
  
        this.redirectUser(
          res.user.role
        );
      },
  
      error: (err) => {
  
        this.isLoading = false;
        this.ngxService.stop();
  
        console.error(err);
  
        this.showMessage(
          err?.error?.message ||
          'Erreur de connexion'
        );
      }
    });
  }
  // ================= SAVE USER =================
  private saveUser(
    res: any
  ) {
  
    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) return;
  
    console.log(
      'SAVING USER...'
    );
  
    localStorage.setItem(
      'token',
      res.token
    );
  
    localStorage.setItem(
      'role',
      res.user.role
    );
  
    localStorage.setItem(
      'user',
      JSON.stringify(
        res.user
      )
    );
  
    if (res.user.avatar) {
  
      localStorage.setItem(
        'avatar',
        res.user.avatar
      );
    }
  
    console.log(
      'TOKEN AFTER SAVE =',
      localStorage.getItem(
        'token'
      )
    );
  }

  // ================= REDIRECTION =================
  redirectUser(role: string) {

    const routes: any = {
      super_admin: '/super-admin/dashboard',
      admin: '/admin/dashboard',
      agent: '/agent/dashboard',
      tenant: '/tenant/dashboard'
    };

    this.router.navigate([routes[role] || '/tenant/dashboard']);
  }

  // ================= PASSWORD =================
  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  // ================= MESSAGE =================
  showMessage(message: string) {

    this.snack.open(
      message,
      'OK',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }
}