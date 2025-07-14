import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivatePwdComponent } from './activate-pwd.component';

const routes: Routes = [{ path: '', component: ActivatePwdComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivatePwdRoutingModule { }
