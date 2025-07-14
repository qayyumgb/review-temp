import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrebuiltStrategiesRoutingModule } from './prebuilt-strategies-routing.module';
import { DefaultCircleComponent_Prebuilt } from './center-component/default-circle/default-circle.component';
import { ExclusionCircleComponent_Prebuilt } from './center-component/exclusion-circle/exclusion-circle.component';
import { BreadcrumbListComponent_Prebuilt } from './left-component/breadcrumb-list/breadcrumb-list.component';
import { ReviewFactsheetComponent_Prebuilt } from './factsheet/review-factsheet/review-factsheet.component';
import { CommonErrorDialogComponent_Prebuilt } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { BuildYourIndexComponent_Prebuilt } from './left-component/build-your-index/build-your-index.component';
import { DilldownListComponent_Prebuilt } from './left-component/dilldown-list/dilldown-list.component';
import { PerformanceComponentsComponent_Prebuilt } from './right-component/performance-components/performance-components.component';
import { MaterialModule } from '../../material-module';
import { FirstAndLastPipe } from './left-component/breadcrumb-list/firstandlast-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
//import { CircleLoaderSvgComponent } from '../circle-loader-svg/circle-loader-svg.component';
import { AsyncPipe } from '@angular/common';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { PrebuiltStrategiesComponent } from './prebuilt-strategies.component';
import { StrategyCircleComponent } from './center-component/strategy-circle/strategy-circle.component';
import { ViewReportComponent } from './view-report/view-report.component';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';


@NgModule({
  declarations: [
    DefaultCircleComponent_Prebuilt, PrebuiltStrategiesComponent,
    ExclusionCircleComponent_Prebuilt,
    BreadcrumbListComponent_Prebuilt,
    ReviewFactsheetComponent_Prebuilt,
    CommonErrorDialogComponent_Prebuilt,
    BuildYourIndexComponent_Prebuilt,
    DilldownListComponent_Prebuilt,
    PerformanceComponentsComponent_Prebuilt, FirstAndLastPipe, StrategyCircleComponent, ViewReportComponent
  ],
  imports: [
    CommonModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), MaterialModule, DirectiveControlModule,
    PrebuiltStrategiesRoutingModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule]
})
export class PrebuiltStrategiesModule { }
