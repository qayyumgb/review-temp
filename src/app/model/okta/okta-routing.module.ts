import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OktaComponent } from './okta.component';

const routes: Routes = [{
  path: '',
  component: OktaComponent,
  data: {
    title: 'okta hosted page | New Age Alpha',
    description: 'okta',
    keywords: 'New Age Alpha',
    data: { preload: true }
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OktaRoutingModule { }
