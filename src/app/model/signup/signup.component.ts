import { AfterViewInit, Component, DoCheck, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/authentication/authentication.service';
declare var $: any;
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @Output() triggerLoginEvent = new EventEmitter();

  ngOnDestroy(): void { }

  constructor(public router: Router, private authenticationService: AuthenticationService) {
    if (this.authenticationService.currentUserValue) { this.router.navigate(['/']); };
  }

  LoginEvent() { this.router.navigate(['/login']); }
  openLogInScreen() { this.router.navigate(['/login']); }

  ngOnInit() { this.getWidth(); }

  currentWidth: any;
  windowinnerHeight: any;
  getWidth() {
    this.currentWidth = window.innerWidth;
    this.windowinnerHeight = window.innerHeight;
    window.addEventListener('orientationchange', this.doOnOrientationChange);
    this.doOnOrientationChange();
  }

  doOnOrientationChange() {
    let that = this;
    if (window.orientation == 90 || window.orientation == -90) {} else {
      setTimeout(function () {
        that.windowinnerHeight = window.innerHeight;
        that.currentWidth = window.innerWidth;
        if (that.currentWidth < 767) {
          let x = that.windowinnerHeight - 60 + 'px';
          $('#ass_Hgt').css('height', x);
        }
      }, 100);
    }
  }
  ngAfterViewInit() {
    //$('#chat-widget-container').css('display', 'block');
    var that = this;
    if (that.currentWidth >= 767) { $("#Email").focus(); }
    if (that.currentWidth <= 560) {
      let x = that.windowinnerHeight - 60 + 'px';
      $('#ass_Hgt').css('height', x);
    }
    //hbspt.forms.create({
    //  portalId: "6010193",
    //  formId: "8a5c3b99-5ca9-4f28-8d99-616c8528d53e",
    //  target: "#dvSignUp",
    //  onFormSubmit: function ($form) { }
    //});
  }

  ngDoCheck() {
    setTimeout(function () {
      var x = $('iframe').contents().find('a');
      x.css({ "color": "#00b9ff" });
      var y = $('iframe').contents().find('.hs-input');
      y.css({ "font-size": "14px" });
    }, 500);
  }

}
