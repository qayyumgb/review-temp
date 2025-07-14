import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//import { AuthGuard } from '../../core/guards/auth.guard';

import { DashboardComponentSpinner } from './dashboard.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '', component: DashboardComponentSpinner,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  data: {
    title: 'Dashboard | New Age Alpha',
    description: 'Dashboard',
    keywords: 'New Age Alpha',
    preload: true
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModuleSpinner { }
