import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideClientHydration
} from '@angular/platform-browser';

import {
  provideAnimations
} from '@angular/platform-browser/animations';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import {
  routes
} from './app.routes';

import {
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  NgxUiLoaderModule,
  PB_DIRECTION,
  SPINNER
} from 'ngx-ui-loader';

import {
  loaderInterceptor
} from './core/interceptors/loader.interceptor';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';

export const appConfig:
ApplicationConfig = {

  providers: [

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideClientHydration(),

    provideAnimations(),

    importProvidersFrom(
      MatSnackBarModule,

      NgxUiLoaderModule.forRoot({

        fgsType:
          SPINNER.threeStrings,

        pbDirection:
          PB_DIRECTION.leftToRight,

        pbThickness: 4,

        fgsSize: 80,

        fgsColor: '#1b5e20',

        overlayColor:
          'rgba(0,0,0,0.2)',

        hasProgressBar: true
      })
    ),

    provideHttpClient(

      withFetch(),

      withInterceptors([
        authInterceptor,
        loaderInterceptor
      ])
    )
  ]
};