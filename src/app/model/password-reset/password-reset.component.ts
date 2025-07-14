import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '../../core/services/logger/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Angulartics2 } from 'angulartics2';
import { BnNgIdleService } from 'bn-ng-idle';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserService } from '../../core/services/user/user.service';
import { first } from 'rxjs';
declare var jQuery: any;
declare var $: any;
// @ts-ignore
import * as d3 from 'd3';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup = new FormGroup({});
  showLoad: boolean = false;
  returnUrl: string = "";
  flag: any;
  valueee: any;
  passlength: any;
  Id: string = "";
  Code: string = "";
  email: string = "";
  bar0: string = "";
  bar1: string = "";
  bar2: string = "";
  bar3: string = "";
  password: any;
  newpassword: any;
  showPass: boolean = false;
  shownewPass: boolean = false;
  passwordToCheck: string = "";
  customError: any;
  strongPassword: boolean = false;
  private colors = ['#e32755', 'orangered', 'orange', '#02b502'];
  message: string = "";
  messageColor: string = "";
  showRules: boolean = false;
  constructor( private logger: LoggerService, 
    public sharedData: SharedDataService, private snackBar: MatSnackBar, public router: Router, private route: ActivatedRoute, public bnIdle: BnNgIdleService, private formBuilder: FormBuilder, private userService: UserService) {

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

    const updateSymbols = allowedsymbols && hasSpecialChar;

    const characterCount = this.getSpecialCharCount(password);
    this.specialCharCountValid = characterCount <= 12;

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
    let lowUpperCase: any = document.querySelector(".low-upper-case i");
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
    const password = this.contactForm.controls["Password"].value;



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
    for (let n = 0; n < count; n++) { (this as any)['bar' + n] = color; };
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
  hasError = (controlName: string, errorName: string) => {
    return this.contactForm.controls[controlName].hasError(errorName);
  }
  PostPass() {
    if (this.contactForm.valid && !this.showLoad) {
      let that = this;
      let Password = that.contactForm.controls["Password"].value;
      this.showLoad = true;
      this.userService.ResetPass(Password, this.Id, this.Code, this.email).pipe(first())
        .subscribe((data:any)=> {
            //that.openSnackBar("New Password changed successfully", "");
            this.contactForm.reset();
            this.router.navigate(['/thankyou'], { queryParams: { resetPasswordChange: 'successfullychanged' } });
            this.logger.log('success', 'ResetPass');
        }, (error: any) => {
          if (isNotNullOrUndefined(error['error']) && isNotNullOrUndefined(error['error']['message'])) { that.customError = error['error']['message']; }
          else if (isNotNullOrUndefined(error['message'])) { that.customError = error['message']; }
          else if(isNotNullOrUndefined(error)) { that.customError = error; }
          if (isNullOrUndefined(error) || error == '' || error.toLowerCase() == 'unknown error' || error == 'Unknown Error') { that.customError = 'Please try again later.'; }
            $('#myErrorModal_PR').modal('show');
            this.logger.logError(error, 'ResetPass');
            // that.openSnackBar(error, "");
          });
      this.showLoad = false;
    }
    return false;
  }
  clearInputMethod1() {
    this.contactForm.reset();
    //$('#Email').focus();
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }
  ngOnInit() {
    let that = this;
    this.password = 'password';
    this.newpassword = 'password';
    const Regex_email = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";

    this.contactForm = this.formBuilder.group({
      Password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(regExps['password']),
        Validators.maxLength(50)
      ]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, { validator: this.ConfirmedValidator('Password','confirmPassword') });

    
    this.route.queryParams.subscribe((params: any) => {
      try {
        that.Id = atob(atob(atob(params.Id)));
        that.Code = params.Code;
        that.email = atob(atob(atob(params.email)));
      } catch (e) {
        that.Id = params.Id;
        that.Code = params.Code;
        that.email = params.email;
      }
      if (that.Id == null || that.Id == "") {
        that.router.navigate(['/login']);
      }
      if (that.Code == null || that.Code == "") {
        that.router.navigate(['/login']);
      }
      if (that.email == null || that.email == "") {
        that.router.navigate(['/login']);
      }
    });
    this.verifyURL();
  }

  showResetForm: boolean = true;
  verifyURL() {
    let that = this;
    this.userService.VerifyLinkFP(this.Id, this.Code).pipe(first()).subscribe((res: any) => {
      setTimeout(() => { that.sharedData.showCircleLoader.next(false); }, 500);
      if (isNotNullOrUndefined(res) && res.length > 0 && res[0] == 'N') { this.showResetForm = false; }
      else { this.showResetForm = true; }
    }, (error: any) => {
      this.showResetForm = true;
      setTimeout(() => { that.sharedData.showCircleLoader.next(false); }, 500);
    });
  }


  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group['controls']['Password'].value;
    let confirmPass = group.controls['confirmPassword'].value;
    // console.log(pass, confirmPass);

    return pass === confirmPass ? null : { notSame: true }
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
  ngAfterViewInit() {
    this.currentWidth = window.innerWidth;
    var that = this;
    if (that.currentWidth <= 560) {
      let x = window.innerHeight - 60 + 'px';
      jQuery('#ass_Hgt').css('height', x);

    }
  }
  onPasswordInput() {
    this.passwordToCheck = this.contactForm.controls["Password"].value;
    const password = this.contactForm.controls["Password"].value;



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


    //if (this.contactForm.hasError('passwordMismatch')) { // or some other test of the value
    //    this.contactForm.get('confirmPassword').setErrors([{ 'passwordMismatch': true }]);
    //} else {
    //    this.contactForm.get('confirmPassword').setErrors(null);
    //}
    //console.log("something happened");
    //this.passlength = this.contactForm.controls["confirmPassword"].value.toString();
    if (this.contactForm.controls["Password"].value === this.contactForm.controls["confirmPassword"].value) {
      this.flag = false;
      this.valueee = '0px';
    }
    else if (this.contactForm.controls["confirmPassword"].value.length < 1) {
      this.flag = false;
    } else {
      this.flag = true;
      this.valueee = '1.15rem';
    }
    //console.log("something happened");
  }

  cancelBtn() { this.router.navigate(['/login']); };

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


//export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors => {
//  if (formGroup.get('Password').value === formGroup.get('confirmPassword').value) return null;
//  else return { passwordMismatch: true };
//};

export const regExps: { [key: string]: RegExp } = {
  //password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$-/:-?{-~!"^_@`\[\]]).{8,}$/
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[${}:?~!^_@\[\]{}])[a-zA-Z0-9${}:?~!^_@\[\]{}]{8,}$/
};
