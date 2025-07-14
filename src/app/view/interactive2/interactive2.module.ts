import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { Interactive2RoutingModule } from './interactive2-routing.module';
import { Interactive2Component } from './interactive2.component';
import { MaterialModule } from '../../material-module';
import { NullDashPipePipe } from '../../core/pipes/null-dash-pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { InteractiveRightComponent } from './right-component/right-components';
import { FilterLiquidityComponent } from './filters/liquidity/liquidity-component';
import { FilterMarketCapComponent } from './filters/market-cap/market-component';
import { FilterHFactorCapComponent } from './filters/h-factor/h-factor-component';
import { FilterUniverseComponent } from './filters/universe/universe-component';
import { FilterStocksComponent } from './filters/stocks/stocks-component';
import { FilterGlobalSearchComponent } from './filters/globalsearch/globalsearch-component';

//import { RightComponentsComponent } from '../../standalone-components/right-components/right-components.component';


@NgModule({
  declarations: [Interactive2Component, InteractiveRightComponent, FilterLiquidityComponent, FilterMarketCapComponent, FilterHFactorCapComponent, FilterUniverseComponent, FilterStocksComponent,FilterGlobalSearchComponent],
  imports: [AsyncPipe, CommonModule, Interactive2RoutingModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), 
    MaterialModule, FormsModule, ReactiveFormsModule, CustomModulePipeModule, NgxSkeletonLoaderModule.forRoot()
  ], providers: [NullDashPipePipe, AsyncPipe, MaterialModule],
})
export class Interactive2Module { }
