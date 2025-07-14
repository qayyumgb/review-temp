import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectIndexingRoutingModule } from './direct-indexing-routing.module';
import { DirectIndexComponent } from './direct-indexing.component';
import { DilldownListComponent } from './left-component/dilldown-list/dilldown-list.component';
import { BuildYourIndexComponent } from './left-component/build-your-index/build-your-index.component';
import { PerformanceComponentsComponent } from './right-component/performance-components/performance-components.component';
import { ExclusionCircleComponent } from './center-component/exclusion-circle/exclusion-circle.component';
import { ReviewFactsheetComponent } from './factsheet/review-factsheet/review-factsheet.component';
import { BreadcrumbListComponent } from './left-component/breadcrumb-list/breadcrumb-list.component';
import { MaterialModule } from '../../material-module';
import { FirstAndLastPipe } from './left-component/breadcrumb-list/firstandlast-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefaultCircleComponent } from './center-component/default-circle/default-circle.component';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { CircleLoaderSvgComponent } from '../circle-loader-svg/circle-loader-svg.component';
import { AsyncPipe } from '@angular/common';
import { CommonErrorDialogComponent } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';


@NgModule({
  declarations: [
    DirectIndexComponent,
    DilldownListComponent,
    BuildYourIndexComponent,
    PerformanceComponentsComponent,
    ExclusionCircleComponent,
    ReviewFactsheetComponent, BreadcrumbListComponent,
    FirstAndLastPipe,
    DefaultCircleComponent, CommonErrorDialogComponent
  ],
  imports: [AsyncPipe, CommonModule, DirectIndexingRoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, DirectiveControlModule,
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule]
})
export class DirectIndexingModule { }
