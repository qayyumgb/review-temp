import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundPageComponent } from './not-found-page.component';

const routes: Routes = [{
  path: '', component: NotFoundPageComponent,
  data: {
    title: 'Page Not Found | New Age Alpha',
    description: 'page not found',
    keywords: 'New Age Alpha'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotFoundPageRoutingModule { }
