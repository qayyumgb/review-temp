import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import { UserService } from '../../core/services/user/user.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrl: './thankyou-page.component.scss'
})
export class ThankyouPageComponent implements OnInit {

  TxtMsg: string = "";
  Id: string = "";
  Code: string = "";
  email: string = "";
  constructor(private logger: LoggerService,
    public sharedData: SharedDataService,
    private userService: UserService,
    private route: ActivatedRoute) { }

  VerifyEmail() {
    let that = this;
    this.userService.verifyEmail(this.email, this.Id, this.Code).pipe(first())
      .subscribe((data: any) => { that.TxtMsg = "Email is verified successfully." },
        (error: any) => { this.logger.logError(error, 'verifyEmail'); that.TxtMsg = error; });
    return false;
  }

  ngOnInit() {

    let that = this;
    try { that.sharedData.showCircleLoader.next(false); } catch (e) { }
    that.sharedData.showCircleLoader.next(false);
    that.sharedData.showSideNavBar.next(false);
    this.route.queryParams.subscribe(params => {
      that.Id = params['Id'];
      that.Code = params['Code'];
      that.email = params['email'];
      //if (this.Id == null || this.Id == "") { this.router.navigate(['/login']); } else { that.VerifyEmail(); };
    });
  }

  LoginEvent() { window.location.replace("/login"); }
}
