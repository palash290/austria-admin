import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideToastr({
      timeOut: 1000,
      progressBar: true
    }),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    provideAnimationsAsync(),
    // providePrimeNG({
    //   theme: {
    //     preset: Aura
    //   }
    // }),
  ]
};


