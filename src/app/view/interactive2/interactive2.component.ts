import { Component, OnInit, Renderer2, ViewEncapsulation ,ElementRef,Input} from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { arc, ascending, drag, format, hierarchy, interpolate, interpolateRainbow, max, partition, quantize, scaleLinear, scaleOrdinal, select } from 'd3';
declare var $: any;
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-interactive2',
  templateUrl: './interactive2.component.html',
  styleUrl: './interactive2.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class Interactive2Component implements OnInit {
  @Input() circleData!: any;
  private self: Interactive2Component;
  liquidity_Value: number = 0;

  dragging_type: string = 'search';
  constructor(public sharedData: SharedDataService, private renderer: Renderer2, private toastr: ToastrService,private elementRef: ElementRef) { this.self = this;}
  boxes = [
    { id: 0, label: 'Universe', type: 'universe', top: 100, left: 100, color: '#4460B9' },
    { id: 2, label: 'Liquidity', type: 'liquidity', top: 300, left: 100, color: '#B4DDE3' },
    { id: 6, label: 'h-factor', type: 'h-factor', top: 600, left: 100, color: '#D291AF' },
    { id: 5, label: 'Market Cap.', type: 'market-cap', top: 500, left: 100, color: '#87A7D0' },
    { id: 3, label: 'factors', type: 'factors', top: 400, left: 100, color: '#D9C495' },
    { id: 8, label: 'Stock Price', type: 'stock-price', top: 200, left: 100, color: '#A199C5' },
    { id: 1, label: 'GICS', type: 'gics', top: 200, left: 100, color: '#E1C9D7' },
    { id: 9, label: 'Stocks', type: 'stocks', top: 500, left: 100, color: '#A8A9AD' },
  ];
  private duplicateDiv: HTMLElement | null = null;
  receiveFiltersClose(e:any) {
    if (e) { this.dragging_type = ''; }
  }
  ngOnChanges() {
    console.log(this.circleData); // Handle data changes here
  }
  onDragStart(event: MouseEvent, box: any) {
    // Create a duplicate div
    var that = this;
    const target = event.target as HTMLElement;
    console.log(target,'dup');
    const rect = target.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    this.duplicateDiv = target.cloneNode(true) as HTMLElement;
   
    this.renderer.setStyle(this.duplicateDiv, 'position', 'absolute');
    this.renderer.setStyle(this.duplicateDiv, 'width', '3.5rem');
    this.renderer.setStyle(this.duplicateDiv, 'height', '3.5rem');
    this.renderer.setStyle(this.duplicateDiv, 'border-radius', '50%');
    this.renderer.setStyle(this.duplicateDiv, 'font-size', '0.6rem');
    this.renderer.setStyle(this.duplicateDiv, 'display', 'flex');
    this.renderer.setStyle(this.duplicateDiv, 'align-items', 'center');
    this.renderer.setStyle(this.duplicateDiv, 'justify-content', 'center');
    this.renderer.setStyle(this.duplicateDiv, 'background-color', 'var(--iconColor'); // Change color for distinction
    this.renderer.setStyle(this.duplicateDiv, 'top', `${top}px`);
    this.renderer.setStyle(this.duplicateDiv, 'left', `${left}px`);
   
    document.body.appendChild(this.duplicateDiv);

    const offsetX = event.clientX - target.offsetLeft;
    const offsetY = event.clientY - target.offsetTop;

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      this.renderer.setStyle(this.duplicateDiv, 'left', `${x}px`);
      this.renderer.setStyle(this.duplicateDiv, 'top', `${y+top}px`);
      that.compareAndHighlight();
      that.checkArcPos(box, e);
    };

    const onMouseUp = (ev:any) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Remove the duplicate div after drag ends
      if (this.duplicateDiv) {
        this.renderer.removeChild(document.body, this.duplicateDiv);
        this.duplicateDiv = null;
        that.hideHighlight();
      }
      //var coordinaters = d3.pointers(ev, select('.universe').node());
      //var xx = coordinaters[0][0];
      //var yy = coordinaters[0][1];
      //var nA = ((Math.atan2(yy, xx) * (180)) / Math.PI);
      //var distance = Math.sqrt(xx * xx + yy * yy);
      //that.updateleftDragArc(box, nA, distance);
      //setTimeout(() => {
      //  if (box.type != undefined) {
     //    this.dragging_type = box.type;
     // this.sharedData.circletitle.next(this.dragging_type);
      //    console.log(this.dragging_type, 'this.dragging_type');
      //  } else {
      //    this.dragging_type = '';
      //  }
      //})
      if (isNotNullOrUndefined(this.tempObj)) {
        this.donData.push(this.tempObj);
        this.donCre();
      }
      const arcGroup = select('#arcChartCircle');
      arcGroup.selectAll('.tempArc').remove();
      arcGroup.selectAll('.curArc').style('opacity', 1);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  ngOnInit() {
    var that = this;
    setTimeout(() => {
      that.sharedData.showCircleLoader.next(false);
      try { that.donCre(); } catch (e) { console.log(e) }
    }, 1000);
    this.sharedData.selResData.subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.createComp(res);
        this.fillCompetives(res);
        this.circleRangeByPer({ "start": this.SSRValueStart, "end": this.SSRValueEnd });
      }
    })
 
  }

  fillCompetives(dta: any) {
    let that = this;
    var gs = null;
    if (dta != null && dta.length > 0) {
      var len = dta.length;
      dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }
    let data = [];
    d3.select("#sunB #crlChart").select("#gCompetitive").remove();
    d3.select("#sunB #crlChart").select("#intergCompetitiveRect").remove();
    gs = d3.select("#sunB").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#sunB").select('#crlChart').append("g").attr("id", "intergCompetitiveRect");
    data = dta;
    gs.selectAll("g").remove();
   

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) { sdata = data.filter(function (d: any, i: any) { if (i == 0 || (i % sublen) == 0) { return d; } }); }
    else { sdata = data; }
    var ggs = gs.selectAll("g").data(sdata).enter().append("g")
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      })
      .style("opacity", function (d: any) {
        let opa = 1;
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { opa = 0.4; }
        return opa;
      });
    var grpG = ggs;
    grpG.append("text")
      .attr("x", function (d) { return that.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", function (d: any): any {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; }
      })
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : "block" })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.txtanch(d); })
      //.attr("class", function (d: any) {
      //  if ((that.equityService.SRValue.value > 0 && that.equityService.SRValue.value < 100) && isNotNullOrUndefined(that.equityService._avoidLoserData['addedCompanies'])
      //    && that.equityService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) { return (that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges) + " AVHideTxt avbold"); }
      //  else {
      //    if (d.ALNaaIndex != 0) { return that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges) + " avbold ALNaaIndex" }
      //    else { return that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges) + " avbold"; }
      //  }
      //})
      .text(function (d: any) { return d3.format(",.1f")(d.scores * 100) + "%" });

    grpG.append("text")
      .attr("x", function (d) { return that.txtx(d); })
      .style("fill", function (d: any): any {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; }
      })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.txtanch(d); })
      //.attr("class", function (d: any) {
      //  if ((that.equityService.SRValue.value > 0 && that.equityService.SRValue.value < 100) && isNotNullOrUndefined(that.equityService._avoidLoserData['addedCompanies'])
      //    && that.equityService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) {
      //    return (that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges) + " AVHideTxt avbold");
      //  }
      //  else {
      //    if (d.ALNaaIndex != 0) { return that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges) + " ALNaaIndex "; }
      //    else {
      //      return that.equityService.HFCompanyTxt(d, that.equityService.showHFCompanyRanges);
      //    }
      //  }
      //})
      .text(function (d: any) {
        var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = Cname.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 13 - rsvcnt;
          var dottxt = "";
          if (txt.length > 13) { dottxt = (data.length > fillMaxlen) ? "" : "..."; }
          return Cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = Cname.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return Cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });

    ggs.on("pointerenter", function (ev: any, d: any) {
      //if (data.length > fillMaxlen) {
      //  d3.select("#intergCompetitiveRect").raise();
      //  d3.select("#cSlider").raise();
      //} else {
      //  if (that.equityService._SRValue > 0 && that.equityService._SRValue < 100) {
      //    if (that.equityService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      //  } else if (dta.filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      //};
    }).on("pointerleave", function (event, d) { d3.select(this).classed("on", false); })

    grpG.on("click", function (event: any, d: any) {
      //try {
      //  that.sharedData.userEventTrack('Equity Universe', that.equityService._selGICS.name, d.ticker, 'company click');
      //} catch (e) { }
      //var fil: any = that.equityService.rightGridData.value.filter((x: any) => x.stockKey == d.stockKey);
      //if (fil.length > 0) { that.equityService.selComp.next(fil[0]); that.resetSlider() }
    });
    if (data.length > fillMaxlen) { that.fillCompetivesRect(dta); }
    else { d3.select("#intergCompetitiveRect").selectAll("g").remove(); };
    //d3.select("#cSlider").raise();
  
    if (dta.length < 100) { d3.select('#gCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }
  }


  fillCompetivesRect(data: any) {
    var that = this;
    var gs: any;
    d3.select("#intergCompetitiveRect").selectAll("g").remove();
    d3.select("#intergCompetitiveRect").raise();
    gs = d3.select("#intergCompetitiveRect");
    var arc1 = d3.arc().innerRadius(220).outerRadius(285)
      .startAngle(function (d) { return 0 * (Math.PI / 180); })
      .endAngle(function (d) { return 360 * (Math.PI / 180); })

    var ggs = gs.append("g").append("path").attr("fill", 'transparent').attr("d", arc1)

    ggs.on("pointerenter", function (ev: any, d: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        that.gfillCompMouseover(gs, dst[0], data, ev);
      }
    }).on("mousemove", function (ev: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        that.gfillCompMouseover(gs, dst[0], data, ev);
      }
    })
    gs.on("pointerleave", function () { gs.selectAll(".gfillCompMouseover").remove(); });
  }


  gfillCompMouseover(gs: any, d: any, dta: any, ev: any) {
    var that = this;
    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d });
    gs.selectAll(".gfillCompMouseover").remove();
    var ggs = gs.append("g").attr("class", "gfillCompMouseover")
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'var(--ff-regular)')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText-B)"; } else { return "var(--leftSideText-B)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.txtanch(d))
      .attr("class", '').text(function () { return d3.format(",.1f")(d.scores * 100) + "%" });

    ggs.append("text").attr("x", that.txtx(d))
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText-B)"; } else { return "var(--leftSideText-B)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.txtanch(d))
      .attr("class",'')
      .text(function () {
        var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = "" + Cname.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 15 - rsvcnt;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return Cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = Cname.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 15 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return Cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });
    ggs.on("click", function () { });
  }

  dragStarted: boolean = false;
  checkStgyAlreadyTraded: boolean = false;
  SSRValueStart: number = 0;
  SSRValueEnd: number = 100;
  factorid: number = 0;
  circleRangeByPer(values: any) {
    var that = this;
    d3.selectAll("#sunB").selectAll("#slider").remove();
    d3.selectAll("#sunB").select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-195,-195)");
    var width = 390;
    var height = 390;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var rangeTotal = 101;
    var tickColor1 = "var(--leftSideText-B)";
    var radius = ((Math.min(width, height) - margin.top - margin.bottom) / 2);
    var outerRadius = (radius + 1) + indicatorWidth / 2;
    var innerRadius = outerRadius - indicatorWidth;
    var dragLiveData: any;
    var holder: any, indicatorArc: any, handles: any, dragBehavior: any;
    var a: any, e: any, startAngle: any, endAngle: any;
    var sliderDragRange = 1;
    var Intdata = values;
    var sliderInitValue: any = 100;
    var sliderEndValue: any = 0;
    var a1Value = 100;
    var a2Value = 0;
    var helper = {
      settings: {},
      graphdata: <any>[],
      "calculateDuration": function (startAngle: any, endAngle: any) {
        var duration: any; var angleToSegments = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
        duration = angleToSegments(endAngle) - angleToSegments(startAngle);
        if (duration < sliderInitValue) duration = rangeTotal + duration;
        return duration * 5;
      },
      "createInfoObject": function (data: any) {
        var angleToSegments = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]); var angleToFiveMinuteScale = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        var startAngle, endAngle, startTimeInfo, endTimeInfo, duration;
        startTimeInfo = angleToSegments(data.aAngle) * 5;
        endTimeInfo = angleToSegments(data.eAngle) * 5;
        duration = this.calculateDuration(data.aAngle, data.eAngle);
        return { start: startTimeInfo, end: endTimeInfo, duration: duration };
      },
      "calculateInitialData": function (initialData: any) {
        var value = 0, angle = 0;
        var angleTO = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        var segmentsToAngle = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        angle = segmentsToAngle(initialData.end);
        value = initialData.end;
        this.graphdata.push({ value: value, label: 'a', angle: angle });
        angle = segmentsToAngle(initialData.start);
        value = angleTO.invert(angle);
        this.graphdata.push({ value: value, label: 'e', angle: angle });
      },
      "calculateUpdateHandleData": function (values: any) {
        this.graphdata = [];
        var value = 0, angle = 0; var angleTo = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]); var segmentsToAngle = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        angle = segmentsToAngle(values.end);
        value = angleTo.invert(angle);
        this.graphdata.push({ value: value, label: 'a', angle: angle });
        angle = segmentsToAngle(values.start);
        value = angleTo.invert(angle);
        this.graphdata.push({ value: value, label: 'e', angle: angle });
      },
      "getValueOfDataSet": function (label: any) {
        var value = 0;
        this.graphdata.forEach(function (el: any, i: any) {
          if (el.label == label) value = el.value;
        });
        return value;
      },
      "getAngleOfDataSet": function (label: any) {
        var angle = 0;
        this.graphdata.forEach(function (el: any, i: any) {
          if (el.label == label) angle = el.angle;
        });
        return angle;
      },
      "getsetValue": function (label: any) {
        return this.graphdata.filter((u: any) => u.label == label)[0];
      },
      "getData": function () {
        return this.graphdata;
      }
    }

    var angularScale = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
    var angularvalue = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
    var tickdata = function () {
      var pec1 = ((sliderEndValue - sliderInitValue) / 100);
      return d3.range(0, 101).map(function (v, i) {
        var segmentsToAngle = d3.scaleLinear().range([360, 0]).domain([0, 100]);
        return { angle: segmentsToAngle(v), label: v % 5 ? null : v.toFixed(0) };
      });
    }
 
    function writeTimeInfo(sliderObject: any) {
      //var con: boolean = false;
      //try {
      //  con = that.cusIndexService.checkBelow100Comp(
      //    that.cusIndexService.exclusionCompData.value,
      //    that.cusIndexService.remCompData.value,
      //    that.cusIndexService.remGicsData.value,
      //    that.cusIndexService.getStrFacData(that.factorid, (parseInt(sliderObject.e.toFixed(0))), (parseInt(sliderObject.a.toFixed(0))), that.switchTabName_P, that.orgTopValue, that.orgBottomValue)
      //  );
      //} catch (e) { }
      //if (con) {
      //  that.SSRValueStart = parseInt(sliderObject.e.toFixed(0));
      //  that.SSRValueEnd = parseInt(sliderObject.a.toFixed(0));
      //  if (that.dragStarted && ((sliderObject.a == 0 || sliderObject.a == 100) && sliderObject.e == 0)) {
      //    that.showSlider2 = true;
      //    //that.Slide_count = -1;
      //    //that.exclControlRight();
      //    d3.select('#erfScoreCircle').select('.sliderDispTicks').style('display', 'none');
      //    d3.selectAll('.animateCircle').style('display', 'block');
      //    that.saveFactorsStrateg(true);
      //  } else if (that.dragStarted) { that.saveFactorsStrateg(); }
      //  that.showSlider2 = true;
      //  that.SliderOnChange();
      //} else {
      //  that.tabClicl('init');
      //  that.sharedData.showAlertMsg2("", that.cusIndexService.minCustInd.message);
      //}
    }
    var tau = 2 * Math.PI;

    var svg = d3.selectAll("#sunB").select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
    holder = svg.append('g').attr('id', 'arcindicator').attr("class", "sliderDisp").style("display", "block");
    helper.calculateInitialData(Intdata);
    a = helper.getValueOfDataSet("a");
    e = helper.getValueOfDataSet("e");
    startAngle = helper.getAngleOfDataSet("a");
    endAngle = helper.getAngleOfDataSet("e");

    writeTimeInfo({ a: a, e: e, aAngle: startAngle, eAngle: endAngle });

    //drawTickers();
    var arc1 = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); })
    var tempVal;
    indicatorArc = holder.append("g").attr("class", "arcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill", function () { return accentColor; }).attr("d", arc1)

    var arc2 = d3.arc()
      .innerRadius(innerRadius-1)
      .outerRadius(innerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); })

    holder.append("g").attr("class", "innerarcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill",'#fff').attr("d", arc2)


    handles = svg.append('g').attr('id', 'handles')
      .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "sliderDisp").style("display", "none");
    dragBehavior = d3.drag().subject(function (d) { return d; }).on("drag", function (ev: any, d: any) {
      if (!that.checkStgyAlreadyTraded) {
        if (d.label == 'e') {
          var coordinaters = d3.pointers(ev, svg.node());
          var x = coordinaters[0][0] - radius;
          var y = coordinaters[0][1] - radius;
          var nA = (Math.atan2(y, x) * 180 / Math.PI) + 90;
          if (nA < 0) { nA = 360 + nA; }
          nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
          var newvalue = angularScale.invert(nA);
          var cvalue = ((newvalue / sliderDragRange) - ((newvalue / sliderDragRange) % 1)) * sliderDragRange;
          if (a1Value == 0) { a1Value = 100; }
          if (d.value > that.SSRValueEnd) {
            d.value = 0;
            d.angle = angularvalue.invert(d.value);
          }
          if (a2Value < that.SSRValueEnd) {
            a2Value = d.value;
            dragmoveHandles(ev, d);
          
            that.rangevalue(d)
          }
        }

        if (d.label == 'a') {
          var coordinaters1 = d3.pointers(ev, svg.node());
          var xx = coordinaters1[0][0] - radius;
          var yy = coordinaters1[0][1] - radius;
          var nA1 = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
          if (nA1 < 0) { nA1 = 360 + nA1; }
          nA1 = nA1 - ((nA1 * sliderEndValue) % 125) / rangeTotal;
          var newvalue1 = angularScale.invert(nA1);
          var cvalue1 = ((newvalue1 / sliderDragRange) - ((newvalue1 / sliderDragRange) % 1)) * sliderDragRange;
          if (cvalue1 == 0) { cvalue1 = 100; }
          if (a1Value == 0) { a1Value = 100; }
          if (d.value < that.SSRValueStart) {
            d.value = 100;
            d.angle = angularvalue.invert(d.value);
          }
          if (that.SSRValueStart < a1Value) {
            a1Value = d.value;
            dragmoveHandles(ev, d);
            that.rangevalue(d)
          }
        }
        that.dragStarted = true;
        d3.select("#sunB").select('.applychanges').style('display', 'block');
      }
    }).on("end", function () {
      if (!that.checkStgyAlreadyTraded) {
        d3.select(this).classed('active', false);
        d3.selectAll("#sunB").select("#crlChart").select('.sliderToolTip').remove();
        checkHandlesPosition();
        //that.showApplyBtn = true;
      }
    });

    drawHandles();
    d3.selectAll("#sunB").selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });

    d3.selectAll("#sunB").select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius) * -1 + ')');

    d3.selectAll("#sunB").select('#handles').select('.a1').attr('transform', 'rotate(' + (startAngle) + ') translate(0,' + (radius) * -1 + ')');

    d3.selectAll("#sunB").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (that.SSRValueStart) + " " + '100').style('display', 'block');
    d3.selectAll("#sunB").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (100 - that.SSRValueEnd) + " " + '100').style('display', 'block');

    d3.selectAll("#sunB").select('#handles').style('display', 'block');

    updateHandles(helper.getsetValue('e'));
    updateHandles(helper.getsetValue('a'));

    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter()
        .append('g')
        .attr('class', 'handlercontainer')
        .attr('transform', function (d: any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius) * -1 + ')'; })
        .on("pointerenter", function (ev: any) { d3.select(ev).classed('active', true); })
        .on("pointerleave", function (ev: any) { d3.select(ev).classed('active', false); })
        .call(dragBehavior);

      circles.append('circle')
        .attr('r', handleRadius)
        .attr('class', 'handle')
        .style('stroke', 'var(--leftSideText-B)')
        .style('stroke-width', handleStrokeWidth)
        .attr('cursor', 'pointer')
        .style('fill', "var(--primary-color-Alt)")
        .style('stroke-opacity', 1)
        .attr('id', function (d: any) { return d.label; })
        .on('pointerenter', function (ev: any) { d3.select(ev).classed('active', true); })
        .on('pointerleave', function (ev: any) { d3.select(ev).classed('active', false); });
      const atext = circles.append("svg")
        .attr('width', 10)
        .attr('height', 15)
        .attr('y', -7.5).attr('x', -5)
        .attr('viewBox', '0 0 20 20')
        .style('display', 'none')
        .attr("transform", function (d: any) {
          if (d.label == 'e') return "rotate(" + (d.angle * (-1)) + ")"; else return "rotate(" + (d.angle * (-1)) + ")";
        })
        .attr("id", function (d: any) {
          if (d.label == 'e') return "SHMtextinner"; else return "SHMtext1inner";
        }).attr("class", "dragH-val")
        .text(function (d: any) {
          if (d.label == 'e') {
            return "";
          } else { return ""; }
        });
      const pathData = "M13.1364 3.11361C13.4879 3.46508 13.4879 4.03493 13.1364 4.3864L7.5228 10L13.1364 15.6136C13.4879 15.9651 13.4879 16.5349 13.1364 16.8864C12.7849 17.2379 12.2151 17.2379 11.8636 16.8864L5.61361 10.6364C5.26214 10.2849 5.26214 9.71508 5.61361 9.36361L11.8636 3.11361C12.2151 2.76214 12.7849 2.76214 13.1364 3.11361Z";
      const pathData2 = "M5.61204 3.11321C5.26054 3.46468 5.26054 4.03453 5.61204 4.386L11.2256 9.9996L5.61204 15.6132C5.26054 15.9647 5.26054 16.5345 5.61204 16.886C5.96354 17.2375 6.53334 17.2375 6.88484 16.886L13.1348 10.636C13.4863 10.2845 13.4863 9.71468 13.1348 9.36321L6.88484 3.11321C6.53334 2.76174 5.96354 2.76174 5.61204 3.11321Z";
      atext.append('path')
        // .attr('d', pathData)
        .attr("d", function (d: any) {
          if (d.label == 'e') return pathData; else return pathData2;
        })
        .attr('fill', 'white');
      /******* Tooltip *******/
      circles.append('circle')
        .attr('r', 16)
        .attr('class', 'handle')
        .style('stroke', 'var(--prim-button-color)')
        .style('stroke-width', handleStrokeWidth)
        .attr('cursor', 'default')
        .style('fill', "var(--prim-button-color)")
        .style('stroke-opacity', 1)
        .style('display', 'none')
        .attr('transform', 'translate(0,-30)')
        .attr('id', function (d: any) { return d.label + 'tooltip'; })
      var apdg = circles.append("g").attr("transform", "translate(0,-30)");
      apdg.append("text")
        .attr("transform", function (d: any) {
          if (d.label == 'e') return "rotate(" + (d.angle * (-1)) + ")"; else return "rotate(" + (d.angle * (-1)) + ")";
        })
        .style("text-anchor", "middle").style('dominant-baseline', 'central').attr("id", function (d: any) {
          if (d.label == 'e') return "SHMtext"; else return "SHMtext1";
        }).attr("class", "dragH-val")
        .style('font-family', 'var(--ff-medium)').style('font-size', '9px').style('cursor', 'auto')
        .style('fill', 'var(--leftSideText-B)').style('display', 'none')
        .text(function (d: any) { if (d.value > 0) return d.value + '%'; else return "" });
      /******* Tooltip *******/

      var handleloaderMain = circles.append("g").attr('id', 'sliderHandleLoader').attr('width', '38').attr('height', '38').attr('viewBox', '0 0 38 38')
        .attr('stroke', 'var(--prim-button-color)').style('display', 'none').attr('transform', 'translate(-11,-11)')
        .append("g").attr('fill', 'transparent').attr('fill-rule', 'evenodd').attr('transform', 'scale(0.56)');

      var handleloaderSub = handleloaderMain.append("g").attr('transform', 'translate(1 1)').attr('stroke-width', '6')
      handleloaderSub.append("circle").attr('stroke-opacity', '0.5').attr('cx', '18').attr('cy', '18').attr('r', '18').attr('fill', 'transparent').attr('stroke', 'transparent');
      handleloaderSub.append("path").attr('d', 'M36 18c0-9.94-8.06-18-18-18').append("animateTransform")
        .attr('attributeName', 'transform').attr('type', 'rotate').attr('from', '0 18 18').attr('to', '360 18 18').attr('dur', '1s').attr('repeatCount', 'indefinite');
    }
    function drawTickers() {
      svg.select("#ticks").remove();
      var checkPoi = (sliderEndValue - sliderInitValue) <= 20 ? 1 : 0;
      var ticks = svg.append("g").attr('id', 'ticks').attr("class", 'sliderDispTicks').style("display", "none").attr('transform', 'translate(' + radius + ',' + radius + ')')
        .selectAll("g").data(tickdata).enter().append("g")
        .attr("class", function (d, i) { return "tick" + i; })
        .style("cursor", 'default')
        .attr("transform", function (d) {
          return "rotate(" + (d.angle - 90) + ")" + "translate(" + (innerRadius + 18) + ",0)";
        });
      ticks.append("line").attr('id', function (d) { return 'top' + d.label }).attr("y1", 0).attr('transform', 'translate(-15,0)')
        .attr("x1", function (d) { if (d.label || d.angle == 0) return -2; else return 0; })
        .attr("x2", function (d) { if (d.label || d.angle == 0) return -4; else return 0; })
        .attr("y2", 0).style("stroke", tickColor1).style("stroke-width", "0.6px");
      ticks.append("text").attr("x", 5).attr("dy", "0.35em")
        .attr("transform", function (d): any {
          if (d.angle > 0 && d.angle <= 90) { return checkPoi == 1 ? "rotate(90)translate(-10,10)" : "rotate(90)translate(-10,10)"; }
          else if (d.angle > 90 && d.angle <= 180) { return checkPoi == 1 ? "rotate(-90)translate(-10,-10)" : "rotate(-90)translate(-10,-10)"; }
          else if (d.angle > 180 && d.angle <= 270) { return checkPoi == 1 ? "rotate(-90)translate(5,-10)" : "rotate(-90)translate(5,-10)"; }
          else if (d.angle > 270 && d.angle <= 360) { return checkPoi == 1 ? "rotate(90)translate(5,10)" : "rotate(90)translate(5,10)"; }
        })
        .style("text-anchor", function (d) { return d.angle > 180 ? "end" : null; })
        .style("fill", tickColor1).style("font-size", "7px").style("font-family", 'var(--ff-regular)').text(function (d): any { if (d.label != null) { return ""; } })
        .on('click', function (d) { });

      var roTicker = d3.selectAll("#sunB").select("#slider").select("#holder").select("#ticks");

      roTicker.select(".tick0").select("text").text('')
      roTicker.select(".tick100").select("text").text('')
      roTicker.select(".tick0").select("line").remove();
      roTicker.select(".tick100").select("line").remove();
      svg.select("#resetHandle").remove();

      var handles1 = svg.append('g')
        .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "resetHandle");

      //// Reset
      var resetHandle = svg.append("g").attr('id', 'resetHandle').attr("class", 'resetHandle').style("display", "none").attr('transform', 'translate(' + radius + ',' + radius + ')')
        .append('g').attr('transform', ('translate(0,' + (radius) * -1 + ')')).append('circle').attr('r', handleRadius).style('stroke', '#d0d4dc')
        .style('stroke-width', handleStrokeWidth).attr('cursor', 'pointer').style('fill', "#d0d4dc").style('stroke-opacity', 1)
        .on('click', function (d) { });
    }
    function dragmoveHandles(ev: any, d: any) {
      if (d.label == 'e') {
        var coordinaters = d3.pointers(ev, svg.node());
        var x = coordinaters[0][0] - radius;
        var y = coordinaters[0][1] - radius;
        var newAngle = (Math.atan2(y, x) * 180 / Math.PI) + 90;
        if (newAngle < 0) { newAngle = 360 + newAngle; }
        newAngle = newAngle - ((newAngle * sliderEndValue) % 125) / rangeTotal;
        d.value = angularScale.invert(newAngle);
        var dvalue = ((d.value / sliderDragRange) - ((d.value / sliderDragRange) % 1)) * sliderDragRange;
        d.value = dvalue;
        d.angle = angularvalue.invert(dvalue);
        if (d.value > that.SSRValueEnd) {
          d.value = 0;
          d.angle = angularvalue.invert(d.value);
        }
        if (that.SSRValueStart < that.SSRValueEnd) {
          that.SSRValueStart = d.value;
          updateHandles(d);
        }

      } else {
        var coordinates1 = d3.pointers(ev, svg.node());
        var xx = coordinates1[0][0] - radius;
        var yy = coordinates1[0][1] - radius;
        var newAngle1 = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
        if (newAngle1 < 0) { newAngle1 = 360 + newAngle1; }
        newAngle1 = newAngle1 - ((newAngle1 * sliderEndValue) % 125) / rangeTotal;
        d.value = angularScale.invert(newAngle1);
        var dvalue = ((d.value / sliderDragRange) - ((d.value / sliderDragRange) % 1)) * sliderDragRange;
        d.value = dvalue;
        d.angle = angularvalue.invert(dvalue);
        if (d.value < that.SSRValueStart) {
          d.value = 100;
          d.angle = angularvalue.invert(d.value);
        }
        if (that.SSRValueStart < that.SSRValueEnd) {
          that.SSRValueEnd = d.value;
          updateHandles(d);
        }
      }
    }
    function updateArc() {
      var handlerContainer = d3.selectAll("#sunB").selectAll('#handles .handlercontainer'); //select all handles
      var startValue = 0;
      var endValue = 0;
      handlerContainer.each(function (d: any) {
        if (d.label == "a") { startValue = d.angle; }
        if (d.label == "e") { endValue = d.angle; }
      });
      //replace arc
      arc1 = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(function (d) { return startValue * (Math.PI / 180); })
        .endAngle(function (d) { return endValue * (Math.PI / 180); });
      indicatorArc.attr("d", arc1);
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d: any, i: any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      dragLiveData = currentData;
    }

    function updateHandles(dd: any) {
      if (dd.label == 'a') {
        a1Value = dd.value;
        var endvalue = dd.value;
        d3.select('.c_remaining_slide1_range_max').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#sunB").select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius - 2) * -1 + ')');
        updateArc();
        d3.selectAll('.animateCircle').style('display', 'none');
        d3.select('.rightGrid_drag').style('display', 'none');
        var dragalternate = 0;
        if (a1Value == 0 || a1Value == 100) {
          dragalternate = 0;
          if (a2Value == 0 || a2Value == 100) {
            d3.select('.rightGrid_drag').style('display', 'none');
          } else { d3.select('.rightGrid_drag').style('display', 'block'); }

        } else { dragalternate = 100 - a1Value; }

        d3.selectAll("#sunB").select('#gradArc').select('.circle_overlay_alt')
          .attr('stroke-dasharray', (dragalternate) + " " + '100').style('display', 'block');
        if (dd.value > 0 && dd.value < 100) {
          d3.selectAll("#sunB").selectAll(".a1 #SHMtext1").style('display', 'block').attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text(dd.value.toFixed(0) + '%');
          d3.selectAll("#sunB").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#sunB").selectAll(".a1 #atooltip").style('display', 'block');
        } else {
          d3.selectAll("#sunB").selectAll(".a1 #SHMtext1").style('display', 'none').text('');
          d3.selectAll("#sunB").selectAll(".a1 #SHMtext1inner").style('display', 'block');
          d3.selectAll("#sunB").selectAll(".a1 #atooltip").style('display', 'none');
        }
      }

      if (dd.label == 'e') {
        a2Value = dd.value;
        d3.select('.c_remaining_slide1_range_min').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#sunB").select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius - 2) * -1 + ')');
        updateArc();
        d3.selectAll('.animateCircle').style('display', 'none');
        d3.select('.leftGrid_drag').style('display', 'none');
        if (a1Value == 0 || a1Value == 100 && a2Value > 0) {
          d3.select('.rightGrid_drag').style('display', 'block');
        } else {
          d3.select('.rightGrid_drag').style('display', 'none');

        }
        if (a2Value == 0 || a2Value == 100) {
          d3.select('.leftGrid_drag').style('display', 'block');
        }
        d3.selectAll("#sunB").select('#gradArc').select('.circle_overlay')
          .attr('stroke-dasharray', (a2Value) + " " + '100').style('display', 'block');
        if (dd.value > 0) {
          d3.selectAll("#sunB").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'block').text(dd.value.toFixed(0) + '%');
          d3.selectAll("#sunB").selectAll(".a2 #SHMtextinner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#sunB").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#sunB").selectAll(".a2 #etooltip").style('display', 'block');

        } else {
          d3.selectAll("#sunB").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'none').text('');
          d3.selectAll("#sunB").selectAll(".a2 #SHMtextinner")
            .style('display', 'none');
          d3.selectAll("#sunB").selectAll(".a2 #etooltip").style('display', 'none');
        }
      }

    }

    function checkHandlesPosition() {
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d: any, i: any) { currentData[d.label] = d.value; currentData[d.label + "Angle"] = d.angle; });
      var ddmin: any = d3.min([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      var ddmax: any = d3.max([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      //var tempfacter = that.cusIndexService.PostStrategyFactorsData.value.map((a: any) => ({ ...a }));
      var tempfacter:any = [];
      var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == that.factorid);
      var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == that.factorid);
      var checkPro: boolean = true;
      if (filterFactor.length > 0 && index > -1) {
        if (tempfacter[index].startval == ddmin && tempfacter[index].endval == (100 - ddmax)) { checkPro = false; }
      } else if (ddmin == sliderEndValue && ((100 - ddmax) == sliderInitValue || ddmax == 0)) { checkPro = false; }
      if (index == -1 && currentData.a == 100 && currentData.e == 0) {
        checkPro = false;
        d3.select("#sunB").select('.applychanges').style('display', 'none');
      }
      if (checkPro) { writeTimeInfo(currentData); }
    }
  }



  createComp(dta: any) {
    var data = [...dta];
    const width: any = 928;
    const radius: any = (width / 3)-20;
    var len = data.length;
    data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });

    var Svg = select("#sunB").select("#comp");
    Svg.selectAll("g").remove();
    var compC = Svg.append("g").attr("class", 'compLstC');


    var compg = compC.selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("class", "comp")
      .attr("transform", function (d: any) { return "rotate(" + (d.cx) + ")"; })
      .attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .on("pointerenter", function (ev: any, d: any) {
        d3.select(ev).raise();
        d3.select(ev).select(".crect").classed("onrect", true);
      }).style("display", "block")
      .on("pointerleave", function (ev: any, elemData: any) {
        d3.select("#gCompMOver").style("display", "none");
        d3.select("#gCompeOver").style("display", "none");
        d3.select(ev).select(".crect").classed("onrect", false);       
      });

    let SelRes = [...this.sharedData._selResData];
    var dmin: any = d3.min(SelRes.map(x => x.marketCap));
    var dmax: any = d3.max(SelRes.map(x => x.marketCap));
    var dmean: any = d3.mean(SelRes.map(x => x.marketCap));
    var dsum: any = d3.sum(SelRes.map(x => x.marketCap));

    let ResMarketCap = SelRes.map(x => x.marketCap);
    let LimitedCap = ResMarketCap.filter(x => x < dmean && x != null);
    let dlimitedSum = d3.sum(LimitedCap);

    var rmax = (dmax - dmin) > 100 ? 100 : (dmax - dmin);
    rmax = rmax < 50 ? 50 : rmax;

    compg.append("rect").attr("height", "1px")
      .attr("class",'crect')
      .attr("fill", "#4b4b4b")
      .attr("x", radius-10)
      .attr("width", 0)
      .transition()
      .duration(10)
      .attr("width", function (d: any) {
        let wtdwidth = 0;
        var wt = ((d.marketCap / dlimitedSum) * 10000);
        if (d.marketCap < dmean) {
          wtdwidth = wt;
        }
        else {
          wt = ((d.marketCap / dsum) * 10000);
          if (wt > 18) { wt = 18 + wt / 10; }
          wtdwidth = wt;
        }
        if (wtdwidth > 25) { wtdwidth = 25 + wtdwidth / 10; }
        if (wtdwidth > 40) { wtdwidth = 40; }
        return wtdwidth + 10;
      });
  }

  chartRadius: number = 40;
  //donData = [
  //  /*{ type: 'universe', id: 1, refid: 0, level: 1, "name": "S&P 500", data:[]},*/
  //  { type: 'universe', id: 2, refid: 0, level: 1, "name": "S&P 600", data:[]},
  //  /*{ type: 'universe', id: 9, refid: 0, level: 1, "name": "S&P 400", data:[]},*/
  //  { type: 'liquidity', id: 3, refid: 1, level: 2, "name": "Liquidity", data:[]},
  //  { type: 'h-factor', id: 4, refid: 1, level: 2, "name": "h-factor", data:[]},
  //  { type: 'gics', id: 5, refid: 1, level: 2, "name": "Gics", data:[]},
  //  { type: 'factors', id: 6, refid: 1, level: 2, "name": "Factors", data:[]},
  //  { type: 'h-factor', id: 7, refid: 2, level: 2, "name": "h-factor", data: [] },
  //  { type: 'liquidity', id: 8, refid: 2, level:3, "name": "Liquidity", data: [] },
  //  { type: 'gics', id: 9, refid: 2, level: 3, "name": "Gics", data: [] },
  //];

  //donData: any = [
  //  { type: 'universe', id: 1, refid: 0, level: 1, parent: 0,pIndex:0, child:[2,3,4], "name": "S&P 600", data: [] },
  //  { type: 'liquidity', id: 2, refid: 1, level: 2, parent: 1, pIndex: 1, child: [5,6], "name": "Liquidity", data: [] },
  //  { type: 'h-factor', id: 3, refid: 1, level: 2, parent: 1, pIndex: 2, child: [], "name": "h-factor", data: [] },
  //  { type: 'factors', id: 4, refid: 1, level: 2, parent: 1, pIndex:3, child: [], "name": "Factors", data: [] },
  //  { type: 'liquidity', id: 5, refid: 1, level: 3, parent: 2, pIndex: 1, child: [], "name": "Liquidity", data: [] },
  //  { type: 'gics', id: 6, refid: 1, level: 3, parent: 2, pIndex: 1, child: [], "name": "Gics", data: [] },
  //  { type: 'h-factor', id: 7, refid: 1, level: 3, parent: 4, pIndex: 3, child: [], "name": "h-factor", data: [] },
  //];

  donData = [
    {
      "type": "universe",
      "id": 1,
      "refid": 0,
      "level": 1,
      "parent": 0,
      "pIndex": 1,
      "child": [],
      "name": "S&P 600",
      "data": []
    },
    {
      "type": "liquidity",
      "id": 2,
      "refid": 1,
      "level": 2,
      "parent": 1,
      "pIndex": 1,
      "child": [
        5,
        6
      ],
      "name": "Liquidity",
      "data": []
    },
    {
      "type": "h-factor",
      "id": 3,
      "refid": 1,
      "level": 2,
      "parent": 1,
      "pIndex": 2,
      "child": [],
      "name": "h-factor",
      "data": []
    },
    {
      "type": "factors",
      "id": 4,
      "refid": 1,
      "level": 2,
      "parent": 1,
      "pIndex": 3,
      "child": [],
      "name": "Factors",
      "data": []
    },
    {
      "refid": 1,
      "level": 2,
      "type": "stock-price",
      "id": 10,
      "name": "Stock Price",
      "data": [],
      "child": [],
      "pIndex": 4,
      "parent": 1
    },
    {
      "refid": 1,
      "level": 2,
      "type": "market-cap",
      "id": 11,
      "name": "Market Cap.",
      "data": [],
      "child": [],
      "pIndex": 5,
      "parent": 1
    },
    {
      "refid": 1,
      "level": 2,
      "type": "gics",
      "id": 12,
      "name": "GICS",
      "data": [],
      "child": [],
      "pIndex": 6,
      "parent": 1
    },
    {
      "type": "liquidity",
      "id": 5,
      "refid": 1,
      "level": 3,
      "parent": 2,
      "pIndex": 1,
      "child": [],
      "name": "Liquidity",
      "data": []
    },
    {
      "type": "gics",
      "id": 6,
      "refid": 1,
      "level": 3,
      "parent": 2,
      "pIndex": 2,
      "child": [],
      "name": "Gics",
      "data": []
    },
    {
      "refid": 1,
      "level": 3,
      "type": "stocks",
      "id": 9,
      "name": "Stocks",
      "data": [],
      "child": [],
      "pIndex": 1,
      "parent": 3
    },
    {
      "type": "h-factor",
      "id": 7,
      "refid": 1,
      "level": 3,
      "parent": 11,
      "pIndex": 1,
      "child": [],
      "name": "h-factor",
      "data": []
    },
    {
      "refid": 1,
      "level": 4,
      "type": "stocks",
      "id": 8,
      "name": "Stocks",
      "data": [],
      "child": [],
      "pIndex": 1,
      "parent": 5
    },
    {
      "refid": 1,
      "level": 4,
      "type": "market-cap",
      "id": 13,
      "name": "Market Cap.",
      "data": [],
      "child": [],
      "pIndex": 1,
      "parent": 7
    }
  ];
  
  createDropzoneCircle(levelDt:any) {
    var that = this;
    var g: any = d3.select('#dropZoneLine');
    var level: any = [];
    [...levelDt].forEach((x: any, i: any) => { level.push(that.chartRadius * (i + 1)); });
    level.push(((level.length + 1) * that.chartRadius ));
    level.forEach((radius:any, index:any) => {
      g.append('circle')
        .attr('r', radius)
        .attr('cx', 0) // Center the circle (X-coordinate)
        .attr('cy', 0) // Center the circle (Y-coordinate)
        .attr('class', 'fillUniverse dz_level'+index);
    });
   
  }
  hideHighlight() {
    const dropZoneGroup = select('#dropZoneLine');
    dropZoneGroup.selectAll('circle').style('visibility', 'hidden');
  }
  compareAndHighlight(): void {
    const arcGroup = select('#arcChartCircle');
    const dropZoneGroup = select('#dropZoneLine');
    arcGroup.selectAll('g').each(function () {
      const className = (this as Element).getAttribute('class');
      if (className) {
        const match = className.match(/level(\d+)/);
        dropZoneGroup.selectAll(`circle.dz_${className}`).each(function () {
          select(this).attr('fill', 'yellow').style('visibility', 'visible');
        });
        if (match) {
          var inc = parseInt(match[1]) + 1;
          dropZoneGroup.select(`circle.dz_level${inc}`).style('visibility', 'visible');
        }
      }
    });
  }
  legendShowList: any = [];
  createCircleLegend(legendData:any) {
    var that = this;
    this.legendShowList = [...this.donData].filter((x: any) => x.id == this.selUniId || x.refid == this.selUniId);
  }
  getLegendBgColor(dta: any) {
    var that = this;
    var clrDt = that.boxes.filter((x: any) => x.type == dta.type);
    if (clrDt.length > 0) { return clrDt[0]['color'] } else { return '#ddd' }
  }
  onLegendHighlight(type:string, value:any) {
    //if (type == 'show') {
    //  d3.select('#arcChartCircle').selectAll('path').style('opacity', 0.5).style('transform', 'scale(1)');
    //  d3.select('#arcChartCircle').select('#childArc-' + value.id).style('opacity', 1).style('transform', 'scale(1.05)');
    //} else {
    //  d3.select('#arcChartCircle').selectAll('path').style('opacity', 1).style('transform', 'scale(1)');
    //}
  }
  donCre() {
    var that = this;
    var data = [];
    const width: any = 928;
    const height: any = width;
    const radius: any = width / 3;
    this.donData = [...this.donData].filter((x: any) => x.id == this.selUniId || x.refid == this.selUniId);
    this.donData = [...this.donData.sort(function (x: any, y: any) { return ascending(x.pIndex, y.pIndex); }).sort(function (x: any, y: any) { return ascending(x.level, y.level); })];
    const color: any = scaleOrdinal(quantize(interpolateRainbow, data.length + 1));
    var level: any = [...new Set(this.donData.map((item: any) => item.level))];
    level = level.sort(function (x: any, y: any) { return ascending(x, y); });
    console.log(this.donData,'donData');
    select('#sunB').select('#arcChartCircle').selectAll('*').remove();
    var path: any = d3.select('#arcChartCircle');
    if (level.length > 12) { this.chartRadius = 15 }
    else if (level.length > 6) { this.chartRadius = 25 }
    else { this.chartRadius = 40 }

    if (level.length > 0) {
      level.forEach((x: any, i: any) => {
        var dt = that.donData.filter((fx: any) => fx.level === x);       
        if (dt.length > 0 && isNotNullOrUndefined(dt[0]['type']) && dt[0]['type'] === 'universe') {
          that.unverseArc(dt, path);
        } else if (dt.length > 0 ) {
          that.childArc(dt, path, i);
        }
      });
    }

    var arc1: any = arc().startAngle(0).endAngle(360).innerRadius(radius -40).outerRadius(radius-35);
    d3.select('#mainPath').append('path')
      .attr('class', 'arc')
      .attr('d', arc1)
      .attr('fill', "var(--iconColor)");

    that.createDropzoneCircle(level);
    that.createCircleLegend(this.donData);
  }

  unverseArc(data: any, path: any) {
    var that = this;
    var unipath: any = path.append('g').attr('class', 'curArc universe');
    var start = (Math.PI / 180), end = (Math.PI / 180);   
    if (data.length == 1) {
      var arc1: any = arc()
        .startAngle((start * (0)))
        .endAngle((end * 360))
        .innerRadius(0)
        .outerRadius(this.chartRadius);
      unipath.append('path')
        .attr('class', 'arc')
        .attr('id', 'childArc-' + data[0].id)
        .attr('d', arc1)
        .attr('fill', "var(--iconColorHover)").datum(data[0])
        .attr('fill', "#402a75")
        .on("mouseover", function (event: any, d: any) { that.arcTooltip("mouseover", event, d); })
        .on("mousemove", function (event: any, d: any) { that.arcTooltip("mousemove", event, d); })
        .on("mouseout", function () { that.arcTooltip("mouseout", null, null); });
    } else {
      var per = scaleLinear().domain([0, data.length]).range([0, 360]);
      if (data.length == 2) {
        per = scaleLinear().domain([0, data.length]).range([-90, 270]);
      }
      data.forEach((x: any, i: any) => {
        var arc1: any = arc()
          .padAngle(0.05)
          .startAngle((start * per(i)))
          .endAngle((end * per(i + 1)))
          .innerRadius(0.5)
          .outerRadius(75 - 3);
        unipath.append('path')
          .datum(x)
          .attr('class', 'arc')
          .attr('d', arc1)
          .datum(x)
          .attr('fill', "var(--iconColorHover)")
          .on("mouseover", function (event: any, d: any) { that.arcTooltip("mouseover", event, d); })
          .on("mousemove", function (event: any, d: any) { that.arcTooltip("mousemove", event, d); })
          .on("mouseout", function () { that.arcTooltip("mouseout", null, null); });
      });
    }
  }

  arcTooltip(type: string, event:any,d:any) {
    const tooltip = d3.select("#tooltip");
    const legend = d3.select(".right_legend");
    if (type === "mouseover" || type === "mousemove") {
      const id = '#legend-' + d.id;
      legend.selectAll("div").style("opacity", 0.4);
      legend.selectAll(id).style("opacity", 1);

      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px")
        .style("visibility", "visible");

      tooltip.select('.tooltipTxt').html(d.name);
      tooltip.select('.dots').style('background', this.getLegendBgColor(d));

      if (type === "mouseover") { this.onLegendHighlight('show', d); };
    } else {
      legend.selectAll("div").style("opacity", 1);
      tooltip.style("visibility", "hidden");
      this.onLegendHighlight('hide', '');
    }
  }

  checkPlaceArc(data: any, d: any) {
    return new Promise((resolve) => {
      const toLvlArc = [...new Set(data.map((item: any) => item.level))];
      let uniPer = scaleLinear().domain([0, 1]).range([0, 360]);
      let lvlDt: any[] = [];
      let dd = { ...d };
      var pIndex: number = (isNotNullOrUndefined(dd.pIndex)) ? dd.pIndex : 1;
      var level: number = (isNotNullOrUndefined(dd.level)) ? dd.level : 1;
      var parent: any = (isNotNullOrUndefined(dd.parent)) ? dd.parent : null;

        toLvlArc.forEach((lvl: any) => {
          var dt = data.filter((fx: any) => fx.level == level && fx.parent === parent);
          
          var parenDt = data.filter((fx: any) => fx.id === parent);
          if (parenDt.length > 0) {
            parent = (isNotNullOrUndefined(parenDt[0]['parent'])) ? parenDt[0]['parent']: null;
            pIndex = (isNotNullOrUndefined(parenDt[0]['pIndex'])) ? parenDt[0]['pIndex']: 1;
          }
          if (level > 0) { lvlDt.push({ level: level, pIndex: pIndex, data: dt, 'len': dt.length }); }
          level = --level;
      });
      lvlDt.sort((x: any, y: any) => ascending(x.level, y.level))
        .forEach((fy: any) => { uniPer = scaleLinear().domain([0, fy.len]).range([uniPer(fy.pIndex - 1), uniPer(fy.pIndex)]); });
      
      resolve(uniPer);
    });
  }

  async childArc(data: any, path: any, index: number) {
    const that = this;
    const childpath = path.append('g').attr('class', `curArc level${index}`);
    const innerRadius = this.chartRadius + (this.chartRadius * (index - 1));
    const outerRadius = this.chartRadius + (this.chartRadius * (index - 1)) + this.chartRadius;

    const createArc = (startAngle: number, endAngle: number, inner: number, outer: number) => arc()
      .padAngle(0.005)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .innerRadius(inner)
      .outerRadius(outer);

    const colorScale: any = scaleOrdinal(quantize(interpolateRainbow, data.length + 1));

    const groupDt = d3.group(data, (dy: any) => dy.parent);
   
    for (const ax of groupDt.values()) {
      for (const xx of ax) {
        var childPer: any = await that.checkPlaceArc([...that.donData], xx);
        const clrCode = that.boxes.find((xy: any) => xx.type === xy.type)?.color || colorScale(ax.indexOf(xx) + 1);

        if (ax.length == 1 && (isNullOrUndefined(xx.parent) || xx.parent == 0)) {
          childPer = scaleLinear().domain([0, ax.length]).range([0, 360]);
        }

        const arc1 = createArc(Math.PI / 180 * childPer(xx.pIndex - 1), Math.PI / 180 * childPer(xx.pIndex), innerRadius + 3, outerRadius - 3);

        childpath.append('path')
          .attr('class', 'childArc')
          .attr('id', `childArc-${xx.id}`)
          .attr('d', arc1)
          .attr('fill', clrCode)
          .datum(xx)
          .on("mouseover", (event: any, d: any) => that.arcTooltip("mouseover", event, d))
          .on("mousemove", (event: any, d: any) => that.arcTooltip("mousemove", event, d))
          .on("mouseout", () => that.arcTooltip("mouseout", null, null));
      }
    }

    //that.draggablePath();
  }

  Slide_count: number = 0;
  Dots_count: number = 2;
  outDragDt: any;
  createCircleSliderDot(eV: any) {
    var that = this;
    d3.select('#Circle_SliderDots').select('g').remove();
    var main = d3.select('#Circle_SliderDots');
    var dotCount = this.Dots_count;
    var dotRadius = 3;

      var g = main.append('g').attr('transform', 'translate(' + (dotCount == 4 ? -17 : -13) + ',240)').attr('id', 'dots');
      for (var i = 0; i < dotCount; i++) {
        var dot = g.append('g').attr('transform', 'translate(' + (i * 12) + ',0)');
        dot.append('circle').attr('r', dotRadius).attr('fill', 'var(--topNavbar)').attr('stroke', 'var(--topNavbar)').style('cursor', 'pointer').attr('id', 'dot' + i)
          .on('click', function () {
            var clickid = parseInt(d3.select(this).attr('id').replace('dot', ''));
            if (that.Slide_count < clickid) {
              that.Slide_count = clickid - 1;
              that.controlRight();
            }
            else if (that.Slide_count > clickid) {
              that.Slide_count = clickid + 1;
              that.controlLeft();
            }
          });
        if (that.Slide_count == i) { dot.select('circle').attr('fill', '#fff') }
      }
  }
  controlRight() {
    var that = this;
    var controlLeft = d3.select('#sunB').select('#left');
    var controlLeftDisable = d3.select('#sunB').select('#left .disableLeftCircle');
    var controlRight = d3.select('#sunB').select('#right');
    var controlRightDisable = d3.select('#sunB').select('#right .disableRightCircle');

    that.Slide_count++
    var con = d3.select('#sunB').select('#right').classed('disable');
    var slideV = 560 * that.Slide_count;
    if (con == false) {
      if (that.Slide_count <= this.Dots_count) {
        controlLeft.classed("disable", false);
        controlLeftDisable.style("display", 'none');
        if (that.Slide_count == 2) {
          ///// After right icon triggered automatically right icon will be disabled /////
          controlRight.classed("disable", true);
          controlRightDisable.style("display", 'block');
        }
      }
    }
    var t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
    d3.select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot(that.Slide_count);
   
  }
  controlLeft() {
    var that = this;
    var controlLeft = d3.select('#sunB').select('#left');
    var controlLeftDisable = d3.select('#sunB').select('#left .disableLeftCircle');
    var controlRight = d3.select('#sunB').select('#right');
    var controlRightDisable = d3.select('#sunB').select('#right .disableRightCircle');
    that.Slide_count--
    if (that.Slide_count < 0) { that.Slide_count = 0 }
    var con = d3.select('#sunB').select('#left').classed('disable');
    var slideV = 560 * that.Slide_count;
    if (con == false) {
      if (that.Slide_count >= 0) {
        if (that.Slide_count == 1) {
          controlLeft.classed("disable", false);
          controlLeftDisable.style("display", 'none');
          controlRight.classed("disable", false);
          controlRightDisable.style("display", 'none');
        }
        if (that.Slide_count == 0) {
          controlLeft.classed("disable", true);
          controlLeftDisable.style("display", 'block');
          controlRight.classed("disable", false);
          controlRightDisable.style("display", 'none');
        }
      }
    }
    var t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
    d3.select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot(that.Slide_count);
  }
  draggablePath() {
    var that = this;
    const svg = d3.select("#arcChartCircle");
    //const paths = svg.selectAll(".arc");
    //const paths: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown> = svg.selectAll<SVGPathElement, unknown>(".arc");
    const paths: d3.Selection<SVGPathElement, unknown, any, unknown> = svg.selectAll(".childArc");
    // Add drag behavior
    const drag = d3.drag<SVGPathElement, unknown>()
      .on("start", function (event) {
        // Bring the dragged element to the front
        d3.select(this).raise();
        that.compareAndHighlight();
      })
      .on("drag", function (event) {
        // Move the element as it's being dragged
        const dx = event.dx; // Change in x
        const dy = event.dy; // Change in y
        const path = d3.select(this);
        const transform = path.attr("transform") || "translate(0,0)";
        const [x, y] = transform.match(/-?\d+(\.\d+)?/g) || [0, 0];
        path.attr("transform", `translate(${+x + dx}, ${+y + dy})`);
      })
      .on("end", function (event: any, d: any) {
        // Handle dropping logic if needed
        var coordinaters = d3.pointers(event, select('.universe').node());
        var x = coordinaters[0][0];
        var y = coordinaters[0][1];
        var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
        var distance = Math.sqrt(x * x + y * y);
        that.hideHighlight();
        if (distance <= 265) {
          that.updateCentreArc(d, nA, distance);
        } else {
          $('#deleteArcModal').modal('show');
          that.outDragDt = d;
          that.delWrnTxt = "Are you sure you want to delete this " + ((isNotNullOrUndefined(d.name)) ? d.name : '') + '?';
          that.updateCentreArc(d, nA, distance);
        }
      });
    // Apply drag behavior to paths
    paths.call(drag);
  }

  checkArcPos(d: any, ev: any) {
    var coordinaters = d3.pointers(ev, select('.universe').node());
    var xx = coordinaters[0][0];
    var yy = coordinaters[0][1];
    var nA = ((Math.atan2(yy, xx) * (180)) / Math.PI);
    if (nA < -90) { nA = nA + 360; }
    var distance = Math.sqrt(xx * xx + yy * yy);
    const arcGroup = select('#arcChartCircle');
    arcGroup.selectAll('.tempArc').remove();
    if (distance <= 265) {
      arcGroup.selectAll('.curArc').style('opacity', 0.4)
      var dz: any = ((distance) / this.chartRadius);
      var level: number = parseInt(dz);
      level = (level + 1);
      this.tempMultiArc(d, nA, level);
    } else {
      this.tempObj = null;
      arcGroup.selectAll('.curArc').style('opacity', 1)
    }
  }

  checkPlaceArc2(data: any,  angle:any) {
    return new Promise((resolve) => {
      var toLvlArc = [...new Set(data.map((item: any) => item.level))];
      var uniPer = scaleLinear().domain([0, 1]).range([-90, 270]);
      let lvlDt: any[] = [];
      var inv = uniPer.invert(angle);
      var cPos = Math.floor(inv) + 1;
      var pIndex: number = 1
      var parent: number = 0;
      toLvlArc.forEach((level: any) => {        
        var dt: any = data.filter((fx: any) => fx.level == level);
        if (level > 2) { dt = data.filter((fx: any) => fx.level == level && fx.parent == parent); };
        uniPer = scaleLinear().domain([0, dt.length]).range([uniPer(cPos - 1), uniPer(cPos)]);
        inv = uniPer.invert(angle);
        cPos = Math.floor(inv) + 1;
        pIndex = cPos;
        if (level == 2) {
          var lDt = data.filter((fx: any) => fx.level == level && fx.pIndex == pIndex);
          parent = (lDt.length > 0 && isNotNullOrUndefined(lDt[0]['id'])) ? lDt[0]['id'] : 0;
        } else if (level > 2) {
          var lDt = dt.filter((fx: any) => fx.level == level && fx.pIndex == pIndex);
          parent = (lDt.length > 0 && isNotNullOrUndefined(lDt[0]['id'])) ? lDt[0]['id'] : 0;
        }
        lvlDt.push({ level: level, cPos: cPos, len: dt.length, 'data': dt });
      });
      resolve(lvlDt);
    });
  }

  tempObj: any;
  tempMultiArc(d: any, angle: any, level: any) {
    var that = this;
    that.tempObj = null;
    var dt: any = max(this.donData.map((x: any) => x.id));
    var id: number = (isNotNullOrUndefined(dt)) ? (dt + 1) : 1;
    var obj: any = { refid: this.selUniId, 'level': level, type: d.type, id: id, "name": d.label, data: [] ,child:[] };
    const tempArc = select('#arcChartCircle').append('g').attr('class', 'tempArc');
    var uniList = [...this.donData].filter((x: any) => x.id == this.selUniId || x.refid == this.selUniId);
    var maxLvl: any = max(uniList.map((x: any) => x.level));
      var start = (Math.PI / 180), end = (Math.PI / 180);
      var innerRadius: number = this.chartRadius + (this.chartRadius * (level - 1));
      var outerRadius: number = this.chartRadius + (this.chartRadius * (level - 1)) + this.chartRadius;
      var nxtLvlGrp: any = [];
      var curLvlGrp: any = [];
      var prvLvlGrp: any = [];
      var data: any = [];
      var uniPer: any = scaleLinear().domain([0, 1]).range([-90, 270]);
      var uniPer1: any = scaleLinear().domain([0, 1]).range([0, 360]);
    that.checkPlaceArc2([...that.donData], angle).then((res: any) => {
      var plData: any = [...res];
      var inv = uniPer.invert(angle);
      var cPos = Math.floor(inv) + 1;
        plData.forEach((plD: any) => {
          if (plD.level <= level) {
            var lenDt: any = (isNotNullOrUndefined(plD['data'])) ? plD['data'] : [];
            var preLvlFil: any = plData.filter((plD: any) => plD.level == (level - 1));
            prvLvlGrp = (preLvlFil.length > 0 && isNotNullOrUndefined(preLvlFil[0]['data'])) ? preLvlFil[0]['data'] : [];
            if (lenDt.length > 0) {
              uniPer = scaleLinear().domain([0, lenDt.length]).range([uniPer(cPos - 1), uniPer(cPos)]);
              uniPer1 = scaleLinear().domain([0, lenDt.length]).range([uniPer1(cPos - 1), uniPer1(cPos)]);
            }
            curLvlGrp = [...lenDt];
          }
          inv = uniPer.invert(angle);
          cPos = Math.floor(inv) + 1;
        });
      
        curLvlGrp = curLvlGrp.filter((clD: any) => clD.level == level);
        var nxtLvlFil: any = plData.filter((plD: any) => plD.level == (level + 1));
      nxtLvlGrp = (nxtLvlFil.length > 0) ? nxtLvlFil[0]['data'] : [];
      var parent: any = 0;
        if (curLvlGrp.length > 0) {
          data = [...nxtLvlGrp];
          data.push(d);
          var cPfil: any = curLvlGrp.filter((cpf: any) => cpf.pIndex == cPos);
          parent = (nxtLvlGrp.length > 0 && isNotNullOrUndefined(nxtLvlGrp[0]['parent'])) ? nxtLvlGrp[0]['parent'] :
            (cPfil.length > 0 && isNotNullOrUndefined(cPfil[0]['id'])) ? cPfil[0]['id'] : 0;
          obj['level'] = (level+1);
          obj['pIndex'] = data.length;
        } else if (curLvlGrp.length == 0 && prvLvlGrp.length > 0) {
          innerRadius = this.chartRadius + (this.chartRadius * (level - 2));
          outerRadius = this.chartRadius + (this.chartRadius * (level - 2)) + this.chartRadius;
          data.push(d);
          obj['level'] = (level);
          var cPfil: any = prvLvlGrp.filter((cpf: any) => cpf.pIndex == cPos);
          parent = (cPfil.length > 0 && isNotNullOrUndefined(cPfil[0]['id'])) ? cPfil[0]['id'] : 0;
          obj['pIndex'] = 1;
        } else if (curLvlGrp.length == 0 && prvLvlGrp.length == 0 && maxLvl < level) {
          uniPer = scaleLinear().domain([0, 1]).range([-90, 270]);
          uniPer1= scaleLinear().domain([0, 1]).range([0, 360]);
          innerRadius = this.chartRadius + (this.chartRadius * (maxLvl -1));
          outerRadius = this.chartRadius + (this.chartRadius * (maxLvl -1)) + this.chartRadius;
          data.push(d);
          obj['level'] = (maxLvl + 1);
          obj['pIndex'] = 1;
      }
      
      obj['parent'] = parent;
        var childPer = scaleLinear().domain([0, data.length]).range([uniPer1(cPos - 1), uniPer1(cPos)]);
        const color: any = scaleOrdinal(quantize(interpolateRainbow, data.length + 1));
        data.forEach((dx: any, index: number) => {
            var clrDt = that.boxes.filter((xy: any) => dx.type == xy.type);
            var clrCode: string = (clrDt.length > 0 && isNotNullOrUndefined(clrDt[0]['color'])) ? clrDt[0]['color'] : color(index + 1);
            var arc1: any = arc().padAngle(0.005).startAngle((start * childPer(index))).endAngle((end * childPer(index + 1)))
              .innerRadius(innerRadius + 3).outerRadius(outerRadius - 3);

          tempArc.append('path').attr('class', 'childArc').attr('d', arc1).attr('fill', clrCode);
        });
       that.tempObj = obj;
      });
  }

  selUniId: number = 1;
  //updateleftDragArc(d: any, angle: number, dist: number) {
  //  if (dist <= 265) {
  //  var dz: any = ((dist) / this.chartRadius);
  //  var level: number = parseInt(dz);
  //  //level = ((level * this.chartRadius) < dist) ? (level + 1) : level;    
  //  level = (level + 1);    
  //  var dt: any = max(this.donData.map((x: any) => x.id));
  //  var id: number = (isNotNullOrUndefined(dt)) ? (dt + 1) : 1;
  //  var data: any = [...this.donData];
  //  var obj: any = {
  //    refid: (d.type == 'universe' && level == 1)?0 : this.selUniId,
  //    'level': level,
  //    type: d.type,
  //    id: id,
  //    "name": d.label,
  //    data: []
  //    };
  //    //if (d.type == 'universe' || level == 1) { this.toastr.info('Univers alrady added', '', { timeOut: 3000 }); }
  //    //else if (level > 1) {
  //    data.push(obj);
  //    let sortedArray: any = this.convertlevel(data);
  //    this.donData = [...sortedArray];
  //    //}
  //  } else { this.toastr.info('Please dorp inner circle', '', { timeOut: 3000 }); }
  //  this.donCre();
  //}

  updateCentreArc(d: any, angle: number, dist: number) {
    //if (dist <=265) {
    //  var dz: any = ((dist) / this.chartRadius);
    //  var level: number = parseInt(dz);
    //  //level = ((level * this.chartRadius) < dist) ? (level + 1) : level;
    //  level = (level + 1);
    //  if (level > 1) {
    //    var dt: any = this.donData.filter((x: any) => x.id != d.id);
    //    d['level'] = level;
    //    dt.push(d);
    //    let sortedArray: any = this.convertlevel(dt);
    //    this.donData = [...sortedArray];
    //  }
    //}
    this.donCre();
  }

  convertlevel(data: any) {
    let arr: any[] = [];
    var lvl = [...new Set(data.map((item: any) => item.level))].sort((a: any, b: any) => d3.ascending(a, b));
    for (const level of lvl) {
      var lvlDt = [...data].filter((lvlX: any) => lvlX.level == level).sort((a: any, b: any) => d3.ascending(a.pIndex, b.pIndex));
      var lvlGrpDt = d3.group(lvlDt, (dy: any) => dy.parent);
      for (const lGD of lvlGrpDt.values()) {
        for (var [index, lxDt] of lGD.entries()) {
          lxDt['pIndex'] = (index + 1);
          arr.push(lxDt);
        }
      }
    }
    arr.sort((a: any, b: any) => d3.ascending(a.id, b.id));
    return [...arr];
  }


  delWrnTxt: string = '';
  deletecenterArc() {
    var id: number = (isNotNullOrUndefined(this.outDragDt.id)) ? this.outDragDt.id : 0;
    var dt: any = this.donData.filter((x: any) => x.id != id);
    let sortedArray: any = this.convertlevel(dt);
    this.donData = [...sortedArray];
    this.donCre();
  }
  rangeValuenumber: number = 0;
  rangevalue(d: any): void{ this.sharedData.circleRangeData.next(d); }

  txtx(d: any) { return ((d.cx) > 90) ? "-222" : "222"; }
  txtx1(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx1d(d: any) { return ((d.rx) > 90) ? "-190" : "188"; }
  txtx2(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx3(d: any) { return ((d.cx) > 90) ? "-192" : "192"; }
  txttrans(d: any) { return ((d.cx) > 90) ? "rotate(180)" : null; }
  txtanch(d: any) { return ((d.cx) > 90) ? "end" : null; }
}
