import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    if (!localStorage.getItem('t_k')) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } else {
    // In SSR, deny access or allow based on SSR handling strategy
    return false;
  }
};
