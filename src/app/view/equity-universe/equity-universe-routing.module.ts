import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquityUniverseComponent } from './equity-universe.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: EquityUniverseComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquityUniverseRoutingModule { }
