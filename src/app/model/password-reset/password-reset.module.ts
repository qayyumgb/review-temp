import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PasswordResetRoutingModule } from './password-reset-routing.module';
import { PasswordResetComponent } from './password-reset.component';
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
    PasswordResetComponent
  ],imports: [
    CommonModule, PasswordResetRoutingModule, ReactiveFormsModule, HttpClientModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, SvgSpaceImgComponent ],
})
export class PasswordResetModule { }
