

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { messagePageComponent } from './messagePage.component';

const routes: Routes = [{ path: '', component: messagePageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class messagePageComponentRoutingModule { }
