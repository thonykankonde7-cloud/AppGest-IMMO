import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="stats-container">

    <div class="stat-card">
      <div class="icon">🏢</div>
      <div class="info">
        <h4>Agences</h4>
        <p>{{ stats.total_agencies || 0 }}</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="icon">👥</div>
      <div class="info">
        <h4>Utilisateurs</h4>
        <p>{{ stats.total_users || 0 }}</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="icon">👨‍💼</div>
      <div class="info">
        <h4>Admins</h4>
        <p>{{ stats.total_admins || 0 }}</p>
      </div>
    </div>

    <div class="stat-card highlight">
      <div class="icon">💰</div>
      <div class="info">
        <h4>Revenus SaaS</h4>
        <p>{{ stats.total_income || 0 | currency:'USD' }}</p>
      </div>
    </div>

  </div>
  `,
  styles: [`
    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,.05);
      transition: 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .icon {
      font-size: 22px;
    }

    .info h4 {
      margin: 0;
      font-size: 12px;
      color: #777;
      font-weight: 500;
    }

    .info p {
      margin: 2px 0 0;
      font-size: 18px;
      font-weight: 700;
      color: #222;
    }

    .highlight {
      border-left: 4px solid #1976d2;
      background: linear-gradient(135deg,#e3f2fd,#fff);
    }

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .stats-container {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 992px) {
      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .stats-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GlobalStatsComponent {

  @Input() stats: any = {};

}