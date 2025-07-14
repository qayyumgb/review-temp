import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: AccountsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
