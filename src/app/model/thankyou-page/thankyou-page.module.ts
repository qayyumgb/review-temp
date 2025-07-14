import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThankyouPageComponent } from '../thankyou-page/thankyou-page.component';
import { MaterialModule } from '../../material-module';
import { ThankyouPageRoutingModule } from './thankyou-page-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ThankyouPageRoutingModule,FormsModule, MaterialModule, ReactiveFormsModule
  ],
  declarations: [ThankyouPageComponent]
})
export class ThankyouPageModule { }
