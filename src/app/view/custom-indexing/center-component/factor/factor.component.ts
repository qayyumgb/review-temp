import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CustomIndexService, factorRangeObject } from '../../../../core/services/moduleService/custom-index.service';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
declare var $: any;
@Component({
  selector: 'app-factor',
  templateUrl: './factor.component.html',
  styleUrl: './factor.component.scss'
})
export class FactorComponent implements OnInit, OnDestroy {
  factorid: number = 0;
  showSlider2: boolean = false;
  orgTopValue: number = 0;
  orgBottomValue: number = 0;
  SSRValueStart: any = 0;
  SSRValueEnd: any = 0;
  checkStgyAlreadyTraded: boolean = false;
  dragStarted: boolean = false;
  showApplyBtn: boolean = false;
  radius: number = 150;
  factorCompData: any = [];
  showanaLoading: boolean = false;
  exclCompData: any = [];
  switchTabName_P: string = "val";
  subscriptions = new Subscription();
  factdata: any;
  selectedFactorName: string = '';
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  MedTxtColor = "#eee";
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService) { }

  HFscore: any;
  impRevValue: any = undefined;
  selCompText: string = '';
  STW_Pricecurrency = '$';
  ngOnDestroy() {
    this.cusIndexService.tempFactorSwitch = 0;
    this.cusIndexService.selCompany.next(undefined);
    this.cusIndexService.custSelectFactor.next(undefined);
    this.cusIndexService.custSelectFactorData.next([]);
    this.subscriptions.unsubscribe();
  }
  performanceUIndexList: any;
  excessCumReturns: any;
  excessAnnReturns: any;
  getAnalysis() {
    this.showanaLoading = false;
    if (this.cusIndexService.performanceETFRList.value.length > 0 && this.cusIndexService.performanceUIndexList.value.length > 0) {
      var cumReturns = this.cusIndexService.performanceETFRList.value[0].cumReturns;
      var cumReturns1 = this.cusIndexService.performanceUIndexList.value[0].cumReturns;
      if (isNullOrUndefined(cumReturns1) || isNaN(cumReturns1)) { cumReturns1 = 0; }
      var cum_removed = ((parseFloat(cumReturns1) * 100) - (parseFloat(cumReturns) * 100)).toFixed(2);
      this.excessCumReturns = cum_removed;
    }

    if (this.cusIndexService.performanceETFRList.value.length > 0 && this.cusIndexService.performanceUIndexList.value.length > 0) {
      var annReturns = this.cusIndexService.performanceETFRList.value[0].annReturns.toFixed(2);
      var annReturns1 = this.cusIndexService.performanceUIndexList.value[0].annReturns.toFixed(2);
      if (isNullOrUndefined(annReturns1) || isNaN(annReturns1)) { annReturns1 = 0; }
      var ana_removed = (annReturns1 - annReturns).toFixed(2);
      this.excessAnnReturns = ana_removed;
    }
  }


  ngOnInit() {
    var that = this;
    this.sharedData.showCenterLoader.next(false);
    var custSelectFactor = this.cusIndexService.custSelectFactor.subscribe((res: any) => {
      if (isNotNullOrUndefined(res['id'])) {
        this.selectedFactorName = res['displayname'];
        d3.select('#excluFactorCircle').select('#factorsHeader').text(that.selectedFactorName)
          .call(that.sharedData.Crlwrapping, that.selectedFactorName, 100);
        this.factorid = res['id'];
        this.factdata = this.cusIndexService.checkFactorDt(res['id']);
      }
    });
    this.subscriptions.add(custSelectFactor);
    var custSelectFactorData = this.cusIndexService.custSelectFactorData.subscribe((res: any) => {
      this.factorCompData = [...res];
      this.cusIndexService.getExclCompData().then((resDat: any) => {
        this.exclCompData = [...resDat];
        if (this.factorid > 0) {
          this.loadFactor(res);
          this.loadFactorInit();
        }
      });
    });
    this.subscriptions.add(custSelectFactorData);

    var factorChangeDetection = this.cusIndexService.factorChangeDetection.subscribe((res: any) => {
      if (isNotNullOrUndefined(res['flag']) && isNotNullOrUndefined(res['type']) &&
        res['flag'] && res['type'] == "P" && this.factorid > 0) {
        //that.showApplyBtn = false;
        this.cusIndexService.factorChangeDetection.next({ type: "", flag: false });
        if (isNotNullOrUndefined(res['perorval'])) { this.loadFactorInit(res['perorval']); }
        else { this.loadFactorInit(); }        
      }
    });
    this.subscriptions.add(factorChangeDetection);

    var checkStgyAlreadyTraded = that.cusIndexService.checkStgyAlreadyTraded.subscribe((res: any) => { this.checkStgyAlreadyTraded = res });
    that.subscriptions.add(checkStgyAlreadyTraded);

    var selCompany = this.cusIndexService.selCompany.subscribe((res:any) => {
      if (isNotNullOrUndefined(res)) {
        var x = that.factorCompData.filter((x: any) => x.isin == res.isin);
        if (x.length > 0) { this.creatClockSlider(x[0]); } else { that.cusIndexService.selCompany.next(undefined); };        
      } else { d3.select("#excluFactorCircle").selectAll("#cSlider").remove(); };
      try {
        this.impRevValue = d3.format(".1f")(res['impRev'] * 100);
        this.STW_Pricecurrency = res['currency'] + ' ' + d3.format(",.1f")(res['price']);
      } catch (e) { }
    }, error => { });
    that.cusIndexService.selCompany.next(undefined);
    this.subscriptions.add(selCompany);
    var performanceData = this.cusIndexService.performanceUIndexList.subscribe(res => {
      //console.log('performanceUIndexList FACTOR', res);
      if (isNotNullOrUndefined(res)) {
        this.performanceUIndexList = res;
        if (this.showSlider2) { this.checkreturnAsOfDate(res); that.getAnalysisSlider(); }
        this.getAnalysis();
      } else {
        this.performanceUIndexList = [];
      }

    }, error => { });
    this.subscriptions.add(performanceData);
    var unSub11 = this.sharedData.showSpinner.subscribe(x => {
      if (x) { d3.selectAll('#sliderHandleLoader').style('display', 'block') }
      else { d3.selectAll('#sliderHandleLoader').style('display', 'none') }
    });
    this.subscriptions.add(unSub11);
  }
  Slide_count: number = 0;
  getAnalysisSlider() {
    var that = this;
    that.Slide_count = 0;
    that.createCircleSliderDot();
    that.exclControlRight();
    //if (this.cusIndexService.performanceUIndexList.value.length > 0) { that.sharedData.showSpinner.next(false); }

  }
  returnAsOfDate: string = '';
  checkreturnAsOfDate(d: any) {
    var data: any = d;
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['sinceDate']) && isNotNullOrUndefined(data[0]['date'])) {
      this.returnAsOfDate = data[0]['sinceDate'] + ' to ' + data[0]['date'];
    } else { this.returnAsOfDate = '' }
  }
  factorReset() {

    this.cusIndexService.factorChangeDetection.next({ type: "C", flag: true, reset: true });
  };

  creatClockSlider(selComp:any) {
    let that = this;
    d3.select("#excluFactorCircle").selectAll("#cSlider").remove();
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      var r: any = that.radius;
      d3.select("#excluFactorCircle").selectAll("#cSlider").remove();

      var g = d3.select("#excluFactorCircle").select("#crlChart").append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')')
        .on("pointerenter", function () { if (d3.selectAll("#gCompMOver").style("display") != 'none') { d3.selectAll("#gCompMOver").style("display", 'none') } });

      var rect1 = g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 3).attr("width", 50).attr("fill", "#7e7e85");

      var rect = g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (25)).attr("height", "42").attr("width", "125").style("display", "none");

      var text = g.append("text").attr("class", "sText").attr("x", + r + (40)).attr("y", -3).style("font-family", 'var(--ff-medium)').style("font-size", "9px")
        .style("display", "none").text("0.00");

      g.append("text").attr("class", "sText1").attr("x", + r + (40)).attr("y", 9).style("display", "none")
        .style("font-size", "8px").attr("fill", "var(--theme-def-bg)").style("font-family", 'var(--ff-medium)').text("0.00");

      var cancelX = parseInt(r) + parseInt('170');
      var cancelBtn = g.append("g").attr('id', 'cSliderCancel').style('display', 'none').attr('transform', 'translate(' + (cancelX) + ',0)');
      cancelBtn.append("g").attr('transform', 'scale(0.03)').append("path").attr('fill', 'var(--prim-button-color-text)').attr("class", "bg")
        .attr('d', 'M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085 c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z');
      cancelBtn.select('g').append("path").attr('fill', 'var(--primary-color)').attr("class", "bg_stroke")
        .attr('d', 'M277.042,248.082l72.528-84.196c7.91-9.182,6.876-23.041-2.31-30.951  c-9.172-7.904-23.032-6.876-30.947,2.306l-68.236,79.212l-68.229-79.212c-7.91-9.188-21.771-10.216-30.954-2.306  c-9.186,7.91-10.214,21.77-2.304,30.951l72.522,84.196l-72.522,84.192c-7.91,9.182-6.882,23.041,2.304,30.951  c4.143,3.569,9.241,5.318,14.316,5.318c6.161,0,12.294-2.586,16.638-7.624l68.229-79.212l68.236,79.212  c4.338,5.041,10.47,7.624,16.637,7.624c5.069,0,10.168-1.749,14.311-5.318c9.186-7.91,10.22-21.77,2.31-30.951L277.042,248.082z');

      this.SetClockHandle(selComp);
    }
  }

  SetClockHandle(d: any) {
    let that = this;
    var txt: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    let txt1 = "(" + d.ticker + ") " + that.cusIndexService.factPval(that.factorid, d.factorValue);
    if ((txt.length) > 18) { txt = txt.slice(0, 18).trim() + "..."; }    
    let val:any = d.cx;
    var sliTag = d3.select("#excluFactorCircle").select("#cSlider");
    var r = that.radius;
    sliTag.attr('transform', 'rotate(' + val + ')');
    sliTag.select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.cusIndexService.measureText(txt, 9);
        return d.cx > 90 ? ((r + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        else { return that.MedTxtColor; }
      })

    sliTag.select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.cusIndexService.measureText(txt1, 9);
        return d.cx > 90 ? ((r + txtlen1 + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        else { return that.MedTxtColor; }
      });

    var gbox: any = sliTag.select(".sText"); var bbox: any = gbox.node().getBBox();
    var bboxH = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    sliTag.select(".sRect")
      .attr("fill", "#1a202c")
      .attr("stroke", "#7e7e85")
      .attr("stroke-width", "1px")
      .style("display", function () { return txt == null ? "none" : "block"; })
      .attr("height", bboxH)
      .attr("width", cSliderWidth)
      .attr("y", -(bboxH / 2));
    var calW = parseInt(r + bbox.width);
    var cancelX = cSliderWidth;
    if (val > 250 || val < -70) { cancelX = 2; }
    if (val > 60 && val < 115) { cancelX = 2; }
    sliTag.select("#cSliderCancel").attr('transform', 'translate(' + (171 + (cancelX)) + ',' + (-((bboxH / 4) - 3)) + ')');
    sliTag.select("#cSliderCancel").on('click', function () { that.cusIndexService.selCompany.next(undefined); });
    sliTag.on('pointerenter', function () { sliTag.select("#cSliderCancel").style('display', 'block'); })
      .on('mousemove', function () { sliTag.select("#cSliderCancel").style('display', 'block'); })
      .on('pointerleave', function () { sliTag.select("#cSliderCancel").style('display', 'none'); })

    sliTag.select(".sTextReverse").attr("fill", "#fff").style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function (): any {
        if (bboxH == 40) { return -(bboxH + 0); }
        else if (bboxH < 50) { return -(bboxH - 3); }
        else if (bboxH > 50) { return -(bboxH - 15); }
      }).attr("y", -(calW + 17));
    sliTag.style('display', 'block').raise();
    var midtxt = txt + " (" + d.ticker + ") ";
    if (txt.length > 20) { midtxt = txt.slice(0, 20) + "... (" + d.ticker + ") "; }

    d3.select("#excluFactorCircle").select('.Sel_midCompS1').select('.SelCompName').attr('text-anchor', 'middle').attr('fill', 'var(--prim-button-color)')
      .style('font-size', function () { if ((midtxt.length) > 30) { return "12px" } else { return "12px"; } })
      .attr('y', function () { if ((midtxt.length) > 20) { return "25" } else { return "30" } })
      .style('font-family', 'poppins-bold').text(midtxt).call(that.sharedData.Crlwrapping, 195, "top");

    var medVel: any = d3.format(".1f")(d.score);
    d3.select("#excluFactorCircle").select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", function () { return that.cl(medVel + 1); })
      .style('font-size', ((that.sharedData._uname.indexOf('technogradient.com') > -1) || (that.sharedData._uname.indexOf('newagealpha.com') > -1)) ? '28px' : '28px')
      .style('font-family', "poppins-bold").text(medVel);

    d3.selectAll('#cSlider').raise()
    let ticker: string = (isNotNullOrUndefined(d.ticker)) ? "(" + d.ticker + ") " : '';
    var txt_m: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    var midtxt = txt_m + ' ' + ticker;
    if (txt_m.length > 20) { midtxt = txt_m.slice(0, 20) + '... ' + ticker; };
    that.selCompText = midtxt;
    that.HFscore = d3.format(".1f")(d.scores * 100) + '%';
  }

  loadFactorInit(tempPerorval: number=1) {
    var dd = [...this.cusIndexService.PostStrategyFactorsData.value].filter(x => x.factorid == this.factorid);
    if (dd.length > 0) {
      var tab: string = dd[0]['perorval'] == 0 ? 'percent' : 'val' ;
      this.switchTabName_P = tab;
      this.tabClicl('init');
    } else {
      var tab: string = tempPerorval == 0 ? 'percent' : 'val';
      this.switchTabName_P = tab;
      this.tabClicl("");
    }
  }

  tabClicl(type = "",) {
    this.cusIndexService.getExclFactorCompData().then(d => {
      var clist = this.cusIndexService.currentSList.value;      
      try {
        var data: any = d;
        if (data != null && data.length > 0) {
          var compDat: any = this.factorCompData.map((x: any) => x.factorValue).filter((d:any) => isNotNullOrUndefined(d));
          var minCompDat: any = d3.min(compDat);
          var maxCompDat: any = d3.max(compDat);
          this.orgTopValue = parseFloat(minCompDat);
          this.orgBottomValue = parseFloat(maxCompDat);
          var dd = [...this.cusIndexService.PostStrategyFactorsData.value].filter(x => x.factorid == this.factorid && x.slid == clist.id);
          if (dd.length > 0 && type == 'init') {
            if (this.switchTabName_P == 'val') {
              var startval: any = this.cusIndexService.CheckFactorTopValue(dd[0], this.orgTopValue, 'orgTopValue', 'startval');
              var endval: any = this.cusIndexService.CheckFactorTopValue(dd[0], this.orgBottomValue, 'orgBottomValue', 'endval');
              var dmin = d3.min([startval, endval]);
              var dmax = d3.max([startval, endval]);
              this.SSRValueStart = dmin;
              this.SSRValueEnd = dmax;
            } else {
              this.SSRValueStart = dd[0].startval;
              this.SSRValueEnd = dd[0].endval;
            }
          } else {
            if (this.switchTabName_P == 'val') {
              this.SSRValueStart = -1;
              this.SSRValueEnd = -1;
            } else {
              this.SSRValueStart = 0;
              this.SSRValueEnd = 100;
            }
          }
          //console.log(this.switchTabName_P)
          if (this.switchTabName_P == 'val') { this.circleRangeByVal({ "start": this.SSRValueStart, "end": this.SSRValueEnd }); }
          else { this.circleRangeByPer({ "start": this.SSRValueStart, "end": this.SSRValueEnd }); };          
        }
        d3.selectAll("#excluFactorCircle").select('#handles').style('display', 'block');
      } catch (e) { }
    });
  }
  exclControlLeft() {
    var that = this;
    var controlLeft = d3.select('#excluFactorCircle').select('#left');
    var controlLeftDisable = d3.select('#excluFactorCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#excluFactorCircle').select('#right');
    var controlRightDisable = d3.select('#excluFactorCircle').select('#right .disableRightCircle');

    that.Slide_count--
    var slideV = 320 * that.Slide_count;
    if (that.Slide_count == 0) {
      controlLeft.classed("disable", true);
      controlLeftDisable.style("display", 'block');
      controlRight.classed("disable", false);
      controlRightDisable.style("display", 'none');
    } else {
      controlLeft.classed("disable", false);
      controlLeftDisable.style("display", 'none');
      controlRight.classed("disable", true);
      controlRightDisable.style("display", 'block');
    }
    var t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
    d3.select('#excluFactorCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot();

  }

  exclControlRight() {
    var that = this;
    var controlLeft = d3.select('#excluFactorCircle').select('#left');
    var controlLeftDisable = d3.select('#excluFactorCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#excluFactorCircle').select('#right');
    var controlRightDisable = d3.select('#excluFactorCircle').select('#right .disableRightCircle');

    that.Slide_count++
    var slideV = 320 * that.Slide_count;
    if (that.Slide_count == 0) {
      controlLeft.classed("disable", true);
      controlLeftDisable.style("display", 'block');
      controlRight.classed("disable", false);
      controlRightDisable.style("display", 'none');
    } else {
      controlLeft.classed("disable", false);
      controlLeftDisable.style("display", 'none');
      controlRight.classed("disable", true);
      controlRightDisable.style("display", 'block');
    }

    var t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
    d3.select('#excluFactorCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot();
  }

  createCircleSliderDot() {
    var that = this;
    d3.select('#Circle_SliderDots').select('g').remove();
    var main = d3.select('#Circle_SliderDots');
    var dotCount = 2;
    var dotRadius = 3;

    if ($('#resetAL').css('display') == 'block') {
      var g = main.append('g').attr('transform', 'translate(153,306)').attr('id', 'dots');

      for (var i = 0; i < dotCount; i++) {
        var dot = g.append('g').attr('transform', 'translate(' + (i * 12) + ',0)');
        dot.append('circle').attr('r', dotRadius).attr('fill', '#bfbfbf').attr('stroke', '#bfbfbf').style('cursor', 'pointer').attr('id', 'dot' + i)
          .on('click', function () {
            var clickid = parseInt(d3.select(this).attr('id').replace('dot', ''));
            if (that.Slide_count < clickid) {
              that.Slide_count = clickid - 1;
              that.exclControlRight();
            }
            else if (that.Slide_count > clickid) {
              that.Slide_count = clickid + 1;
              that.exclControlLeft();
            }
          });
        if (that.Slide_count == i) { dot.select('circle').attr('fill', '#fff') }
      }
    }
  }
  circleRangeByPer(values:any) {
    var that = this;
    d3.selectAll("#excluFactorCircle").selectAll("#slider").remove();
    d3.selectAll("#excluFactorCircle").select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-160,-160)");
    var width = 320;
    var height = 320;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var rangeTotal = 101;
    var tickColor1 = "var(--leftSideText-B)";
    var radius = (Math.min(width, height) - margin.top - margin.bottom) / 2;
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
    var dragInit: boolean = false;
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
      var con: boolean = false;
      try {
        con = that.cusIndexService.checkBelow100Comp(
          that.cusIndexService.exclusionCompData.value,
          that.cusIndexService.remCompData.value,
          that.cusIndexService.remGicsData.value,
          that.cusIndexService.getStrFacData(that.factorid, (parseInt(sliderObject.e.toFixed(0))), (parseInt(sliderObject.a.toFixed(0))), that.switchTabName_P, that.orgTopValue, that.orgBottomValue)
        );
      } catch (e) { }
        if (con) {
          that.SSRValueStart = parseInt(sliderObject.e.toFixed(0));
          that.SSRValueEnd = parseInt(sliderObject.a.toFixed(0));
          if (that.dragStarted && ((sliderObject.a == 0 || sliderObject.a == 100) && sliderObject.e == 0)) {
            that.showSlider2 = false;
            that.Slide_count = -1;
            that.exclControlRight();
            d3.select('#excluFactorCircle').select('.sliderDispTicks').style('display', 'none');
            d3.selectAll('.animateCircle').style('display', 'block');
            that.saveFactorsStrateg(true);
          } else if (that.dragStarted) { that.saveFactorsStrateg(); }
          that.showSlider2 = true;
          that.showanaLoading = true;
          that.SliderOnChange();
        } else {
          that.tabClicl('init');
          that.sharedData.showAlertMsg2("", that.cusIndexService.minCustInd.message);
        }
    }
    var tau = 2 * Math.PI;

    var svg = d3.selectAll("#excluFactorCircle").select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
    holder = svg.append('g').attr('id', 'arcindicator').attr("class", "sliderDisp").style("display", "block");
    helper.calculateInitialData(Intdata);
    a = helper.getValueOfDataSet("a");
    e = helper.getValueOfDataSet("e");
    startAngle = helper.getAngleOfDataSet("a");
    endAngle = helper.getAngleOfDataSet("e");

    writeTimeInfo({ a: a, e: e, aAngle: startAngle, eAngle: endAngle });

    //drawTickers();
    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); })
    var tempVal;
    indicatorArc = holder.append("g").attr("class", "arcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill", function () { return accentColor; }).attr("d", arc)


    handles = svg.append('g').attr('id', 'handles')
      .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "sliderDisp").style("display", "none");
    dragBehavior = d3.drag().subject(function (d) { return d; }).on("drag", function (ev: any, d: any) {
      dragInit = true;
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
          }
        }
        that.dragStarted = true;
        d3.select("#excluFactorCircle").select('.applychanges').style('display', 'block');
      }
    }).on("end", function () {
      dragInit = false;
      if (!that.checkStgyAlreadyTraded) {
        d3.select(this).classed('active', false);
        d3.selectAll("#excluFactorCircle").select("#crlChart").select('.sliderToolTip').remove();
        checkHandlesPosition();
        //that.showApplyBtn = true;
      }
    });

    drawHandles();
    d3.selectAll("#excluFactorCircle").selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });
    
    d3.selectAll("#excluFactorCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius) * -1 + ')');
    
    d3.selectAll("#excluFactorCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + (startAngle) + ') translate(0,' + (radius) * -1 + ')');
   
    d3.selectAll("#excluFactorCircle").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (that.SSRValueStart) + " " + '100').style('display', 'block');
    d3.selectAll("#excluFactorCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (100 - that.SSRValueEnd) + " " + '100').style('display', 'block');
   
    d3.selectAll("#excluFactorCircle").select('#handles').style('display', 'block');

    updateHandles(helper.getsetValue('e'));
    updateHandles(helper.getsetValue('a'));

    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter()
        .append('g')
        .attr('class', 'handlercontainer')
        .attr('transform', function (d: any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius) * -1 + ')'; })
        .on("pointerenter", function (ev: any) {d3.select(ev).classed('active', true);})
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
        .on('pointerenter', function (ev:any) { d3.select(ev).classed('active', true); })
        .on('pointerleave', function (ev: any) { d3.select(ev).classed('active', false); });
        const atext= circles.append("svg")
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
        .on('click', function (d) {});

      var roTicker = d3.selectAll("#excluFactorCircle").select("#slider").select("#holder").select("#ticks");
     
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
      var handlerContainer = d3.selectAll("#excluFactorCircle").selectAll('#handles .handlercontainer'); //select all handles
      var startValue = 0;
      var endValue = 0;
      handlerContainer.each(function (d: any) {
        if (d.label == "a") { startValue = d.angle; }
        if (d.label == "e") { endValue = d.angle; }
      });
      //replace arc
      arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(function (d) { return startValue * (Math.PI / 180); })
        .endAngle(function (d) { return endValue * (Math.PI / 180); });
      indicatorArc.attr("d", arc);
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
        d3.selectAll("#excluFactorCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius-2) * -1 + ')');
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

        d3.selectAll("#excluFactorCircle").select('#gradArc').select('.circle_overlay_alt')
          .attr('stroke-dasharray', (dragalternate) + " " + '100').style('display', 'block');
        if (dd.value > 0 && dd.value < 100) {
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1").style('display', 'block').attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text(dd.value.toFixed(0) + '%');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #atooltip").style('display', 'block');
        } else {
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1").style('display', 'none').text('');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #atooltip").style('display', 'none');
        }
        if (dragInit) { that.onDragRem(dd, false); }
      }

      if (dd.label == 'e') {
        a2Value = dd.value;
        d3.select('.c_remaining_slide1_range_min').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#excluFactorCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius-2) * -1 + ')');
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
        d3.selectAll("#excluFactorCircle").select('#gradArc').select('.circle_overlay')
          .attr('stroke-dasharray', (a2Value) + " " + '100').style('display', 'block');
        if (dd.value > 0) {
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'block').text(dd.value.toFixed(0) + '%');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtextinner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #etooltip").style('display', 'block');

        } else {
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'none').text('');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtextinner")
            .style('display', 'none');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #etooltip").style('display', 'none');
        }
        if (dragInit) { that.onDragRem(dd, true); }
      }

    }
    function checkHandlesPosition() {
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d: any, i: any) { currentData[d.label] = d.value; currentData[d.label + "Angle"] = d.angle; });
      var ddmin: any = d3.min([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      var ddmax: any = d3.max([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      var tempfacter = that.cusIndexService.PostStrategyFactorsData.value.map((a: any) => ({ ...a }));
      var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == that.factorid);
      var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == that.factorid);
      var checkPro: boolean = true;
      if (filterFactor.length > 0 && index > -1) {
        if (tempfacter[index].startval == ddmin && tempfacter[index].endval == (100 - ddmax)) { checkPro = false; }
      } else if (ddmin == sliderEndValue && ((100 - ddmax) == sliderInitValue || ddmax == 0)) { checkPro = false; }
      if (index == -1 && currentData.a == 100 && currentData.e == 0) {
        checkPro = false;
        d3.select("#excluFactorCircle").select('.applychanges').style('display', 'none');
      }
      if (checkPro) { writeTimeInfo(currentData); }
    }
  }

  circleRangeByVal(values: any) {
    var that = this;
    var dmin = d3.min([values.start, values.end]);
    var dmax = d3.max([values.start, values.end]);
    var dragPath = this.checkdragPath(this.factorCompData);
    var inSta = dragPath.filter((x:any) => parseFloat(x.value.toFixed(4)) >= parseFloat(dmax.toFixed(4)));
    var inEnd = dragPath.filter((x: any) => parseFloat(x.value.toFixed(4)) <= parseFloat(dmin.toFixed(4)));
    if (dmin == -1 || dmax == -1) { inSta = []; inEnd = []; }
    if (inSta.length == 0 && inEnd.length == 0) { values = { "end": dragPath[dragPath.length - 1].value, "start": dragPath[0].value }; }
    else if (inSta.length > 0 && inEnd.length == 0) { values = { "start": inSta[inSta.length - 1].value, "end": dragPath[dragPath.length - 1].value }; }
    else if (inSta.length == 0 && inEnd.length > 0) { values = { "start": dragPath[0].value, "end": inEnd[0].value }; }
    else { values = { "start": inSta[inSta.length - 1].value, "end": inEnd[0].value }; }
    that.SSRValueStart = values.start;
    that.SSRValueEnd = values.end;
    d3.selectAll("#excluFactorCircle").selectAll("#slider").remove();
    d3.selectAll("#excluFactorCircle").select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-160,-160)");
    var width = 320;
    var height = 320;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var rangeTotal = dragPath.length;
    var tickColor1 = "#dadadc";
    var radius = (Math.min(width, height) - margin.top - margin.bottom) / 2;
    var outerRadius = (radius + 1) + indicatorWidth / 2;
    var innerRadius = outerRadius - indicatorWidth;
    var dragLiveData: any;
    var holder: any, indicatorArc: any, handles: any, dragBehavior: any;
    var a: any, e: any, startAngle: any, endAngle: any;
    var Intdata = values;
    var sliderInitValue: any = dragPath[0].value;
    var sliderEndValue: any = dragPath[dragPath.length - 1].value;
    var path = dragPath[0];
    var path1 = dragPath[dragPath.length - 1];
    var a1Value = sliderEndValue;
    var a2Value = sliderInitValue;
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
        var angleToSegments = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
        var startTimeInfo, endTimeInfo, duration;
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
    var dragInit: boolean = false;
    var angularScale = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
    var angularvalue = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
    var tickdata = function () {
      var checkR: boolean = true;
      return d3.range(0, dragPath.length).map(function (v, i) {
        var arcScale = d3.scaleLinear().range([0, 100]).domain([0, dragPath.length]);
        var eArc: any = arcScale(v);
        if (parseInt(eArc) % 5 == 0) {
          if (checkR) {
            checkR = false;
            return { angle: dragPath[v]['cAngle'], label: dragPath[v]['value'].toFixed(2) };
          } else {
            checkR = false;
            return { angle: dragPath[v]['cAngle'], label: null };
          }
        } else {
          checkR = true;
          return { angle: dragPath[v]['cAngle'], label: null };
        }
      });
    }

    function writeTimeInfo(sliderObject: any, handleDrag: boolean = false) {
      var ddmin = d3.min([sliderObject.e, sliderObject.a]);
      var ddmax = d3.max([sliderObject.e, sliderObject.a]);
      that.SSRValueStart = ddmax;
      that.SSRValueEnd = ddmin;
      var con: boolean = false;
      try {
        con = that.cusIndexService.checkBelow100Comp(
          that.cusIndexService.exclusionCompData.value,
          that.cusIndexService.remCompData.value,
          that.cusIndexService.remGicsData.value,
          that.cusIndexService.getStrFacData(that.factorid, that.SSRValueStart, that.SSRValueEnd, that.switchTabName_P, that.orgTopValue, that.orgBottomValue)
        );
      } catch (e) { }
      if (con) {
        if (that.dragStarted && ((sliderObject.a == sliderInitValue && sliderObject.e == sliderEndValue) || (sliderObject.a == sliderEndValue && sliderObject.e == sliderInitValue))) {
          that.showSlider2 = false;
          that.Slide_count = -1;
          that.exclControlRight();
          d3.select('#excluFactorCircle').select('.sliderDispTicks').style('display', 'none');
          d3.selectAll('.animateCircle').style('display', 'block');
          that.saveFactorsStrateg(true);
        } else if (that.dragStarted) { that.saveFactorsStrateg(); }
        that.showSlider2 = true;
        that.showanaLoading = true;
        that.SliderOnChangeByVal();
        that.Slide_count = 0;
        that.exclControlRight();
      } else {
        that.tabClicl('init');
        that.sharedData.showAlertMsg2("", that.cusIndexService.minCustInd.message);
      }
      if (((sliderObject.a == sliderInitValue && sliderObject.e == sliderEndValue) || (sliderObject.a == sliderEndValue && sliderObject.e == sliderInitValue))) {
        //that.animateLoadOnce = true;
        //d3.selectAll("#excluFactorCircle").selectAll("#pullRemove").style("display", "block");
        //d3.select("#excluFactorCircle").select('#resetAL').style('display', 'none');
        //d3.select("#showSwitch_popup").style('display', 'none');
        that.showSlider2 = false;
        that.Slide_count = -1;
        that.exclControlRight();
      }
    }
    var tau = 2 * Math.PI;

    var svg = d3.selectAll("#excluFactorCircle").select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
    holder = svg.append('g').attr('id', 'arcindicator').attr("class", "sliderDisp").style("display", "block");
    if (dmin == -1 || dmax == -1) { helper.calculateInitialData(Intdata); }
    else if (inSta.length == 0 && inEnd.length == 0) {
      helper.graphdata = [
        { value: that.SSRValueStart, label: 'a', angle: dragPath[0].cAngle },
        { value: that.SSRValueEnd, label: 'e', angle: dragPath[dragPath.length - 1].cAngle },
      ];
    }
    else if (inSta.length == 0 && inEnd.length > 0) {
      helper.graphdata = [
        { value: that.SSRValueStart, label: 'a', angle: dragPath[0].cAngle },
        { value: that.SSRValueEnd, label: 'e', angle: inEnd[0].cAngle },
      ];
    }
    else if (inSta.length > 0 && inEnd.length == 0) {
      helper.graphdata = [
        { value: that.SSRValueStart, label: 'a', angle: inSta[inSta.length - 1].cAngle },
        { value: that.SSRValueEnd, label: 'e', angle: dragPath[dragPath.length - 1].cAngle },
      ];
    }
    else {
      helper.graphdata = [
        { value: that.SSRValueStart, label: 'a', angle: inSta[inSta.length - 1].cAngle },
        { value: that.SSRValueEnd, label: 'e', angle: inEnd[0].cAngle },
      ];
    }
    a = helper.getValueOfDataSet("a");
    e = helper.getValueOfDataSet("e");
    startAngle = helper.getAngleOfDataSet("a");
    endAngle = helper.getAngleOfDataSet("e");

    writeTimeInfo({ a: a, e: e, aAngle: startAngle, eAngle: endAngle });
    //try { drawTickers(); } catch (e) { }   
    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); });

    indicatorArc = holder.append("g").attr("class", "arcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill", function () { return accentColor; }).attr("d", arc)


    handles = svg.append('g').attr('id', 'handles')
      .attr('transform', 'translate(' + radius + ',' + (radius+2) + ')').attr("class", "sliderDisp").style("display", "none");
    dragBehavior = d3.drag().subject(function (d) { return d; })
      .on("drag", function (ev: any, d: any) {
        dragInit = true;
        if (!that.checkStgyAlreadyTraded) {
          if (d.label == 'e') {
            var coordinaters = d3.pointers(ev, svg.node());
            var x = coordinaters[0][0] - radius;
            var y = coordinaters[0][1] - radius;
            var nA = (Math.atan2(y, x) * 180 / Math.PI) + 90;
            if (nA < 0) { nA = 360 + nA; }
            nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
            var nD1 = dragPath.filter((ud: any) => ud.cAngle <= nA);
            if (nD1.length > 0) {
              path = nD1[nD1.length - 1];
              d.value = nD1[nD1.length - 1].value;
              d.angle = nD1[nD1.length - 1].cAngle;
              a2Value = nD1[nD1.length - 1].value;
            }
            if (nD1.length == dragPath.length) {
              path = nD1[nD1.length - 1];
              d.value = nD1[nD1.length - 1].value;
              d.angle = 0;
              a2Value = nD1[nD1.length - 1].value;
            }
            if (a2Value < that.SSRValueStart || (nD1.length == dragPath.length)) { dragmoveHandles(ev, d); };
          }

          if (d.label == 'a') {
            var coordinaters = d3.pointers(ev, svg.node());
            var xx = coordinaters[0][0] - radius;
            var yy = coordinaters[0][1] - radius;
            var nA1 = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
            if (nA1 < 0) { nA1 = 360 + nA1; }
            nA1 = nA1 - ((nA1 * sliderEndValue) % 125) / rangeTotal;
            var nD = dragPath.filter((ud: any) => ud.cAngle >= nA1);
            if (nD.length > 0) {
              path1 = nD[0];
              d.value = nD[0].value;
              d.angle = nD[0].cAngle;
              a1Value = nD[0].value;
            }
            if (nD.length == 0) {
              path1 = dragPath[0];
              d.value = dragPath[0].value;
              d.angle = 360;
              a1Value = dragPath[0].value;
            }
            if ((that.SSRValueEnd < a1Value) || (nD.length == 0)) { dragmoveHandles(ev, d); };
          }
          that.dragStarted = true;
          d3.select("#excluFactorCircle").select('.applychanges').style('display', 'block');
        }
      }).on("end", function () {
        dragInit = false;
        if (!that.checkStgyAlreadyTraded) {
          d3.select(this).classed('active', false);
          d3.selectAll("#excluFactorCircle").select("#crlChart").select('.sliderToolTip').remove();
          checkHandlesPosition();
          //that.showApplyBtn = true;
        }
      });

    drawHandles();
    d3.selectAll("#excluFactorCircle").selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });
    d3.selectAll("#excluFactorCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius) * -1 + ')');
    d3.selectAll("#excluFactorCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + (startAngle) + ') translate(0,' + (radius) * -1 + ')');

    updateHandles(helper.getsetValue('e'));
    updateHandles(helper.getsetValue('a'));

    d3.selectAll("#excluFactorCircle").select('#handles').style('display', 'block');
    //d3.selectAll("#excluFactorCircle").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (0) + " " + '100').style('display', 'block');
    //d3.selectAll("#excluFactorCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (0) + " " + '100').style('display', 'block');

    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter().append('g').attr('class', 'handlercontainer')
        .attr('transform', function (d:any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius-2) * -1 + ')'; })
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
        const atext= circles.append("svg")
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
        .style('font-family', 'var(--ff-medium)').style('font-size', '8px').style('cursor', 'auto')
        .style('fill', 'var(--leftSideText-B)')
        .text(function (d: any) { if (d.value > 0) return that.cusIndexService.factPval(that.factorid, d.value) ; else return "" });
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
      ticks.append("line").attr('id', function (d, i) { return 'top' + i }).attr("y1", 0).attr('transform', 'translate(-15,0)')
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
        .style("fill", tickColor1).style("font-size", "8px").style("font-family", 'var(--ff-medium)').text(function (d): any { if (d.label != null) { return ""; } })
        .on('click', function (d) { });

      var roTicker = d3.selectAll("#excluFactorCircle").select("#slider").select("#holder").select("#ticks");
      var lastTicks = ".tick" + (dragPath.length - 1);
      roTicker.select(".tick0").select("text").text('')
      roTicker.select(lastTicks).select("text").text('')
      roTicker.select(".tick0").select("line").remove();
      roTicker.select(lastTicks).select("line").remove();
      svg.select("#resetHandle").remove();
            
    }
    function dragmoveHandles(ev: any, d: any) {
      if (d.label == 'e') {
        var coordinaters = d3.pointers(ev, svg.node());
        var x = coordinaters[0][0] - radius;
        var y = coordinaters[0][1] - radius;
        var nA: any = (Math.atan2(y, x) * 180 / Math.PI) + 90;
        if (nA < 0) { nA = 360 + nA; }
        nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
        var nD = dragPath.filter((ud: any) => ud.cAngle <= nA);
        if (nD.length > 0) {
          path = nD[nD.length - 1];
          d.value = nD[nD.length - 1].value;
          d.angle = nD[nD.length - 1].cAngle;
          that.SSRValueEnd = nD[nD.length - 1].value;
        } else if (nA1 == 360 || nA1 > 359) {
          path1 = dragPath[dragPath.length - 1];
          d.value = dragPath[dragPath.length - 1].value;
          d.angle = dragPath[dragPath.length - 1].cAngle;
          that.SSRValueEnd = dragPath[dragPath.length - 1].value;
        }
        if (nD.length == dragPath.length) {
          path1 = dragPath[dragPath.length - 1];
          d.value = dragPath[dragPath.length - 1].value;
          d.angle = 360;
          that.SSRValueEnd = dragPath[dragPath.length - 1].value;
        }
        updateHandles(d);
      } else {
        var coordinaters = d3.pointers(ev, svg.node());
        var xx = coordinaters[0][0] - radius;
        var yy = coordinaters[0][1] - radius;
        var nA1: any = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
        if (nA1 < 0) { nA1 = 360 + nA1; }
        nA1 = nA1 - ((nA1 * sliderEndValue) % 125) / rangeTotal;
        var nD = dragPath.filter((ud: any) => ud.cAngle >= nA1);
        if (nD.length > 0) {
          path1 = nD[0];
          d.value = nD[0].value;
          d.angle = nD[0].cAngle;
          that.SSRValueStart = nD[0].value;
        } else if (nA1 == 0 || nA1 < 1) {
          path1 = dragPath[0];
          d.value = dragPath[0].value;
          d.angle = dragPath[0].cAngle;
          that.SSRValueStart = dragPath[0].value;
        }
        if (nD.length == 0) {
          path1 = dragPath[0];
          d.value = dragPath[0].value;
          d.angle = 0;
          that.SSRValueStart = dragPath[0].value;
        }
        updateHandles(d);
      }
    }
    function updateArc() {
      var handlerContainer = d3.selectAll("#excluFactorCircle").selectAll('#handles .handlercontainer'); //select all handles
      var startValue = 0;
      var endValue = 0;
      handlerContainer.each(function (d: any) {
        if (d.label == "a") { startValue = d.angle; }
        if (d.label == "e") { endValue = d.angle; }
      });
      //replace arc
      arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(function (d) { return startValue * (Math.PI / 180); })
        .endAngle(function (d) { return endValue * (Math.PI / 180); });
      indicatorArc.attr("d", arc);
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d: any, i: any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      dragLiveData = currentData;
    }

    function updateHandles(dd: any) {
      var arcScale = d3.scaleLinear().range([100, 0]).domain([360, 0]);
      var sArc: number = 0;
      if (dd.label == 'a') { 
        a1Value = dd.value;
        var endvalue = dd.value.toFixed(2);
        d3.select('.c_remaining_slide1_range_max').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#excluFactorCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius) * -1 + ')');
        updateArc();
        if (dd.value < sliderInitValue) {
          d3.select('.rightGrid_drag').style('display', 'none');
        }
        if (dd.value == sliderInitValue && that.SSRValueEnd > sliderEndValue) { d3.select('.rightGrid_drag').style('display', 'block'); }
        else { d3.select('.rightGrid_drag').style('display', 'none'); }

        if (dd.angle == 360 || dd.angle == 0 || dd.value == sliderInitValue) {
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text("");
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #atooltip").style('display', 'none');
        } else {
          var rad_val = 16;
          if (endvalue.length > 6) {
            if (endvalue.length > 7) { rad_val = 19.5; } else { rad_val = 17; }
          } else { rad_val = 16; }
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #atooltip").attr('r', rad_val).style('display', 'block');
          d3.select('.leftGrid_drag').style('display', 'none');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text(that.cusIndexService.factPval(that.factorid, dd.value));
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          sArc = arcScale((dd.angle));
        }

        d3.selectAll("#excluFactorCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (sArc) + " " + '100').style('display', 'block');
        if (dragInit) { that.onDragRem(dd, false); }
      }

      //// Left drag
      var eArc: number = 0;
      if (dd.label == 'e') {
        a2Value = dd.value;
        var startvalue = dd.value.toFixed(2);
        d3.select('.c_remaining_slide1_range_min').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#excluFactorCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius-2) * -1 + ')');
        updateArc();
        d3.selectAll('.animateCircle').style('display', 'none');

        if (dd.value > sliderEndValue) {
          d3.select('.leftGrid_drag').style('display', 'none');

          if (that.SSRValueStart == sliderInitValue) {
            d3.select('.rightGrid_drag').style('display', 'block');
          } else {
            d3.select('.rightGrid_drag').style('display', 'none');
          }
        }
        if (dd.angle == 360 || dd.angle == 0 || dd.value == sliderEndValue) {
          d3.selectAll("#excluFactorCircle").select('#handles').select('.a2').attr('transform', 'rotate(360) translate(0,' + (radius) * -1 + ')');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text('');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtextinner").style('display', 'none');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #etooltip").style('display', 'none');
          d3.select('.leftGrid_drag').style('display', 'block');
        } else {
          var rad_val = 16;
          if (startvalue.length > 6) {
            if (startvalue.length > 7) { rad_val = 19.5; } else { rad_val = 17; }
          } else { rad_val = 16; }
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #etooltip").attr('r', rad_val).style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text(that.cusIndexService.factPval(that.factorid, dd.value));
          d3.selectAll("#excluFactorCircle").selectAll(".a2 #SHMtextinner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#excluFactorCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").style('display', 'block');
          eArc = 100-arcScale((dd.angle));
        }
        
        d3.selectAll("#excluFactorCircle").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (eArc) + " " + '100').style('display', 'block');
        if (dragInit) { that.onDragRem(dd, true); }
      }
    }

    function checkHandlesPosition() {
      var currentData = { "a": that.SSRValueEnd, "aAngle": 0, "e": that.SSRValueStart, "eAngle": 0 };
      var ddmin = d3.min([that.SSRValueStart, that.SSRValueEnd]);
      var ddmax = d3.max([that.SSRValueStart, that.SSRValueEnd]);
      var tempfacter = that.cusIndexService.PostStrategyFactorsData.value.map((a: any) => ({ ...a }));
      var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == that.factorid);
      var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == that.factorid);
      var checkPro: boolean = true;
      if (filterFactor.length > 0 && index > -1) {
        if (tempfacter[index].startval == ddmin && tempfacter[index].endval == ddmax) { checkPro = false; }
      } else if (ddmin == sliderEndValue && ddmax == sliderInitValue) {
        checkPro = false;
      }
      if (checkPro) {
        d3.select("#excluFactorCircle").select('.applychanges').style('display', 'block');
        writeTimeInfo(currentData, true);
      }
    }
  }

  SliderOnChange() {
    this.cusIndexService.getExclCompData().then(d => {
      this.exclCompData = d;
      this.filcomp(); 
    });
  }

  SliderOnChangeByVal() {
    this.cusIndexService.getExclCompData().then(d => {
      this.exclCompData = d;
      this.filcomp();
    });
  }


  filcomp() {
    var that = this;
    var gs = d3.select("#excluFactorCircle").select('#crlChart').select("#gCompetitive");
    gs.selectAll("g").selectAll("text").classed('AVHideTxt', true);
    gs.selectAll("g").each((d: any) => {
      var dt = that.exclCompData.filter((xu:any) => xu.stockKey == d.stockKey);
      if (dt.length > 0) {
        var sid = "#st_" + d.stockKey;
        gs.selectAll(sid).selectAll("text").classed('AVHideTxt', false);
      }
    })
    /*** Market cap lines Competitive companies ****/
    var comp = d3.select("#excluFactorCircle").select('#crlChart').select(".compList").selectAll('.comp');
    comp.classed('hiderect', true);
    comp.each((d: any) => {
      var dt = that.exclCompData.filter((xu: any) => xu.isin == d.isin);

      if (dt.length > 0) {
        var name = "#" + d.isin + "_compRect";

        d3.select("#excluFactorCircle").select('#crlChart').select(".compList").select(name).classed('hiderect', false);
      }
    })

    /*** Market cap lines Competitive companies ****/
    that.showanaLoading = false;
  }


  saveFactorsStrateg(reset: boolean = false) {
    var that = this;  
      that.dragStarted = false;
      var dmin = d3.min([this.SSRValueStart, this.SSRValueEnd]);
      var dmax = d3.max([this.SSRValueStart, this.SSRValueEnd]);
      if (this.switchTabName_P == 'percent') {
        dmin = this.SSRValueStart;
        dmax = this.SSRValueEnd;
        if (dmax == 0) { dmax = 100 }
      }
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let slist = [];
      slist = this.cusIndexService.strategyList.value;
      var no = this.cusIndexService.currentSNo.value;
      var clist = this.cusIndexService.strategyList.value.filter((x: any) => x.rowno == no);
      if (clist.length == 0) { } else {
        var clist = this.cusIndexService.currentSList.value;
        if (isNotNullOrUndefined(clist)) {
          if (slist.filter((x: any) => x.id == clist.id).length > 0) {
            var data: factorRangeObject = {
              "factorid": this.factorid,
              "slid": clist.id,
              "userid": parseInt(userid),
              "assetid": parseInt(clist.assetId),
              "startval": dmin,
              "endval": dmax,
              "perorval": ((this.switchTabName_P == 'val') ? 1 : 0),
              "status": 'A',
              "name": that.factdata['name'],
              "displayname": that.factdata['displayname'],
              "orgTopValue": this.orgTopValue,
              "orgBottomValue": this.orgBottomValue,
              "orgTopPct": 0.0,
              "orgBottomPct": 100.0,
            };
            var tempfacter = this.cusIndexService.PostStrategyFactorsData.value.map((a: any) => ({ ...a }));
            var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == this.factorid);
            var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == this.factorid);
            if (reset) {
              if (index > -1) { tempfacter.splice(index, 1); }
              this.cusIndexService.PostStrategyFactorsData.next(tempfacter);
            }
            else if (filterFactor.length > 0) {
              tempfacter[index]['orgTopPct'] = 0;
              tempfacter[index]['orgBottomPct'] = 100;
              tempfacter[index]['startval'] = dmin;
              tempfacter[index]['endval'] = dmax;
              tempfacter[index]['factorid'] = this.factorid;
              tempfacter[index]['slid'] = clist.id;
              tempfacter[index]['orgTopValue'] = this.orgTopValue;
              tempfacter[index]['orgBottomValue'] = this.orgBottomValue;
              tempfacter[index]['assetid'] = parseInt(clist.assetId);
              tempfacter[index]['userid'] = parseInt(userid);
              tempfacter[index]['perorval'] = ((this.switchTabName_P == 'val') ? 1 : 0);
              this.cusIndexService.PostStrategyFactorsData.next(tempfacter);
            } else {
              tempfacter.push(data);
              this.cusIndexService.PostStrategyFactorsData.next(tempfacter);
            }
          }
        }
      }
    this.cusIndexService.factorChangeDetection.next({ type: "C", flag: true });
    this.cusIndexService.applyTrigger.next(true);
    //this.showApplyBtn = false;
  }

  applyChange() {
    //this.showApplyBtn = false;
    this.cusIndexService.applyTrigger.next(true);
  }

  checkdragPath(data:any) {
    var path:any = [];
    data = data.sort(function (x: any, y: any) { return d3.descending(parseFloat(x.factorValue), parseFloat(y.factorValue)); });
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / data.length) - 90); return d; });
    [...data].forEach((x, i) => {
      if (i == 0) {
        path.push({ "value": parseFloat((x.factorValue).toFixed(4)), "cAngle": (x.cx + 90), "Aup": (x.cx + 90), "Adown": ([...data][i + 1].cx + 90), "up": 0, "down": parseFloat((([...data][i + 1].factorValue)).toFixed(4)) });
      } else if (i == ([...data].length - 1)) {
        path.push({ "value": parseFloat((x.factorValue).toFixed(4)), "cAngle": (x.cx + 90), "Aup": ([...data][i - 1].cx + 90), "Adown": (x.cx + 90), "up": parseFloat((([...data][i - 1].factorValue)).toFixed(4)), "down": 0 });
      } else {
        path.push({ "value": parseFloat((x.factorValue).toFixed(4)), "cAngle": (x.cx + 90), "Aup": ([...data][i - 1].cx + 90), "Adown": ([...data][i + 1].cx + 90), "up": parseFloat((([...data][i - 1].factorValue)).toFixed(4)), "down": parseFloat((([...data][i + 1].factorValue)).toFixed(4)) });
      }
    });
    return path;
  }

  loadFactor(data: any) {
    if (isNotNullOrUndefined(data) && data.length > 0) {
      data.sort(function (x: any, y: any) { return d3.descending(parseFloat(x.factorValue), parseFloat(y.factorValue)); });
      data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / data.length) - 90); return d; });
    }
    try {
      this.creatGradienArc('#excluFactorCircle');
      this.CreateComps('#excluFactorCircle', [...data], "lvl1");
      this.fillCompetives([...data]);
    } catch (e) { console.log(e) }
  }

  creatGradienArc(masterID:string) {
    let that = this;
    var gArc = null;
    var gArcLine = null;

      d3.select(masterID).select("#gradArc").remove();
      d3.select(masterID).select("#gradArcLine").remove();
      gArc = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArc");
      gArcLine = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArcLine");

    var arc:any = d3.arc().innerRadius(that.radius - 18).outerRadius(that.radius - 2);
    
    var colors:any = [];
    // 360 degrees
    d3.range(4).forEach(function (d, i) {
      var start = (i * 89) * (Math.PI / 180),
        end = ((i * 89.9) + 90) * (Math.PI / 180);
      colors.push({ startAngle: start, endAngle: end });
    });
    // add arcs
    gArc.selectAll('.arc').data(colors).enter().append('path').attr('class', 'arc')
      .attr('d', arc).attr('stroke', 'none').attr('fill', "#5b5b66");

    //// Dragged Gradient color
    gArc.append('path').attr('id', 'leftOverlay').attr('class', 'circle_overlay')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', 'var(--border)')
      .style('opacity', '0.85')
      .attr('stroke-width', '2').attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.8) translate(18px, -18px) rotateY(180deg)')
      .attr('stroke-dasharray', '100 100').style('display', 'none').attr('fill', 'none');

    gArc.append('path').attr('id', 'rightOverlay').attr('class', 'circle_overlay_alt')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', 'var(--border)')
      .style('opacity', '0.85')
      .attr('stroke-width', '2').attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.8) translate(-18px, -18px) rotateY(0deg)')
      .attr('stroke-dasharray', '100 100').style('display', 'none').attr('fill', 'none');

    gArc.append('path')
      .attr('class', 'circle_overlay1')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', 'var(--primary-color)')
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
      .style('opacity', '.75')
      .style('display', 'block')

    gArc.append('g').attr('transform', 'rotate(-90)').append('rect').attr('height', '1').attr('width', '20')
      .attr('x', '130').attr('fill', '#000');

  }

  CreateComps(masterID: string, dta: any, lvl: string) {
    let that = this;
    var compLst;
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst' + lvl).remove();
    compLst = oSvg.append("g").attr('class', 'compList show_comp_list compLst' + lvl).style("display", "block");
    d3.select("#gradArcLine").remove();

    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);
    var compg = compC.selectAll("g").data(dta).enter().append("g")
      .attr("class", function (d: any, i: any) {
        if (isNotNullOrUndefined(that.exclCompData) && that.exclCompData.filter((x:any) => x.isin == d.isin).length == 0) {
          return 'comp hiderect';
        } else { return 'comp'; };
      })
      .attr("transform", function (d: any, i: any) { return "rotate(" + (d.cx) + ")"; })
      //.attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .attr("id", function (d: any) { return d.isin + "_compRect" })
      .on("pointerenter", function (d) {
        d3.select(this).raise();
        d3.select(this).select(".crect").classed("onrect", true);       
      }).style("display", "block")
      .on("pointerleave", function (elemData) {
        d3.select("#gCompMOver").style("display", "none");
        d3.select("#gCompeOver").style("display", "none");
        d3.select(this).select(".crect").classed("onrect", false);       
      });

    let SelRes = [...that.sharedData._selResData];
    if (SelRes.length == 0) { SelRes = [...dta]; }
    var dmin = d3.min(SelRes.map(x => x.marketCap));
    var dmax = d3.max(SelRes.map(x => x.marketCap));
    var dmean:any = d3.mean(SelRes.map(x => x.marketCap));
    var dsum = d3.sum(SelRes.map(x => x.marketCap));

    let ResMarketCap = SelRes.map(x => x.marketCap);
    let LimitedCap = ResMarketCap.filter(x => x < dmean && x != null);
    let dlimitedSum = d3.sum(LimitedCap);

    var rmax = (dmax - dmin) > 100 ? 100 : (dmax - dmin);
    rmax = rmax < 50 ? 50 : rmax;

    compg.append("rect").attr("height", "1px")
      .attr("class", function (d) {
        if (dta.length > 600) { return ("crect rectOpa " + that.cusIndexService.HFCompanyTxt(d)); }
        else { return ("crect " + that.cusIndexService.HFCompanyTxt(d)); }
      }).attr("fill", "#4b4b4b").attr("x", that.radius + 3).attr("width", 0)
      .transition().duration(10)
      .attr("width", function (d: any) {
        let wtdwidth = 0;
        var wt = ((d.marketCap / dlimitedSum) * 10000);
        if (d.marketCap < dmean) { wtdwidth = wt; }
        else {
          wt = ((d.marketCap / dsum) * 10000);
          if (wt > 18) { wt = 18 + wt / 10; }
          wtdwidth = wt;
        }
        if (wtdwidth > 25) { wtdwidth = 25 + wtdwidth / 10; }
        if (wtdwidth > 40) { wtdwidth = 40; }
        return wtdwidth + 2;
      });
  }

  fillCompetives(dta: any) {
    let that = this;
    var gs = null;    
    let data = [];

    d3.select("#excluFactorCircle #crlChart").select("#gCompetitive").remove();
    d3.select("#excluFactorCircle #crlChart").select("#exclugCompetitiveRect").remove();
    gs = d3.select("#excluFactorCircle").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#excluFactorCircle").select('#crlChart').append("g").attr("id", "exclugCompetitiveRect");
    data = dta;

    gs.selectAll("g").remove();
    dta = dta.filter((t: any) => t.isin != "");
    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) {
      sdata = data.filter(function (d: any, i: any) {
        if (that.exclCompData.length < that.sharedData.ciMinCircleShowCount && that.exclCompData.filter((x: any) => x.isin == d.isin).length > 0) { return d; }
        else if (i == 0 || (i % sublen) == 0) { return d; }
      });
    }
    else { sdata = data; }

    var ggs = gs.selectAll("g")
      .data(sdata)
      .enter().append("g")
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      }).attr("id", function (d: any) { return "st_" + d.stockKey })
      .style("opacity", function (d: any) {
        let opa = 1;
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { opa = 1; }
        return opa;
      });

    ggs.append("text")
      .attr("x", function (d) { return that.cusIndexService.txtx1(d); })
      .attr("id", "gcStxt")
      .style("display", function () {
        return (data.length > fillMaxlen) ? "none" : "none"
      })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.cusIndexService.txtanch(d); })
      .attr("class", function (d: any) {
        let highlightclass = '';
        if (isNotNullOrUndefined(that.exclCompData)
          && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt avbold " + highlightclass); }
        else { return that.cusIndexService.HFCompanyTxt(d) + " avbold " + highlightclass; }
      }).text(function (d: any) { return that.cusIndexService.factPval(that.factorid, d.factorValue); });

    ggs.append("text")
      .attr("x", function (d) { return that.cusIndexService.txtx(d); })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.cusIndexService.txtanch(d); })
      .attr("class", function (d) { return that.cusIndexService.HFCompanyTxt(d);      })
      .text(function (d: any) {
        var cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = cname.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 13 - rsvcnt;
          var dottxt = "";
          if (txt.length > 13) { dottxt = (data.length > fillMaxlen) ? "" : "..."; }
          return cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = cname.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });

    ggs.on("pointerenter", function (event, d:any) {
      if (data.length > fillMaxlen) {
        d3.selectAll("#excluFactorCircle").select("#exclugCompetitiveRect").raise();
        d3.selectAll("#excluFactorCircle").select("#cSlider").raise();
      }
      else {
        if (that.exclCompData.filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      }
    }).on("pointerleave", function (event, d) { d3.select(this).classed("on", false); });

    ggs.on("click", function (event, d) { that.fillmouseClick(d); });
    if (data.length > fillMaxlen) { that.fillCompetivesRect(data); }
    else { d3.select("#exclugCompetitiveRect").selectAll("g").remove(); }

    if (dta.length < 100) { d3.select('#excluFactorCircle').selectAll('#gCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#excluFactorCircle').selectAll('#gCompetitive').selectAll('g').style('opacity', '0.4'); }
    d3.selectAll('#cSlider').raise();
  }

  fillCompetivesRect(data:any) {
    var that = this;
    var gs: any;

    d3.select("#exclugCompetitiveRect").selectAll("g").remove();
    d3.select("#exclugCompetitiveRect").raise();
    gs = d3.select("#exclugCompetitiveRect");

    var arc = d3.arc().innerRadius(220).outerRadius(285)
      .startAngle(function (d) { return 0 * (Math.PI / 180); })
      .endAngle(function (d) { return 360 * (Math.PI / 180); })

    var ggs = gs.append("g").append("path").attr("fill", 'transparent').attr("d", arc)

    ggs.on("pointerenter", function (ev:any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        if (that.exclCompData.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data,ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    }).on("mousemove", function (ev:any, d:any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        if (that.exclCompData.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data, ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    })
    gs.on("pointerleave", function () {      gs.selectAll(".gfillCompMouseover").remove();    })
  }

  gfillCompMouseover(gs: any, d: any, dta: any, ev: any) {
    var that = this;
    dta.sort(function (x: any, y: any) { return d3.descending(parseFloat(x.factorValue), parseFloat(y.factorValue)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d });
    gs.selectAll(".gfillCompMouseover").remove();
    var ggs = gs.append("g").attr("class", "gfillCompMouseover")
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'var(--ff-medium)')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.cusIndexService.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText)"; } else { return "var(--leftSideText)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.cusIndexService.txtanch(d))
      .attr("class", function () {
        if (isNotNullOrUndefined(that.exclCompData)
          && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt avbold"); }
        else { return that.cusIndexService.HFCompanyTxt(d) + " avbold"; }
      }).text(function () { return that.cusIndexService.factPval(that.factorid, d.factorValue); });

    ggs.append("text").attr("x", that.cusIndexService.txtx(d))
      .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "var(--leftSideText)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.cusIndexService.txtanch(d))
      .attr("class", function () {
        if (isNotNullOrUndefined(that.exclCompData)
          && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt"); }
        else { return that.cusIndexService.HFCompanyTxt(d) }
      })
      .text(function () {
        var cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = "" + cname.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 15 - rsvcnt;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = cname.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 15 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });
    ggs.on("click", function () { that.fillmouseClick(d); });   
  }

  fillmouseClick(d:any) {
    if (this.exclCompData.filter((x:any)=> x.stockKey == d.stockKey).length > 0) { this.cusIndexService.selCompany.next(d); }
  }

  onDragRem(d: any, right: boolean) {
    var that = this;
    const dAngle = isNotNullOrUndefined(d?.angle) ? d.angle : null;
    var Angle: any = (right) ? d3.select(".a1").attr('transform') : d3.select(".a2").attr('transform');
    Angle = Angle.replace("rotate(", "").split(")");
    var eAngle = (isNotNullOrUndefined(Angle) && Angle.length > 0) ? parseFloat(Angle[0]) : 0;
    if (right && eAngle == 360) { eAngle = 0; }
    d3.select('#gCompetitive').selectAll('.AVHideTxt').classed('AVHideTxt', false);
    const checkAndToggle = (elements: d3.Selection<any, any, any, any>, hideText: boolean) => {
      elements.nodes().forEach((el: any) => {
        const data: any = d3.select(el).data();
        const angle = data?.[0]?.cx;
        if (isNotNullOrUndefined(dAngle) && isNotNullOrUndefined(angle) && ((right && ((dAngle - 90) <= angle || (eAngle - 90) >= angle)) || (!right && ((dAngle - 90) >= angle || (eAngle - 90) <= angle)))) {
          if (hideText) {
            d3.select(el).selectAll('text').classed('AVHideTxt', true);
          } else {
            d3.select(el).classed('hiderect', true);
          }
        } else if (isNotNullOrUndefined(that.exclCompData) &&
          that.exclCompData.filter((x: any) => x.isin == data?.[0]?.isin).length == 0) {
          if (hideText) {
            d3.select(el).selectAll('text').classed('AVHideTxt', true);
          } else {
            d3.select(el).classed('hiderect', true);
          }
        }
      });
    };

    checkAndToggle(d3.select('#gCompetitive').selectAll('g'), true);

    const cTag = d3.select('.compList').selectAll('.comp');
    d3.selectAll('.hiderect').classed('hiderect', false);
    checkAndToggle(cTag, false);
  }

}
