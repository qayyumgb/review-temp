import { Injectable } from '@angular/core';
import { NGXLogger, NgxLoggerLevel } from "ngx-logger";
import { environment } from '../../../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class LoggerService {    
  _logger:NGXLogger;
  constructor(logger: NGXLogger) { this._logger = logger; }

  log(msg: any, service: any) {}

  logError(msg: any, service: any) { this._logger.error(msg, environment.appName); }

}

