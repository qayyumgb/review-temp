import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, retryWhen, delayWhen, scan } from 'rxjs/operators';
import { forkJoin, Observable, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private api_url: string = environment['api_url'];
  demoapi_url = environment.demoapi_url;
  dllApi_url = environment.dllApi_url;
  dllApiService: boolean = environment.dllApiService;
  constructor(private httpClient: HttpClient) { }

  InsertSession(data: any) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.httpClient.post(this.api_url + `/UserTrack/InsertSession`, data, httpOptions);
  }

  PostRelLockAccSL(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    let data = { "userid": userid };
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostRelLockAccSL", data).pipe(map(res => { return res; }));
  }

  getCaseStudyData(stockKey: any): Observable<Object> {
    var apiUrl = this.api_url + "/Scores/GetResearchCS/" + stockKey;
    return this.httpClient.get(apiUrl).pipe(map(res => { return res; }));
  }

  GetScoreDtls(Stockkey: any) {
    return this.httpClient.get(this.api_url + "/scores/GetScoreDtls" + "/" + Stockkey).pipe(map(res => { return res; }));
  }

  PostUpdateTradeNotification(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/UpdateTradeNotifyQueue`, data);
  }

  GetAppMessages(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Space/GetAppMessages/" + userid).pipe(map(res => { return res; }));
  }

  getMessage(): Observable<Object> {
    var fURL = "../assets/data/message.json";
    return this.httpClient.get(fURL, { responseType: 'json' });
  }
  PostCloneSData(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostCloneSData_v1`, data);

  }
  GetAllocScores(date: any, GICSId: any, Range: any, indexid: any, top: any, indexType: any): Observable<Object> {
    //return this.httpClient.get(this.api_url + "/Scores/GetAllocScores/" + date + "/" + GICSId + "/" + Range + "/" + indexid + "/" + top + "/" + indexType).pipe(map(res => {
    //  return res;
    //}));
    var data = {
      "date": date,
      "sector": GICSId,
      "percentage": Range,
      "universe": indexid,
      "toporbottom": top,
      "type": indexType
    };
    return this.httpClient.post<string>(this.api_url + `/Scores/GetAllocScoresMsgkub`, data);
    //return this.httpClient.post<string>(this.api_url + `/Scores/GetAllocScoreskub`, data);
  }

  GetAllocScoresMsgkubTimeline(date: any, GICSId: any, Range: any, indexid: any, top: any, indexType: any): Observable<Object> {
   var data = {
      "date": date,
      "sector": GICSId,
      "percentage": Range,
      "universe": indexid,
      "toporbottom": top,
      "type": indexType
    };
    return this.httpClient.post<string>(this.api_url + `/Scores/GetAllocScoresMsgkubTimeline`, data);
  }
  
  GetAccsTaxlot(AccId:any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetAccsTaxlot/" + userid + '/' + AccId).pipe(map(res => { return res; }));
  }
  GetTradesHistoryHoldings(rebId: any, AccId:any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    //return this.httpClient.get(this.api_url + "/Strategy/GetTradesHistoryHoldings/" + rebId + "/" + userid + "/" + AccId).pipe(map(res => { return res; })); let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { "userid": parseInt(userid), "accountId": AccId, "rebalanceId": rebId };
    return this.httpClient.post(this.api_url + "/Strategy/GetTradesHistoryHoldings", data).pipe(map(res => { return res; }));
  }
  GetTradesHistoryAccDtls(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/GetTradesHistoryAccDtls`, data);
  }
  PostPershingAccountUnrealizedGL(acctitle:any): Observable<Object> {
    return this.httpClient.post<string>( this.demoapi_url+"/Pershing/PostIntradayUnrealizedGLAccount", acctitle)
  }
  PostPershingAccountRealizedGl(acctitle:any): Observable<Object> {
    return this.httpClient.post<string>( this.demoapi_url+"/Pershing/PostIntradayRealizedGLAccount", acctitle)
  }
  GetTradesHistoryList(accountId: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetTradesList/" + accountId + "/" + userid).pipe(map(res => { return res; }));
  }
  GetUserMenuPermissionV1(UserId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Users/GetUserMenuPermissionV1" + "/" + UserId).pipe(map(res => {
      return res;
    }));
  }
  getPinnedMenuItems() {
    let UserId = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data: any = { "userid": UserId };
    return this.httpClient.post<any>(this.api_url + `/Strategy/getPinnedMenuItems`, data);
  }
  PostPinnedItems(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostPinnedItems", data).pipe(map(res => { return res; }));
  }
  PostPinnedMultipleItems(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostPinnedMultiItems", data).pipe(map(res => { return res; }));
  }
  getpostCardSettings() {
    let UserId = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data: any = { "userid": UserId };
    return this.httpClient.post<any>(this.api_url + "/Strategy/postCardSettings", null);
    //return this.httpClient.post<any>(this.api_url + "/Strategy/postCardSettings").pipe(map(res => { return res; }));
  }
  postCardSettings(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostCardData", data).pipe(map(res => { return res; }));
  }
  GetPresentationdata(): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/GetPresentationdata", null).pipe(map(res => { return res; }));
  }
  GetPresentationSlides(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/GetPresentationSlides", data).pipe(map(res => { return res; }));
  }
   GetPresentationTickers(): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/GetPresentationTickers", null).pipe(map(res => { return res; }));
  }
  UpdateDefaultPresentationId(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/UpdateDefaultPresentationId", data).pipe(map(res => { return res; }));
  }
  GetHistTickerIgData(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Scores/GetHistTickerIgData", data).pipe(map(res => { return res; }));
  }
  GetBuildMyIndexMnthlyHPSavedCITAccskub(data: any) {
    var url = this.demoapi_url + "/strategy/GetBuildMyIndexMnthlyHPSavedCITAccskub";
    if (this.dllApiService) { url = this.dllApi_url + `/Strategy/GetBuildMyIndexMnthlyHPortfolio`; }
    return this.httpClient.post<string>(url, data);
  }
  GetTaxharvestSavedCITAccskub(data: any): Observable<Object> {
    var url = this.demoapi_url +"/strategy/GetTaxharvestSavedCITAccskub ";
    if (this.dllApiService) { url = this.dllApi_url + "/Strategy/GetTaxharvestData"; }
    return this.httpClient.post<string>(url, data);  
  }

  GetUserMenuRolePermission(CatId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Space/GetUserMenuRolePermission/" + CatId).pipe(map(res => {
      return res;
    }));
  }
  GetDIEnabletradinglist(accId: number): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetDIEnabletradinglist/" + userid + '/' + accId).pipe(map(res => {
      return res;
    }));
  }
  GetUserTabsRolePermission(UserId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Space/GetUserTabsRolePermission/" + UserId).pipe(map(res => {
      return res;
    }));
  }

  Getmaintanenance(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Scores/GetMaintenanceMode").pipe(map(res => {
      return res;
    }));
  }
  GetlatestBMCompanies(): Observable<any> {
    return this.httpClient.get(this.api_url + "/scores/GetlatestBMCompanies").pipe(map(res => { return res; }));
  }

  PostDNSList(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostDNSList", data).pipe(map(res => { return res; }));
  }
  FindIssuerSSO(data: any) {
    var url = this.api_url + `/Space/FindIssuer`;
    return this.httpClient.post(url, data);
  }

  FindCompanySSO(data: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Space/FindCompany/" + data).pipe(map(res => { return res; }));
  }

  GetLicenceMaster(): Observable<any> {
    return this.httpClient.get(this.api_url + "/Users/GetLicenceMaster").pipe(map(res => {
      return res;
    }));
  }

  PostLicenseDetails(data: any): Observable<Object> {
    return this.httpClient.post(this.api_url + "/Users/PostLicenseDetails", data);
  }

  GetSchedularMaster(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Scores/GetSchedularMaster").pipe(map(res => {
      return res;
    }));
  }

  getDbGICSData(): Observable<any> {
    return this.httpClient.get(this.api_url + '/Industry/GetIndustry').pipe(map(res => { return res; }));
  }

  getETFData(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));

    return this.httpClient.get(this.api_url + "/strategy/GetETFMasterV2" + '/' + userid).pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => {
      return res;
    }));
  }

  GetESGScores(): Observable<any> {
    return this.httpClient.get(this.demoapi_url + "/Scores/GetESGScores").pipe(map(res => { return res; }));
  }
  GlobalSearch(searchKey: string): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data: any = { "userid": userid, "searchKey": searchKey };
    return this.httpClient.post(this.api_url + "/Strategy/GlobalSearch", data).pipe(map(res => { return res; }));
  }

  getGlobalData(d: any): Observable<Object> {
    var apiurl;
    if (d != "") {
      apiurl = this.api_url + "/Scores/GetNAACHIndexScoresCurrent/GLOBAL/" + d;
    } else {
      apiurl = this.api_url + "/Scores/GetNAACHIndexScoresCurrent/GLOBAL";
    }
    return this.httpClient.get(apiurl).pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => {
      return res;
    }));
  }
  GetToolIcons(): Observable<Object> {
    return this.httpClient.get(this.demoapi_url + "/scores/GetToolIcons").pipe(map(res => {
      return res;
    }));
  }
  GetSubAccounts(): Observable<Object> {
    //this.ibkrcpapi_url + "/IBWS/GetSubAccounts"
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetSubAccounts_DB/" + userid).pipe(map(res => {
      return res;
    }));
  }
  GetAccountConfigSettings(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetAccountConfigSettings/" + userid).pipe(map(res => {
      return res;
    }));
  }
  PostPershingAccountDetails(acctitle:any): Observable<Object> {
    return this.httpClient.post<string>( this.demoapi_url+"/Pershing/PostIntradayholdingAccount", acctitle).pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => {
      return res;
    }));
  }
  GetAccountDetails_1(accID:any): Observable<Object> {
    //this.ibkrcpapi_url + "/IBWS/GetAccountDetails_1/" + accID
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetAccountDetails_DB/" + accID).pipe(map(res => { return res; }));
  }
  GetSubAccounts_DBPershing(accid: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetSubAccounts_DBPershing/" + userid + "/" + accid).pipe(map(res => { return res; }));
  }
  GetAccountData(acctid: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetAccountData/" + acctid + '/' + userid).pipe(map(res => { return res; }));
  }
  GetStrategyfindList(AccId: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetStrategyfindList/" + AccId + '/' + userid)
      .pipe(map(res => { return res; }));
  }
  GetTradedList(accId: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetTradedList/" + accId + '/' + userid).pipe(map(res => { return res; }));
  }
  GetStrategyAssetListPrebuilt(mode: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Strategy/GetStrategyList/-1/" + mode).pipe(map(res => {
      return res;
    }));
  }

  //Prebuild Indexconstruction
  GetPrebuildIndexConstruction(mode: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/indexes/GetIndexConstructionJson").pipe(map(res => {
      return res;
    }));
  }
  GetPrebuildIndexConstructionFamily(id:any): Observable<Object> {
    var data =  '{"indexid":' + id + '}'
    return this.httpClient.post(this.api_url + "/Export/FamilyindexConstructionWeight", data).pipe(map(res => { return res; }));
  }
   //Prebuild Indexconstruction End
  GetTaxharvestDataDirect(data: any): Observable<Object> {
    var url = this.demoapi_url + "/strategy/GetTaxharvestSavedkub";
    if (this.dllApiService) { url = this.dllApi_url + "/Strategy/GetTaxharvestData"; }
    return this.httpClient.post<string>(url, data);
  }

  //get direct index data
  GetEquityScores(indexid: number, tradedate: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Scores/GetEquityScores/" + indexid + '/' + tradedate + '/' + userid).pipe(map(res => { return res; }));
  }

  //GetEquityIndexes
  GetEquityIndexes(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetEquityIndexes/" + userid).pipe(map(res => { return res; }));
  }
  GetIndexPerformanceAll(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetIndexPerformanceAll").pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => {
      return res;
    }));
  }
  GetBuildMyIndexMnthlyHPortfolioDirect(data: any): Observable<any> {
    //var url = this.demoapi_url + "/strategy/GetBuildMyIndexMnthlyHPSavedkub";
    var url = this.api_url + "/strategy/GetBuildMyIndexMnthlyHPSavedkub";
    return this.httpClient.post<string>(url, data);
  }

  GetPerformanceETFRList(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/GetETFStrategyETFRIndex", data);
  }

  GetStrategyAccount(slid: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetStrategyAccounts/" + slid + '/' + userid).pipe(map(res => {
      return res;
    }));
  }

  GetTaxharvestSavedCIkub(data: any): Observable<Object> {
    var url = this.demoapi_url + "/strategy/GetTaxharvestSavedCIkub ";
    return this.httpClient.post<string>(url, data);
  }

  GetStrategyTopNotification(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetStrategyFactTopNotification/" + userid).pipe(map(res => {
      return res;
    }));
  }

  GetHoldingsTopNotification(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetHoldingsTopNotification/" + userid)
      .pipe(map(res => { return res; }));
  }

  GetStrategyAssetList(assetid: any, mode: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetStrategyAssetList/" + userid + "/" + assetid + "/" + mode).pipe(map(res => {
      return res;
    }));
  }

  GetBuildMyIndexMnthlyHPSavedCIkub(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + "/strategy/GetBuildMyIndexMnthlyHPSavedCIkub", data);
  }

  GetHoldingsSavedkub(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + "/strategy/GetHoldingsSavedkub", data);
  }

  MCaptialDisclosures(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { "userid": userid };
    return this.httpClient.post<any>(this.api_url + "/Export/MCaptialDisclosures", data).pipe(map(res => { return res; }));
  }

  PostRemoveAccLinks(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostRemoveAccLinks", data);
  }

  GetlockPauseAccs(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/GetlockPauseAccs", data).pipe(map(res => { return res; }));
  }

  PostStrategyData(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostStrategyData`, data);
  }

  PostStrategyAccount(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostStrategyAccounts`, data);
  }
  GetStgyListDashboard(mode: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    //return this.httpClient.get(this.api_url + "/Strategy/GetStrategyList/" + userid).pipe(map(res => {
    //  return res;
    //}));

    return this.httpClient.get(this.demoapi_url + "/Strategy/GetStgyListDashboard/" + userid + "/" + mode).pipe(map(res => {
      return res;
    }));
  }
  GetStgyListDashboardAccs(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetStgyListDashboardAccs/" + userid).pipe(map(res => { return res; }));
  }

  PostStrategyNotificationQueue(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/PostStrategyFactNotification`, data);
  }

  PostStrategyHNotification(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/PostStrategyHNotification`, data);
  }

  GetFactSheetGConditions(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/GetFactSheetGConditions", data).pipe(map(res => { return res; }));
  }

  GetHoldingsFSConditions(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/GetHoldingsFSConditions", data).pipe(map(res => { return res; }));
  }

  PostUpdateStrategyDisplayQueue(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/UpdateShowNotifyQueue`, data);
  }

  PostUpdateHShowNotifyQueue(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/UpdateHShowNotifyQueue`, data);
  }

  PostUpdateStrategyNotification(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/UpdateStrategyNotification`, data);
  }

  PostUpdateHNotification(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/strategy/UpdateHNotification`, data);
  }

  RebalanceMsgkub(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/RebalanceMsgkub", data).pipe(map(res => { return res; }));
  }

  RebalanceCLMsgkub(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/RebalanceCLMsgkub", data).pipe(map(res => { return res; }));
  }

  GetRefreshTradesAlloc(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/GetRefreshTradesAlloc", data).pipe(map(res => { return res; }));
  }

  //previous portfolio display
  GetTradeAccountPortfolio(accountId: any, strategyId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Strategy/GetTradeAccountPortfolio/" + accountId + '/' + strategyId)
      .pipe(map(res => { return res; }));
  }

  CheckTradingHours(): Observable<any> {
    return this.httpClient.get(this.api_url + "/Strategy/CheckTradingHours").pipe(map(res => { return res; }));
  }

  PostUpdateTradetimePopup(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostUpdateTradetimePopup", data).pipe(map(res => { return res; }));
  }

  //account Lock/Pause
  PostLockAcc(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostLockAcc", data).pipe(map(res => { return res; }));
  }

  GetAccountDataInd(accId: number): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetAccountData/" + accId + '/' + userid).pipe(map(res => {
      return res;
    }));
  }

  GetBuildMyIndexMnthlyHPtrade(data: any) {
    var url = this.api_url + `/Strategy/GetBuildMyIndexMnthlyHPtradeFactMsgkub`;
    return this.httpClient.post<string>(url, data);
  }

  GetTaxharvesttrade(data: any): Observable<Object> {
    var url = this.api_url + "/Strategy/GetTaxharvesttradeFactMsgkub";
    return this.httpClient.post<string>(url, data);
  }

  GetStrategyNotifyId(slid: any, accid: any): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetNotifyId/" + slid + "/" + accid + "/" + userid).pipe(map(res => {
      return res;
    }));
  }

  GetUserSteps(notifyid: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetUserSteps/" + notifyid + '/' + userid).pipe(map(res => { return res; }));
  }

  GetBuildMyIndexOptions(): Observable<Object> {
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetBuildMyIndexOptions").pipe(map(res => {
      return res;
    }));
  }

  PostCompanies(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostCompanies", data);
  }

  PostStgyNotifyAccs(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostStgyNotifyAccs", data);
  }

  GetTradingHours(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/GetTradingHours", data).pipe(map(res => { return res; }));
  }

  PostEnableTrading(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostEnableTrading`, data);
  }

  GetTradeNotification(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetTradeNotification/" + userid).pipe(map(res => { return res; }));
  }
  /**
   *****
   Prebuilt
   ***/
 
  GetIndexOrder(): Observable<any> {
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetIndexOrder").pipe(map(res => { return res; }));
  }

  GetESGCatStocks(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetESGCatStocks/" + userid)
      .pipe(map(res => { return res; }));
  }

  NAAIndexSHoldingID(id: any): Observable<any> {
    return this.httpClient.get(this.api_url + "/Strategy/NAAIndexSHoldings/" + id).pipe(map(res => { return res; }));
  }
  getNAAMaster_1(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetNAAIndexes_V0").pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => {
      return res;
    }));
  }

  getNAAHoldings(indexId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetNAAIndexStkKeys/" + indexId).pipe(retryWhen(err => err.pipe(
      scan(count => {
        if (count > 5) throw err;
        else {
          count++;
          return count;
        }
      }, 0),
      delayWhen(() => timer(1000))
    ))).pipe(map(res => { return res; }));
  }

  PostPauseAcc(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostPauseAcc", data).pipe(map(res => { return res; }));
  }

  GetNAAIndexStrategyPerf(data: any): Observable<Object> {
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetNAAIndexStrategyPerf/" + data).pipe(map(res => { return res; }));
  }

  GetNAAIndexSValues(data: any): Observable<Object> {
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetNAAIndexSValues/" + data).pipe(map(res => {
      return res;
    }));
  }

  getLineChartData(id: any, BMID: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetIndexReturnsCalc/" + id + '/' + BMID).pipe(map(res => { return res; }));
  }

  GetGlobalRebalances(id: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetGlobalRebalances/" + id).pipe(map(res => { return res; }));
  }

  GetSectorIndexClassify(val: any): Observable<Object> {
    return this.httpClient.get(this.api_url + '/Indexes/GetSectorIndexClassify/' + val)
      .pipe(map(res => { return res; }));
  }

  GetIndexDetails(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Indexes/GetIndexDetails", data).pipe(map(res => { return res; }));
  }

  GetGlobalSignalsByDate(id: any, RebalanceDt: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetGlobalSignalsByDate/" + id + '/' + RebalanceDt)
      .pipe(map(res => { return res; }));
  }

  getNAAThematicHoldings(indexId: any): Observable<any> {
    return this.httpClient.get(this.api_url + "/Strategy/NAAThematicHoldings/" + indexId).pipe(map(res => { return res; }));
  }

  GetThematicIndexes(): Observable<any> {
    return this.httpClient.get(this.api_url + "/Strategy/GetThematicIndexes").pipe(map(res => { return res; }));
  }

 DIfactsheetSectordataAPI(data: any): Observable<any> {
   return this.httpClient.post<any>(this.api_url + "/Export/DIfactsheetSectordataAPI", data).pipe(map(res => { return res; }));
  }

  CustomIndexSectorDataAPI(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/CustomIndexSectorDataAPI", data).pipe(map(res => { return res; }));
  }


  //custom tool start
  GetCompanyExList(slid: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetCompanyExList/" + slid + '/' + userid);
  }

  PostCompExData(data: any) {
    return this.httpClient.post<any>(this.api_url + `/Strategy/PostCompExData`, data);
  }

  GetGicsExList(slid: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetGicsExList/" + slid + '/' + userid);
  }

  PostGicsExData(data: any) {
    return this.httpClient.post<any>(this.api_url + `/Strategy/PostGicsExData`, data);
  }

  GetStrategyFactors(slid: any, assetid: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { "userid": userid, "slid": slid, "assetid": assetid };
    return this.httpClient.post<any>(this.api_url + "/Factor/GetStrategyFactors", data);
  }

  PostStrategyFactorsByStatus(data: any) {
    return this.httpClient.post<any>(this.demoapi_url + `/Factor/PostStrategyFactorsByStatus`, data);
  }

  GetAllocScoresv1(data:any){
    return this.httpClient.post<string>(this.api_url + `/Scores/GetAllocScoresMsgkubv2`, data);
  }
  PostRestrictedList(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostRestrictedList", data).pipe(map(res => { return res; }));
  }
  PostDARList(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostDARList", data).pipe(map(res => { return res; }));
  }
  PostlongShortSA(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostlongShortSA`, data);
  }
  PostTradeLiquidate(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostTradeLiquidate`, data);
  }
  PostFundedET(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostFundedET`, data);
  }
  PostStrategyCashRaise(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostTradeCashRise`, data);
  }
  PostValidateCashRise(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostValidateCashRise`, data);
  }
  PostUpdateAccName(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + "/Strategy/PostUpdateAccName", data)
  }
  PostCashTargetSA(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostCashTargetSA`, data);
  }
  PostCashTarget(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostCashTarget`, data);
    }
  PostStrategyAccountSettingsSA(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostTradeAccSettingsSA`, data);
  }
  PostStrategyAccountSettings(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostTradeAccSettings`, data);
  }
  PostlongShort(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostlongShort`, data);
  }
  PostDRList(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostDRList", data).pipe(map(res => { return res; }));
  }
  GetRestrictedList(accId: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetRestrictedList/" + accId + '/' + userid).pipe(map(res => { return res; }));
  }
  GetFactorMaster() { return this.httpClient.get(this.api_url + "/Factor/GetFactorMaster"); }
  /*------------------------------ Restricted web API -----------------------------------*/
  GetDNSList(accId: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetDNSList/" + accId + '/' + userid).pipe(map(res => { return res; }));
  }
  GetTradeAccs(accId: any): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetTradeAccs/" + userid + '/' + accId).pipe(map(res => { return res; }));
  }
  GetUpcomingRebalances(): Observable<any> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetNextRebalanceDates/" + userid).pipe(map(res => {
      return res;
    }));
  }
  PostNotificationError(data: any) {
    return this.httpClient.post<string>(this.demoapi_url + `/Strategy/PostNotificationErrorEmail`, data);
  }
  GetETFStrategyPlainIndex(data: any): Observable<any> {
    //var url = this.demoapi_url + "/Strategy/GetETFStrategyPlainMsgkub";
    var url = this.demoapi_url + "/Strategy/GetETFStrategyPlainMsgJsonkub";
    return this.httpClient.post<string>(url, data);
  }
  // Don't Buy List
  GetDontBuyList(accountId: any): Observable<Object> {   
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Strategy/GetDontBuyList/" + accountId + '/' + userid)
      .pipe(map(res => { return res; }));
  }
  // Don't Buy List
  DeleteStrategyData(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Strategy/PostDeleteStrategy`, data);
  }

  CombinedFactorsData(assetid: any): Observable<any> {
    return this.httpClient.get(this.api_url + "/Factor/CombinedFactorsEquityData/" + assetid).pipe(map(res => { return res; }));
  }

  CombinedFactorsETFData(assetid: any, holdingdate: any): Observable<any> {
    var data = { "assetid": assetid, "holdingdate": holdingdate };
    return this.httpClient.post<any>(this.api_url + "/Factor/CombinedFactorsETFData", data).pipe(map(res => { return res; }));
  }

  PostStgyName(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/PostStgyName", data).pipe(map(res => { return res; }));
  }
  //custom tool end

  GetFamilyindexsector(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Export/GetFamilyindexsector", data).pipe(map(res => { return res; }));
  }

  GetAdditionalReturns(indexid: any, GICSid: any, Ctype: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Scores/GetAdditionalReturns/" + indexid + "/" + GICSid + "/" + Ctype).pipe(map(res => {
      return res;
    }));
  }

  GetIndexRunsPerformanceDate(indexid: any, GICSid: any, Ctype: any, Range: any, userV: any, NaaV: any, Date: any): Observable<Object> {
    var data = {
      "indexId": indexid,
      "gicsId": GICSid,
      "type": Ctype,
      "range": Range,
      "bmPercentage": userV,
      "naaPercentage": NaaV,
      "date": Date
    }
    return this.httpClient.post<any>(this.api_url + "/Portfolio/GetIndexRunsPerformanceByDate", data).pipe(map(res => { return res; }));   
  }

  GetIndexPerformance(NAAIndexId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Portfolio/GetIndexPerformance" + "/" + NAAIndexId).pipe(map(res => { return res; }));
  }

  GetIndexRunsPerformance(indexid: any, GICSid: any, Ctype: any, Range: any, userV: any, NaaV: any): Observable<Object> {
    var data = {
      "indexId": indexid,
      "gicsId": GICSid,
      "type": Ctype,
      "range": Range,
      "bmPercentage": userV,
      "naaPercentage": NaaV
    };
    return this.httpClient.post<any>(this.api_url + "/Portfolio/GetIndexRunsPerformance", data).pipe(map(res => { return res; }));
  }

  GetBMIndexStkKeys(indexId: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetBMIndexStkKeys/" + indexId);
  }


  getQDateData(selrow: any, indName: any, Isin: any): Observable<Object> {
    var apiUrl: string = "";
    if (selrow.country == 'USA') {
      apiUrl = this.api_url + "/Scores/GetAnnScoresData/" + indName + "/" + Isin + "/0";
    } else {
      apiUrl = this.api_url + "/Scores/GetQuaterlyScoresData/" + indName + "/" + Isin + "/0";
    }
    return this.httpClient.get(apiUrl);
  }

  getQtrData(trdate: any, industry: any, IndId: any, indName: any): Observable<Object> {
    var data = {
      "tradeDt": trdate,
      "industry": industry,
      "itype": IndId,
      "index": indName
    };
    return this.httpClient.post<any>(this.api_url + '/Scores/GetNAAIndexScoresHistByIndustryIndex', data).pipe(map(res => { return res; }));
  }

  getIndexPreRuns(indexid: any, GICSid: any, Ctype: any, Range: any): Observable<Object> {
    var data = { "indexId": indexid, "gicsId": GICSid, "type": Ctype, "range": Range };
    return this.httpClient.post<any>(this.api_url + "/Indexes/GetIndexPreRuns", data).pipe(map(res => { return res; }));
  }

  PostIndexPreRunslanding(Range: any): Observable<Object> {
    //var topVal = "top" + String(range[1]);
    var data = { "indexname": "S&P 500", "gicsId": 0, "type": "MC", "range": Range };
    return this.httpClient.post<any>(this.api_url + "/Indexes/PostIndexPreRunslanding", data).pipe(map(res => { return res; }));
  }

  GetTop10Holdings(id: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetTop10Holdings/" + id)
      .pipe(map(res => { return res; }));
  }

  GetSectorBreakDown(id: any): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Indexes/GetSectorBreakDown/" + id)
      .pipe(map(res => { return res; }));
  }

  GetETFIndexRunsPerformanceDate(indexid: any, NAAIndexId: any, GICSid: any, Ctype: any, Range: any, BMPercentage: any, NAApercentage: any, date: any): Observable<Object> {
    var data = {
      "indexId": indexid,
      "naaIndexId": NAAIndexId,
      "gicsId": GICSid,
      "type": Ctype,
      "range": Range,
      "bmPercentage": BMPercentage,
      "naaPercentage": NAApercentage,
      "date": date
    };
    return this.httpClient.post<any>(this.api_url + "/Portfolio/GetETFIndexRunsPerformance", data).pipe(map(res => { return res; }));   
  }

  GetNAAPriceChange(stockKey: any, Price: any) {
    return this.httpClient.get(this.api_url + "/Scores/GetNAAPriceChange/" + stockKey + "/" + Price).pipe(map(res => {
      return res;
    }));
  }

  UpdateAllocAlertList(data: any) {
    return this.httpClient.post<string>(this.api_url + `/scores/PostAllocationAlert`, data);
  }

  getAlloAlertListData(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.api_url + "/Scores/GetAllocationAlert/" + userid)
      .pipe(map(res => { return res; }));
  }


  RemoveCompanySSO(data: any) {
    return this.httpClient.post<string>(this.api_url + `/Space/RemoveCompany`, data);
  }

  GetCompanySSO(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Space/GetCompany").pipe(map(res => { return res; }));
  }

  GetCompaniesSSO(): Observable<Object> {
    return this.httpClient.get(this.api_url + "/Space/GetCompanies/").pipe(map(res => { return res; }));
  }

  updateOktaSettings(user: any) {
    return this.httpClient.post(this.api_url + `/Space/PostCompanies`, user);
  }

  GetRecentFrequentIndexes(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return this.httpClient.get(this.demoapi_url + "/Strategy/GetRecentFrequentIndexes/" + userid).pipe(map(res => { return res; }));
  }

  GetIndexPreRunsCustomBP(IndexId: any, GICSId: any, Ctype: any): Observable<Object> {
    var data = { "indexId": IndexId, "gicsId": GICSId, "type": Ctype };
    return this.httpClient.post<any>(this.api_url + "/Indexes/GetIndexPreRunsCustomBP", data).pipe(map(res => { return res; }));    
  }

  GetNAAIndexHistByIndustry(TradeDt:any,Industry:any, Itype:any,Index:any): Observable<Object> {
    var data = { "tradeDt": TradeDt, "industry": Industry, "itype": Itype, "index": Index };
    return this.httpClient.post<any>(this.api_url + "/Scores/GetNAAIndexHistByIndustry", data).pipe(map(res => { return res; }));    
  }

  UpdateWatchList(data: any) {
    return this.httpClient.post<string>(this.api_url + `/scores/PostWatchList`, data);
  }

  getWatchListData(): Observable<Object> {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { userid: userid }
    /*return this.httpClient.get(this.api_url + "/Scores/GetWatchList/" + userid).pipe(map(res => { return res; }));*/
    return this.httpClient.post(this.demoapi_url + "/Scores/GetWatchList", data).pipe(map(res => { return res; }));
  }
  GetRebalanceDates(): Observable<any> {
    return this.httpClient.get(this.api_url + "/Strategy/GetRebalanceDates").pipe(map(res => { return res; }));
  }

  GetExcelDownloadDisclosure(): Observable<Object> {
    let userid = { "uid": JSON.parse(sessionStorage['currentUser']).userId } ;
    return this.httpClient.post(this.demoapi_url + "/Export/GetExcelDownloadDisclosure", userid).pipe(map(res => { return res; }));
  }

  GetCustomIndexMonthlyReturnsDownload(data:any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/CustomIndexMonthlyReturnsDownload", data).pipe(map(res => { return res; }));
  }

  DirectIndexMonthlyReturnsDownload(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/DirectIndexMonthlyReturnsDownload", data).pipe(map(res => { return res; }));
  }

  DirectIndexExport_ProposalDI(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/Export_ProposalDI", data, { observe: 'response', responseType: 'blob' }).pipe(map(res => { return res; }));
  }

  GetSortSettings(): Observable<any> {
    return this.httpClient.post(this.api_url + "/Space/GetSortSettings", {}).pipe(map(res => { return res; }));
  }

  GetSortMaster(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Space/GetSortMaster", data).pipe(map(res => { return res; }));
  }

  PostSortSettings(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Space/PostSortSettings", data).pipe(map(res => { return res; }));
  }

  ResetSortSettings(): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Space/ResetSortSettings", {}).pipe(map(res => { return res; }));
  }

  GetHistTickerIgETFData(data:any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/scores/GetHistTickerIgETFData", data).pipe(map(res => { return res; }));
  }

  PrebuilfactsheetdataMonthend(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/PrebuilfactsheetdataMonthend", data, { observe: 'response', responseType: 'blob' }).pipe(map(res => { return res; }));
  }

  DownloadPerformance(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/DownloadPerformance", data, { observe: 'response', responseType: 'blob' }).pipe(map(res => { return res; }));
  }

  GetScoreETFDtls(Stockkey: any) {
    return this.httpClient.get(this.api_url + "/scores/GetScoreETFDtls" + "/" + Stockkey).pipe(map(res => { return res; }));
  }

  PerformaneReport(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Export/PerformaneReport", data).pipe(map(res => { return res; }));
  }
  PostDirectTradeData(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostDirectTradeData", data).pipe(map(res => { return res; }));
  }
  GetDirectTradeData(data: any): Observable<Object> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/GetDirectTradeInfo", data).pipe(map(res => { return res; }));
  }

  RebalanceMsgDTkub(data: any): Observable<any> {
    return this.httpClient.post<any>(this.api_url + "/Strategy/RebalanceMsgDTkub", data).pipe(map(res => { return res; }));
  }

  PostDTCompanies(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostDTCompanies", data);
  }

  PostRemoveHdrDtl(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostRemoveHdrDtl", data);
  }

  PostRemoveDtl(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/PostRemoveDtl", data);
  }

  GetTradesAllocationHis(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/GetTradesAllocationHis", data);
  }

  postLowVolatilityPerformance(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/LowVolatilityPerformance", data);
  }
  postCorePerformance(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/Strategy/CorePerformance", data);
  }

  GetScoresIndex(): Observable<any> {
    return this.httpClient.get(this.demoapi_url + "/Scores/GetScoresIndex/S&P 500");
  }

  GetSMIDUniverse(data: any): Observable<any> {
    return this.httpClient.post(this.demoapi_url + "/scores/GetSMIDUniverse", data);
  }

}
