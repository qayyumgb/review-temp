import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Subscription, first } from 'rxjs';
import { CustomIndexService, factorRangeObject } from '../../../../core/services/moduleService/custom-index.service';
import * as d3 from 'd3';
import { ascending } from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { ImpliedRevenueComponent } from '../../../universeDialogsModule/implied-revenue/implied-revenue.component';
declare var $: any;

@Component({
  selector: 'app-alpha',
  templateUrl: './alpha.component.html',
  styleUrl: './alpha.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AlphaComponent implements OnInit, OnDestroy {
  switchTabName_P: string = "percent";
  switchTabName: string = "annual";
  checkStgyAlreadyTraded: boolean = false;
  showHideEntBtn: boolean = false;
  showborderMin: boolean = false;
  showborderMax: boolean = false;
  showSlider2: boolean = false;
  c_remaining_slide1_range_max: any;
  c_remaining_slide1_range_min: any;
  c_input_slide1_range_max: any;
  c_input_slide1_range_min: any;
  showanaLoading: boolean = false;
  defaultTabOpen: boolean = true;
  impRevValue: any = undefined;
  checkModalOpen: boolean = false;
  loadOnce_erf: boolean = true;
  animateLoadOnce: boolean = true;
  finalTriggeredData: boolean = false;
  orgTopValue: number = 0;
  orgBottomValue: number = 0;
  ana_removed: any;
  ana_removed1: any;
  ana_remaining: any;
  STW_Pricecurrency = '$';
  exclCompData: any = [];
  rightGridData: any = [];
  tradeDt = '';
  sinceDt = '';
  radius = 150;
  MedTxtColor = "#eee";
  Slide_count: number = 0;
  factorid: number = 18;
  HFscore: any;
  factdata = this.cusIndexService.checkFactorDt(this.factorid);
  subscriptions = new Subscription();
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  performanceUIndexList: any;
  constructor(public dialog: MatDialog, public sharedData: SharedDataService, public cusIndexService: CustomIndexService) { }

  ngOnDestroy() {
    this.cusIndexService.selCompany.next(undefined);
   // this.cusIndexService.performanceUIndexList.next([]);
    this.subscriptions.unsubscribe();
    this.cusIndexService.custSelectFactor.next(undefined);
  }

  excessCumReturns: any;
  excessAnnReturns: any;

  getAnalysis() {
    var that = this;
    that.showanaLoading = false;

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
    let that = this;
    this.cusIndexService.custSelectFactor.next(this.factdata);
    that.creatGradienArc(0, 100, '#erfScoreCircle');
    var exclusionCompData = this.cusIndexService.exclusionCompData.subscribe((res: any) => {
      this.rightGridData = [...res].filter((x: any) => isNotNullOrUndefined(x.scores));

      this.cusIndexService.getExclCompData().then((d: any) => {
        this.exclCompData = [...d].filter((x: any) => isNotNullOrUndefined(x.scores));
        this.exclCompData = [...this.exclCompData.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); })];
        if (that.exclCompData.length > 0) {
          that.CreateComps('#erfScoreCircle', [...this.rightGridData], "lvl1");
          setTimeout(() => {
            that.fillCompetives([...this.rightGridData]);
            that.loadAlphaRang();
          }, 100);
          var compDat: any[] = res.map((x: any) => x['scores']).filter((d: any) => isNotNullOrUndefined(d));
          that.orgTopValue = parseFloat(d3.min(compDat));
          that.orgBottomValue = parseFloat(d3.max(compDat));
        }
      });      
    });
    this.subscriptions.add(exclusionCompData);

    var checkStgyAlreadyTraded = that.cusIndexService.checkStgyAlreadyTraded.subscribe((res: any) => { this.checkStgyAlreadyTraded = res });
    that.subscriptions.add(checkStgyAlreadyTraded);

    var alphaFactorChangeDetection = this.cusIndexService.alphaFactorChangeDetection.subscribe((res: any) => {
      if (isNotNullOrUndefined(res['flag']) && isNotNullOrUndefined(res['type']) &&
        res['flag'] && res['type'] == "P") {
        this.cusIndexService.alphaFactorChangeDetection.next({ type: "", flag: false});
        var dd = [...this.cusIndexService.PostStrategyFactorsData.value].filter(x => x.factorid == this.factorid);
        if (dd.length > 0) {
          var tab: string = dd[0]['perorval'] == 1 ? 'val' : 'percent';
          this.switchTab_p(tab);
          this.tabClicl('init');
        } else {
          var tab: string = this.cusIndexService.tempFactorSwitch == 1 ? 'val' : 'percent';
          this.switchTab_p(tab);
          this.tabClicl("");
        }
      }
    });
    this.subscriptions.add(alphaFactorChangeDetection);
    var selCompany = this.cusIndexService.selCompany.subscribe(res => {
      if (isNotNullOrUndefined(res)) {
        if (isNullOrUndefined(res['scores']) || res['scores'] < 0) {
          setTimeout(() => { that.cusIndexService.selCompany.next(undefined); }, 200);
        } else {
          if (isNotNullOrUndefined(res['impRev'])) { this.impRevValue = d3.format(".1f")(res['impRev'] * 100); }
          else { this.impRevValue = undefined; }
          this.STW_Pricecurrency = res['currency'] + ' ' + d3.format(",.1f")(res['price']);
          this.checkHandlePos(res);
        }
      } else { d3.select("#erfScoreCircle").selectAll("#cSlider").remove(); };
     
    }, error => { });
    that.cusIndexService.selCompany.next(undefined);
    this.subscriptions.add(selCompany);
    var performanceData = this.cusIndexService.performanceUIndexList.subscribe(res => {
     
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
  checkHandlePos(d:any) {
    var exclCompData = [...this.exclCompData].map(a => ({ ...a })).filter((x: any) => isNotNullOrUndefined(x.scores));
    exclCompData = exclCompData.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var rightGridData = [...this.rightGridData].map(a => ({ ...a })).filter((x: any) => isNotNullOrUndefined(x.scores));
    rightGridData = rightGridData.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    rightGridData.forEach(function (d, i) { d.cx = ((i * 360 / rightGridData.length) - 90); return d; });
    var filExc = exclCompData.findIndex(x => x.stockKey == d.stockKey);
    var filRG = rightGridData.filter(x => x.stockKey == d.stockKey);
    if (filExc > -1 && filRG.length) { this.creatClockSlider(filRG[0], (filExc + 1)); }
    else { d3.select("#erfScoreCircle").selectAll("#cSlider").remove(); };
  }
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
  creatClockSlider(selComp:any, rank:any) {
    let that = this;
    d3.select("#erfScoreCircle").selectAll("#cSlider").remove();
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      //this.Slide_count = 0;
      //this.controlLeft();
      var r: any = d3.select("#erfScoreCircle #maincircle").attr("r");
      r = parseInt(r);
      d3.select("#erfScoreCircle").selectAll("#cSlider").remove();

      var g = d3.select("#erfScoreCircle").select("#crlChart").append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')')
        //.on('mousedown', onDown).on("touchstart", onDown)
        .on("pointerenter", function () { if (d3.selectAll("#gCompMOver").style("display") != 'none') { d3.selectAll("#gCompMOver").style("display", 'none') } });

      var rect1 = g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 3).attr("width", 50).attr("fill", "#767676");

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

      this.SetClockHandle(selComp, rank);
    }
  }

  SetClockHandle(d:any, rank:any) {    
    var txt: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    let ticker: string = (isNotNullOrUndefined(d.ticker)) ? "(" + d.ticker + ") " : '';
    d3.select("#erfScoreCircle").select(".rankAlpha").text(rank + "/" + this.exclCompData.length);
    let txt1 = ticker + d3.format(".1f")(d.scores*100) + "% [" + rank + "/" + this.exclCompData.length + "]";
    if ((txt.length) > 18) { txt = txt.slice(0, 18).trim() + "..."; }
    let that = this;
    let val = d.cx;
    var sliTag = d3.select("#erfScoreCircle").select("#cSlider");
    var r = d3.select("#erfScoreCircle #maincircle").attr("r");
    sliTag.attr('transform', 'rotate(' + val + ')');
    sliTag.select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.cusIndexService.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        if ((d.scores * 100) >= 40 && (d.scores * 100) < 55) { return that.MedTxtColor; }
        else { return that.MedTxtColor; }
      })

    sliTag.select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.cusIndexService.measureText(txt1, 9);
        var slen = ((parseFloat(r) + txtlen1 + 45) * -1)
        if (txt1.length > 21) {
          slen = ((parseFloat(r) + txtlen1 + 28) * -1)
        }

        return d.cx > 90 ? slen : "190";

      })
      .style('font-size', function () { if (txt1.length > 21) { return "8px" } else { return "8px"; } })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        if ((d.scores * 100) >= 40 && (d.scores * 100) < 55) { return that.MedTxtColor; }
        else { return that.MedTxtColor; }
      });

    var gbox: any = sliTag.select(".sText"); var bbox: any = gbox.node().getBBox();
    var bboxH = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    sliTag.select(".sRect")
      .attr("fill", "var(--cardsHighlightColorDark)")
      .attr("stroke", "#c7c7c7")
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
    sliTag.select("#cSliderCancel").on('click', function () {
      that.cusIndexService.selCompany.next(undefined);
      //that.Slide_count = 0;
      //that.controlLeft();
    });
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

    var txt_m: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    var midtxt = txt_m + ' ' + ticker;    
    if (txt_m.length > 20) {
      midtxt = txt_m.slice(0, 20) +'... ' + ticker;
    }
    d3.select('#erfScoreCircle').select('.Sel_midCompS1').select('.circle-SelCompName').attr('text-anchor', 'middle')
      .attr('fill', 'var(--prim-button-color)').style('font-size', function () { if ((midtxt.length) > 30) { return "13px" } else { return "13px"; } })
      .attr('y', function () { if ((midtxt.length) > 6) { return "4" } else { return (midtxt.length) < 22 ? "6" : "6"; } })
      .style('font-family', 'var(--ff-semibold)').text(midtxt)
      //.call(that.sharedData.Crlwrapping, 185, "top");
    // d3.select("#erfScoreCircle").select('.Sel_midCompS1').select('.circle-SelCompName').text(circleTxt);
    // d3.select("#erfScoreCircle").select('.Sel_midCompS1').select('.circle-ticker').text("("+ d.ticker +")");

    var medVel = d3.format(".1f")(d.scores*100) + '%';
    var rightGridData = [...this.rightGridData].map(a => ({ ...a })).filter((x: any) => isNotNullOrUndefined(x.scores));
    rightGridData = rightGridData.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var filRG = rightGridData.findIndex((x:any) => x.stockKey == d.stockKey);
    var per = d3.scaleLinear().domain([0, rightGridData.length]).range([0, 100]);
    var colorVal = per(filRG);
    that.HFscore = medVel;
    //d3.select("#erfScoreCircle").selectAll('.SelCompScore').attr('text-anchor', 'middle').text(medVel);
    sliTag.select('.sRect1').style("fill", that.cl(colorVal))
    sliTag.select('.sRect').attr("stroke-width", 1).style("stroke", that.cl(colorVal));
    d3.selectAll('#cSlider').raise()
  }

  alphaReset() {
    if (!this.checkStgyAlreadyTraded && this.cusIndexService.checkEnableFactSheet()) {
      this.cusIndexService.alphaFactorChangeDetection.next({ type: "C", flag: true, reset: true });
    }
  };

  loadAlphaRang() {
    var dd = [...this.cusIndexService.PostStrategyFactorsData.value].filter(x => x.factorid == this.factorid);   
    try { 
      if (dd.length > 0) {
        var tab: string = dd[0]['perorval'] == 1 ? 'val' : 'percent';
        this.switchTab_p(tab);
        this.tabClicl('init');
      } else {
        this.switchTab_p('percent');
        this.tabClicl('percent');
      }
    } catch (e) { }
  }
  tabClicl(type: string = "") {
    this.dragStarted = false;
    //this.cusIndexService.getExclFactorCompData().then(d => {
      //var clist = this.cusIndexService.currentSList.value;
      var dd = [...this.cusIndexService.PostStrategyFactorsData.value].filter(x => x.factorid == this.factorid);
      if (dd.length > 0 && type == 'init') {
        if (this.switchTabName_P == 'val') {
          var dmin = d3.min([dd[0].startval, dd[0].endval]);
          var dmax = d3.max([dd[0].startval, dd[0].endval]);
          this.SSRValueStart = dmax;
          this.SSRValueEnd = dmin;
        } else {
          this.SSRValueStart = dd[0].startval;
          this.SSRValueEnd = dd[0].endval;
        }
        this.Slide_count = 0;
        this.exclControlRight();

      } else {
        if (this.switchTabName_P == 'val') {
          this.SSRValueStart = -1;
          this.SSRValueEnd = -1;
        } else {
          this.SSRValueStart = 0;
          this.SSRValueEnd = 100;
        }
        this.Slide_count = -1;
        this.exclControlRight();
      }
      try {
        this.switchTab_p(this.switchTabName_P);
        //var data: any = d;
        var data: any = this.cusIndexService.exclusionCompData.value;
        if (data != null && data.length > 0) {
          var len = data.length;
          data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
          data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
          this.rightGridData = [...data];
          try {
            if (this.switchTabName_P == 'val') { this.circleRangeByVal({ "start": this.SSRValueStart, "end": this.SSRValueEnd }); }
            else { this.circleRangeByPer({ "start": this.SSRValueStart, "end": this.SSRValueEnd }); };
          } catch (e) { }
          //if (saveTemp) { this.saveChange(); }
        }
        d3.selectAll("#erfScoreCircle").select('#handles').style('display', 'block');
       
        //this.sharedData.rightGridData.next(this.sharedData._rightGridData);
      } catch (e) { }
    this.slider1Txts();
    /** Close Loader **/
    setTimeout(() => {
      this.sharedData.showCenterLoader.next(false);
      if (!this.cusIndexService._notifyDiClick) {
        this.sharedData.showCircleLoader.next(false);
      }
     
      d3.selectAll("#erfScoreCircle").select('#handles').style('visibility', 'visible');
    }, 1000)
      /** Close Loader **/
      d3.select("#erfScoreCircle").selectAll('.c_remaining_slide1').text(this.exclCompData.length);
    //});
  }
  slider1Txts() {
    var that = this;
    this.cusIndexService.customizeSelectedIndex_custom.pipe(first()).subscribe(customizeSelectedIndex => {
      let modeStr = customizeSelectedIndex.group;
      var medTxt = customizeSelectedIndex.med;
      if (isNullOrUndefined(medTxt) || medTxt == "") {
        medTxt = d3.median(this.rightGridData, function (dd:any) { return dd.scores; });
        if (isNullOrUndefined(medTxt) || medTxt == "") { medTxt = d3.median(this.rightGridData, function (dd:any) { return dd.scores }); }
        medTxt = (medTxt * 100);
        medTxt = medTxt.toFixed(1);
      }

      d3.selectAll("#erfScoreCircle .h-factValue").text(d3.format(".1f")(medTxt)).style("fill", function () { return that.cl(medTxt + 1); });
      //setTimeout(function () {
      //  d3.selectAll('.mid_fulltext').style('visibility', 'visible');
      //}, 500)
      
    });
  }
  switchTab_p(e:string) {
    this.switchTabName_P = e;
    var mTag = d3.select('#erfScoreCircle .tabsPercent');
    if (e == 'percent') {
      mTag.select('.cum_active').style('display', 'none');
      mTag.select('.ann_active').style('display', 'block');
      mTag.select('.mainrect').style('stroke', 'none');
      mTag.select('.move_rect').attr('x', -6);
      mTag.select('.ann').style('cursor', 'auto');
      mTag.select('.ann').select('text').attr('style', 'fill: #fff !important;font-size:9px');
      mTag.select('.cum').style('cursor', 'pointer');
      mTag.select('.cum').select('text').attr('style', 'fill: #7f85f5 !important;font-size:9px');
    }
    else {
      mTag.select('.cum_active').style('display', 'block');
      mTag.select('.ann_active').style('display', 'none');
      mTag.select('.mainrect').style('stroke', 'none');
      mTag.select('.move_rect').attr('x', 20);
      mTag.select('.ann').style('cursor', 'pointer');
      mTag.select('.ann').select('text').attr('style', 'fill: #7f85f5 !important;font-size:9px');
      mTag.select('.cum').style('cursor', 'auto');
      mTag.select('.cum').select('text').attr('style', 'fill: #fff !important;font-size:9px');
    }
  }

  clipPathCheck(CPName: any, type: any, masterID: string) {
    let msID = masterID.replaceAll('#', '');
    if (type == 'ID') { return msID + '' + CPName; }
    else { return "url(#" + msID + '' + CPName + ')'; }
  }

  creatGradienArc(sMin: number = 0, sMax: number = 100, masterID: string) {
    let that = this;
    var data: any = [];
    var tempArcData: any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    data = [...tempArcData];
    if (data != null && data.length > 0) {
      var len = data.length;
      data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }
    if (sMin == null) { sMin = 0; }
    if (sMax == null) { sMax = 100; }
    var gArc = null;
    var gArcLine = null;

    d3.select(masterID).select("#gradArc").remove();
    d3.select(masterID).select("#gradArcLine").remove();
    gArc = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArc");
    gArcLine = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArcLine");

    var arc: any = d3.arc().innerRadius(that.radius - 18).outerRadius(that.radius - 2);
    var gC100 = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);

    // create our gradient
    var colors: any = [];
    var linearGradient = gArc.append("defs");
    var linearG1 = linearGradient.append("linearGradient");

    var gCArcColor = d3.scaleLinear().domain([0, 90, 91, 180, 181, 270, 271, 360]).range([0, 100, 0, 100, 0, 100, 0, 100])
    var MaxColor: any = "";
    var MaxScore: any = "";
    var Data1 = data.filter((x: any) => x.cx >= -90 && x.cx <= 0);
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

    var Data2 = data.filter((x: any) => x.cx >= 1 && x.cx <= 90);
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

    var Data3 = data.filter((x: any) => x.cx >= 91 && x.cx <= 180);
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

    var Data4 = data.filter((x: any) => x.cx >= 181 && x.cx <= 270);
    var linearG4 = linearGradient.append("linearGradient");
    linearG4.attr("id", that.clipPathCheck("linearColors3", 'ID', masterID))
      .attr("x1", "0").attr("y1", "1").attr("x2", "1").attr("y2", "0");

    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 181 && data[i].cx <= 270) {
          linearG4.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 270) { break; }
      }
      if (Data4 == null || Data4.length == 0) {
        linearG4.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      }
    }
    // 360 degrees
    d3.range(4).forEach(function (d, i) {
      // convert to radians
      var start = (i * 89) * (Math.PI / 180), end = ((i * 89.9) + 90) * (Math.PI / 180);
      colors.push({ startAngle: start, endAngle: end });
    });
    // add arcs
    gArc.selectAll('.arc').data(colors).enter().append('path')
      .attr('class', 'arc').attr('d', arc).attr('stroke', 'none')
      .attr('fill', function (d, i) { return that.clipPathCheck('linearColors' + i, '', masterID); });

    //// Dragged Gradient color
    gArc.append('path')
      .attr('id', 'leftOverlay')
      .attr('class', 'circle_overlay')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', 'var(--border)')
      .style('opacity', '0.85')
      .attr('stroke-width', '2')
      .attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.8) translate(18px, -18px) rotateY(180deg)')
      .attr('stroke-dasharray', '100 100')
      .style('display', 'none')
      .attr('fill', 'none');
    gArc.append('path')
      .attr('id', 'rightOverlay')
      .attr('class', 'circle_overlay_alt')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', '#101022')
      .attr('stroke-width', '2')
      .attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.8) translate(-18px, -18px) rotateY(0deg)')
      .attr('stroke-dasharray', '100 100')
      .style('display', 'none')
      .attr('fill', 'none');
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
    gArc.append('g').attr('transform', 'rotate(-90)').append('rect').attr('height', '1')
      .attr('width', '20').attr('x', '130').attr('fill', '#000');

  }

  CreateComps(masterID: string, dta:any, lvl: string) {
    let that = this;
    var compLst;
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst' + lvl).remove();
    compLst = oSvg.append("g").attr('class', 'compList show_comp_list compLst' + lvl).style("display", "block");

    if (dta != null && dta.length > 0) {
      var len = dta.length;
      dta.sort(function (x: any, y: any) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }
    d3.select("#gradArcLine").remove();

    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);
    var compg = compC.selectAll("g")
      .data(dta)
      .enter().append("g")
      .attr("class", function (d:any) {
        if (isNotNullOrUndefined(that.exclCompData) &&
          that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) {        
          return 'comp hiderect';
        } else { return 'comp'; }
      })
      .attr("transform", function (d: any) { return "rotate(" + (d.cx) + ")"; })
      .attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .attr("id", function (d: any) { return d.isin + "_compRect" })
      .on("pointerenter", function (event, d) {
        d3.select(this).raise();
        d3.select(this).select(".crect").classed("onrect", true);
      })
      .style("display", "block")
      .on("pointerleave", function (event, elemData) {
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
        if (dta.length > 600) { return "crect rectOpa" } else { return "crect" }
      })
      .attr("fill", "#4b4b4b").attr("x", that.radius + 3).attr("width", 0)
      .transition().duration(10)
      .attr("width", function (d:any) {
        let wtdwidth = 0;
        var wt = ((d.marketCap / dlimitedSum) * 10000);
        if (d.marketCap < dmean) {wtdwidth = wt;}
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
    if (dta != null && dta.length > 0) {
      var len = dta.length;
      dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }

    let data = [];
    d3.select("#erfScoreCircle #crlChart").select("#gCompetitive").remove();
    d3.select("#erfScoreCircle #crlChart").select("#exclugCompetitiveRect").remove();
    gs = d3.select("#erfScoreCircle").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#erfScoreCircle").select('#crlChart').append("g").attr("id", "exclugCompetitiveRect");
    data = [...dta];
    gs.selectAll("g").remove();
    var fillMaxlen = that.sharedData.ciMinCircleShowCount;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    
    if (data.length > fillMaxlen) {
      sdata = data.filter(function (d: any, i: any) {
        if (that.exclCompData.length < that.sharedData.ciMinCircleShowCount &&
          that.exclCompData.filter((x:any) => x.isin == d.isin).length > 0) { return d; }
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
        if (dta.filter((x:any) => x.isin == d.isin).length == 0) { opa = 1; }
        return opa;
      });

    ggs.append("text")
      .attr("x", function (d) { return that.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", "var(--leftSideText)")
      .style("display", function () {
        return (data.length > fillMaxlen) ? "none" : "block"
      })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.txtanch(d); })
      .attr("class", function (d: any) {
        let highlightclass = '';
        if (isNotNullOrUndefined(that.exclCompData)
          && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt avbold " + highlightclass); }
        else { return (that.cusIndexService.HFCompanyTxt(d) + " avbold " + highlightclass); }
      })
      .text(function (d: any) { return d3.format(",.2f")(d.scores*100) + "%"; });

    ggs.append("text")
      .attr("x", function (d) { return that.txtx(d); })
      .style("fill", "var(--leftSideText)")
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.txtanch(d); })
      .attr("class", function (d: any) {
        let highlightclass = '';
        if (isNotNullOrUndefined(that.exclCompData) && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt " + highlightclass); }
        else { return that.cusIndexService.HFCompanyTxt(d) + highlightclass; }
      })
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

    ggs.on("pointerenter", function ( d: any) {
      if (data.length > fillMaxlen) {
        d3.selectAll("#erfScoreCircle").select("#exclugCompetitiveRect").raise();
        d3.selectAll("#erfScoreCircle").select("#cSlider").raise();
      } else {
        if (that.exclCompData.filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      }
    }).on("pointerleave", function () { d3.select(this).classed("on", false); });

    ggs.on("click", function (ev: any, d: any) { that.fillmouseClick(d); });
    
    if (data.length > fillMaxlen) {
      that.fillCompetivesRect(dta);
    } else { d3.select("#exclugCompetitiveRect").selectAll("g").remove(); }
    d3.select('#erfScorecharts').selectAll('#gCompetitive').selectAll('g').style('opacity', '0.4');
    d3.selectAll('#cSlider').raise();
  }

  fillCompetivesRect(data:any)  {
    var that = this;
    var gs: any;
    d3.select("#exclugCompetitiveRect").selectAll("g").remove();
    d3.select("#exclugCompetitiveRect").raise();
    gs = d3.select("#exclugCompetitiveRect");

    var arc = d3.arc().innerRadius(220).outerRadius(285)
      .startAngle(function (d) { return 0 * (Math.PI / 180); })
      .endAngle(function (d) { return 360 * (Math.PI / 180); })

    var ggs = gs.append("g").append("path").attr("fill", 'transparent').attr("d", arc)

    ggs.on("pointerenter", function (ev:any, d:any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x:any) => x.cx >= nA);
      if (dst.length > 0) {
        if (that.exclCompData.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data, ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    }).on("mousemove", function (ev:any) {
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
    gs.on("pointerleave", function () { gs.selectAll(".gfillCompMouseover").remove(); });
  }

  gfillCompMouseover(gs:any, d:any, dta:any, ev:any) {
    var that = this;
    try {
      gs.selectAll(".gfillCompMouseover").remove();
      var ggs = gs.append("g").attr("class", "gfillCompMouseover")
        .style("cursor", "pointer").style("font-size", "8px").style("font-family", 'var(--ff-medium)')
        .attr("transform", function () {
          if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
        });
      d3.select(ev).raise();
      ggs.append("text").attr("x", that.txtx1(d)).attr("id", "gcStxt")
        .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText)"; } else { return "var(--leftSideText)"; } })
        .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.txtanch(d))
        .attr("class", function () {
          if (isNotNullOrUndefined(that.exclCompData)
            && that.exclCompData.filter((x: any) => x.isin == d.isin).length == 0) { return " AVHideTxt avbold"; }
          else { return " avbold"; }
        }).text(function () { return d3.format(",.2f")(d.scores*100) + "%"; });

      ggs.append("text").attr("x", that.txtx(d))
        .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "var(--leftSideText-B)"; } })
        .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.txtanch(d))
        .attr("class", " AVHideTxt")
        .text(function () {
          var cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
          if ((d.cx) > 90) {
            let txt = "" + cname.trim() + "...";
            let resvtxt = "";
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
    } catch (e) {}
  }


  fillmouseClick(d: any) {
    if (this.exclCompData.filter((x: any) => x.stockKey == d.stockKey).length > 0) { this.cusIndexService.selCompany.next(d); }
  }

  txtx(d: any) { return ((d.cx) > 90) ? "-222" : "222"; }
  txtx1(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx1d(d: any) { return ((d.rx) > 90) ? "-190" : "188"; }
  txtx2(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx3(d: any) { return ((d.cx) > 90) ? "-192" : "192"; }
  txttrans(d: any) { return ((d.cx) > 90) ? "rotate(180)" : null; }
  txtanch(d: any) { return ((d.cx) > 90) ? "end" : null; }

  checkdragPath(data: any) {
    var path:any = [];
    data = data.filter((x: any) => isNotNullOrUndefined(x.scores)).sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / data.length) - 90); return d; });
    [...data].forEach((x, i) => {
      if (i == 0) {
        path.push({ "value": parseFloat((x.scores).toFixed(4)), "cAngle": (x.cx + 90), "Aup": (x.cx + 90), "Adown": ([...data][i + 1].cx + 90), "up": 0, "down": parseFloat((([...data][i + 1].scores)).toFixed(4)) });
      } else if (i == ([...data].length - 1)) {
        path.push({ "value": parseFloat((x.scores).toFixed(4)), "cAngle": (x.cx + 90), "Aup": ([...data][i - 1].cx + 90), "Adown": (x.cx + 90), "up": parseFloat((([...data][i - 1].scores)).toFixed(4)), "down": 0 });
      } else {
        path.push({ "value": parseFloat((x.scores).toFixed(4)), "cAngle": (x.cx + 90), "Aup": ([...data][i - 1].cx + 90), "Adown": ([...data][i + 1].cx + 90), "up": parseFloat((([...data][i - 1].scores)).toFixed(4)), "down": parseFloat((([...data][i + 1].scores)).toFixed(4)) });
      }
    });
    return path;
  }

  exclControlLeft() {
    var that = this;
    var controlLeft = d3.select('#erfScoreCircle').select('#left');
    var controlLeftDisable = d3.select('#erfScoreCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#erfScoreCircle').select('#right');
    var controlRightDisable = d3.select('#erfScoreCircle').select('#right .disableRightCircle');

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
    d3.select('#erfScoreCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot();

  }

  exclControlRight() {
    var that = this;
    var controlLeft = d3.select('#erfScoreCircle').select('#left');
    var controlLeftDisable = d3.select('#erfScoreCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#erfScoreCircle').select('#right');
    var controlRightDisable = d3.select('#erfScoreCircle').select('#right .disableRightCircle');

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
    d3.select('#erfScoreCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
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

  SSRValueStart: any = 0;
  SSRValueEnd: any = 0;
  addedCompanies:any = [];
  removedCompanies: any = [];
  sliderinitiateValueMin: any;
  sliderinitiateValueMax: any;
  dragStarted: boolean = false;

  circleRangeByVal(values:any) {
    var that = this;
    var dmin = d3.min([values.start, values.end]);
    var dmax = d3.max([values.start, values.end]);
    var dragPath = this.checkdragPath(this.rightGridData);
    var inSta = dragPath.filter((x:any) => parseFloat(x.value.toFixed(4)) >= parseFloat(dmin.toFixed(4)));
    var inEnd = dragPath.filter((x: any) => parseFloat(x.value.toFixed(4)) <= parseFloat(dmax.toFixed(4)));
    if (dmin == -1 || dmax == -1) { inSta = []; inEnd = []; }
    if (inSta.length == 0 && inEnd.length == 0) { values = { "start": dragPath[dragPath.length - 1].value, "end": dragPath[0].value }; }
    else if (inSta.length > 0 && inEnd.length == 0) { values = { "start": inSta[inSta.length - 1].value, "end": dragPath[dragPath.length - 1].value }; }
    else if (inSta.length == 0 && inEnd.length > 0) { values = { "start": dragPath[0].value, "end": inEnd[0].value }; }
    else { values = { "end": inSta[0].value, "start": inEnd[inEnd.length - 1].value }; }
    that.SSRValueStart = values.start;
    that.SSRValueEnd = values.end;
    d3.selectAll("#erfScoreCircle").selectAll("#slider").remove();
    d3.selectAll("#erfScoreCircle").select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-160,-160)");
    var width = 320;
    var height = 320;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';  // 'var(--btn-bg-graph)'
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var rangeTotal = dragPath.length;
    var tickColor1 = "var(--leftSideText-B)";
    var radius = (Math.min(width, height) - margin.top - margin.bottom) / 2;
    var outerRadius = (radius + 1) + indicatorWidth / 2;
    var innerRadius = outerRadius - indicatorWidth;
    var dragLiveData: any;
    var holder, indicatorArc: any, handles: any, dragBehavior: any;
    var a: any, e: any, startAngle: any, endAngle: any;
    var Intdata = values;
    var sliderInitValue: any = dragPath[0].value;
    var sliderEndValue: any = dragPath[dragPath.length - 1].value;
    var path = dragPath[0];
    var path1 = dragPath[dragPath.length - 1];
    var a1Value = sliderEndValue; // from
    var a2Value = sliderInitValue; // first drag on top
    that.sliderinitiateValueMin = sliderEndValue; // slider Drag on change -- 28
    that.sliderinitiateValueMax = sliderInitValue; // slider Drag on change -- 28

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
        var value: any = 0, angle: any = 0;
        var angleTO = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        var segmentsToAngle = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
        angle = segmentsToAngle(initialData.end);
        value = initialData.end;
        this.graphdata.push({ value: value, label: 'a', angle: angle });
        angle = segmentsToAngle(initialData.start);
        value = angleTO.invert(angle);
        this.graphdata.push({ value: value, label: 'e', angle: angle });
      },
      "calculateUpdateHandleData": function (values:any) {
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
        this.graphdata.forEach(function (el: any) {
          if (el.label == label) value = el.value;
        });
        return value;
      },
      "getAngleOfDataSet": function (label: any) {
        var angle = 0;
        this.graphdata.forEach(function (el: any) {
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
          $('#erfScoreCircle .sliderDispTicks').css('display', 'none');
          d3.selectAll('.animateCircle').style('display', 'block');
          that.saveFactorsStrateg(true);
        } else if (that.dragStarted) { that.saveFactorsStrateg(); }

        that.showSlider2 = true;
        that.showanaLoading = true;
        that.Slide_count = 0;
        that.exclControlRight();
        
        that.SliderOnChangeByVal();
      } else {
        that.switchTabName_P = 'val';
        that.tabClicl('init');
        that.sharedData.showAlertMsg2("", that.cusIndexService.minCustInd.message);
        that.closeapply_slider1();
      }
      that.dragStarted = false;
    }
    var svg = d3.selectAll("#erfScoreCircle").select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
    holder = svg.append('g').attr('id', 'arcindicator').attr("class", "sliderDisp").style("display", "block");
    if (dmin == -1 || dmax == -1) { helper.calculateInitialData(Intdata); } else {
      helper.graphdata = [
        { value: that.SSRValueEnd, label: 'a', angle: inSta[0].cAngle },
        { value: that.SSRValueStart, label: 'e', angle: inEnd[inEnd.length - 1].cAngle },
      ];
    }
    a = helper.getValueOfDataSet("a");
    e = helper.getValueOfDataSet("e");
    startAngle = helper.getAngleOfDataSet("a");
    endAngle = helper.getAngleOfDataSet("e");

    writeTimeInfo({ a: a, e: e, aAngle: startAngle, eAngle: endAngle });
    var arc:any = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); });

    indicatorArc = holder.append("g").attr("class", "arcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill", function (d, i) { return accentColor; }).attr("d", arc)


    handles = svg.append('g').attr('id', 'handles')
      .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "sliderDisp").style("display", "none").style("visibility", "hidden");
    dragBehavior = d3.drag().subject(function (d) { return d; })
      .on("drag", function (ev: any, d: any) {
        if (!that.checkStgyAlreadyTraded && that.cusIndexService.checkEnableFactSheet()) {
          if (d.label == 'a') {
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

          if (d.label == 'e') {
            var coordinaters1 = d3.pointers(ev, svg.node());
            var xx = coordinaters1[0][0] - radius;
            var yy = coordinaters1[0][1] - radius;
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
          that.showHideEntBtn = true;
          d3.select("#erfScoreCircle").select('.applychanges').style('display', 'block');
        }
      }).on("end", function () {
        if (!that.checkStgyAlreadyTraded && that.cusIndexService.checkEnableFactSheet()) {
          that.showborderMin = false;
          that.showborderMax = false;
          d3.select(this).classed('active', false);
          d3.selectAll("#erfScoreCircle").select("#crlChart").select('.sliderToolTip').remove();
          //d3.select("#erfScoreCircle").select('.applychanges').style('display', 'block');
          checkHandlesPosition(this);
        }
      });

    drawHandles();
    d3.selectAll("#erfScoreCircle").selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });
    d3.selectAll("#erfScoreCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius) * -1 + ')');
    d3.selectAll("#erfScoreCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + (startAngle) + ') translate(0,' + (radius) * -1 + ')');

    updateHandles(helper.getsetValue('e'));
    updateHandles(helper.getsetValue('a'));

    d3.selectAll("#erfScoreCircle").select('#handles').style('display', 'block');
    d3.selectAll("#erfScoreCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (0) + " " + '100').style('display', 'block');

    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter()
        .append('g')
        .attr('class', 'handlercontainer')
        .attr('transform', function (d:any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius) * -1 + ')'; })
        .on("pointerenter", function (ev:any) {d3.select(ev).classed('active', true);})
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
        .attr('id', function (d:any) { return d.label; })
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
          const pathData = "M13.1364 3.11361C13.4879 3.46508 13.4879 4.03493 13.1364 4.3864L7.5228 10L13.1364 15.6136C13.4879 15.9651 13.4879 16.5349 13.1364 16.8864C12.7849 17.2379 12.2151 17.2379 11.8636 16.8864L5.61361 10.6364C5.26214 10.2849 5.26214 9.71508 5.61361 9.36361L11.8636 3.11361C12.2151 2.76214 12.7849 2.76214 13.1364 3.11361Z";
        atext.append('path')
        .attr('d', pathData)
        .attr('fill', 'white');
        
      /******* Tooltip *******/
      circles.append('circle')
        .attr('r', 16)
        .attr('class', 'handle')
        .style('stroke', 'var(--theme-def-bg)')
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
        .text(function (d: any) { if (d.value > 0) return d.value; else return "" });
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

      var roTicker = d3.selectAll("#erfScoreCircle").select("#slider").select("#holder").select("#ticks");     
      var lastTicks = ".tick" + (dragPath.length - 1);
      roTicker.select(".tick0").select("text").text('')
      roTicker.select(lastTicks).select("text").text('')
      roTicker.select(".tick0").select("line").remove();
      roTicker.select(lastTicks).select("line").remove();
    }
    function dragmoveHandles(ev:any, d:any) {
      if (d.label == 'a') {
        var coordinaters: any = d3.pointers(ev, svg.node());
        var x: any = coordinaters[0][0] - radius;
        var y: any = coordinaters[0][1] - radius;
        var nA:any = (Math.atan2(y, x) * 180 / Math.PI) + 90;
        if (nA < 0) { nA = 360 + nA; }
        nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
        var nD = dragPath.filter((ud:any) => ud.cAngle <= nA);
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
        var coordinaters1: any = d3.pointers(ev, svg.node());
        var xx = coordinaters1[0][0] - radius;
        var yy = coordinaters1[0][1] - radius;
        var nA1:any = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
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
      var handlerContainer = d3.selectAll("#erfScoreCircle").selectAll('#handles .handlercontainer'); //select all handles
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
      var allHandles:any = handles.selectAll('.handlercontainer');
      var currentData:any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d:any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      dragLiveData = currentData;
    }

    function updateHandles(dd:any) {
      if (dd.label == 'a') { // rightDrag
        a1Value = dd.value;
        var endvalue = (dd.value * 100).toFixed(2);
        that.c_remaining_slide1_range_min = that.numberWithCommas(endvalue);
        that.c_input_slide1_range_min = endvalue; /// slider Drag on change -- 28
        d3.select('.c_remaining_slide1_range_min').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#erfScoreCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius) * -1 + ')');
        updateArc();
        if (dd.value < sliderInitValue) {
          // d3.select('.leftGrid_drag').style('display', 'none');
        }
       
        
        if (dd.angle == 360 || dd.angle == 0 || dd.value == sliderInitValue) {
          //d3.select('.leftGrid_drag').style('display', 'block'); 
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text("");
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #atooltip").style('display', 'none');
        } else {
          d3.select('.leftGrid_drag').style('display', 'none');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text((dd.value * 100).toFixed(1));
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #atooltip").style('display', 'block');
        }       
      }

      //// Left drag
      if (dd.label == 'e') {
        a2Value = dd.value;
        var startvalue = (dd.value * 100).toFixed(2);
        that.c_remaining_slide1_range_max = that.numberWithCommas(startvalue);
        that.c_input_slide1_range_max = startvalue; /// slider Drag on change -- 28
        d3.select('.c_remaining_slide1_range_max').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#erfScoreCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius-2) * -1 + ')');
        updateArc();
        d3.selectAll('.animateCircle').style('display', 'none');
        var arcScale = d3.scaleLinear().range([0,100]).domain([360, 0]);
        var sArc: number = 0;
        if (dd.value < sliderEndValue) {
          d3.select('.leftGrid_drag').style('display', 'none');
          d3.select('.rightGrid_drag').style('display', 'none');
          if (that.SSRValueStart == sliderInitValue) { d3.select('.rightGrid_drag').style('display', 'block'); }
          else { d3.select('.rightGrid_drag').style('display', 'none'); };
        }
        if (dd.angle == 360 || dd.angle == 0 || dd.value == sliderEndValue) {
          d3.selectAll("#erfScoreCircle").select('#handles').select('.a2').attr('transform', 'rotate(360) translate(0,' + (radius-2) * -1 + ')');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text('');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtextinner").style('display', 'none');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #etooltip").style('display', 'none');
          //d3.select('.leftGrid_drag').style('display', 'block');
        } else {
          sArc = arcScale((dd.angle));
          d3.select('.leftGrid_drag').style('display', 'none');
          d3.selectAll('.animateCircle').style('display', 'none');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text((dd.value * 100).toFixed(1));
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtextinner").attr("transform", "rotate(0)")
          .style('display', 'block');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #etooltip").style('display', 'block');
          //d3.select('.leftGrid_drag').style('display', 'none');
        }
        if (sArc < 0) { sArc = 0; }
        d3.selectAll("#erfScoreCircle").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (sArc) + " " + '100').style('display', 'block');        
      }
      d3.selectAll("#erfScoreCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (0) + " " + '100').style('display', 'block');
      that.sharedData.showMatLoader.next(false);
      if (dd.angle == 360 || dd.angle == 0) {
        d3.select('.rightGrid_drag').style('display', 'block');
      }
      that.onDragRem(dd);
    }

    function checkHandlesPosition(labelOfDagedHandle:any) {
      var currentData = { "a": that.SSRValueEnd, "aAngle": 0, "e": that.SSRValueStart, "eAngle": 0 };
      var ddmin = d3.min([that.SSRValueStart, that.SSRValueEnd]);
      var ddmax = d3.max([that.SSRValueStart, that.SSRValueEnd]);
      var tempfacter = that.cusIndexService.PostStrategyFactorsData.value.map((a:any) => ({ ...a }));
      var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == that.factorid);
      var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == that.factorid);
      var checkPro: boolean = true;
      if (filterFactor.length > 0 && index > -1) {
        if (tempfacter[index].startval == ddmin && tempfacter[index].endval == ddmax) { checkPro = false; }
      } else if (ddmin == sliderEndValue && ddmax == sliderInitValue) {
        checkPro = false;
        that.closeapply_slider1();
      }
      if (ddmin == sliderInitValue && ddmax == sliderInitValue) { currentData['e'] = sliderEndValue; }
      if (checkPro) {
        d3.select("#erfScoreCircle").select('.applychanges').style('display', 'block');
        writeTimeInfo(currentData, true);
      }
    }
  }

  closeapply_slider1() {
    d3.select("#erfScoreCircle").select('.applychanges').style('display', 'none');
    this.showborderMin = false;
    this.showborderMax = false;
  }

  circleRangeByPer(values:any) {
    var that = this;
    d3.selectAll("#erfScoreCircle").selectAll("#slider").remove();
    d3.selectAll("#erfScoreCircle").select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-160,-160)");
    var width = 320;
    var height = 320;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var rangeTotal = 101;
    var tickColor1 = "#dadadc";
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
    that.sliderinitiateValueMin = sliderEndValue;
    that.sliderinitiateValueMax = sliderInitValue;
    var a1Value = 100;
    var a2Value = 0;
    var helper = {
      settings: {},
      graphdata:<any>[],
      "calculateDuration": function (startAngle: any, endAngle: any) {
        var duration: any; var angleToSegments = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
        duration = angleToSegments(endAngle) - angleToSegments(startAngle);
        if (duration < sliderInitValue) duration = rangeTotal + duration;
        return duration * 5;
      },
      "createInfoObject": function (data: any) {
        var angleToSegments = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]); var angleToFiveMinuteScale = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
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
        this.graphdata.forEach(function (el: any) {
          if (el.label == label) value = el.value;
        });
        return value;
      },
      "getAngleOfDataSet": function (label: any) {
        var angle = 0;
        this.graphdata.forEach(function (el: any) {
          if (el.label == label) angle = el.angle;
        });
        return angle;
      },
      "getsetValue": function (label: any) {
        return this.graphdata.filter((u:any)=> u.label == label)[0];
      },
      "getData": function () {
        return this.graphdata;
      }
    }

    var angularScale = d3.scaleLinear().range([0, 360]).domain([sliderInitValue, sliderEndValue]);
    var angularvalue = d3.scaleLinear().range([sliderInitValue, sliderEndValue]).domain([0, 360]);
    var tickdata = function () {
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
        that.Slide_count = 0;
        if (that.dragStarted && ((sliderObject.a == 0 || sliderObject.a == 100) && sliderObject.e == 0)) {
          /*** First Slider ***/
          that.showSlider2 = false;
          that.Slide_count = -1;
          that.exclControlRight();
          /*** First Slider ***/
          //$('#erfScoreCircle .sliderDispTicks').css('display', 'none');
          d3.selectAll('.animateCircle').style('display', 'block');
          that.saveFactorsStrateg(true);
        }
        else if (that.dragStarted) { that.saveFactorsStrateg(); }
        /*** Dragged Slider ***/
        that.showSlider2 = true;
        //that.Slide_count = 0;
        //that.exclControlRight();
        that.showanaLoading = true;
        that.SliderOnChange();
        /*** Dragged Slider ***/
      } else {
        that.switchTabName_P = 'percent';
        that.tabClicl('init');
        that.sharedData.showAlertMsg2("", that.cusIndexService.minCustInd.message);
        that.closeapply_slider1();
      }
      if (((sliderObject.a == 0 || sliderObject.a == 100) && sliderObject.e == 0)) {
        that.animateLoadOnce = true;
        //d3.selectAll("#erfScoreCircle").selectAll("#pullRemove").style("display", "block");
        //d3.select("#erfScoreCircle").select('#resetAL').style('display', 'none');
        //d3.select("#showSwitch_popup").style('display', 'none');
        that.showSlider2 = false;
        that.Slide_count = -1;
        that.exclControlRight();
        that.SSRValueStart = 0;
        that.SSRValueEnd = 100;
        d3.selectAll('.animateCircle').style('display', 'block');
        //$('#erfScoreCircle .sliderDispTicks').css('display', 'none');
      }
      that.dragStarted = false;
    }

    var svg = d3.selectAll("#erfScoreCircle").select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
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
      .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "sliderDisp").style("display", "none").style("visibility", "hidden");
    dragBehavior = d3.drag().subject(function (d) { return d; }).on("drag", function (ev: any, d: any) {
      if (!that.checkStgyAlreadyTraded && that.cusIndexService.checkEnableFactSheet()) {
        if (d.label == 'e') {
          //var coordinaters = d3.pointer(svg.node());
          //var x = coordinaters[0] - radius;
          //var y = coordinaters[1] - radius;
          var coordinaters = d3.pointers(ev, svg.node());
          var x = coordinaters[0][0] - radius;
          var y = coordinaters[0][1] - radius;
          var nA = (Math.atan2(y, x) * 180 / Math.PI) + 90;
          if (nA < 0) { nA = 360 + nA; }
          nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
          var newvalue = angularScale.invert(nA);
          var cvalue = ((newvalue / sliderDragRange) - ((newvalue / sliderDragRange) % 1)) * sliderDragRange;
          if (a1Value == 0) { a1Value = 100; }
          that.SSRValueEnd = 100;

          if (d.value > that.SSRValueEnd) {
            d.value = 0;
            d.angle = angularvalue.invert(d.value);
          }
          //if (path.up == cvalue || path.down == cvalue && (a1Value > path.down || cvalue < a1Value)) {       
          if (a2Value < that.SSRValueEnd) {
            a2Value = d.value;
            //that.SSRValueStart = a2Value;
            dragmoveHandles(ev, d);
          }
          //  }
        }

        if (d.label == 'a') {  //// Rightside drag
          var coordinaters1 = d3.pointers(ev, svg.node());
          var xx = coordinaters1[0][0] - radius;
          var yy = coordinaters1[0][1] - radius;
          var nA1 = (Math.atan2(yy, xx) * 180 / Math.PI) + 90;
          if (nA1 < 0) { nA1 = 360 + nA1; }
          nA1 = nA1 - ((nA1 * sliderEndValue) % 125) / rangeTotal;
          var newvalue1 = angularScale.invert(nA1);
          var cvalue1 = ((newvalue1 / sliderDragRange) - ((newvalue1 / sliderDragRange) % 1)) * sliderDragRange;
          if (cvalue1 == 0) { cvalue1 = 100; }
          //if ((cvalue1 >= 0) && (path1.up == cvalue1 || path1.down == cvalue1) && (a2Value < path1.down || cvalue1 > a2Value)) {
          if (a1Value == 0) { a1Value = 100; }
          if (d.value < that.SSRValueStart) {
            d.value = 100;
            d.angle = angularvalue.invert(d.value);
          }
          if (that.SSRValueStart < a1Value) {
            a1Value = d.value;
            //that.SSRValueEnd = a1Value;
            dragmoveHandles(ev, d);
          }
          //}
        }
        //   dragmoveHandles(d, i);
        that.dragStarted = true;
        that.animateLoadOnce = false;
        that.showHideEntBtn = true;
        d3.select("#erfScoreCircle").select('.applychanges').style('display', 'block');
      }
    }).on("end", function () {
      if (!that.checkStgyAlreadyTraded && that.cusIndexService.checkEnableFactSheet()) {
        that.showborderMin = false;
        that.showborderMax = false;
        d3.select(this).classed('active', false);
        d3.selectAll("#erfScoreCircle").select("#crlChart").select('.sliderToolTip').remove();
        checkHandlesPosition();
      }
    });

    drawHandles();
    d3.selectAll("#erfScoreCircle").selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });
    //if (endAngle === 360) {
    d3.selectAll("#erfScoreCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius-2) * -1 + ')');
    //}
    //if (startAngle === 360) {
    d3.selectAll("#erfScoreCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + (startAngle) + ') translate(0,' + (radius) * -1 + ')');
    //}    
    if (that.SSRValueStart > 0 && that.SSRValueStart < 100) {
      updateHandles(helper.getsetValue('e'))
      $('#erfScoreCircle .sliderDispTicks').css('display', 'block');
    } else {
      that.c_remaining_slide1_range_min = '0%'
      that.c_input_slide1_range_min = 0; // slider Drag on change -- 28
    }
    if (that.SSRValueEnd < 100 && that.SSRValueEnd > 0) {
      updateHandles(helper.getsetValue('a'));
      $('#erfScoreCircle .sliderDispTicks').css('display', 'block');
    } else {
      that.c_remaining_slide1_range_max = '100%';
      that.c_input_slide1_range_max = 100; // slider Drag on change -- 28
    }
    d3.selectAll("#erfScoreCircle").select('#gradArc').select('#leftOverlay').attr('stroke-dasharray', (that.SSRValueStart) + " " + '100').style('display', 'block');
    d3.selectAll("#erfScoreCircle").select('#gradArc').select('#rightOverlay').attr('stroke-dasharray', (0) + " " + '100').style('display', 'block');
    //path = that.checkSliderPath(that.SSRValueStart);
    //path1 = that.checkSliderPath1(that.SSRValueEnd);
    d3.selectAll("#erfScoreCircle").select('#handles').style('display', 'block');

    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter()
        .append('g')
        .attr('class', 'handlercontainer')
        .attr('transform', function (d: any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius) * -1 + ')'; })
        .on("pointerenter", function (ev: any) {
          d3.select(ev).classed('active', true);
          //if ($('#resetHandle').css('display') == 'none') {
          //  d3.select('#pullRemove').style('display', 'block');
          //}
        })
        .on("pointerleave", function (ev: any) {
          d3.select(ev).classed('active', false);
          //d3.select('#pullRemove').style('display', 'none');
        }).on('click', ()=> {})
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
        .on('pointerenter', function (ev: any,d:any) { d3.select(ev).classed('active', true); })
        .on('pointerleave', function (ev: any, d: any) { d3.select(ev).classed('active', false); });
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
       atext.append('path')
       .attr('d', pathData)
       .attr('fill', 'white');
        
      /******* Tooltip *******/
      circles.append('circle')
        .attr('r', 16)
        .attr('class', 'handle')
        .style('stroke', 'var(--theme-def-bg)')
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
        .on('click', function (d) {
        });

      var roTicker = d3.selectAll("#erfScoreCircle").select("#slider").select("#holder").select("#ticks");
      roTicker.select(".tick0").select("text").text('')
      roTicker.select(".tick100").select("text").text('')
      roTicker.select(".tick0").select("line").remove();
      roTicker.select(".tick100").select("line").remove();
    }
    function dragmoveHandles(ev: any, d: any) {
      if (d.label == 'e') {
        //var coordinates = d3.pointer(svg.node());
        //var x = coordinates[0] - radius;
        //var y = coordinates[1] - radius;
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
        //path = that.checkSliderPath(dvalue);
      } else {
        //var coordinates1 = d3.pointer(svg.node());
        //var xx = coordinates1[0] - radius;
        //var yy = coordinates1[1] - radius;
        var coordinaters1 = d3.pointers(ev, svg.node());
        var xx = coordinaters1[0][0] - radius;
        var yy = coordinaters1[0][1] - radius;
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
        //path1 = that.checkSliderPath1(dvalue);
      }
    }
    function updateArc() {
      var handlerContainer = d3.selectAll("#erfScoreCircle").selectAll('#handles .handlercontainer'); //select all handles
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
      allHandles.each(function (d: any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      dragLiveData = currentData;
    }

    function updateHandles(dd: any) {
     
      if (dd.label == 'a') {
        a1Value = dd.value;
        var endvalue = dd.value;
        that.c_remaining_slide1_range_max = endvalue + "%";
        that.c_input_slide1_range_max = endvalue; /// slider Drag on change -- 28
        d3.select('.c_remaining_slide1_range_max').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#erfScoreCircle").select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius) * -1 + ')');
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

        d3.selectAll("#erfScoreCircle").select('#gradArc').select('.circle_overlay_alt')
          .attr('stroke-dasharray', (dragalternate) + " " + '100').style('display', 'block');
        if (dd.value > 0 && dd.value < 100) {
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1").style('display', 'block').attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .text(dd.value.toFixed(0) + '%');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #atooltip").style('display', 'block');
        } else {
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1").style('display', 'none').text('');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #atooltip").style('display', 'none');
        }

      }
      //&& ((a2Value < (a1Value)) || a2Value == 0)
      //// Left drag
      if (dd.label == 'e') {
        a2Value = dd.value;
        var endvalue = dd.value;
        that.c_remaining_slide1_range_min = endvalue + "%";
        that.c_input_slide1_range_min = endvalue; /// slider Drag on change -- 28
        d3.select('.c_remaining_slide1_range_min').style('font-family', 'var(--ff-semibold)').style('font-size', '12px');
        d3.selectAll("#erfScoreCircle").select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius-2) * -1 + ')');
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
        d3.selectAll("#erfScoreCircle").select('#gradArc').select('.circle_overlay')
          .attr('stroke-dasharray', (a2Value) + " " + '100').style('display', 'block');
        if (dd.value > 0) {
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'block').text(dd.value.toFixed(0) + '%');
           d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtextinner").attr("transform", "rotate(0)").style('display', 'block');
          d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1inner").attr("transform", "rotate(0)").text('>');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #etooltip").style('display', 'block');

        } else {
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
            .style('display', 'none').text('');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtextinner")
            .style('display', 'none');
          d3.selectAll("#erfScoreCircle").selectAll(".a2 #etooltip").style('display', 'none');
        }
      }
      that.sharedData.showMatLoader.next(false);
      //d3.selectAll("#erfScoreCircle").select('.a1').select('#sliderHandleLoader').remove();
      //d3.selectAll("#erfScoreCircle").select('.a1').select('text').remove();
      that.onDragRem(dd);
    }
    function checkHandlesPosition() {
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d:any) { currentData[d.label] = d.value; currentData[d.label + "Angle"] = d.angle; });
      var ddmin: any = d3.min([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      var ddmax: any = d3.max([parseInt(currentData.e.toFixed(0)), parseInt(currentData.a.toFixed(0))]);
      var tempfacter = that.cusIndexService.PostStrategyFactorsData.value.map((a:any) => ({ ...a }));
      var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == that.factorid);
      var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == that.factorid);
      var checkPro: boolean = true;
      if (filterFactor.length > 0 && index > -1) {
        if (tempfacter[index].startval == ddmin && tempfacter[index].endval == (100 - ddmax)) { checkPro = false; }
      } else if (ddmin == sliderEndValue && ((100 - ddmax) == sliderInitValue || ddmax == 0)) { checkPro = false; }
      if (index == -1 && currentData.a == 100 && currentData.e == 0) {
        checkPro = false;
        d3.select("#erfScoreCircle").select('.applychanges').style('display', 'none');
      }
      if (checkPro) {
        writeTimeInfo(currentData);
        //d3.select("#erfScoreCircle").select('.applychanges').style('display', 'block');
      }
    }
  }

  SliderOnChange() {
    this.cusIndexService.getExclCompData().then((d: any) => {
      this.exclCompData = d;
      this.filcomp();
    });
  }

  filcomp() {
    var that = this;
    var gs = d3.select("#erfScoreCircle").select('#crlChart').select("#gCompetitive");
    gs.selectAll("g").selectAll("text").classed('AVHideTxt', true);
    gs.selectAll("g").each((d: any) => {
      var dt = that.exclCompData.filter((xu: any) => xu.stockKey == d.stockKey);
      if (dt.length > 0) {
        var sid = "#st_" + d.stockKey;
        gs.select(sid).selectAll("text").classed('AVHideTxt', false);
      }
    })
    /*** Market cap lines Competitive companies ****/
    var comp = d3.select("#erfScoreCircle").select('#crlChart').select(".compList").selectAll('.comp');
    comp.classed('hiderect', true);
    comp.each((d: any) => {
      var dt = that.exclCompData.filter((xu: any) => xu.isin == d.isin);
      if (dt.length > 0) {
        var name = "#" + d.isin + "_compRect";
        d3.select("#erfScoreCircle").select('#crlChart').select(".compList").select(name).classed('hiderect', false);
      }
    })
    /*** Market cap lines Competitive companies ****/
    that.showHideEntBtn = false;
    that.showanaLoading = false;
  }

  SliderOnChangeByVal() {
    this.cusIndexService.getExclCompData().then((d: any) => {
      this.exclCompData = d;
      this.filcomp();
    });
  }

  saveFactorsStrateg(reset: boolean = false) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var dmin = d3.min([this.SSRValueStart, this.SSRValueEnd]);
    var dmax = d3.max([this.SSRValueStart, this.SSRValueEnd]);
    if (this.switchTabName_P == 'percent') {
      dmin = this.SSRValueStart;
      dmax = this.SSRValueEnd;
      if (dmax == 0) { dmax = 100 }
    }
    let slist = [];
    slist = this.cusIndexService.strategyList.value;
    var no = this.cusIndexService.currentSNo.value;
    var clist = this.cusIndexService.strategyList.value.filter((x:any) => x.rowno == no);
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
            "endval": ((this.switchTabName_P == 'val') ? dmax : 100),
            "perorval": ((this.switchTabName_P == 'val') ? 1 : 0),
            "status": 'A',
            "name": that.factdata['name'],
            "displayname": that.factdata['displayname'],
            "orgTopValue": this.orgTopValue,
            "orgBottomValue": this.orgBottomValue,
            "orgTopPct": 0.0,
            "orgBottomPct": 100.0,
          };
          var tempfacter = this.cusIndexService.PostStrategyFactorsData.value.map((a:any) => ({ ...a }));
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
            tempfacter[index]['endval'] = ((this.switchTabName_P == 'val') ? dmax : 100);
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
    this.cusIndexService.alphaFactorChangeDetection.next({ type: "C", flag: true });
    this.cusIndexService.applyTrigger.next(true);
  }


  numberWithCommas(x:any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  //resetSlider() {
  //  let that = this;
  //  //that.sharedData.showMatLoader.next(true);
  //  setTimeout(function () {
  //    $('#resetSearch2').val('');
  //    that.dragStarted = false;
  //    that.checkModalOpen = false;
  //    that.showSlider2 = false;
  //    that.SSRValueStart = 0;
  //    that.SSRValueEnd = 100;
  //    d3.select("#erfScoreCircle").select('#resetAL').style('display', 'none');
  //    d3.select("#showSwitch_popup").style('display', 'none');
  //    if (that.switchTabName_P == 'val') {
  //      that.circleRangeByVal({ "start": -1, "end": -1 });
  //      that.saveFactorsStrateg(true);
  //      that.SliderOnChangeByVal(true);
  //    } else {
  //      that.circleRangeByPer({ "start": 0, "end": 100 });
  //      that.saveFactorsStrateg(true);
  //      that.SliderOnChange(true);
  //    }
  //    d3.selectAll('.animateCircle').style('display', 'block');
  //    d3.select('.leftGrid_drag').style('display', 'block');
  //    d3.select('.rightGrid_drag').style('display', 'none');
  //    d3.selectAll("#erfScoreCircle").selectAll(".sliderDisp").style("display", "block");
  //    d3.selectAll("#erfScoreCircle").selectAll("#pullRemove").style("display", "block");
  //    d3.selectAll("#erfScoreCircle").select('#slider').raise();
  //    d3.selectAll("#erfScoreCircle").select('#handles').style('display', 'block');
  //    d3.selectAll("#erfScoreCircle").selectAll(".a1 #SHMtext1").text('');
  //    d3.selectAll("#erfScoreCircle").selectAll(".a2 #SHMtext").text('');
  //    that.closeapply_slider1();
  //    that.Slide_count = -1;
  //    that.exclControlRight();
  //    //that.cusIndexService.applyExcTrigger.next(true);
  //    that.cusIndexService.exclusionCompData.next(that.cusIndexService.exclusionCompData.value);
  //    d3.selectAll("#erfScoreCircle").select('#rightOverlay').attr('stroke-dasharray', '0 100').style('display', 'none');
  //    d3.selectAll("#erfScoreCircle").select('#leftOverlay').attr('stroke-dasharray', '0 100').style('display', 'none');
  //    $('#erfScoreCircle .sliderDispTicks').css('display', 'none');
  //  }.bind(this), 100);
  //}
  //cummulative_hover: boolean = false;
  switchTab1(e: any) { }
  hoverTabsenter() {
    $('.hoverTabsShow .openTabsShow').show();
  }
  hoverTabsleave() {
    $('.hoverTabsShow .openTabsShow').hide();
  }
  switchTab(e:any) {
    this.switchTabName = e;
    $('.hoverTabsShow .openTabsShow').hide();
    var mTag = d3.select('#erfScoreCircle .slider3');
    //try { this.getAnalysis(); } catch (e) { }
    if (e == 'annual') {
      mTag.select('.cum_active').style('display', 'none');
      mTag.select('.ann_active').style('display', 'block');
      mTag.select('.STh_mid_1').select('.ann').style('cursor', 'auto');
      mTag.select('.STh_mid_1').select('.ann').select('text').style('fill', '#fff').style('font-size', '10px').style('text-anchor', 'middle');
      mTag.select('.STh_mid_1').select('.ann').select('rect').attr('style', 'fill: var(--clkdIndex) !important;');
      mTag.select('.STh_mid_1').select('.cum').style('cursor', 'pointer');
      mTag.select('.STh_mid_1').select('.cum').select('text').attr('style', 'fill: #7f85f5 !important;font-size:10px;text-anchor:middle;');// slider Drag on change -- 28
      mTag.select('.STh_mid_1').select('.cum').select('rect').attr('style', 'fill: var(--topnavbarBgColor) !important;');
    }
    else {
      mTag.select('.cum_active').style('display', 'block');
      mTag.select('.ann_active').style('display', 'none');
      mTag.select('.STh_mid_1').select('.ann').style('cursor', 'pointer');
      mTag.select('.STh_mid_1').select('.ann').select('text').attr('style', 'fill: #7f85f5 !important;font-size:10px;text-anchor:middle;');// slider Drag on change -- 28
      mTag.select('.STh_mid_1').select('.ann').select('rect').attr('style', 'fill: var(--topnavbarBgColor) !important;');
      mTag.select('.STh_mid_1').select('.cum').style('cursor', 'auto');
      mTag.select('.STh_mid_1').select('.cum').select('text').style('fill', '#fff').style('font-size', '10px').style('text-anchor', 'middle');
      mTag.select('.STh_mid_1').select('.cum').select('rect').attr('style', 'fill: var(--clkdIndex) !important;');
    }
  }
  checkcompTrans() {
    let type = 2;
    if (isNullOrUndefined(this.cusIndexService._selCompany) || this.cusIndexService._selCompany.SelISIN == "") { type = 2 }
    else if ($('#fil_STW_Price').css('display') != 'none') { type = 4 }
    else if ((this.sharedData._uname.indexOf('technogradient.com') > -1) || (this.sharedData._uname.indexOf('newagealpha.com') > -1)) {
      if ($('#fil_STW_Price').css('display') != 'none') { type = 3 }
      else { type = 2 }
    } else { type = 2 }
    return type;
  }

  openImpliedRevenue() {
    var selcomp: any = this.cusIndexService.selCompany.value;
    if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['isin'])) {
      var newSel: any = [...this.sharedData._selResData].filter((x: any) => x.aisin == selcomp['isin']);
      if (newSel.length > 0) {
        try {
          var title = 'Index Implied Revenue';
          var options = {
            from: 'equityUniverse',
            error: 'Implied Revenue',
            destination: 'Implied Revenue Popup',
            selComp: newSel[0],
            CType: 'MC'
          }

          this.dialog.open(ImpliedRevenueComponent, {
            width: "80%", height: "90%", maxWidth: "100%", maxHeight: "90vh",panelClass: 'impliedRevenueDialog',
            data: { dialogTitle: title, dialogSource: options }
          })
        } catch (e) { console.log(e) }
      }
    }
  }

  onDragRem(d: any) {
    var that = this;
    const dAngle = isNotNullOrUndefined(d?.angle) ? d.angle : null;
    d3.select('#gCompetitive').selectAll('.AVHideTxt').classed('AVHideTxt', false);
    const checkAndToggle = (elements: d3.Selection<any, any, any, any>, hideText: boolean) => {
      elements.nodes().forEach((el: any) => {
        const data: any = d3.select(el).data();
        const angle = data?.[0]?.cx;
        if (isNotNullOrUndefined(dAngle) && isNotNullOrUndefined(angle) && (dAngle - 90) <= angle) {
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
