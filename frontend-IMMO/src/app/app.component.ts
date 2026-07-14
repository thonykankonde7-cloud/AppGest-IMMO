import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  NgxUiLoaderModule
} from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxUiLoaderModule
  ],
  template: `
    <ngx-ui-loader></ngx-ui-loader>

    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  appName = 'AppGest-Immeuble';
}