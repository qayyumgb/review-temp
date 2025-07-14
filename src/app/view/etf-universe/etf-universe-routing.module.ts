import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EtfUniverseComponent } from './etf-universe.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: EtfUniverseComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtfUniverseRoutingModule { }
