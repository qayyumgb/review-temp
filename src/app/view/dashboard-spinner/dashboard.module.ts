import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DashboardRoutingModuleSpinner } from './dashboard-routing.module';
import { DashboardComponentSpinner } from './dashboard.component';
import { GridsterModule } from 'angular-gridster2';
import { MaterialModule } from '../../material-module';
import { NumWithCommaPipe, NumWithCommaPipeRtnNullDash } from '../../core/pipes/num-with-comma.pipe';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
//import { DashboardCentercircleComponentSpinner } from './dashboard-centercircle/dashboard-centercircle.component';
import { GridstackModule } from 'gridstack/dist/angular';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DashboardComponentSpinner],
  imports: [AsyncPipe, CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), GridsterModule,
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, DashboardRoutingModuleSpinner, GridstackModule,
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule, NumWithCommaPipe, NumWithCommaPipeRtnNullDash]
})
export class DashboardModuleSpinner { }
