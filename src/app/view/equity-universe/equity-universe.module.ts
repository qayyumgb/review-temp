import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { EquityUniverseRoutingModule } from './equity-universe-routing.module';
import { EquityUniverseComponent } from './equity-universe.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LeftgridComponent } from './leftgrid/leftgrid.component';
import { CenterCircleComponent } from './center-circle/center-circle.component';
import { RightGridComponent } from './right-grid/right-grid.component';
import { BreadcrumbListComponent } from './breadcrumb-list/breadcrumb-list.component';
import { FirstAndLastPipe } from './breadcrumb-list/firstandlast-pipe';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { MaterialModule } from '../../material-module';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';
import { CircleLoaderSvgStandaloneComponent } from '../../standalone-components/circle-loader-standalone/circle-loader-svg.component';

@NgModule({
  declarations: [FirstAndLastPipe,
    BreadcrumbListComponent,
    EquityUniverseComponent,
    LeftgridComponent,
    CenterCircleComponent,
    RightGridComponent,
  ], imports: [AsyncPipe, CommonModule, EquityUniverseRoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), CircleLoaderSvgStandaloneComponent,
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, NgxSkeletonLoaderModule.forRoot(), DirectiveControlModule,
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule, FirstAndLastPipe],
  exports: [FirstAndLastPipe]
})
export class EquityUniverseModule { }
