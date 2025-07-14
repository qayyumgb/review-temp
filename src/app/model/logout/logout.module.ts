import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { logoutRoutingModule } from './logout-routing.module';
import { logoutComponent } from './logout.component';


@NgModule({
  declarations: [
    logoutComponent
  ],
  imports: [
    CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), 
    logoutRoutingModule
  ]
})
export class LogoutModule { }
