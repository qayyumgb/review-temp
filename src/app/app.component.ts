import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthenticationService } from './core/authentication/authentication.service';
import { first } from 'rxjs';
import { SharedDataService } from './core/services/sharedData/shared-data.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
declare let $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'appTool';
  hand_p_left: boolean = false;
  hand_p_right: boolean = false;
  hand_p_toggle: boolean = true;
  pinnedSideBar: boolean = false;
  showcenterslider: boolean = false;
  openNotification: boolean = false;
  openWatchlist:boolean =false;
  openTraeNotification: boolean = false;
  showTempMaintanence: boolean = false;
  showTempMaintanenceMessage: any = [];
  showCountDown: any;
  sessionTimeOut: number = 0;
  constructor(private idle: Idle,
    private keepalive: Keepalive,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private router: Router,
    private authenticationService: AuthenticationService, public sharedData: SharedDataService) {
    this.sharedData.showCircleLoader.next(true);
    
    angulartics2GoogleAnalytics.startTracking();
    this.idle.setTimeout(30);
    this.keepalive.interval(300);
    this.keepalive.onPing.subscribe(() => {
      new Date()
      try {
        let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
        let remToken = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).remToken)));
        this.authenticationService.UpdateLastLoginSession(userid, remToken);
      } catch (e) { }
    });
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onTimeoutWarning.subscribe((countdown:any) => { this.showCountDown = countdown; });
    this.idle.onIdleEnd.subscribe(() => { });
    this.idle.onTimeout.subscribe(() => {
      $('#sessionOutPop').modal('hide');
      this.sharedData.showSideNavBar.next(false);
      this.router.navigate(['/logout'])
    });
    this.idle.onIdleStart.subscribe(() => { $('#sessionOutPop').modal('show'); });
    this.authenticationService.authState.subscribe(state => {
      if (state) {
        try {
          this.sessionTimeOut = (JSON.parse(sessionStorage['currentUser']).sessionTimeOut * 60);
          var uname = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).username)));
          if (uname.indexOf("newagealpha.com") == -1) {
            if (this.sessionTimeOut > 0) {
              this.idle.setIdle((this.sessionTimeOut - 30));
              this.idle.watch();
            } else { this.idle.stop(); }
          } else { this.idle.stop(); }
        } catch (e) { }
      } else { this.idle.stop(); }
    });
  
  }
  ngAfterViewInit() {
    /*Cookie Click*/
    if (localStorage.getItem('cookie-accept') === 'true') {
      $('#cookie-close').css("display", "none");
    } else {
      $('#cookie-close').css("display", "flex");
    }
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (element) {
        element.addEventListener('touchstart', function () {
          var event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        });
      });
    });
  }
  handleBarClick(e: any) {

    //this.sharedData.showNavtoggmenuOpen.next(this.hand_p_toggle);
    if (e == 'left') {
      this.hand_p_left = !this.hand_p_left;
    }
    else if (e == 'right') {
      this.hand_p_right = !this.hand_p_right;
    }
    else if (e == 'toggle') {
      if (this.hand_p_toggle == true) {
        this.hand_p_toggle = false;
        // this.sharedData.showNavtoggmenuOpen.next(this.hand_p_toggle);
      }
      else {
        this.hand_p_toggle = true;
        // this.sharedData.showNavtoggmenuOpen.next(this.hand_p_toggle);
      }

      //$('.togg-menu-l .card').each(function () {
      //  $(this).find('.card-header.collapsed').trigger('click');
      //});
    }
  }
  pinBarClick() {
    this.pinnedSideBar = !this.pinnedSideBar;
  }
  closeSideBar() {
    if (!this.pinnedSideBar) {
      this.hand_p_toggle = true;
    }
  }
  checkref() {
    if (window.location.href.indexOf("https://space.buildyourindex.com") > -1) {
      return "https://www.newagealpha.com/privacypolicy"
    }
    else {
      return "https://demo-alpha7.newagealpha.com/privacypolicy"
    }
  }
  CookieClick() {
    localStorage.setItem('cookie-accept', 'true');
    $('#cookie-close').fadeOut(350);
  }
  ngOnInit() {
    var that = this;
    var showLoader = this.sharedData.showCircleLoader.subscribe(res => { that.showcenterslider = res; });
    try {
      var sessionUserId = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      this.authenticationService.authState.pipe(first()).subscribe(data => {
        if (!data && sessionUserId) { this.authenticationService.authState.next(true); } else { }
      });
    } catch (e) { }
    that.sharedData.openNotification.subscribe((res) => { that.openNotification = res; });
    that.sharedData.openWatchlist.subscribe((res) => { that.openWatchlist = res; });
    that.sharedData.openTradeNotification.subscribe(res => { that.openTraeNotification = res; });
    that.sharedData.showMaintanenceDate.subscribe(res => {
      if (res.length > 0 && res[0]['ShowHide'] != 'Y') {
        that.showTempMaintanence = true;
        that.showTempMaintanenceMessage = res[0];
      } else { that.showTempMaintanence = false; }
      
    });
  }

  stayin() { this.idle.watch(); }
}
