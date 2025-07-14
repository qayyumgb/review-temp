import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { descending, format, sum } from 'd3';
import { Subscription, first, interval, switchMap } from 'rxjs';
declare var $: any;
// @ts-ignore
import { saveAs } from "file-saver";
import { Workbook } from 'exceljs';
import { DatePipe } from '@angular/common';
import { DataService } from '../../core/services/data/data.service';
import { LoggerService } from '../../core/services/logger/logger.service';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../core/services/moduleService/account.service';
import { IndexstepService } from '../../core/services/indexstep.service';
const emptyData: any = [];
@Component({
  selector: 'app-trade-direct',
  templateUrl: './trade-direct.component.html',
  styleUrl: './trade-direct.component.scss'
})
export class TradeDirectComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['CompanyName', 'Ticker', 'Weight', 'Price', 'Quantity'];
  displayedTradeColumns: string[] = ['Company Name', 'Ticker', 'Action', 'Order Type', 'Price ($)', 'Quantity', 'Value'];
  selTab: any = 'trade';
  currentAccountInfo: any;
  companydataSource = new MatTableDataSource(emptyData);
  prevCompanydataSource = new MatTableDataSource(emptyData);
  tradeCompanydataSource = new MatTableDataSource(emptyData);
  currentAccList = [];
  rebalanceMsgkubData: any;
  showCloader: boolean = true;
  showDownloadBtn: boolean = false;
  checkRebTradeData: boolean = false;
  tradeBuyClicked: boolean = false;
  showSpinner_account: boolean = false;
  showSpinner_trade: boolean = false;
  clearIntervalAccountProgress: any;
  trade_progress = "(0s)";
  reloadBtnSH: boolean = false;
  showTradeBtn: boolean = false;
  timeOutCount: number = 0;
  timerInterval: any;
  tradeListsortedName: any;
  companyListsortedName_C: any;
  companyListsortedName_P: any;
  companysortedData: any;
  tradeListsortedData: any;
  ctH: any;
  showTradetxt: string = '';
  C_AccountDetails: any;
  C_FullAccountDetails: any;
  clickedList: any;
  asOfDate: any;
  accList_name: any;
  dMyIndexMnthlyHPtradePayload: any;
  subscriptions = new Subscription();
  constructor(private datepipe: DatePipe, private dialogref: MatDialogRef<TradeDirectComponent>, public dialog: MatDialog, public indexService: IndexstepService,
    private dataService: DataService, public dirIndexService: DirectIndexService, public cusIndexService: CustomIndexService,
    public sharedData: SharedDataService, private toastr: ToastrService, private logger: LoggerService,
    public accountService: AccountService,) { }
  @ViewChild(MatSort) sort: MatSort | any;  
  @HostListener('scroll', ['$event'])
  ngAfterViewInit() { }

  ngOnInit() {
    var that = this;
    this.showCloader = true;
    try {
      this.currentAccList = this.sharedData.selTradeData.accountInfo;      
      that.locktrade();
      that.checkTradingHours();
      that.prevCompanydataSource = new MatTableDataSource(emptyData);
      that.companydataSource = new MatTableDataSource(emptyData);
      that.tradeCompanydataSource = new MatTableDataSource(emptyData);
      if (isNotNullOrUndefined(this.currentAccList) && this.currentAccList.length > 0) {
        this.currentAccountInfo = this.currentAccList[0];
        this.getRebalanceMsgDTkub();
      }
    } catch (e) { console.log(e) }
  }

  locktrade() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.sharedData.selTradeData.accountInfo.forEach((d: any) => {
      var AccId = d.accountId;
      var slid = 0;
      var data = { "accountId": AccId, "userid": userid, "slid": slid, "status": "Y" };
      this.dataService.PostLockAcc(data).pipe(first()).subscribe((res: any[]) => { });
    });
  }

  getRebalanceMsgDTkub() {
    var that = this;
    var dt = this.sharedData.selTradeData.accountInfo;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var accountId: any = (isNotNullOrUndefined(dt) && dt.length > 0 && isNotNullOrUndefined(dt[0]['accountId'])) ? dt[0]['accountId'] : 0;
    var datas: any = { "userid": parseInt(userid), "accountId": parseInt(accountId) };
    var reb = this.dataService.RebalanceMsgDTkub(datas).pipe(first()).subscribe((data: any) => {
      this.showCloader = false;
      this.rebalanceMsgkubData = data;
      if (this.sharedData.checkServiceError(data) || JSON.stringify(data).indexOf("Error converting value") > -1) {
        that.showSpinner_account = false;
        this.logger.logError(data, 'RebalanceMsgDTkub');
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
      this.showCloader = false;
      this.showDownloadBtn = false;
      that.companydataSource = new MatTableDataSource(emptyData);
      that.tradeCompanydataSource = new MatTableDataSource(emptyData);
      that.showSpinner_account = false;
      this.logger.logError(error, 'RebalanceMsgDTkub');
      this.tradeBuyClicked = false;
      $('#showMatLoaderTrades').hide();
    });
    this.subscriptions.add(reb);
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
        this.getRebalanceMsgDTkub();
        if (isNotNullOrUndefined(this.currentAccountInfo) && isNotNullOrUndefined(this.currentAccountInfo['accountId']) && this.currentAccountInfo['accountId'] > 0) {
          this.getPrevPortfolio(this.currentAccountInfo['accountId'], this.currentAccountInfo.id);
        }
      }
    }, 1000);
    if (isNotNullOrUndefined(that.tradeCompanydataSource.data) && that.tradeCompanydataSource.data.length == 0) {
      that.timeOutCount = 0;
      that.reloadBtnSH = false;
      clearInterval(that.timerInterval);
    }
  }

  reviewTrade() { this.getRebalanceMsgDTkub(); };

  getPrevPortfolio(acc: any, slId: any) {
    var that = this;
    that.prevCompanydataSource = new MatTableDataSource(emptyData);
    var GetTradeAccountPortfolio = that.dataService.GetTradeAccountPortfolio(acc, slId).pipe(first()).subscribe((res: any) => {
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

  checkTradeListData() {
    var that = this;
    that.companydataSource = new MatTableDataSource(emptyData);
    that.tradeCompanydataSource = new MatTableDataSource(emptyData);
    var currentAccountInfo_Liq = this.currentAccList[0];
    try {
      if (isNotNullOrUndefined(this.rebalanceMsgkubData) && isNotNullOrUndefined(this.rebalanceMsgkubData[0]['trades'])) {
        var tabdata_tradeList = this.rebalanceMsgkubData[0]['trades'];
        if (tabdata_tradeList.length > 0 && this.currentAccountInfo['accountId'] != 0 && isNotNullOrUndefined(tabdata_tradeList[0]['accountNo'])) {
          tabdata_tradeList = this.rebalanceMsgkubData[0]['allocation'].filter((xu: any) => xu['accountNo'] == this.currentAccountInfo['accountNo']);
          if (this.sharedData.selTradeData.accountInfo.length == 1) { tabdata_tradeList = this.rebalanceMsgkubData[0]['trades'] };
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
        that.companydataSource = new MatTableDataSource(tabdata);       
        that.getPrevPortfolio(currentAccountInfo_Liq['accountId'], 0);
       
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
    this.prevCompanydataSource.data = this.companysortedData;
  }

  compare(a: any, b: any, isAsc: any) { return (a < b ? -1 : 1) * (isAsc ? 1 : -1); };

  closecommon_progress() {
    var that = this;       
    setTimeout(function () { that.showSpinner_trade = false; }, 100);
  }

  checkShowMatTableTradeList(tabData: any) {
    if (isNotNullOrUndefined(tabData.data) && tabData['data'].length > 0) { return true } else { return false }
  }

  showDownladBtn() {
    if (isNotNullOrUndefined(this.companydataSource.data) && this.companydataSource.data.length > 0) {
      this.showDownloadBtn = true;
    } else { this.showDownloadBtn = false; }
  }

  closeModal() { this.dialogref.close(); };

  PostUpdateTradetimeSub: any;
  PostUpdateTradetime() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    let slid = this.currentAccountInfo['id'];
    var dt = this.sharedData.selTradeData.accountInfo;
    var data: any = [];
    dt.forEach((d: any) => { data.push({ "accountId": d['accountId'], "slid": slid, "userid": userid }); });
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
    try { this.PostUpdateTradetimeSub.unsubscribe(); } catch (e) { }
    try {
      clearInterval(that.timerInterval);
      clearInterval(that.ctH);
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      this.sharedData.selTradeData.accountInfo.forEach((d: any) => {
        var AccId = d.accountId;
        var slid = 0;
        var data = { "accountId": AccId, "userid": userid, "slid": slid, "status": "N" };
        that.dataService.PostLockAcc(data).pipe(first()).subscribe((res: any[]) => { });
      });
    } catch (e) { }
    that.tradeListsortedName = undefined;
    that.companyListsortedName_C = undefined;
    that.companyListsortedName_P = undefined;
    this.sharedData.getNotificationDataReload();
    this.sharedData.getTradeNotificationDataReload();
    this.sharedData.getHNotificationDataReload();
    this.subscriptions.unsubscribe();
    that.timeOutCount = 0;
    this.sharedData.selTradeData.tradeType = 0;
    this.sharedData.immediateLiquidate.next(false);
    this.sharedData.showMatLoader.next(false);
    this.sharedData.triAccTrade.next(true);
  }

  PostCompData: any = [];
  tradeBuy() {
    $('#showMatLoaderTrades').show();
    this.tradeBuyClicked = true;
    clearInterval(this.timerInterval);
    try {
      var strId = 0;
      strId = this.sharedData.selTradeData.accountInfo[0]['accountId']; 
      var tp = 'Buy strId' + strId;
      this.sharedData.userEventTrack('Direct Trade', tp, tp, 'Buy Click');
    } catch (e) { }

    var dt = this.sharedData.selTradeData.accountInfo;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (dt.length > 0) {
      var data = { "userid": parseInt(userid), "accountId": parseInt(dt[0]['accountId']) };
      this.PostCompData = [];
      var PostCompanies = this.dataService.PostDTCompanies(data).pipe(first()).subscribe((data: any) => {
        if (this.sharedData.checkServiceError(data)) {
          this.toastr.success('Trading not initiated. Please try again.', '', { timeOut: 4000 });
        } else {
          if (data.length > 0) { this.PostCompData = data[0]; }
          this.ProcessConsolidatedTrade();
          if (data.length > 1) { this.toastr.success(data[1], '', { timeOut: 6000 }); }
        }
      }, (error: any) => {
        this.logger.logError(error, 'PostCompanies');
        this.tradeBuyClicked = false;
        $('#showMatLoaderTrades').hide();
        this.toastr.success('Trading not initiated. Please try again.', '', { timeOut: 4000 });
      });
      this.subscriptions.add(PostCompanies);
    }
  }

  ProcessConsolidatedTrade() {
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
    this.accountService.getAccountDt(this.currentAccountInfo['accountId']);
  }

  checkAccReload(data: any) {
    this.dirIndexService.GetStrListDashAccs();
    this.sharedData.getTradeNotificationDataReload();
    this.sharedData.refreshAlreadytradedStrategy.next(true);
    if (data.length == 1) { this.accountService.getAccountDt(data[0]['accountId']); }
    else { this.accountService.getAccountDt(0); }
   
  }

  checkShowMatTable(tabData: any) {
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
    if (this.checkShowMatTable(this.prevCompanydataSource) || this.checkShowMatTable(this.companydataSource)) {
      this.tradeViewDownload1(this.currentAccList,this.companydataSource.data, this.prevCompanydataSource.data);
    }
    try {
      var accId = 'account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Direct Trade', "Holding Download click", accId, accId);
    } catch (e) { }
  }

  checkSHaccInfo() {
    if (isNotNullOrUndefined(this.currentAccountInfo) &&
      isNotNullOrUndefined(this.currentAccountInfo['accountId']) &&
      this.currentAccountInfo['accountId'] > 0) { return true } else { return false }
  }

  tradeTrack(tab: string) {
    try {
      var accId = 'account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Direct Trade', "tab click", accId, tab);
    } catch (e) { }
  }

  tradeDownloadList() {
    var that = this;
    var resData = this.tradeCompanydataSource.data;
    var flName: string = "";
    let new_workbook = new Workbook();
    var ws: any;
      flName = this.currentAccList[0]['accountVan'];
      flName = flName.replace(" ", "_");
    ws = new_workbook.addWorksheet(flName);
    ws.addRow(['Account', flName]);
      ws.addRow([]);

    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, item.buyOrSell, that.sharedData.numberWithCommas(item.price), that.sharedData.numberWithCommas(item.noofShares), that.sharedData.numberWithCommas(parseFloat(item.value).toFixed(2))]); });

    var header = ws.addRow(['Company Name', 'Ticker', 'Action', 'Price ($)', 'Quantity', 'Value ($)'])
    header.font = { bold: true };
    tabBody.forEach((d: any) => { ws.addRow(d) });    
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
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_Trade_List_" + this.datepipe.transform(d, 'yyyyMMdd') + '_' + this.datepipe.transform(d, 'hhmmss');
    new_workbook.xlsx.writeBuffer().then((data: any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
    try {
      var accId = 'account' + this.currentAccountInfo['accountId'];
      this.sharedData.userEventTrack('Direct Trade', "Trade List Download Click", accId, accId);
    } catch (e) { }
  }

  tradeViewDownload1(dte: any, resData: any, prevResData: any) {
    var that = this;
    var flName = dte[0]['accountVan'];
    let new_workbook = new Workbook();
    if (resData.length > 0) {
      var ws = new_workbook.addWorksheet("Current portfolio");
      var name: any;
      var date: any;
      //ws.addRow([]);
      
        name = dte[0]['accountVan'];
        ws.addRow(['Name', name]);
        ws.addRow(['Account', name]);
        ws.addRow(['Market Value ($)', format(",.2f")(sum(resData, (d: any) => (d.price * d.noofShares)))]);
      
      ws.addRow([]);

      var tabBody: any = [];
      resData.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, that.sharedData.formatWt_percentage(item.weight * 100), that.sharedData.numberWithCommas(item.price), that.sharedData.numberWithCommas(item.noofShares)]); });

      var header = ws.addRow(['Company Name', 'Ticker', 'Weight', 'Price ($)', 'Quantity'])
      header.font = { bold: true };
      //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
      tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }
    }
    if (prevResData.length > 0) {
      var name1: any;
      var date1: any;
      var ws1 = new_workbook.addWorksheet("Previous portfolio");
      name1 = dte[0]['accountVan'];
      date1 = this.sharedData.dateFormate(prevResData[0]['dateofTrade']);
        ws1.addRow(['Name', name1]);
        ws1.addRow(['Date of Traded', date1]);
        ws1.addRow(['Account', name1]);
        ws1.addRow(['Market Value ($)', format(",.2f")(sum(prevResData, (d: any) => (d.price * d.noofShares)))]);
     
      ws1.addRow([]);
      var tabBody1: any = [];
      prevResData.forEach((item: any) => { tabBody1.push([item.companyName, item.ticker, that.sharedData.formatWt_percentage(item.weight * 100), that.sharedData.numberWithCommas(item.price), that.sharedData.numberWithCommas(item.noofShares)]); });

      var header = ws1.addRow(['Company Name', 'Ticker', 'Weight', 'Price ($)', 'Quantity'])
      header.font = { bold: true };
      //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
      tabBody1.forEach((d: any, i: any) => { ws1.addRow(d) });
      ws1.addRow([]);
      ws1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

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
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_Trade_Holdings_" + this.datepipe.transform(d, 'yyyyMMdd') + '_' + this.datepipe.transform(d, 'hhmmss');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  netValue(data: any, key: any) {
    var buy, sell;
    buy = sum(data, function (d: any) { if (d.buyOrSell == 'Buy') { return d[key]; } });
    sell = sum(data, function (d: any) { if (d.buyOrSell == 'Sell') { return d[key]; } });
    return this.checkValPrice(buy - sell);
  }

  checkValPrice(val: any) { if (isNullOrUndefined(val)) { return "-" } else { return format("$,.2f")(val); } };
  TradeListTrackBy: any = (_index: number, item: any) => { return item.stockkey; };
  checkTL_ValueColor(val: any) { if (val.buyOrSell == 'Buy') { return true; } else { return false; } }
  functionPercentage(x: any) { if (x.toFixed(0) != 98) { return false; } else { return true; }; }
  function(x: any) { if (x.toFixed(0) != 98) { return true; } else { return false; } }
  convert2digits(val: any, id: any) {
    if (isNullOrUndefined(val)) { return 0; } else {
      if (id == 17) { return this.billionconverter(val); } else { return parseFloat(val).toFixed(1); };
    }
  }

  checkFac_per(p: any) { if (p == 19 || p == 17 || p == 9 || p == 1 || p == 10 || p == 4 || p == 12) { return false; } else { return true; } }

  CurrencyFormat(val: any) {
    return Math.abs(Number(val)) >= 1.0e+12
      ? (Math.abs(Number(val)) / 1.0e+12).toFixed(2) + " T" : Math.abs(Number(val)) >= 1.0e+9
        ? (Math.abs(Number(val)) / 1.0e+9).toFixed(1) + " B" : Math.abs(Number(val)) >= 1.0e+6
          ? (Math.abs(Number(val)) / 1.0e+6).toFixed(1) + " M" : Math.abs(Number(val)) >= 1.0e+3
            ? (Math.abs(Number(val)) / 1.0e+3).toFixed(1) + " K" : Math.abs(Number(val));
  }

  billionconverter(d: any) { let ActVal = d * 100000; return this.CurrencyFormat(ActVal).toString(); };
  convert2width(start: any, end: any) {
    var st: any = start;
    var en: any = end;
    var wid = parseInt(st) - parseInt(en);
    return wid;
  }

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
    $(".table-fixed-column-inner").on('scroll', function (ev: any) {
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

}
