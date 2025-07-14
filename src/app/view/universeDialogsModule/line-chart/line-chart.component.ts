import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription, first } from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../core/services/data/data.service';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
declare var $: any;
import { Options, LabelType } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnInit, OnDestroy {

  lgChart: any;
  SRValue: number = 0;
  initSrVal: number = 0;
  selGICS: any;
  industryCode: any;
  chartTitle: string = "";
  CType: string = "";
  breadcrumbdata: any = [];
  from: string = "";
  subscriptions = new Subscription();
  value: number = 0;
  showSlider: boolean = false;
  showNGX_slide: boolean = false;
  showSpinnerAcc_loaded: boolean = true;
  manualRefresh: EventEmitter<void> = new EventEmitter<void>();
  options: Options = {
    floor: 0,
    ceil: 95,
    tickStep: 5,
    tickValueStep: 5,
    step: 5,
    showTicks: true,
    showSelectionBar: true,
    getLegend: (value: number): string => {
      if (value == 0) { return 'All' } else { return ''+value; }
     
    }
  };
  emitManualRefresh() {
    setTimeout(() => {
      this.manualRefresh.emit();
      this.showNGX_slide = true;
    }, 500);
  }
  constructor(public sharedData: SharedDataService, @Inject(MAT_DIALOG_DATA) public modalData: any, private equityService: EquityUniverseService,
    public dataService: DataService, private dialogref: MatDialogRef<LineChartComponent>,) {
    $('#rangeLdrModal').fadeIn();
    this.showSpinnerAcc_loaded = true; 
    // setTimeout(() => { this.showSpinnerAcc_loaded = true; }, 300)
  }

  ngOnInit() {
    var that = this;
    try {
      that.from = that.modalData.dialogSource['from'];
      that.selGICS = that.modalData.dialogSource['selGICS'];
      that.SRValue = that.modalData.dialogSource['SRValue'];
      that.CType = that.modalData.dialogSource['CType'];
      that.breadcrumbdata = that.modalData.dialogSource['breadcrumb'];
      var filter = that.breadcrumbdata.filter((x:any) => x.group == 'ETFIndex' || x.group == 'Index');
      if (filter.length > 0) {
        this.chartTitle = filter[0].name;
      } else { this.chartTitle = ''; }
      this.showSlider = true;
      this.emitManualRefresh();
      this.createChart();
    } catch (e) { console.log(e) }
  }

  onInput(value: any) {
    var that = this;
    var val: any = 0;
    if (isNotNullOrUndefined(value) && isNotNullOrUndefined(value.value)) { val = value.value; }
    //if (isNotNullOrUndefined(ev.target.value)) { val = ev.target.value; }
    that.SRValue = parseInt(val);
    that.createChart();
    $('#rangeLdrModal').fadeIn();
    this.showSpinnerAcc_loaded = true;
    // setTimeout(() => { this.showSpinnerAcc_loaded = true; }, 300)
  }

  closeModal() { this.dialogref.close() }

  ngOnDestroy() {
    this.dialogref.close({ SRValue: this.SRValue })
    this.subscriptions.unsubscribe();
  }

  createChart() {
    var that = this;
    var indexid: number = 123;
    let indexValue: any = [];
    let date: any = [];
    var srVal = that.SRValue;
    if (srVal != 100) { srVal = 100 - srVal; }
    var toprange = 'top' + (srVal);
    if (that.from == 'equityUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['indexId'])) { indexid = index['indexId']; }
    }
    if (isNotNullOrUndefined(this.selGICS) && (isNotNullOrUndefined(this.selGICS.code) || isNotNullOrUndefined(this.selGICS.assetId))) {
      this.industryCode = (that.CType == 'ETF') ? this.selGICS.hasOwnProperty('assetId') ? this.selGICS.assetId : 0 : this.selGICS.hasOwnProperty('code') ? this.selGICS.code : 0;
    } else {
      this.industryCode = 0;
      if (that.CType == 'MC') { indexid = this.equityService.getMyIndexId(this.selGICS); };
    }
    if (isNotNullOrUndefined(this.selGICS) && isNotNullOrUndefined(this.selGICS['indexType']) && this.selGICS['indexType'] === "Global Universe") { indexid = 137; }
    const getIndexPreRunsSubs = this.dataService.getIndexPreRuns(indexid, that.industryCode, that.CType, toprange).pipe(first()).subscribe((res: any) => {
      that.subscriptions.add(getIndexPreRunsSubs);
      try { if (that.CType == 'ETF') res = this.filterETFCurrentData(res); } catch (e) { console.log(e) }

      if (that.lgChart != null) {
        that.lgChart.destroy();
        that.lgChart = null;
      }
      if (res.length > 0) {
        let indexValue1 = [];
        for (let i = 0; i <= (res.length - 1); ++i) {
          indexValue1.push(res[i]['top100']);
          date.push(res[i]['date']);
        }
        var d = new Date(date[date.length - 1]);
        var formatdate = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
        var series: any = [];
        series.push({
          name: "All  (" + formatdate + ' : ' + this.sharedData.numberWithCommas(indexValue1[indexValue1.length - 1].toFixed(2)) + ")",
          marker: {
            symbol: ''
          },
          color: 'var(--leftSideText)',
          data: indexValue1,
          lineWidth: 0.8
        });
        if (that.SRValue <= 100 && that.SRValue > 0) {
          for (let i = 0; i <= (res.length - 1); ++i) {
            indexValue.push(res[i]["range"]);
            date.push(res[i]['date']);
          }
          var d = new Date(date[date.length - 1]);
          var formatdate1 = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();

          series.push({
            name: "Top " + (+srVal.toFixed(0)) + "% (" + formatdate1 + ' : ' + this.sharedData.numberWithCommas(indexValue[indexValue.length - 1].toFixed(2)) + ")",
            marker: {
              symbol: 'circle'
            },
            color: 'var(--prim-button-color)',
            data: indexValue,
            lineWidth: 0.8
          });
        }
        setTimeout(() => { $('#rangeLdrModal').fadeOut(); },300)
        setTimeout(() => { this.showSpinnerAcc_loaded = false; }, 300)
       

        Highcharts.setOptions({
          lang: {
            thousandsSep: ','
          }
        });
        that.lgChart = Highcharts.chart({
          chart: {
            renderTo: 'lineChartModal',
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
            text: that.chartTitle,
            style: {
              color: 'var(--leftSideText-B)',
              fontSize: '13px',
              fontFamily: 'var(--ff-regular)',
              fontWeight: 'normal',
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
            lineWidth: 1,
            lineColor: '#2f2f41',
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
            series: { 'cursor': 'pointer', point: { events: { click: function (e) { } } } }
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
        that.lgChart.xAxis[0].labelGroup.element.childNodes.forEach(function (label: any) {
          label.style.cursor = "pointer";
          label.onclick = function () { }
        });
      }
    });
  }

  filterETFCurrentData(res: any) {
    let result = [];
    if (this.breadcrumbdata.length > 0) {
      var index: any = this.modalData.dialogSource['index'];
      let holdingsDate = this.breadcrumbdata[1].holdingsdate;
      if (isNotNullOrUndefined(index)) { holdingsDate = index.holdingsdate }
      if (isNotNullOrUndefined(holdingsDate)) holdingsDate = holdingsDate.split('/')[2] + holdingsDate.split('/')[0] + holdingsDate.split('/')[1];
      for (let i = 0; i < res.length; i++) {
        let integerdate = res[i]['date'].split('/')[2] + res[i]['date'].split('/')[0] + res[i]['date'].split('/')[1];
        if (integerdate <= holdingsDate) { result.push(res[i]); }
      }
    }
    return result;
  }
}
