import {AfterViewInit, Component, ViewChild,OnInit,HostListener,ElementRef, OnDestroy} from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { Subscription, first, interval, switchMap } from 'rxjs';
import { DataService } from '../../core/services/data/data.service';
import { descending, format, sum } from 'd3';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { IndexstepService } from '../../core/services/indexstep.service';
// @ts-ignore
import { saveAs } from "file-saver";
import { Workbook } from 'exceljs';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../core/services/moduleService/account.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { DatePipe } from '@angular/common';
Drilldown(Highcharts);
More(Highcharts);
declare var $: any;
export interface PeriodicElement {
  companyname: string;
  ticker: string;
  action: string;
  ordertype: string;
  price: string;
  quantity: string;
  value: string;
}

const emptyData: any = [];

@Component({
  selector: 'rebalanceStrategies',
  templateUrl: './rebalanceStrategies.html',
  styleUrl: './rebalanceStrategies.scss'
})

export class rebalanceStrategiesComponent implements AfterViewInit, OnInit, OnDestroy{

  displayedColumns: string[] = ['CompanyName', 'Ticker', 'Weight', 'Price', 'Quantity'];
  displayedTradeColumns: string[] = ['Company Name', 'Ticker', 'Action', 'Order Type', 'Price ($)', 'Quantity', 'Value'];
  selTab: any = 'trade';
  showMainTradeSection: boolean = false;
  taxOptFactSheet: boolean = false;
  taxOptFactSheetCal: boolean = false;
  checkverify_trade: boolean = false;
  currentAccountInfo: any;
  dataSource = new MatTableDataSource(emptyData);
  companydataSource = new MatTableDataSource(emptyData);
  prevCompanydataSource = new MatTableDataSource(emptyData);
  tradeCompanydataSource = new MatTableDataSource(emptyData);
  checktradeAll: boolean = false; // Trade strategy All
  currentAccList = [];
  rebalanceMsgkubData: any;
  tradeCashType: string = '';
  clickedListHeader: any;
  clickedListNames: any;
  showDownloadBtn: boolean = false;
  checkRebTradeData: boolean = false;
  tradeBuyClicked: boolean = false;  
  showSpinner_account: boolean = false;
  showSpinner_trade: boolean = false;
  showSpinner_factsheet: boolean = true;
  clearIntervalFactProgress: any;
  clearIntervalAccountProgress: any;
  trade_progress = "(0s)";
  factsheet_progress = "(0s)";
  reloadBtnSH: boolean = false;
  showTradeBtn: boolean = false;
  timeOutCount: number = 0;
  timerInterval: any;
  tradeListsortedName: any;
  companyListsortedName_C: any;
  companyListsortedName_P: any;
  companysortedData:any;
  tradeListsortedData: any;
  ctH: any;
  showTradetxt: string = '';
  bldMyIndexMntHPortfolioData: any = [];
  performanceETFRList: any = [];
  performanceUIndexList: any = [];
  selFSIndPerfData = [];
  C_AccountDetails: any;
  C_FullAccountDetails: any;
  transitionVal: number = 1;
  clickedList: any;
  indexName: string = "";
  perfName: string = "";
  asOfDate: any;
  accList_name: any;
  dMyIndexMnthlyHPtradePayload: any;
  subscriptions = new Subscription();
  constructor(private datepipe: DatePipe, private dialogref: MatDialogRef<rebalanceStrategiesComponent>, public dialog: MatDialog, public indexService: IndexstepService,
    private dataService: DataService, public dirIndexService: DirectIndexService, public cusIndexService: CustomIndexService,
    public sharedData: SharedDataService, private toastr: ToastrService, private logger: LoggerService,
    public accountService: AccountService,) { }
  @ViewChild(MatSort) sort: MatSort | any;
  @ViewChild('calendarYearReturns', { read: ElementRef }) public calendarYearReturns: ElementRef<any> | any;
  @ViewChild('taxGainLoss', { read: ElementRef }) public taxGainLoss: ElementRef<any> | any;
  @HostListener('scroll', ['$event'])
  ngAfterViewInit() { }

  ngOnInit() {
    var that = this;
    //var GetToolIcons = this.sharedData.openNotification.subscribe(res => {
    //  if (res == false) { that.closeModal(); }
    //}, error => { });
    //this.dataSource.sort = this.sort;
    //const sortState: Sort = {active: 'name', direction: 'desc'};
    //this.sort.active = sortState.active;
    //this.sort.direction = sortState.direction;
    //this.sort.sortChange.emit(sortState);
    try {
      this.currentAccList = this.sharedData.selTradeData.accountInfo;
      this.tradeCashType = this.sharedData.tradeCashType;
    if (!that.sharedData._immediateLiquidate) {
      if (this.sharedData.selTradeData.tradeType > 0) {
        this.checktradeAll = true;
        this.showMainTradeList('main')
        var notifyId = Object.assign({}, this.sharedData.selTradeData.accountInfo[0]);
        notifyId['accountId'] = 0;
        that.currentAccountInfo = notifyId;
      } else {
        this.showMainTradeList('acc1')
        this.checktradeAll = false;
        that.currentAccountInfo = this.sharedData.selTradeData.accountInfo[0];
      };
      that.clickedListHeader = that.currentAccountInfo;
      that.startloader();
      that.locktrade();
      this.loadeSelDataInfo();
      that.companydataSource = new MatTableDataSource(emptyData);
      that.tradeCompanydataSource = new MatTableDataSource(emptyData);
      if (this.sharedData.tradeCashType == "C" || this.sharedData.tradeCashType == "L") { this.getRebalanceCLMsgkub() }
      else { this.getRebalanceMsgkub(); }
      this.PostUpdateTradetime();
      this.checkTradingHours();
    } else {
      that.showMainTradeSection = false;
      that.startloader();
      that.locktrade();
      that.checkTradingHours();
      that.prevCompanydataSource = new MatTableDataSource(emptyData);
      that.companydataSource = new MatTableDataSource(emptyData);
      that.tradeCompanydataSource = new MatTableDataSource(emptyData);
      this.getRebalanceCLMsgkub();
      }
    } catch (e) { console.log(e) }
  }

  moveSteps(moveTab:any) { this.selTab = moveTab; };

  loadeSelDataInfo() {
    var that = this;
    this.performanceETFRList = [];
    that.bldMyIndexMntHPortfolioData = [];
    that.prevCompanydataSource = new MatTableDataSource(emptyData);
    that.GetStrategyAccount();
    that.GetAccountDataInd();
    that.loadAssData(that.currentAccountInfo, this.sharedData.selTradeData.type);
    if (that.currentAccountInfo['accountId'] != 0) { that.getPrevPortfolio(that.currentAccountInfo['accountId'], that.currentAccountInfo.id); }
    //that.indexStep();
    that.checkTradeListData();
  }

  loadAssData(data:any, type:any) {
    this.clickData(data, data, type);
    try {
      if (isNotNullOrUndefined(data['transitionno'])) { this.transitionVal = data['transitionno']; }
      else { this.transitionVal = 1; }
    } catch (e) { }
  }

  grp_TL_assetid: any;
  grp_TL_indexid: any;
  grp_TL_date: any;
  modifyDate_for: any = "";
  cusindexNameTicker: string = "";
  taxGainLossData: any = [];
  checkIndexTab: string = "";
  YTD: string='';
  clickData(datas:any, item:any, type:any) {
    var that = this;
    this.taxOptFactSheet = false;
    that.clickedList = datas;
    this.taxGainLossData = [];
    if (isNotNullOrUndefined(that.clickedList.Ticker) && that.clickedList.Ticker != "") {
      this.perfName = this.clickedList.Indexname;
      this.cusindexNameTicker = ' (' + this.clickedList.Ticker + ')';
      this.indexName = this.clickedList.shortname;
    } else {
      this.perfName = this.clickedList.Indexname;
      this.indexName = this.clickedList.shortname;
    }
    if (type == 'DI') { this.indexName = this.clickedList.name; }
    this.checkIndexTab = "";
    that.clickedListNames = item;
    that.modifyDate_for = new Date();
    var d = new Date();
    var assetid;
    var indexId = 123;
    var userid = datas.userid;
    var tenYrFlag = 1;
    var getETFIndex = [...this.sharedData.ETFIndex.value].filter(x => x.assetId == datas.assetId);

    if (type == 'DI') {
      this.checkIndexTab = 'DI';
      var fObj = this.dirIndexService._getBetaIndex_Direct.filter((du: any) => du.assetId == item.assetId);
      var selIndex = Object.assign({}, fObj[0]);
      tenYrFlag = selIndex['indexId'];
      d = new Date(selIndex['allocDate']);
      if (isNotNullOrUndefined(datas.AUserid)) { userid = datas.AUserid; } else { userid = datas.userid; }
      that.asOfDate = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      assetid = datas.assetId;
    } else if (getETFIndex.length > 0) {
      d = new Date(getETFIndex[0]['holdingsdate']);
      that.asOfDate = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      assetid = datas.assetId;
    } else {
      var index = this.cusIndexService._equityIndexeMasData.filter((x: any) => x.assetId == datas.assetId);
      if (index.length > 0) {
        assetid = index[0].assetId;
        indexId = index[0].indexId;
      }
    }
    var acc = that.currentAccountInfo['accountId'];
    this.accList_name = that.currentAccountInfo['accountNo'];
    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());    
    let actuserid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.grp_TL_assetid = assetid;
    this.grp_TL_indexid = indexId;
    this.grp_TL_date = date;
    var data = {
      "assetid": assetid,
      "userid": userid,
      "strategyId": datas.id,
      "enddate": date,
      "tenYrFlag": tenYrFlag,
      "indexId": indexId,
      "freqflag": that.currentAccountInfo['rebalanceType'],
      "actuserid": parseInt(actuserid),
      "accountid": acc,
    }
    this.dMyIndexMnthlyHPtradePayload = data;
    if (this.checkNavLiq()) { this.openClickedTradeAccount(data); };
  }

  GetETFStrData: any = [];
  GTtrade: any;
  GBMHPtrade: any;
  GPerETFRList: any;
  openClickedTradeAccount(data: any, refresh: boolean = false) {
    $('.refresh span').addClass('rotate');
    var that = this;
    //try {
    //  try { this.GTtrade.unsubscribe(); } catch (e) { }
    //  this.GTtrade = this.dataService.GetTaxharvesttrade(data).subscribe((res: any) => {
    //    if (this.sharedData.checkServiceError(res)) {
    //      $('#myCustomIndErrorModal_review').modal('show');
    //      this.logger.logError(res, 'GetTaxharvesttrade');
    //      that.closecommon_progress();
    //    } else {
    //      that.GetETFStrData = res;
    //      that.update_perfasofDate(res);
    //      if (res.length > 2) { this.taxOptFactSheet = true; }
    //      try {
    //        if (res.length == 0 || isNullOrUndefined(res[0]['annualPnlList'])) { that.taxGainLossData = []; }
    //        else {
    //          that.taxGainLossData = res[0]['annualPnlList'].map((a:any) => ({ ...a }))
    //            .sort(function (x:any, y:any) { return descending(x.year, y.year); });
    //        }
    //        that.formatPerfData(res);
    //        //this.ETFIndex(that.clickedList);
    //      } catch (e) { }
    //      that.closecommon_progress();
    //      try { this.GBMHPtrade.unsubscribe(); } catch (e) { }
    //      ////this.GBMHPtrade = this.dataService.GetBuildMyIndexMnthlyHPtrade(data).subscribe((res: any) => {
    //      ////  $('.refresh span').removeClass('rotate');
    //      ////  if (refresh) { that.toastr.success('Updated successfully', '', { timeOut: 4000 }); }
    //      ////  if (this.sharedData.checkServiceError(res)) {
    //      ////    $('#myCustomIndErrorModal_review').modal('show');
    //      ////    that.closecommon_progress();
    //      ////    this.logger.logError(res, 'GetBuildMyIndexMnthlyHPtrade');
    //      ////  } else {
    //      ////    that.bldMyIndexMntHPortfolioData = res;
    //      ////    var dta: any = res;
    //      ////    if (this.checkIndexTab == "DI" && this.sharedData.checkMenuPer(12, 187) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
    //      ////    else if (this.sharedData.checkMenuPer(3, 163) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
    //      ////    //var data:any = []
    //      ////    //dta.forEach((x) => {
    //      ////    //  var newObj = Object.assign({}, x);
    //      ////    //  if (isNotNullOrUndefined(x.Weight)) { newObj.Wt = x.Weight * 100; }
    //      ////    //  else { newObj.Wt = x.weight * 100; }
    //      ////    //  newObj['newSec'] = x.sector;
    //      ////    //  data.push(newObj)
    //      ////    //});
    //      ////    //data = data.map(a => ({ ...a }));
    //      ////    //that.sectorData = this.createSector([...data])
    //      ////    //setTimeout(function () {
    //      ////    //  that.barChart();
    //      ////      that.closecommon_progress();
    //      ////    //}.bind(this), 1000);
    //      ////  }
    //      ////}, (error: any) => {
    //      ////  this.logger.logError(error, 'GetBuildMyIndexMnthlyHPtrade');
    //      ////  that.toastr.info('Data not available', '', { timeOut: 5000 });
    //      ////  that.bldMyIndexMntHPortfolioData = [];
    //      ////  that.forceClosereviewind();
    //      ////});

    //      var data1 = {
    //        'strSector': [],
    //        'strStockkey': [],
    //        'assetid': this.grp_TL_assetid,
    //        'indexId': this.grp_TL_indexid,
    //        'range': 100,
    //        "strExStockkey": [],
    //        'tenYrFlag': 1,
    //        'enddate': this.grp_TL_date,
    //        "rating": '',
    //        "category": [],
    //        "taxflag": 'Y'
    //      };
    //      //try { this.GPerETFRList.unsubscribe(); } catch (e) { }
    //      //this.GPerETFRList = this.dataService.GetPerformanceETFRList(data1).pipe(first()).subscribe(GetPerformanceETFRList => {
    //      //  if (this.sharedData.checkServiceError(GetPerformanceETFRList)) {
    //      //    $('#myCustomIndErrorModal_review').modal('show');
    //      //    this.logger.logError(GetPerformanceETFRList, 'GetPerformanceETFRList');
    //      //    that.closecommon_progress();
    //      //  } else {
    //      //    var data: any = GetPerformanceETFRList;
    //      //    if (isNotNullOrUndefined(GetPerformanceETFRList)) {
    //      //      this.performanceETFRList = data;
    //      //      that.closecommon_progress();
    //      //    }
    //      //  }
    //      //}, error => {
    //      //  that.toastr.info('Data not available', '', { timeOut: 5000 });
    //      //  this.logger.logError(error, 'GetPerformanceETFRList');
    //      //  that.closecommon_progress();
    //      //});
    //    }
    //  }, (error: any) => {
    //    this.logger.logError(error, 'GetTaxharvesttrade');
    //    //$('#myCustomIndErrorModal_review').modal('show');
    //    that.forceClosereviewind();
    //    that.closecommon_progress();
    //  });
    //  this.subscriptions.add(this.GTtrade);
    //} catch (e) {
    //  that.toastr.info('Data not available', '', { timeOut: 5000 });
    //  that.GetETFStrData = [];
    //  that.forceClosereviewind();
    //}
  }

  perfData = { years: [], ETFind: {}, Uindex: {}, AUindex: {} };
  formatPerfData(Data:any) {
    var that = this;
    if (Data.length > 0) {
      var dta = Data[0]['etfPerformanceYears'];
      var dta1 = Data[1]['etfPerformanceYears'];
      var ETFind:any = {};
      var Uindex: any = {};
      var AUindex: any = {};
      var yr: any = [...new Set(dta.map((x: any) => x.year))].sort(function (x: any, y: any) { return descending(x, y); })
      this.perfData.years = yr;
      this.perfData.years.forEach(d => {
        var ETF = dta1.filter((x:any) => x.type == "ETF" && x.year == d);
        ETFind[d] = ETF[0]['yearReturns'];
        var Uind = dta.filter((x: any) => x.type == "Uindex" && x.year == d);
        Uindex[d] = Uind[0]['yearReturns'];
        if (that.taxOptFactSheet) {
          var Uind1 = Data[2]['etfPerformanceYears'].filter((x: any) => x.type == "Uindex" && x.year == d);
          AUindex[d] = Uind1[0]['yearReturns'];
        }
      });
      //console.log(this.perfData.years,'perfData.years')
      this.perfData.ETFind = ETFind;
      this.perfData.Uindex = Uindex;
      this.perfData.AUindex = AUindex;
    }
    else {
      this.perfData.years = [];
      this.perfData.ETFind = {};
      this.perfData.Uindex = {};
      this.perfData.AUindex = {};
    }
  }

  update_perfasofDate(d:any) {
    if (isNotNullOrUndefined(d) && d.length > 0) { this.asOfDate = d[0].date; } else { this.asOfDate = '-'; }
  }

  checkNavLiq() { if (this.sharedData.tradeCashType == "L") { return false } else { return true } };

  GetStrategyAccount() {
    var that = this;
    var sId = that.currentAccountInfo.id;
    var GetAccountDataInd1 = that.dataService.GetStrategyAccount(sId).pipe(first()).subscribe((data: any) => {
      if (that.sharedData.checkServiceError(data)) { } else {
        var filtData = data.filter((x:any) => x.accountId == that.currentAccountInfo.accountId);
        that.C_AccountDetails = filtData[0];
      }
    }, (error: any) => { });
    this.subscriptions.add(GetAccountDataInd1);
  }

  GetAccountDataInd() {
    var passAccId = this.currentAccountInfo.accountId;
    var GetAccountDataInd = this.dataService.GetAccountDataInd(passAccId).pipe(first()).subscribe((data: any) => {
      if (this.sharedData.checkServiceError(data)) { } else { this.C_FullAccountDetails = data[0]; }
    }, (error: any) => { });
    this.subscriptions.add(GetAccountDataInd);
  }


  indexRulesData: any = [];
  avoidLosersActive: boolean=false;
  factoractiveKey: string='';
  reviewIndextab: string='';
  indexRulesDataRange_W: any;
  indexRangemin_Tick: any;
  index_const_select: string = "-";
  index_const_weight: string = "-";
  index_const_tax: string = "-";
  index_const_calcu: number = 0;
  indexrulesCmpy: any = [];
  indexrulesGICS: any = [];
  factorsGrp: any = [];
  indexrulesCategory: any = [];
  ratingIndexnumber: any = 0;
  showReviewIndexLoaded: boolean = false;
  cuselindName: string = "";
  cuselindTicker: string = "";
  exclusionCompData: any = [];
  excludedData: any = [];
  factIndexStepGrp: any = [];
  indexStep() {
    var that = this;
    that.indexRulesData = [];
    that.index_const_select = '-';
    that.index_const_weight = '-';
    that.index_const_tax = '-';
    that.showReviewIndexLoaded = false;
    that.avoidLosersActive = false;
    that.factoractiveKey = '';
    that.reviewIndextab = "";
    that.cuselindName = "";
    that.cuselindTicker = "";
    var currentList = that.currentAccountInfo;
    that.cuselindName = currentList.Indexname;
    if (isNotNullOrUndefined(currentList.Ticker)) { that.cuselindTicker = ' (' + currentList.Ticker + ')'; }
    var notifyId;
    that.dataService.GetStrategyNotifyId(currentList.id, currentList.accountId).pipe(first()).subscribe((nID: any) => {
      notifyId = nID;
      if (notifyId.length > 0) {
        if (this.sharedData.selTradeData.type == "CI") {
          this.indexService.GetUserSteps(notifyId[0]['notifyId'], this.sharedData.selTradeData.type).then((res: any) => {
            that.indexRulesData = res['res'];
            that.exclusionCompData = [];
            that.excludedData = [];
            that.factIndexStepGrp = res['factIndexStepGrp'];
            that.factorsGrp = res['factIndexStepGrp'];
            that.index_const_calcu = res['res'][0]['removeCompCount'];
            that.loadIndexCons();
          });
        } else { this.DIuserSteps(currentList); }
      } else if (this.sharedData.selTradeData.type == "DI" && currentList.accountId == 0) { this.DIuserSteps(currentList); }
    });
  }

  DIuserSteps(currentList:any) {
    var that = this;
    this.indexService.GetUserSteps(currentList, this.sharedData.selTradeData.type).then((res:any) => {
      that.indexRulesData = res['res'];
      that.exclusionCompData = [];
      that.excludedData = [];
      that.factIndexStepGrp = res['factIndexStepGrp'];
      that.factorsGrp = res['factIndexStepGrp'];
      that.index_const_calcu = res['res'][0]['removeCompCount'];
      that.loadIndexCons();
    });
  }

  loadIndexCons() {
    var that = this;
    var w = 100 - this.indexRulesData[0].range + '%';
    that.indexRulesDataRange_W = 'calc(' + w + ' - 1.2rem)';
    that.indexrulesCmpy = that.indexRulesData[0].strStockkey;
    that.indexrulesGICS = that.indexRulesData[0].strSector;
    that.indexrulesCategory = that.indexRulesData[0].category;
    if (that.indexRulesData[0].weightBy.length > 0) { that.index_const_weight = that.indexRulesData[0].weightBy[0].Name; }
    if (that.indexRulesData[0].selectBy.length > 0) { that.index_const_select = that.indexRulesData[0].selectBy[0].Name; };
    if (that.indexRulesData[0].taxEffAwareness == 'Y') { that.index_const_tax = 'Yes'; }
    else if (that.indexRulesData[0].taxEffAwareness == 'N') { that.index_const_tax = 'No'; }
    else { that.index_const_tax = '-'; }
    this.ratingIndexnumber = that.getRatingSSRval(that.indexRulesData[0].rating);
  }

  getRatingSSRval(rating: any) {
    if (rating == undefined || rating == null || rating == 'NaN' || rating == "") { return 0; }
    else if (rating == "A+") { return 100; }
    else if (rating == "A") { return 90.97222; }
    else if (rating == "A-") { return 81.94444; }
    else if (rating == "B+") { return 72.91667; }
    else if (rating == "B") { return 63.88889; }
    else if (rating == "B-") { return 54.86111; }
    else if (rating == "C+") { return 45.83333; }
    else if (rating == "C") { return 36.80556; }
    else if (rating == "C-") { return 27.77778; }
    else if (rating == "D+") { return 18.75; }
    else if (rating == "D") { return 9.722222; }
    else if (rating == "D-") { return 0.694444; }
    else { return 0 }
  }

  startloader() {
    var that = this;
    clearInterval(that.clearIntervalFactProgress);
    that.factsheet_progress = "(0s)";
    that.showSpinner_factsheet = true;
    that.factsheetProgress();
  }

  locktrade() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.sharedData.selTradeData.accountInfo.forEach((d:any) => {
      var AccId = d.accountId;
      var slid = d['id'];
      var data = { "accountId": AccId, "userid": userid, "slid": slid, "status": "Y" };
      this.dataService.PostLockAcc(data).pipe(first()).subscribe((res: any[]) => { });
    });
  }

  factsheetProgress() {
    var that = this;
    var min = 0;
    var sec = 0;
    var seconds = "";
    $('#factsheet_loaderT .div_n_load').text('Implementing filtering and selection');
    that.clearIntervalFactProgress = setInterval(function () {
      var a = new Date();
      if (min == 0) {
        $('#factsheet_loaderT .div_n_load').text('Implementing filtering and selection');
      }
      else if (min > 0) {
        $('#factsheet_loaderT .div_n_load').text('Executing historical rebalances');
      }
      else if (min > 1) {
        $('#factsheet_loaderT .div_n_load').text('Back-testing historical values');
      } else if (min > 2) {
        $('#factsheet_loaderT .div_n_load').text('Producing portfolio characteristics');
      } else if (min > 3) {
        $('#factsheet_loaderT .div_n_load').text('Finalizing composition and performance metrics');
      }
      if (!that.showSpinner_factsheet) {
        that.factsheet_progress = "(0s)";
        clearInterval(that.clearIntervalFactProgress);
      }
      if (min > 0) {
        seconds = min + "m" + " " + sec + "s";
      } else {
        seconds = sec + "s";
      }
      that.factsheet_progress = "(" + seconds + ")";
      sec++;
      if (sec == 60) {
        min++;
        sec = 0;
      }
    }, 1000);
  }

  getRebalanceCLMsgkub() {
    var that = this;
    var dt = this.sharedData.selTradeData.accountInfo;
    var directLiquidate = that.sharedData._selectedAccountCompanyList;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (!that.sharedData._immediateLiquidate) {
      var rebalanceData:any = [];
      dt.forEach((d:any) => {
        rebalanceData.push({
          "routeflag": that.sharedData.selTradeData.routeflag,
          "dontSellflag": (that.sharedData.selTradeData.dontSellflag) ? 'Y' : 'N',
          "accountId": d['accountId'],
          "strategyId": d['id'],
          "flag": that.sharedData.tradeCashType
        });
      });
      var datas:any = { "userid": parseInt(userid), "rebalanceData": rebalanceData[0] };
      var reb = this.dataService.RebalanceCLMsgkub(datas).pipe(first()).subscribe((data: any) => {
        this.rebalanceMsgkubData = data;
        if (this.sharedData.checkServiceError(data) || JSON.stringify(data).indexOf("Error converting value") > -1) {
          that.showSpinner_account = false;
          this.logger.logError(data, 'RebalanceMsgkub');
          that.forceClosereviewind();
          that.companydataSource = new MatTableDataSource(emptyData);
          that.tradeCompanydataSource = new MatTableDataSource(emptyData);
          this.showDownloadBtn = false;
        } else {
          that.checkTradeListData();
          that.showSpinner_account = false;
          that.closecommon_progress();
          that.showDownladBtn();
        }
        this.timer();
      }, (error: any) => {
        this.showDownloadBtn = false;
        that.companydataSource = new MatTableDataSource(emptyData);
        that.tradeCompanydataSource = new MatTableDataSource(emptyData);
        that.showSpinner_account = false;
        that.forceClosereviewind();
        this.logger.logError(error, 'RebalanceMsgkub');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
      });
      this.subscriptions.add(reb);
    } else {
      var rebalanceData:any = [];
      rebalanceData.push({
        "routeflag": that.sharedData.selTradeData.routeflag,
        "dontSellflag": 'N',
        "accountId": directLiquidate['accID'],
        "strategyId": 0,
        "flag": that.sharedData.tradeCashType
      });
      var Bdata:any = { "userid": parseInt(userid), "rebalanceData": rebalanceData[0] };
      var reb = this.dataService.RebalanceCLMsgkub(Bdata).pipe(first()).subscribe((data: any) => {
        this.rebalanceMsgkubData = data;
        if (this.sharedData.checkServiceError(data) || JSON.stringify(data).indexOf("Error converting value") > -1 || JSON.stringify(data).indexOf("not Valid") > -1 || JSON.stringify(data[0]).indexOf("not Valid") > -1) {
          that.showSpinner_account = false;
          that.forceClosereviewind();
          that.companydataSource = new MatTableDataSource(emptyData);
          that.tradeCompanydataSource = new MatTableDataSource(emptyData);
          this.showDownloadBtn = false;
          this.logger.logError(data, 'RebalanceMsgkub');
        } else {
          that.checkTradeListData();
          that.showSpinner_account = false;
          that.closecommon_progress();
          that.showDownladBtn();
        }
        this.timer();
      }, (error:any) => {
        this.showDownloadBtn = false;
        that.companydataSource = new MatTableDataSource(emptyData);
        that.tradeCompanydataSource = new MatTableDataSource(emptyData);
        that.showSpinner_account = false;
        that.forceClosereviewind();
        this.logger.logError(error, 'RebalanceMsgkub');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
      });
      this.subscriptions.add(reb);
    }
  }
 
  timer() {
    var that = this;
    let seconds: number = 30;
    this.timerInterval = setInterval(() => {
      seconds--;
      that.timeOutCount = seconds;
      if (!that.showTradeBtn) {
        that.timeOutCount = 1;
        that.reloadBtnSH = false;
      } else if (seconds == 0) {
        that.reloadBtnSH = true;
        clearInterval(that.timerInterval);
        if (this.sharedData.tradeCashType == "C" || this.sharedData.tradeCashType == "L") {
          this.getRebalanceCLMsgkub();
        }
        else { that.reviewTrade(); }
        if (this.sharedData.selTradeData.tradeType == 0) {
          var du = this.sharedData.selTradeData.accountInfo[0];
          this.getPrevPortfolio(du['accountId'], du.id);
        } else {
          if (isNotNullOrUndefined(this.currentAccountInfo) && isNotNullOrUndefined(this.currentAccountInfo['accountId']) && this.currentAccountInfo['accountId'] > 0) {
            this.getPrevPortfolio(this.currentAccountInfo['accountId'], this.currentAccountInfo.id);
          }
        }
      }
    }, 1000);
    if (isNotNullOrUndefined(that.tradeCompanydataSource.data) && that.tradeCompanydataSource.data.length == 0) {
      that.timeOutCount = 0;
      that.reloadBtnSH = false;
      clearInterval(that.timerInterval);
    }
  }

  reviewTrade() { this.GetRefreshTradesAlloc(); };

  getPrevPortfolio(acc:any, slId:any) {
    var that = this;
    that.prevCompanydataSource = new MatTableDataSource(emptyData);
    var GetTradeAccountPortfolio = that.dataService.GetTradeAccountPortfolio(acc, slId).pipe(first()).subscribe((res:any) => {
      if (this.sharedData.checkServiceError(res)) {
        that.prevCompanydataSource = new MatTableDataSource(emptyData);
        that.showSpinner_account = false;
        this.logger.logError(res, 'GetTradeAccountPortfolio');
      } else {
        var tabdata: any = res;
        that.prevCompanydataSource = new MatTableDataSource(tabdata);
        that.showSpinner_account = false;
        if (isNullOrUndefined(that.companyListsortedName_P)) {
          var sort: any = { "active": "Ticker", "direction": "asc" };
          this.prevCompanysortChange(sort);
        } else {
          this.prevCompanysortChange(that.companyListsortedName_P);
        }
      }
    }, (error: any) => {
      that.prevCompanydataSource = new MatTableDataSource(emptyData);
      that.showSpinner_account = false;
      this.logger.logError(error, 'GetTradeAccountPortfolio');
    });
    this.subscriptions.add(GetTradeAccountPortfolio);
  }

  getRebalanceMsgkub() {
    var that = this;
    that.checkRebTradeData = false;
    var dt = this.sharedData.selTradeData.accountInfo;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (dt.length > 0) {
      var rebalanceData:any = [];
      dt.forEach((d:any) => { rebalanceData.push({ "accountId": d['accountId'], "strategyId": d['id'] }); });
      var datas = { "userid": parseInt(userid), "rebalanceData": rebalanceData };
      var reb = this.dataService.RebalanceMsgkub(datas).pipe(first()).subscribe(data => {
        this.rebalanceMsgkubData = data;
        if (this.sharedData.checkServiceError(data) || JSON.stringify(data).indexOf("Error converting value") > -1) {
          that.showSpinner_account = false;
          this.logger.logError(data, 'RebalanceMsgkub');
          that.forceClosereviewind();
          that.companydataSource = new MatTableDataSource(emptyData);
          that.tradeCompanydataSource = new MatTableDataSource(emptyData);
          this.showDownloadBtn = false;
        } else {
          that.checkTradeListData();
          //that.showSpinner_account = false;
          that.checkRebTradeData = true;
          that.closecommon_progress();
          that.showDownladBtn();
        }
        this.timer();
      }, error => {
        this.showDownloadBtn = false;
        that.checkRebTradeData = false;
        that.companydataSource = new MatTableDataSource(emptyData);
        that.tradeCompanydataSource = new MatTableDataSource(emptyData);
        that.showSpinner_account = false;
        that.forceClosereviewind();
        this.logger.logError(error, 'RebalanceMsgkub');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
      });
      this.subscriptions.add(reb);
    }
  }

  GetRefreshTradesAlloc() {
    var that = this;
    var dt = this.sharedData.selTradeData.accountInfo;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (dt.length > 0) {
      var rebalanceData:any = [];
      dt.forEach((d:any) => { rebalanceData.push({ "accountId": d['accountId'], "strategyId": d['id'] }); });
      var datas = { "userid": parseInt(userid), "rebalanceData": rebalanceData };
      var reb = this.dataService.GetRefreshTradesAlloc(datas).pipe(first()).subscribe((data:any) => {
        this.rebalanceMsgkubData = data;
        if (this.sharedData.checkServiceError(data) || JSON.stringify(data).indexOf("Error converting value") > -1) {
          that.showSpinner_account = false;
          this.logger.logError(data, 'RebalanceMsgkub');
          that.forceClosereviewind();
          that.companydataSource = new MatTableDataSource(emptyData);
          that.tradeCompanydataSource = new MatTableDataSource(emptyData);
          this.showDownloadBtn = false;
        } else {
          that.checkTradeListData();
          //that.showSpinner_account = false;
          that.closecommon_progress();
          that.showDownladBtn();
        }
        this.timer();
      }, (error: any) => {
        this.showDownloadBtn = false;
        that.companydataSource = new MatTableDataSource(emptyData);
        that.tradeCompanydataSource = new MatTableDataSource(emptyData);
        that.showSpinner_account = false;
        that.forceClosereviewind();
        this.logger.logError(error, 'RebalanceMsgkub');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
      });
      this.subscriptions.add(reb);
    }
  }

  checkTradeListData() {
    var that = this;
    that.companydataSource = new MatTableDataSource(emptyData);
    that.tradeCompanydataSource = new MatTableDataSource(emptyData);
    var currentAccountInfo_Liq = this.currentAccList[0];
    try {
      if (isNotNullOrUndefined(this.rebalanceMsgkubData) && isNotNullOrUndefined(this.rebalanceMsgkubData[0]['trades'])) {
        var tabdata_tradeList = this.rebalanceMsgkubData[0]['trades'];
        if (!that.sharedData._immediateLiquidate) {
          if (tabdata_tradeList.length > 0 && this.currentAccountInfo['accountId'] != 0 && isNotNullOrUndefined(tabdata_tradeList[0]['accountNo'])) {
            tabdata_tradeList = this.rebalanceMsgkubData[0]['allocation'].filter((xu:any) => xu['accountNo'] == this.currentAccountInfo['accountNo']);
            if (this.sharedData.selTradeData.accountInfo.length == 1) { tabdata_tradeList = this.rebalanceMsgkubData[0]['trades'] };
          }
        }
        else {
          if (tabdata_tradeList.length > 0 && currentAccountInfo_Liq['accountId'] != 0 && isNotNullOrUndefined(tabdata_tradeList[0]['accountNo'])) {
            tabdata_tradeList = this.rebalanceMsgkubData[0]['allocation'].filter((xu: any) => xu['accountNo'] == currentAccountInfo_Liq['accountVan']);
            if (this.sharedData.selTradeData.accountInfo.length == 1) { tabdata_tradeList = this.rebalanceMsgkubData[0]['trades'] };
          }
        }
        that.tradeCompanydataSource = new MatTableDataSource(tabdata_tradeList);
        //// Trade list is empty close loader
        if (tabdata_tradeList.length > 0) {
          that.checkRebTradeData = false;
        } else {
          that.checkRebTradeData = true;
        }
        //that.showSpinner_account = false;
        that.closecommon_progress();
        //// Trade list is empty close loader
        if (isNullOrUndefined(that.tradeListsortedName)) {
          var sort: any = { "active": "Ticker", "direction": "asc" };
          this.tradeListsortChange(sort);
        } else {
          this.tradeListsortChange(that.tradeListsortedName);
        }
      }

      if (isNotNullOrUndefined(this.rebalanceMsgkubData) && isNotNullOrUndefined(this.rebalanceMsgkubData[0]['holdings'])) {
        var tabdata: any = this.rebalanceMsgkubData[0]['holdings'];
        var holdData = tabdata;
        if (!that.sharedData._immediateLiquidate) {
          if (tabdata.length > 0 && this.currentAccountInfo['accountId'] != 0 && isNotNullOrUndefined(tabdata[0]['accountNo'])) {
            holdData = tabdata.filter((xu: any) => xu['accountNo'] == this.currentAccountInfo['accountNo']);
          }
        }
        else {
          if (tabdata.length > 0 && currentAccountInfo_Liq['accountId'] != 0 && isNotNullOrUndefined(tabdata[0]['accountNo'])) {
            holdData = tabdata.filter((xu: any) => xu['accountNo'] == currentAccountInfo_Liq['accountVan']);
          }
          that.getPrevPortfolio(currentAccountInfo_Liq['accountId'], 0);
        }


        that.companydataSource = new MatTableDataSource(holdData);
        if (isNullOrUndefined(that.companyListsortedName_C)) {
          var sort: any = { "active": "Ticker", "direction": "asc" };
          this.companysortChange(sort);
        } else {
          this.companysortChange(that.companyListsortedName_C);
        }
      }
    } catch (e) { }
  }

  tradeListsortChange(sort: Sort) {
    const data = this.tradeCompanydataSource.data.slice();
    this.tradeListsortedName = sort;
    if (!sort.active || sort.direction == '') {
      this.tradeListsortedData = data;
      return;
    }
    this.tradeListsortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Company Name': { return this.compare(a.companyName, b.companyName, isAsc); }
        case 'Ticker': { return this.compare(a.ticker, b.ticker, isAsc); }
        case 'Action': return this.compare(a.buyOrSell, b.buyOrSell, isAsc);
        case 'Price ($)': return this.compare(+a.price, +b.price, isAsc);
        case 'Quantity': return this.compare(+a.noofShares, +b.noofShares, isAsc);
        default: return 0;
      }
    });
    this.tradeCompanydataSource.data = this.tradeListsortedData;
  }

  companysortChange(sort: Sort) {
    const data = this.companydataSource.data.slice();
    this.companyListsortedName_C = sort;
    if (!sort.active || sort.direction == '') {
      this.companysortedData = data;
      return;
    }
    this.companysortedData = data.sort((a: any, b: any) => {

      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'CompanyName': { return this.compare(a.companyName, b.companyName, isAsc); }
        case 'Ticker': return this.compare(a.ticker, b.ticker, isAsc);
        case 'Weight': return this.compare(+a.weight, +b.weight, isAsc);
        case 'Price': return this.compare(+a.price, +b.price, isAsc);
        case 'Quantity': return this.compare(+a.noofShares, +b.noofShares, isAsc);
        default: return 0;
      }
    });
    this.companydataSource.data = this.companysortedData;
  }

  prevCompanysortChange(sort: Sort) {
    const data = this.prevCompanydataSource.data.slice();
    this.companyListsortedName_P = sort;
    if (!sort.active || sort.direction == '') {
      this.companysortedData = data;
      return;
    }
    this.companysortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'CompanyName': { return this.compare(a.companyName, b.companyName, isAsc); }
        case 'Ticker': return this.compare(a.ticker, b.ticker, isAsc);
        case 'Weight': return this.compare(+a.weight, +b.weight, isAsc);
        case 'Price': return this.compare(+a.price, +b.price, isAsc);
        case 'Quantity': return this.compare(+a.noofShares, +b.noofShares, isAsc);
        default: return 0;
      }
    });
    this.prevCompanydataSource.data = this.companysortedData;
  }

  compare(a:any, b:any, isAsc:any) { return (a < b ? -1 : 1) * (isAsc ? 1 : -1); };

  closecommon_progress() {
    var that = this;
    if (!that.checkShowMatTableTradeList(that.tradeCompanydataSource) && that.checkRebTradeData) {
      that.forceClosereviewind();
    }
    if (that.checkShowMatTableTradeList(that.tradeCompanydataSource)) {
      clearInterval(that.clearIntervalFactProgress);
      that.factsheet_progress = "(0s)";
      that.showSpinner_factsheet = false;
      //try {
      //  $(".table-fixed-column-inner").on('scroll', function () {
      //    var val = $(this).scrollLeft();
      //    if ($(this).scrollLeft() + $(this).innerWidth() >= ($(this)[0].scrollWidth) - 1) {
      //      $("#TradetableNavBuy .nav-next").addClass("scrollBtn");
      //    } else {
      //      $("#TradetableNavBuy .nav-next").removeClass("scrollBtn");
      //    }
      //    if (val == 0) {
      //      $("#TradetableNavBuy .nav-prev").addClass("scrollBtn");
      //    } else {
      //      $("#TradetableNavBuy .nav-prev").removeClass("scrollBtn");
      //    }
      //  });
      //  $(".table-fixed-column-inner-taxgain").on('scroll', function () {
      //    var val = $(this).scrollLeft();
      //    if ($(this).scrollLeft() + $(this).innerWidth() >= ($(this)[0].scrollWidth) - 1) {
      //      $("#TradetableNavBuy2 .nav-next").addClass("scrollBtn");
      //    } else {
      //      $("#TradetableNavBuy2 .nav-next").removeClass("scrollBtn");
      //    }
      //    if (val == 0) {
      //      $("#TradetableNavBuy2 .nav-prev").addClass("scrollBtn");
      //    } else {
      //      $("#TradetableNavBuy2 .nav-prev").removeClass("scrollBtn");
      //    }
      //  });
      //} catch (e) { }
    }
    setTimeout(function () { that.showSpinner_trade = false; }, 100);
  }

  checkShowMatTableTradeList(tabData:any) {
    if (isNotNullOrUndefined(tabData.data) && tabData['data'].length > 0) { return true } else { return false }
  }

  showDownladBtn() {
    if (isNotNullOrUndefined(this.companydataSource.data) && this.companydataSource.data.length > 0) {
      this.showDownloadBtn = true;
    } else { this.showDownloadBtn = false; }
  }

  forceClosereviewind() {
    var that = this;
    clearInterval(that.clearIntervalFactProgress);
    that.factsheet_progress = "(0s)";
    that.showSpinner_factsheet = false;
    setTimeout(function () { that.showSpinner_trade = false; }, 100);
  }

  onScroll(event: Event,params:any) {
    var target = event.target as HTMLDivElement;
    const scrollableElement = this.calendarYearReturns.nativeElement;
    const isAtEnd = scrollableElement.scrollLeft + scrollableElement.offsetWidth >= scrollableElement.scrollWidth;
    if (isAtEnd) {
        const element = document.getElementById('calRightArrow');
      if (element) {
        element.classList.add('scrollBtn');
      }
    } else {
      const element = document.getElementById('calRightArrow');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
    if (target.scrollLeft == 0){
      const element = document.getElementById('calLeftArrow');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else{
      const element = document.getElementById('calLeftArrow');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }

  }
  onScrolltaxGainLoss(event: Event,params:any) {
    var target = event.target as HTMLDivElement;
    const scrollableElement = this.taxGainLoss.nativeElement;
    const isAtEnd = scrollableElement.scrollLeft + scrollableElement.offsetWidth >= scrollableElement.scrollWidth;
    if (isAtEnd) {
        const element = document.getElementById('taxRightArrow');
      if (element) {
        element.classList.add('scrollBtn');
      }
    } else {
      const element = document.getElementById('taxRightArrow');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
    if (target.scrollLeft == 0){
      const element = document.getElementById('taxLeftArrow');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else{
      const element = document.getElementById('taxLeftArrow');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }

  }
  scrollRight(data:any){   
    if (data == 'calendarYearReturnsRight') {
      this.calendarYearReturns.nativeElement.scrollTo({ left: (this.calendarYearReturns.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    } else {
      this.taxGainLoss.nativeElement.scrollTo({ left: (this.taxGainLoss.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }   
  }
  
   scrollLeft(data:any): void {
    if(data == 'calendarYearReturnsLeft'){
      this.calendarYearReturns.nativeElement.scrollTo({ left: (this.calendarYearReturns.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
    else{
      this.taxGainLoss.nativeElement.scrollTo({ left: (this.taxGainLoss.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
 
  }

  closeModal() { this.dialogref.close(); };

  
  checkActiveAcc(d:any) {
    if (this.currentAccList.length > 0 && d['accountId'] == this.currentAccountInfo['accountId']) { return true } else { return false; }
  }

  showMainTradeList(type:any){
    var that = this;
    if (type == "main") { that.showMainTradeSection = true; }
    else { that.showMainTradeSection = false; }
  }

  PostUpdateTradetimeSub: any;
  PostUpdateTradetime() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    let slid = this.currentAccountInfo['id'];
    var dt = this.sharedData.selTradeData.accountInfo;
    var data:any = [];
    dt.forEach((d:any) => { data.push({ "accountId": d['accountId'], "slid": slid, "userid": userid }); });
    try { this.PostUpdateTradetimeSub.unsubscribe(); } catch (e) { };
    this.PostUpdateTradetimeSub = interval(5000).pipe(switchMap(() => this.dataService.PostUpdateTradetimePopup(data)))
      .subscribe((dt: any) => { }, error => {
        this.logger.logError(error, 'PostUpdateTradetimePopup');
      });
  }
 
  checkTradingHours() {
    var that = this;
    this.ctH = setInterval(function () {
      that.sharedData.checkTradingHour().then((data: any) => {
        if (data.length > 0 && isNotNullOrUndefined(data[0]['allowTrading']) && data[0]['allowTrading'] == 'Y') {
          that.showTradeBtn = true;
          that.showTradetxt = '';
        } else {
          that.showTradeBtn = false;
          if (data.length > 0 && isNotNullOrUndefined(data[0]['errorMessage'])) { that.showTradetxt = data[0]['errorMessage']; }
        }
      });
    }, 2000);
  }


  ngOnDestroy() {
    var that = this;
    that.sharedData.selTradeData.dontSellflag = false;
    this.sharedData.tradeCashType = '';
    try { this.PostUpdateTradetimeSub.unsubscribe(); } catch (e) { }
    try {
      clearInterval(that.timerInterval);
      clearInterval(that.ctH);
      //this.sharedData.openFactsheet_TradeNow.next(false);
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      this.sharedData.selTradeData.accountInfo.forEach((d:any) => {
        var AccId = d.accountId;
        var slid = d['id'];
        var data = { "accountId": AccId, "userid": userid, "slid": slid, "status": "N" };
        that.dataService.PostLockAcc(data).pipe(first()).subscribe((res: any[]) => { });
      });
    } catch (e) { }
    that.tradeListsortedName = undefined;
    that.companyListsortedName_C = undefined;
    that.companyListsortedName_P = undefined;
    this.sharedData.getNotificationDataReload();
    this.subscriptions.unsubscribe();
    that.timeOutCount = 0;
    this.sharedData.selTradeData.tradeType = 0;
    this.sharedData.immediateLiquidate.next(false);
    this.sharedData.showMatLoader.next(false);
  }

  PostCompData: any = [];
  tradeBuy() {
    $('#showMatLoaderTrades').show();
    this.tradeBuyClicked = true;
    clearInterval(this.timerInterval);
    try {
      var strId = 0;
      if (isNotNullOrUndefined(this.currentAccountInfo.id)) { strId = this.currentAccountInfo.id }
      else { strId = this.sharedData.selTradeData.accountInfo[0]['accountId']; }
      var tp = 'Buy strId' + strId;
      this.sharedData.userEventTrack('Trade', tp, tp, 'Buy Click');
    } catch (e) { }

    var dt = this.sharedData.selTradeData.accountInfo;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (dt.length > 0) {
      var rebalanceData:any = [];
      dt.forEach((d:any) => { rebalanceData.push({ "accountId": d['accountId'], "strategyId": d['id'] }); });
      var data = { "userid": parseInt(userid), "rebalanceData": rebalanceData };
      this.PostCompData = [];
      var PostCompanies = this.dataService.PostCompanies(data).pipe(first()).subscribe((data:any) => {
        if (this.sharedData.checkServiceError(data)) {
          this.toastr.success('Trading not initiated. Please try again.', '', { timeOut: 4000 });
        } else {
          if (data.length > 1) { this.PostCompData = data[1]; }
          this.ProcessConsolidatedTrade();
          if (data.length > 0) { this.toastr.success(data[0], '', { timeOut: 6000 }); }
        }
      }, (error:any) => {
        this.logger.logError(error, 'PostCompanies');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
        this.toastr.success('Trading not initiated. Please try again.', '', { timeOut: 4000 });
      });
      this.subscriptions.add(PostCompanies);
    }
  }

  ProcessConsolidatedTrade() {
    this.PostStgyNotifyAccs();
    var trades = [];
    var allocData = [];
    if (this.PostCompData.length > 0) {
      trades = this.PostCompData[0]['trades'];
      allocData = this.PostCompData[0]['allocation'];
    }
    var fileName: string = "";
    if (isNotNullOrUndefined(this.clickedList) && isNotNullOrUndefined(this.clickedList.name)) {
      fileName = this.clickedList.name.replaceAll(' ', '_');
      if (this.sharedData.selTradeData.accountInfo.length == 1) { fileName = fileName + "_" + this.sharedData.selTradeData.accountInfo[0]['accountNo']; }
    } else { fileName = this.sharedData.selTradeData.accountInfo[0]['accountVan']; };
    this.sharedData.tradeBuyDownload(fileName, trades, allocData);
    this.closeModal();
  }

  PostStgyNotifyAccs() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var dt = this.sharedData.selTradeData.accountInfo;
    if (dt.length > 0) {
      var data:any = [];
      dt.forEach((d:any) => { data.push({ "accountId": d['accountId'], "slid": d['id'], "userid": parseInt(userid) }); });
      if (dt.length == 1 && dt[0]['id'] == 0) { this.checkAccReload(data); } else {
        this.dataService.PostStgyNotifyAccs(data).pipe(first()).subscribe((resp:any) => { this.checkAccReload(data); },
          (error: any) => { this.checkAccReload(data); });
      }
    }
  }

  checkAccReload(data: any) {
    this.dirIndexService.GetStrListDashAccs();
    this.sharedData.getTradeNotificationDataReload();
    this.sharedData.refreshAlreadytradedStrategy.next(true);
    if (data.length == 1) { this.accountService.getAccountDt(data[0]['accountId']); }
    else { this.accountService.getAccountDt(0); }
    //if (this.tradeCashType == "C" || this.tradeCashType == "L") { this.sharedData.triAccTrade.next(true); }
  }

  checkShowMatTable(tabData:any) {
    if (isNotNullOrUndefined(tabData.data) && tabData['data'].length > 0) { return true } else { return false }
  }

  folioSelTab: string = 'current';
  checkMarketVal() {
    var val: number = 0;
    if (this.folioSelTab == 'current') {
      if (isNotNullOrUndefined(this.companydataSource.data)) {
        val = sum(this.companydataSource.data.map(function (d: any) { return (d.price * d.noofShares); }));
      } else { val = 0; };
    } else {
      if (isNotNullOrUndefined(this.prevCompanydataSource.data)) {
        val = sum(this.prevCompanydataSource.data.map(function (d: any) { return (d.price * d.noofShares); }));
      } else { val = 0; };
    }
    return val;
  }

  checkCount() {
    var val: number = 0;
    if (this.folioSelTab == 'current') { val = this.dataCheck(this.companydataSource); }
    else { val = this.dataCheck(this.prevCompanydataSource); };
    return val;
  }

  dataCheck(value: any) { if (isNotNullOrUndefined(value.data)) { return value.data.length; } else { return 0; }; };

  downloadView() {
    if (this.sharedData._immediateLiquidate) {
      if (this.checkShowMatTable(this.prevCompanydataSource) || this.checkShowMatTable(this.companydataSource)) {
        this.sharedData.tradeViewDownload1('trade', this.currentAccList, this.currentAccList[0]['accountVan'], this.companydataSource.data, this.prevCompanydataSource.data, 'xlsx');
      }
    } else {
      if (this.checkShowMatTable(this.prevCompanydataSource) || this.checkShowMatTable(this.companydataSource)) {
       this.sharedData.tradeViewDownload1('trade', this.clickedList, this.clickedList.name, this.companydataSource.data, this.prevCompanydataSource.data, 'xlsx');
      }
    }
    try {
      var tp = 'Trade strId' + this.currentAccountInfo.id;
      var accId = 'Clicked account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Trade', "Holding Download click", tp, accId);
    } catch (e) { }
  }

  checkSHaccInfo() {
    if (isNotNullOrUndefined(this.currentAccountInfo) &&
      isNotNullOrUndefined(this.currentAccountInfo['accountId']) &&
      this.currentAccountInfo['accountId'] > 0) { return true } else { return false }
  }


  loadAccDt(d: any) {
   
    if (d.accountId == 0) {
      var notifyId = Object.assign({}, this.sharedData.selTradeData.accountInfo[0]);
      notifyId['accountId'] = 0;
      this.currentAccountInfo = notifyId;
    } else { this.currentAccountInfo = d; }
    try {
      var tp = 'Trade strId' + this.currentAccountInfo.id;
      var accId = 'Clicked account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Trade', "Account click", tp, accId);
    } catch (e) { }
    this.showSpinner_account = true;
    this.loadeSelDataInfo();
  }

  tradeTrack(tab: string) {
    var strId = this.currentAccountInfo.id;
    try {
      var tp = 'Tab strId' + strId;
      this.sharedData.userEventTrack('Trade', "tab click", tp, tab);
    } catch (e) { }
  }

  tradeDownloadList() {
    var that = this;
    var resData = this.tradeCompanydataSource.data;
    var dte = this.clickedList;
    var flName: string = "";
    let new_workbook = new Workbook();
    var ws: any;
    if (this.sharedData._immediateLiquidate) {
      flName = this.currentAccList[0]['accountVan'];
      flName = flName.replace(" ", "_");
      ws = new_workbook.addWorksheet(flName);
    } else {
      flName = this.clickedList.name.replace(" ", "_");
      ws = new_workbook.addWorksheet(flName);
      var name1 = dte['name'] + " (" + dte['shortname'] + ")";
      var date1 = this.sharedData.dateFormate(dte['acccreateddate']);
      if (isNotNullOrUndefined(dte['accmodifieddate'])) { date1 = this.sharedData.dateFormate(dte['accmodifieddate']); }
      ws.addRow(['Name', name1]);
      ws.addRow(['Based On', dte['Indexname']]);
      ws.addRow(['Created date', (date1)]);
      ws.addRow([]);
    }

    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, item.buyOrSell, that.sharedData.numberWithCommas(item.price), that.sharedData.numberWithCommas(item.noofShares), that.sharedData.numberWithCommas(parseFloat(item.value).toFixed(2))]); });

    var header = ws.addRow(['Company Name', 'Ticker', 'Action', 'Price ($)', 'Quantity', 'Value ($)'])
    header.font = { bold: true };
    tabBody.forEach((d:any) => { ws.addRow(d) });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }
    //Disclosures 1
    if (that.sharedData.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.sharedData.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosure II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du:any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_Trade_List_" + this.datepipe.transform(d, 'yyyyMMdd') + '_' + this.datepipe.transform(d, 'hhmmss');
    new_workbook.xlsx.writeBuffer().then((data:any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
    try {
      var tp = 'Trade strId' + this.currentAccountInfo.id;
      var accId = 'Clicked account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Trade', "Trade List Download Click", tp, accId);
    } catch (e) { }
  }

  netValue(data:any, key:any) {
    var buy, sell;
    buy = sum(data, function (d: any) { if (d.buyOrSell == 'Buy') { return d[key]; } });
    sell = sum(data, function (d: any) { if (d.buyOrSell == 'Sell') { return d[key]; } });
    return this.checkValPrice(buy - sell);
  }

  checkValPrice(val: any) { if (isNullOrUndefined(val)) { return "-" } else { return format("$,.2f")(val); } };
  TradeListTrackBy: any = (_index: number, item: any) => { return item.stockkey; };
  checkTL_ValueColor(val: any) { if (val.buyOrSell == 'Buy') { return true; } else { return false; } }
  functionPercentage(x: any) { if (x.toFixed(0) != 98) { return false; } else { return true; }; }
  function(x:any) { if (x.toFixed(0) != 98) { return true; } else { return false; } }
  convert2digits(val:any, id:any) {
    if (isNullOrUndefined(val)) { return 0; } else {
      if (id == 17) { return this.billionconverter(val); } else { return parseFloat(val).toFixed(1); };
    }
  }

  checkFac_per(p:any) { if (p == 19 || p == 17 || p == 9 || p == 1 || p == 10 || p == 4 || p == 12) { return false; } else { return true; } }

  CurrencyFormat(val:any) {
    return Math.abs(Number(val)) >= 1.0e+12
      ? (Math.abs(Number(val)) / 1.0e+12).toFixed(2) + " T" : Math.abs(Number(val)) >= 1.0e+9
        ? (Math.abs(Number(val)) / 1.0e+9).toFixed(1) + " B" : Math.abs(Number(val)) >= 1.0e+6
          ? (Math.abs(Number(val)) / 1.0e+6).toFixed(1) + " M" : Math.abs(Number(val)) >= 1.0e+3
            ? (Math.abs(Number(val)) / 1.0e+3).toFixed(1) + " K" : Math.abs(Number(val));
  }

  billionconverter(d:any) { let ActVal = d * 100000; return this.CurrencyFormat(ActVal).toString(); };
  convert2width(start:any, end:any) {
    var st: any = start;
    var en: any = end;
    var wid = parseInt(st) - parseInt(en);
    return wid;
  }
  checkfactorName(id:any) {
    var fac = [...this.cusIndexService._factorMasterData].filter(fu => fu.id == id);
    if (fac.length > 0) { return fac[0].displayname; } else { return ""; }
  }

  top10HoldingCheck() {
    if (this.sharedData.checkMenuPer(3, 163) == 'Y' && this.sharedData.selTradeData.type == "CI") { return true }
    else if (this.sharedData.checkMenuPer(12, 187) == "Y" && this.sharedData.selTradeData.type == "DI") { return true }
    else { return false }
  };

  checkEmptyObj(data: any) { if (Object.keys(data).length > 0) { return true } else { return false } };

  nextarrow() {
    $(".table-fixed-column-inner").animate({ scrollLeft: '+=500' }, 200);
    this.horizontalScroll();
  }

  prevarrow() {
    $(".table-fixed-column-inner").animate({ scrollLeft: '-=500' }, 200);
    this.horizontalScroll();
  }

  nextarrowTax() {
    $("#TaxGain .table-fixed-column-inner-taxgain").animate({ scrollLeft: '+=500' }, 200);
    $("#TradetableNavBuy2 .nav-next").addClass("scrollBtn");
    $("#TradetableNavBuy2 .nav-prev").removeClass("scrollBtn");
  }
  prevarrowTax() {
    $("#TaxGain .table-fixed-column-inner-taxgain").animate({ scrollLeft: '-=500' }, 200);
    $("#TradetableNavBuy2 .nav-prev").addClass("scrollBtn");
    $("#TradetableNavBuy2 .nav-next").removeClass("scrollBtn");
  }

  horizontalScroll() {
    $(".table-fixed-column-inner").on('scroll', function (ev:any) {
      var val = $(ev).scrollLeft();
      if ($(ev).scrollLeft() + $(ev).innerWidth() >= ($(ev)[0].scrollWidth) - 1) {
        $("#TradetableNavBuy .nav-next").addClass("scrollBtn");
      } else {
        $("#TradetableNavBuy .nav-next").removeClass("scrollBtn");
      }
      if (val == 0) {
        $("#TradetableNavBuy .nav-prev").addClass("scrollBtn");

      } else {
        $("#TradetableNavBuy .nav-prev").removeClass("scrollBtn");
      }
    });
  }

  accord_losers_length: number = 0;
  checkconst_filters() {
    var that = this;
    if (that.indexRulesData[0].strStockkey.length > 0 || that.indexRulesData[0].strSector.length > 0 || that.indexRulesData[0].category.length > 0
      || that.sharedData.getRatingSSRval(that.indexRulesData[0].rating) > 0 || that.accord_losers_length > 0 || that.factorsGrp.length > 0) {
      return true;
    } else { return false; }
  }

  taxgainlossFormat(d:any) {
    if (isNullOrUndefined(d) || isNullOrUndefined(d['annualPnL'])) { return '-' } else { return format("$,.2f")(d['annualPnL']) }
  }

  reviewfactsheetloadChart() {
    var that = this;
    setTimeout(function () {
      if (that.GetETFStrData.length > 0) {
        //that.barChart();
        that.formatCharData(that.GetETFStrData[0]['graphvalues']);
      }
      $("#TradeIndexTable3").scrollLeft(0);
      $("#TradeIndexTable1").scrollLeft(0);
      //this.hideNav();
    }.bind(this), 50)
  }

  formatCharData(Data:any) {
    var that = this;
    var chartTitle = "";
    var etfvalue:any = [];
    var date:any = [];
    var uindexvalue:any = [];
    var afterTax:any = [];
    if (Data.length > 0) {
      Data.forEach((x: any, i: any) => {
        if (isNotNullOrUndefined(x['top100']) && isNotNullOrUndefined(x['range']) && x['range'] != "" && x['top100'] != "") {
          date.push(x['date']);
          etfvalue.push(x['top100']);
          uindexvalue.push(x['range']);
          if (that.taxOptFactSheet) { afterTax.push(that.GetETFStrData[2]['graphvalues'][i]['range']) }
        }
      });
    }

    var series:any = [];
    if (uindexvalue.length > 0) {
      series.push({
        name: (that.taxOptFactSheet) ? that.indexName + ' - Before Tax' : that.indexName,
        marker: { symbol: 'circle' },
        color: 'var(--prim-button-color)',
        data: uindexvalue,
        lineWidth: 0.8
      });
    }

    if (that.taxOptFactSheet) {
      series.push({
        name: that.indexName + ' - After Tax',
        marker: {
          symbol: ''
        },
        color: '#df762e',
        data: afterTax,
        lineWidth: 0.8
      });
    }
    var tick;
    if (isNotNullOrUndefined(that.clickedList.Ticker) && that.clickedList.Ticker != '') {
      tick = " (" + that.clickedList.Ticker + ")";
    } else { tick = "" }
    var name = that.perfName;
    if (this.checkIndexTab == "DI") { name = that.perfName } series.push({
      name: name,
      marker: {
        symbol: ''
      },
      color: '#9b9b9b',
      data: etfvalue,
      lineWidth: 0.8
    });

    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
    Highcharts.chart({
      chart: {
        renderTo: 'lineChartBuyModel_Trade',
        type: 'spline',
        style: {
          fontFamily: 'var(--ff-medium)'
        },
        zooming: {
          mouseWheel: false
        }
      }, exporting: {
        url: 'https://export.highcharts.com/',
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
          },
        },
      },
      credits: {
        enabled: false
      },
      title: {
        text: chartTitle,
        style: {
          color: '#394e8b',
          fontSize: '15px',
          fontFamily: 'var(--ff-medium)',
        }
      },
      subtitle: {
        text: ''
      },
      legend: {

      },
      xAxis: {
        type: 'datetime',
        categories: date,
        tickColor: '#f1f1f1',
        tickWidth: 1,
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          },

          style: {
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            color: '#333',
            fontSize: '10px',
          }

        }
      },
      yAxis: {
        maxPadding: 0.2,
        title: {
          text: ''
        },
        labels: {
          style: {
            color: '#333',
            fontSize: '10px'
          },
          formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); }

        }
      },

      tooltip: {
        xDateFormat: '%Y-%m-%d',
        valueDecimals: 2,
        shared: true,
        dateTimeLabelFormats: {
          millisecond: "%A, %b %e"
        },
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 0.1,
            lineColor: '#666666',
            lineWidth: 0.1
          }
        },
        series: { point: { events: { click: function (e) { } } } }
      },
      series: series,
      lang: { noData: "No data to display", },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
        }
      }
    });
  }


  checkAccSelNull(val:any) { if (isNullOrUndefined(val)) { return 0 } else { return val; } };

  checkGainType(val: any) { if (isNullOrUndefined(val)) { return 'Gain' } else { if (val == "G") { return 'Gain' } else { return 'Loss' } } }
}
