import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { messagePageComponentRoutingModule } from './messagePage-routing.module';
import { messagePageComponent } from './messagePage.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';


@NgModule({
  declarations: [
    messagePageComponent
  ],
  imports: [
    CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), 
    messagePageComponentRoutingModule
  ]
})
export class messagePageModule { }
