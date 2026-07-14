import {
    HttpInterceptorFn
  } from '@angular/common/http';
  
  import {
    inject,
    PLATFORM_ID
  } from '@angular/core';
  
  import {
    isPlatformBrowser
  } from '@angular/common';
  
  import {
    Router
  } from '@angular/router';
  
  import {
    catchError
  } from 'rxjs/operators';
  
  import {
    throwError
  } from 'rxjs';
  
  export const authInterceptor:
  HttpInterceptorFn = (
  
    req,
    next
  
  ) => {
  
    const router =
      inject(Router);
  
    const platformId =
      inject(PLATFORM_ID);
  
    let token = '';
  
    if (
      isPlatformBrowser(
        platformId
      )
    ) {
      token =
        localStorage.getItem(
          'token'
        ) || '';
    }
  
    const clonedReq =
      req.clone({
  
        setHeaders: {
          Authorization:
            token
            ? `Bearer ${token}`
            : ''
        }
  
      });
  
    return next(
      clonedReq
    ).pipe(
  
      catchError(
        (err) => {
  
          if (
            err.status === 401
          ) {
  
            if (
              isPlatformBrowser(
                platformId
              )
            ) {
  
              localStorage.clear();
            }
  
            router.navigate(
              ['/login']
            );
          }
  
          return throwError(
            () => err
          );
        }
      )
    );
  };