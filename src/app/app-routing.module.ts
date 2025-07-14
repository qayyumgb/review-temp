import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordComponent } from './model/changePassword/password';
import { AuthGuard } from './core/services/guards';
import { NopermissionComponent } from './model/nopermission/nopermission.component';
import { OktaCallbackComponent } from '@okta/okta-angular';
import { InteractiveComponent } from './view/interactive/interactive.component';
import { Interactive3Component } from './view/interactive3/interactive3.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./model/login/login.module').then(m => m.LoginModule) },
  { path: 'login', loadChildren: () => import('./model/login/login.module').then(m => m.LoginModule) },
  { path: 'logout', loadChildren: () => import('./model/logout/logout.module').then(m => m.LogoutModule) },
  //*{ path: 'dashboard', loadChildren: () => import('./view/dashboard/dashboard.module').then(m => m.DashboardModule) },*//
  { path: 'home', loadChildren: () => import('./view/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'home/:version', loadChildren: () => import('./view/dashboard/dashboard.module').then(m => m.DashboardModule) },
  /*{ path: 'circle-s', loadChildren: () => import('./view/dashboard-spinner/dashboard.module').then(m => m.DashboardModuleSpinner) },*/
  { path: 'prebuilt', loadChildren: () => import('./view/prebuilt-strategies/prebuilt-strategies.module').then(m => m.PrebuiltStrategiesModule) },
  { path: 'thematicStrategies', loadChildren: () => import('./view/thematic-strategies/thematic-strategies.module').then(m => m.ThematicStrategiesModule) },
  { path: 'directIndexing', loadChildren: () => import('./view/direct-indexing/direct-indexing.module').then(m => m.DirectIndexingModule) },
  { path: 'customIndexing', loadChildren: () => import('./view/custom-indexing/custom-indexing.module').then(m => m.CustomIndexingModule) },
  { path: 'customindexing', loadChildren: () => import('./view/custom-indexing/custom-indexing.module').then(m => m.CustomIndexingModule) },  
  { path: 'agreement', loadChildren: () => import('./model/licence/licence.module').then(m => m.LicenceModule) },
  { path: 'forgotPassword', loadChildren: () => import('./model/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule) },
  { path: 'EmailVerify', loadChildren: () => import('./model/thankyou-page/thankyou-page.module').then(m => m.ThankyouPageModule) },
  { path: '404', loadChildren: () => import('./model/not-found-page/not-found-page.module').then(m => m.NotFoundPageModule) },
  { path: 'signUp', loadChildren: () => import('./model/signup/signup.module').then(m => m.SignupModule) },
  { path: 'myStrategies', loadChildren: () => import('./view/my-strategies/my-strategies.module').then(m => m.MyStrategiesModule) },
  { path: 'oktaGuide',loadChildren: () => import('./model/oktaGuide/oktaGuide.module').then(mod => mod.oktaGuideModule),  },
  { path: 'changePassword', component: PasswordComponent, runGuardsAndResolvers: 'always'  },
  { path: 'account', loadChildren: () => import('./view/accounts/accounts.module').then(m => m.AccountsModule) },
  { path: 'equityUniverse', loadChildren: () => import('./view/equity-universe/equity-universe.module').then(m => m.EquityUniverseModule) },
  { path: 'etfUniverse', loadChildren: () => import('./view/etf-universe/etf-universe.module').then(m => m.EtfUniverseModule) },
  { path: 'approvedStrategies', loadChildren: () => import('./view/approved-strategies/approved-strategies.module').then(m => m.ApprovedStrategiesModule) },
  { path: 'ResetPass', loadChildren: () => import('./model/password-reset/password-reset.module').then(m => m.PasswordResetModule) },
  { path: 'activatePassword', loadChildren: () => import('./model/activate-pwd/activate-pwd.module').then(m => m.PasswordResetModule) },
  { path: 'erflibrary', loadChildren: () => import('./view/equity-universe/equity-universe.module').then(m => m.EquityUniverseModule) },
  { path: 'thankyou', loadChildren: () => import('./model/messagePage/messagePage-routing.module').then(m => m.messagePageComponentRoutingModule) },
  { path: 'nopermission', component: NopermissionComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
  { path: 'callback', component: OktaCallbackComponent, },
  { path: 'interactive', component: InteractiveComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  { path: 'interactive3', component: Interactive3Component, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  { path: 'okta', loadChildren: () => import('./model/okta/okta.module').then(m => m.OktaModule) },
  { path: 'custom-prebuild', loadChildren: () => import('./view/custom-prebuild/custom-prebuild.module').then(m => m.CustomPrebuildModule) },
  { path: 'interactive2', loadChildren: () => import('./view/interactive2/interactive2.module').then(m => m.Interactive2Module) },
  { path: '**', redirectTo: '404' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
