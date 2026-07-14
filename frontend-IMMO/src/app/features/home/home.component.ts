import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule],
  template: `
  <div class="wrapper sticky">
    <nav class="navbar-fixed-top">
      <a href="#" class="logo">
        <mat-icon>storefront</mat-icon>
        Immeubles Management System
      </a>
    </nav>
  </div>

  <div class="hero">
    <div class="overlay">
      <h1>🏢 AppGest-immeuble</h1>
      <p class="subtitle">
        La solution moderne pour gérer facilement vos immeubles, appartements et locataires à Kinshasa.
      </p>

      <div class="actions">
        <button class="btn primary" (click)="handleStart()">Commencer</button>
        <button class="btn secondary" (click)="scrollToFeatures()">En savoir plus</button>
      </div>
    </div>
  </div>

  <section id="features" class="features">
    <h2>✨ Fonctionnalités principales</h2>

    <div class="grid">
      <div class="card">
        <h3>🏘️ Gestion des immeubles</h3>
        <p>Ajoutez et organisez tous vos bâtiments en un seul endroit.</p>
      </div>

      <div class="card">
        <h3>👨‍👩‍👧 Locataires</h3>
        <p>Suivez vos locataires et leurs contrats facilement.</p>
      </div>

      <div class="card">
        <h3>💰 Paiements</h3>
        <p>Gérez loyers, paiements et dettes sans stress.</p>
      </div>

      <div class="card">
        <h3>📄 Documents</h3>
        <p>Stockez contrats et fichiers importants en toute sécurité.</p>
      </div>
    </div>
  </section>

  <!-- CTA simplifié sans bouton -->
  <section class="cta">
    <h2>Simplifiez la gestion de vos immeubles dès aujourd’hui</h2>
    <p>Une application rapide, sécurisée et adaptée aux gestionnaires immobiliers.</p>
  </section>

  <footer>
    <p>© 2026 AppGest-immeuble - Gestion immobilière moderne à Kinshasa</p>
    <h3>All rights reserved &#64;Thony Dev</h3>
  </footer>
  `,
  styles: [`
  .navbar-fixed-top {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    background: #2e7d32;
    color: white;
  }

  .logo {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: white;
  }

  .hero {
    height: 90vh;
    background: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c') center/cover no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .overlay {
    background: rgba(0,0,0,0.6);
    padding: 40px;
    text-align: center;
    border-radius: 12px;
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .btn {
    padding: 12px 20px;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-weight: bold;
  }

  .primary {
    background: #2e7d32;
    color: white;
  }

  .secondary {
    background: white;
    color: #2e7d32;
  }

  .features {
    padding: 60px 20px;
    text-align: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .card {
    padding: 20px;
    border-radius: 10px;
    background: #f5f5f5;
  }

  .cta {
    background: #2e7d32;
    color: white;
    text-align: center;
    padding: 60px 20px;
  }

  footer {
    text-align: center;
    padding: 20px;
    background: #111;
    color: white;
  }
  `]
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  // 🎯 bouton principal unique
  handleStart() {
    this.router.navigate(['/login']);
  }

  scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}