import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatePwdRoutingModule } from './activate-pwd-routing.module';
import { ActivatePwdComponent } from './activate-pwd.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorInterceptor } from '../../core/services/interceptors';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { SvgSpaceImgComponent } from '../../standalone-components/svg-space-img/svg-space-img.component';


@NgModule({
  declarations: [
    ActivatePwdComponent
  ],imports: [
    CommonModule, ActivatePwdRoutingModule, ReactiveFormsModule, HttpClientModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, SvgSpaceImgComponent ],
})
export class PasswordResetModule { }
