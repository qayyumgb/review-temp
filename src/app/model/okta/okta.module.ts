import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OktaRoutingModule } from './okta-routing.module';
import { OktaComponent } from './okta.component';


@NgModule({
  declarations: [
    OktaComponent
  ],
  imports: [
    CommonModule,
    OktaRoutingModule
  ]
})
export class OktaModule { }
