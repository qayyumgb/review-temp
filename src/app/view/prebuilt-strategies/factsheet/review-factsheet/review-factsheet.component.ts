import { Component,ViewChild,ElementRef,HostListener, OnInit, OnDestroy } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { ascending, descending, format, select, sum } from 'd3';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
More(Highcharts);

import { Workbook } from 'exceljs';
// @ts-ignore
import * as FileSaver from 'file-saver';
declare var $: any;
import * as d3 from 'd3';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../../core/services/data/data.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'pre-review-factsheet',
  templateUrl: './review-factsheet.component.html',
  styleUrl: './review-factsheet.component.scss'
})
export class ReviewFactsheetComponent_Prebuilt implements OnInit, OnDestroy {
  bldMyIndexMntHPortfolioData: any = [];
  subscriptions = new Subscription();
  cusindexName: string = '';
  asOfPrice: any;
  factsheetPerfData: any = [];
  indexType: string = "";
  asOfDate: any;
  showLoad: boolean = false;
  showLoad1: boolean = false;
  showLoad2: boolean = false;
  showLoad3: boolean = false;
  showLoad4: boolean = false;
  showLoad5: boolean = false;
  showFixedIncome: boolean = false;
  showFamilyIndex: boolean = false;
  Indexid: any = null;
  ReturnsHistorymenuflag: boolean = false;
  HoldingsHistorymenuflag: boolean = false; 
  private API_URL = environment.api_url + '/Export/PrebuilfactsheetdataAPI';
  private MethodologyAPI_URL = environment.api_url + '/Export/DevEx_factsheetMethodology';
  private MonthlyReturnAPI_URL = environment.api_url + '/Export/IndexMonthlyReturnsDownload';
  private ReturnHistoryAPI_URL = environment.api_url + '/Export/IndexReturnsHistory';
  private HoldingsHistoryAPI_URL = environment.api_url + '/Export/IndexHoldingsHistory';
  private MenuPremissionCheck = environment.api_url + '/Export/GetProposalMenuPermission';

  constructor(private datepipe: DatePipe,public sharedData: SharedDataService, public preBuiltService: PrebuildIndexService, private dataService: DataService,
    private httpClient: HttpClient, private toastr: ToastrService,) { }
  ngOnInit() {
    var that = this;
    var exclusionCompData = that.preBuiltService.exclusionCompData.subscribe((data: any) => {
      if (isNotNullOrUndefined(data) && data.length > 0) { this.loadGridData(data); };
    });

    that.subscriptions.add(exclusionCompData);
    var preBuiltLineChartData = that.preBuiltService.preBuiltLineChartData.subscribe((data: any) => {
      var res: any = that.preBuiltService.customizeSelectedIndex_prebuilt.value;
        if (isNotNullOrUndefined(res)) {
          if (isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") {
            that.indexType = "index";
            that.checkFI(res);
            setTimeout(() => { that.lineChart(data); }, 200);
            that.onLoadIndexPer();
          } else if (isNotNullOrUndefined(res['type']) && res['type'] == "strategy") {
            this.selIndexName = res.indexname.replace('New Age Alpha ', '');
            that.indexType = "strategy";
            setTimeout(() => { that.formatCharData(data); }, 200);
            var perDt: any = that.preBuiltService.GetNAAIndexStrategyPerf.value;
            var holdDate = new Date(perDt[0]['date']);
            if (isNotNullOrUndefined(res['indexid'])) { this.Indexid = res['indexid']; }
            that.asOfDate = that.formatedates(holdDate.getMonth() + 1) + '/' + that.formatedates(holdDate.getDate()) + '/' + holdDate.getFullYear();
          }
        }
    });
    that.subscriptions.add(preBuiltLineChartData);
  }

  checkFI(res: any) {
    this.showFixedIncome = false;
    this.showFamilyIndex = false;
    if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") {
      if (isNotNullOrUndefined(res['indexid']) && res['indexid'] == 76) { this.showFixedIncome = true; }
      if (isNotNullOrUndefined(res['indexid']) && (res['indexid'] == 260 || res['indexid'] == 262)) { this.showFamilyIndex = true; }
    }
  }

  formatedates(value: any) { if (value < 10) { return '0' + value; } else { return value; } }
  selIndexSector: any = [];
  selIndexName:any;
  fsIndexPerformance: any = [];
  indexperformanceData: any = [];
  onLoadIndexPer() {
    var that = this;
   
    var data: any = that.preBuiltService.GetNAAIndexPerf.value;
    if (isNotNullOrUndefined(data['fsIndexPerformance']) && data['fsIndexPerformance'].length > 0) {
      this.fsIndexPerformance = data['fsIndexPerformance'];
    } else { this.fsIndexPerformance = []; }
    if (isNotNullOrUndefined(data['indexperformanceAll']) && data['indexperformanceAll'].length > 0) {
      this.indexperformanceData = data['indexperformanceAll'];
      this.createYRtable(this.indexperformanceData);
      var holdDate = new Date(this.indexperformanceData[0].AsofDate);
      that.asOfDate = that.formatedates(holdDate.getMonth() + 1) + '/' + that.formatedates(holdDate.getDate()) + '/' + holdDate.getFullYear();
    } else { this.indexperformanceData = []; }
    if (isNotNullOrUndefined(data['indexMaster']) && data['indexMaster'].length > 0) {
      this.selIndexSector = data['indexMaster'];
      if (isNotNullOrUndefined(data['indexMaster'][0]['indexId'])) { this.Indexid = data['indexMaster'][0]['indexId']; }
      //this.selIndexName = this.selIndexSector[0].indexName.replace('New Age Alpha ', '');
      this.selIndexName = this.preBuiltService._customizeSelectedIndex_prebuilt.indexname.replace('New Age Alpha ', '');
     // console.log('this.selIndexName', this.selIndexName, this.selIndexSector[0], this.preBuiltService.customizeSelectedIndex_prebuilt.value);
    } else { this.selIndexSector = []; }

    this.CheckMenuPermission("IndexReturnsHistory");
    this.CheckMenuPermission("IndexHoldingsHistory");

  }
  top10HoldingCheck() { if (this.sharedData.checkMenuPer(4, 162) == "Y") { return true } else { return false } };
  download() {
    var customizeSelectedIndex = this.preBuiltService.prebuiltIndexBrcmData.value[this.preBuiltService.prebuiltIndexBrcmData.value.length - 1];
    var res: any = this.preBuiltService.customizeSelectedIndex_prebuilt.value;
    if (isNotNullOrUndefined(res)) {
      if (isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") {
        this.preBuiltService.tradeDownload1(this.sharedData.downloadTitleConvert(customizeSelectedIndex.name.replace('New Age Alpha ', 'NAA ')), customizeSelectedIndex, this.bldMyIndexMntHPortfolioData, 'csv');
      } else if (isNotNullOrUndefined(res['type']) && res['type'] == "strategy") {
        this.preBuiltService.tradeDownload(this.sharedData.downloadTitleConvert(customizeSelectedIndex.name.replace('New Age Alpha ', 'NAA ')), this.bldMyIndexMntHPortfolioData, 'csv');
      }
    }
    this.sharedData.userEventTrack("Prebuilt Strategies", "right grid", customizeSelectedIndex.name, 'Components download Click');
  }
  createYRtable(perData:any) {
    var that = this;
    var selIndex: any = (perData.length > 0) ? perData[0] : undefined;
    var BMIndex: any = (perData.length > 1) ? perData[1] : undefined;
    //console.log(BMIndex,'BMIndex')
    var indexName: string = (isNotNullOrUndefined(selIndex)) ? selIndex['IndexName']: "";
    this.perfData.years = [];
    this.perfData.ETFind = {};
    this.perfData.Uindex = {};
    var yearList = [];
    var YRData:any = [];
    if (isNotNullOrUndefined(selIndex)) {
      for (var i = 0; i < 30; i++) {
        var temp = that.preBuiltService.GetYear(selIndex.Date, i + 1);
        var cDate;
        if (parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(0, 2)) != 1) {
          cDate = parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(6, 10)) + 1;
        } else { cDate = parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(6, 10)); }
        if (cDate <= temp) { yearList.push(temp); }
      }
    }
    if (isNotNullOrUndefined(BMIndex)) {
      YRData[0] = { 'year': 'Product Name', 'perfVal': indexName, 'BMVal': that.preBuiltService.getBMIndexName(BMIndex) };
    } else { YRData[0] = { 'year': 'Product Name', 'perfVal': indexName }; }
    yearList.forEach((item, i) => {
      var perftemp = selIndex['Year' + (i + 1)];
      if (perftemp != null) {
        perftemp = that.preBuiltService.formatPercentage(perftemp)
        perftemp = perftemp.toLocaleString('en') + '%';
      } else {
        perftemp = '-';
      }
      if (isNotNullOrUndefined(BMIndex)) {
        var BMtemp = BMIndex['Year' + (i + 1)];
        if (BMtemp != null) {
          BMtemp = that.preBuiltService.formatPercentage(BMtemp);
          BMtemp = BMtemp.toLocaleString('en') + '%';
        } else {
          BMtemp = '-';
        }
        if (perftemp != '-' && BMtemp != '-') { YRData.push({ 'year': item, 'perfVal': perftemp, 'BMVal': BMtemp }); }
      }
      else { if (perftemp != '-') { YRData.push({ 'year': item, 'perfVal': perftemp }); } }
    });
    this.perfData.years = [...YRData];
  }

  ngOnDestroy() { this.subscriptions.unsubscribe() }
  checkPriceAsDate() {
    this.cusindexName = this.preBuiltService.customizeSelectedIndex_prebuilt.value['name'].replace('New Age Alpha ', '');
    if (this.bldMyIndexMntHPortfolioData.length > 0 && isNotNullOrUndefined(this.bldMyIndexMntHPortfolioData[0]['tradeDate'])) {
      var date = this.bldMyIndexMntHPortfolioData[0]['tradeDate'];
      var d = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8);
      this.asOfPrice = d;
    } else {
      var date = this.sharedData._selResData[0]['tradeDate'];
      var d = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8);
      this.asOfPrice = d;
    }
  }
  loadGridData(gridData: any) {
    var that = this;
    if (gridData.length > 0 && isNotNullOrUndefined(gridData[0]['indexWeight'])) {
      gridData = gridData.sort(function (x:any, y:any) { return descending((parseFloat(x.indexWeight)), (parseFloat(y.indexWeight))); });
    }
    if (this.sharedData.checkMenuPer(4, 162) == "Y") { this.bldMyIndexMntHPortfolioData = [...gridData].slice(0, 10); }
    else { this.bldMyIndexMntHPortfolioData = [...gridData]; }
    this.checkPriceAsDate();
    this.factsheetPerfData = this.preBuiltService.GetNAAIndexStrategyPerf.value;
    this.formatPerfData(this.preBuiltService.GetNAAIndexStrategyPerf.value);
    setTimeout(() => { that.barChart(); }, 200);    
  }

  dateformats(date:any) {
    if (date === undefined || date === null) { return "-"; }
    else {
      var d = new Date(date);
      var month = d.toLocaleString('default', { month: 'long' });
      return (month + ' ' + d.getDate() + ', ' + d.getFullYear());
    }
  }

  lineChart(LineChartData:any) {
    var that = this;
    var indexValue:any = [];
    var indexValue1: any = [];
    var BMindexName: string = "";
    var DM: any = that.preBuiltService.GetNAAIndexPerf.value;
    if (isNotNullOrUndefined(DM['indexperformanceAll']) && DM['indexperformanceAll'].length > 1 && isNotNullOrUndefined(DM['indexperformanceAll'][1]['IndexName'])) {
      BMindexName = that.preBuiltService.getBMIndexName(DM['indexperformanceAll'][1]).replace('New Age Alpha ', '');
    }
    if (isNotNullOrUndefined(LineChartData['indexValues'])) {
      var linechartDate = "Comparison Period: " + that.dateformats(LineChartData['indexValues'][0]['date']) + " to " + that.dateformats(LineChartData['indexValues'][LineChartData['indexValues'].length - 1]['date']) + "*";
      select('#indexStacompDate').text(linechartDate);
      LineChartData['indexValues'].forEach(function (d:any) {
        var isoDate = new Date(d['date']);
        var dd = Date.UTC(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
        var val = [];
        val.push(dd);
        val.push(d['indexValue']);
        indexValue.push(val);
      });
    }

    if (isNotNullOrUndefined(LineChartData['bmIndexValues'])) {
      LineChartData['bmIndexValues'].forEach(function (d:any) {
        var isoDate = new Date(d['date']);
        var dd = Date.UTC(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
        var val = [];
        val.push(dd);
        val.push(d['indexValue']);
        indexValue1.push(val);
      });
    }

    var series:any = [], navseries:any = [];
    series.push({
      name: this.selIndexName, color: 'var(--prim-button-color)',
      marker: { symbol: '' }, data: indexValue, lineWidth: 0.8
    });
    navseries.push({ data: indexValue });
    if (isNotNullOrUndefined(LineChartData['bmIndexValues'])) {
      series.push({
        name: BMindexName,
        color: '#9999ab', marker: { symbol: '' },
        data: indexValue1, lineWidth: 0.8
      });
      navseries.push({ data: indexValue1 });
    }

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
        text: "",
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
          formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, ',') }

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
            lineColor: '#565674',
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

  formatCharData(Data:any) {
    var that = this;
    var chartTitle = "";
    var etfvalue:any = [];
    var date:any = [];
    var uindexvalue:any = [];
    if (Data.length > 0) {
      Data.forEach((x:any) => {
        if (isNotNullOrUndefined(x['top100']) && isNotNullOrUndefined(x['range']) && x['range'] != "" && x['top100'] != "") {
          date.push(x['date']);
          etfvalue.push(x['top100']);
          //uindexvalue.push(x['range']);
        }
      });
    }
    var customizeSelectedIndex = this.preBuiltService.prebuiltIndexBrcmData.value[this.preBuiltService.prebuiltIndexBrcmData.value.length - 1];
    if (customizeSelectedIndex.group == 'subCategory') { uindexvalue = []; }
    var series:any = [];
    if (uindexvalue.length > 0) {
      series.push({
        name: that.selIndexName,
        marker: {
          symbol: 'circle'
        },
        color: 'var(--prim-button-color)',
        data: uindexvalue,
        lineWidth: 0.8
      });
    }
    series.push({
      name: that.selIndexName,
      marker: {
        symbol: ''
      },
      color: '#9b9b9b',
      data: etfvalue,
      lineWidth: 0.8
    });


    Highcharts.chart({
      chart: {
        renderTo: 'lineChartBuyModel',
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

  barChart() {
    var that = this;
    var series:any = [];
    var categories: any = [];
    var dta = [...that.preBuiltService.exclusionCompData.value].map(a => ({ ...a }));
    var sectorData: any = this.preBuiltService.createSector([...dta]);
    categories = [...new Set(sectorData.map((x: { name: any; }) => x.name))];
    var data1: any = sectorData.map((x: any) => parseFloat(format(",.2f")(x.indexWeight)));
    series.push({ 'name': that.selIndexName, 'data': data1, 'color': 'var(--prim-button-color)' });
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
        labels: {
          overflow: 'justify',
          style: {
            fontSize: '11px'
          }
        }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' +
            this.series.name + ': ' + this.y + '%'
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

  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any> | any;
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    var target = event.target as HTMLDivElement;
    const scrollableElement = this.widgetsContent.nativeElement;
    const isAtEnd = Math.round(scrollableElement.scrollLeft) + scrollableElement.offsetWidth + 1 >= scrollableElement.scrollWidth;
    if (isAtEnd) {
        const element = document.getElementById('rightNav');
      if (element) {
        element.classList.add('scrollBtn');
      }
    } else {
      const element = document.getElementById('rightNav');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }
    if (target.scrollLeft == 0){
      const element = document.getElementById('leftNav');
      if (element) {
        element.classList.add('scrollBtn');
      }
    }
    else{
      const element = document.getElementById('leftNav');
      if (element) {
        element.classList.remove('scrollBtn');
      }
    }

  }

  scrollRight(){
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 400), behavior: 'smooth' });
  }
  
   scrollLeft(): void {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 400), behavior: 'smooth' });
  }
  percentageFormate(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00%'; }
    else { return this.numberWithCommas((value).toFixed(2)) + "%" }
  }
  numberWithCommas(x:any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  perfData: any = { years: [], ETFind: {}, Uindex: {} };
  formatPerfData(Data:any) {
    if (Data.length > 0) {
      var dta = Data[0]['etfPerformanceYears'];
      var ETFind:any = {};
      var Uindex:any = {};
      this.perfData.years = [...new Set(dta.map((x:any) => x.year))].sort(function (x: any, y: any) { return descending(x, y); });

      if (dta.length > 0 && isNotNullOrUndefined(dta[0]['type']) && dta[0]['type'] == "Strategy") {
        this.perfData.years.forEach((d: any) => {
          var ETF = dta.filter((x: any) => x.type == "Strategy" && x.year == d);
          ETFind[d] = ETF[0]['yearReturns'];
        });
        this.perfData.ETFind = ETFind;
        this.perfData.Uindex = {};
      } else {
        this.perfData.years.forEach((d:any) => {
          var ETF = dta.filter((x: any) => x.type == "ETF" && x.year == d);
          ETFind[d] = ETF[0]['yearReturns'];
          var Uind = dta.filter((x: any) => x.type == "Uindex" && x.year == d);
          Uindex[d] = Uind[0]['yearReturns'];
        });
        this.perfData.ETFind = ETFind;
        this.perfData.Uindex = Uindex;
      }
    }
    else {
      this.perfData.years = [];
      this.perfData.ETFind = {};
      this.perfData.Uindex = {};
    }
   
  }

  downloadPDF() {
    var that = this;
    if (this.showLoad1) { } else {
    var indexId = that.Indexid;
    let factsheetParameter = {
      'Indexid': indexId,
      'asofDate': that.asOfDate,
      userid: atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)))
      };
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
        a.download = that.sharedData.downloadTitleConvert(this.preBuiltService._customizeSelectedIndex_prebuilt.indexname.replace('New Age Alpha ', 'NAA ')) + "_Factsheet.pdf";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
      else {
        this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      }
      this.showLoad = false;
    }, error => {
      this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
        timeOut: 10000,
        positionClass: 'toast-top-center'
      }); this.showLoad = false;
    });
    this.sharedData.userEventTrack("Prebuilt Strategies", "index factsheet", that.selIndexName, 'Export Index Factsheet Click');
  }
  }

  downloadMonthEndPDF() {
    var that = this;
    if (this.showLoad5) { } else {
    var indexId = that.Indexid;
      let factsheetParameter = { 'indexId': indexId, };     
      this.showLoad5 = true;
      var PFMD=this.dataService.PrebuilfactsheetdataMonthend(factsheetParameter).subscribe((event) => {        
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], { type: data.body?.type });
        if (downloadedFile.type != "" && (downloadedFile.type == "application/pdf" || downloadedFile.type == "application/octet-stream")) {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
          a.download = that.sharedData.downloadTitleConvert(this.preBuiltService._customizeSelectedIndex_prebuilt.indexname.replace('New Age Alpha ', 'NAA ')) + "_Monthly_Factsheet.pdf";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
      else {
        this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      }
      this.showLoad5 = false;
      }, error => {
      this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
        timeOut: 10000,
        positionClass: 'toast-top-center'
      }); this.showLoad5 = false;
      });
      this.subscriptions.add(PFMD);
    this.sharedData.userEventTrack("Prebuilt Strategies", "index factsheet", that.selIndexName, 'Export Month End Index Factsheet Click');
  }
  } 

  checkEmptyObj(data: any) { if (Object.keys(data).length > 0) { return true } else { return false } };

  downloadExcel() {
    var that = this;
    if (this.showLoad2) { } else {
    var MonthlyreturnsRequest = {
      'Indexid': that.Indexid
    }
    var monthlyreturns: any[];
    var previousMonthHoldings: any[];
    var currentMonthHoldings: any[];
    monthlyreturns = [];
    previousMonthHoldings = [];
    currentMonthHoldings = [];
    var indexcode: any;
    var indexname: any;
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet('Monthly Returns');
    this.showLoad2 = true;
    this.httpClient.post(this.MonthlyReturnAPI_URL, MonthlyreturnsRequest).pipe(first()).subscribe((data: any) => {
      monthlyreturns = data['monthlyreturns'];
      indexcode = monthlyreturns[0]['indexcode'];
      indexname = monthlyreturns[0]['indexName'];
      currentMonthHoldings = data['currentMonthHoldings'];
      previousMonthHoldings = data['previousMonthHoldings'];
      var tabBody: any = [];
      monthlyreturns.forEach((item: any) => { tabBody.push([item.date, item.returns]); });
      let d = new Date();
      var date = this.formatedates(d.getMonth() + 1) + '/' + this.formatedates(d.getDate()) + '/' + d.getFullYear();
      var monthyear = this.formatedates(d.getMonth() + 1) + '/' + d.getFullYear();


      var str: any;
      str = "Monthly Returns " + monthlyreturns[0]['date'];
      ws.addRow([str]).font = { bold: true };
      str = indexname + "(" + indexcode + ")";
      ws.addRow([str]).font = { bold: true };
      str = "Report Date: " + date + " (MM/DD/YYYY)";
      ws.addRow([str]).font = { bold: true };

      ws.addRow("");
      var header = ws.addRow(['Date', 'Returns'])
      header.font = { bold: true };
      tabBody.forEach((d: any, i: any) => { ws.addRow(d) });

      ws.columns.forEach(column => {
        if (column.number == 2) {
          column.alignment = { horizontal: 'right' };

        }

      })



      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }

      if (currentMonthHoldings.length > 0) {

        var tabBody1: any = [];
        currentMonthHoldings.forEach((item: any) => { tabBody1.push([item.ticker, item.company, item.weight]); });
        var ds1 = new_workbook.addWorksheet("Current Month Holdings");
        var str1: any;
        str1 = "Current Month Holdings " + currentMonthHoldings[0]['effectiveDate'];
        ds1.addRow([str1]).font = { bold: true };
        str1 = indexname + "(" + indexcode + ")";
        ds1.addRow([str1]).font = { bold: true };
        str1 = "Report Date: " + date + " (MM/DD/YYYY)";
        ds1.addRow([str1]).font = { bold: true };


        ds1.addRow("");
        var header1 = ds1.addRow(['Ticker', 'Company', 'Weight'])
        header1.font = { bold: true };
        tabBody1.forEach((d: any, i: any) => { ds1.addRow(d) });

        ds1.columns.forEach(column => {
          if (column.number == 3) {
            column.alignment = { horizontal: 'right' };
          }
        })

        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }

      if (previousMonthHoldings.length > 0) {


        var tabBody2: any = [];
        previousMonthHoldings.forEach((item: any) => { tabBody2.push([item.ticker, item.company, item.weight]); });
        var ds = new_workbook.addWorksheet("Previous Month Holdings");
        var str2: any;
        str2 = "Previous Month Holdings  " + previousMonthHoldings[0]['effectiveDate'];
        ds.addRow([str2]).font = { bold: true };
        str2 = indexname + "(" + indexcode + ")";
        ds.addRow([str2]).font = { bold: true };
        str2 = "Report Date: " + date + " (MM/DD/YYYY)";
        ds.addRow([str2]).font = { bold: true };

        ds.addRow("");
        var header2 = ds.addRow(['Ticker', 'Company', 'Weight'])
        header2.font = { bold: true };
        tabBody2.forEach((d: any, i: any) => { ds.addRow(d) });
        ds.columns.forEach(column => {
          if (column.number == 3) {
            column.alignment = { horizontal: 'right' };
          }
        })
        ds.addRow("");
        ds.addRow([]);
        ds.addRow(["For Internal Use Only"]).font = { bold: true }
      }

      //Disclosures 1
      if (that.sharedData.compDis.length > 0) {
        var ds = new_workbook.addWorksheet("Disclosure I");
        ds.addRow(["Disclosures I"]).font = { bold: true };
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
        ds1.addRow(["Disclosures II"]).font = { bold: true };
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

      var fileName = indexcode + "_Returns_Holdings_" + this.datepipe.transform(d, 'yyyyMMdd');
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, fileName + '.xlsx');
        this.showLoad2 = false;
      },
        err => {
          this.showLoad2 = false;
          this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });

        }

      );

    }
    );
    this.sharedData.userEventTrack("Prebuilt Strategies", "Monthly Returns & Holdings", that.selIndexName, 'Export Monthly Returns & Holdings Click');
  }
  }
  CheckMenuPermission(menuname: any) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var req = { "MenuName": menuname, "Userid": userid };
    this.httpClient.post(this.MenuPremissionCheck, req).pipe(first()).subscribe((data: any) => {
      var d: number = data["menuid"];
      if (d > 0) {

        if (menuname == "IndexReturnsHistory")
          that.ReturnsHistorymenuflag = true;
        else if (menuname == "IndexHoldingsHistory")
          that.HoldingsHistorymenuflag = true;
      };
    });

  }

  downloadHoldingsExcel() {
    var that = this;
    if (this.showLoad4) { } else {
    var MonthlyreturnsRequest = { 'Indexid': that.Indexid };
    var previousYearHoldings: any[];
    previousYearHoldings = [];
    var indexcode: any;
    var indexname: any;
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet('Returns History');
    this.showLoad4 = true;
    this.httpClient.post(this.HoldingsHistoryAPI_URL, MonthlyreturnsRequest).pipe(first()).subscribe((data: any) => {
      this.showLoad4 = true;
      indexcode = data.indexcode;
      indexname = data.indexName;
      let d = new Date();
      var date = this.formatedates(d.getMonth() + 1) + '/' + this.formatedates(d.getDate()) + '/' + d.getFullYear();
      var monthyear = this.formatedates(d.getMonth() + 1) + '/' + d.getFullYear();

      var myVariable = date;

      let new_workbook = new Workbook();

      var holdingshistory: any[]
      holdingshistory = [];
      holdingshistory = data.historyHoldingslist;


      var tabBody2: any = [];
      holdingshistory.forEach((item1: any) => {

        let effdate2 = new Date(item1.effectiveDate);
        var effdate = this.formatedates(effdate2.getMonth() + 1) + '/' + this.formatedates(effdate2.getDate()) + '/' + effdate2.getFullYear();


        tabBody2.push([effdate, item1.isin, item1.ticker, item1.company, item1.weight]);
      });
      var ds = new_workbook.addWorksheet("Holdings Hsitory");
      var str2: any;
      str2 = "Holdings History";
      ds.addRow([str2]).font = { bold: true };
      str2 = indexname + "(" + indexcode + ")";
      ds.addRow([str2]).font = { bold: true };
      str2 = "Report Date: " + date + " (MM/DD/YYYY)";
      ds.addRow([str2]).font = { bold: true };

      ds.addRow("");
      var header2 = ds.addRow(['Date', 'ISIN', 'Ticker', 'Company', 'Weight'])
      header2.font = { bold: true };
      tabBody2.forEach((d: any, i: any) => { ds.addRow(d) });
      ds.columns.forEach(column => {
        if (column.number == 5) {
          column.alignment = { horizontal: 'right' };
        }
      })
      ds.addRow("");

      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }

      //Disclosures 1
      if (that.sharedData.compDis.length > 0) {
        var ds = new_workbook.addWorksheet("Disclosure I");
        ds.addRow(["Disclosures I"]).font = { bold: true };
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
        ds1.addRow(["Disclosures II"]).font = { bold: true };
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

      var fileName = indexcode + "_Historical_Holdings_" + this.datepipe.transform(d, 'yyyyMMdd');
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, fileName + '.xlsx');
        this.showLoad4 = false;
      },
        err => {
          this.showLoad4 = false;
          this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });

        }
      );


    });
    this.sharedData.userEventTrack("Prebuilt Strategies", "Holdings History", that.selIndexName, 'Export Holdings History Click');
  }
  }

  downloadReturnsExcel() {
    var that = this;
    if (this.showLoad3) { } else {
    var MonthlyreturnsRequest = { 'Indexid': that.Indexid }
    var monthlyreturns: any[];
    var previousMonthHoldings: any[];
    var currentMonthHoldings: any[];
    monthlyreturns = [];
    previousMonthHoldings = [];
    currentMonthHoldings = [];
    var indexcode: any;
    var indexname: any;
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet('Returns History');
    this.showLoad3 = true;
    this.httpClient.post(this.ReturnHistoryAPI_URL, MonthlyreturnsRequest).pipe(first()).subscribe((data: any) => {
      monthlyreturns = data
      indexcode = data[0]['indexcode'];
      indexname = monthlyreturns[0]['indexName'];
      var tabBody: any = [];
      monthlyreturns.forEach((item: any) => { tabBody.push([item.date, item.returns]); });
      let d = new Date();
      var date = this.formatedates(d.getMonth() + 1) + '/' + this.formatedates(d.getDate()) + '/' + d.getFullYear();
      var monthyear = this.formatedates(d.getMonth() + 1) + '/' + d.getFullYear();


      var str: any;
      str = "Returns History";
      ws.addRow([str]).font = { bold: true };
      str = indexname + "(" + indexcode + ")";
      ws.addRow([str]).font = { bold: true };
      str = "Report Date: " + date + " (MM/DD/YYYY)";
      ws.addRow([str]).font = { bold: true };

      ws.addRow("");
      var header = ws.addRow(['Date', 'Returns'])
      header.font = { bold: true };
      tabBody.forEach((d: any, i: any) => { ws.addRow(d) });

      ws.columns.forEach(column => {
        if (column.number == 2) {
          column.alignment = { horizontal: 'right' };

        }

      });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }


      //Disclosures 1
      if (that.sharedData.compDis.length > 0) {
        var ds = new_workbook.addWorksheet("Disclosure I");
        ds.addRow(["Disclosures I"]).font = { bold: true };
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
        ds1.addRow(["Disclosures II"]).font = { bold: true };
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

      var fileName = indexcode + "_Historical_Returns_" + this.datepipe.transform(d, 'yyyyMMdd');
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, fileName + '.xlsx');
        this.showLoad3 = false;
      },
        err => {
          this.showLoad3 = false;
          this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });

        }
      );
    }
    );

    this.sharedData.userEventTrack("Prebuilt Strategies", "Returns History", that.selIndexName, 'Export Returns History Click');
  }
  }
  checkNull(d: any, key: string) { if (isNotNullOrUndefined(d)&& d.length>0 && isNotNullOrUndefined(d[0][key])) { return true } else { return false } };
  
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
}
