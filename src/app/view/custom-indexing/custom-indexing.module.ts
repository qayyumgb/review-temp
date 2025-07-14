import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { CustomIndexingRoutingModule } from './custom-indexing-routing.module';
import { DefaultCircleComponent } from './center-component/default-circle/default-circle.component';
import { BuildYourIndexComponent } from './left-component/build-your-index/build-your-index.component';
import { DilldownListComponent } from './left-component/dilldown-list/dilldown-list.component';
import { BreadcrumbListComponent } from './left-component/breadcrumb-list/breadcrumb-list.component';
import { PerformanceComponentsComponent } from './right-component/performance-components/performance-components.component';
import { CommonErrorDialogComponent } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { ReviewFactsheetComponent } from './factsheet/review-factsheet/review-factsheet.component';
import { ExclusionCircleComponent } from './center-component/exclusion-circle/exclusion-circle.component';
import { FirstAndLastPipe } from './left-component/breadcrumb-list/firstandlast-pipe';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { MaterialModule } from '../../material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { CustomIndexingComponent } from './custom-indexing.component';
import { AlphaComponent } from './center-component/alpha/alpha.component';
import { FactorComponent } from './center-component/factor/factor.component';
import { IndexstepCircleComponent } from './center-component/indexstep-circle/indexstep-circle.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { IndexStepsPerformanceComponents } from './right-component/indexsteps-performance-components/indexsteps-performance-components';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';

@NgModule({
  declarations: [
    BuildYourIndexComponent, CustomIndexingComponent,
    BreadcrumbListComponent,
    PerformanceComponentsComponent, IndexStepsPerformanceComponents,
    CommonErrorDialogComponent,
    ReviewFactsheetComponent,
    ExclusionCircleComponent, FirstAndLastPipe, AlphaComponent, FactorComponent, IndexstepCircleComponent
  ],
  imports: [
    CommonModule, AsyncPipe, NgxSkeletonLoaderModule.forRoot(), DirectiveControlModule,
    CustomIndexingRoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule,
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule]
})
export class CustomIndexingModule { }
