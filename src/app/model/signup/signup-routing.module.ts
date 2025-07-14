import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup.component';

const routes: Routes = [{
  path: '', component: SignupComponent,
  data: {
    title: 'SignUp | New Age Alpha',
    description: 'SignUp',
    keywords: 'New Age Alpha'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupRoutingModule { }
