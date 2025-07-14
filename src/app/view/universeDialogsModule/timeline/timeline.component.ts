import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation,AfterViewInit,HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../core/services/data/data.service';
import { Subscription, first } from 'rxjs';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { ascending, descending, group, select, selectAll } from 'd3';
import { DatePipe } from '@angular/common';
declare var $: any;
import * as d3 from 'd3';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TimelineComponent implements OnInit, OnDestroy,AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  YearsList: any = [];
  radius = 150;
  qData: any = [];
  selYear: number = 0;
  selQDate: any;
  selQtrData: any=[];
  timelineSearchData: any = [];
  tradeDt = '';
  selComp: any;
  selAllYear: boolean = false;
  showSpinnerAcc_loaded: boolean = true;
  showSpinnerComp_loaded: boolean = true;
  compSelectAll: boolean = false;
  showErrorMsg: boolean = false;
  timelineData: any= [];
  FilterList: any = [{ "Name": 'Company Name', "value": "1", "ID": "CN_asc" }, { "Name": 'h-factor Score', "value": "2", "ID": "HF_asc" }, { "Name": 'Ticker', "value": "3", "ID": "T_asc" }];
  cl: any = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  SelISIN: any;
  constructor(public sharedData: SharedDataService, private dialogref: MatDialogRef<TimelineComponent>, private datePipe: DatePipe, 
    public dataService: DataService, public equityService: EquityUniverseService, public cusIndexService: CustomIndexService,
    private logger: LoggerService, @Inject(MAT_DIALOG_DATA) public modalData: any,) { }
  
  selectedCompName: string = '';
  selectedCompTicker: string = '';
  selectedSectorName: string = '';
  highlightList: any;
  isAtTop: boolean = true;
  isAtBottom: boolean = false;
  showArrows: boolean = true;
  subscriptions = new Subscription();
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  ngOnInit() {
    var that = this;

    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'timeline'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'timeline', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var breadcrumb = that.modalData.dialogSource['breadcrumb'];
    if (breadcrumb.length > 0) {
      breadcrumb = breadcrumb[breadcrumb.length - 1];
      that.selectedSectorName = breadcrumb.name;
    }
    that.selComp = that.modalData.dialogSource['selComp'];
    // console.log(that.selComp,'that.selComp')
    that.getQDateData(that.selComp);
    that.fillCenterCircle(that.selComp);
    $('.dropdown-menu-right').click(function(event:any){
      event.stopPropagation();
    });
  }
  ngAfterViewInit() {
 
    setTimeout(() => {
      this.checkScrollPosition();
      this.updateArrowVisibility();
    }, 1000);
  }
  @HostListener('window:resize')
  onResize() {
    this.updateArrowVisibility();
    this.checkScrollPosition();
  }
  private updateArrowVisibility() {
    const containerHeight = this.scrollContainer.nativeElement.clientHeight;
    const contentHeight = this.scrollContainer.nativeElement.scrollHeight;
    
    // Show arrows only if content height is greater than container height
    this.showArrows = contentHeight > containerHeight;
  }
  scrollUp() {
    this.scrollContainer.nativeElement.scrollBy({
      top: -120, // Adjust this value to control the scroll speed
      behavior: 'smooth'
    });
    setTimeout(() => {
      this.checkScrollPosition();
    }, 300);
  }
  scrollDown() {
    this.scrollContainer.nativeElement.scrollBy({
      top: 120, // Adjust this value to control the scroll speed
      behavior: 'smooth'
    });
    setTimeout(() => {
      this.checkScrollPosition();
    }, 300);
  }
  onScroll() {
    this.checkScrollPosition();
  }
  private checkScrollPosition() {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    const scrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    const containerHeight = this.scrollContainer.nativeElement.clientHeight;
    //console.log(Math.round(scrollTop),Math.round(containerHeight),Math.round(scrollHeight),'containerHeight')
    this.isAtTop = scrollTop === 0;
    this.isAtBottom = (Math.round(scrollTop)  + Math.round(containerHeight)) + 1  >= Math.round(scrollHeight);
   
    //console.log(this.isAtBottom,'isAtBottom')
  }
  fillCenterCircle(selComp: any) {
    var that = this;
    if (isNotNullOrUndefined(selComp)) {
      if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
         this.SelISIN = selComp.isin;
   
      
      }
      /** Selected name **/
      var midtxt = '';
      var midtxtTitle = '';
      var compNameLength = '';
      if (selComp.companyName.length > 13) { compNameLength = selComp.companyName.slice(0, 13) + "..."; }
      else { compNameLength = selComp.companyName };
      if (isNotNullOrUndefined(selComp.ticker) && selComp.ticker != '') {
        midtxt = compNameLength + " (" + selComp.ticker + ") ";
      } else { midtxt = compNameLength; }
      d3.select('#TimeLineCircle').select('.SelCompName').text(midtxt);
      that.selectedCompName = selComp.companyName;
      that.selectedCompTicker = selComp.ticker;
      //d3.select('.timeTitle').text(midtxt);
      /** Selected name **/
      /** Selected Median **/
      var medVel: any = d3.format(".1f")(selComp.score);
      d3.select('#TimeLineCircle').select('.Sel_midComp').select('.SelCompScore').style("fill", function () { return that.cl(medVel + 1); }).text(medVel);
      /** Selected Median **/
      this.tradeDt = selComp.tradeDate.slice(4, 6) + "/" + selComp.tradeDate.slice(6, 8) + "/" + selComp.tradeDate.slice(0, 4);
      //d3.selectAll('#HoldingDate').style('display', 'block').text("Scores as of: " + tradeDt);
    }
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    var virData = [];
   // setTimeout(() => {
      const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    const totalItems = this.timelineSearchData.length - itemsVisible;
    virData = [...data]
    virData.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
     that.highlightList = "";
     setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
     var selIsins = virData.filter((x:any) => x['stockKey'] == selind)
     if (selIsins[0].index >= totalItems) {
       that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
       setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + 10); }, 20);
     } else {
       setTimeout(() => {
         if (selIsins[0].index < dontMove) {
           this.viewPort.scrollToIndex(0);
         } else {
             that.viewPort.scrollToIndex(selIsins[0].index);
         }
       }, 100);
     }
    }
   // }, 200);
    
   
   
    // const dontMove = 7;
    // const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    // const itemsVisible = Math.floor(viewportSize / 40);
    // const totalItems = this.timelineSearchData.length - itemsVisible;
    // data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    // if (selind == undefined || selind == "" || selind == null) {
    //   that.highlightList = "";
    //   setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    // }
    // else {
    //   var selIsins = [...data].filter(x => x.isin == selind);
    //   if (selIsins[0].index >= totalItems) {
    //     that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
    //     setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + dontMove); }, 10);
    //   } else {
    //     setTimeout(() => {
    //       if (selIsins[0].index < dontMove) {
    //         this.viewPort.scrollToIndex(0);
    //       } else {
    //         that.viewPort.scrollToIndex(selIsins[0].index);
    //       }
    //     }, 100);
    //   }
    // }
  }
  close() { this.dialogref.close() }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  forceCloseLoader() {
    var that = this;
    setTimeout(() => { that.showSpinnerAcc_loaded = false; that.showSpinnerComp_loaded = false }, 500)
  }
  getQDateData(selRow: any) {
    var that = this;
   var getQtrData= that.dataService.getQDateData(selRow, selRow.indexName, selRow['isin'].replace("a", "")).pipe(first())
      .subscribe((resDate: any) => {
        if (resDate.length > 0) {
          that.GetServiceQData([...resDate]);
        } else { $('#errorMainModalHT').modal('show'); }
       
      }, (error: any) => { that.logger.logError(error, 'getQDateData'); });
    this.subscriptions.add(getQtrData);
  }

  GetServiceQData(data: any) {
    var that = this;
    that.creatGradienArc('#TimeLineCircle');

    var year: any = data.map((x: any) => x.year).sort(function (x: any, y: any) { return descending(x, y); });
    that.YearsList = [...new Set(year)];
    data=data.map((e: any, i: number) => ({ scores: e['score'], deg: (e['score']*100), ...e }));
    //data.push(this.selComp);    
    var qData: any = data.sort(function (x: any, y: any) { return ascending(x.scores, y.scores); });
    that.qData = [...qData];
    that.qData.forEach(function (d: any, i: any) {
      d.score = d.scores * 100;
      d.cx = ((i * 360 / that.qData.length) - 90);
      return d
    });
    try { that.createQtrFillComp([...that.qData]); } catch (e) { }
    if (that.YearsList.length > 0) { that.yearClick(that.YearsList[0]); }
  }
  qtrYear: string = '';
  yearClick(year: number) {
    var that = this;
    if (!this.selAllYear) {
      that.selYear = year;
      var getQ = [...that.qData].filter((x: any) => x.year == year);
      getQ = getQ.sort(function (x: any, y: any) { return ascending(x.tradeDate, y.tradeDate); });

      if (getQ.length > 0) {
        var qtrF = getQ[getQ.length - 1];
        var qtrYear = that.selYear + ' ' + that.getQtr(qtrF);
        this.qDateClick(qtrF, qtrYear);
      } else {
        this.qtrYear = '';
      }
      //setTimeout(() => {
      //  this.viewPort.scrollToIndex(0)
      //}, 200);
      d3.select("#TimeLineCircle #crlChart").selectAll(".qAddSlider").style("display", "none");
      var select = ".qSlidery" + that.selYear
      d3.select("#TimeLineCircle #crlChart").selectAll(select).style("display", "block");
    };
    try {
      this.sharedData.userEventTrack('Timeline', that.selYear, that.selYear, 'left grid year click');
    } catch (e) { }
  }

  qDateClick(data: any, qtr:any) {
    var that = this;
    that.selQDate = data;
    that.showErrorMsg = false;
    that.timelineData = [];
    that.showSpinnerComp_loaded = true;
    d3.select("#TimeLineCircle").selectAll('.qAddSlider').selectAll('text').classed("active", false);
   var getQtr= that.dataService.getQtrData(data['tradeDate'], that.selComp.industry, 0, that.selComp.indexName).pipe(first())
      .subscribe((dbqtrData: any) => {
        that.forceCloseLoader();
        this.selQtrData = this.findMyHandleIndex_H([...dbqtrData]);
        this.timelineSearchData = this.findMyHandleIndex_H([...dbqtrData]);
        that.sortProductsAsc();
        that.searchClose();
        that.showSpinnerComp_loaded = false;
   
      }, (error: any) => {
        this.logger.log(error, 'getQtrData');
        that.forceCloseLoader();
        that.showErrorMsg = true;
        $('#errorModalHisTimeline').modal('show'); });
    this.subscriptions.add(getQtr);
    this.qtrYear = qtr;
    let id = "#qSlider" + that.SelISIN + "_" + qtr.split("(")[0].trim() + "_" + data.tradeDate.substr(4, 2);    
    d3.select(id).selectAll('text').classed("active", true);
    try {
      this.sharedData.userEventTrack('Timeline', data['tradeDate'], data['tradeDate'], 'center grid Qtr click');
    } catch (e) { }
  }
  findMyHandleIndex_H(data: any) {
    var dt = [...data].map(a => ({ ...a }));
 
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      return d
    });
    return data
  }
  getQtr(d:any) {
    //let txr = d.year + " (" + dt + ")";
    if (isNotNullOrUndefined(d)) {
      var dt = "Q" + Math.ceil(d.tradeDate.substr(4, 2) / 3);
      return '('+dt+')';
    } else { return ''; }
    
  }
  creatGradienArc(masterID:string) {
    let that = this;
    var data = [];
    var tempArcData:any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    data = [...tempArcData];

    if (data != null && data.length > 0) {
      var len = data.length;
      data.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      data.forEach(function (d, i) { d.cx = ((i * 360 / len) - 90); return d; });
    }
    
    var gArc = null;
    var gArcLine = null;

    d3.select(masterID).select("#gradArc").remove();
    d3.select(masterID).select("#gradArcLine").remove();
    gArc = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArc");
    gArcLine = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArcLine");

    var arc:any = d3.arc().innerRadius(that.radius - 18).outerRadius(that.radius - 2);
    var gC100 = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);

    // create our gradient
    var colors:any = [];

    var linearGradient = gArc.append("defs");
    var linearG1 = linearGradient.append("linearGradient");

    if (data != null) { }

    var gCArcColor = d3.scaleLinear()
      .domain([0, 90, 91, 180, 181, 270, 271, 360])
      .range([0, 100, 0, 100, 0, 100, 0, 100])
    var MaxColor = "";
    var MaxScore: any = "";
    var Data1 = data.filter(x => x.cx >= -90 && x.cx <= 0);
    linearG1.attr("id", that.clipPathCheck("linearColors0", 'ID', masterID))
      .attr("x1", "0").attr("y1", "0").attr("x2", ".5").attr("y2", "1");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= -90 && data[i].cx <= 0) {
          linearG1.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 0) {
          linearG1.append("stop").attr("offset", "100%").attr("stop-color", gC100(data[i].score));
          break;
        }
      }

      if (Data1.length > 0) {
        MaxColor = gC100(Data1[Data1.length - 1].score);
        MaxScore = Data1[Data1.length - 1].cx;
      }
    }

    var Data2 = data.filter(x => x.cx >= 1 && x.cx <= 90);
    var linearG2 = linearGradient.append("linearGradient");
    linearG2.attr("id", that.clipPathCheck("linearColors1", 'ID', masterID))
      .attr("x1", "0.8").attr("y1", "0").attr("x2", "0.5").attr("y2", "0.5");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 1 && data[i].cx <= 90) {
          linearG2.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 90) { break; }
      }
      if (Data2 == null || Data2.length == 0) {
        linearG2.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      } else {
        MaxColor = gC100(Data2[Data2.length - 1].score);
        MaxScore = Data2[Data2.length - 1].cx;
      }
    }

    var Data3 = data.filter(x => x.cx >= 91 && x.cx <= 180);
    var linearG3 = linearGradient.append("linearGradient");
    linearG3.attr("id", that.clipPathCheck("linearColors2", 'ID', masterID))
      .attr("x1", "0.8").attr("y1", "0.8").attr("x2", "0").attr("y2", "0.3");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 91 && data[i].cx <= 180) {
          linearG3.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 180) { break; }
      }
      if (Data3 == null || Data3.length == 0) {
        linearG3.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      } else {
        MaxColor = gC100(Data3[Data3.length - 1].score);
        MaxScore = Data3[Data3.length - 1].cx;
      }
    }

    var Data4 = data.filter(x => x.cx >= 181 && x.cx <= 270);
    var linearG4 = linearGradient.append("linearGradient");
    linearG4.attr("id", that.clipPathCheck("linearColors3", 'ID', masterID))
      .attr("x1", "0").attr("y1", "1").attr("x2", "1").attr("y2", "0");

    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 181 && data[i].cx <= 270) {
          linearG4.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 270) {
          break;
        }
      }
      if (Data4 == null || Data4.length == 0) {
        linearG4.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      }
    }


    // 360 degrees
    d3.range(4).forEach(function (d, i) {
      // convert to radians
      var start = (i * 89) * (Math.PI / 180),
        end = ((i * 89.9) + 90) * (Math.PI / 180);
      colors.push({
        startAngle: start,
        endAngle: end
      });
    });
    // add arcs
    gArc.selectAll('.arc')
      .data(colors)
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('d', arc)
      .attr('stroke', 'none')
      .attr('fill', function (d, i) { return that.clipPathCheck('linearColors' + i, '', masterID); });
    gArc.append('path')
      .attr('class', 'circle_overlay1')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', 'var(--primary-color-Alt)')
      .attr('stroke-width', '1.9')
      .attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.5) translate(18px, -18px) rotateY(180deg)')
      .attr('stroke-dasharray', '100 100')
      .attr('fill', 'none')
      .style('display', 'block')
    gArc.append('circle')
      .attr('class', 'circle_overlay2')
      .attr('r', 127)
      .attr('stroke', 'var(--leftSideText-B)')
      .attr('fill', 'none')
      .style('display', 'block')
  }

  clipPathCheck(CPName: any, type: any, masterID: any) {
    let msID = masterID.replaceAll('#', '');
    if (type == 'ID') { return msID + '' + CPName; }
    else { return "url(#" + msID + '' + CPName + ')'; }
  }

  createQtrFillComp(data: any) {
    var that = this;    
    d3.select("#qSlider").remove();
    d3.select("#qSliderOver").remove();
    let gr = d3.select("#TimeLineCircle #crlChart").append("g").attr("id", "qSlider");
    data.forEach(function (d: any) { that.createTic(d, gr); });

    if (isNotNullOrUndefined(that.selComp) && isNotNullOrUndefined(that.selComp['isin'])) { that.creatClockSlider(data, that.selComp); }
   
    d3.select("#qSlider").raise();
    
  }

  MedTxtColor: string = "#3a4f7b";
  creatClockSlider(data:any,selComp: any) {
    let that = this;
    d3.select("#TimeLineCircle").selectAll("#cSlider").remove();   
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      var r: any = that.radius;

      var g = d3.select("#TimeLineCircle").select('#crlChart').append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')')

      g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 1).attr("width", 27).attr("fill", "#767676");

      /*g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (25)).attr("height", "42").attr("width", "125").style("display", "none");*/

      g.append("text").attr("class", "sTextH").attr("x", + r + (40)).attr("y", 2).style("font-family", 'var(--ff-medium)').style("font-size", "9px")
        .style("display", "none").text("0.00");

      //g.append("text").attr("class", "sText1").attr("x", + r + (40)).attr("y", 9).style("display", "none")
      //  .style("font-size", "9px").attr("fill", "var(--theme-def-bg)").style("font-family", 'var(--ff-medium)').text("0.00");

      that.SetClockHandle(data,selComp);
    }
  }

  SetClockHandle(data: any, d: any,) {
    let that = this;
    var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    //let txt = Cname;
    var g: any = d3.select("#TimeLineCircle").selectAll("#cSlider");
    //let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%" + " " + this.tradeDt;
    let txt1 = d3.format(".1f")(d.score) + "%" + " " + "(" + that.tradeDt + ")";
    //if ((Cname.length) > 18) { txt = Cname.slice(0, 18).trim() + "..."; }
    var v1: any = data.filter((x: any) => x.scores <= d.scores);
    var v2: any = data.filter((x: any) => x.scores > d.scores);
    var cx: any=0;
    if (v1.length > 0 && v2.length > 0) {
      cx = d3.median([v1[v1.length - 1]['cx'], v2[0]['cx']]);
    } else if (v1.length > 0 && v2.length == 0) {
      cx = d3.median([v1[v1.length - 1]['cx'], 270]);
    } else if (v1.length == 0 && v2.length > 0) {
      cx = d3.median([-90, v2[0]['cx']]);
    } else { cx = d3.median([-90, 270]); }    
    let val:any = cx;
    var r: any = that.radius;
    g.attr('transform', 'rotate(' + val + ')');

    var per = d3.scaleLinear().domain([0, data.length]).range([0, 100]);
    var colorVal = this.cl(per((v1.length - 1) + 0.5));
    g.select('.sRect1').style("fill", colorVal);
    g.select(".sTextH").style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.equityService.measureText(txt1, 9);
        return val > 90 ? ((parseFloat(r) + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return val > 90 ? "rotate(180)" : null; })
      .style("fill", that.cl(d.score + 1)).style("cursor", "auto").text(txt1);

    //g.select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
    //  .attr("x", function () {
    //    var txtlen1 = that.equityService.measureText(txt1, 9);
    //    return val > 90 ? ((parseFloat(r) + txtlen1 + 40) * -1) : "190";
    //  })
    //  .style("font-size", function () {
    //    if (txt1.length > 24) { return '8px' } else { return '9px' };
    //  })
      //.attr("transform", function () { return val > 90 ? "rotate(180)" : null; })
      //.attr("fill", function () {
      //  if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
      //  else { return that.cl(d.score + 1); }
      //});

    const slide: any = g.select(".sText");
    var bbox: any = slide.node().getBBox();
    var bboxH: any = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    //var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    //g.select(".sRect")
    //  .attr("fill", "var(--cardsHighlightColorDark)")
    //  .attr("stroke", "#c7c7c7")
    //  .attr("stroke-width", "1px")
    //  .style("display", function () { return txt == null ? "none" : "block"; })
    //  .attr("height", bboxH)
    //  .attr("width", cSliderWidth)
    //  .attr("y", -(bboxH / 2));

    var calW = parseInt(r + bbox.width);
    g.select(".sTextReverse").attr("fill", "#fff").style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function (): any {
        if (bboxH == 40) { return -(bboxH + 0); }
        else if (bboxH < 50) { return -(bboxH - 3); }
        else if (bboxH > 50) { return -(bboxH - 15); }
      }).attr("y", -(calW + 17));
    g.style('display', 'block').raise();
    //var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    //var midtxt = Cname + " (" + d.ticker + ") ";
    //if (Cname.length > 25) { midtxt = Cname.slice(0, 20) + "... (" + d.ticker + ") "; }

    
   /* g.select('.sRect').attr("stroke-width", 1).style("stroke", colorVal)*/
    g.style('opacity','1');
  }

  createTic(d: any,gr:any) {
    var that = this;
    var r: any = this.radius;
    let val = d.deg * 360 / 100;
    let dt = d.tradeDate.substr(4, 2) + "/" + d.tradeDate.substr(6, 2) + "/" + d.tradeDate.substr(0, 4);
    let txt = dt + d.year + " [" + d3.format(".1f")(d.score) + "%]";
    let txr = d.year + " (" + dt + ")";
    dt = "Q" + Math.ceil(d.tradeDate.substr(4, 2) / 3);
    txt = d.year + " (" + dt + ") [" + d3.format(".1f")(d.score) + "%]";
    txr = d.year + " (" + dt + ")";
    val = d.cx;
    let id = that.selComp.isin + "_" + d.year + "_" + d.tradeDate.substr(4, 2);
    let g = gr.append("g").attr("id", "qSlider" + id).attr("class", "qAddSlider qSlidery" + d.year).attr('transform', 'rotate(' + val + ')').style('display', 'none');

    g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5);

    let text = g.append("text").attr("class", "sText").attr("x", + r + (40)).attr("dy", 0).style("display", "none").text("0.00");

    text.attr("x", function () { return that.equityService.txtx3(d); }).attr("transform", function () { return that.equityService.txttrans(d); })
      .style("text-anchor", function () { return that.equityService.txtanch(d); }).style("display", function () { return txt == null ? "none" : "block"; })
      .text(d3.format(".1f")(d.score) + "%");

    text.on("click", function () { that.qDateClick(d, txr);});

    g.append("text").attr("x", function () { return that.equityService.txtx(d); }).attr("transform", function () { return that.equityService.txttrans(d); })
      .style("text-anchor", function () { return that.equityService.txtanch(d); }).attr("fill", function () { return "#4b4b4b"; }).attr("dy", 0).attr("class", "sText")
      .text(txr).on("click", function () { that.qDateClick(d, txr);});

    g.on("pointerenter", function (event: any) { d3.select(event).classed("on", true); }).on("pointerleave", function (event: any) { d3.select(event).classed("on", false); });

  }

  overYear(year: number) {
    if (!this.selAllYear) {
      d3.select("#TimeLineCircle #crlChart").selectAll(".qAddSlider").style("display", "none");
      var select = ".qSlidery" + year;
      d3.select("#TimeLineCircle #crlChart").selectAll(select).style("display", "block");
    }
  }
  outYear(year: number) {
    if (!this.selAllYear) {
      d3.select("#TimeLineCircle #crlChart").selectAll(".qAddSlider").style("display", "none");
      var select = ".qSlidery" + this.selYear
      d3.select("#TimeLineCircle #crlChart").selectAll(select).style("display", "block");
    }
  }

  selectAllYear(ev: any) {
    if (isNotNullOrUndefined(ev.checked)) { this.selAllYear = ev.checked; }
    if (this.selAllYear) {
      d3.select("#TimeLineCircle #crlChart").selectAll(".qAddSlider").style("display", "block");
      d3.select(".Yr-sec").selectAll("li").classed("active", true);
    } else {
      if (isNotNullOrUndefined(this.selQDate['year'])) { this.selYear = this.selQDate['year']; };
      d3.select("#TimeLineCircle #crlChart").selectAll(".qAddSlider").style("display", "none");
      d3.select(".Yr-sec").selectAll("li").classed("active", false);
      var select = ".qSlidery" + this.selYear;
      d3.select(".Yr-sec").selectAll("li[name='" + this.selYear +"']").classed("active", true);
      this.selYear = this.selYear;
      d3.select("#TimeLineCircle #crlChart").selectAll(select).style("display", "block");
    }
  }
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  toggleSearch: boolean = false;
  searchText = '';
  selQtrDataSortedAsc: boolean = true;

  openSearch() {
    this.toggleSearch = true;
    setTimeout(() => {
      this.searchBox.nativeElement.focus();
    }, 100);
  }
  searchClose() {
    this.searchText = '';
    this.toggleSearch = false;
    this.filterItems();
    this.onSort();
  }
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    // this.onSort();
    if (this.searchText != ''){
      // this.timelineData = this.timelineSearchData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
      this.timelineData = this.timelineSearchData.filter((item: any) => 
        (item.ticker && item.ticker.toLowerCase().includes(this.searchText.toLowerCase())) ||
      (item.companyName && item.companyName.toLowerCase().includes(this.searchText.toLowerCase()))
      );
    }
    else{
      this.timelineData = this.timelineSearchData;
    }
  }
  sortProductsAsc() {
    var that = this;
    //that.selQtrDataSortedAsc = !that.selQtrDataSortedAsc;
    //if (!this.selQtrDataSortedAsc) {
     
      // if(that.ascending_val == true){
      //   that.timelineData = [...that.selQtrData].sort(function (x:any, y:any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      // }
      // else{
      //   that.timelineData = [...that.selQtrData].sort(function (x:any, y:any) { return d3.descending(parseFloat(x.scores), parseFloat(y.scores)); });
      // }
      that.timelineData = [...that.selQtrData]
      this.highlightList = that.selComp.stockKey;
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.timelineData, that.highlightList);
        }, 500);
      } else { this.viewPort.scrollToIndex(0) }
      this.onSort()
    //} else {
    //  that.timelineData = [...that.selQtrData].sort(function (x:any, y:any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });;
    //}

  }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show')
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'timeline');
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Timeline', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.timelineData);
    var selind = that.timelineData.filter((x: any) => x.isin == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.timelineData = [...dat]; } catch (e) { }
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.timelineData, that.highlightList);
        }, 200);
      }
    } catch (e) { }
  }
  onToggleAscending() {  
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'timeline'); }
  }
  RangeFilterGrid(IndexN:any, data:any) {
    var that = this;
    data = this.sharedData.onRightGridSort(data, this.SelFilter, this.ascending_val);
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
}
