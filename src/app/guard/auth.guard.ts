import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service: SharedService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.service.isLogedIn()) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
//   canActivate(): boolean {
//   if (this.service.isLogedIn()) {
//     this.router.navigate(['/home/dashboard']); // Change to the appropriate route
//     return false;
//   }
//   return true;
// }

}
// canActivate(): boolean {
//   if (this.service.isLogedIn()) {
//     // If the user is logged in and trying to access login page, redirect them
//     this.router.navigate(['/home/dashboard']); // Change to the appropriate route
//     return false;
//   }
//   return true;
// }