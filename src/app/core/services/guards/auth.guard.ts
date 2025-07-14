import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService 
    ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (sessionStorage.getItem('currentUser')) {
      if (sessionStorage.getItem('rToken') === null) {
        //this.authenticationService.logout();
        this.router.navigate(['/logout']);
        return false;
      } else {
        // authorised so return true
        if (sessionStorage.getItem('rToken') == "") {
          //this.authenticationService.startTimer(JSON.parse(sessionStorage['currentUser']).sessionTimeOut);
        }
        return true;
      }
    } else {
      this.router.navigate(['/login']);
      //this.authenticationService.logout();
      return false;
    }
    // not logged in so redirect to login page with the return url
    //this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});

  }
}
