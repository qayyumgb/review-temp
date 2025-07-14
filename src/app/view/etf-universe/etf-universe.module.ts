import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { EtfUniverseRoutingModule } from './etf-universe-routing.module';
import { EtfUniverseComponent } from './etf-universe.component';
import { LeftGridComponent } from './left-grid/left-grid.component';
import { RightGridComponent } from './right-grid/right-grid.component';
import { CenterCircleComponent } from './center-circle/center-circle.component';
import { BreadcrumbListComponent, FirstAndLastPipe } from './breadcrumb-list/breadcrumb-list.component';
import { MaterialModule } from '../../material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CircleLoaderSvgStandaloneComponent } from '../../standalone-components/circle-loader-standalone/circle-loader-svg.component';

@NgModule({
  declarations: [FirstAndLastPipe,
    EtfUniverseComponent,
    LeftGridComponent,
    RightGridComponent,
    CenterCircleComponent,
    BreadcrumbListComponent
  ], imports: [AsyncPipe, CommonModule, EtfUniverseRoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, NgxSkeletonLoaderModule.forRoot(), CircleLoaderSvgStandaloneComponent
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule, FirstAndLastPipe],
  exports: [FirstAndLastPipe]
})
export class EtfUniverseModule { }
