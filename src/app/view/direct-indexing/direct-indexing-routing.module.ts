import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectIndexComponent } from './direct-indexing.component';
import { AuthGuard } from '../../core/services/guards';
const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  component: DirectIndexComponent,
  data: {
    title: 'Direct Indexing | New Age Alpha',
    description: 'Direct Indexing',
    keywords: 'New Age Alpha',
    preload: true
  }
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirectIndexingRoutingModule { }
