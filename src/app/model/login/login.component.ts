import { Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { first } from 'rxjs';
import { RsahelperService } from '../../core/services/RsahelperService';
import { UserTrack, UserTrackDtls } from '../../core/services/user/user';
import { DeviceDetectorService } from 'ngx-device-detector';
//import { Angulartics2 } from "angulartics2";
import { DataService } from '../../core/services/data/data.service';
import OktaAuth from '@okta/okta-auth-js';
import { environment } from '../../../environments/environment';
import { OKTA_AUTH } from '@okta/okta-angular';
import { UsertrackService } from '../../core/services/usertrack.service';
import { ToastrService } from 'ngx-toastr';
import { Idle } from '@ng-idle/core';
import { UserService } from '../../core/services/user/user.service';
declare var $: any;
declare var jQuery: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  @Input() redirectTo: string = "home"
  GetLicenceMaster: any;
  showMaintenance: boolean = false;
  showMaintenanceTime: any = [];
  showMaintenanceNotification: any = [];
  displayLogInSection: boolean = false;
  displayLoginHomeScreen: boolean = true;
  checked: boolean = false;
  showLoad: boolean = false;
  showOLoad: boolean = false;
  returnUrl: string = '';
  authenticateList: any;
  isAuthenticated: boolean = false;
  selectcompanySSO: any;
  companyAvail: boolean = false;
  emailSubmitted: any = false;
  requestSubmitted: any = false;
  errorMSG: string = '';
  emailVal: string = '';
  EnvUrl: string = "";
  investor: string = 'Financial Advisor/RIA/Multi-Family Office'
  City: Array<string> = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]
  contactForm: FormGroup = new FormGroup({});
  emailForm: FormGroup = new FormGroup({ bemail: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]) });
  requestForm: FormGroup = new FormGroup({});
  selectThemeName: string = "dark"; //tool theme name

  constructor(private router: Router, private idle: Idle,
    public sharedData: SharedDataService,
    public userTrackService: UsertrackService,
    private deviceService: DeviceDetectorService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private dialogRef: MatDialog,
    public rsa: RsahelperService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private toastr: ToastrService,
    private authenticationService: AuthenticationService) {
    this.EnvUrl = this.getEnv();
    this.contactForm = new FormGroup({
      loginId: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9\\s@._-]*$')]),
      Password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
      isRemember: new FormControl('')
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.requestForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.pattern('^[a-zA-Z\\s]*$')]),
      lastName: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.pattern('^[a-zA-Z\\s]*$')]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      firm: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.pattern('^[a-zA-Z0-9\\s]*$')]),
      city: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.pattern('^[a-zA-Z0-9\\s]*$')]),
      phno: new FormControl('', [Validators.required, Validators.minLength(14)]),
      state: new FormControl('', [Validators.required]),
      Investor: new FormControl('', [Validators.required]),
    });

    this.emailForm = new FormGroup({
      bemail: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
    })

    this.getMaintenance();
    this.createAuthClient();
    this.createIssuerAuthClient();
    this.getoktsuser();
  }

  async getoktsuser() {
    var that = this;
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    const token: any = await this.oktaAuth.authStateManager.getAuthState()?.idToken?.idToken;
    if (this.isAuthenticated == true && isNotNullOrUndefined(token)) { that.router.navigate(['/okta']); };
  }
  //startTimeStr: string = '07/24/2024 11:15 AM';
  //endTimeStr: string = '07/24/2024 1:15 PM';
  remainingTime: string = '';
  getMaintenance() {
    var that = this;
   
    this.dataService.Getmaintanenance().pipe(first()).subscribe((res: any) => {
      if (res.length > 0) {
        var filterTool = res.filter((x: any) => x.Type == 'T');
        if (isNotNullOrUndefined(filterTool) && filterTool.length > 0 && filterTool[0].ShowHide == 'Y') {
          that.showMaintenance = true;
          that.showMaintenanceTime = res;
          that.sharedData.showCircleLoader.next(false);
          that.showMaintenanceNotification = []; /*///// Bottom maintanence Popup*/
        } else {
          if (filterTool.length > 0 && filterTool[0].ShowHide != 'Y') {
            that.showMaintenanceNotification = filterTool;
          } else { that.showMaintenanceNotification = []; }
        }
      }else {
        that.showMaintenance = false;
        that.showMaintenanceTime = [];
        that.sharedData.showCircleLoader.next(false);
      }
    }, (error: any) => { that.showMaintenance = false; that.showMaintenanceTime = []; that.showMaintenanceNotification = []; that.sharedData.showCircleLoader.next(false); });
  }

  async login() { await this.oktaAuth.signInWithRedirect({ originalUri: '/' }); }

  async createIssuerAuthClient() {
    try {
      var url = new URL(window.location.href);
      var issuer = url.searchParams.get("iss");
      if ((issuer != "" && isNotNullOrUndefined(issuer))) {
        var data = { "IssuerUrl": issuer };
        this.dataService.FindIssuerSSO(data).pipe(first()).subscribe(async (res: any) => {
          var company: any = res;
          if (company.length > 0) {
            this.oktaAuth = new OktaAuth({
              clientId: company[0].clientId,
              issuer: company[0].issuerUrl,
              redirectUri: environment.oidc.redirectUri,
              scopes: environment.oidc.scopes,
              pkce: environment.oidc.pkce
            });
            this.oktaAuth.start();
            this.login();
          }
        });
      }

    } catch (error) {
    }
  }

  getEnv() {
    return window.location.href.indexOf("https://space.buildyourindex.com") > -1 ? "live" : "demo";
  }

  ngOnInit() {
    let that = this;
    this.sharedData.showSideNavBar.next(false);
    that.sharedData.showCircleLoader.next(false);
    try { this.dialogRef.closeAll(); } catch (e) { }
    try { $('.modal').modal('hide'); } catch (e) { }
    try { setTimeout(() => { $('#sessionOutPop').modal('hide'); }, 1000); } catch (e) { }
    try { this.idle.stop(); } catch (e) { }
    var setDarkLocalstorage = (isNullOrUndefined(localStorage.getItem('darkmode'))) ? 'dark' : localStorage.getItem('darkmode');
    if (setDarkLocalstorage == 'light') { this.darkModeTheme('light'); }
    else if (setDarkLocalstorage == 'grey') { this.darkModeTheme('grey'); }
    else { this.darkModeTheme('dark'); }

    var setDarkLocalstorage = (isNullOrUndefined(localStorage.getItem('set-palette'))) ? 'D' : localStorage.getItem('set-palette');
    if (isNotNullOrUndefined(setDarkLocalstorage)) {
      this.openThemeColor(setDarkLocalstorage);
    } else { this.openThemeColor('D'); }
    

    try {
      if (localStorage.getItem('isRemember') == 'Y') {
        that.contactForm.controls["loginId"].setValue(localStorage.getItem('isRememberMail'));
        that.contactForm.controls["isRemember"].setValue(true);
        that.checked = true;
      }
    } catch (e) { }
   
  }
  
  openThemeColor(val: any) {
    var $body = $('body, html');
    $body.removeClass('C_layout_1');
    $body.removeClass('C_layout_2');
    $body.removeClass('C_layout_3');
    $body.removeClass('C_layout_4');
    localStorage.setItem('set-palette', val);
    if (val == 'A') {
      $body.addClass('C_layout_4');
    }
    else if (val == 'B') {
      $body.addClass('C_layout_2');
    }
    else if (val == 'C') {
      $body.addClass('C_layout_3');
    }
    else {
      $body.addClass('C_layout_1');
    }
  }
  darkModeTheme(tema: string) {
    this.selectThemeName = tema;
    var $body = $('body');
    var $html = $('html');
    if (tema == 'light') {
      $body.removeClass('dark');
      $html.removeClass('dark');
      $body.removeClass('grey');
      $html.removeClass('grey');
      localStorage.setItem('darkmode', 'light');
    } else if (tema == 'grey') {
      $body.removeClass('dark');
      $html.removeClass('dark');
      $body.addClass('grey show-h-f');
      $html.addClass('grey');
      localStorage.setItem('darkmode', 'grey');
    } else {
      $body.removeClass('grey');
      $html.removeClass('grey');
      $body.addClass('dark show-h-f');
      $html.addClass('dark');
      localStorage.setItem('darkmode', 'dark');
    }

  }

  noWhitespaceValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (value && value.trim().length === 0) { return { 'whitespace': true }; }
    return null;
  }

  onSubmit() {
    this.emailSubmitted = true;
    if (this.emailForm.valid) {
      var getUrl = window.location.hostname.replace("www.", '').replace(".com", '');
      var email = {
        "id": 0,
        "email": this.emailForm.value.bemail,
        "frmsubmit": getUrl + "-login"
      }
      this.emailSubmitted = false;
      this.authenticationService.postEmail(email).pipe(first()).subscribe((x: any) => { });
    }
  }
  openComp(){
    //data-bs-toggle="modal" data-bs-target="#oktaloginModal"
    $('#oktaloginModal').modal();
  }

  emailPase(e: any) { }
  forgotPassword() {
    this.router.navigate(["/forgotPassword"]);
    var log = '/forgotPassword?pre=y';
    if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl(log); }
    else {
      //window.location.replace("/forgotPassword");
      this.router.navigate(["/forgotPassword"]);
    }
  }
  PostContact(domain: any = null, domainusername: any = null) {
    let that = this;
    if (this.contactForm.valid && !this.showLoad || domain != "") {
      let contact: ContactFormModel = {
        loginId: this.rsa.encrypt(that.contactForm.controls["loginId"].value),
        Password: this.rsa.encrypt(that.contactForm.controls["Password"].value),
        isRemember: this.contactForm.controls["isRemember"].value == true ? 'Y' : 'N',
      }
      var email: any = "";
      if (domain == 'okta') { email = domainusername; this.showOLoad = true; }
      else { email = contact.loginId; this.showLoad = true; }
      this.authenticationService.login(email, contact.Password, "N", domain, "").pipe(first()).subscribe((data: any) => {
        that.authenticateList = data;       
        this.sharedData.authenticateList.next(data);
        sessionStorage.setItem('isPolicyAccepted', data.isPolicyAccepted);
        localStorage.setItem('isRemember', contact.isRemember);
        if (contact.isRemember == 'Y') { localStorage.setItem('isRememberMail', that.contactForm.controls["loginId"].value); } 
        //if (this.EnvUrl == "live") {that.angulartics2.setUsername.next(atob(atob(atob(data.userId))));}
        that.ProcUserTrack(data);
        //if (data.Email.toLowerCase().indexOf("newagealpha.com") == -1) {that.authenticationService.startTimer(data.sessionTimeOut);}
        //else {that.authenticationService.stopTimer();}
        //this.userService.initUser();
        if (isNotNullOrUndefined(data) && isNotNullOrUndefined(data['isUserOnline']) && data['isUserOnline'] =='Y') {
          that.toastr.info("Your previous session will be closed to allow this new login.", '', { timeOut: 4000, positionClass: "toast-top-center" });
        }
      }, (error: any) => {
        
        if (domain == 'okta') that.showOLoad = false;
        else that.showLoad = false;
        that.logoktauserout();
        //this.errorMSG = error.error['message'];        
          if (window.navigator.onLine) {
            this.errorMSG = error;
            if (isNullOrUndefined(that.errorMSG) || that.errorMSG == '' || that.errorMSG.toLowerCase() == 'unknown error' || that.errorMSG == 'Unknown Error') { that.errorMSG = 'Please try again.'; }
        } else { that.errorMSG = 'Please check your internet connection and try again.'; };
        
        $('#myErrorModal').modal('show');
      });
    }
    return false;
  }

  isTouchDevice() { return typeof window.ontouchstart !== 'undefined'; }

  ProcUserTrack(data: any) {
    var that = this;
    try {
      var objtrack: any = new UserTrack();
      objtrack.TrackingId = 0;
      objtrack.Userid = parseInt(atob(atob(atob(data.userId))));
      objtrack.RequestedUrl = window.location.hostname;
      if (atob(atob(atob(data.remToken))) == null || atob(atob(atob(data.remToken))) == "null") { objtrack.RememberToken = null; }
      else { objtrack.RememberToken = atob(atob(atob(data.remToken))); }

      objtrack.LogInTime = new Date();
      objtrack.LogOutTime = null;
      objtrack.Status = "A";


      this.authenticationService.trackUser(objtrack).pipe(first()).subscribe((data: any) => {
            var objtrackdtls = new UserTrackDtls();
            objtrackdtls.TrackingId = data['trackingId'];
            sessionStorage.setItem('trackingId', JSON.stringify(data['trackingId']));
            this.authenticationService.authState.next(true);
            that.userTrackService.ProcInsertSession();
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

            that.authenticationService.trackUserDetails(objtrackdtls).pipe(first()).subscribe((data: any) => {
                //that.router.navigate(['/home']);
              }, (error: any) => {
                //this.logger.logError(error, 'trackUserDetails');
              });
          }, (error: any) => {
            //this.logger.logError(error, 'trackUser');
          });
    } catch (e) { }
  }

  newAppVersionDetected() {
    let that = this;
    var AppServerVersion = "";

    this.authenticationService.getAppVersion().pipe(first()).subscribe((data: any) => {
      var JsonData = JSON.parse(data);
      AppServerVersion = JsonData["BuildNumber"];
      if (AppServerVersion == "$(Build.BuildNumber)") AppServerVersion = '55567';
      var CurrentAppversion = localStorage.getItem('Appversion');
      if (CurrentAppversion != AppServerVersion) {
        localStorage.setItem('Appversion', AppServerVersion);
        if (window.location.href.indexOf('pre=y') > -1) { this.redirectTo = this.redirectTo + "?bld=" + AppServerVersion + "&pre=y"; }
        else { this.redirectTo = this.redirectTo + "?bld=" + AppServerVersion; }
        that.checkPermissionRoute(1, ("?bld=" + AppServerVersion));
      }
      else {
        localStorage.setItem('Appversion', AppServerVersion);
        if (window.location.href.indexOf('pre=y') > -1) { that.checkPermissionRoute(2, ''); }
        else { that.checkPermissionRoute(0, ''); }
      }
    }, (err: any) => { });
  }
  
  checkPermissionRoute(type: any, ver: any) {
    var that = this;
    that.sharedData.showCircleLoader.next(true);
    var routeUrl = "/agreement";
    if (that.authenticateList.isPolicyAccepted == 'Y') {
      routeUrl = "/home";
      this.dataService.GetUserMenuRolePermission(JSON.parse(sessionStorage['currentUser']).roleId).pipe(first()).subscribe(res => {
        //if (this.sharedData.checkShowLeftTab(1) == 'A') { routeUrl = "/dashboard"; }
        //   else if (this.sharedData.checkShowLeftTab(12) == 'A') {
        //  if (this.sharedData.checkMyUserType()) { this.router.navigate(["/approvedStrategies"]) }
        //  else { this.router.navigate(["/directIndexing"]) }
        //   }
        //else if (this.sharedData.checkShowLeftTab(2027) == 'A') { routeUrl = "/equityUniverse"; }
        //else if (this.sharedData.checkShowLeftTab(2028) == 'A') { routeUrl = "/etfUniverse"; }
        //else if (this.sharedData.checkShowLeftTab(4) == 'A') { routeUrl = "/prebuilt"; }
        //else if (this.sharedData.checkShowLeftTab(6) == 'A') { routeUrl = "/myStrategies"; }
        //else if (this.sharedData.checkShowLeftTab(5) == 'A') { routeUrl = "/account"; }
        //else if (this.sharedData.checkShowLeftTab(25) == 'A') { routeUrl = "/thematicStrategies"; }
        //else if (this.sharedData.checkShowLeftTab(13) == 'A' && this.sharedData.checkShowLeftTab(5) == 'A') { routeUrl = "/trade"; }
        if (ver == '') { that.router.navigate([routeUrl]); } else { routeUrl = "/home" + ver; that.router.navigateByUrl(routeUrl); };
        setTimeout(() => { that.sharedData.showSideNavBar.next(true); that.sharedData.showMaintanenceDate.next(that.showMaintenanceNotification) }, 2000);
      }, (error: any) => { window.location.reload(); });
    }
    else {
      routeUrl = "/agreement";
      //window.location.replace(routeUrl);
      that.router.navigate(["agreement"]);
      //that.router.navigate(["/agreement"], { relativeTo: this.route, skipLocationChange: true });
    }
  }
  
  hasError(controlName: string, errorName: string) {
    return this.contactForm.controls[controlName].hasError(errorName);
  }
  hasError2 = (controlName: string, errorName: string) => {
    if (this.requestSubmitted == true) { return this.requestForm.controls[controlName].hasError(errorName); } else { return false }
  }
  hasError3(controlName: string, errorName: string) {
    if (this.emailForm.valid) {
      jQuery("#emailSubmit").attr("data-bs-toggle", "modal");
      jQuery("#emailSubmit").attr("data-bs-target", "#myModal");
      this.emailVal = jQuery('#bemail1').val();
    }
    else {
      jQuery("#emailSubmit").removeAttr("data-bs-toggle", "modal");
      jQuery("#emailSubmit").removeAttr("data-bs-target", "#myModal");
    }
    if (this.emailSubmitted == true) {
      return this.emailForm.controls[controlName].hasError(errorName);
    } else { return false }
  }

  closeCompany() {
    $('#oktaloginModal').modal('hide');
    $(document.body).removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  createAuthClient() {
    try {
      this.companyAvail = false;
      if (this.selectcompanySSO != "" && isNotNullOrUndefined(this.selectcompanySSO)) {
        this.dataService.FindCompanySSO(this.selectcompanySSO).pipe(first()).subscribe(res => {
          var company: any = res;
          if (company.length > 0) {
            this.oktaAuth = new OktaAuth({
              clientId: company[0].ClientId,
              issuer: company[0].Issuer,
              redirectUri: environment.oidc.redirectUri,
              scopes: environment.oidc.scopes,
              pkce: environment.oidc.pkce
            });
            this.oktaAuth.start();
            this.login();
          }
          else {
            this.companyAvail = true;
          }
        });
      }
    } catch (error) {
    }
  }

  saveCompany() {
    this.createAuthClient();
    $(document.body).removeClass('modal-open');
    $('.modal-backdrop').remove();
  }
  logoktauserout() { }
  clearInputMethod1() { }
  requestformSubmit: boolean = false;
  onReqForm() {
    // console.log(this.requestForm,'requestForm');	
    this.requestSubmitted = true;
    if (this.requestForm.valid && !this.requestformSubmit) {
      this.requestformSubmit = true;
      jQuery('.modalSubmit').text('Submitting..');
      jQuery('.modalSubmit').css('opacity', '0.6');
      jQuery('.modalSubmit').css('cursor', 'default');
      jQuery(".modalSubmit").attr('disabled', true);
      var contactFormData = {
        id: 0,
        countryId: 0,
        firstName: this.requestForm.value.firstName.replace(/  +/g, ' '),
        lastName: this.requestForm.value.lastName.replace(/  +/g, ' '),
        email: this.requestForm.value.email,
        phoneNo: this.requestForm.value.phno,
        investorType: this.requestForm.value.Investor,
        firm: this.requestForm.value.firm.replace(/  +/g, ' '),
        city: this.requestForm.value.city.replace(/  +/g, ' '),
        state: this.requestForm.value.state,
        createddt: new Date().toISOString(),
        frmSubmit: "Submitted from Tool"
      };
      //console.log(contactFormData,'contactFormData');	
      this.authenticationService.postRequestForm(contactFormData).pipe(first()).subscribe((x: any) => {
        if (x[0] == 'Success') {
          jQuery('#requestForm').hide();
          // jQuery('#requestForm')[0].reset();	
          this.requestForm.reset();
          this.emailForm.reset();
          this.requestSubmitted = false;
          this.requestformSubmit = false;
          jQuery('#finac').prop("checked", true);
          jQuery('.formSuccess').show();
          jQuery('.modal-body').addClass("hiFix");
          jQuery('.successMsg').empty();
          //$('.successMsg').append('Hi ' + (data.fname).toUpperCase() + ' ' + (data.lName).toUpperCase() + ' Thank you for requesting access to New Age Alpha’s SPACE. A product specialist will be in touch with you shortly.');	checkmark
          jQuery('.successMsg').append('<svg class="checkmark" style="display: block;margin: 0.8rem auto;" width="3rem" viewBox="0 0 736 737" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M334.883 495.445L523.349 306.979C531.464 298.869 531.464 285.76 523.349 277.651C515.261 269.541 502.136 269.541 494.027 277.651L320.213 451.464L240.651 371.901C232.541 363.792 219.411 363.792 211.301 371.901C203.213 380.011 203.213 393.12 211.301 401.229L305.547 495.453C309.594 499.5 314.901 501.531 320.213 501.531C325.521 501.531 330.828 499.5 334.875 495.453M368 0C164.733 0 0 164.787 0 368C0 571.267 164.747 736.027 368 736.027C571.24 736.027 736 571.267 736 368C736 164.787 571.24 0 368 0M368 41.4787C548.027 41.4787 694.52 187.972 694.52 367.999C694.52 548.052 548.027 694.545 368 694.545C187.947 694.545 41.48 548.052 41.48 367.999C41.48 187.972 187.947 41.4787 368 41.4787" fill="#3f9729"/></svg><span class="thankyouTitle" style="font-size: .9rem;font-family: var(--ff-medium);color: var(--leftSideText);margin: 0.5rem 0;display: block;">Thank you for requesting access to <br> New Age Alpha&#39;s SPACE.</span><p style=" color: var(--leftSideText);margin: 0.8rem;font-size: 0.8rem;">A product specialist will be in touch with you shortly.</p>');
          jQuery('.successMsg').addClass("successActive");

          jQuery('#myModal .modal-body').css("height", "33vh");
          // jQuery('#myModal .modal-dialog').css("margin-top", "5rem");	
          jQuery('.modalSubmit').text('submit');
          jQuery('.modalSubmit').css('opacity', '1');
          jQuery('.modalSubmit').css('cursor', 'pointer');
          jQuery('.modalsubmit').removeAttr("disabled");
          jQuery(".modalSubmit").attr('disabled', false);
        }
      });
    }
   
  }
  modalClose() { }
  checkerror(value: any) {
    if (value == null || value == undefined || value == "") { return true } else { return false; }
  }
  validateInput(event: KeyboardEvent): boolean {
    const regex = /^[a-zA-Z0-9 ]*$/i;
    if (!regex.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  fnamevalidateInput(event: KeyboardEvent): boolean {
    const regex = /^[a-zA-Z ]*$/i;
    if (!regex.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
export interface ContactFormModel {
  loginId: string;
  Password: string;
  isRemember: string;
}
