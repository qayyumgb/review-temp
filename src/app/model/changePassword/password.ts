import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, ValidationErrors, } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Component, OnInit, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { BnNgIdleService } from 'bn-ng-idle';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '../../core/services/logger/logger.service';
import { UserService } from '../../core/services/user/user.service';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
declare var jQuery: any;
declare var $: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!( control && control?.invalid && control.parent?.dirty);
        const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

        return (invalidCtrl || invalidParent);
    }
}
@Component({
    selector: 'password',
    templateUrl: './password.html',
    styleUrls: ['./password.scss']
})

export class PasswordComponent implements OnInit { 
    contactForm: FormGroup | any;
    showLoad: boolean = false; returnUrl: string = '';
    flag: any;
    valueee: any;
    password:any;
    newpassword:any;
    showPass = false;
    shownewPass = false;
    visible:boolean = false
    passwordIsValid = false;
    passlength: any;
    bar0: string='';
    bar1: string='';
    bar2: string='';
    bar3: string='';
    passwordToCheck: string='';
    strongPassword:boolean = false;
  private colors = ['#e32755', 'orangered', 'orange', '#02b502'];
    message: string='';
    messageColor: string='';
    showRules:boolean = false;
  constructor(private sharedData: SharedDataService, private logger: LoggerService, private snackBar: MatSnackBar, public router: Router, public bnIdle: BnNgIdleService, private formBuilder: FormBuilder,private userService: UserService,private toastr: ToastrService,private elementRef: ElementRef) {
        
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
      
      if(passedMatches === 0)
      {
         force = 10 ;
      }
    //  console.log(passedMatches,'s')
      force = passedMatches === 1 ? Math.min(force, 10) : force;
      force = passedMatches === 2 ? Math.min(force, 20) : force;
      force = passedMatches === 3 ? Math.min(force, 30) : force;
      force = passedMatches === 4 ? Math.min(force, 40) : force;
   //   console.log(force,'force');
      
      this.strengthPassError(lowerLetters, minimum, numbers, updateSymbols);
     
      console.log('force', force);
      return force;
    }
    passwordValid(event:any) {
      this.passwordIsValid = event;
    }
    strengthPassError(lowerLetters:any,minimum:any,numbers:any,symbols:any)	
    {	
      let lowUpperCase = this.elementRef.nativeElement.querySelector(".low-upper-case i");	
      let number = this.elementRef.nativeElement.querySelector(".one-number i");	
      let specialChar = this.elementRef.nativeElement.querySelector(".one-special-char i");	
     let eightChar = this.elementRef.nativeElement.querySelector(".eight-character i");	
    // console.log(lowerLetters,'lowerLetters');	
     	
         if(lowerLetters){	
          lowUpperCase.classList.remove('fa-circle');
          lowUpperCase.classList.add('fa-check');	
         }	
         else	
         {	
          lowUpperCase.classList.add('fa-circle');	
          lowUpperCase.classList.remove('fa-check');	
         }	
          if(minimum)	
         {	
          eightChar.classList.remove('fa-circle');	
          eightChar.classList.add('fa-check');	
         }	
         else	
         {	
          eightChar.classList.add('fa-circle');	
        eightChar.classList.remove('fa-check'); 	
         }	
          if(numbers)	
         {	
          number.classList.remove('fa-circle');	
          number.classList.add('fa-check');	
         }	
         else	
         {	
          number.classList.add('fa-circle');	
        number.classList.remove('fa-check');	
         }	
          if(symbols)	
         {	
          specialChar.classList.remove('fa-circle');	
          specialChar.classList.add('fa-check');	
         }	
         else	
         {	
          specialChar.classList.add('fa-circle');	
          specialChar.classList.remove('fa-check');	
         }	
    }
    onPassChange(): void {
      const password = this.contactForm?.controls["Password"].value;
    //  console.log(password,'password');
      
  
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
    showRulesClick(){
     if(this.showRules == false)
     {
      this.showRules = true;
      // this.visible = !this.visible
      const showRules:any =document.getElementById("showRules")
      showRules.style.display = "block";
     }
     else
     {
      // this.visible = !this.visible
      const showRules:any =document.getElementById("showRules")
      showRules.style.display = "none";
      this.showRules = false;
     }
    }

    // password complex logic end
  hasError(controlName: string, errorName: string):any { return this.contactForm?.controls[controlName].hasError(errorName); }
    PostPass() {
        if (this.contactForm?.valid && !this.showLoad) {
            let that = this;
            let Password = that.contactForm?.controls["Password"].value;
          let oldPassword = that.contactForm?.controls["oldPassword"].value;
         
            this.showLoad = true;
            //console.log(sessionStorage));
          this.userService.UpdatePassword(Password, oldPassword).pipe(first()).subscribe(data => {
                    if (JSON.stringify(data).toLowerCase().indexOf('updated successfully') > -1) {
                      // that.openSnackBar("New Password changed successfully", "");
                      this.toastr.success("New Password changed successfully", '', {
                        timeOut: 4000,
                      });
                      this.contactForm?.reset();
                      setTimeout(() => { that.cancelBtn() });
                    }else {
                      this.logger.logError(data, 'UpdatePass');
                      // that.openSnackBar("Current Password is incorrect", "");  
                      that.toastr.success('Current Password is incorrect', '', { timeOut: 5000 });    
                    } 
                    },
                  error => {
                    this.logger.logError(error,'UpdatePass');
                        // that.openSnackBar(error, "");
                    that.toastr.info('Please try again later.', '', { timeOut: 5000 });
                    });
            this.showLoad = false;
        }
        return false;
    }
    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 5000,
        });
    }
  ngOnInit() {
    this.sharedData.showCircleLoader.next(false);
    this.password = 'password';
    this.newpassword = 'password';
    // this.sharedData.navHeaderTitle.next('Change Password');
    this.sharedData.showSideNavBar.next(false);
        this.getWidth();
        const Regex_email = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
        //this.contactForm = new FormGroup({ 
        //    Password: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        //    confirmPassword: new FormControl('', [Validators.required], passwordMatchValidator(this.contactForm))
        //});

        this.contactForm = this.formBuilder.group({
            Password: ['', [
                Validators.required,
                Validators.minLength(8),
              Validators.pattern(regExps['password']),
             /* Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[${}\-/:\?~!"^_@\[\]{}])[a-zA-Z0-9${}\-/:\?~!"^_@\[\]{}]{8,}$/),*/
              Validators.maxLength(50),
            ]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8),Validators.maxLength(50)]],
            oldPassword: ['', [Validators.required, Validators.minLength(8)]]
        }, { validator: passwordMatchValidator });
       
    }
    checkPasswords(group: FormGroup) { // here we have the 'passwords' group
        let pass = group.controls['Password'].value;
        let confirmPass = group.controls['confirmPassword'].value;
       // console.log(pass, confirmPass);

        return pass === confirmPass ? null : { notSame: true }
    }
    currentWidth: any;
    windowinnerHeight: any;
    ngAfterViewInit() {
        if (localStorage.getItem('darkmode') === 'true') {
            document.body.className = 'dark show-h-f';
          }
          var $toggleButton = $('#darkTheme');
          var $body = $('body');
          function toggleDarkMode(e:any) {
            //console.log('e',e.target.lastChild.nodeValue);
            if (!$body.hasClass('dark')) {
              $body.addClass('dark show-h-f');
      
              localStorage.setItem('darkmode', 'true');
            } else {
              $body.removeClass('dark');
              localStorage.removeItem('darkmode');
        
            }
          }
          $toggleButton.on('click', toggleDarkMode);
          //dark theme
        var that = this;
        if (that.currentWidth >= 767) {
            jQuery("#Email").focus();
        }
        if (that.currentWidth <= 560) {

            let x = that.windowinnerHeight - 60 + 'px';
            jQuery('#ass_Hgt').css('height', x);

        }
    }
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
                   // console.log(that.currentWidth);
                    let x = that.windowinnerHeight - 60 + 'px';
                    jQuery('#ass_Hgt').css('height', x);
                }
            }, 100);
        }
    }
    onPasswordInput() {  
      this.passwordToCheck = this.contactForm?.controls["Password"].value;
      const password = this.contactForm?.controls["Password"].value;

      
  
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
       
      //  console.log(pwdStrength,'password')
  
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
        this.strengthPassError(false,false,false,false);
      }
     // console.log(this.message,'msg')

        //if (this.contactForm.hasError('passwordMismatch')) { // or some other test of the value
        //    this.contactForm.get('confirmPassword').setErrors([{ 'passwordMismatch': true }]);
        //} else {
        //    this.contactForm.get('confirmPassword').setErrors(null);
        //}
        //console.log("something happened");
        //this.passlength = this.contactForm.controls["confirmPassword"].value.toString();
        if (this.contactForm?.controls["Password"].value === this.contactForm?.controls["confirmPassword"].value) {
            this.flag = false;
            this.valueee = '0px';
        }
        else if (this.contactForm?.controls["confirmPassword"].value.length < 1) {
            this.flag = false;
        }else {
            this.flag = true;
            this.valueee = '1.15rem';
        }
        //console.log("something happened");
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
    newPassClick(){
      if (this.newpassword === 'password') {
        this.newpassword = 'text';
        this.shownewPass = true;
      } else {
        this.newpassword = 'password';
        this.shownewPass = false;
      }
    }
  cancelBtn() {
    //if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl('/dashboard?pre=y'); }
    //else { this.router.navigate(["/dashboard"]); }
    this.checkPermissionRoute();
  }

  checkPermissionRoute() {
    var that = this;
    var routeUrl = "/agreement";   
      routeUrl = "/home"; 
    //if (this.sharedData.checkShowLeftTab(1) == 'A') { routeUrl = "/dashboard"; }
    //else if (this.sharedData.checkShowLeftTab(2) == 'A') { routeUrl = "/erflibrary"; }
    //else if (this.sharedData.checkShowLeftTab(3) == 'A') { routeUrl = "/customIndexing"; }
    //else if (this.sharedData.checkShowLeftTab(12) == 'A') {
    //  if (this.sharedData.checkMyUserType()) { this.router.navigate(["/approvedStrategies"]) }
    //  else { this.router.navigate(["/directIndexing"]) }
    //}
    //else if (this.sharedData.checkShowLeftTab(2027) == 'A') { routeUrl = "/equityUniverse"; }
    //else if (this.sharedData.checkShowLeftTab(2028) == 'A') { routeUrl = "/etfUniverse"; }
    //else if (this.sharedData.checkShowLeftTab(6) == 'A') { routeUrl = "/myStrategies"; }
    //else if (this.sharedData.checkShowLeftTab(25) == 'A') { routeUrl = "/thematicStrategies"; }
        that.router.navigate([routeUrl]);
        setTimeout(() => { that.sharedData.showSideNavBar.next(true); }, 2000);
  }
}
export interface ContactFormModel { 
    Password: string;
    confirmPassword: string;
}
export function passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
  if (formGroup.get('Password')?.value === formGroup.get('confirmPassword')?.value)
    return null;

  else
    return { passwordMismatch: true };
}
 
export const regExps: { [key: string]: RegExp } = {
   // password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[${}:?~!^_@\[\]{}])[a-zA-Z0-9${}:?~!^_@\[\]{}]{8,}$/
};
