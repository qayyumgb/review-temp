import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { PhoneMaskDirective } from './phone-mask.directive';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { environment } from '../../../environments/environment';
import { ErrorInterceptor } from '../../core/services/interceptors/error.interceptor';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DirectiveControlModule } from '../../view/directiveControl/directive-control.module';
@NgModule({
  declarations: [LoginComponent,PhoneMaskDirective],
  imports: [ 
    CommonModule, LoginRoutingModule, ReactiveFormsModule, HttpClientModule, LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }), 
    MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, OktaAuthModule, DirectiveControlModule
   ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }],
  exports: [PhoneMaskDirective],
})
export class LoginModule { }
