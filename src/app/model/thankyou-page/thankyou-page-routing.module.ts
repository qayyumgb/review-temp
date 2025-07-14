import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThankyouPageComponent } from '../thankyou-page/thankyou-page.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [
  {
    path: '',
    component: ThankyouPageComponent,
  //  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
    data: {
      title: 'Thankyou Page | New Age Alpha',
      description: 'Thankyou Page',
      keywords: 'New Age Alpha'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThankyouPageRoutingModule { }
