import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovedStrategiesComponent } from './approved-strategies.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: ApprovedStrategiesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovedStrategiesRoutingModule { }
