import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPrebuildComponent } from './custom-prebuild.component';
import { AuthGuard } from '../../core/services/guards';

const routes: Routes = [{
  path: '', component: CustomPrebuildComponent,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomPrebuildRoutingModule { }
