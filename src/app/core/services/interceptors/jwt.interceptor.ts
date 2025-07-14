import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../authentication/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    //console.log("intercept")
    let currentUser = this.authenticationService.currentUserValue;

    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }); 
    if (currentUser && currentUser.token) {
      if (sessionStorage.getItem('rToken')) {  
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${atob(atob(atob(currentUser.token)))}`
          }
        });
      }
    }
    return next.handle(request);
  }
}
