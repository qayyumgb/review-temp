import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomIndexingComponent } from './custom-indexing.component';
import { AuthGuard } from '../../core/services/guards';
const routes: Routes = [{
  path: '', component: CustomIndexingComponent,
  canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
  data: {
    title: 'Custom Indexing | New Age Alpha',
    description: 'Custom; Indexing',
    keywords: 'New Age Alpha',
    preload: true
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomIndexingRoutingModule { }
