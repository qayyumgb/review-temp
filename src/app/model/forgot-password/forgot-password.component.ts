import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { Subscription, first } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  showcenterslider: boolean = false;
  forgotPassForm: FormGroup = new FormGroup({ Email: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.email]) });
  showLoad: boolean = false;
  customError: any;
  subscriptions = new Subscription();
  constructor(private userService: UserService,public router: Router,public sharedData: SharedDataService,) {

  }
  hasError = (controlName: string, errorName: string) => {
    return this.forgotPassForm.controls[controlName].hasError(errorName);
  }
  openLogInScreen() {
    var log = '/login?pre=y';
    if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl(log); }
    else { this.router.navigate(['/login']); }
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  ngOnInit() {
    var that = this;
    that.showcenterslider = false;
    this.sharedData.showCircleLoader.next(false);
    var showLoader = this.sharedData.showCircleLoader.subscribe((res) => {
      setTimeout(() => { that.showcenterslider = res; }, 100);
    });
    this.subscriptions.add(showLoader);
    this.getWidth();
    this.forgotPassForm = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.email])
    });
  }
  currentWidth: any;
  windowinnerHeight: any;
  getWidth() {
    this.currentWidth = window.innerWidth;
    this.windowinnerHeight = window.innerHeight;
    window.addEventListener('orientationchange', this.doOnOrientationChange);
    this.doOnOrientationChange();
  }
  clearInputMethod1() {
    this.forgotPassForm.reset();
    $('#Email').focus();
  }
  doOnOrientationChange() {
    let that = this;
    if (window.orientation == 90 || window.orientation == -90) {
    } else {
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
    var that = this;
    window.scroll(0, 0);
    if (that.currentWidth >= 767) { $("#Email").focus(); };
    if (that.currentWidth <= 560) {
      let x = that.windowinnerHeight - 60 + 'px';
      $('#ass_Hgt').css('height', x);
    }
  }
  PostForgotPass() {
  //  if (this.forgotPassForm.valid && !this.showLoad) {
  //    let that = this;
  //    let contact = {
  //      LastName: '',
  //      Email: that.forgotPassForm.controls["Email"].value
  //    };
  //    this.showLoad = true;
  //    this.userService.ForgotPass(contact).pipe(first()).subscribe((data:any) => {
  //          that.forgotPassForm.reset();
  //          this.router.navigate(['/thankyou'], { queryParams: { resetPassword: 'successfullyreset' } });
  //          return false;
  //        },(error: any) => {
  //          that.customError = error;
  //          // that.logger.logError(error, 'ForgotPassword');
  //          $('#myErrorModal').modal('show');
  //          that.showLoad = false;
  //          return false;
  //        });
    //  }
    if (this.forgotPassForm.valid && !this.showLoad) {
      let that = this;
      let contact = {
        LastName: '',
        Email: that.forgotPassForm.controls["Email"].value
      };
      this.showLoad = true;
      this.userService.ForgotPass(contact).pipe(first()).subscribe((data: any) => {
            that.forgotPassForm.reset();
            this.router.navigate(['/thankyou'], { queryParams: { resetPassword: 'successfullyreset' } });
            return false;
          },
          error => {
            that.customError = error;
            //that.logger.logError(error, 'ForgotPassword');
            $('#myErrorModal').modal('show');
            that.showLoad = false;
            return false;
          });
    }
}
}

export const regExps: { [key: string]: RegExp } = {
  password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
};
