import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { oktaGuideComponent } from '../oktaGuide/oktaGuide';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [
  {
    path: '',
    component: oktaGuideComponent,
  //  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
    data: {
      title: 'OKTA Configuration Guide | New Age Alpha',
      description: 'OKTA Configuration Guide',
      keywords: 'New Age Alpha'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class oktaGuideRoutingModule { }
