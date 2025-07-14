import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AccountLeftComponent } from './left/account-left/account-left.component';
import { AccountCenterComponent } from './center/account-center/account-center.component';
import { MaterialModule } from '../../material-module';
import { HistoryTableComponent } from './history-table/history-table.component';
import { PortfolioTableComponent } from './portfolio-table/portfolio-table.component';
import { UnrealizedGainLossTableComponent } from './unrealized-gain-loss-table/unrealized-gain-loss-table.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { IndexstepsModalComponent } from './indexsteps-modal/indexsteps-modal.component';
import { IndexfactsheetModalComponent } from './indexfactsheet-modal/indexfactsheet-modal.component';
import { DontbuyComponent } from './dontbuy/dontbuy.component';
import { CustomModulePipeModule } from '../../core/custom-module-pipe/custom-module-pipe.module';
import { DirectiveControlModule } from '../directiveControl/directive-control.module';

@NgModule({
  declarations: [
    AccountsComponent,
    AccountLeftComponent,
    AccountCenterComponent,
    HistoryTableComponent,
    PortfolioTableComponent,
    UnrealizedGainLossTableComponent,
    IndexstepsModalComponent,
    IndexfactsheetModalComponent,
    DontbuyComponent
  ],
  imports: [
    CommonModule, DirectiveControlModule,
    AccountsRoutingModule,
    MaterialModule,
    ReactiveFormsModule, FormsModule, CustomModulePipeModule
  ]
})
export class AccountsModule { }
