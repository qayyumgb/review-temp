import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { oktaGuideComponent } from '../oktaGuide/oktaGuide';
import { MaterialModule } from '../../material-module';
import { oktaGuideRoutingModule } from './oktaGuide-routing.module';

@NgModule({
  imports: [
    CommonModule,
    oktaGuideRoutingModule,FormsModule, MaterialModule, ReactiveFormsModule
  ],
  declarations: [oktaGuideComponent]
})
export class oktaGuideModule { }
