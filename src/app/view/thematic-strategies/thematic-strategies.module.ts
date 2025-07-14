import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ThematicStrategiesRoutingModule } from './thematic-strategies-routing.module';


import { FirstAndLastPipe } from './left-component/breadcrumb-list/firstandlast-pipe';

import { CommonErrorDialogComponent_Thematic } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { MaterialModule } from '../../material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { BreadcrumbListComponent_Thematic } from './left-component/breadcrumb-list/breadcrumb-list.component';
import { BuildYourIndexComponent_Thematic } from './left-component/build-your-index/build-your-index.component';
import { DilldownListComponent_Thematic } from './left-component/dilldown-list/dilldown-list.component';
import { DefaultCircleComponent_Thematic } from './center-component/default-circle/default-circle.component';
import { ExclusionCircleComponent_Thematic } from './center-component/exclusion-circle/exclusion-circle.component';
import { ThematicStrategiesComponent } from './thematic-strategies.component';
import { PerformanceComponentsThematic } from './right-component/performance-components/performance-components.component';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';


@NgModule({
  declarations: [ThematicStrategiesComponent, DefaultCircleComponent_Thematic, ExclusionCircleComponent_Thematic, PerformanceComponentsThematic,
    CommonErrorDialogComponent_Thematic,
    BreadcrumbListComponent_Thematic, FirstAndLastPipe,
    BuildYourIndexComponent_Thematic,
    DilldownListComponent_Thematic,
    
  ],
  imports: [
    CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, DirectiveControlModule,
    ThematicStrategiesRoutingModule
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule]
})
export class ThematicStrategiesModule { }
