import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LicenceComponent } from './licence.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '', component: LicenceComponent,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  data: {
    title: 'Agreement | New Age Alpha',
    description: 'Licence Agreement',
    keywords: 'New Age Alpha'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LicenceRoutingModule { }
