import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as d3 from 'd3';
// @ts-ignore
import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-performance-popup',
  templateUrl: './performance-popup.component.html',
  styleUrl: './performance-popup.component.scss'
})
export class PerformancePopupComponent {
  dialogTitle: string = '';
  dialogData: any;
  selectedIndex: any;
  LineChartData: any = [];
  BMvalue: string = '';
  constructor(public sharedData: SharedDataService, private dialogref: MatDialogRef<PerformancePopupComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    var that = this;
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.selectedIndex = this.modalData.selectedIndex;
    this.LineChartData = this.dialogData;
    this.BMvalue = this.modalData.BMData;
    if (this.BMvalue == '') {
      this.BMvalue = this.selectedIndex[0]['benchMark'];
    }
    setTimeout(function () {
      if (isNotNullOrUndefined(that.selectedIndex) && that.selectedIndex.length > 0) {
        if (that.selectedIndex[0]['type'] == "Index") { that.lineChart(); } else { that.formatCharData(that.dialogData) }
      }
      
    }.bind(this), 500)
    
    //this.selectedDirectIndex = this.modalData.selectedIndex;
    //this.load(this.selectedDirectIndex)
  }
  closeModal() {
    this.dialogref.close();
  }
  lineChart() {
    var that = this;
    var indexValue:any = [];
    var indexValue1:any = [];
    var BMD = this.LineChartData['bmIndexValues'];

    if (isNotNullOrUndefined(this.LineChartData['indexValues'])) {
      var linechartDate = "Comparison Period: " + that.dateformats(this.LineChartData['indexValues'][0]['date']) + " to " + that.dateformats(this.LineChartData['indexValues'][this.LineChartData['indexValues'].length - 1]['date']) + "*";
      d3.select('#indexStacompDate').text(linechartDate);
      this.LineChartData['indexValues'].forEach(function (d:any) {
        var isoDate = new Date(d['date']);
        var dd = Date.UTC(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
        var val = [];
        val.push(dd);
        val.push(d['indexValue']);
        indexValue.push(val);
      });
    }

    if (isNotNullOrUndefined(this.LineChartData['bmIndexValues'])) {
      this.LineChartData['bmIndexValues'].forEach(function (d:any) {
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
      name: this.selectedIndex[0]['indexName'], color: 'var(--prim-button-color)',
      marker: { symbol: '' }, data: indexValue, lineWidth: 0.8
    });
    navseries.push({ data: indexValue });
    if (isNotNullOrUndefined(BMD) && BMD.length > 0) {
      series.push({
        name: this.BMvalue,
        color: 'var(--leftSideText)', marker: { symbol: '' },
        data: indexValue1, lineWidth: 0.8
      });
      navseries.push({ data: indexValue1 });
    }
    var lineCharts = document.getElementById('cumulativeLineChart_Default');

    if (lineCharts != null || lineCharts != undefined) {
      Highcharts.setOptions({
        lang: {
          thousandsSep: ','
        }
      });
      Highcharts.stockChart({
        chart: {
          renderTo: lineCharts,
          type: 'spline',
          style: { fontFamily: 'var(--ff-medium)' },
          events: {
            render: function () { Highcharts.each(this.series, function (s:any) { if (s.visible) { } }); }
          }
        },
        exporting: {
          enabled: true,
          buttons: {
            contextButton: {
              menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
            },
          },
        },
        credits: { enabled: false },
        title: { text: '' },
        navigator: {
          enabled: true,
          adaptToUpdatedData: true,
          series: navseries,
        },
        scrollbar: { enabled: false },
        rangeSelector: { enabled: false, },
        subtitle: { text: '' },
        legend: { enabled: true, itemDistance: 50 },
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function () {
              let d = new Date(this.value);
              var currentMonth: any = (d.getMonth() + 1);
              if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
              return (currentMonth + '/' + d.getFullYear().toString());
            }
          }
        },
        yAxis: {
          opposite: false,
          title: { text: '' },
          labels: { formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); } }
        },
        tooltip: {
          valueDecimals: 2,
          //crosshairs: true,
          shared: true
        },
        plotOptions: {
          spline: {
            marker: {
              radius: 0.1,
              lineColor: '#666666',
              lineWidth: 0.1
            }
          },/* series: { events: { legendItemClick: function (e:any) { e.preventDefault(); } } }*/
        },
        series: series
      });
    }
  }

  formatCharData(Data: any) {
    var that = this;
    var chartTitle = "";
    var etfvalue: any = [];
    var date: any = [];
    var uindexvalue: any = [];
    if (Data.length > 0) {
      Data.forEach((x: any) => {
        if (isNotNullOrUndefined(x['top100']) && isNotNullOrUndefined(x['range']) && x['range'] != "" && x['top100'] != "") {
          var isoDate = new Date(x['date']);
          var dd = Date.UTC(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
          var val = [];
          val.push(dd);
          val.push(x['top100']);
          etfvalue.push(val);
        }
      });
    }
    var series: any = [];
    
    series.push({
      name: this.selectedIndex[0]['indexname'],
      marker: {
        symbol: ''
      },
      color: 'var(--prim-button-color)',
      data: etfvalue,
      lineWidth: 0.8
    });

    var lineCharts:any = document.getElementById('cumulativeLineChart_Default');
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
    Highcharts.stockChart({
      chart: {
        renderTo: lineCharts,
        type: 'spline',
        style: { fontFamily: 'var(--ff-medium)' },
        events: {
          render: function () { Highcharts.each(this.series, function (s: any) { if (s.visible) { } }); }
        }
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
          },
        },
      },
      credits: { enabled: false },
      title: { text: '' },
      navigator: {
        enabled: true,
        adaptToUpdatedData: true,
        series: series,
      },
      scrollbar: { enabled: false },
      rangeSelector: { enabled: false, },
      subtitle: { text: '' },
      legend: { enabled: true, itemDistance: 50 },
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          }
        }
      },
      yAxis: {
        opposite: false,
        title: { text: '' },
        labels: { formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); } }
      },
      tooltip: {
        valueDecimals: 2,
        //crosshairs: true,
        shared: true
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 0.1,
            lineColor: '#666666',
            lineWidth: 0.1
          }
        }, /*series: { events: { legendItemClick: function (e:any) { e.preventDefault(); } } }*/
      },
      series: series
    });
  }

  dateformats(date:any) {
    if (date === undefined || date === null) { return "-"; }
    else {
      var d = new Date(date);
      var month = d.toLocaleString('default', { month: 'long' });
      return (month + ' ' + d.getDate() + ', ' + d.getFullYear());
    }
  }
}
