import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Interactive2Component } from './interactive2.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: Interactive2Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Interactive2RoutingModule { }
