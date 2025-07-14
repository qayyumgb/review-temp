import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import * as Highcharts from 'highcharts/highstock';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined, } from '../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../core/services/data/data.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { Subscription, first } from 'rxjs';
import { IndexstepService } from '../../../core/services/indexstep.service';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { ToastrService } from 'ngx-toastr';
import { descending, format } from 'd3';
declare var $: any;
import * as d3 from 'd3';

@Component({
  selector: 'app-indexfactsheet-modal',
  templateUrl: './indexfactsheet-modal.component.html',
  styleUrl: './indexfactsheet-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class IndexfactsheetModalComponent implements OnInit{
  @ViewChild('calendarYearReturns', { read: ElementRef }) public calendarYearReturns: ElementRef<any> | any;
  @ViewChild('taxGainLoss', { read: ElementRef }) public taxGainLoss: ElementRef<any> | any;
  subscriptions = new Subscription();
  tradedNotifyId: any;
  savedStrategySettingsData: any = [];
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  checkIndexTab = "";
  sectorData:any[] = [];
  dMyIndexMnthlyHPtradePayload: any;
  alreadyselected_strategy: any;
  GBMHPortfolio: any;
  indexData: any = [];
  indSector: any = [];
  YTD: string = '';
  GTtrade: any;
  GBMHPtrade: any;
  GPerETFRList: any;
  clickedList: any;
  clickedListNames: any;
  currentAccountInfo: any;
  GetETFStrData: any = [];
  PerfData:any = [];
  
  bldMyIndexMntHPortfolioData: any = [];
  performanceETFRList: any = [];
  performanceUIndexList: any = [];
  factsheetPerfData: any = [];
  selFSIndPerfData = [];
  modifyDate_for: any = "";
  indexName = "";
  perfName = "";
  asOfDate: any;
  perfData:any = { years: [], ETFind: {}, Uindex: {}, AUindex: {} };
  companysortedData:any;
  showSpinner_account: boolean = false;
  showSpinner_trade: boolean = false;
  showSpinner_factsheet: boolean = true;
  showDownloadBtn: boolean = false;
  trade_progress = "(0s)";
  factsheet_progress = "(0s)";
  transitionVal: number = 1;
  taxOptFactSheet: boolean = false;
  clearIntervalFactProgress: any;
  clearIntervalAccountProgress: any;
  taxGainLossData: any = [];
  defaultMarketCurrency: any = '$';

  cusindexName: string = "";
  cusindexShortName: string = "";
  cusindexNameTicker: string = "";
  cusindexBM_Name: string = "";
  cusindexBM_Ticker: string = "";

  checkNAAshow: boolean = false;
  taxOptFactSheet_optional: boolean = false;
  showCheckbox_afterTax: boolean = false;

  //taxOptFactSheet: boolean = false;
  taxOptFactSheetCal: boolean = true;
  checkverify_trade: boolean = false;
  enableTaxPerformance: boolean = true;
  enableTaxCalendar: boolean = true;
  constructor(
    private dialogref: MatDialogRef<IndexfactsheetModalComponent>,
    public sharedData: SharedDataService,public cusIndexService: CustomIndexService,private dataservice: DataService,private logger: LoggerService,private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public indexFactsheetdata: any
  ) {}

  ngOnInit(): void {
    var that = this;
    var getIndexStepsData = this.indexFactsheetdata.savedStrategy;
    that.alreadyselected_strategy = getIndexStepsData;
    that.cusindexName = that.alreadyselected_strategy.name;
    that.cusindexShortName = that.alreadyselected_strategy.shortname;
    that.cusindexBM_Name = that.alreadyselected_strategy.Indexname;
    if (isNotNullOrUndefined(that.alreadyselected_strategy.Ticker)) {
      that.cusindexBM_Ticker = that.alreadyselected_strategy.Ticker;
    } else { that.cusindexBM_Ticker = ""; }
   

    //console.log(that.alreadyselected_strategy,'alreadyselected_strategy')
    that.tradedNotifyId = this.indexFactsheetdata.notifyId;
    that.savedStrategySettingsData = this.indexFactsheetdata.savedStrategySettingsData;
    that.startloader();
    this.clickData(getIndexStepsData, getIndexStepsData, 'CI');
  }
 
  startloader() {
    var that = this;
    clearInterval(that.clearIntervalFactProgress);
    that.factsheet_progress = "(0s)";
    that.showSpinner_factsheet = true;
    that.factsheetProgress();
  }
  factsheetProgress() {
    var that = this;
    var min = 0;
    var sec = 0;
    var seconds = "";
    $('#factsheet_loaderA .div_n_load').text('Implementing filtering and selection');
    that.clearIntervalFactProgress = setInterval(function () {
      var a = new Date();
      if (min == 0) {
        $('#factsheet_loaderA .div_n_load').text('Implementing filtering and selection');
      }
      else if (min > 0) {
        $('#factsheet_loaderA .div_n_load').text('Executing historical rebalances');
      }
      else if (min > 1) {
        $('#factsheet_loaderA .div_n_load').text('Back-testing historical values');
      } else if (min > 2) {
        $('#factsheet_loaderA .div_n_load').text('Producing portfolio characteristics');
      } else if (min > 3) {
        $('#factsheet_loaderA .div_n_load').text('Finalizing composition and performance metrics');
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
  clickData(datas:any, item:any, type:any) {
    var that = this;
    this.taxOptFactSheet = false;
    this.taxOptFactSheetCal = false;
    that.clickedList = datas;
    if (type == 'DI') {
      this.indexName = this.clickedList.name;
      this.perfName = this.clickedList.basedon;
    }
    else if (isNotNullOrUndefined(that.clickedList.Ticker) && that.clickedList.Ticker != "") {
      this.perfName = this.clickedList.Indexname + ' (' + this.clickedList.Ticker + ')';
      this.indexName = this.clickedList.shortname;
    } else {
      this.perfName = this.clickedList.Indexname;
      this.indexName = this.clickedList.shortname;
    }
    this.checkIndexTab = "";
    that.clickedListNames = item;
    that.modifyDate_for = new Date();
    var d = new Date();
    var assetid:any;
    var indexId = 123;
    var userid = datas.userid;
    var tenYrFlag = 1;
    var getETFIndex = [...this.sharedData.ETFIndex.value].filter(x => x.assetId == datas.assetId);
    //console.log(getETFIndex,'getETFIndex')
    if (type == 'DI') {
      this.checkIndexTab = 'DI';
      tenYrFlag = 1;
      if (isNotNullOrUndefined(datas.AUserid)) { userid = datas.AUserid; } else { userid = datas.userid; }
      if (getETFIndex.length > 0) {
        d = new Date(getETFIndex[0]['holdingsdate']);
      } else {
        var index:any = this.cusIndexService.myIndEqindex.filter((x:any) => x.assetId == datas.assetId);
        if (index.length > 0) { indexId = this.sharedData.getIndexId({ indexType: "Equity Universe", name: index[0].name }); };
        d = new Date(this.sharedData.equityHoldDate);
      }
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      assetid = datas.assetId;
    } else if (getETFIndex.length > 0) {
      d = new Date(getETFIndex[0]['holdingsdate']);
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      assetid = datas.assetId;
    } else {
      var indName = datas.Indexname;
      if (datas.Indexname.toLowerCase().indexOf('growth') > -1) { indName = "S&P 500 Growth" }
      else if (datas.Indexname.toLowerCase().indexOf('value') > -1) { indName = "S&P 500 Value" }
      var index:any = this.cusIndexService.myIndEqindex.filter((x:any) => x.name.toLowerCase() == indName.toLowerCase());
      if (index.length > 0) { assetid = index[0].assetId; }
      d = new Date(this.sharedData.equityHoldDate);
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      indexId = this.sharedData.getIndexId({ indexType: "Equity Universe", name: indName });
    }
    var date = d.getFullYear() + '-' + that.formatedates(d.getMonth() + 1) + '-' + that.formatedates(d.getDate());
    let actuserid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = {
      "assetid": datas.assetId,
      "userid": actuserid,
      "actuserid": datas.userid,
      "strategyId": datas.id,
      "enddate": date,
      "tenYrFlag": tenYrFlag,
      "indexId": indexId,
      "freqflag": that.sharedData.defaultRebalanceType,
      "notifyid": this.tradedNotifyId,
      "accountId": datas.accountId,
    }

    this.dMyIndexMnthlyHPtradePayload = data;
    try {
      try { this.GTtrade.unsubscribe(); } catch (e) { }
      this.GTtrade = this.dataservice.GetTaxharvestSavedCITAccskub(data).pipe(first()).subscribe((res: any) => {
        if (this.sharedData.checkServiceError(res)) {
          $('#myCustomIndErrorModal_review').modal('show');
          this.logger.logError(res, 'GetTaxharvesttrade');

        } else {
          that.GetETFStrData = res;
          try {
            if (res.length == 0 || isNullOrUndefined(res[0]['annualPnlList'])) { that.taxGainLossData = []; }
            else {
              that.taxGainLossData = res[0]['annualPnlList'].map((a:any) => ({ ...a }))
                .sort(function (x:any, y:any) { return d3.descending(x.year, y.year); });
            }
          } catch (e) { }
          var checktaxeff: boolean = false;
          if (isNotNullOrUndefined(that.clickedList['taxEffAwareness']) && that.clickedList['taxEffAwareness'] == "Y") { checktaxeff = true; }
          if (res.length > 2 && checktaxeff) { that.taxOptFactSheet = true; this.taxOptFactSheetCal = true }
          try {
            this.performanceUIndexList = res
            this.factsheetPerfData = res;
            that.formatPerfData(res);
            that.formatCharDataFact([...res][0]['graphvalues']);
            //this.ETFIndexChart(that.clickedList);
          } catch (e) { }
          that.closecommon_progress();
          try { this.GBMHPtrade.unsubscribe(); } catch (e) { }
          this.GBMHPtrade = this.dataservice.GetBuildMyIndexMnthlyHPSavedCITAccskub(data).pipe(first()).subscribe((res: any) => {
            if (this.sharedData.checkServiceError(res)) {
              $('#myCustomIndErrorModal_review').modal('show');
              that.closecommon_progress();
              this.logger.logError(res, 'GetBuildMyIndexMnthlyHPtrade');
            } else {
              res = [...res].sort(function (x, y) { return d3.descending((parseFloat(x.weight)), (parseFloat(y.weight))); });
              that.bldMyIndexMntHPortfolioData = res;
              var dta: any = res;
              if (this.checkIndexTab == "DI" && this.sharedData.checkMenuPer(12, 187) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
              else if (this.sharedData.checkMenuPer(3, 163) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
              var data:any[] = []
              dta.forEach((x:any) => {
                var newObj = Object.assign({}, x);
                if (isNotNullOrUndefined(x.Weight)) { newObj.Wt = x.Weight * 100; }
                else { newObj.Wt = x.weight * 100; }
                newObj['newSec'] = x.sector;
                data.push(newObj)
              });

              data = data.map(a => ({ ...a }));
              //that.sectorData = this.createSector([...data])
              setTimeout(function () {
                //that.barChart();
                that.getBarchart(that.dMyIndexMnthlyHPtradePayload);
                that.closecommon_progress();
              }.bind(this), 1000);
            }
          }, error => {
            this.logger.logError(error, 'GetBuildMyIndexMnthlyHPtrade');
            that.toastr.info('Data not available', '', { timeOut: 5000 });
            that.closecommon_progress();
          });

          var data1 = {
            'strSector': [],
            'strStockkey': [],
            'assetid': datas.assetId,
            'indexId': indexId,
            'range': 100,
            "strExStockkey": [],
            'tenYrFlag': 1,
            'enddate': date,
            "rating": '',
            "category": [],
            "taxflag": 'Y'
          };
          try { this.GPerETFRList.unsubscribe(); } catch (e) { }
          this.GPerETFRList = this.dataservice.GetPerformanceETFRList(data1).pipe(first()).subscribe(GetPerformanceETFRList => {
            if (this.sharedData.checkServiceError(GetPerformanceETFRList)) {
              $('#myCustomIndErrorModal_review').modal('show');
              this.logger.logError(GetPerformanceETFRList, 'GetPerformanceETFRList');
              that.closecommon_progress();
            } else {
              var data: any = GetPerformanceETFRList;
              if (isNotNullOrUndefined(GetPerformanceETFRList)) {
                this.performanceETFRList = data;
                that.closecommon_progress();
              }
            }
          }, error => {
            that.toastr.info('Data not available', '', { timeOut: 5000 });
            this.logger.logError(error, 'GetPerformanceETFRList');
            that.closecommon_progress();
          });
        }
      }, error => {
        this.logger.logError(error, 'GetTaxharvesttrade');
        $('#myCustomIndErrorModal_review').modal('show');
        that.closecommon_progress();
      });
      this.subscriptions.add(this.GTtrade);
    } catch (e) {
      that.toastr.info('Data not available', '', { timeOut: 5000 });
      that.closecommon_progress();
    }
  }
  formatedates(value: any) { if (value < 10) { return '0' + value; } else { return value; } }
  formatPerfData(Data:any) {
    var that = this;
    if (Data.length > 0) {
      var dta = Data[0]['etfPerformanceYears'];
      var dta1 = Data[1]['etfPerformanceYears'];
      var ETFind:any = {};
      var Uindex:any = {};
      var AUindex:any = {};
      this.perfData.years = [...new Set(dta.map((x:any) => x.year))].sort(function (x: any, y: any) { return d3.descending(x, y); });
      this.perfData.years.forEach((d:any) => {
        var ETF = dta1.filter((x:any) => x.type == "ETF" && x.year == d);
        ETFind[d] = ETF[0]['yearReturns'];
        var Uind = dta.filter((x:any) => x.type == "Uindex" && x.year == d);
        Uindex[d] = Uind[0]['yearReturns'];
        if (that.taxOptFactSheet) {
          var Uind1 = Data[2]['etfPerformanceYears'].filter((x:any) => x.type == "Uindex" && x.year == d);
          AUindex[d] = Uind1[0]['yearReturns'];
        }
      });
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
  formatCharDataFact(Data:any) {
    var that = this;
    var chartTitle = "";
    var etfvalue:any = [];
    var date:any = [];
    var uindexvalue:any = [];
    var afterTax:any = [];
    if (Data.length > 0) {
      Data.forEach((x:any, i:any) => {
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

      var d = new Date(date[date.length - 1]);
      var formatdate1 = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();

      series.push({
        name: (that.taxOptFactSheet) ? that.indexName + ' - Before Tax' : that.indexName,
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
        renderTo: 'lineChartBuyModel',
        type: 'spline',
        style: {
          fontFamily: 'poppins-medium'
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
          fontFamily: 'poppins-medium',
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
        tickInterval: 2,
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
  top10HoldingCheck() {
    if (this.sharedData.checkMenuPer(3, 163) == 'Y' && this.sharedData.selTradeData.type == "CI") { return true }
    else if (this.sharedData.checkMenuPer(12, 187) == "Y" && this.sharedData.selTradeData.type == "DI") { return true }
    else { return false }
  };
  update_perfasofDate(d: any) { if (isNotNullOrUndefined(d) && d.length > 0) { this.asOfDate = d[0].date; } else { this.asOfDate = '-'; } }
  checkPriceDate(d: any) { if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.hdate)) { return d.hdate; } else { return ""; }; }
  download() {
    var getAccId = this.cusIndexService.selectedCIIndFactsheet.value;
    this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + getAccId), ("Account id:" + getAccId), 'review factsheet download btn click');
    this.sharedData.tradeDownload1(this.cusIndexService.customizeSelectedIndex_custom.value.name, this.bldMyIndexMntHPortfolioData, 'csv');
  }
  checkTarget() {
    var basedata = this.alreadyselected_strategy;
    if (isNotNullOrUndefined(basedata['cashTarget'])) { return basedata['cashTarget']; } else { return '-'; }
  }
  ETFIndexChart(index:any) {
    var that = this;
    var dta = this.cusIndexService.myIndEqindex.filter((x:any) => x.assetId == index.assetId);
    if (dta.length > 0) {
      var filtercomp: any = [];
      if (index.assetId == 55551111) { filtercomp = [...that.sharedData._EqGrowthData]; }
      else if (index.assetId == 55553333) { filtercomp = [...that.sharedData._EqValueData]; }
      else { filtercomp = [...that.sharedData._selResData].filter(function (d) { return d.indexName == index.Indexname || d.indexName == index.basedon; }) }
      if (isNotNullOrUndefined(filtercomp) && filtercomp.length > 0) {
        that.indexData = [...filtercomp];
        let TotWt = d3.sum(that.indexData.map(function (d:any) { return (1 - d.scores); }));
        var matchData = [...that.sharedData._dbGICS].filter(x => x.type == "Sector");
        that.indexData.forEach((x:any) => {
          var newSec = matchData.filter(z => x.industry.indexOf(z.code) == 0);
          if (newSec.length > 0) { x['newSec'] = newSec[0].name; } else { x['newSec'] = x.industry; }
          x['Wt'] = ((1 - x.scores) / TotWt) * 100;
          return x;
        });
        dta = that.indexData.map((a:any) => ({ ...a })).sort(function (x:any, y:any) { return d3.descending((parseFloat(x.Wt)), (parseFloat(y.Wt))); });
        //that.indSector = that.createSector([...dta]);
      } else { that.indSector = []; };
      that.barChart();
    } else {
      that.sharedData.getETFAllocScores(index, 0, 'ETF').then(res => {
        var da: any = res;
        var matchData = [...that.sharedData._dbGICS].filter(x => x.type == "Sector");
        if (isNotNullOrUndefined(da) && da.length > 0) {
          that.indexData = [...da];
          let TotWt = d3.sum(that.indexData.map(function (d:any) { return (1 - d.scores); }));
          that.indexData.forEach((x:any) => {
            var newSec = matchData.filter(z => x.industry.indexOf(z.code) == 0);
            if (newSec.length > 0) { x['newSec'] = newSec[0].name; } else { x['newSec'] = x.industry; }
            x['Wt'] = ((1 - x.scores) / TotWt) * 100;
            return x;
          });
          dta = that.indexData.map((a:any) => ({ ...a })).sort(function (x:any, y:any) { return d3.descending((parseFloat(x.Wt)), (parseFloat(y.Wt))); });
          //that.indSector = that.createSector([...dta]);
        } else { that.indSector = []; };
        that.barChart();
      });
    }
  }
  hideNav() {
     setTimeout(function () {
       if ($(".calendarYearReturns").length > 0 && $(".calendarYearReturns").scrollLeft() + Math.round($(".calendarYearReturns").innerWidth()) >= ($(".calendarYearReturns")[0].scrollWidth) - 1) {
        $(".calendarYearReturns").addClass('widthExt1');
        $("#tableNavBuy").hide();
       } else { };
       if ($(".AccounttaxGainLoss").length>0 && $(".AccounttaxGainLoss").scrollLeft() + Math.round($(".AccounttaxGainLoss").innerWidth()) >= ($(".AccounttaxGainLoss")[0].scrollWidth) - 1) {
        $(".AccounttaxGainLoss").addClass('widthExt1');
        $("#tableNavBuy2").hide();
      }else{
        // $(".AccounttaxGainLoss").removeClass('widthExt1');
      }
      }, 50)
  }
  closecommon_progress() {
    var that = this;
    if (that.bldMyIndexMntHPortfolioData.length > 0 && that.GetETFStrData.length > 0) {
      clearInterval(that.clearIntervalFactProgress);
      that.factsheet_progress = "(0s)";
      that.showSpinner_factsheet = false;
      try { that.hideNav(); } catch (e) { }
    }
    setTimeout(function () {
      that.showSpinner_trade = false;
    }, 100);
  }
  createSector(data:any) {
    var arr:any[] = [];
    var list1 = [...new Set(data.map((x: { newSec: any; }) => x.newSec))];
    list1.forEach((x: any) => {
      var list = data.filter((y:any) => y.newSec == x);
      let tot = d3.sum(list, function (d: any) { return d.Wt; });
      arr.push({ "name": x, weight: d3.format(".2f")(tot) + "%" });
    });
    var dta = [...arr].map(a => ({ ...a })).sort(function (x, y) { return d3.descending((parseFloat(x.weight)), (parseFloat(y.weight))); });
    return [...dta];
  }

  barchartData: any;
  getBarchart(payload: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var assetid = (isNotNullOrUndefined(payload['assetid'])) ? payload['assetid'] : 0;
    var data: any = {
      "name1": (isNotNullOrUndefined(this.cusindexShortName)) ? this.cusindexShortName : '',
      "name2": (isNotNullOrUndefined(this.perfName)) ? this.perfName : '',
      "accountid": (isNotNullOrUndefined(payload['accountId'])) ? payload['accountId'] : 0,
      "assetid": assetid,
      "enddate": (isNotNullOrUndefined(payload['enddate'])) ? payload['enddate'] : 0,
      "holdingdate": (isNotNullOrUndefined(payload['enddate'])) ? payload['enddate'] : 0,
      "indexId": (isNotNullOrUndefined(payload['indexId'])) ? payload['indexId'] : 0,
      "freqflag": (isNotNullOrUndefined(payload['freqflag'])) ? payload['freqflag'] : 0,
      "notifyid": (isNotNullOrUndefined(payload['notifyid'])) ? payload['notifyid'] : 0,
      "strategyId": (isNotNullOrUndefined(payload['strategyId'])) ? payload['strategyId'] : 0,
      "tenYrFlag": (isNotNullOrUndefined(payload['tenYrFlag'])) ? payload['tenYrFlag'] : 1,
      "userid": userid,
      "barcharttype": this.sharedData.checkBarChartType(assetid),
    };
    this.sharedData.checkSectorWeigth(data).then((res: any) => {
      this.barchartData = [...res];
      this.barChart();
    });
  }

  barChart() {
    var that = this;
    var series:any = [];
    var categories: any = [];
    //var indSector = this.indSector;
    //var cat1:any = [...new Set(that.sectorData.map((x: { name: any; }) => x.name))];
    //var cat2:any = [...new Set(indSector.map((x: { name: any; }) => x.name))];
    //categories = [...new Set([].concat(cat1, cat2).map((x) => x))].filter(x => isNotNullOrUndefined(x));
    //var data1:any[] = [];
    //var data2:any[] = [];
    //categories.forEach((x:any) => {
    //  var flDta1 = that.sectorData.filter(y => y.name == x);
    //  var flDta2 = indSector.filter((y:any) => y.name == x);
    //  if (flDta1.length > 0) {
    //    if (isNotNullOrUndefined(flDta1[0]['indexWeight'])) { data1.push(parseFloat(that.format(flDta1[0]['indexWeight'] * 100))) }
    //    else { data1.push(parseFloat(that.format(parseFloat(flDta1[0]['weight'])))) }
    //  } else { data1.push('') }
    //  if (flDta2.length > 0) { data2.push(parseFloat(flDta2[0]['weight'])) } else { data2.push('') };
    //});

    //if (this.sectorData.length > 0) { series.push({ 'name': that.indexName, 'data': data1, 'color': 'var(--prim-button-color)' }); };
    //if (indSector.length > 0) { series.push({ 'name': that.perfName, 'data': data2, 'color': '#9999ab' }); };

    var data1: any = [];
    var data2: any = [];
    if (isNotNullOrUndefined(this.barchartData) && this.barchartData.length > 0) {
      if (isNotNullOrUndefined(this.barchartData) && this.barchartData.length > 0) {
        [...this.barchartData].forEach((x: any) => {
          categories.push((isNotNullOrUndefined(x['title']) ? x['title'] : ''))
          data1.push((isNotNullOrUndefined(x['value1']) ? parseFloat(x['value1']) : 0))
          data2.push((isNotNullOrUndefined(x['value2']) ? parseFloat(x['value2']) : 0))
        });
      }
      if (data1.length > 0) { series.push({ 'name': (isNotNullOrUndefined(this.barchartData[0]['indexName']) ? this.barchartData[0]['indexName'] : ''), 'data': data1, 'color': 'var(--prim-button-color)' }); };
      if (data2.length > 0) { series.push({ 'name': (isNotNullOrUndefined(this.barchartData[0]['bmName']) ? this.barchartData[0]['bmName'] : ''), 'data': data2, 'color': '#9999ab' }); };
    }

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
  format(d:any) { return d3.format(",.2f")(d) }
  percentageFormateDash(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return this.numberWithCommas(value.toFixed(2)) + "%" }
  }

  percentageFormateDash1(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return this.numberWithCommas(value.toFixed(2)) }
  }
  numberWithCommas(x:any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  closeModal() { this.dialogref.close(); }
 
  scrollRight(data: any) {

    if (data == 'calendarYearReturnsRight') {
      this.calendarYearReturns.nativeElement.scrollTo({ left: (this.calendarYearReturns.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }
    else {
      this.taxGainLoss.nativeElement.scrollTo({ left: (this.taxGainLoss.nativeElement.scrollLeft + 150), behavior: 'smooth' });
    }

  }

  scrollLeft(data: any): void {
    if (data == 'calendarYearReturnsLeft') {
      this.calendarYearReturns.nativeElement.scrollTo({ left: (this.calendarYearReturns.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }
    else {
      this.taxGainLoss.nativeElement.scrollTo({ left: (this.taxGainLoss.nativeElement.scrollLeft - 150), behavior: 'smooth' });
    }

  }
  checkEmptyObj(data: any) { if (Object.keys(data).length > 0) { return true } else { return false } };
  onScrolltaxGainLoss(event: Event, params: any) {

    var target = event.target as HTMLDivElement;
    const scrollableElement = this.taxGainLoss.nativeElement;
    const isAtEnd = Math.round(scrollableElement.scrollLeft) + scrollableElement.offsetWidth >= scrollableElement.scrollWidth;
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
    if (target.scrollLeft == 0) {
      const element = document.getElementById('taxArrowleft');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else {
      const element = document.getElementById('taxArrowleft');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }

  }
  taxGL(data: any) {
    var that = this;
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['annualPnlList'])) {
      that.taxGainLossData = data[0]['annualPnlList'].map((a: any) => ({ ...a }))
        .sort(function (x: any, y: any) { return descending(x.year, y.year); });
    } else { that.taxGainLossData = []; };
  }
  taxgainlossFormat(d: any) {
    if (isNullOrUndefined(d) || isNullOrUndefined(d['annualPnL'])) { return '-' }
    else { return format("$,.2f")(d['annualPnL']) }
  }
  onScroll(event: Event, params: any) {
    var target = event.target as HTMLDivElement;
    const scrollableElement = this.calendarYearReturns.nativeElement;
    const isAtEnd = Math.round(scrollableElement.scrollLeft) + scrollableElement.offsetWidth >= scrollableElement.scrollWidth;
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
    if (target.scrollLeft == 0) {
      const element = document.getElementById('calArrowleft');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else {
      const element = document.getElementById('calArrowleft');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
  }
}
