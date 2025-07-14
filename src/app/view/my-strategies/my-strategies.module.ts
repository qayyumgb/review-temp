import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyStrategiesRoutingModule } from './my-strategies-routing.module';
import { MyStrategiesComponent } from './my-strategies.component';

import { MaterialModule } from '../../material-module';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkDetailRowDirective } from './cdk-detail-row.directive';
import { FormsModule } from '@angular/forms';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';

@NgModule({
  declarations: [
    MyStrategiesComponent, CdkDetailRowDirective
  ],
  imports: [
    CommonModule, MaterialModule, FormsModule, DirectiveControlModule,
    MyStrategiesRoutingModule, MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatExpansionModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MyStrategiesRoutingModule
  ]
})
export class MyStrategiesModule { }
