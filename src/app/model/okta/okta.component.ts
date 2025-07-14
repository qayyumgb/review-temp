import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Angulartics2 } from 'angulartics2';
import { LoggerService } from '../../core/services/logger/logger.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BnNgIdleService } from 'bn-ng-idle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../../core/services/data/data.service';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UsertrackService } from '../../core/services/usertrack.service';
import { UserService } from '../../core/services/user/user.service';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { first } from 'rxjs';
declare var $: any;
import * as d3 from 'd3';
import { UserTrack, UserTrackDtls } from '../../core/services/user/user';
@Component({
  selector: 'app-okta',
  templateUrl: './okta.component.html',
  styleUrl: './okta.component.scss'
})
export class OktaComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnDestroy(): void {}
  public scrollbarOptions = { axis: 'y', theme: 'minimal-dark', scrollInertia: 300 };
  contactForm: FormGroup = new FormGroup({});
  displayLogInSection: boolean = false;
  displayLoginHomeScreen: boolean = true;
  checked: boolean = false;
  EnvUrl: string='';
  showModalLoader: boolean = false;
  errorMSG: string = '';
  emailVal: string = '';
  GetLicenceMaster: any;
  showLoad: boolean = false;
  showOLoad: boolean = false;
  returnUrl: string='';
  authenticateList: any;
  isAuthenticated: boolean = false;
  code: string = '';
  state: string = '';

  constructor(private sharedData: SharedDataService, private dataService: DataService, private angulartics2: Angulartics2, private snackBar: MatSnackBar, private authenticationService: AuthenticationService, public router: Router, private route: ActivatedRoute, public bnIdle: BnNgIdleService, public userService: UserService, private deviceService: DeviceDetectorService, private userTrackService: UsertrackService, private logger: LoggerService,
    public cusIndexService: CustomIndexService,
    public authStateService: OktaAuthStateService, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.getoktsuser();
  }
  userName: any;

  async getoktsuser() {
    this.userName = '';
    this.showModalLoader = true;
    var that = this;
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (this.isAuthenticated == true) {
      const userClaims = await this.oktaAuth.getUser();
      this.userName = userClaims.preferred_username as string;
      const token:any = await this.oktaAuth.authStateManager.getAuthState()?.idToken?.idToken;
      const issuer:any = await this.oktaAuth.authStateManager.getAuthState()?.idToken?.issuer;
      var iss = btoa(btoa(btoa(issuer)));
      sessionStorage.setItem('issuer', iss);
      if (isNotNullOrUndefined(token) && isNotNullOrUndefined(issuer)) { that.PostContact('okta', "", this.userName, token, issuer); }
      else { this.redirecttologin() }
    }
  }

  createAuthClient() {
    try {
      this.oktaAuth = new OktaAuth({
        clientId: `0oa94nxgshBXkg05n5d7`,
        issuer: `https://dev-82112935.okta.com/oauth2/default`,
        redirectUri: '/callback',
        scopes: ['openid', 'profile', 'email'],
        pkce: true
      });
      this.oktaAuth.start();
    } catch (error) {
    }
  }



  async login() {
    await this.oktaAuth.signInWithRedirect({ originalUri: '/' });
  }

  async logout() {
    this.authenticationService.forceLogout();
    this.oktaAuth.revokeAccessToken();
    this.oktaAuth.tokenManager.clear();
  }

  getEnv() {
    return window.location.href.indexOf("https://app.newagealpha.com") > -1 ? "live" : "demo";
  }

  PostContact(domain: any = null, password: any = null, domainusername: any = null, token:any = null, company:any = null) {
    let that = this;
    var email:any = "";
    if (domain == 'okta') { email = domainusername; }
    this.authenticationService.login(email, token, "N", domain, company)
      .pipe(first()).subscribe((data:any) => {
          this.showModalLoader = false;
          that.authenticateList = data;
          this.sharedData.authenticateList.next(data);
          var unid = data.uniqueId;
          sessionStorage.setItem('uniqueId', unid);
          sessionStorage.setItem('isPolicyAccepted', data.isPolicyAccepted);
          if (data.isEmailVerified != "" && data.isEmailVerified == "Y") {
            if (this.EnvUrl == "live") {
              that.angulartics2.setUsername.next(atob(atob(atob(data.userId))));
            }
            that.ProcUserTrack(data);
            if (domainusername.toLowerCase().indexOf("newagealpha.com") == -1) {
              that.authenticationService.startTimer(data.sessionTimeOut);
            } else { that.authenticationService.stopTimer(); };
            //this.userService.initUser();
          }
          else {
            that.openSnackBar("Please verify your email address sent to your inbox", "");
          }
        },
        error => {
          this.showModalLoader = false;
          this.logoktauserout();
          this.logger.logError(error, 'login');
          this.errorMSG = error;
          $('#myErrorModal').modal('show');
        });

    return false;
  }

  redirecttologin() {
    this.router.navigate(['/logout']);
  }

  logoktauserout() {
    this.oktaAuth.tokenManager.clear();
    this.redirecttologin();
  }

  ProcUserTrack(data: any) {
    var that = this;
    // if (window.location.hostname != "localhost") {

    try {
      var objtrack = new UserTrack();
      objtrack.TrackingId = 0;
      objtrack.Userid = parseInt(atob(atob(atob(data.userId))));
      objtrack.RequestedUrl = window.location.hostname;
      if (atob(atob(atob(data.remToken))) == "null") { objtrack.RememberToken = ''; }
      else { objtrack.RememberToken = atob(atob(atob(data.remToken))); }
      objtrack.LogInTime = new Date();
      objtrack.LogOutTime = '';
      objtrack.Status = "A";


      this.authenticationService.trackUser(objtrack).pipe()
        .subscribe((data:any) => {
            var objtrackdtls = new UserTrackDtls();
            objtrackdtls.TrackingId = data['trackingId'];
            sessionStorage.setItem('trackingId', JSON.stringify(data['trackingId']));
            this.authenticationService.authState.next(true);
            that.userTrackService.ProcInsertSession();
            //that.sharedData.licenceAgreement.next(false);
            //that.sharedData.allow_licenceAgreement.next(false);
            that.newAppVersionDetected();
            objtrackdtls.Userid = objtrack.Userid;
            if (localStorage.getItem('darkmode') == null) {
              localStorage.setItem('darkmode', 'true');
            }

            objtrackdtls.browser = that.deviceService.browser;
            objtrackdtls.browserVersion = that.deviceService.browser_version;
            objtrackdtls.device = that.deviceService.device;

            let isDesktop = 0;
            if (that.deviceService.isDesktop(that.deviceService.userAgent)) isDesktop = 1;
            objtrackdtls.IsDesktopDevice = isDesktop;

            let IsMobile = 0;
            if (that.deviceService.isMobile(that.deviceService.userAgent)) IsMobile = 1;
            objtrackdtls.IsMobile = IsMobile;

            let isTablet = 0;
            if (that.deviceService.isTablet(that.deviceService.userAgent)) isTablet = 1;
            objtrackdtls.IsTablet = isTablet;

            objtrackdtls.OS = that.deviceService.os;
            objtrackdtls.OSVersion = that.deviceService.os_version;
            objtrackdtls.UserAgent = that.deviceService.userAgent;

            objtrackdtls.ScreenPixelsHeight = screen.height;
            objtrackdtls.ScreenPixelsWidth = screen.width;
            objtrackdtls.touchScreen = that.isTouchDevice();

            that.authenticationService.trackUserDetails(objtrackdtls)
              .pipe(first())
              .subscribe(
                data => {
                  //that.router.navigate(['/home']);
                }, error => { this.logger.logError(error, 'trackUserDetails'); });
          }, error => { this.logger.logError(error, 'trackUser'); });
    } catch (e) {

    }
    //}
    //else {
    //  that.newAppVersionDetected();
    //}

  }

  isTouchDevice() {
    return typeof window.ontouchstart !== 'undefined';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
  ngOnInit() {

    this.cusIndexService.cusIndTempStrategyData.next([]);
    this.authenticationService.authState.next(false);
    this.sharedData.showSideNavBar.next(false);
    var setDarkLocalstorage = localStorage.getItem('darkmode');
    //var unSubLicence = this.dataService.GetLicenceMaster().subscribe(res => {
    //  this.GetLicenceMaster = res[0].LicenceId;
    //  this.sharedData.licenceAgreement.next(this.GetLicenceMaster)

    //}, error => { });
    // console.log('setDarkLocalstorage', setDarkLocalstorage);
    if (setDarkLocalstorage == 'light') {
      //this.darkModeTheme('light');
    }
    else if (setDarkLocalstorage == 'grey') {
      //this.darkModeTheme('grey');
    }
    else {
      //this.darkModeTheme('dark');
    }
    let that = this;
    if ($('.show').length > 0) {
      d3.selectAll('.show').classed("show", false);
      d3.selectAll('.modal-backdrop').remove();
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  selectThemeName: string = "dark";

  @Input() redirectTo: string = "home"
  newAppVersionDetected() {

    var AppServerVersion = "";

    let that = this;

    this.authenticationService.getAppVersion().subscribe((data) => {

      var JsonData = JSON.parse(data);

      AppServerVersion = JsonData["BuildNumber"];

      if (AppServerVersion == "$(Build.BuildNumber)") AppServerVersion = '55567';

      var CurrentAppversion = localStorage.getItem('Appversion');

      if (CurrentAppversion != AppServerVersion) {

        localStorage.setItem('Appversion', AppServerVersion);

        if (window.location.href.indexOf('pre=y') > -1) { this.redirectTo = this.redirectTo + "?bld=" + AppServerVersion + "&pre=y"; }
        else { this.redirectTo = this.redirectTo + "?bld=" + AppServerVersion; }



        that.checkPermissionRoute(1, ("?bld=" + AppServerVersion));
        //console.log("New App Version is Loaded " + AppServerVersion);

      }
      else {
        localStorage.setItem('Appversion', AppServerVersion);
        //setTimeout(()=>{
        //  this.sharedData.showSideNavBar.next(true);
        //   //console.log('settie');
        // },2000)

        if (window.location.href.indexOf('pre=y') > -1) { that.checkPermissionRoute(2, ''); }
        else {
          that.checkPermissionRoute(0, '');
          /*  $('.G-Background-tool').css('height','');*/
        }
      }
    }, err => { this.logger.logError(err, 'getAppVersion'); });
  }
  checkPermissionRoute(type:any, ver:any) {
    var that = this;
    that.sharedData.showCircleLoader.next(true);
    var routeUrl = "/agreement";
    if (that.authenticateList.isPolicyAccepted == 'Y') {
      routeUrl = "/home";
      this.dataService.GetUserMenuRolePermission(JSON.parse(sessionStorage['currentUser']).roleId).subscribe(res => {
        this.sharedData.UserMenuRolePermission.next(res);
        //if (this.sharedData.checkShowLeftTab(1) == 'A') { routeUrl = "/dashboard"; }
        //else if (this.sharedData.checkShowLeftTab(2) == 'A') { routeUrl = "/erflibrary"; }
        //else if (this.sharedData.checkShowLeftTab(3) == 'A') { routeUrl = "/customIndexing"; }
        //else if (this.sharedData.checkShowLeftTab(12) == 'A') {
        //  routeUrl = "/approvedStrategies";
        //}
        //else if (this.sharedData.checkShowLeftTab(4) == 'A') { routeUrl = "/preBuild"; }
        //else if (this.sharedData.checkShowLeftTab(6) == 'A') { routeUrl = "/myStrategies"; }
        //else if (this.sharedData.checkShowLeftTab(5) == 'A') { routeUrl = "/account"; }
        //else if (this.sharedData.checkShowLeftTab(25) == 'A') { routeUrl = "/thematicStrategies"; }
        //else if (this.sharedData.checkShowLeftTab(13) == 'A' && this.sharedData.checkShowLeftTab(5) == 'A') { routeUrl = "/trade"; }
        that.router.navigate([routeUrl]);
        setTimeout(() => { that.sharedData.showSideNavBar.next(true); }, 2000);
      }, error => { window.location.reload(); });
    }
    else {
      routeUrl = "/agreement";
      that.router.navigate([routeUrl]);
    }

  }

  ngAfterViewInit() {
  }
}
