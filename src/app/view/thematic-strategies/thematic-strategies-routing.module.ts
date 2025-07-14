import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThematicStrategiesComponent } from './thematic-strategies.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '', component: ThematicStrategiesComponent,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  data: {
    title: 'Thematic Strategies | New Age Alpha',
    description: 'Thematic Strategies',
    keywords: 'New Age Alpha',
    preload: true
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThematicStrategiesRoutingModule { }
