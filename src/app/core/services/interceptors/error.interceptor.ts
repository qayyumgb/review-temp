import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NGXLogger, NgxLoggerLevel } from "ngx-logger";

import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { SharedDataService, isNotNullOrUndefined } from '../sharedData/shared-data.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
 
  // _logger:NGXLogger;
  constructor(private logger: LoggerService,
    private router: Router, public sharedData: SharedDataService
   // logger: NGXLogger
  ){
    //this._logger = logger;
  }

  //intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  //  var that = this;

  //  return next.handle(request).pipe(catchError(err => {
  //    //console.log(err);
  //    this._logger.error(err.message);
  //    if (err.status === 401) {
  //      // auto logout if 401 response returned from api
  //      if (localStorage.getItem('rToken') === null) {
  //        //this.authenticationService.logout();
  //        location.reload();
  //      }
  //      else {
  //        var log = '/login?pre=y';
  //        if (window.location.href.indexOf('pre=y') > -1) {
  //          if (window.location.href.indexOf('login') == -1 && (window.location.pathname != '/')) that.router.navigateByUrl(log);
  //        }
  //        else {
  //          if (window.location.href.indexOf('login') == -1 && (window.location.pathname != '/')) {
  //            this.authenticationService.authState.next(false);
  //            that.router.navigate(['login']);
  //          }
  //        }
  //      }
  //    }

  //    const error = err.error.message || err.statusText;


  //    return throwError(error);
  //  }))
  //}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var that = this;
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (isNotNullOrUndefined(error.message)) { that.logger.logError(error.message,''); }
        if (isNotNullOrUndefined(error.status) && error.status === 401) {
          that.sharedData.showRebalanceTrigger.next(false);
          that.sharedData.openWatchlist.next(false);
           that.sharedData.openNotification.next(false);
          that.router.navigate(['logout']);
        }
        const err:any = error.error.message || error.statusText;
        return throwError(err);
      })
    );
  }
}
