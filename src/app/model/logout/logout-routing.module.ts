import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { logoutComponent } from './logout.component';

const routes: Routes = [{
  path: '', component: logoutComponent,
  data: {
    title: 'Logout | New Age Alpha',
    description: 'logout',
    keywords: 'New Age Alpha'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class logoutRoutingModule { }
