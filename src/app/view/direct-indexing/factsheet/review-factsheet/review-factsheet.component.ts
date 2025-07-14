import { Component,ViewChild,ElementRef,HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../../core/services/data/data.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { CustomIndexService, PostStgyAccDt } from '../../../../core/services/moduleService/custom-index.service';
import { descending, format } from 'd3';
import { TradeOpenComponent } from '../../../trade-open/trade-open.component';
import { DialogControllerService } from '../../../../core/services/dialogContoller/dialog-controller.service';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonErrorDialogComponent } from '../../error-dialogs/common-error-dialog/common-error-dialog.component';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { formatDate } from '@angular/common';
import * as d3 from 'd3';
declare var $: any;
@Component({
  selector: 'app-review-factsheet',
  templateUrl: './review-factsheet.component.html',
  styleUrl: './review-factsheet.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReviewFactsheetComponent {
  taxOptFlage: boolean = false;
  taxOptFactSheet: boolean = false;
  taxOptFactSheetCal: boolean = false;
  checkverify_trade: boolean = false;
  sectorWeightLoader: boolean = false;
  enableTaxPerformance: boolean = true;
  enableTaxCalendar: boolean = true;
  clickedAccountDetails: any;
  seltabname: string = "";
  @ViewChild('calendarYearReturns', { read: ElementRef }) public calendarYearReturns: ElementRef<any> | any;
  @ViewChild('taxGainLoss', { read: ElementRef }) public taxGainLoss: ElementRef<any> | any;
  @HostListener('scroll', ['$event'])
  showSpinner_factsheet: boolean = false;
  direct_progress = "(0s)";
  clearIntervalProgress: any;
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
    } else{
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
    var getAccId = that.dirIndexService._selectedDirIndFactsheet;
    var slidNo = this.dirIndexService._selectedDirIndStry[0].id;
    if (check == true) {
      that.checkverify_trade = true;
      that.dirIndexService.enableTrading_factsheet.next("Y");
      this.dirIndexService.saveEnableTradingDI(slidNo, getAccId);
    }
    else {
      that.checkverify_trade = false;
      that.dirIndexService.enableTrading_factsheet.next("N");
      this.dirIndexService.saveEnableTradingDI(slidNo, getAccId);
    }

    if (check == true) {
      that.checkverify_trade = true;
      that.toastr.success(that.sharedData.checkMyAppMessage(0, 17), '', { timeOut: 4000, positionClass: "toast-top-center" });
    }
    else {
      that.checkverify_trade = false;
      that.toastr.success(that.sharedData.checkMyAppMessage(0, 18), '', { timeOut: 4000, positionClass: "toast-top-center" });
    }

    this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + getAccId), ("Account id:" + getAccId), 'Enable For Trading Btn clicked');
  }

  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dirIndexService: DirectIndexService, private logger: LoggerService,
    private dataService: DataService, public cusIndexService: CustomIndexService, private httpClient: HttpClient, private dialogController: DialogControllerService, public dialog: MatDialog,private toastr: ToastrService) { }

  showTradeBtn: boolean = false;
  ngOnInit() {
    var that = this;
    var selectedDirIndFactsheet_sub = this.dirIndexService.selectedDirIndFactsheet.subscribe((res: number) => {

      if (isNotNullOrUndefined(res) && res > 0) { this.showTradeBtn = true; } else { this.showTradeBtn = false; }
      this.loadFactsheet();
    });
    var move_defaultAccount = this.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(selectedDirIndFactsheet_sub);
    this.subscriptions.add(move_defaultAccount);
    var revIndClickedData = that.dirIndexService.reviewIndexClickedData.subscribe((data:any) => {
      this.loadFactsheet()
    });
    that.subscriptions.add(revIndClickedData);
    if (this.dirIndexService.selectedDirIndFactsheet.value == 0 && that.dirIndexService.notifyDiClick.value) {
      var taxharvestData_DirectIndex = this.dirIndexService.taxharvestData_DirectIndex.subscribe((res: any) => { this.loadFactsheet(); });
      this.subscriptions.add(taxharvestData_DirectIndex);
      var directIndexData = this.dirIndexService.directIndexData.subscribe((res: any) => { this.loadFactsheet(); });
      this.subscriptions.add(directIndexData);
    }

    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe(x => {
      if (x) {
        that.sharedData.refreshAlreadytradedStrategy.next(false);
        that.sharedData.getNotificationDataReload();
        that.checkAlreadytradedStrategy(true);
        setTimeout(function () { that.sharedData.showMatLoader.next(false); }.bind(this), 1000);
      };
    });
    this.subscriptions.add(refreshAlreadytradedStrategy);

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
  cusindexNameTicker: string = "";
  cusshortName: string = "";
  loadFactsheet() {
    var that = this;
    this.startProgressLoader();
    that.enableTaxPerformance = true;

    that.enableTaxCalendar = true;
    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    //console.log(basedata,'basedata')
    that.seltabname = '';
    if (isNotNullOrUndefined(basedata.basedon)) { this.cusindexNameTicker = basedata.basedon; }
    if (isNotNullOrUndefined(basedata.name)) { this.cusindexName = basedata.name; }
    if (isNotNullOrUndefined(basedata['shortname']) && basedata['pbGroupType'] == 'ETFName') {
      this.cusshortName = basedata['shortname'];
    }
    else if (isNotNullOrUndefined(basedata['basedon']) && basedata['pbGroupType'] == 'Index') {
      this.cusshortName = basedata['basedon'];
    } else {
      if (isNotNullOrUndefined(basedata.shortname)) { this.cusshortName = basedata.shortname; }
    }

    if (isNotNullOrUndefined(basedata['taxEffAwareness']) && basedata['taxEffAwareness'] == 'Y') { this.taxOptFlage = true; } else { this.taxOptFlage = false; }

    if (this.dirIndexService.selectedDirIndFactsheet.value == 0) {
      var resData: any = that.dirIndexService.taxharvestData_DirectIndex.value;
      this.checkOpt(resData);
      this.factsheetPerfData = [...resData];
      this.taxGL(resData);
      that.update_perfasofDate(resData);
      this.formatPerfData(resData);
      if (isNotNullOrUndefined(resData) && resData.length > 0 && isNotNullOrUndefined(resData[0]['graphvalues'])) {
        setTimeout(function () { that.formatCharData(resData[0]['graphvalues']); }, 1000);
      }
      var gridData: any = this.dirIndexService.directIndexData.value;
      gridData = gridData.sort(function (x: any, y: any) { return descending((x.weight), (y.weight)); });
      if (this.sharedData.checkMenuPer(12, 187) == "Y") { this.bldMyIndexMntHPortfolioData = [...gridData].slice(0, 10); }
      else { this.bldMyIndexMntHPortfolioData = [...gridData]; }
      //this.bldMyIndexMntHPortfolioData = [...gridData];
      that.right_spinner_off();
      if (isNotNullOrUndefined(gridData) && gridData.length > 0) { this.checkPriceDate(gridData[0]); }
    } else {
      var d = new Date(this.sharedData.equityHoldDate);
      var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == basedata['assetId']);
      if (etfHoldDate.length > 0) { d = new Date(etfHoldDate[0]['holdingsdate']); } else { d = new Date(this.sharedData.equityHoldDate); }
      var indexId: number = 123;
      if (isNotNullOrUndefined(basedata['assetId'])) {
        var ind = this.cusIndexService.equityIndexeMasData.value.filter((x: any) => basedata['assetId'] == x['assetId']);
        if (ind.length > 0) { indexId = ind[0]['indexId'] }
      }

      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
      var accID = this.dirIndexService.selectedDirIndFactsheet.value;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == basedata.id && x.accountId == accID);
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      if (isNotNullOrUndefined(notifyId) && notifyId.length>0) {
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
        if (notifyId.length > 0) {
          that.clickedAccountDetails = that.dirIndexService._reviewIndexClickedData;
          that.seltabname = notifyId[0]['accountVan'];
        }
        this.GetTaxharvestData1(data);
        this.GetBuildMyIndexMnthlyHPortfolioCI(data);
      } else {
        /** Open error go to factsheet 0 **/
        this.openErrorComp();
      }
    }
    this.loadeBarChart();
    if (accID > 0) { this.GetDIEnabletradinglist(); }
    setTimeout(function () {
      that.sharedData.showCircleLoader.next(false);
      that.dirIndexService.notifyDiClick.next(false);
    }.bind(this), 100)
  }
  top10HoldingCheck() { if (this.sharedData.checkMenuPer(12, 187) == "Y") { return true } else { return false } };
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
  GetTaxharvestData1(data:any) {
    var that = this;
    try { this.GTharvestData_sub.unsubscribe(); } catch (e) { }
    this.GTharvestData_sub = this.dataService.GetTaxharvestSavedCIkub(data).pipe(first()).subscribe((res: any) => {
      this.checkOpt(res);
      this.factsheetPerfData = [...res];
      this.taxGL(res);
      this.formatPerfData(res);
      that.update_perfasofDate(res);
      that.right_spinner_off();
      if (isNotNullOrUndefined(res) && res.length > 0 && isNotNullOrUndefined(res[0]['graphvalues'])) {
        setTimeout(function () { that.formatCharData(res[0]['graphvalues']); }, 1000);
      }
    }, (error: any) => { this.factsheetPerfData = []; this.openErrorComp(); });
    this.subscriptions.add(this.GTharvestData_sub);
  }

  checkOpt(data: any) {
    var that = this;
    if (isNotNullOrUndefined(data) && data.length > 2) { that.taxOptFactSheet = true; that.taxOptFactSheetCal = true }
    else { that.taxOptFactSheet = false; that.taxOptFactSheetCal = false };
  }

  bldMyIndexMntHPortfolioData: any = [];
  GBIMHPortfolio_sub: any;
  GetBuildMyIndexMnthlyHPortfolioCI(data:any) {
    try { this.GBIMHPortfolio_sub.unsubscribe(); } catch (e) { }
    this.GBIMHPortfolio_sub = this.dataService.GetBuildMyIndexMnthlyHPSavedCIkub(data).pipe(first()).subscribe((res: any) => {
      res = res.sort(function (x: any, y: any) { return descending((x.weight), (y.weight)); });
      if (this.sharedData.checkMenuPer(12, 187) == "Y") { this.bldMyIndexMntHPortfolioData = res.slice(0, 10); }
      else { this.bldMyIndexMntHPortfolioData = res; }
      //this.bldMyIndexMntHPortfolioData = res;
      this.right_spinner_off();
      if (isNotNullOrUndefined(res) && res.length > 0) { this.checkPriceDate(res[0]); }
    }, (error: any) => {
      this.bldMyIndexMntHPortfolioData = [];
      this.taxGL([]);
      this.openErrorComp();
    });
    this.subscriptions.add(this.GBIMHPortfolio_sub);
  }
  right_spinner_off() {
    var that = this;
    if (that.bldMyIndexMntHPortfolioData.length > 0 && that.factsheetPerfData.length > 0) {
      //try {
      //  that.selectedStrategyName = that.cusIndexService.currentSList.value;
      //  that.createdDate_for = that.modifiedDate(that.cusIndexService.currentSList.value['createddate']);
      //  that.modifyDate_for = that.modifiedDate(that.cusIndexService.currentSList.value['modifieddate']);
      //} catch (e) { }
      setTimeout(function () {
        that.closecommon_progress();
        try {
          if (that.perfData.years.length > 0) {
            if ($(".calendarYearReturns").length > 0) { $(".calendarYearReturns").scrollLeft(0); }
            if ($(".taxGainLoss").length > 0) {
              $(".taxGainLoss").scrollLeft(0);
              if ($(".calendarYearReturns").scrollLeft() + $(".calendarYearReturns").innerWidth() >= ($(".calendarYearReturns")[0].scrollWidth) - 1) {
                $(".calendarYearReturns").addClass('widthExt1');
                $("#tableNavBuy").hide();
              };
            }
          }
        } catch (e) { };
        try {
          if ($(".taxGainLoss").length > 0 && $(".taxGainLoss").scrollLeft() + $(".taxGainLoss").innerWidth() >= ($(".taxGainLoss")[0].scrollWidth) - 1) {
            $(".taxGainLoss").addClass('widthExt1');
            $("#tableNavBuy2").hide();
          };
        } catch (e) { };
      }, 50)
    }
  }

  closecommon_progress() {
    var that = this;
    try { clearInterval(that.clearIntervalProgress); } catch (e) { }
    that.showSpinner_factsheet = false;
    that.direct_progress = "(0s)";
    //$('#buyBtnLdrModal').css('display', 'none');
    //$('.leftDivWrap').css('visibility', 'visible');
    that.dirIndexService.notifyDiClick.next(false);
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
          if (that.taxOptFactSheet) { afterTax.push(that.factsheetPerfData[2]['graphvalues'][i]['range']) }
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
      name: that.cusshortName,
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
        renderTo: 'lineChartBuyModel_dirIndex',
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

  showLoad: boolean = false;
  showLoad1: boolean = false;
  private API_URL = environment.api_url + '/Export/DIfactsheetdataAPI';
  private MethodologyAPI_URL = environment.api_url + '/Export/DIfactsheetMethodology';

  downloadMethodology() {
    var that = this;
    if (this.showLoad1) { } else {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var accID = this.dirIndexService.selectedDirIndFactsheet.value;
    var methodologyRequest = {
      'Userid': userid,
      'indexname': that.dirIndexService._customizeSelectedIndex_Direct.name,
      'accountId': accID,
      'strategyId': 0,
      'taxEffAwareness': ((isNotNullOrUndefined(that.dirIndexService._customizeSelectedIndex_Direct['taxEffAwareness']) && that.dirIndexService._customizeSelectedIndex_Direct['taxEffAwareness'] == 'Y') ? true : false)
    };

    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == basedata.id && x.accountId == accID);
    if (notifyId.length > 0) {
      methodologyRequest.strategyId = notifyId[0]['slid'];
      methodologyRequest.taxEffAwareness = (isNotNullOrUndefined(notifyId[0]['taxEffAwareness']) && notifyId[0]['taxEffAwareness'] == 'Y') ? true : false;
    }

    this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + accID), ("Account id:" + accID), 'review factsheet Methodology download');
    this.showLoad1 = true;
    this.httpClient.post(this.MethodologyAPI_URL, methodologyRequest, { observe: 'response', responseType: 'blob' }).pipe(first()).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = that.sharedData.downloadTitleConvert(that.dirIndexService._customizeSelectedIndex_Direct.name) + "_Methodology";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
      else {
        //this.toastr.info("Something went wrong.. please try again", '', {
        //  timeOut: 10000,
        //  positionClass: 'toast-top-center'
        //});
      }
      this.showLoad1 = false;
    }, (error: any) => {
      this.toastr.info('The file download is currently unavailable due to technical issues. Please try again.', '', {
        timeOut: 5000
      });
      this.showLoad = false;
    });
  }
}

  downloadPDF() {
    var that = this;
    if (this.showLoad) { } else {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accID = this.dirIndexService.selectedDirIndFactsheet.value;
      var holdingdate: string = that.dirIndexService._customizeSelectedIndex_Direct.holdingsdate;
      this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + accID), ("Account id:" + accID), 'review factsheet download');
      if (holdingdate != undefined) {
        holdingdate = holdingdate.substring(0, 10);
        holdingdate = holdingdate.replace('-', '').replace('-', '');
      } else { holdingdate = ""; };
      var barcharttype: any;

      var selIndex:any=that.dirIndexService._customizeSelectedIndex_Direct;
      var assetid: any = selIndex['assetId'];
      var indexId: number = 123;
      if (isNotNullOrUndefined(selIndex['assetId'])) {
        var ind = this.cusIndexService.equityIndexeMasData.value.filter((x: any) => selIndex['assetId'] == x['assetId']);
        if (ind.length > 0) { indexId = ind[0]['indexId'] }
      }

      var d = new Date();
      var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetid);
      if (etfHoldDate.length > 0) {
        d = new Date(etfHoldDate[0]['holdingsdate']);
        barcharttype = "ETF";
      } else {
        barcharttype = that.dirIndexService._customizeSelectedIndex_Direct.name;
        d = new Date(this.sharedData.equityHoldDate);
      }
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());

      var accID = that.dirIndexService._selectedDirIndFactsheet;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == selIndex.id && x.accountId == accID);

      let factsheetParameter = {
        name1: this.dirIndexService._customizeSelectedIndex_Direct.name,
        name2: that.dirIndexService._customizeSelectedIndex_Direct.basedon,
        assetid: (isNotNullOrUndefined(assetid)) ? assetid : notifyId.length > 0 ? notifyId[0]['assetId'] : 0,
        userid: userid,
        strategyId: notifyId.length > 0 ? notifyId[0]['slid'] : 0,
        enddate: date,
        tenYrFlag: 1,
        indexId: indexId,
        freqflag: notifyId.length > 0 ? notifyId[0]['freqflag'] : that.sharedData.defaultRebalanceType,
        barcharttype: barcharttype,
        holdingdate: date,
        accountId: accID,
        calendarTaxflag: that.enableTaxCalendar,
        performanceTaxflag: that.enableTaxPerformance,
        range: 0,
        taxflag: (isNotNullOrUndefined(this.dirIndexService._customizeSelectedIndex_Direct['taxEffAwareness'])) ? this.dirIndexService._customizeSelectedIndex_Direct['taxEffAwareness'] : 'N',
        notifyid: notifyId.length > 0 ? notifyId[0]['notifyId'] : 0,

      }

      this.showLoad = true;
      this.httpClient.post(this.API_URL, factsheetParameter, { observe: 'response', responseType: 'blob' }).pipe(first()).subscribe((event) => {
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], {
          type: data.body?.type
        });
        if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = that.sharedData.downloadTitleConvert(that.dirIndexService._customizeSelectedIndex_Direct.name) + "_Factsheet";
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
        }
        else {
          //this.toastr.info("Something went wrong.. please try again", '', {
          //  timeOut: 10000,
          //  positionClass: 'toast-top-center'
          //});
        }
        this.showLoad = false;
      },
        (error: any) => {
          this.toastr.info('The file download is currently unavailable due to technical issues. Please try again.', '', {
            timeOut: 5000
          });
          this.showLoad = false;
        });
    }
  }

  download() {
    var getAccId = this.dirIndexService._selectedDirIndFactsheet;
    this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + getAccId), ("Account id:" + getAccId), 'review factsheet download btn click');
    var filename: string = this.sharedData.downloadTitleConvert(this.dirIndexService.customizeSelectedIndex_Direct.value.name) + "_Components";
    this.dirIndexService.tradeDownload1(filename, this.bldMyIndexMntHPortfolioData, 'csv');
  }
  asOfDate: any;
  asOfPrice: any;
  update_perfasofDate(d:any) { if (isNotNullOrUndefined(d) && d.length > 0) { this.asOfDate = d[0].date; } else { this.asOfDate = '-'; } }
  checkPriceDate(d:any) { if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.hdate)) { this.asOfPrice = d.hdate; } else { this.asOfPrice = ""; }; }
  ngOnDestroy() { this.subscriptions.unsubscribe();}
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
      var slidNo = this.dirIndexService._selectedDirIndStry[0].id;
      var getAccId = that.dirIndexService._selectedDirIndFactsheet;
      var CIfill = res.filter((x: any) => x.assetId == that.dirIndexService._currentSList.assetId && x.id == slidNo && x.accountId == getAccId);
      this.tradeNowList = CIfill[0];
    }
  }

  alreadyselected_strategy: any = [];
  checkAlreadytradedStrategy(type: boolean = false) {
    var that = this;
    that.alreadyselected_strategy = [];
    var getAccId = that.dirIndexService._selectedDirIndFactsheet;
    var slidNo = this.dirIndexService._selectedDirIndStry[0].id;
    var GetTradedList=this.dataService.GetTradedList(getAccId).pipe(first()).subscribe((data: any) => {
      if (data.length > 0) {
        var checkEnableT = data.filter((x: any) => x.slid == slidNo);
        if (checkEnableT.length > 0) {
          that.alreadyselected_strategy = checkEnableT;
        }
        if (type) {
          var GetStrategyAccount=that.dataService.GetStrategyAccount(slidNo).pipe(first()).subscribe((accList: any) => {
            this.dirIndexService.diStrFactsheetAccData.next(accList);
          }, error => {
            this.logger.logError(error, 'GetGicsExList');
          });
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
    var GetStgyListDashboardAccs=this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe((
      res: any[]) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.sharedData.stgyListDashAccsData.next(res);
        this.loadDashData(res);
      }
    }, error => {
      this.sharedData.stgyListDashAccsData.next([])
    });
    this.subscriptions.add(GetStgyListDashboardAccs);
    var getAccId = that.dirIndexService._selectedDirIndFactsheet;
    var slidNo = this.dirIndexService._selectedDirIndStry[0].id;
    var GetDIEnabletrading=this.dataService.GetDIEnabletradinglist(getAccId).pipe(first()).subscribe(data => {
      if (this.sharedData.checkServiceError(data)) { this.dirIndexService.DIEnabletradinglist.next([]); } else {
        var checkEnableT = data.filter((x: any) => x.slid == slidNo);
        if (checkEnableT.length > 0) {
          if (checkEnableT[0].enableTrading == 'Y') { that.checkverify_trade = true; }
          else { that.checkverify_trade = false; }
        } else { that.checkverify_trade = false; }
        this.dirIndexService.DIEnabletradinglist.next(data);
      }
    }, error => { this.dirIndexService.DIEnabletradinglist.next([]); });
    this.subscriptions.add(GetDIEnabletrading);
  }

  tradeData: any = { data: [], type: '' };
  checkAccInfo(dd: any, type: any) {
    if (!this.checkfactDisable()) {
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
    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    var accID = this.dirIndexService.selectedDirIndFactsheet.value;
    var account0 = this.dirIndexService._customizeSelectedIndex_Direct.cashTarget;
    if (isNotNullOrUndefined(account0)) { account0 = account0 } else { account0 = '-' }
    var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == basedata.id && x.accountId == accID);
    if (notifyId.length > 0 && isNotNullOrUndefined(notifyId[0]['cashTarget'])) { return notifyId[0]['cashTarget']; } else { return account0; }
  }
  checkfactDisable() {
    var that = this;
    var getAccId = that.dirIndexService._selectedDirIndFactsheet;
    var slidNo = this.dirIndexService._selectedDirIndStry[0].id;
    var xx = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == slidNo &&
      x.accountId == getAccId && x.notifyStatus == 'E');
    if (xx.length > 0) { return false } else { return true }
  }

  allowTade_fact() {
    var tp = 'name ' + this.dirIndexService.customizeSelectedIndex_Direct.value.name + ' account ' + this.tradeNowList['accountId'];
    this.sharedData.userEventTrack('Direct Indexing', tp, tp, 'Index Factsheet Trade now Click');
    if (this.tradeData.type == "DI") { this.openTradeDI(this.tradeData.data) }
  }

  unPauseAcc() {
    this.sharedData.PauseAccUpdate(JSON.stringify(this.dirIndexService.selectedDirIndFactsheet.value), 'N')
      .then((res) => { this.allowTade_fact(); });
  }

  openTradeDI(d: any) {
    this.sharedData.selTradeData.data = [d];
    this.sharedData.selTradeData.accountInfo = [d];
    this.sharedData.selTradeData.type = "DI";
    // this.dialogController.openTrade(rebalanceStrategiesComponent);
    this.dialogController.openTrade(TradeOpenComponent);
  }

  loadeBarChart() {
    var that = this;
    that.sectorWeightLoader = true;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    var endDate:any = formatDate(basedata['allocDate'], 'yyyy-MM-dd', 'en-US');
    var data: any = { "id": basedata['id'], "enddate": endDate, "indexType": "", "userid": userid };
    var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == basedata['assetId']);
    if (etfHoldDate.length > 0) { data.indexType = "ETF"; }
    var DIfactsheetSectordataAPI=this.dataService.DIfactsheetSectordataAPI(data).pipe(first()).subscribe((res: any) => {
      setTimeout(() => { that.barChart(res); });
    },
      (error: any) => { that.sectorWeightLoader = false; })
    this.subscriptions.add(DIfactsheetSectordataAPI);
  }
  format(d:any) { return d3.format(",.2f")(d) }
  barChart(resData:any) {
    var that = this;
    var series:any = [];
    var categories: any = [];
    var Fdata: any = [];
    if (isNotNullOrUndefined(resData['dIFactsheetSectorlistdata'])) { Fdata = resData['dIFactsheetSectorlistdata']; }
    categories = [...new Set(Fdata.map((x: any) => x.title))];
    var data1: any = [...new Set(Fdata.map((x: any) => x.value1))];
    var data2: any = [...new Set(Fdata.map((x: any) => x.value2))];
    if (data1.length > 0) { series.push({ 'name': that.cusindexName, 'data': data1, 'color': 'var(--prim-button-color)' }); };
    if (data2.length > 0) { series.push({ 'name': that.cusindexNameTicker, 'data': data2, 'color': '#9999ab' }); };
    that.sectorWeightLoader = false;
    Highcharts.chart({
      chart: {
        renderTo: 'barChartBuyModel_popup1',
        type: 'bar',
        zooming: {
          mouseWheel: false
        }
      },
      title: { text: "" },
      subtitle: { text: "" },
      xAxis: {
        categories: categories,
        title: { text: 'Sector' }
      },
      yAxis: {
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

  checkShowUpdateBtn() {
    var rtn: boolean = false;
    var getAccId = this.dirIndexService._selectedDirIndFactsheet;
    if (getAccId == 0) {
      rtn = false;
    } else if (this.dirIndexService._selectedDirIndStry.length > 0 && this.dirIndexService.checkUpdateBtnEnable(this.dirIndexService._selectedDirIndStry[0], this.asOfDate) && this.alreadyselected_strategy.length == 0) {
      rtn = true;
    }
    return rtn
  }
  isOpen = false;
  isRight = true;
  // iconClass = 'fas fa-angle-left';
  toggleSidebar() {
    this.isOpen = !this.isOpen;
    // this.iconClass = this.iconClass === 'fas fa-angle-left' ? 'fas fa-angle-right' : 'fas fa-angle-left';
    if (this.isOpen) {
      this.isRight = !this.isRight;
    }
  }

  downloadHoldingsExcel() {
    var accID = this.dirIndexService.selectedDirIndFactsheet.value;
    var currentList = this.dirIndexService.selectedDirIndStry.value[0];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var d: any = (isNotNullOrUndefined(currentList.endDate)) ? new Date(currentList.endDate) : new Date();
    var date = d.getFullYear() + '-' + this.sharedData.formatedates(d.getMonth() + 1) + '-' + this.sharedData.formatedates(d.getDate());
    var data: any = [{
      "accountId": accID,
      "slid": (isNotNullOrUndefined(currentList.id)) ? currentList.id : 0,
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
        }else if (isNullOrUndefined(res)) { this.sharedData.PostStrategyHNotification(data); }
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
    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    this.sharedData.userEventTrack('Direct Indexing', 'Holdings History', (basedata['name'] + " Account id:" + accID), 'Export Holdings History Click');
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
    var currentList = this.dirIndexService.selectedDirIndStry.value[0];
    var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
    var getAccId:any = parseInt(that.dirIndexService.selectedDirIndFactsheet.value);
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
    } else if (getAccId == 0) {      
      this.sharedData.downloadAccZeroHisReturn({ "name": basedata['name'], "assetid": basedata['assetId'] }, '');
    }
    this.sharedData.userEventTrack('Direct Indexing', 'Returns History', (basedata['name'] +" Account id:" + getAccId), 'Export Returns History Click');
  }

  Preparedby = "";
  Preparedfor = "";
  Prepareddate = "";
  showLoad2: boolean = false;
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
    if ((e.charCode >= 97 && e.charCode <= 122) || (e.charCode >= 65 && e.charCode <= 90) || (e.charCode == 32)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }
  toggleDropdownOpen() { this.isOpen = !this.isOpen; };

  saveproposal() {
    var that = this;
    this.showLoad2 = true;
    var flg = this.dirIndexService.onlyLettersNumbersAndSpaces(this.Preparedby.trim());
    var flg1 = this.dirIndexService.onlyLettersNumbersAndSpaces(this.Preparedfor.trim());
    if (flg == false) {
      this.toastr.info('Ensure no special characters or numbers are included');
      this.showLoad2 = false;
    } else if (flg1 == false) {
      this.toastr.info('Ensure no special characters or numbers are included');
      this.showLoad2 = false;
    }else if (this.Preparedby.trim().length == 0 || isNullOrUndefined(this.Preparedby.trim())) {
      this.toastr.info("Prepared by field cannot be empty.", '', { timeOut: 10000, positionClass: 'toast-top-center' });
      this.showLoad2 = false;
    } else if (this.Preparedfor.trim().length == 0 || isNullOrUndefined(this.Preparedfor.trim())) {
      this.toastr.info("Prepared for field cannot be empty.", '', { timeOut: 10000, positionClass: 'toast-top-center' });
      this.showLoad2 = false;
    } else {
      $('#Proposal_Modal').modal('hide');
      setTimeout(() => { this.toggleDropdownOpen(); }, 200);
      this.dirIndexService.saveproposalPDF(this.Preparedby, this.Preparedfor, this.enableTaxCalendar, this.enableTaxPerformance)
        .then((res: any) => { this.showLoad2 = false; })
        .catch((res: any) => { this.showLoad2 = false; });
      var basedata = this.dirIndexService.customizeSelectedIndex_Direct.value;
      var getAccId: any = parseInt(that.dirIndexService.selectedDirIndFactsheet.value);
      this.sharedData.userEventTrack('Direct Indexing', 'Proposal', (basedata['name'] + " Account id:" + getAccId), 'Export Proposal Click');
    }
  };
}
