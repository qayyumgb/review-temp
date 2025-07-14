import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { DataService } from '../../core/services/data/data.service';
import { first } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-licence',
  templateUrl: './licence.component.html',
  styleUrl: './licence.component.scss'
})
export class LicenceComponent implements OnInit, AfterViewInit {

  enableAgree: boolean = false;
  licenceAgreement: any;
  constructor(private dataService: DataService,
    private logger: LoggerService, 
    public sharedData: SharedDataService,
    private authenticationService: AuthenticationService,
    public router: Router,
    public bnIdle: BnNgIdleService) {}

  ngAfterViewInit() {
    var that = this;
    if (window.location.pathname == "/agreement") {
      //document.addEventListener('scroll', that.myFunction, true);
      //window.addEventListener('scroll', that.myFunction);
     
    }
  }

  ngOnInit() {
    var that = this;
    that.sharedData.showCircleLoader.next(true);
    that.sharedData.showSideNavBar.next(false);
    if (window.location.pathname == "/agreement") { }
    this.dataService.GetLicenceMaster().pipe(first()).subscribe((res: any) => {
      that.licenceAgreement = res;
      $('.licence-agree-l #discription').html(res[0].Description);
      that.sharedData.licenceAgreement.next(res[0].LicenceId)
      that.sharedData.showCircleLoader.next(false);
      // Add scroll event listener
      // Initialize scroll detection
      setTimeout(() => {
        const accordionDiv1 = document.getElementById('accordionDiv');
        if (accordionDiv1 != null) {
          accordionDiv1.addEventListener('scroll', function () {
            if (that.isScrollAtBottom(accordionDiv1)) {
              that.handleScrollEnd();
            }
          });
        }
      }, 1000)
      
    }, (error: any) => { this.logger.logError(error, 'GetLicenceMaster');  });
  }
  isScrollAtBottom(element: any) {
    var scrollingTop = element.scrollTop + element.clientHeight + 50;
    ////console.log('BottomScroll---', element.scrollHeight, element.scrollTop + element.clientHeight + 10,);
    if (element.scrollHeight > scrollingTop) { return false; } else { return true; }
  }
handleScrollEnd() {
  $('.p-rel.hov').removeClass('enableAgree');
  $('.continueBtn').removeClass('disabled');
}
  //@ViewChild('accordiondiv') accordiondiv!: ElementRef;
  //@HostListener('window:scroll', ['$event'])



  downloadAgreementPDF() {
    var divContents: any = document.getElementById("logo-sec-np")?.innerHTML;
    var divContents1: any = document.getElementById("accordionDiv")?.innerHTML;
    var a: any = window.open('', "", "width=" + screen.availWidth + ",height=" + screen.availHeight)
    a.document.write('<html><head><style>body,html{font-family:Poppins, Arial, sans-serif !important;margin-top:0;padding-top:0;} p{font-weight:400;color:#4b4b4b;}h3{ font-family:Poppins, Arial, sans-serif !important; font-weight:500; color:#000;margin:1rem 0 0 !important;font-size: 1.2rem!important;}ul li{font-weight:500; color:#000;} #logo-sec-np{height:auto;}#logo-layer{position:relative;left:1rem;margin-top:0;padding-top:0;} a{color:#7f85f5 !important;font-weight:500; white-space: nowrap; text-wrap:nowrap;} sub{position:relative;bottom:5px}</style>');
    a.document.write('</head><body ><h1><br>');
    a.document.write(divContents);
    a.document.write(divContents1);
    a.document.write('<br/><p id="inter_use" style="font-size: 0.8rem;padding:0 1rem;color:#dc3545;">For Internal Use Only.</p>');
    a.document.write('</body></html>');
    a.document.close();
    a.focus();
    a.print();
    a.close();
    this.sharedData.userEventTrack('License', "Printed License", "Printed License", 'Print btn click');
  }

  acceptAgreement() {
    var that = this;

    if (!$(".continueBtn").hasClass("disabled")) {
      that.sharedData.showCircleLoader.next(true);
      try {
        let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
        let datas = {
          "licenseId": this.sharedData.licenceAgreement.value,
          "userId": parseInt(userid)
        }
        that.dataService.PostLicenseDetails(datas).pipe(first()).subscribe((data:any)=> {
              if (data[0] != "Failed") {
                var d = that.sharedData.authenticateList.value;
                d.isPolicyAccepted = 'Y';
                sessionStorage.setItem('isPolicyAccepted', 'Y');

                that.sharedData.authenticateList.next(d);
                that.sharedData.licenceAgreement.next(0);
                this.checkPermissionRoute();
                this.sharedData.userEventTrack('License', "Agreed License", "Agreed License", 'Agree btn click');
              }
            }, (error: any) => {this.logger.logError(error, 'PostStrategyData');});
      } catch (e) {
        this.logger.logError(e, 'catch error');
        that.sharedData.showCircleLoader.next(false);
      }
    }

  }

  checkPermissionRoute() {
    var that = this;
    var routeUrl = "/home";
    this.dataService.GetUserMenuRolePermission(JSON.parse(sessionStorage['currentUser']).roleId).pipe(first()).subscribe(res => {
      this.sharedData.UserMenuRolePermission.next(res);
      //if (this.sharedData.checkShowLeftTab(1) == 'A') { routeUrl = "/dashboard"; }
      //else if (this.sharedData.checkShowLeftTab(2) == 'A') { routeUrl = "/erflibrary"; }
      //else if (this.sharedData.checkShowLeftTab(12) == 'A') {
      //  if (this.sharedData.checkMyUserType()) { this.router.navigate(["/approvedStrategies"]) }
      //  else { this.router.navigate(["/directIndexing"]) }
      //}
      //else if (this.sharedData.checkShowLeftTab(2027) == 'A') { routeUrl = "/equityUniverse"; }
      //else if (this.sharedData.checkShowLeftTab(2028) == 'A') { routeUrl = "/etfUniverse"; }
      //else if (this.sharedData.checkShowLeftTab(3) == 'A') { routeUrl = "/customIndexing"; }
      //else if (this.sharedData.checkShowLeftTab(4) == 'A') { routeUrl = "/preBuild"; }
      //else if (this.sharedData.checkShowLeftTab(6) == 'A') { routeUrl = "/myStrategies"; }
      //else if (this.sharedData.checkShowLeftTab(5) == 'A') { routeUrl = "/account"; }
      //else if (this.sharedData.checkShowLeftTab(13) == 'A') { routeUrl = "/trade"; }
      //else if (this.sharedData.checkShowLeftTab(25) == 'A') { routeUrl = "/thematicStrategies"; }
      that.sharedData.showSideNavBar.next(true);
      that.router.navigate([routeUrl]);
    }, error => { window.location.reload(); });
  }

  declineAgreement() {
    try {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let remToken = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).remToken)));
      this.authenticationService.updateUserTrackLogOut(userid, remToken);
      this.sharedData.userEventTrack('License', "Decline Agreement", "Decline Agreement", 'Cancel btn click');
    } catch (e) { }
    this.authenticationService.forceLogout();
  }

}
