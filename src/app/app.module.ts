import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, Injectable, InjectionToken, Injector, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_BASE_HREF, CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GlobalErrorHandler } from './core/services/logger/globalErrorHandler.service';
import { ErrorInterceptor, JwtInterceptor } from './core/services/interceptors';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavMenuComponent } from './core/layout/nav-menu/nav-menu.component';
import { MaterialModule } from './material-module';
import { DialogNavComponent } from './core/layout/nav-menu/dialog-nav/dialog-nav.component';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { environment } from '../environments/environment';
import { CustomModulePipeModule } from './core/custom-module-pipe/custom-module-pipe.module';
import { LoginComponent } from './model/login/login.component';
import { PhoneMaskDirective } from './model/login/phone-mask.directive';
import { IndexConstructionPopupComponent } from './view/index-construction-popup/index-construction-popup.component';
import { TradeOpenComponent } from './view/trade-open/trade-open.component';
import { PresentationDialogComponent } from './core/presentation-dialog/presentation-dialog.component';
import { notificationsComponent } from './core/layout/notifications/notifications';
import { tradeNotificationsComponent } from './core/layout/tradeNotifications/tradeNotifications';
import { DialogsErrorComponent } from './core/dialogs-error/dialogs-error.component';
import { DialogsWarningComponent } from './core/dialogs-warning/dialogs-warning.component';
import { ToastrModule } from 'ngx-toastr';
import { Angulartics2Module } from 'angulartics2';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
//import { OutsideClickDirective } from './outside-click.directive';
import { PasswordComponent } from './model/changePassword/password';
import { rebalanceStrategiesComponent } from './view/rebalanceStrategies/rebalanceStrategies';
import { PasswordStrengthComponent } from './model/password-strength/password-strength.component';
import { IndexConstComponent } from './core/Dialogs/index-const/index-const.component';
import { PerformancePopupComponent } from './view/charts-popup/performance-popup/performance-popup.component';
import { dontSellComponent } from './view/accounts/dont-sell/dont-sell';
import { restrictedListComponent } from './view/restrictedList/restrictedList';
import { RebalanceNavComponent } from './core/Dialogs/rebalance-nav/rebalance.component';
import { existingPopupComponent } from './view/charts-popup/existing-popup/existing-popup.component';
import { TimelineComponent } from './view/universeDialogsModule/timeline/timeline.component';
import { HisTimelineComponent } from './view/universeDialogsModule/his-timeline/his-timeline.component';
import { CompareComponent } from './view/universeDialogsModule/compare/compare.component';
import { VscompareComponent } from './view/universeDialogsModule/vscompare/vscompare.component';
import { LineChartComponent } from './view/universeDialogsModule/line-chart/line-chart.component';
import { ImpliedRevenueComponent } from './view/universeDialogsModule/implied-revenue/implied-revenue.component';
import { WatchlistComponent } from './core/layout/watchlist/watchlist.component';
//import { DashboardComponent } from './view/dashboard/dashboard.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NopermissionComponent } from './model/nopermission/nopermission.component';
import { FeedbackComponent } from './view/feedback/feedback.component';
import { messagePageComponent } from './model/messagePage/messagePage.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MultiNotificationsComponent } from './core/layout/multi-notifications/multi-notifications.component';
import { DirectiveControlModule } from './view/directiveControl/directive-control.module';
//import { DragDropComponent } from './view/individual-trade/drag-drop/drag-drop.component';
import { DragDropComponent } from './view/accounts/direct-trade/drag-drop/drag-drop.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

import { AccountDirectTradeComponent } from './view/accounts/direct-trade/direct-trade';
import { TradeDirectComponent } from './view/trade-direct/trade-direct.component';
import { InteractiveComponent } from './view/interactive/interactive.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Interactive3Component } from './view/interactive3/interactive3.component';
import { SvgSpaceImgComponent } from './standalone-components/svg-space-img/svg-space-img.component';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  //url: `${environment.api_url}/Strategy/DTFileupload`,
  url: 'no-url',
  autoProcessQueue: false,
};
//import { ThankyouPageComponent } from './model/thankyou-page/thankyou-page.component';
@NgModule({
  declarations: [AppComponent, NavMenuComponent, DialogNavComponent, FeedbackComponent, messagePageComponent, IndexConstructionPopupComponent, TradeOpenComponent, PresentationDialogComponent, tradeNotificationsComponent, notificationsComponent, DialogsErrorComponent, DialogsWarningComponent, PasswordComponent, rebalanceStrategiesComponent, PasswordStrengthComponent, IndexConstComponent, PerformancePopupComponent, existingPopupComponent, dontSellComponent, restrictedListComponent, RebalanceNavComponent, TimelineComponent, HisTimelineComponent, CompareComponent, VscompareComponent, LineChartComponent, ImpliedRevenueComponent, DragDropComponent, AccountDirectTradeComponent, WatchlistComponent, NopermissionComponent, MultiNotificationsComponent, TradeDirectComponent,InteractiveComponent, Interactive3Component],
  imports: [CustomModulePipeModule, DirectiveControlModule, CommonModule, AppRoutingModule, BrowserModule, BrowserAnimationsModule, HttpClientModule, MaterialModule, OktaAuthModule, NgxSkeletonLoaderModule, SlickCarouselModule, DropzoneModule, DragDropModule, SvgSpaceImgComponent,
    FormsModule,ToastrModule.forRoot({
      progressBar: true,
      positionClass: 'toast-top-center',
      // disableTimeOut:true,
      closeButton: true, preventDuplicates: true, timeOut: 9000
    }), LoggerModule.forRoot({
        serverLoggingUrl: `${environment.api_url}/scores/PostErrorlog`,
        level: NgxLoggerLevel.TRACE,
        serverLogLevel: NgxLoggerLevel.ERROR,
        disableConsoleLogging: false
      }),
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }), Angulartics2Module.forRoot(),
    NgIdleKeepaliveModule.forRoot(), CdkDrag, CdkDragHandle
  ],
  providers: [DatePipe, DecimalPipe,
    {
      provide: OKTA_CONFIG,
      useFactory: () => {
        const oktaAuth = new OktaAuth(environment.oidc);
        return {
          oktaAuth,
          onAuthRequired: (oktaAuth: OktaAuth, injector: Injector) => {
            const triggerLogin = async () => {
              await oktaAuth.signInWithRedirect();
            };
            if (!oktaAuth.authStateManager.getPreviousAuthState()?.isAuthenticated) {
              triggerLogin();
            } else { }
          }
        }
      }
    },
    { provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG},
    //{ provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
