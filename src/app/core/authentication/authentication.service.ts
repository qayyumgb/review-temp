import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, first, map } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../services/sharedData/shared-data.service';
import { UserTrack, UserTrackDtls, UserView } from '../services/user/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BnNgIdleService } from 'bn-ng-idle';
// @ts-ignore
import * as d3 from 'd3';
import { Router } from '@angular/router';
import { CustomIndexService } from '../services/moduleService/custom-index.service';
import { PrebuildIndexService } from '../services/moduleService/prebuild-index.service';
import { ThematicIndexService } from '../services/moduleService/thematic-index.service';
import { DirectIndexService } from '../services/moduleService/direct-index.service';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: any=BehaviorSubject<UserView>;
public currentUser: Observable<UserView> |undefined;
  authState = new BehaviorSubject(false);
  private api_url = environment.api_url;
  isTimerStarted: boolean = false;
  constructor(private dataService: DataService,
    private bnIdle: BnNgIdleService,
    private router: Router,
    public sharedData: SharedDataService,
    public cusIndexService: CustomIndexService,
    public preBuiltService: PrebuildIndexService,
    public theBuiltService: ThematicIndexService,
    public dirIndexService: DirectIndexService,
    private http: HttpClient,) {
    let that = this;
    try{
      this.currentUserSubject= new BehaviorSubject<UserView>(JSON.parse(sessionStorage['currentUser']));
      this.currentUser=this.currentUserSubject.asObservable();
    }catch(e){}
     
    this.authState.subscribe((state:any) => {
      if (state) {
        this.sharedData.showSideNavBar.next(true);
        //this.cusIndexService.cusIndTempStrategyData.next([]);
        //this.cusIndexService.checkverify_more.next(true);
        //that.sharedData.uname.next(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).username))));
        this.sharedData.GetSortMaster();
        this.sharedData.GetSortSetting();
        //get Trade time
        this.sharedData.getTradingHours();
        /*Get Pinned Items*/
        ////this.dataService.getPinnedMenuItems().pipe(first()).subscribe((data: any) => { this.sharedData.getPinnedMenuItems.next(data); },
        ////  (err: any) => { this.sharedData.getPinnedMenuItems.next([]); });
        //Get App Messages
        this.dataService.GetAppMessages().pipe(first()).subscribe((data: any) => { this.sharedData.popMessages = data; }, (err:any) => {
          that.dataService.getMessage().pipe(first()).subscribe((res:any) => { this.sharedData.popMessages = res; });
          //that.logger.logError(err, 'Space/GetAppMessages');
        });
    
        /*Getting user psermission Data*/
        this.dataService.GetUserTabsRolePermission(JSON.parse(sessionStorage['currentUser']).roleId).pipe(first()).subscribe((res:any) => {
          this.sharedData.UserTabsRolePermissionData.next(res);
          this.dataService.GetUserMenuRolePermission(JSON.parse(sessionStorage['currentUser']).roleId).pipe(first()).subscribe((res:any) => {
            this.sharedData.UserMenuRolePermission.next(res);
            if (that.authState.value) { that.OnInitLoad(); }
          },(error:any) => {
            if (that.authState.value) { that.OnInitLoad(); }
              //that.logger.logError(error, 'Space/GetUserMenuRolePermission');
            });
        }, (error:any) => { 
          //that.logger.logError(error, 'Space/GetUserTabsRolePermission');
         });
      }
    });
  }

  getRebalances() {
    var that = this;
    this.dataService.GetUpcomingRebalances().pipe(first()).subscribe((data: any) => {
      if (data[0] != "Failed") {
        this.sharedData.getRebalancesPopupData.next(data);
        this.sharedData.showRebalanceTrigger.next(false);
      }
    }, error => { this.sharedData.getRebalancesPopupData.next([]); });
  }
 
   getAppVersion() {
    var fURL = "../assets/data/server.json?ver=" + Math.random().toString();
    return this.http.get(fURL, { responseType: 'text' });
  }

   postEmail(email:any) {
    const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.http.post(this.api_url + '/Space/PostRequestEmail', email, httpOptions)
  }
  postRequestForm(reqData:any) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(this.api_url + '/Space/PostContactSubSpace', reqData, httpOptions)
  }
   public get currentUserValue(): UserView {
    var usr:any=sessionStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserView>(JSON.parse(usr));
    this.currentUser = this.currentUserSubject.asObservable();
    return this.currentUserSubject.value;
  }

  login(username: string, password: string, isRemember: string, fromdomain: string,company:string) {
    let that = this;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    var strurl = "";
    var body={};
    if (fromdomain == "okta"){       
      strurl = this.api_url + "/users/authenticateokta";
      var token=password;
      body= { username, token, isRemember, company };
    } else{
      strurl = this.api_url + "/users/authenticate";
      body= { username, password, isRemember, company };
    }
    return this.http.post<any>(strurl, body,httpOptions).pipe(map(user => {
      if (user && user.token) {
          user.remToken = btoa(btoa(btoa(user.remToken)));
          user.token = btoa(btoa(btoa(user.token)));
          user.userId = btoa(btoa(btoa(user.userId)));
          user.username = btoa(btoa(btoa(user.username)));
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        if (isNotNullOrUndefined(that.currentUserSubject)) { that.currentUserSubject.next(user); }
          if (user.remToken) {
            sessionStorage.setItem('UName', btoa(btoa(atob(atob(atob(user.username))))));
            sessionStorage.setItem('rToken', btoa(btoa(atob(atob(atob(user.remToken))))));
          } else {
            sessionStorage.setItem('UName', "");
            sessionStorage.setItem('rToken', "");
          }
      }
      return user;
    }));
  }
  forceLogout() {
    var that = this;
    that.sharedData.openNotification.next(false);
    that.sharedData.showSideNavBar.next(false);
    that.sharedData.openWatchlist.next(false);
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    let remToken = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).remToken)));
    this.updateUserTrackLogOut(userid, remToken);
    this.dataService.PostRelLockAccSL().pipe(first()).subscribe(res => { });
    sessionStorage.removeItem('rToken');
    sessionStorage.setItem('CREDENTIALS_FLUSH', Date.now().toString());
    sessionStorage.removeItem('CREDENTIALS_FLUSH');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('trackingId');
    sessionStorage.removeItem('issuer');
    this.authState.next(false);
    if (this.isTimerStarted) { this.bnIdle.stopTimer(); }
    $("body").attr('class', '');
    d3.selectAll(".cdk-overlay-container").selectAll("div").remove();
    var log = '/logout?pre=y';
   
    if (window.location.href.indexOf('pre=y') > -1) { this.router.navigateByUrl(log); }
    else {
      this.sharedData.showSideNavBar.next(false); that.sharedData.openNotification.next(false); that.sharedData.openWatchlist.next(false);
      this.router.navigate(['/logout']);
    }
    
  }

  updateUserTrackLogOut(userid: any, remToken: any) {
    let obj = new UserTrack();
    obj.Userid = parseInt(userid);
    obj.LogOutTime = new Date();
    if (remToken != "null") { obj.RememberToken = remToken; };
    obj.RequestedUrl = window.location.hostname;
    obj.IPAddress = "";
    obj.LogInTime = new Date();
    obj.Status = "D";
    obj.TrackingId = 0;
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.api_url + `/users/UpdateUsertrack`, obj, httpOptions).pipe(first()).subscribe(data => { });
  }

  trackUserDetails(userTrackdtls: UserTrackDtls) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.api_url + `/users/UserTrackDtls`, userTrackdtls, httpOptions)
      .pipe(map(u => {
        return u;
      }));
  }

  trackUser(userTracking: UserTrack) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(this.api_url + `/users/Usertrack`, userTracking, httpOptions)
      .pipe(map(u => {
        return u;
      }));
  }
  OnInitLoad() {
    let that = this;
    //getting Notify Data
    if (this.sharedData.checkShowLeftTab(13) == 'A') { this.sharedData.getNotifiData(); };
    if (this.sharedData.checkShowLeftTab(13) == 'A') { this.sharedData.getHNotifiData(); };
    /*Get Pinned Items*/

    this.dataService.getPinnedMenuItems().pipe(first()).subscribe((data: any) => { this.sharedData.getPinnedMenuItems.next(data); }, (err: any) => {
      this.sharedData.getPinnedMenuItems.next([]);
    });
    that.dataService.getpostCardSettings().pipe(first()).subscribe((res: any) => { this.sharedData.getSwapTileData.next(res); }, (err: any) => {
      this.sharedData.getSwapTileData.next([]);
    });
    //getting GetAllocDate
    that.dataService.GetSchedularMaster().pipe(first()).subscribe((res: any) => {
      this.sharedData.GetSchedularMaster.next(res);
      ////that.sharedData.GetAllocDate = res[0]['LipperHoldingDt'].replaceAll('-', '');
      ////that.sharedData.defaultRebalanceType = res[0]['DefRebalanceFreq'];
      //get Etf index and global Data moved onGetETFData because of get lipper date.
      that.sharedData.onGetETFData();
    }, error => {
      //get Etf index and global Data
      that.sharedData.onGetETFData();
    });

    //Getting Factor Master Data
    that.cusIndexService.getFactorMasterData();

    //Getting DbGICS Data
    that.dataService.getDbGICSData().pipe(first()).subscribe(data => { that.sharedData.dbGICS.next(data); }, error => { }); //Getting DbGICS Data

    //Getting Excel Download Disclosure
    that.dataService.GetExcelDownloadDisclosure().pipe(first()).subscribe((data:any) => {
      if (isNotNullOrUndefined(data) && isNotNullOrUndefined(data['htmlString'])) {
        var str: any = data['htmlString'].replaceAll('\n', '').split('<br>');
        var fDt:any = [];
        str.forEach((d: any) => { fDt.push([d.trim()]); });
        this.sharedData.compDis = [...fDt];
      }
    });

    //Getting Rebalance FreqList
    //that.dataService.GetRebalanceFreqList().subscribe(data => { that.sharedData.rebalancePeriod = data; }, error => { that.logger.logError(error, 'Strategy/GetRebalanceFreqList'); });

    //Getting Equity Indexes
    that.cusIndexService.GetEquityIndexe();
    
    //Get Build MyIndex Options
    that.cusIndexService.GetBuildMyIndexOptions();

    //Get MCaptial Disclosures
    if (this.sharedData.checkMyUserType()) { that.sharedData.GetExcelDisclosures(); } else { this.sharedData.excelDisclosures.next([]); }

    //Get watchList
    that.sharedData.getWatchListData();

    if (this.sharedData.checkShowLeftTab(4) == 'A') { that.preBuiltService.getNaaIndexOrderList(); }

    if (this.sharedData.checkShowLeftTab(25) == 'A') { that.theBuiltService.GetThematicIndexes(); }

    if (this.sharedData.checkShowLeftTab(12) == 'A') { this.dirIndexService.getAlphaIndex(); }

    /** Show rebalance **/
    if (this.sharedData.checkShowLeftTab(6) == 'A') { this.getRebalances(); };
    /** Show rebalance **/

    //getting Trade Notify Data
    if (this.sharedData.checkShowLeftTab(13) == 'A') { this.sharedData.getTradeNotifiData(); };
    //this.sharedData.showRebalanceTrigger.next(false);
    //Get Rebalance Dates
    that.sharedData.GetRebalanceDates();
  }

  UpdateLastLoginSession(userid: any, remToken: any) {
    let obj = new UserTrack();
    obj.Userid = parseInt(userid);
    obj.LogOutTime = new Date();
    if (remToken != "null") { obj.RememberToken = remToken; }
    obj.RequestedUrl = window.location.hostname;
    obj.IPAddress = "";
    obj.LogInTime = new Date();
    obj.Status = "A";
    obj.TrackingId = 0;

    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.api_url + `/users/UpdateLastLoginSession`, obj, httpOptions).pipe(first()).subscribe(data => {});
  }

  resetService() {
    this.sharedData.resetService();
    this.cusIndexService.resetService();
    this.preBuiltService.resetService();
    this.theBuiltService.resetService();
  }

  startTimer(sessionTimeOut: any) {
    let that = this;
    if (this.isTimerStarted)
      this.bnIdle.stopTimer();
    if (sessionTimeOut != 0) {
      var timeoutinsecs = sessionTimeOut * 60;
      this.isTimerStarted = true;
      this.bnIdle.startWatching(timeoutinsecs).subscribe((isTimedOut: boolean) => { if (isTimedOut) { this.forceLogout(); }; });
    }
  }

  resetTimer() { this.bnIdle.resetTimer(); };

  stopTimer() { if (this.isTimerStarted) this.bnIdle.stopTimer(); };
}
