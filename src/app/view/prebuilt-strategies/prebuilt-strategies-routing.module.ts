import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrebuiltStrategiesComponent } from './prebuilt-strategies.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '', component: PrebuiltStrategiesComponent,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  data: {
    title: 'Prebuilt Strategies | New Age Alpha',
    description: 'Prebuilt Strategies',
    keywords: 'New Age Alpha',
    preload: true
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrebuiltStrategiesRoutingModule { }
