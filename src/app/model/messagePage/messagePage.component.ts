import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'message',
  templateUrl: './messagePage.component.html',
  styleUrls: ['./messagePage.component.scss']
})
export class messagePageComponent implements OnInit, AfterViewInit {
  showMessage: string = "";

  constructor(private route: ActivatedRoute, public sharedData: SharedDataService, public router: Router) {

  }
  ngOnInit() {
    let that = this;
    try { that.sharedData.showCircleLoader.next(false); } catch (e) { }
    that.sharedData.showCircleLoader.next(false);
    that.sharedData.showSideNavBar.next(false);
    if (this.route.snapshot.queryParams['resetPassword'] == "successfullyreset") {
      //console.log('id: ', this.route.snapshot.queryParams['id']);
      this.showMessage = "successfullyreset";
    }
    else if (this.route.snapshot.queryParams['resetPasswordChange'] == "successfullychanged") {
      this.showMessage = "successfullychanged";
    }
    else {
      this.showMessage = "";
    }

  }
  LoginEvent() {
    window.location.replace("/login");
  }
  openLogInScreen() {
    this.router.navigate(['/login']);
  }
  ngAfterViewInit() {


  }
}
