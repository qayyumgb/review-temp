import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
More(Highcharts);
import * as d3 from 'd3'
@Component({
  selector: 'pre-strategy-circle',
  templateUrl: './strategy-circle.component.html',
  styleUrl: './strategy-circle.component.scss'
})
export class StrategyCircleComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  donutChartData: any = undefined;
  donutName: string = "";
  tradeDt:string = '';
  sinceDt:string = '';
  constructor(public sharedData: SharedDataService, public preBuiltService: PrebuildIndexService) { }
  ngOnInit() {
    var that = this;
    var prebuiltIndexBrcmData = that.preBuiltService.prebuiltIndexBrcmData.subscribe((res: any) => {
      if (isNotNullOrUndefined(this.preBuiltService._selNaaIndex['category']) && this.preBuiltService._selNaaIndex['category'] == "Family Indexes") { }
      else if (isNotNullOrUndefined(res) && res.length > 0) { this.onloadStgyData(); };
    });
    that.subscriptions.add(prebuiltIndexBrcmData);

    var familyindexsector = this.preBuiltService.familyindexsectorData.subscribe(data => {
      if (isNotNullOrUndefined(this.preBuiltService._selNaaIndex['category']) && this.preBuiltService._selNaaIndex['category'] == "Family Indexes") { this.loadFamilyDonutChartGraph(data); }
    });
    this.subscriptions.add(familyindexsector);
  }

  onloadStgyData() {
    var that = this;
    var data: any = this.preBuiltService._selNaaIndex;
    // that.sharedData.showCenterLoader.next(false);
    that.sharedData.showMatLoader.next(false);
    if (data.group == "Category" || data.group == 'main') {
      that.donutChartData = undefined;
      that.donutChartGraph(data);
    } else if (data.group == "subCategory") {
      var m_cat = data.category.trim();
      that.donutName = m_cat;
      var m_name = data.name.trim();
      var getdonutchrt:any = that.preBuiltService.naaDonutchart;
      if (isNotNullOrUndefined(getdonutchrt[m_cat]) && isNotNullOrUndefined(getdonutchrt[m_cat][m_name])) {
        var filterdDonut = getdonutchrt[m_cat][m_name];
        if (isNotNullOrUndefined(filterdDonut) && filterdDonut.length > 0) {
          that.donutChartData = filterdDonut[0];
          that.donutChartGraph(data);
        }
      } else {
        that.donutChartData = undefined;
        that.donutChartGraph(data);
      }
    }
  }

  converttoNum(dta: any) {
    var s = dta.replaceAll('%', "");
    return parseFloat(s);
  }

  loadFamilyDonutChartGraph(data: any) {
    var that = this;
    this.sharedData.showMatLoader.next(false);
    that.sharedData.showCircleLoader.next(false);
    // this.sharedData.showCenterLoader.next(false);
    d3.select('#naaLineChart').select('svg').selectAll('.since').remove();
    d3.select('#naaLineChart').style('display', 'block');
    var chartTitle = "";
    var series:any = [];
    var s_data:any = [];
    var chktooltip = "show";
    var name: string = '';
    var selIndex = this.preBuiltService.selNaaIndex.value;
    if (isNotNullOrUndefined(selIndex) && isNotNullOrUndefined(selIndex['indexname'])) { name = selIndex['indexname']; }
    if (isNotNullOrUndefined(data) && data.length > 0) {
      data.forEach((resData:any) => { s_data.push([resData['componentIndexName'], resData['weight']]) });
      chktooltip = "show";
    }
    else {
      s_data = [[name, 100]];
      chktooltip = "hide";
    }

    series.push({
      name: name,
      marker: { symbol: '' },
      color: '#9b9b9b',
      data: s_data,
      size: '100%',
      innerSize: '88%',
      showInLegend: false,
      dataLabels: { enabled: false }
    });
    Highcharts.setOptions({ colors: ["#12497D", "#175EA1", "#1C73C4", "#2988E0", "#4C9CE6", "#70AFEB", "#94C3F0", "#6CA8C6", "#6EDCED", "#49D3E9", "#25CBE4", "#19B0C8", "#128091", "#0B515B", "#B8D7F5",] });

    Highcharts.chart({
      chart: {
        renderTo: 'naaLineChart', type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'var(--ff-medium)' },
        zooming: {
          mouseWheel: false
        }
      },
      exporting: {
        url: 'https://export.highcharts.com/', enabled: true,
        buttons: { contextButton: { menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'], }, },
      },
      credits: { enabled: false },
      title: { text: chartTitle, style: { color: '#394e8b', fontSize: '15px', fontFamily: 'var(--ff-medium)', } },
      subtitle: { text: '' }, legend: {},
      xAxis: {
        tickColor: '#f1f1f1', tickWidth: 1,
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          },
          style: { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '10px', color: '#333', fontSize: '10px', }
        }
      },
      yAxis: {
        maxPadding: 0.2, title: { text: '' },
        labels: {
          style: { color: '#333', fontSize: '10px' },
          formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); }
        }
      },
      plotOptions: {
        pie: {
          shadow: false,
          borderColor: 'var(--border)'
        },
        series: {
          animation: false
        }
      },
      tooltip: {
        enabled: true,
        formatter: function () {
          if (chktooltip == "show") {
            return '<b>' + this.point.name + '</b>: ' + this.y + ' %';
          }
          else { return '<b>' + this.point.name + '</b>'; }

        }
      },
      series: series,
      lang: { noData: "No data to display", },
      noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } }
    });

    //Center circle text 
    var C_name = 'NAA Index';
    var C_subname = name;
    var dd = d3.select('#naaLineChart').select('svg');
    var innercircle = dd.append('g');
    innercircle.append('circle').attr('r', 162).attr('transform', 'translate(200, 198)').attr('fill', 'none').attr('stroke', 'var(--primary-color)').attr('stroke-width', '1rem');
    innercircle.append('circle').attr('r', 155).attr('transform', 'translate(200, 198)').attr('fill', 'none').attr('stroke', 'var(--leftSideText-B)').attr('stroke-width', '1px');
    var c = dd.append('g').attr('class', 'category').attr('transform', 'translate(200, 150)');
    c.append('text').attr('class', 'name').text(C_name).attr('y', 0);
    setTimeout(() => { c.append('text').attr('class', 'subname').text(C_subname).attr('y', 28).attr('x', 0).call(that.sharedData.wrappingtxt, 190, "top", 100); }, 100);

  }

  donutChartGraph(d:any) {
    d3.select('#naaLineChart').select('svg').selectAll('.since').remove();
    d3.select('#naaLineChart').style('display', 'block');
    var that = this;
    var chartTitle = "";
    var series:any = [];
    var s_data: any = [];
    var chktooltip = "show";
    if (isNotNullOrUndefined(that.donutChartData)) {
      s_data = [["Equity", that.converttoNum(that.donutChartData['Equity'])], ["Fixed income", that.converttoNum(that.donutChartData['Fixed income'])], ["Commodity", that.converttoNum(that.donutChartData['Commodity'])], ["Cash", that.converttoNum(that.donutChartData['Cash'])]];
      chktooltip = "show";
    }
    else {
      s_data = [[d.name, 100]];
      chktooltip = "hide";
    }
    series.push({
      name: d.name,
      marker: { symbol: '' },
      color: '#9b9b9b',
      data: s_data,
      size: '100%',
      innerSize: '88%',
      showInLegend: false,

      dataLabels: {
        enabled: false
      }
    });
    Highcharts.setOptions({
      colors: ['#045eb5', '#0078c2', '#008ec3', '#00a3bd', '#04b5b4',]

    });

    Highcharts.chart({
      chart: {
        renderTo: 'naaLineChart', type: 'pie', backgroundColor: 'transparent', style: { fontFamily: 'var(--ff-medium)' },
        zooming: {
          mouseWheel: false
        }
      },
      exporting: {
        url: 'https://export.highcharts.com/', enabled: true,
        buttons: { contextButton: { menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'], }, },
      },
      credits: { enabled: false },
      title: { text: chartTitle, style: { color: '#394e8b', fontSize: '15px', fontFamily: 'var(--ff-medium)', } },
      subtitle: { text: '' }, legend: {},
      xAxis: {
        tickColor: '#f1f1f1', tickWidth: 1,
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          },
          style: { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '10px', color: '#333', fontSize: '10px', }
        }
      },
      yAxis: {
        maxPadding: 0.2, title: { text: '' },
        labels: {
          style: { color: '#333', fontSize: '10px' },
          formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); }
        }
      },
      plotOptions: {
        pie: {
          shadow: false,
          borderColor: 'var(--border)'
        },
        series: {
          animation: false
        }
      },
      tooltip: {
        enabled: true,
        formatter: function () {
          if (chktooltip == "show") {
            return '<b>' + this.point.name + '</b>: ' + this.y + ' %';
          }
          else { return '<b>' + this.point.name + '</b>'; }

        }
      },
      series: series,
      lang: { noData: "No data to display", },
      noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } }
    });

    //Center circle text 
    var C_name = 'NAA Index';
    var C_subname = d.name;
    var dd = d3.select('#naaLineChart').select('svg');
    var innercircle = dd.append('g');
    innercircle.append('circle').attr('r', 162).attr('transform', 'translate(200, 198)').attr('fill', 'none').attr('stroke', 'var(--primary-color)').attr('stroke-width', '1rem');
    innercircle.append('circle').attr('r', 155).attr('transform', 'translate(200, 198)').attr('fill', 'none').attr('stroke', 'var(--leftSideText-B)').attr('stroke-width', '1px');

    var c = dd.append('g').attr('class', 'category').attr('transform', 'translate(200, 150)');
    c.append('text').attr('class', 'name').text(C_name).attr('y', 0);
    setTimeout((y:any) => { c.append('text').attr('class', 'subname').text(C_subname).attr('y', 28).attr('x', 0).call(that.wrappingtxt, 210, "top", 100); }, 100);

    if (d.group == "subCategory") {
      this.preBuiltService.GetNAAIndexStrategyPerf.pipe(first()).subscribe((res:any) => {
        if (res.length > 0) {
          d3.select('#naaLineChart').select('.since').remove();
          var cc = dd.append('g').attr('class', 'since').attr('transform', 'translate(200, 295)');
          cc.append('text').attr('class', 'asofDate').text("Return Calculated").attr('y', 0);
          cc.append('text').attr('class', 'asofDate').text("as of " + res[0].date).attr('y', 16);
          that.tradeDt = res[0].date;
          that.sinceDt = res[0].sinceDate;
        }
        else {
          d3.select('#naaLineChart').select('.since').remove();
          that.tradeDt = '';
          that.sinceDt = '';
        }
      });
    }

  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  wrappingtxt(text: any, width: any, p: any, X: any) {
    text.each((datum: any, index: any, nodes: any) => {
      var text: any = d3.select(nodes[index]),
        words: any = text.text().split(/\s+/).reverse(),
        word: any,
        line: any = [],
        lineNumber = 0, //<-- 0!
        lineHeight = 1.2, // ems
        x = text.attr("x"), //<-- include the x!
        y = text.attr("y"),
        dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      var tspan: any = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}
