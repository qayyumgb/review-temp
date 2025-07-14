import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '../../core/services/logger/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../core/services/sharedData/shared-data.service';
declare var jQuery: any;
declare var $: any;
// @ts-ignore
import * as d3 from 'd3';
import { first } from 'rxjs';

@Component({
  selector: 'app-activate-pwd',
  templateUrl: './activate-pwd.component.html',
  styleUrl: './activate-pwd.component.scss'
})
export class ActivatePwdComponent implements OnInit, OnDestroy {
  forgotPassForm: FormGroup = new FormGroup({});
  flag: any;
  valueee: any;
  showLoad: boolean = false;
  disableProbtn: boolean = false;
  customError: any;
  password: any;
  newpassword: any;
  showPass = false;
  shownewPass = false;
  passwordToCheck: string = "";
  strongPassword: boolean = false;
  private colors = ['#e32755', 'orangered', 'orange', '#02b502'];
  message: string = "";
  messageColor: string = "";
  showRules: boolean = false;
  passlength: any;
  bar0: string = "";
  bar1: string = "";
  bar2: string = "";
  bar3: string = "";
  constructor(private snackBar: MatSnackBar, private formBuilder: FormBuilder, private logger: LoggerService,
    public router: Router, private userService: UserService, private toastr: ToastrService, private sharedData: SharedDataService) {

  }

  hasError = (controlName: string, errorName: string) => {
    return this.forgotPassForm.controls[controlName].hasError(errorName);
  }
  getSpecialCharCount(password: any) {
    const specialCharRegex = /[$:?{}\~!^_@\[\]]/g;
    const specialMatches = password.match(specialCharRegex);
    const specialCount = specialMatches ? specialMatches.length : 0;
    return specialCount;
  }
  specialCharCountValid: boolean = true;
  // password complex logic start
  checkStrength(password: string) {
    // 1
    let force = 0;

    // 2
    //const regex = /[$-/:-?{-~!"^_@`\[\]]/g;
    const lowerLetters = /^(?=.*[a-z])(?=.*[A-Z]).+$/.test(password);
    const minimum = /.{8,}/.test(password);
    const numbers = /[0-9]+/.test(password);
    //const symbols = regex.test(password);

    const allowedRegex = /^[a-zA-Z0-9$:?{}\~!^_@\[\]]+$/;
    const allowedsymbols = allowedRegex.test(password);

    const specialCharRegex = /[$:\?\{}\~!^_@\[\]]/;
    const hasSpecialChar = specialCharRegex.test(password);

    const characterCount = this.getSpecialCharCount(password);
    this.specialCharCountValid = characterCount <= 12;

    const updateSymbols = allowedsymbols && hasSpecialChar;

    // 3
    const flags = [lowerLetters, minimum, numbers, updateSymbols];

    // 4
    let passedMatches = 0;
    for (const flag of flags) {
      passedMatches += flag === true ? 1 : 0;
    }

    // 5
    force += 2 * password.length + (password.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // 6
    force = password.length <= 6 ? Math.min(force, 10) : force;

    // 7
    if (passedMatches === 0) {
      force = 10;
    }
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 30) : force;
    force = passedMatches === 4 ? Math.min(force, 40) : force;
    this.strengthPassError(lowerLetters, minimum, numbers, updateSymbols)
    return force;
  }
  strengthPassError(lowerLetters: any, minimum: any, numbers: any, symbols: any) {
    let lowUpperCase:any = document.querySelector(".low-upper-case i");
    let number: any = document.querySelector(".one-number i");
    let specialChar: any = document.querySelector(".one-special-char i");
    let eightChar: any = document.querySelector(".eight-character i");


    if (lowerLetters) {
      lowUpperCase.classList.remove('fa-circle');
      lowUpperCase.classList.add('fa-check');
    }
    else {
      lowUpperCase.classList.add('fa-circle');
      lowUpperCase.classList.remove('fa-check');
    }
    if (minimum) {
      eightChar.classList.remove('fa-circle');
      eightChar.classList.add('fa-check');
    }
    else {
      eightChar.classList.add('fa-circle');
      eightChar.classList.remove('fa-check');
    }
    if (numbers) {
      number.classList.remove('fa-circle');
      number.classList.add('fa-check');
    }
    else {
      number.classList.add('fa-circle');
      number.classList.remove('fa-check');
    }
    if (symbols) {
      specialChar.classList.remove('fa-circle');
      specialChar.classList.add('fa-check');
    }
    else {
      specialChar.classList.add('fa-circle');
      specialChar.classList.remove('fa-check');
    }
  }
  onPassChange(): void {
    const password = this.forgotPassForm.controls["Password"].value;



    this.setBarColors(4, '#DDD');

    if (password) {
      const pwdStrength = this.checkStrength(password);
      pwdStrength === 40 ? this.strongPassword = true : this.strongPassword = false;

      const color = this.getColor(pwdStrength);
      this.setBarColors(color.index, color.color);

      switch (pwdStrength) {
        case 10:
          this.message = 'Poor';
          break;
        case 20:
          this.message = 'Not Good';
          break;
        case 30:
          this.message = 'Average';
          break;
        case 40:
          this.message = 'Good';
          break;
      }
    } else {
      this.message = '';
    }
  }
  private getColor(strength: number) {
    let index = 0;

    if (strength === 10) {
      index = 0;
    } else if (strength === 20) {
      index = 1;
    } else if (strength === 30) {
      index = 2;
    } else if (strength === 40) {
      index = 3;
    } else {
      index = 4;
    }

    this.messageColor = this.colors[index];

    return {
      index: index + 1,
      color: this.colors[index],
    };
  }

  private setBarColors(count: number, color: string) {
    for (let n = 0; n < count; n++) {
      (this as any)['bar' + n] = color;
    }
  }
  showRulesClick() {
    if (this.showRules == false) {
      this.showRules = true;
      d3.selectAll('#showRules').style('display', "block");
    } else {
      d3.selectAll('#showRules').style('display', "none");
      this.showRules = false;
    }
  }


  // password complex logic end
  ngOnDestroy() { }


  openLogInScreen() {
    //window.location.replace("/login");
    var log = '/login?pre=y';
    if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl(log); }
    else { this.sharedData.showSideNavBar.next(false); this.router.navigate(['/login']); }
  }

  checkDisable() {
    if (this.disableProbtn) { return true } else if (!this.forgotPassForm.valid) { return true } else { return false };
  }

  PostForgotPass() {
    let that = this;
    //console.log(this.forgotPassForm);
    if (this.forgotPassForm.valid && !this.showLoad) {
      let that = this;
      this.disableProbtn = true;
      let Password = that.forgotPassForm.controls["Password"].value;
      let data = {
        "uniqueId": window.location.search.split('id=')[1],
        "newPassword": Password
      };
      this.showLoad = true;
      this.userService.activePass(data).pipe(first()).subscribe((data: any) => {
            this.disableProbtn = false;
            if (isNotNullOrUndefined(data) && isNotNullOrUndefined(data['status']) && Object.keys(data).length > 0 && data['status'] == "S") {
              // that.openSnackBar("New Password Activated successfully", "");

              this.toastr.success("New Password Activated successfully", '', {
                timeOut: 4000,
              });
              this.forgotPassForm.reset();
              this.logger.log('success', 'UpdatePass');
              setTimeout(() => { that.cancelBtn() });
            } else {
              // that.openSnackBar("Please try again...", "");
              $('#myErrorModal').modal('show');
              this.forgotPassForm.reset();
              this.logger.logError('F', 'activate password');
            }

          },
          error => {
            this.disableProbtn = false;
            this.logger.logError(error, 'UpdatePass');
            if (isNotNullOrUndefined(error)) { that.customError = error; }
            if (isNullOrUndefined(error) || error == '' || error.toLowerCase() == 'unknown error' || error == 'Unknown Error') { that.customError = 'Please try again later.'; }
            $('#myErrorModal_PR').modal('show');
            //that.openSnackBar(error, "");
          });
      this.showLoad = false;
    }
    return false;

  }

  cancelBtn() {
    if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl('/login?pre=y'); }
    else { this.sharedData.showSideNavBar.next(false); this.router.navigate(["/login"]); }
  }

  onPasswordInput() {
    this.passwordToCheck = this.forgotPassForm.controls["Password"].value;
    const password = this.forgotPassForm.controls["Password"].value;
    this.setBarColors(4, '#323248');
    let lowUpperCase = document.querySelector(".low-upper-case i");
    let number = document.querySelector(".one-number i");
    let specialChar = document.querySelector(".one-special-char i");
    let eightChar = document.querySelector(".eight-character i");

    if (password) {
      const pwdStrength = this.checkStrength(password);
      pwdStrength === 40 ? this.strongPassword = true : this.strongPassword = false;

      const color = this.getColor(pwdStrength);
      this.setBarColors(color.index, color.color);



      switch (pwdStrength) {
        case 10:
          this.message = 'Poor';

          break;
        case 20:
          this.message = 'Not Good';

          break;
        case 30:

          this.message = 'Average';
          break;
        case 40:

          this.message = 'Good';
          break;
      }
    } else {

      this.message = '';
      this.strengthPassError(false, false, false, false);
    }

    if (this.forgotPassForm.controls["Password"].value === this.forgotPassForm.controls["confirmPassword"].value) {
      this.flag = false;
      this.valueee = '0px';
    }
    else if (this.forgotPassForm.controls["confirmPassword"].value.length < 1) {
      this.flag = false;
    } else {
      this.flag = true;
      this.valueee = '1.2rem';
    }
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
  ngOnInit() {
    let that = this;
    this.password = 'password';
    this.newpassword = 'password';
    this.getWidth();
    this.sharedData.showSideNavBar.next(false);
    const Regex_email = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
    this.forgotPassForm = this.formBuilder.group({
      Password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(regExps['password']),
        Validators.maxLength(50)
      ]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, { validator: this.ConfirmedValidator('Password', 'confirmPassword') });

    setTimeout(() => { that.sharedData.showCircleLoader.next(false); }, 1000);
  }
  onClick() {
    if (this.password === 'password') {
      this.password = 'text';
      this.showPass = true;
    } else {
      this.password = 'password';
      this.showPass = false;
    }
  }
  newPassClick() {
    if (this.newpassword === 'password') {
      this.newpassword = 'text';
      this.shownewPass = true;
    } else {
      this.newpassword = 'password';
      this.shownewPass = false;
    }
  }
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
    if (window.orientation == 90 || window.orientation == -90) {
      // alert("land" );
    } else {
      setTimeout(function () {
        that.windowinnerHeight = window.innerHeight;
        that.currentWidth = window.innerWidth;
        if (that.currentWidth < 767) {
          //console.log(that.currentWidth);
          let x = that.windowinnerHeight - 60 + 'px';
          jQuery('#ass_Hgt').css('height', x);
        }
      }, 100);
    }
  }
  ngAfterViewInit() {
    window.scroll(0, 0);
    var that = this;
    if (that.currentWidth >= 767) {
      jQuery("#Email").focus();
    }
    if (that.currentWidth <= 560) {

      let x = that.windowinnerHeight - 60 + 'px';
      jQuery('#ass_Hgt').css('height', x);

    }
  }


  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl['errors']['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }


}

export interface ContactFormModel {
  Password: string;
  confirmPassword: string;
}


export const regExps: { [key: string]: RegExp } = {
  // password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
  //password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$-/:-?{-~!"^_@`\[\]]).{8,}$/
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[${}:?~!^_@\[\]{}])[a-zA-Z0-9${}:?~!^_@\[\]{}]{8,}$/
};

