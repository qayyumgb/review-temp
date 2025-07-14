import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyStrategiesComponent } from './my-strategies.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: MyStrategiesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyStrategiesRoutingModule { }
