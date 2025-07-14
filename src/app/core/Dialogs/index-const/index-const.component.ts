import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedDataService, isNotNullOrUndefined } from '../../services/sharedData/shared-data.service';
import { PrebuildIndexService } from '../../services/moduleService/prebuild-index.service';
import { DataService } from '../../services/data/data.service';
import { LoggerService } from '../../services/logger/logger.service';
import { Subscription, first } from 'rxjs';
declare var $: any;
import * as d3 from 'd3';
@Component({
  selector: 'app-index-const',
  templateUrl: './index-const.component.html',
  styleUrl: './index-const.component.scss',
})
export class IndexConstComponent implements OnInit, OnDestroy {
  indexID: number = 0;
  public selIndexSector: any = [];
  dialogData: any;
  familyChartIndex: any = [];
  chartData: any = [];
  chartDataFamily: any = [];
  Universe: any = [];
  Liquidity: any = [];
  Calculation: any = [];
  Weighting: any = [];
  filterDev: any = [];
  naaorderlistFilter: any = [];
  type: any = [];
  title: any = [];
  dialogOptions: any;
  ICasOf: any;
  dialogIndexname: any;
  dialogIndexperformance:any;
  dialogIndexCode:any;
  europe: string = '';
  uk: string = '';
  japan: string = '';
  hfagt: string = '';
  US: string = '';
  hfent: string = '';
  hfmdt: string = '';
  indexName: string = '';
  methodologyURL:any;
  indexCode: string = '';
  description: string = '';
  showSpinnerAcc_loaded: boolean = false;
  isCheckdevWorld: boolean = false;
  subscriptions = new Subscription();
  constructor( private dialogref: MatDialogRef<IndexConstComponent>, private dataService: DataService,
    public preBuiltService: PrebuildIndexService, public sharedData: SharedDataService,
    private logger: LoggerService, @Inject(MAT_DIALOG_DATA) public modalData: any) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  ngOnInit() {
    var that = this;
    this.dialogIndexperformance = this.modalData['dialogIndexperformace'];
    var naaorderlist = this.preBuiltService.naaIndexOrderList.subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.naaorderlistFilter = res.filter((x: any) => x.CommonTicker); }
    }
    );
    this.subscriptions.add(naaorderlist);
    if (this.modalData.dialogData.length == 0 && this.modalData.familyIndex.length > 0) {
      var data: any = that.preBuiltService.GetNAAIndexPerf.value;
      this.selIndexSector = this.dialogIndexperformance['indexMaster'];
      this.indexName = this.dialogIndexperformance['indexperformanceAll'][0].IndexName.toString();
      this.indexCode = this.dialogIndexperformance['indexperformanceAll'][0].IndexCode.toString();
      this.description = this.dialogIndexperformance['indexperformanceAll'][0].Description.toString();
      this.indexID = this.dialogIndexperformance['indexperformanceAll'][0]['IndexId'];
      this.familyChartIndex = this.modalData.familyIndex;
      this.openfamilyChart(this.familyChartIndex);
    } else {
      this.familyChartIndex = [];
      this.loadIndexConstruction();
  }
  }
  loadIndexConstruction(){
    var that = this;
    var data: any = that.preBuiltService.GetNAAIndexPerf.value;
    // console.log(data,'data')
    if ((isNotNullOrUndefined(data['indexMaster']) && data['indexMaster'].length > 0 && isNotNullOrUndefined(data['indexMaster'][0]['indexId'])) || isNotNullOrUndefined(this.modalData['selIndexSector'])) {
      if (isNotNullOrUndefined(this.modalData['selIndexSector'])) {
         this.selIndexSector = this.modalData['selIndexSector']['indexMaster']; 
        this.methodologyURL = this.modalData['selIndexSector']['indexperformanceAll'];
         this.loadData();
        }
      else { 
        this.selIndexSector = data['indexMaster'];
        this.methodologyURL = data['indexperformanceAll'];
        this.loadData();
       }
      // console.log(this.selIndexSector,'selIndexSector')
      this.indexName = this.selIndexSector[0].indexName.toString();
      this.indexCode = this.selIndexSector[0].indexCode.toString();
      this.description = this.selIndexSector[0].description.toString();
      this.indexID = data['indexMaster'][0]['indexId'];
    }
    that.GetGlobalRebalances(that.indexID);
    if (
      this.indexID == 172 ||
      this.indexID == 170 ||
      this.indexID == 168 ||
      this.indexID == 179 ||
      this.indexID == 181 ||
      this.indexID == 183 ||
      this.indexID == 189 ||
      this.indexID == 191 ||
      this.indexID == 193 ||
      this.indexID == 195 ||
      this.indexID == 197
    ) {
      $('#SectorChart').css({ display: 'block' });
      that.GetPieChart_API(this.indexID);
    } else {
      $('#SectorChart').css({ display: 'none' });
    }
    that.preBuiltService.getIndexConstruction_prebuilt.pipe(first()).subscribe((res: any) => { this.chartData = res; });
    that.preBuiltService.getIndexConstruction_prebuiltFamily.pipe(first()).subscribe((res: any) => { this.chartDataFamily = res; });
  }
  loadData() {
    var that = this;
    var Universe: any = [];
    var Liquidity: any = [];
    var Calculation: any = [];
    var Weighting: any = [];
    var type: any = [];
    var title: any = [];
    this.dialogData = this.modalData.dialogData;
    // this.dialogOptions = this.modalData.dialogSource;
    // this.dialogIndexname = this.modalData.dialogIndexname;
    // this.dialogIndexCode = this.dialogData[0].ticker;
    that.dialogData.forEach((element: any) => {
      Universe.push({ Universe: element.Universe });
      Liquidity.push({ Liquidity: element.Liquidity });
      Calculation.push({ Calculation: element.Calculation });
      Weighting.push({ Weighting: element.Weighting });
      title.push({
        tile1: element.tile1,
        tile2: element.tile2,
        tile3: element.tile3,
      });
      type.push(element.type);
    });
    this.Universe = [...Universe];
    this.Liquidity = [...Liquidity];
    this.Calculation = [...Calculation];
    this.Weighting = [...Weighting];
    this.type = [...type];
    this.title = [...title];
    //console.log(this.indexCode,"this.dialogIndexCode = this.modalData.dialogTicker;");
  }
  backDevWorld() {
    this.isCheckdevWorld = false;
    // this.indexCode = "";
    this.loadIndexConstruction();
  }

  checkIndexPermission(ticker: string) {
    var data = [...this.preBuiltService.naaIndexOrderList.value];
    if (data.filter((x: any) => isNotNullOrUndefined(x['CommonTicker']) && x['CommonTicker'] === ticker).length > 0) { return false }
    else { return true }
  }

  getDevworld(params: any) {
 
    var that = this;
    var Universe: any = [];
    var Liquidity: any = [];
    var Calculation: any = [];
    var Weighting: any = [];
    var clickedData = this.chartData.filter((x: any) => x.ticker == params);
   
    clickedData.forEach((element: any) => {
      Universe.push({ Universe: element.Universe });
      Liquidity.push({ Liquidity: element.Liquidity });
      Calculation.push({ Calculation: element.Calculation });
      Weighting.push({ Weighting: element.Weighting });
    });
    this.Universe = [...Universe];
    this.Liquidity = [...Liquidity];
    this.Calculation = [...Calculation];
    this.Weighting = [...Weighting];
    this.isCheckdevWorld = true;
    this.filterDev = this.naaorderlistFilter.filter(
      (x: any) => x.CommonTicker == clickedData[0].ticker
    );
  
    this.getDevWorldIndexClick(this.filterDev)
    // this.indexName = this.filterDev[0].indexname;
    // this.indexCode = this.filterDev[0].CommonTicker;
    // this.description = this.filterDev[0].description;
    // this.dialogOptions = this.filterDev[0].description;
    // this.dialogIndexname = this.filterDev[0].indexname;
  }
  getDevWorldIndexClick(selectedIndex:any){
    var that = this;
 
    var data = { "indexcode": selectedIndex[0]['CommonTicker'] };
    that.showSpinnerAcc_loaded = true;
    this.dataService.GetIndexDetails(data).pipe(first()).subscribe((res: any) => {
      that.showSpinnerAcc_loaded = false;
      this.methodologyURL = res['indexperformanceAll']
      this.selIndexSector = res['indexMaster'];
      this.indexName = this.selIndexSector[0].indexName.toString();
      this.indexCode = this.selIndexSector[0].indexCode.toString();
      this.description = this.selIndexSector[0].description.toString();
    }, (error: any) => { });
  }
  GetGlobalRebalances(id: any) {
    this.dataService.GetGlobalRebalances(id).pipe(first())
      .subscribe((res: any) => {
        if (res.length > 0) {
          var rebDt = res[res.length - 1].rebalanceDt;
          this.GetGlobalSignalsByDate(id, rebDt);
        }
      });
  }
  GetGlobalSignalsByDate(IndexId: any, rebDt: any) {
    this.dataService
      .GetGlobalSignalsByDate(IndexId, rebDt).pipe(first())
      .subscribe((rebDtres: any) => {
        if (rebDtres) {
          if (rebDtres[0].europe != null) {
            this.europe = (rebDtres[0].europe * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'europe').text('*' + (rebDtres[0].europe * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].uk != null) {
            this.uk = (rebDtres[0].uk * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'uk').text('*' + (rebDtres[0].uk * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].japan != null) {
            this.japan = (rebDtres[0].japan * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'japan').text('*' + (rebDtres[0].japan * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].us != null) {
            this.US = (rebDtres[0].us * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'us').text('*' + (rebDtres[0].us * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].hfagt != null) {
            this.hfagt = (rebDtres[0].hfagt * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'hfagt').text('*' + (rebDtres[0].hfagt * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].hfent != null) {
            this.hfent = (rebDtres[0].hfent * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'hfent').text('*' + (rebDtres[0].hfent * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          if (rebDtres[0].hfmdt != null) {
            this.hfmdt = (rebDtres[0].hfmdt * 100).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            });
            // $('#rebSdata' + IndexId + 'hfmdt').text('*' + (rebDtres[0].hfmdt * 100).toLocaleString('en-US', { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) + '%');
          }
          // $('#ICasOf' + IndexId).text('* As of ' + new Date(rebDtres[0].date).toLocaleDateString('en-US'));
          this.ICasOf = new Date(rebDtres[0].date).toLocaleDateString('en-US');
        }
      });
  }
  checkrebDtres(d: any) {
    if (isNotNullOrUndefined(d) && d.length > 0) {
      return '*' + d + '%';
    } else {
      return null;
    }
  }
  checkIndexId(get: number) {
    if (isNotNullOrUndefined(this.indexID) && this.indexID == get) {
      return 'eight';
    } else {
      return 'one';
    }
  }
  GetPieChart_API(val: any) {
    this.dataService.GetSectorIndexClassify(val).pipe(first()).subscribe(
      (res: any) => {
        this.GetPieChart(res[0], this.selIndexSector[0].IndexCode);
        $('#stkTcount' + this.indexID).text('(' + res[0].Count + ' Stocks)');
        $('#stkFcount' + this.indexID).text('(' + res[0].FinalCount + ' Stocks)');
      }, (error) => { this.logger.logError(error, 'GetSectorIndexClassify'); });
  }
  GetPieChart(ind: any, ind_Name: any) {
    var svg = d3
      .select('#SectorChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', function () {
        if ($(window).width() > 767) {
          return '-400 -215 1800 490';
        } else {
          return '100 0 300 250';
        }
      })
      .append('g');
    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'labels');
    svg.append('g').attr('class', 'lines');
    var width = 450;
    var height = 450;
    var colors = ['#eeeeee', '#ffffff'];
    var textColors = ['var(--closeIcon)', 'var(--closeIcon)'];
    var radius = Math.min(width, height) / 2;
    var selectedperc = ind.Percentage * 100;
    var removedperc = 100 - selectedperc;
    var selectedval = ind.FinalCount;
    var removedval = ind.Count - selectedval;
    var cont1 = 'Select ' + selectedperc + '% of the lowest h-factor';
    var cont2 = 'Remove ' + removedperc + '% of the heighest h-factor';
    var totalStock = '(Total ' + ind.Count + ' Stocks)';
    var data = [selectedperc, removedperc];
    var insideVal = [selectedval, removedval];
    var content = [cont1, cont2];
    var pie: any = d3
      .pie()
      .sort(null)
      .value((d: any) => d);
    var arc: any = d3
      .arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0);
    var outerArc: any = d3
      .arc()
      .outerRadius(radius * 0.9)
      .innerRadius(radius * 0.9);
    var insideArc: any = d3
      .arc()
      .innerRadius(50)
      .outerRadius(radius - 80);
    svg.attr('transform', 'scale(1.0)');
    svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colors[i % colors.length]);
    svg.append('g').classed('labels', true);
    svg.append('g').classed('insidelabels', true);
    svg.append('g').classed('insideStocks', true);
    svg.append('g').classed('lines', true);
    var polyline = svg
      .select('.lines')
      .selectAll('polyline')
      .data(pie(data))
      .enter()
      .append('polyline')
      .attr('class', 'linesPoly')
      .attr('points', (d) => {
        // see label transform function for explanations of these three lines.
        var pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        //console.log(arc, arc.centroid(d), outerArc.centroid(d), pos, "const", d);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      });
    svg
      .append('image') // en vez de g es svg
      .attr('width', 340)
      .attr('height', 340)
      .style('transform', 'translate(-170px, -170px)')
      .attr('xlink:href', '../../../../assets/images/Tool_Circle.svg');
    svg
      .select('.insidelabels')
      .selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('dy', '.35em')
      .attr('fill', (d, i) => textColors[i % textColors.length])
      .html(function (d, i) {
        return insideVal[i];
      })
      //.call(wrap, 40, "Top")
      .attr('transform', function (d) {
        var pos = insideArc.centroid(d);
        return 'translate(' + pos + ')';
      })
      .style('font-size', (d: any) => {
        //console.log(d);
        if (d.data >= 40) {
          return '30pt';
        }
        if (d.data < 15) {
          return '14pt';
        } else {
          return '18pt';
        }
      })
      .style('font-family', 'var(--ff-medium)')
      //.style("fill", "#9ba3b1")
      .style('text-anchor', 'middle');
    svg
      .select('.insideStocks')
      .selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', 13)
      .attr('dy', '.35em')
      .attr('fill', (d, i) => textColors[i % textColors.length])
      .html(function (d, i) {
        return 'Stocks';
      })
      .call(wrap, 100, 'Top')
      .attr('transform', function (d) {
        var pos = insideArc.centroid(d);
        return 'translate(' + pos + ')';
      })
      .style('font-size', function (d: any) {
        if (d.data >= 40) {
          return '9pt';
        }
        if (d.data < 15) {
          return '0pt';
        } else {
          return '7pt';
        }
      })
      .style('font-family', 'var(--ff-medium)')
      .style('text-anchor', 'middle')
      .style('fill', '#9ba3b1');
    svg
      .select('.labels')
      .selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', -12)
      .attr('dy', '.35em')
      .html(function (d, i) {
        return content[i];
      })
      .call(wrap, 140, 'Top')
      .attr('transform', (d) => {
        var pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        // var chckVal;
        if (pos[0] >= 0) {
          var chckVal = pos[0] + 6;
          return 'translate(' + chckVal + ',' + pos[1] + ')';
        } else {
          var chckVal: any = pos[0] - 6;
          return 'translate(' + chckVal + ',' + pos[1] + ')';
        }
      })
      .style('text-anchor', function (d) {
        return midAngle(d) < Math.PI ? 'start' : 'end';
      })
      .style('fill', '#9ba3b1');
    function wrap(text: any, width: any, p: any) {
      text.each((datum: any, index: any, nodes: any) => {
        var text = d3.select(nodes[index]),
          words: any = text.text().split(/\s+/).reverse(),
          word: any,
          line: any = [],
          lineNumber: any = 0, //<-- 0!
          lineHeight: any = 1, // ems
          x: any = text.attr('x'), //<-- include the x!
          y: any = text.attr('y'),
          dy: any = text.attr('dy') ? text.attr('dy') : 0; //<-- null check
        var tspan: any = text
          .text(null)
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', dy);
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text
              .append('tspan')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy)
              .text(word);
          }
        }
      });
    }
    svg
      .append('text')
      .attr('class', 'toolCircle1')
      .attr('transform', 'translate(0, 220)')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.35em')
      .text(function (d) {
        if (ind_Name == 'HFHC') {
          return 'S&P 500 Health Care Index';
        } else if (ind_Name == 'HFENG') {
          return 'S&P 500 Energy Index';
        } else if (ind_Name == 'HFIT') {
          return 'S&P 500 Information Technology Index';
        } else if (ind_Name == 'HFRE') {
          return 'S&P 500 Real Estate';
        } else if (ind_Name == 'HFIND') {
          return 'S&P 500 Industrial';
        } else if (ind_Name == 'HFFIN') {
          return 'S&P 500 Financials';
        } else if (ind_Name == 'HFUT') {
          return 'S&P 500 Utilities';
        } else if (ind_Name == 'HFCS') {
          return 'S&P 500 Consumer Staples';
        } else if (ind_Name == 'HFCOM') {
          return 'S&P 500 Communication services';
        } else if (ind_Name == 'HFCD') {
          return 'S&P 500 Consumer Discretionary';
        } else {
          return 'S&P 500 Materials';
        }
      })
      .style('font-size', '14pt')
      .style('font-family', 'var(--ff-regular)')
      .style('fill', '#9ba3b1')
      .call(wrap, 260, 'Top')
      .style('text-anchor', 'middle');
    svg
      .append('text')
      .attr('class', 'toolCircle')
      .attr('dy', function () {
        //var length: any = d3.select('.toolCircle1').node().getComputedTextLength();
        ////console.log(length);
        //if (length > 240) {
        //  return 265;
        //}
        //else {
        return 265;
        //}
      }) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
      .html(totalStock) // add text to the circle.
      .style('font-size', '14pt')
      .style('font-family', 'var(--ff-regular)')
      .style('fill', '#9ba3b1')
      .style('text-anchor', 'middle');
    function midAngle(d: any) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  }
  closeModal() {
    this.dialogref.close();
  }
  
  openfamilyChart(data: any) {
    $('#rebalceDateF').text("*As of " + data[0].asofdate);
    const container: any = document.querySelector('.familyChart');

    // Clear any existing chart content (optional, if needed)
    container.innerHTML = '';

    data.forEach((item: any, index: any) => {
      let classN = `boxContainer-${index}`;
      let expandedBox = document.createElement('div');
      expandedBox.classList.add('c-box', classN);

      expandedBox.innerHTML = `
      <div class="c-box-content mainT">
        <p class="tile1">${item.indexName}</p>
      </div>
      <p class="value-box1 mainT">*${item.weight}</p>
    `;

      // If the item has children, add the children content
      if (item.child && item.child.length > 0) {
        let childrenContent = document.createElement('div');

        // Create the expand button
        let appendExpand = document.createElement('div');
        appendExpand.classList.add('iconExpand');
        appendExpand.innerHTML = `
        <p class="title"><i class="fa fa-expand" aria-hidden="true"></i></p>
      `;
        expandedBox.appendChild(appendExpand);

        // Event listener for expand button
        appendExpand.addEventListener('click', () => {
          this.showDescription(classN);
        });

        childrenContent.classList.add('c-box-content-details', 'children');
        childrenContent.innerHTML = `
        <div class="headT">
          <p class="title">
            <span class="material-icons closeIcon">close</span> ${item.indexName}
          </p>
          <p class="value">*${item.weight}</p>
        </div>
        <div class="bottomT"></div>
      `;

        // Select the bottomT div to append the children boxes
        let bottomT: any = childrenContent.querySelector('.bottomT');

        // Iterate over the children array to add their content
        item.child.forEach((child: any) => {
          let childBox = document.createElement('div');
          childBox.classList.add('c-box');
          childBox.innerHTML = `
          <div class="c-box-content">
            <p class="tile1">${child.componentIndexName}</p>
          </div>
          <p class="value-box1">*${child.weight}</p>
        `;
          bottomT.appendChild(childBox);
        });

        // Event listener for close button
        const closeIcon = childrenContent.querySelector('.closeIcon');
        closeIcon?.addEventListener('click', () => {
          this.showDescriptionClose(classN);
        });

        // Append the children content to the expanded box
        expandedBox.appendChild(childrenContent);
      }

      // Append the expanded box to the container
      container.appendChild(expandedBox);
    });
    
   
  }
  showDescription(id: string) {
    const allBoxes = document.querySelectorAll('.familyChart .c-box');
    allBoxes.forEach(box => {
      box.classList.remove('expanded');
    });
    const targetBox = document.querySelector('.' + id);
    if (targetBox) {
      targetBox.classList.add('expanded');
    }
  }

  showDescriptionClose(id: string) {
    const targetBox = document.querySelector('.' + id);
    if (targetBox) {
      targetBox.classList.remove('expanded');
    }
  }
}
