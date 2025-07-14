import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LicenceRoutingModule } from './licence-routing.module';
import { LicenceComponent } from './licence.component';


@NgModule({
  declarations: [
    LicenceComponent
  ],
  imports: [
    CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), 
    LicenceRoutingModule
  ]
})
export class LicenceModule { }
