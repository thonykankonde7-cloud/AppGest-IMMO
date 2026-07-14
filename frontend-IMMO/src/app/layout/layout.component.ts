import {
  Component,
  OnInit
} from '@angular/core';

import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
<div class="layout">

<app-sidebar
  [sidebarCollapsed]="sidebarCollapsed"
  (collapsedChange)="onSidebarCollapse($event)">
</app-sidebar>

<main class="main">
  <app-header></app-header>

  <section class="content">
    <router-outlet></router-outlet>
  </section>
</main>

</div>
  `,
  styles: [`
.layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow:hidden;
}

/* MAIN TOUJOURS FLUIDE */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow:hidden;
}

/* CONTENT FULL WIDTH AUTOMATIQUE */
.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f4f7fc;
}

    @media(max-width:768px){
      .main{
        margin-left:0 !important;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {

  sidebarCollapsed = false;

  ngOnInit(): void {
    this.sidebarCollapsed =
      localStorage.getItem('sidebarCollapsed') === 'true';
  }
  
  onSidebarCollapse(state: boolean): void {
    this.sidebarCollapsed = state;
  
    // FORCE CHANGE DETECTION VISUEL (important)
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}