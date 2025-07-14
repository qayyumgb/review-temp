import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { GridsterModule } from 'angular-gridster2';
import { MaterialModule } from '../../material-module';
import { NumWithCommaPipe, NumWithCommaPipeRtnNullDash } from '../../core/pipes/num-with-comma.pipe';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { DashboardCentercircleComponent } from './dashboard-centercircle/dashboard-centercircle.component';
import { GridstackModule } from 'gridstack/dist/angular';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { DashboardCentercircleComponentSpinner } from '../dashboard-spinner/dashboard-centercircle/dashboard-centercircle.component';
import { DashboardCentercircleComponentSpinnerInner } from './dashboard-centercircle-spinner/dashboard-centercircle.component';
import { SvgSpaceImgComponent } from '../../standalone-components/svg-space-img/svg-space-img.component';

@NgModule({
  declarations: [DashboardComponent, DashboardCentercircleComponent, DashboardCentercircleComponentSpinnerInner, ],
  imports: [AsyncPipe, CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), GridsterModule,
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, DashboardRoutingModule, GridstackModule, SvgSpaceImgComponent
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule, NumWithCommaPipe, NumWithCommaPipeRtnNullDash]
})
export class DashboardModule { }
