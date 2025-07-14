import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { ApprovedStrategiesRoutingModule } from './approved-strategies-routing.module';
import { ApprovedStrategiesComponent } from './approved-strategies.component';
import { DefaultCircleComponent } from './center-component/default-circle/default-circle.component';
import { ExclusionCircleComponent } from './center-component/exclusion-circle/exclusion-circle.component';
import { DilldownListComponent } from './left-component/dilldown-list/dilldown-list.component';
import { BuildYourIndexComponent } from './left-component/build-your-index/build-your-index.component';
import { BreadcrumbListComponent, FirstAndLastPipe } from './left-component/breadcrumb-list/breadcrumb-list.component';
import { ReviewFactsheetComponent } from './factsheet/review-factsheet/review-factsheet.component';
import { PerformanceComponentsComponent } from './right-component/performance-components/performance-components.component';
import { CommonErrorDialogComponent } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material-module';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';


@NgModule({
  declarations: [
    ApprovedStrategiesComponent,
    DefaultCircleComponent,
    ExclusionCircleComponent,
    DilldownListComponent,
    BuildYourIndexComponent,
    BreadcrumbListComponent,
    FirstAndLastPipe,
    ReviewFactsheetComponent,
    PerformanceComponentsComponent,
    CommonErrorDialogComponent
  ],
  imports: [AsyncPipe, CommonModule, ApprovedStrategiesRoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule,DirectiveControlModule,
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule]
})
export class ApprovedStrategiesModule { }
