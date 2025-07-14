import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { CustomPrebuildRoutingModule } from './custom-prebuild-routing.module';
import { CustomPrebuildComponent } from './custom-prebuild.component';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { NumWithCommaPipe, NumWithCommaPipeRtnNullDash } from '../../core/pipes/num-with-comma.pipe';
import { MaterialModule } from '../../material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { IndSelectDropdownComponent } from './ind-select-dropdown/ind-select-dropdown.component';
import { UniverseDropdownComponent } from './universe-dropdown/universe-dropdown.component';
import { HfactorComponentComponent } from './hfactor-component/hfactor-component.component';


@NgModule({
  declarations: [CustomPrebuildComponent],
  imports: [AsyncPipe, CommonModule, IndSelectDropdownComponent, UniverseDropdownComponent, HfactorComponentComponent,
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, CustomPrebuildRoutingModule  
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule, NumWithCommaPipe, NumWithCommaPipeRtnNullDash]
})
export class CustomPrebuildModule { }
