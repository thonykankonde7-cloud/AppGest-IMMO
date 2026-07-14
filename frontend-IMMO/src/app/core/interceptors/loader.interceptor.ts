import {
    HttpInterceptorFn
  } from '@angular/common/http';
  
  import { inject } from '@angular/core';
  
  import { finalize } from 'rxjs';
  
  import {
    NgxUiLoaderService
  } from 'ngx-ui-loader';
  
  export const loaderInterceptor: HttpInterceptorFn =
    (req, next) => {
  
      const loader =
        inject(NgxUiLoaderService);
  
      loader.start();
  
      return next(req).pipe(
  
        finalize(() => {
          loader.stop();
        })
  
      );
    };