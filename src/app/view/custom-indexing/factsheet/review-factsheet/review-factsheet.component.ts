import { Component,ViewChild,ElementRef,HostListener, ChangeDetectionStrategy,AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../../core/services/data/data.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { descending, format } from 'd3';
import { TradeOpenComponent } from '../../../trade-open/trade-open.component';
import { DialogControllerService } from '../../../../core/services/dialogContoller/dialog-controller.service';
import * as Highcharts from 'highcharts/highstock';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonErrorDialogComponent } from '../../error-dialogs/common-error-dialog/common-error-dialog.component';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { formatDate } from '@angular/common';
declare var $: any;
import * as d3 from 'd3';
// @ts-ignore
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-review-factsheet',
  templateUrl: './review-factsheet.component.html',
  styleUrl: './review-factsheet.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReviewFactsheetComponent {
  taxOptFactSheet: boolean = false;
  taxOptFactSheetCal: boolean = true;
  checkverify_trade: boolean = false;
  enableTaxPerformance: boolean = true;
  enableTaxCalendar: boolean = true;
  @ViewChild('calendarYearReturns', { read: ElementRef }) public calendarYearReturns: ElementRef<any> | any;
  @ViewChild('taxGainLoss', { read: ElementRef }) public taxGainLoss: ElementRef<any> | any;
  @HostListener('scroll', ['$event'])
  showSpinner_factsheet: boolean = false;
  direct_progress = "(0s)";
  clearIntervalProgress: any;
  selectedStrategyName: any;
  clickedAccountDetails: any;
  seltabname: string = "";
  onScroll(event: Event,params:any) {
    var target = event.target as HTMLDivElement;
    const scrollableElement = this.calendarYearReturns.nativeElement;
    const isAtEnd = Math.round(scrollableElement.scrollLeft) + scrollableElement.offsetWidth + 1 >= scrollableElement.scrollWidth;
    if (isAtEnd) {
      const element = document.getElementById('calArrowright');
      if (element) {
        element.classList.add('scrollBtn');
      }
    } else {
      const element = document.getElementById('calArrowright');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
    if (target.scrollLeft == 0){
      const element = document.getElementById('calArrowleft');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else{
      const element = document.getElementById('calArrowleft');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
  }

  subscriptions = new Subscription();

  constructor(public sharedData: SharedDataService, public dirIndexService: DirectIndexService, private logger: LoggerService,
    private dataService: DataService, public cusIndexService: CustomIndexService, private httpClient: HttpClient, private dialogController: DialogControllerService, public dialog: MatDialog, private toastr: ToastrService) { }

  showTradeBtn: boolean = false;
  cashTarget: number = 0;
  ngOnInit() {
    var that = this;
    var selectedDirIndFactsheet_sub = this.cusIndexService.selectedCIIndFactsheet.subscribe((res: number) => {
      if (isNotNullOrUndefined(res) && res > 0) { this.showTradeBtn = true; } else { this.showTradeBtn = false; }
      this.loadFactsheet();
    });
    var move_defaultAccount = this.cusIndexService.errorList_custom.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(selectedDirIndFactsheet_sub);
    this.subscriptions.add(move_defaultAccount);
    var revIndClickedData = that.cusIndexService.reviewIndexClickedData.subscribe((data:any) => {
      // this.GetBuildMyIndexMnthlyHPortfolio()
      that.seltabname = "";
      var currentList = this.cusIndexService.currentSList.value;
      if (isNotNullOrUndefined(currentList.cashTarget)) { this.cashTarget = currentList.cashTarget }
      else { this.cashTarget = 0 }
      if (isNotNullOrUndefined(data) && data['accountVan'] != '') {
        that.seltabname = data['accountVan'];
        that.clickedAccountDetails = data;
        this.cashTarget = data['cashTarget'];
        that.GetDIEnabletradinglist();
      } else { that.seltabname = ""; that.GetDIEnabletradinglist(); }
    });
    that.subscriptions.add(revIndClickedData);
    //if (this.cusIndexService.selectedDirIndFactsheet.value == 0 && that.cusIndexService.notifyDiClick.value) {
    //  var taxharvestData_DirectIndex = this.cusIndexService.taxharvestData_customIndex.subscribe((res: any) => { this.loadFactsheet(); });
    //  this.subscriptions.add(taxharvestData_DirectIndex);
    //  var directIndexData = this.cusIndexService.customIndexData.subscribe((res: any) => { this.loadFactsheet(); });
    //  this.subscriptions.add(directIndexData);
    //}
    var notifyIndexClick = this.sharedData.notifyIndexClick.subscribe(notifyIndexClick => {
      if (notifyIndexClick) {
        this.loadFactsheet();
        this.sharedData.notifyIndexClick.next(false)
      }
    });
    that.subscriptions.add(notifyIndexClick);

    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe(x => {
      if (x) {
        that.sharedData.refreshAlreadytradedStrategy.next(false);
        that.sharedData.getNotificationDataReload();
        that.checkAlreadytradedStrategy(true);
        setTimeout(function () { that.sharedData.showMatLoader.next(false); }.bind(this), 1000);
      };
    });
    this.subscriptions.add(refreshAlreadytradedStrategy);

    that.selectedStrategyName = that.cusIndexService.currentSList.value;

  }
  onScrolltaxGainLoss(event: Event,params:any) {

    var target = event.target as HTMLDivElement;
    const scrollableElement = this.taxGainLoss.nativeElement;
    const isAtEnd = Math.round(scrollableElement.scrollLeft) + scrollableElement.offsetWidth + 1 >= scrollableElement.scrollWidth;
    if (isAtEnd) {
      const element = document.getElementById('taxArrowright');
      if (element) {
        element.classList.add('scrollBtn');
      }
    } else {
      const element = document.getElementById('taxArrowright');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
    if (target.scrollLeft == 0){
      const element = document.getElementById('taxArrowleft');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else{
      const element = document.getElementById('taxArrowleft');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }

  }
  scrollRight(data:any){

    if(data == 'calendarYearReturnsRight'){

      this.calendarYearReturns.nativeElement.scrollTo({ left: (this.calendarYearReturns.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
    else{
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

  onToggleVerify(event: any) {
    var that = this;
    var check = event.checked;
    var getAccId = parseInt(that.cusIndexService.selectedCIIndFactsheet.value);
    var slidNo = this.cusIndexService._currentSList.id;
    if (check == true) {
      that.checkverify_trade = true;
      that.cusIndexService.enableTrading_factsheet.next("Y");
      this.saveEnableTradingDI(slidNo, getAccId);
      this.sharedData.userEventTrack('Custom Indexing', this.cusIndexService.customizeSelectedIndex_custom.value.name, this.cusIndexService.customizeSelectedIndex_custom.value.name, 'Enable Trading click');
    }
    else {
      that.checkverify_trade = false;
      that.cusIndexService.enableTrading_factsheet.next("N");
      this.saveEnableTradingDI(slidNo, getAccId);
      this.sharedData.userEventTrack('Custom Indexing', this.cusIndexService.customizeSelectedIndex_custom.value.name, this.cusIndexService.customizeSelectedIndex_custom.value.name, 'Disable Trading click');
    }
  }

  saveEnableTradingDI(sno: any, accId: number): any {
    var that = this;
    try {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let datas = { "userid": parseInt(userid), "slid": sno, "enableTrading": that.cusIndexService._enableTrading_factsheet, "accountId": accId };
      var statdata = [];
      statdata.push(datas);
      var PostEnableTrading=that.dataService.PostEnableTrading(datas).pipe(first()).subscribe((data: any) => {
        if (data[0] != "Failed") {
          if (that.cusIndexService._enableTrading_factsheet == "Y") { that.toastr.success(that.sharedData.checkMyAppMessage(0, 17), '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" }); }
          else { that.toastr.success(that.sharedData.checkMyAppMessage(0, 18), '', { timeOut: 4000, positionClass: "toast-top-center" }); }
          that.dirIndexService.getDIEnabletradinglist(accId);
        }
      }, (error: any) => {
        that.toastr.info('Try Again', '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
      });
      this.subscriptions.add(PostEnableTrading);
    } catch (e) {
      //this.logger.logError(e, 'catch error'); console.log(e)
    }
  }


  startProgressLoader() {
    var that = this;
    this.showSpinner_factsheet = true;
    //$('.leftDivWrap').css('visibility', 'hidden');
    //$('#buyBtnLdrModal').css('display', 'flex');
    try { clearInterval(that.clearIntervalProgress); } catch (e) { }
    that.direct_progress = "(0s)";
    that.centerGridProgressCount();
  }
  centerGridProgressCount() {
    var that = this;
    var min = 0;
    var sec = 0;
    var seconds = "";
    /* $('#factsheet_loader .div_n_load').text('Implementing filtering and selection');*/
    that.clearIntervalProgress = setInterval(function () {
      //var a = new Date();
      //if (min == 0) {
      //  $('#factsheet_loader .div_n_load').text('Implementing filtering and selection');
      //}
      //else if (min > 0) {
      //  $('#factsheet_loader .div_n_load').text('Executing historical rebalances');
      //}
      //else if (min > 1) {
      //  $('#factsheet_loader .div_n_load').text('Back-testing historical values');
      //} else if (min > 2) {
      //  $('#factsheet_loader .div_n_load').text('Producing portfolio characteristics');
      //} else if (min > 3) {
      //  $('#factsheet_loader .div_n_load').text('Finalizing composition and performance metrics');
      //}
      if (!that.showSpinner_factsheet) {
        try { clearInterval(that.clearIntervalProgress); } catch (e) { }
        setTimeout(function () { that.direct_progress = "(0s)"; }, 100)
      }
      if (min > 0) {
        seconds = min + "m" + " " + sec + "s";
      } else {
        seconds = sec + "s";
      }
      that.direct_progress = "(" + seconds + ")";
      sec++;
      if (sec == 60) {
        min++;
        sec = 0;
      }
    }, 1000);
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
  }
  cusindexName: string = "";
  cusindexShortName: string = "";
  cusindexNameTicker: string = "";
  cusindexBM_Name: string = "";
  cusindexBM_Ticker: string = "";

  checkNAAshow: boolean = false;
  performanceETFRList = [];
  performanceUIndexList: any = [];
  taxOptFactSheet_optional: boolean = false;
  showCheckbox_afterTax: boolean = false;
  GetETFStrData: any = [];

  loadFactsheet() {
    var that = this;
    this.startProgressLoader();
    var basedata = this.cusIndexService.customizeSelectedIndex_custom.value;
    // that.seltabname = '';
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);

    if (ETFIndex.length > 0) {
      if (isNotNullOrUndefined(basedata['Indexname'])) {
        this.cusindexNameTicker = basedata['Indexname'];
        this.cusindexBM_Name = basedata['Indexname'];
      }
      else if (isNotNullOrUndefined(basedata.basedon) && basedata.basedon != "") {
        this.cusindexNameTicker = basedata.basedon;
        this.cusindexBM_Name = basedata.basedon;
      }
      else if (isNotNullOrUndefined(basedata.name) && basedata.name != "") {
        this.cusindexNameTicker = basedata.name;
        this.cusindexBM_Name = basedata.name;
      }

      if (isNotNullOrUndefined(basedata['Ticker'])) {
        this.cusindexBM_Ticker = basedata['Ticker'];
      }

    } else {
      if (isNotNullOrUndefined(basedata['Indexname'])) {
        this.cusindexNameTicker = basedata['Indexname'];
        this.cusindexBM_Name = basedata['Indexname'];
      }
      else if (isNotNullOrUndefined(basedata.basedon) && basedata.basedon != "") {
        this.cusindexNameTicker = basedata.basedon;
        this.cusindexBM_Name = basedata.basedon;
      }
      else if (isNotNullOrUndefined(basedata.name) && basedata.name != "") {
        this.cusindexNameTicker = basedata.name;
        this.cusindexBM_Name = basedata.name;
      }
      if (isNotNullOrUndefined(basedata['Ticker'])) { this.cusindexBM_Ticker = basedata['Ticker']; }
      else { this.cusindexBM_Ticker = ''; }
    }

    //if (isNotNullOrUndefined(basedata['Indexname']) && basedata['indextype'] == 'Equity') {
    //  this.cusindexBM_Name = basedata['Indexname'];
    //}



    that.cusindexName = this.cusIndexService._custToolName;
    that.cusindexShortName = this.cusIndexService._custToolShortname;
    setTimeout(function () {
      that.checkNAAshow = false;
      that.performanceETFRList = that.cusIndexService.performanceTenYrETFRList.value;
      that.performanceUIndexList = that.cusIndexService.performanceUIndexList.value;
      that.GetTaxharvestData();
      that.GetBuildMyIndexMnthlyHPortfolio();
      try { that.GetDIEnabletradinglist(); } catch (e) { console.log(e) }
    }.bind(this), 2000);
    this.CheckProposalPermission();
  }
  top10HoldingCheck() { if (this.sharedData.checkMenuPer(3, 163) == "Y") { return true } else { return false } };
  openErrorComp() {
    var title = 'Error';
    var options = {from:'reviewFactsheet', error:'notifyError', destination: 'loadDefaultAccount'}
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  }
  taxGainLossData: any = [];
  taxGL(data: any) {
    var that = this;
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['annualPnlList'])) {
      that.taxGainLossData = data[0]['annualPnlList'].map((a:any) => ({ ...a }))
        .sort(function (x: any, y: any) { return descending(x.year, y.year); });
    } else { that.taxGainLossData = []; };
  }
  taxgainlossFormat(d:any) {
    if (isNullOrUndefined(d) || isNullOrUndefined(d['annualPnL'])) { return '-' }
    else { return format("$,.2f")(d['annualPnL']) }
  }

  perfData = { years: [], ETFind: {}, Uindex: {}, AUindex: {} };
  formatPerfData(data:any) {
    var that = this;
    if (data.length > 0) {
      var dta = data[0]['etfPerformanceYears'];
      var dta1:any = [];
      if (data.length > 1) { dta1 = data[1]['etfPerformanceYears']; }
      var ETFind:any = {};
      var Uindex:any = {};
      var AUindex:any = {};
      var yer:any = [...new Set(dta.map((x:any) => x.year))].sort(function (x: any, y: any) { return descending(x, y); });
      this.perfData.years = yer;
      this.perfData.years.forEach(d => {
        var ETF = dta1.filter((x: any) => x.type == "ETF" && x.year == d);
        ETFind[d] = ETF[0]['yearReturns'];
        var Uind = dta.filter((x: any) => x.type == "Uindex" && x.year == d);
        Uindex[d] = Uind[0]['yearReturns'];
        if (that.taxOptFactSheet) {
          var Uind1 = data[2]['etfPerformanceYears'].filter((x: any) => x.type == "Uindex" && x.year == d);
          AUindex[d] = Uind1[0]['yearReturns'];
        }
      });
      this.perfData.ETFind = ETFind;
      this.perfData.Uindex = Uindex;
      this.perfData.AUindex = AUindex;
    } else {
      this.perfData.years = [];
      this.perfData.ETFind = {};
      this.perfData.Uindex = {};
      this.perfData.AUindex = {};
    }
  }

  checkEmptyObj(data:any) { if (Object.keys(data).length > 0) { return true } else { return false } };

  factsheetPerfData: any = [];
  GTharvestData_sub: any;
  GetTaxharvestData() {
    var that = this;
    this.taxGainLossData = [];
    that.taxOptFactSheet = false;
    that.taxOptFactSheet_optional = false;
    if (isNotNullOrUndefined(this.cusIndexService.currentSList.value['taxEffAwareness']) &&
      that.cusIndexService.currentSList.value['taxEffAwareness'] == 'Y') {
      that.showCheckbox_afterTax = true;
      that.enableTaxPerformance = true;
      that.enableTaxCalendar = true;
    } else {
      that.showCheckbox_afterTax = false;
      that.enableTaxPerformance = false;
      that.enableTaxCalendar = false;
    }
    var basedata = this.cusIndexService.customizeSelectedIndex_custom.value;
    var d = new Date();
    var assetid;
    var indexId = 123;

    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);

    if (ETFIndex.length > 0) {
      assetid = basedata.assetId;
      d = new Date(ETFIndex[0]['holdingsdate']);
    } else {
      indexId = this.cusIndexService.getIndexId(basedata);
      d = new Date(this.sharedData.equityHoldDate);
    }
    assetid = basedata.assetId;

    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var currentList = this.cusIndexService.currentSList.value;
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);
    let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
    var data = {
      "accountId": accID,
      "notifyid": notifyId[0]['notifyId'],
      "assetid": notifyId[0]['assetId'],
      "userid": userid,
      "strategyId": notifyId[0]['slid'],
      "enddate": date,
      "tenYrFlag": notifyId[0]['tenYrFlag'],
      "indexId": indexId,
      "freqflag": notifyId[0]['freqflag']
    };
    //try { this.GTharvestData.unsubscribe(); } catch (e) { }
    var GTharvestData = this.dataService.GetTaxharvestSavedCIkub(data).pipe(first()).subscribe((res: any) => {
      if (this.sharedData.checkServiceError(res)) {
        //if (that.cusIndexService._showReviewIndexLoaded) {
        //  $('#myCustomIndErrorModal_review').modal('show');
        //}
        this.openErrorComp();
        this.closecommon_progress();
      } else {
        if (res.length > 2 && that.showCheckbox_afterTax) {
          that.showCheckbox_afterTax = true;
          that.taxOptFactSheet = true;
          that.taxOptFactSheet_optional = true;
          that.taxOptFactSheetCal = true;
        } else {

          that.showCheckbox_afterTax = false;
          that.taxOptFactSheet = false;
          that.taxOptFactSheetCal = false;
        }
        that.update_perfasofDate(res);
        this.performanceUIndexList = res
        this.factsheetPerfData = res;
        this.formatCharData(res[0]['graphvalues']);
        this.formatPerfData(res);
        if (res.length == 0 || isNullOrUndefined(res[0]['annualPnlList'])) { that.taxGainLossData = []; }
        else {
          that.taxGainLossData = res[0]['annualPnlList'].map((a:any) => ({ ...a }))
            .sort(function (x:any, y:any) { return d3.descending(x.year, y.year); });
        }
        this.GetETFStrData = res;
        that.right_spinner_off();
      }
    }, error => {
      this.openErrorComp();
      this.closecommon_progress();
    });
    this.subscriptions.add(GTharvestData);

  }
  GBIMHPortfolio: any;
  sectorData:any = [];
  GetBuildMyIndexMnthlyHPortfolio() {
    var that = this;
    this.cusIndexService.customizeSelectedIndex_custom.pipe(first()).pipe(first()).subscribe(customizeSelectedIndex => {
      var basedata = customizeSelectedIndex;
      var d = new Date();
      var assetid;
      var indexId = 123;
      var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);

      if (ETFIndex.length > 0) {
        assetid = basedata.assetId;
        d = new Date(ETFIndex[0]['holdingsdate']);
      } else {
        indexId = this.cusIndexService.getIndexId(basedata);
        d = new Date(this.sharedData.equityHoldDate);
      }
      assetid = basedata.assetId;
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
      var accID = this.cusIndexService.selectedCIIndFactsheet.value;
      var currentList = this.cusIndexService.currentSList.value;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);
      let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
      var datas = {
        "accountId": accID,
        "notifyid": notifyId[0]['notifyId'],
        "assetid": notifyId[0]['assetId'],
        "userid": userid,
        "strategyId": notifyId[0]['slid'],
        "enddate": date,
        "tenYrFlag": notifyId[0]['tenYrFlag'],
        "indexId": indexId,
        "freqflag": notifyId[0]['freqflag']
      };
      //     if (notifyId.length > 0) {
      //       that.clickedAccountDetails = that.cusIndexService._reviewIndexClickedData;
      //       console.log(that.clickedAccountDetails,'notifyId')
      //       that.seltabname = notifyId[0]['accountVan'];
      //  }
      try { this.GBIMHPortfolio.unsubscribe(); } catch (e) { }
      this.GBIMHPortfolio = this.dataService.GetBuildMyIndexMnthlyHPSavedCIkub(datas).pipe(first()).subscribe(res => {
        //console.log(res);
        if (this.sharedData.checkServiceError(res)) {
          // that.snackBar.open('Data not available', '', { duration: 3000, panelClass: ['cdksnackbarpanel-center'] });
          this.openErrorComp();
          this.closecommon_progress();
        } else {
          var dta: any = res;
          var data:any = []
          dta.forEach((x:any) => {
            var newObj = Object.assign({}, x);
            if (isNotNullOrUndefined(x.Weight)) { newObj.Wt = x.Weight * 100; }
            else { newObj.Wt = x.weight * 100; }
            newObj['newSec'] = x.sector;
            data.push(newObj)
          });
          data = data.map((a:any) => ({ ...a }));
          //that.sectorData = this.createSector([...data])
          //setTimeout(() => { that.barChart(); }, 1000);
          that.getBarchart(datas);
          data = data.sort(function (x:any, y:any) { return d3.descending((x.Wt), (y.Wt)); });
          if (this.sharedData.checkMenuPer(3, 163) == 'Y') { this.bldMyIndexMntHPortfolioData = [...data].slice(0, 10); }
          else { this.bldMyIndexMntHPortfolioData = [...data]; }
          that.right_spinner_off();
        }
      }, error => {
        this.openErrorComp();
        this.closecommon_progress();
      });
      this.subscriptions.add(this.GBIMHPortfolio);
    });
  }
  createSector(data:any) {
    var arr:any = [];
    var list1 = [...new Set(data.map((x: { newSec: any; }) => x.newSec))];
    list1.forEach((x) => {
      var list = data.filter((y:any) => y.newSec == x);
      let tot = d3.sum(list, function (d: any) { return d.Wt; });
      let totAllSec = d3.sum(data, function (d: any) { return d.Wt; });
      arr.push({ "name": x, weight: d3.format(".2f")(tot) + "%" });
    });
    var dta = [...arr].map(a => ({ ...a })).sort(function (x, y) { return d3.descending((parseFloat(x.weight)), (parseFloat(y.weight))); });
    return [...dta];
  }
  checkOpt(data: any) {
    var that = this;
    if (isNotNullOrUndefined(data) && data.length > 2) { that.taxOptFactSheet = true; }
    else { that.taxOptFactSheet = false; };
  }

  bldMyIndexMntHPortfolioData: any = [];
  GBIMHPortfolio_sub: any;

  right_spinner_off() {
    var that = this;
    if (that.bldMyIndexMntHPortfolioData.length > 0 && that.factsheetPerfData.length > 0) {
      //try {
      //  that.selectedStrategyName = that.cusIndexService.currentSList.value;
      //  that.createdDate_for = that.modifiedDate(that.cusIndexService.currentSList.value['createddate']);
      //  that.modifyDate_for = that.modifiedDate(that.cusIndexService.currentSList.value['modifieddate']);
      //} catch (e) { }

      setTimeout(()=>{ that.closecommon_progress(); }, 500);

      try {
        setTimeout(function () {
          if (that.perfData.years.length > 0 && $(".calendarYearReturns").length>0) {
            $(".calendarYearReturns").scrollLeft(0);
            $(".taxGainLoss").scrollLeft(0);
            if (Math.round($(".calendarYearReturns").scrollLeft())  + $(".calendarYearReturns").innerWidth() >= ($(".calendarYearReturns")[0].scrollWidth) - 1) {
              $(".calendarYearReturns").addClass('widthExt1');
              $("#tableNavBuy").hide();
            };
          }
          if ($(".taxGainLoss").length > 0 && Math.round($(".taxGainLoss").scrollLeft())  + $(".taxGainLoss").innerWidth() >= ($(".taxGainLoss")[0].scrollWidth) - 1) {
            $(".taxGainLoss").addClass('widthExtTax');
            $("#tableNavBuy2").hide();
          };
          setTimeout(() => { that.closecommon_progress(); }, 500);
        }, 50)
      } catch (e) { }

    }
  }

  closecommon_progress() {
    var that = this;
    try { clearInterval(that.clearIntervalProgress); } catch (e) { }
    that.showSpinner_factsheet = false;
    that.direct_progress = "(0s)";
    //$('#buyBtnLdrModal').css('display', 'none');
    //$('.leftDivWrap').css('visibility', 'visible');

    that.sharedData.showCenterLoader.next(false);
    that.sharedData.showCircleLoader.next(false);
    that.sharedData.showMatLoader.next(false);

  }
  clonechartData: any;
  formatCharData(Data:any) {
    var that = this;
    that.clonechartData = Data;
    var chartTitle = "";
    var etfvalue:any = [];
    var date: any = [];
    var uindexvalue: any = [];
    var afterTax: any = [];
    if (Data.length > 0) {
      Data.forEach((x: any, i: any) => {
        if (isNotNullOrUndefined(x['top100']) && isNotNullOrUndefined(x['range']) && x['range'] != "" && x['top100'] != "") {
          date.push(x['date']);
          etfvalue.push(x['top100']);
          uindexvalue.push(x['range']);
          if (that.taxOptFactSheet) { afterTax.push(that.performanceUIndexList[2]['graphvalues'][i]['range']) }
        }
      });
    }

    var series:any = [];
    if (uindexvalue.length > 0) {

      var d = new Date(date[date.length - 1]);

      series.push({
        name: (that.taxOptFactSheet) ? that.cusindexName + ' - Before Tax' : that.cusindexName,
        marker: {
          symbol: 'circle'
        },
        color: 'var(--prim-button-color)',
        data: uindexvalue,
        lineWidth: 0.8
      });
    }
    if (that.taxOptFactSheet) {
      series.push({
        name: that.cusindexName + ' - After Tax',
        marker: {
          symbol: ''
        },
        color: '#df762e',
        data: afterTax,
        lineWidth: 0.8
      });
    }

    series.push({
      name: that.cusindexNameTicker,
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
        renderTo: 'lineChartBuyModel_cusIndex',
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


  onlyLettersNumbersAndSpaces(str:any) {
    var a = /^[a-zA-Z\s]*$/.test(str);
    return a;
  }

  showLoad: boolean = false;
  showLoad1: boolean = false;
  showLoad2: boolean = false;
  private API_URL = environment.api_url + '/Export/factsheetdataAPI';
  private MethodologyAPI_URL = environment.api_url + '/Export/DevEx_factsheetMethodology';
  private ProposalAPI_URL = environment.api_url + '/Export/Export_Proposal';
  private ProposalPremissionCheck = environment.api_url + '/Export/GetProposalMenuPermission';
  Preparedby = "";
  Preparedfor = "";
  Prepareddate = "";
  menuflag: number = 0;
  isDropdownOpen: boolean = false;
  downloadMethodology() {
    if (this.showLoad1) { } else {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var currentList = this.cusIndexService.currentSList.value;
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);
    var Nid = notifyId[0]['notifyId'];
    var methodologyRequest = {
      'Userid': userid, 'NotifyId': Nid
    }
    this.showLoad1 = true;
    this.httpClient.post(this.MethodologyAPI_URL, methodologyRequest, { observe: 'response', responseType: 'blob' }).pipe(first()).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
        //const a = document.createElement('a');
        //a.setAttribute('style', 'display:none;');
        //document.body.appendChild(a);
        //a.download = this.selectedStrategyName.name + "_Methodology";
        //a.href = URL.createObjectURL(downloadedFile);
        //a.target = '_blank';
        //a.click();
        //document.body.removeChild(a);

        var filename: string = this.sharedData.downloadTitleConvert(this.selectedStrategyName.name) + "_Methodology.pdf";
        FileSaver.saveAs(downloadedFile, filename);
      }
      else {
        this.toastr.info("Something went wrong.. please try again", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      }
      this.showLoad1 = false;
    })
  }
}

  downloadPDF() {
    var that = this;
    if (this.showLoad) { } else {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var currentList = this.cusIndexService.currentSList.value;
    var basedata: any = that.cusIndexService.customizeSelectedIndex_custom.value;
    var ETFIndex: any = [...that.sharedData._ETFIndex].filter(x => x.assetId == currentList.assetId);
    var holdingdate: string ="";
    if (ETFIndex.length > 0) { holdingdate = ETFIndex[0].holdingsdate }
    if (holdingdate != undefined) {
      holdingdate = holdingdate.substring(0, 10);
      holdingdate = holdingdate.replace('-', '').replace('-', '');
    } else { holdingdate = ""; }
    var barcharttype: any;
    var name2: string;
    if (ETFIndex.length > 0) {
      barcharttype = "ETF";
      name2 = (isNotNullOrUndefined(ETFIndex[0]['etfName']) ? ETFIndex[0]['etfName'] : this.cusindexBM_Name).toString();
    } else {
      barcharttype = this.cusindexNameTicker;
      name2 = this.cusindexNameTicker.toString();
    }
    var d = new Date();
    var assetid;
    var indexId = 123;
    indexId = this.cusIndexService.getIndexId(that.cusIndexService._customizeSelectedIndex_custom);
    if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
    else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
    else { d = new Date(this.sharedData.equityHoldDate); }
    indexId = this.cusIndexService.getIndexId(basedata);
    assetid = basedata.assetId;

    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
    var data = {
      'strSector': [],
      'strStockkey': [],
      'assetid': assetid,
      'indexId': indexId,
      'range': 100,
      "strExStockkey": [],
      'tenYrFlag': 0,
      'enddate': date,
      "rating": '',
      "category": [],
      "taxflag": (isNotNullOrUndefined(currentList['taxEffAwareness'])) ? currentList['taxEffAwareness'] : 'N',
    };

    var currentList = this.cusIndexService.currentSList.value;
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);
    var data2 = {
      "notifyid": notifyId[0]['notifyId'],
      "assetid": assetid,
      "userid": userid,
      "strategyId": that.cusIndexService._currentSList.id,
      "enddate": date,
      "tenYrFlag": 1,
      "indexId": indexId,
      "freqflag": notifyId[0]['freqflag']
    };

    /////GetBuildMyIndexMnthlyHPSavedCIkub
    let factsheetParameter = {
      name1: this.cusIndexService._custToolShortname.toString(),
      name2: name2.toString(),
      assetid: data.assetid,
      enddate: data.enddate,
      indexId: data.indexId,
      range: data.range,
      taxflag: data.taxflag,
      freqflag: data2.freqflag,
      notifyid: data2.notifyid,
      strategyId: data2.strategyId,
      tenYrFlag: data2.tenYrFlag,
      userid: data2.userid,
      barcharttype: barcharttype,
      holdingdate: holdingdate,
      accountId: accID,
      calendarTaxflag: that.enableTaxCalendar,
      performanceTaxflag: that.enableTaxPerformance,
    }
    this.showLoad = true;
    this.httpClient.post(this.API_URL, factsheetParameter, { observe: 'response', responseType: 'blob' }).pipe(first()).subscribe((event:any) => {

      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], { type: data.body?.type });
      if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
        //  const a = document.createElement('a');
        //  a.setAttribute('style', 'display:none;');
        //  document.body.appendChild(a);
        //  a.download = this.selectedStrategyName.name + "_FactSheet";
        //  a.href = URL.createObjectURL(downloadedFile);
        //  a.target = '_blank';
        //  a.click();
        //document.body.removeChild(a);

        var filename: string = this.sharedData.downloadTitleConvert(this.selectedStrategyName.name) + "_Factsheet.pdf";
        FileSaver.saveAs(downloadedFile, filename);
      } else {
        this.toastr.info("Something went wrong.. please try again", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      }
      this.showLoad = false;
    })
  }
}

  toggleDropdown() { this.isDropdownOpen = !this.isDropdownOpen; };
  isOpen = false;
  toggleDropdownOpen() {
    this.isOpen = !this.isOpen;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isOpen ==true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
        //console.log('InnerDiv');
        if (this.isOpen == true) { 
          this.isOpen =false; 
        };
      } else {
        // this.isOpen =false; 
      }
    }
  }
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.dropdown-menu') !== null  || element.closest('.reviewFact__dropdown_button') !== null;
  }
  saveproposal() {
    var that = this;
    
    var flg = this.onlyLettersNumbersAndSpaces(this.Preparedby.trim());
    var flg1 = this.onlyLettersNumbersAndSpaces(this.Preparedfor.trim());
    if (flg == false) {
      this.toastr.info('Ensure no special characters or numbers are included');
      this.showLoad2 = false;
    }else if (flg1 == false) {
      this.toastr.info('Ensure no special characters or numbers are included');
      this.showLoad2 = false;
    }else {
      setTimeout(() => {
        this.toggleDropdownOpen();
      }, 200);
      const currentDate = new Date();
      var PDate = currentDate.getFullYear() + '-' + that.sharedData.formatedates(currentDate.getMonth() + 1) + '-' + that.sharedData.formatedates(currentDate.getDate());
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accID = this.cusIndexService.selectedCIIndFactsheet.value;
      var currentList = this.cusIndexService.currentSList.value;
      var basedata: any = that.cusIndexService.customizeSelectedIndex_custom.value;
      var ETFIndex: any = [...that.sharedData._ETFIndex].filter(x => x.assetId == currentList.assetId);
      var holdingdate: string = "";
      if (ETFIndex.length > 0) { holdingdate = (isNotNullOrUndefined(ETFIndex[0]['holdingsdate']) ? ETFIndex[0]['holdingsdate']:'') }
      if (holdingdate != undefined) {
        holdingdate = holdingdate.substring(0, 10);
        holdingdate = holdingdate.replace('-', '').replace('-', '');
      }      else {        holdingdate = "";      }
      var barcharttype: any;
      var name2: string;
      if (ETFIndex.length > 0) {
        barcharttype = "ETF";
        name2 = (isNotNullOrUndefined(ETFIndex[0]['etfName']) ? ETFIndex[0]['etfName'] : this.cusindexBM_Name).toString();
      } else {
        barcharttype = this.cusindexNameTicker;
        name2 = this.cusindexNameTicker.toString();
      }

      var d = new Date();
      var assetid;
      var indexId = 123;
      indexId = this.cusIndexService.getIndexId(that.cusIndexService._customizeSelectedIndex_custom);
      if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
      else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
      else { d = new Date(this.sharedData.equityHoldDate); }
      indexId = this.cusIndexService.getIndexId(basedata);
      assetid = basedata.assetId;

      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
      var data = {
        'strSector': [],
        'strStockkey': [],
        'assetid': assetid,
        'indexId': indexId,
        'range': 100,
        "strExStockkey":[],
        'tenYrFlag': 0,
        'enddate': date,
        "rating": '',
        "category": [],
        "taxflag": (isNotNullOrUndefined(currentList['taxEffAwareness'])) ? currentList['taxEffAwareness'] : 'N',
      };

      var currentList = this.cusIndexService.currentSList.value;
      var accID = this.cusIndexService.selectedCIIndFactsheet.value;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);

      var data2 = {
        "notifyid": notifyId[0]['notifyId'],
        "assetid": assetid,
        "userid": userid,
        "strategyId": that.cusIndexService._currentSList.id,
        "enddate": date,
        "tenYrFlag": 1,
        "indexId": indexId,
        "freqflag": notifyId[0]['freqflag']
      };

      /////GetBuildMyIndexMnthlyHPSavedCIkub
      let factsheetParameterreq = {
        name1: this.cusIndexService._custToolShortname.toString(),
        name2: name2.toString(),
        assetid: data.assetid,
        enddate: data.enddate,
        indexId: data.indexId,
        range: data.range,
        taxflag: data.taxflag,
        freqflag: data2.freqflag,
        notifyid: data2.notifyid,
        strategyId: data2.strategyId,
        tenYrFlag: data2.tenYrFlag,
        userid: data2.userid,
        barcharttype: barcharttype,
        holdingdate: holdingdate,
        accountId: accID,
        calendarTaxflag: that.enableTaxCalendar,
        performanceTaxflag: that.enableTaxPerformance,
      }
      var methodologyRequest = {
        'Userid': userid, 'NotifyId': data2.notifyid
      }

      if (this.Preparedby.trim().length == 0 || isNullOrUndefined(this.Preparedby.trim())) {
        this.toastr.info("Prepared by field cannot be empty.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
        this.showLoad2 = false;

      }
      if (this.Preparedfor.trim().length == 0 || isNullOrUndefined(this.Preparedfor.trim())) {
        this.toastr.info("Prepared for field cannot be empty.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
        this.showLoad2 = false;

      }

      let proposaldata = {
        factsheetParameter: factsheetParameterreq,
        methodologyParameter: methodologyRequest,
        StrategyName: this.selectedStrategyName.name,
        ProposalDate: PDate,
        Preparedby: this.Preparedby,
        Client: this.Preparedfor
      }

      this.isDropdownOpen = false;
      $('#Proposal_Modal').modal('hide');
      this.showLoad2 = true;
      this.httpClient.post(this.ProposalAPI_URL, proposaldata, { observe: 'response', responseType: 'blob' }).pipe(first()).subscribe((event) => {
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], {
          type: data.body?.type
        });
        if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
          //const a = document.createElement('a');
          //a.setAttribute('style', 'display:none;');
          //document.body.appendChild(a);
          //a.download = this.selectedStrategyName.name + "_Proposal";
          //a.href = URL.createObjectURL(downloadedFile);
          //a.target = '_blank';
          //a.click();
          //document.body.removeChild(a);
          var filename: string = this.sharedData.downloadTitleConvert(this.selectedStrategyName.name + '_' + this.Preparedfor) + "_Proposal.pdf";
          FileSaver.saveAs(downloadedFile, filename);
        }
        else {
          this.toastr.info("Something went wrong.. please try again", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });
        }
        this.showLoad2 = false;
        // if(this.showLoad == false && this.showLoad1 == false && this.showLoad2){
        //   this.isOpen = false;
        // }
      });
    }


  }

  CheckProposalPermission() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var req = { "MenuName": 'Export_Proposal', "Userid": userid };
    this.httpClient.post(this.ProposalPremissionCheck, req).pipe(first()).subscribe((data:any) => {
      var d: number = data["menuid"];
      if (d > 0) { that.menuflag = 1; };
    });

  }

  download() {
    var getAccId = this.cusIndexService.selectedCIIndFactsheet.value;
    this.sharedData.userEventTrack('Custom Indexing', ("Account id:" + getAccId), ("Account id:" + getAccId), 'review factsheet download btn click');
    var filename: string = this.sharedData.downloadTitleConvert(this.cusIndexService.customizeSelectedIndex_custom.value.name) + "_Components";
    this.sharedData.tradeDownload1(filename, this.bldMyIndexMntHPortfolioData, 'csv');
  }
  asOfDate: any;
  asOfPrice: any;
  update_perfasofDate(d:any) { if (isNotNullOrUndefined(d) && d.length > 0) { this.asOfDate = d[0].date; } else { this.asOfDate = '-'; } }
  checkPriceDate(d: any) { if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.hdate)) { return d.hdate; } else { return ""; }; }
  ngOnDestroy() { this.cusindexBM_Name = ''; this.cusindexNameTicker = '';  this.subscriptions.unsubscribe();}
  onToggletraded(event: any) {
    var that = this;
    var check = event.checked;
    if (check == true) {
      that.enableTaxPerformance = true;
      that.taxOptFactSheet = true;
      that.formatCharData(that.clonechartData);
    }
    else {
      that.enableTaxPerformance = false;
      that.taxOptFactSheet = false;
      if (!that.enableTaxCalendar) { that.formatCharData(that.clonechartData); }
    }
  }
  onToggletradedCal(event: any) {
    var that = this;
    var check = event.checked;
    if (check == true) {
      that.enableTaxCalendar = true;
      that.taxOptFactSheetCal = true;
      that.formatCharData(that.clonechartData);
    }
    else {
      that.enableTaxCalendar = false;
      that.taxOptFactSheetCal = false;
      if (!that.enableTaxPerformance) { that.formatCharData(that.clonechartData); };
    }
  }

  tradeNowList: any;
  loadDashData(res: any) {
    var that = this;
    if (res.length > 0) {
      var slidNo = this.cusIndexService._currentSList.id;
      var getAccId = that.cusIndexService._selectedCIIndFactsheet;
      var CIfill = res.filter((x: any) => x.assetId == that.cusIndexService._currentSList.assetId && x.id == slidNo && x.accountId == getAccId);
      this.tradeNowList = CIfill[0];
    }
  }

  alreadyselected_strategy: any = [];
  checkAlreadytradedStrategy(type: boolean = false) {
    var that = this;
    that.alreadyselected_strategy = [];
    var getAccId = parseInt(that.cusIndexService._selectedCIIndFactsheet);
    var slidNo = this.cusIndexService._currentSList.id;
    var GetTradedList=this.dataService.GetTradedList(getAccId).pipe(first()).subscribe((data: any) => {
      if (data.length > 0) {
        var checkEnableT = data.filter((x:any) => x.slid == slidNo);
        if (checkEnableT.length > 0) {
          that.alreadyselected_strategy = checkEnableT;
        }
        //// Account settings refresh
        if (type) {
          var GetStrategyAccount=that.dataService.GetStrategyAccount(slidNo).pipe(first()).subscribe((accList: any) => {
            that.cusIndexService.bldIndAccountData.next([]);
            if (accList.length > 0) {
              that.cusIndexService.bldIndAccountData.next(accList);
              if (accList.length > 0) {
                var val = that.cusIndexService.loadeStrAccuntInfo(accList);
                that.cusIndexService.bldMyIndAccountData.next(val);
              } else { that.cusIndexService.bldMyIndAccountData.next(accList); };
            } else { that.cusIndexService.bldIndAccountData.next([]); }
            //// Account settings refresh
          }, error => { this.logger.logError(error, 'GetGicsExList'); });
          this.subscriptions.add(GetStrategyAccount);
        }
      } else {
        that.alreadyselected_strategy = [];
      }
    });
    this.subscriptions.add(GetTradedList);
  }

  GetDIEnabletradinglist() {
    var that = this;
    that.checkAlreadytradedStrategy(false);
    var GetStgyListDashboardA=this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe((
      res: any[]) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.sharedData.stgyListDashAccsData.next(res);
        this.loadDashData(res);
      }
    }, error => {
      this.sharedData.stgyListDashAccsData.next([])
    });
    this.subscriptions.add(GetStgyListDashboardA);
    var getAccId = that.cusIndexService._selectedCIIndFactsheet;
    var slidNo = this.cusIndexService._currentSList.id;
    var GetDIEnabletradinglist=this.dataService.GetDIEnabletradinglist(getAccId).pipe(first()).subscribe(data => {
      if (this.sharedData.checkServiceError(data)) { this.dirIndexService.DIEnabletradinglist.next([]); } else {
        var checkEnableT = data.filter((x: any) => x.slid == slidNo);
        if (checkEnableT.length > 0) {
          if (checkEnableT[0].enableTrading == 'Y') { that.checkverify_trade = true; }
          else { that.checkverify_trade = false; }
        } else { that.checkverify_trade = false; }
        this.dirIndexService.DIEnabletradinglist.next(data);
      }
    }, error => { this.dirIndexService.DIEnabletradinglist.next([]); });
    this.subscriptions.add(GetDIEnabletradinglist);
  }

  tradeData: any = { data: [], type: '' };
  checkAccInfo(dd: any, type: string) {
    if (!this.checkfactDisable()) {
      this.sharedData.showMatLoader.next(true);
      this.tradeData.data = this.tradeNowList;
      this.tradeData.type = type;
      const GetAccount = this.dataService.GetAccountData(this.tradeNowList['accountId']).pipe(first()).subscribe((res: any[]) => {
        if (res.length > 0 && isNotNullOrUndefined(res[0]['lockstatus']) && res[0]['lockstatus'] == 'Y') { $('#lockTradeModal').modal('show'); this.sharedData.showMatLoader.next(false); }
        else if (res.length > 0 && isNotNullOrUndefined(res[0]['pauseStatus']) && res[0]['pauseStatus'] == 'Y') { $('#pauseTradeModal_factsheet').modal('show'); this.sharedData.showMatLoader.next(false); }
        else { this.allowTade_fact(); };
      }, error => { });
      this.subscriptions.add(GetAccount);
    } else { this.toastr.info('Please wait trade data initializing...', '', { timeOut: 5000 }); }
  }
  checkTarget() {
    var basedata = this.cusIndexService.currentSList.value;
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var account0 = basedata.cashTarget;
    if (isNotNullOrUndefined(account0)) { account0 = account0 } else { account0 = '-' }
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == basedata.id && x.accountId == accID);
    if (notifyId.length > 0 && isNotNullOrUndefined(notifyId[0]['cashTarget'])) { return notifyId[0]['cashTarget']; } else { return account0; }
  }

  unPauseAcc() {
    this.sharedData.PauseAccUpdate(JSON.stringify(this.cusIndexService.selectedCIIndFactsheet.value), 'N')
      .then((res) => { this.allowTade_fact(); });
  }

  checkfactDisable() {
    var that = this;
    var getAccId = that.cusIndexService._selectedCIIndFactsheet;
    var slidNo = this.cusIndexService._currentSList.id;
    var xx = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == slidNo &&
      x.accountId == getAccId && x.notifyStatus == 'E');
    if (xx.length > 0) { return false } else { return true }
  }

  allowTade_fact() {
    var tp = 'name ' + this.cusIndexService.customizeSelectedIndex_custom.value.name + ' account ' + this.tradeNowList['accountId'];
    this.sharedData.userEventTrack('Custom Indexing', tp, tp, 'Index Factsheet Trade now Click');
    if (this.tradeData.type == "CI") { this.openTrade(this.tradeData.data); }
    else if (this.tradeData.type == "DI") { this.openTradeDI(this.tradeData.data) }
  }

  openTrade(dd:any) {
    this.sharedData.showMatLoader.next(false);
    var fillNotifyData = this.sharedData.getNotificationQueue.value.map((a:any) => ({ ...a })).filter((x:any) => dd.id == x.slid);
    if (fillNotifyData.length > 0 && fillNotifyData[0]['notifyStatus'] == "E") {
      this.sharedData.selTradeData.data = [dd];
      this.sharedData.selTradeData.accountInfo = [dd];
      this.sharedData.selTradeData.type = "CI";
      this.dialogController.openTrade(TradeOpenComponent);
    } else if (isNullOrUndefined(this.sharedData.getNotificationQueue.value) || this.sharedData.getNotificationQueue.value.length == 0) {
      this.toastr.info('Please wait trade data initializing...', '', { timeOut: 5000 });
    } else { $('#viewQueueModal').modal('show'); };
  }

  openTradeDI(d: any) {
    this.sharedData.selTradeData.data = [d];
    this.sharedData.selTradeData.accountInfo = [d];
    this.sharedData.selTradeData.type = "DI";
    // this.dialogController.openTrade(rebalanceStrategiesComponent);
    this.dialogController.openTrade(TradeOpenComponent);
  }

  //loadeBarChart() {
  //  var that = this;
  //  let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
  //  var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
  //  var endDate:any = formatDate(basedata['allocDate'], 'yyyy/MM/dd', 'en-US');
  //  var data: any = { "id": basedata['id'], "enddate": endDate, "indexType": "", "userid": userid };
  //  this.dataService.DIfactsheetSectordataAPI(data).subscribe((res: any) => {
  //    setTimeout(() => { that.barChart(res); });
  //  },
  //    (error: any) => { })
  //}

  openProposalModal() {
    if (this.showLoad2) { } else {
      $('#Proposal_Modal').modal('show');
      $('.modal-backdrop').remove();
      this.Preparedby = "";
      this.Preparedfor = "";
      this.isOpen = false;
    }
  }

  omit_special_char(e: any) {

    if ((e.charCode >= 97 && e.charCode <= 122) || (e.charCode >= 65 && e.charCode <= 90) || (e.charCode==32)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }
  digitFormat(d: any) { return d3.format(",.2f")(d) }
  format(d: any) { return d3.format(",.2f")(d) }
  barChart(barchartData:any) {
    var that = this;
    var series:any = [];
    var categories: any = [];
    var data1: any = [];
    var data2: any = [];
    if (isNotNullOrUndefined(barchartData) && barchartData.length > 0) {
      [...barchartData].forEach((x: any) => {
        categories.push((isNotNullOrUndefined(x['title']) ? x['title'] : ''))
        data1.push((isNotNullOrUndefined(x['value1']) ? parseFloat(x['value1']) : 0))
        data2.push((isNotNullOrUndefined(x['value2']) ? parseFloat(x['value2']) : 0))
      });
      if (data1.length > 0) { series.push({ 'name': (isNotNullOrUndefined(barchartData[0]['indexName']) ? barchartData[0]['indexName'] : ''), 'data': data1, 'color': 'var(--prim-button-color)' }); };
      if (data2.length > 0) { series.push({ 'name': (isNotNullOrUndefined(barchartData[0]['bmName']) ? barchartData[0]['bmName'] : ''), 'data': data2, 'color': '#9999ab' }); };
    }


    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
    Highcharts.chart({
      chart: {
        renderTo: 'barChartBuyModel_popup1',
        type: 'bar',
        zooming: {
          mouseWheel: false
        },
      },
      title: { text: "" },
      subtitle: { text: "" },
      xAxis: {
        zoomEnabled: false,
        categories: categories,
        title: { text: 'Sector' }
      },
      yAxis: {
        zoomEnabled: false,
        min: 0,
        lineColor: 'transparent',
        gridLineColor: 'transparent',
        title: { text: 'Weight' },
        labels: { overflow: 'justify' }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' +
            this.series.name + ': ' + that.format(this.y) + '%'
        }
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: false,
            color: 'var(--leftSideText)',
            borderWidth: 0,
          }
        },
        bar: {
          dataLabels: {
            enabled: false
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        floating: true,
        borderWidth: 0,
        backgroundColor: 'transparent',
        shadow: false,
        itemStyle: {
          fontSize: '0.55rem',
        },
      },
      credits: { enabled: false },
      series: series
    });
  }

  getBarchart(payload:any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var assetid = (isNotNullOrUndefined(payload['assetid'])) ? payload['assetid'] : 0;
    var data: any = {
      "name1": this.cusindexShortName,
      "name2": this.cusindexBM_Name,
      "accountid": accID,
      "assetid": assetid,
      "enddate": (isNotNullOrUndefined(payload['enddate'])) ? payload['enddate'] : 0,
      "holdingdate": (isNotNullOrUndefined(payload['enddate'])) ? payload['enddate'] : 0,
      "indexId": (isNotNullOrUndefined(payload['indexId'])) ? payload['indexId'] : 0,
      "freqflag": (isNotNullOrUndefined(payload['freqflag'])) ? payload['freqflag'] : 0,
      "notifyid": (isNotNullOrUndefined(payload['notifyid'])) ? payload['notifyid'] : 0,
      "strategyId": (isNotNullOrUndefined(payload['strategyId'])) ? payload['strategyId'] : 0,
      "tenYrFlag": (isNotNullOrUndefined(payload['tenYrFlag'])) ? payload['tenYrFlag'] : 0,
      "userid": userid,
      "barcharttype": this.sharedData.checkBarChartType(assetid),
    };
    
    this.sharedData.checkSectorWeigth(data).then((res: any) => { this.barChart(res); });
  }

  checkUpdateBtnEnable(d: any) {
    var dDate: any;
    var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
    if (etfInd.length > 0) {
      dDate = formatDate(etfInd[0]['holdingsdate'], 'yyyy/MM/dd', 'en-US');
    } else {
      dDate = formatDate(this.sharedData.GetSchedularMaster.value[0]['LipperHoldingDt'], 'yyyy/MM/dd', 'en-US');
    }
    if (isNotNullOrUndefined(this.asOfDate) && this.asOfDate !='') {      
      var fdDate = formatDate(this.asOfDate, 'yyyy/MM/dd', 'en-US');
      if (new Date(dDate).getTime() == new Date(fdDate).getTime()) { return false; } else { return true; }
    } else { return false; }
  }

 
  updateFactsheet() {
    var d = this.cusIndexService._currentSList;
    var slid: number = (isNotNullOrUndefined(d.id)) ? d.id : 0;
    var erfflag: string = (isNotNullOrUndefined(d.erfflag)) ? d.erfflag : 'N';
    var ds: any = new Date(this.sharedData.equityHoldDate);
    var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
    if (etfInd.length > 0) { ds = new Date(etfInd[0]['holdingsdate']); }
    var date = ds.getFullYear() + '-' + this.sharedData.formatedates(ds.getMonth() + 1) + '-' + this.sharedData.formatedates(ds.getDate());
    var freqflag: string = (isNotNullOrUndefined(d.rebalanceType)) ? d.rebalanceType : this.sharedData.defaultRebalanceType;
    this.sharedData.UpdatePostNotification(slid, erfflag, date, freqflag);
    this.cusIndexService.showReviewIndexLoaded.next(false);
    this.cusIndexService.updateBtnTrigger.next(true);
    this.cusIndexService.selectedCIIndFactsheet.next(undefined);
  }
  isOpenComponent = false;
  isRight = true;
  // iconClass = 'fas fa-angle-left';
  toggleSidebar() {
    this.isOpenComponent = !this.isOpenComponent;
    // this.iconClass = this.iconClass === 'fas fa-angle-left' ? 'fas fa-angle-right' : 'fas fa-angle-left';
    if (this.isOpenComponent) {
      this.isRight = !this.isRight;
    }
  }

  downloadHoldingsExcel() {
    var accID = this.cusIndexService.selectedCIIndFactsheet.value;
    var currentList = this.cusIndexService.currentSList.value;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var d: any = (isNotNullOrUndefined(currentList.endDate)) ? new Date(currentList.endDate) : new Date();
    var date = d.getFullYear() + '-' + this.sharedData.formatedates(d.getMonth() + 1) + '-' + this.sharedData.formatedates(d.getDate());
    var data: any = [{
      "accountId": accID,
      "slid": (isNotNullOrUndefined(currentList.id)) ? currentList.id:0,
      "userid": parseInt(userid),
      "status": "A",
      "enddate": date,
      "freqflag": isNullOrUndefined(currentList['rebalanceType']) ? currentList['rebalanceType'] : 'q',
      "tenYrFlag": 1,
      "erfflag": (isNotNullOrUndefined(currentList.erfflag)) ? currentList.erfflag : 'N',
    }];

      var getHNotificationQueue: any = this.sharedData.getHNotificationQueue.value;
      var HisPostNotifyData: any = [{ "accountId": accID, "userid": parseInt(userid), "slid": ((isNotNullOrUndefined(currentList.id)) ? currentList.id : 0) }];
      var notifyDt = [...getHNotificationQueue].filter((x: any) => x['slid'] == data[0]['slid'] && x['accountId'] == accID);
      if (notifyDt.length == 0) { this.sharedData.PostStrategyHNotification(data); }
      else {
          this.sharedData.checkHisPostNotify(HisPostNotifyData).then((res: any) => {
            if (isNotNullOrUndefined(notifyDt[0]['notifyStatus']) && notifyDt[0]['notifyStatus'] != 'E') {
              this.toastr.success('This holdings history is already in queue.', '', { timeOut: 5000, positionClass: "toast-top-center" });
              this.sharedData.openNotification.next(true);
            } else if (isNullOrUndefined(res)) { this.sharedData.PostStrategyHNotification(data); }
              else if (res.length > 0 && isNotNullOrUndefined(res[0]['factsheetAvail']) && isNotNullOrUndefined(res[0]['notifyId']) && res[0]['factsheetAvail'] == 'N' && res[0]['notifyId'] == 0) { this.sharedData.PostStrategyHNotification(data); }
              else if (isNotNullOrUndefined(res) && res.length > 0 && isNotNullOrUndefined(res[0]['factsheetAvail']) && res[0]['factsheetAvail'] == 'Y') {
                  this.sharedData.PostStrategyHNotification(data);
              } else {
                  if (isNotNullOrUndefined(notifyDt[0]['notifyStatus']) && notifyDt[0]['notifyStatus'] == 'E') {
                      this.downloadHis(notifyDt[0]);
                  } else {
                    this.toastr.success('This holdings history is already in queue.', '', { timeOut: 5000, positionClass: "toast-top-center" });
                    this.sharedData.openNotification.next(true);
                  }
              }
          });
      }
    this.sharedData.userEventTrack('Custom Indexing', 'Holdings History', (currentList['name'] + " Account id:" + accID), 'Export Holdings History Click');
  }

  downloadHis(d: any) {
    var that = this;
    var dt = new Date();
    let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
    var indexId = 123;
    if (ETFIndex.length > 0) { dt = new Date(ETFIndex[0]['holdingsdate']); }
    else {
      indexId = this.cusIndexService.getIndexId(d);
      dt = new Date(this.sharedData.equityHoldDate);
    };
    var date = dt.getFullYear() + '-' + that.sharedData.formatedates(dt.getMonth() + 1) + '-' + that.sharedData.formatedates(dt.getDate());
    var data = {
      "accountId": d['accountId'],
      "notifyid": d['notifyId'],
      "assetid": d['assetId'],
      "userid": userid,
      "strategyId": d['slid'],
      "enddate": date,
      "tenYrFlag": d['tenYrFlag'],
      "indexId": indexId,
      "freqflag": d['freqflag']
    };
    var account: string = '';
    if (parseInt(d['accountId']) > 0) { account = ((isNotNullOrUndefined(this.clickedAccountDetails['accountVan']) ? this.clickedAccountDetails['accountVan'] : "") + " (" + (isNotNullOrUndefined(this.clickedAccountDetails['accountTitle']) ? this.clickedAccountDetails['accountTitle'] : "") + ")"); }
    this.sharedData.downloadHisExcel(data, d, account);
  }

  downloadHisReturn() {
    var that = this;
    var currentList = this.cusIndexService.currentSList.value;
    var getAccId = parseInt(that.cusIndexService.selectedCIIndFactsheet.value);
    var notifyDt = [...this.sharedData._getNotificationQueue].filter((x: any) => x['slid'] == currentList['id'] && x['accountId'] == getAccId);
    if (notifyDt.length > 0) {
      var data: any = {
        "acctid": getAccId,
        "notifyid": notifyDt[0]['notifyId'],
        "assetid": notifyDt[0]['assetId'],
        "slid": notifyDt[0]['slid']
      };
      var account: string = '';
      if (getAccId > 0) { account = ((isNotNullOrUndefined(this.clickedAccountDetails['accountVan']) ? this.clickedAccountDetails['accountVan'] : "") + " (" + (isNotNullOrUndefined(this.clickedAccountDetails['accountTitle']) ? this.clickedAccountDetails['accountTitle'] : "") + ")"); }
      this.sharedData.downloadHisReturn(data, account)
    }
    this.sharedData.userEventTrack('Custom Indexing', 'Returns History', (currentList['name'] + " Account id:" + getAccId), 'Export Returns History Click');
  }

}
