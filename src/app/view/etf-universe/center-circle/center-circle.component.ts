import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { DataService } from '../../../core/services/data/data.service';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';
declare var $: any;
import * as d3 from 'd3';
import { LineChartComponent } from '../../universeDialogsModule/line-chart/line-chart.component';
import { MatDialog } from '@angular/material/dialog';
import { ImpliedRevenueComponent } from '../../universeDialogsModule/implied-revenue/implied-revenue.component';
import { DirectIndexService } from '../../../core/services/moduleService/direct-index.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'etfCenterCircle',
  templateUrl: './center-circle.component.html',
  styleUrl: './center-circle.component.scss'
})
export class CenterCircleComponent implements OnInit, OnDestroy {
  showWlcmHome: boolean = true;
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  radius: number = 150;
  SRValue: number = 0;
  circleCount: number = 0;
  subscriptions = new Subscription();
  breadcrumbdata: any = [];
  rightGridData: any = [];
  componentsCount:any;
  uname: any;
  //showHFCompanyRanges: any = { selectedPin: false, UOpricestockPin: false, range0_25: false, range25_50: false, range50_75: false, range75_100: false };
  MedTxtColor: string = "#3a4f7b";
  selectedClickedSelcomp: boolean = false;
  showCumAnnSlider: boolean = false;
  asOfDate: string = "-";

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (((this.uname.indexOf('technogradient.com') > -1) || (this.uname.indexOf('newagealpha.com') > -1)) && isNotNullOrUndefined(e['keyCode']) && e['keyCode'] == 65 && isNotNullOrUndefined(e['ctrlKey']) && isNotNullOrUndefined(e['shiftKey']) && e['ctrlKey'] == false && e['shiftKey'] == true
      && isNotNullOrUndefined(e['target']['localName']) && e['target']['localName'] != "input") {
      if (this.SRValue == 0 || this.SRValue == 100) {
        d3.select('.sliderDispTicks').style('display', 'block');
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: any) {
    if (isNotNullOrUndefined(e['keyCode']) && e['keyCode'] == 65) {
      if (this.SRValue == 0 || this.SRValue == 100) {
        d3.select('.sliderDispTicks').style('display', 'none');
      }
    }
  }

  impRevValue: number = 0;
  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;
  constructor(public dialog: MatDialog, public sharedData: SharedDataService, public etfService: EtfsUniverseService, public dirIndexService: DirectIndexService,
    private logger: LoggerService, public dataService: DataService, private toastr: ToastrService) {
    var that = this;
    var currentUser = JSON.parse(sessionStorage['currentUser']);
    if (isNotNullOrUndefined(currentUser)) { this.uname = atob(atob(atob(currentUser.username))); }
    this.filteredOptions = that.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that._filter(res || undefined)));
  }
  ngOnInit() {
    var that = this;
    this.sharedData.FillAlloclist();
    var breadcrumbdata: any = this.etfService.breadcrumbdata.subscribe((res: any) => {
      this.breadcrumbdata = [...res];
      if (!this.etfService.checkFillCompCreation()) { that.etfService.selComp.next(undefined) }
      if (this.Slide_count == 3 || that.etfService._SRValue > 0) {
        this.resetSlider();
      }
      this.Slide_count = 0;
      try { this.controlLeft(); } catch (e) { }
      d3.selectAll("#defCenCircle").selectAll("#gradArcLine").remove();
      this.fillSectorName();
      this.glbSearch.reset();
    });
    this.subscriptions.add(breadcrumbdata);
    this.fillSectorName();
    var SRValue: any = this.etfService.SRValue.subscribe((res: any) => {
      this.SRValue = res;
      if (isNotNullOrUndefined(res) && res < 100 && res > 0) { 
        this.circleCount = this.rightGridData.length;
        //console.log(this.circleCount,'circleCount')
        this.componentsCount=this.rightGridData.length;
        const atext=  d3.select('#defCenCircle').selectAll('.total_components .header').text("Components: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(this.circleCount + " / " + this.componentsCount)
      }
    });
    this.subscriptions.add(SRValue);

    var rightGridData: any = this.etfService.rightGridData.subscribe((res: any) => {
      if (isNullOrUndefined(res)) {
        this.rightGridData = [];
        d3.select("#defCenCircle #crlChart").select("#gCompetitive").remove();
        d3.select("#defCenCircle #crlChart").select("#defaultgCompetitiveRect").remove();
        d3.select("#defCenCircle #crlChart").select(".compList ").selectAll('g').remove();
      } else {
      this.rightGridData = [...res];
      this.etfService.SRValue.next(0);
      this.loadCircleData([...res]);
      this.slider1Txts([...res]);
      this.checkoverpricedVal([...res]);
    }
    });
    this.subscriptions.add(rightGridData);
    var performanceData = this.etfService.performanceUIndexList.subscribe(res => {

      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.showCumAnnSlider = true;
        this.checkreturnAsOfDate(res);
      }


    }, error => { });
    this.subscriptions.add(performanceData);
    var selCompany: any = this.etfService.selComp.subscribe((selComp: any) => {
      if (isNotNullOrUndefined(selComp)) {
        if (this.etfService._SRValue > 0 && this.etfService._SRValue < 100 && this.sharedData.checkMenuPer(2028, 2248) == 'Y' &&
          isNotNullOrUndefined(this.etfService._selGICS['group']) && this.etfService._selGICS['group'] == "ETFIndex") {
          this.resetSlider();
          if (this.etfService.rightGridData.value > 19) {
            d3.selectAll(".sliderDisp").style("display", "block");
          }
        }
      
        this.etfService.rightGridData.pipe(first()).subscribe(rGData => {
          that.Slide_count = 1;
          that.controlLeft();
          this.creatClockSlider(rGData, selComp);
        })
      } else {
        d3.selectAll('#cSlider').remove();
        this.selectedClickedSelcomp = false;
      }
      this.glbSearch.reset();
    });
    this.subscriptions.add(selCompany);
    var move_defaultAccount = this.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(move_defaultAccount);
    var linechart: any = this.etfService.triggerCumulativeLinechart.subscribe((res: any) => { if (res) { this.openLineChart(); this.etfService.triggerCumulativeLinechart.next(false); } });
    this.subscriptions.add(linechart);
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    if (checkError.destination == 'resetDrag') { this.resetSlider(); }
  }
  slider1Txts(data: any) {
    var that = this;
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(this.etfService._selGICS)) {
      this.circleCount = data.length;
      this.componentsCount=data.length;
      setTimeout(() => {
        const atext=  d3.select('#defCenCircle').selectAll('.total_components .header').text("Components: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(this.circleCount + " / " + this.componentsCount)
      }, 200);

      var medTxt: any = this.etfService._selGICS['med'];
      var med: any = d3.format(".1f")(medTxt);
      var color = this.etfService.checkMedColor(data, med);
      d3.selectAll("#defCenCircle .med__value").text(med).style("fill", function () { return that.cl(color); });
      
    } else {
      var medTxt: any = d3.median(this.sharedData._selResData.map((x: any) => x.score));
      this.circleCount = 0;
      // this.circleCount = this.sharedData._selResData.length;
      var med: any = d3.format(".1f")(medTxt);
      d3.selectAll("#defCenCircle .med__value").text(med).style("fill", function () { return that.cl(0); });
    };
  }
  fillSectorName() {
    var that = this;
    var Bdata = that.breadcrumbdata[that.breadcrumbdata.length - 1];
    if (isNotNullOrUndefined(Bdata)) {
      var selectSectorName = that.breadcrumbdata[that.breadcrumbdata.length - 1].name.trim();
      d3.selectAll(".slider1 .mainsectorTxt .med__title").text(selectSectorName)
        .attr('y', function () { if ((selectSectorName.length) > 15) { if ((selectSectorName.length) > 30) { return '115' } else { return '125' } } else { return '140' } })
        .style('font-size', function () { if ((selectSectorName.length) > 20) { if ((selectSectorName.length) >= 28) { return '16px' } else { return '18px' } } else { if ((selectSectorName.length) >= 10) { return '22px' } else { return '30px' } } })
        .call(that.sharedData.Crlwrapping, 190, "top");
    } else {
      var selectSectorNameD = "ETFs";
      d3.selectAll(".slider1 .mainsectorTxt .med__title").text(selectSectorNameD)
        .attr('y', function () { if ((selectSectorNameD.length) > 20) { return '125' } else { return '140' } })
        .style('font-size', function () { if ((selectSectorNameD.length) > 20) { return '18px' } else { if ((selectSectorNameD.length) >= 10) { return '22px' } else { return '30px' } } })
        .call(that.sharedData.Crlwrapping, 180, "top");
    }
  }
  checkoverpricedVal(resultData: any) {
    d3.select("#tdecileCount1").text(resultData.filter((x: any) => x.score >= 0 && x.score <= 50).length);
    d3.select("#tdecileCount2").text(resultData.filter((x: any) => x.score >= 50 && x.score <= 100).length);
  }
  returnAsOfDate: string = '';
  checkreturnAsOfDate(d: any) {
    var data: any = d;
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['sinceDate']) && isNotNullOrUndefined(data[0]['date'])) {
      this.returnAsOfDate = data[0]['sinceDate'] + ' to ' + data[0]['date'];
    } else { this.returnAsOfDate = '' }
  }
  excessCumReturns: any;
  excessAnnReturns: any;
  getAnalysis(data: any) {
    var d = this.etfService._SRValue;
    var filt = data;
    var c_remaining = "BP_Cbottom" + d + "Rtn";
    var cum_removed = (filt[0][c_remaining] - filt[0]["BP_Cbottom100Rtn"]).toFixed(2);
    this.excessCumReturns = cum_removed;
    var A_remaining = "BP_Abottom" + d + "Rtn";
    var annu_removed = (filt[0][A_remaining] - filt[0]["BP_Abottom100Rtn"]).toFixed(2);
    this.excessAnnReturns = annu_removed;
  }
  checkBoxFill(range: any) { return this.etfService.showHFCompanyRanges[range]; };

  creatClockSlider(dta: any, selComp: any) {
    let that = this;
    d3.selectAll("#cSlider").remove();
    if (isNotNullOrUndefined(selComp['price'])) {
      this.STW_Pricecurrency = (isNotNullOrUndefined(selComp['currency']) ? selComp['currency'] : '') + ' ' + d3.format(",.1f")(selComp['price']) ;
    }    
    if (isNotNullOrUndefined(selComp['impRev'])) { this.impRevValue = selComp['impRev']; }
    else { this.impRevValue = 0; }
    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d; });

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var da = dta.filter((x: any) => x.stockKey == selComp.stockKey);
      if (da.length > 0) { selComp = da[0]; }
    }

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      //this.Slide_count = 0;
      //this.releaseToolGraph = true;
      //this.controlLeft();
      var r: any = that.radius;
      d3.selectAll("#cSlider").remove();
      var g = d3.select("#crlChart").append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')').on('mousedown', onDown).on("touchstart", onDown)
        .on("pointerenter", function (eve) { if (d3.selectAll("#gCompMOver").style("display") != 'none') { d3.selectAll("#gCompMOver").style("display", 'none') } });

      g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 3).attr("width", 50).attr("fill", "#767676");

      g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (25)).attr("height", "42").attr("width", "125").style("display", "none");

      g.append("text").attr("class", "sText").attr("x", + r + (40)).attr("y", -3).style("font-family", 'var(--ff-medium)').style("font-size", "9px")
        .style("display", "none").text("0.00");

      g.append("text").attr("class", "sText1").attr("x", + r + (40)).attr("y", 9).style("display", "none")
        .style("font-size", "8px").attr("fill", "var(--leftSideText-B)").style("font-family", 'var(--ff-medium)').text("0.00"); 

      var cancelX = parseInt(r) + parseInt('170');
      var cancelBtn = g.append("g").attr('id', 'cSliderCancel').style('display', 'none').attr('transform', 'translate(' + (cancelX) + ',0)');
      cancelBtn.append("g").attr('transform', 'scale(0.03)').append("path").attr('fill', 'var(--prim-button-color)').attr("class", "bg")
        .attr('d', 'M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085 c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z');
      cancelBtn.select('g').append("path").attr('fill', 'var(--primary-color)').attr("class", "bg_stroke")
        .attr('d', 'M277.042,248.082l72.528-84.196c7.91-9.182,6.876-23.041-2.31-30.951  c-9.172-7.904-23.032-6.876-30.947,2.306l-68.236,79.212l-68.229-79.212c-7.91-9.188-21.771-10.216-30.954-2.306  c-9.186,7.91-10.214,21.77-2.304,30.951l72.522,84.196l-72.522,84.192c-7.91,9.182-6.882,23.041,2.304,30.951  c4.143,3.569,9.241,5.318,14.316,5.318c6.161,0,12.294-2.586,16.638-7.624l68.229-79.212l68.236,79.212  c4.338,5.041,10.47,7.624,16.637,7.624c5.069,0,10.168-1.749,14.311-5.318c9.186-7.91,10.22-21.77,2.31-30.951L277.042,248.082z');
      var data;
      function onDown() { data = d3.selectAll(".compList[style='display: block;']").selectAll(".comp").data(); }
      this.SetClockHandle(dta, selComp);
    }
  }

  checkHandleIndex(d: any) {
    var dt = [...this.etfService.rightGridData.value].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    return selIndex + 1 + "/" + dt.length;
  }

  SetClockHandle(data: any, d: any, type: boolean = false) {
    let that = this;
    let txt = d.companyName;
    var rank = this.checkHandleIndex(d);
    let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%  [" + rank + "]";
    if (txt1.length > 24) { txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%  [" + rank.split('/')[0] + "]"; }
    if ((d.companyName.length) > 18) { txt = d.companyName.slice(0, 18).trim() + "..."; }
    let val = d.cx;
    var r: any = that.radius;
    d3.select("#cSlider").attr('transform', 'rotate(' + val + ')');
    d3.select("#cSlider").select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.sharedData.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 47) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        return "var(--leftSideText-B)";
        //if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        //else { return that.cl(d.score + 1); }
      });

    d3.select("#cSlider").select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.sharedData.measureText(txt1, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 40) * -1) : "190";
      })
      .attr("fill", function () {
        return "var(--leftSideText-B)";
        //if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        //else { return that.cl(d.score + 1); }
      })
      .style("font-size", function () {
        if (txt1.length > 24) {
          return '8px'
        }
        else {
          return '8px'
        }
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })

    const slide: any = d3.select("#cSlider").select(".sText");
    var bbox: any = slide.node().getBBox();
    var bboxH: any = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    d3.select("#cSlider").select(".sRect")
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
    d3.select("#cSlider").select("#cSliderCancel").attr('transform', 'translate(' + (171 + (cancelX)) + ',' + (-((bboxH / 4) - 3)) + ')');
    d3.select("#cSlider").select("#cSliderCancel").on('click', function () {
      that.etfService.selComp.next(undefined);
      try {
        that.sharedData.userEventTrack('ETF Universe', that.etfService._selGICS.name, that.etfService._SRValue, 'company remove icon click');
      } catch (e) { }
      //that.sharedData.getLvlGridsData.pipe(first()).subscribe(data => {
      //  that.sharedData.leftGridData.next(data['menuData']);
      //  that.sharedData.rightGridData.next(data['CompanyList']);
      //});
      //that.Slide_count = 0;
      //that.controlLeft();
    });
    d3.select("#cSlider").on('pointerenter', function () { d3.select("#cSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('mousemove', function () { d3.select("#cSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('pointerleave', function () { d3.select("#cSlider").select("#cSliderCancel").style('display', 'none'); })

    d3.select("#cSlider").select(".sTextReverse").attr("fill", "#fff").style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function (): any {
        if (bboxH == 40) { return -(bboxH + 0); }
        else if (bboxH < 50) { return -(bboxH - 3); }
        else if (bboxH > 50) { return -(bboxH - 15); }
      }).attr("y", -(calW + 17));
    d3.select("#cSlider").style('display', 'block').raise();
    d3.select('#alertIco').classed("icon_active", true).style('display', 'block');
    var midtxt = d.companyName + " (" + d.ticker + ") ";

    if (d.companyName.length > 25) { midtxt = d.companyName.slice(0, 17) + "... (" + d.ticker + ") "; }

    d3.select('.Sel_midCompS1').select('.SelCompName').attr('text-anchor', 'middle').attr('fill', 'var(--prim-button-color)')
      .style('font-family', 'var(--ff-semibold)')
      .text(midtxt)
      .attr('y', function () { if ((midtxt.length) > 20) { if ((midtxt.length) > 30) { return '10' } else { return '13' } } else { if ((midtxt.length) >= 8) { return '15' } else { return '18' } } })
      .style('font-size', function () { if ((midtxt.length) > 20) { return '14px' } else { if ((midtxt.length) >= 8) { return '16px' } else { return '16px' } } })
      .call(that.sharedData.Crlwrapping, 200, "top");
    var medVel: any = d3.format(".1f")(d.score);
    //if (this.sharedData.showCircleColor.value) {
    var colorVal = that.checkHandleColor(that.etfService.rightGridData.value, d);
    if (type) { colorVal = that.checkHandleColor(data, d); };
    d3.select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", '#d8dce5')
      .text(medVel + "%");
    d3.select('#cSlider').select('.sRect1').style("fill", colorVal);
    d3.select('#cSlider').select('.sRect').attr("stroke-width", 1).style("stroke", colorVal)
    //} else {
    //  d3.select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", '#d8dce5')
    //    .text(medVel + "%");
    //  d3.select('#cSlider').select('.sRect1')
    //    .style("fill", function () { return that.cl(medVel + 1); })
    //  d3.select('#cSlider').select('.sRect').attr("stroke-width", 1)
    //    .style("stroke", function () { return that.cl(medVel + 1); })
    //}
    d3.select('.Sel_midCompS1').select('.compRank').text(rank);
    this.selectedClickedSelcomp = true;
    this.selectedCompName = midtxt;
    this.selectedProbability = d3.format(".1f")(d.score)+'%';
    this.selectedRank = rank;
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  //loadCircleData(data: any) {
  //  this.creatGradienArc('#defCenCircle');
  //  this.CreateComps('#defCenCircle', data, "lvl1");
  //  if (this.etfService.checkFillCompCreation()) { this.fillCompetives([...data]); }
  //  else {
  //    d3.selectAll('#cSlider').remove();
  //    d3.select("#defCenCircle #crlChart").select("#gCompetitive").remove();
  //    d3.select("#defCenCircle #crlChart").select("#defaultgCompetitiveRect").remove();
  //  };
  //  if (data.length >= 30 && isNotNullOrUndefined(this.etfService._selGICS['group']) &&
  //    this.etfService._selGICS['group'] =="ETFIndex") { this.circleRange({ "start": 0, "end": 100 }); }
  //  else { d3.selectAll("#slider").remove(); }
  //}
  loadCircleData(data: any) {
    this.creatGradienArc('#defCenCircle');
    this.CreateComps('#defCenCircle', data, "lvl1");
    this.fillCompetives([...data]);
    //if (this.etfService.checkFillCompCreation()) { this.fillCompetives([...data]); }
    //else {
    //  d3.selectAll('#cSlider').remove();
    //  d3.select("#defCenCircle #crlChart").select("#gCompetitive").remove();
    //  d3.select("#defCenCircle #crlChart").select("#defaultgCompetitiveRect").remove();
    //};
    var indexGroup: boolean = false;
    if (isNotNullOrUndefined(this.etfService._breadcrumbdata) && this.etfService._breadcrumbdata.length > 0) {
      if (this.etfService._breadcrumbdata[this.etfService._breadcrumbdata.length - 1]['group'] == 'ETFIndex') { indexGroup = true; }
    }
    if (indexGroup && data.length >= 19 && this.etfService.checkFillCompCreation() && this.sharedData.checkMenuPer(2028, 2248) == 'Y') {
      this.circleRange({ "start": 0, "end": 100 });
      try { this.checkTickerLine(); } catch (e) { }
    }
    else {
      d3.selectAll("#slider").remove();
      d3.selectAll("#defCenCircle .text-drag").style('display', 'none');
      d3.select('#resetAL').style('display', 'none');
    }

    d3.select("#defCenCircle #decile1").text(data.filter((x: any) => (x.hfScores * 100) > 0 && (x.hfScores * 100) <= 25).length);
    d3.select("#defCenCircle #decile2").text(data.filter((x: any) => (x.hfScores * 100) > 25 && (x.hfScores * 100) <= 50).length);
    d3.select("#defCenCircle #decile3").text(data.filter((x: any) => (x.hfScores * 100) > 50 && (x.hfScores * 100) <= 75).length);
    d3.select("#defCenCircle #decile4").text(data.filter((x: any) => (x.hfScores * 100) > 75 && (x.hfScores * 100) <= 100).length);

  } 
   CreateComps(masterID: string, dta: any, lvl: string) {
    let that = this;
    var compLst: any;
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst' + lvl).remove();

    if (that.breadcrumbdata.length > 2) {
      compLst = oSvg.append("g").attr('class', 'compList show_comp_list compLst' + lvl).style("display", "block");
    } else {
      compLst = oSvg.append("g").attr('class', 'compList compLst' + lvl).style("display", "block");
    }
    if (dta != null && dta.length > 0 && (that.etfService.SRValue.value == 0 || that.etfService.SRValue.value == 100)) {
      var len = dta.length;
      dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }

     var addedCompanies: any[] = [];
     if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100 && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])) {
       addedCompanies = [...that.etfService._avoidLoserData['addedCompanies']];
     }

    d3.select("#gradArcLine").remove();
    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);
    var compg = compC.selectAll("g")
      .data(dta)
      .enter().append("g")
      .attr("class", "comp")
      .attr("transform", function (d: any) { return "rotate(" + (d.cx) + ")"; })
      .attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .on("pointerenter", function (ev: any, d: any) {
        d3.select(ev).raise();
        if (that.breadcrumbdata.length > 0) {
          d3.select("#gCircleSlider").style("display", "block");
        } else {
          d3.select(ev).select(".crect").classed("onrect", true);
          that.showCompOver(d);
        }
      }).style("display", (d: any) => {
        if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100 && isNotNullOrUndefined(d) && isNotNullOrUndefined(d['stockKey'])) {
          return (addedCompanies.filter((x: any) => x.stockKey == d['stockKey']).length == 0) ? "none" : "block"
        }
        return "block"
      }).on("pointerleave", function (ev: any, elemData: any) {
        d3.select("#gCompMOver").style("display", "none");
        d3.select("#gCompeOver").style("display", "none");
        d3.select(ev).select(".crect").classed("onrect", false);
        if (that.breadcrumbdata.length > 0) {
          d3.select("#gCircleSlider").style("display", "block");
        }
      });

     let SelRes = [...that.sharedData._selResData];
     if (SelRes.length ==0) { SelRes = [...that.etfService._rightGridData]; }
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
      .attr("class", function (d: any) {
        if (dta.length > 600) { return ("crect rectOpa " + that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges)); }
        else { return ("crect " + that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges)); }
      })
      .attr("fill", "#4b4b4b")
      .attr("x", that.radius + 3)
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
        return wtdwidth + 2;
      });

    that.HFCompanyArc();
    that.creatgArcLine(that.etfService._rightGridData);
    if (this.breadcrumbdata.length > 0) {
      var filterDate = [...this.breadcrumbdata].filter(x => x.group == 'ETFIndex');
      if (filterDate.length > 0 && isNotNullOrUndefined(filterDate[0]['holdingsdate'])) {
        var d = new Date(filterDate[0]['holdingsdate']);
        var dateMerge = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
        this.asOfDate = dateMerge;
      } else {
        this.asOfDate = "-"
      }
    } else { this.asOfDate = "-" }
  }

  circleHFclick(key: string) {
    var that = this;
    if (key == 'selectedPin') {
      if (that.etfService.showHFCompanyRanges.range0_25 == true || that.etfService.showHFCompanyRanges.range25_50 == true ||
        that.etfService.showHFCompanyRanges.range50_75 == true || that.etfService.showHFCompanyRanges.range75_100 == true) {
        this.etfService.showHFCompanyRanges[key] = !this.etfService.showHFCompanyRanges[key];
        this.HFCompanyArc();
      }
      else {
        that.toastr.info('Select at least one range', '', { timeOut: 5000 });
      }
    } else {
      this.etfService.showHFCompanyRanges[key] = !this.etfService.showHFCompanyRanges[key];
      this.HFCompanyArc();
      if (that.etfService.showHFCompanyRanges.range0_25 == false && that.etfService.showHFCompanyRanges.range25_50 == false &&
        that.etfService.showHFCompanyRanges.range50_75 == false && that.etfService.showHFCompanyRanges.range75_100 == false) {
        this.etfService.showHFCompanyRanges['selectedPin'] = false;
      }
    }
  }

  creatgArcLine(value: any) {
    var that = this;
    var UOpricestockPin = that.etfService.showHFCompanyRanges.UOpricestockPin;
    if (isNotNullOrUndefined(value) && value.length > 0 && (this.Slide_count == 2 || UOpricestockPin)) {
      d3.selectAll("#defCenCircle").select("#gradArcLine").remove();
      var gArcLine = d3.select("#defCenCircle #crlChart").append("g").attr("id", "gradArcLine");
      gArcLine.selectAll('g').remove();
      try {
        var data_gArcMid = 50.0;// value[value.length - 1].score / 2;
        var data_gArcMiden = d3.median(value, function (d: any) { return d.score; });
        if (data_gArcMiden != undefined) {

          var gArcMiden_data: any = that.getAngle(value, data_gArcMiden);
          var gArcMid_data: any = that.getAngle(value, data_gArcMid);

          var gArcMiden = gArcLine.append("g").attr("id", "gArcMiden");
          gArcMiden.append('rect').attr('height', '3.5').attr('width', '25').attr('x', that.radius).attr('y', 0).style('fill', that.cl(data_gArcMiden))
            .attr('transform', function () {
              var trans: string;
              if (value.length <= 1) { trans = that.rotateAngle(value) } else { trans = that.rotateAngle(gArcMiden_data) }
              return trans;
            });

          if (gArcMiden_data.length <= 0) { gArcMiden_data = value; }
        }

        if (gArcMid_data.length > 0) {
          var Underpriced_text = 'Underpriced Stocks  >>';
          var Overpriced_text = '<<  Overpriced Stocks';

          var textAngle = parseFloat(that.rotateAngle(gArcMid_data).replace('rotate(', '').replace(')', ''));

          var UnderpriceArcSE = { 'start': 0.485, 'end': -1 };
          var OverpriceArcSE = { 'start': 0.68, 'end': 0.5 };

          if (textAngle < -75) { Underpriced_text = ''; }
          else if (textAngle < -55 && textAngle > -75) {
            UnderpriceArcSE = { 'start': 0.48, 'end': -1 };
            Underpriced_text = '>>';
          }
          else if (textAngle > 245) { Overpriced_text = '' }
          else if (textAngle < 245 && textAngle > 225) {
            OverpriceArcSE = { 'start': 0.55, 'end': 0.5 };
            Overpriced_text = '<<';
          }
          else {
            UnderpriceArcSE = { 'start': 0.485, 'end': -1 };
            OverpriceArcSE = { 'start': 0.71, 'end': 0.5 };
            Underpriced_text = 'Underpriced Stocks  >>';
            Overpriced_text = '<<  Overpriced Stocks';
          }

          var UnderpricedArc: any = d3.arc().outerRadius(this.radius - 12).innerRadius(this.radius - 18)
            .startAngle(Math.PI * (UnderpriceArcSE.start)).endAngle(Math.PI * (UnderpriceArcSE.end));

          var OverpricedArc: any = d3.arc().outerRadius(this.radius - 12).innerRadius(this.radius - 18)
            .startAngle(Math.PI * (OverpriceArcSE.start)).endAngle(Math.PI * (OverpriceArcSE.end));

          var Underpriced = gArcLine.append("g").attr("id", "Underpriced_Text").attr('transform', that.rotateAngle(gArcMid_data));
          Underpriced.append("defs").append("path").attr("id", "textPath").attr("d", UnderpricedArc);
          Underpriced.append("path").attr('fill', 'transparent').attr("d", UnderpricedArc);
          Underpriced.append("text").style("font-family", 'var(--ff-medium)').style("font-size", "6pt")
            .style("fill", "var(--leftSideText)").append("textPath").attr("xlink:href", "#textPath").text(Underpriced_text);

          var Overpriced = gArcLine.append("g").attr("id", "Overpriced_Text").attr('transform', that.rotateAngle(gArcMid_data));
          Overpriced.append("defs").append("path").attr("id", "textPath1").attr("d", OverpricedArc);
          Overpriced.append("path").attr('fill', 'transparent').attr("d", OverpricedArc);
          Overpriced.append("text").style("font-family", 'var(--ff-medium)').style("font-size", "6pt")
            .style("fill", "var(--leftSideText)").append("textPath").attr("xlink:href", "#textPath1").text(Overpriced_text);

          var gArcMid = gArcLine.append("g").attr("id", "gArcMid");
          gArcMid.append('rect').attr('height', '3').attr('width', '40').attr('x', that.radius - 18).attr('y', 0).style('fill', 'var(--prim-button-color)').attr('transform', that.rotateAngle(gArcMid_data));

          //that.sharedData.showCenterLoader_erf.next(false);
        }

      } catch (e) { }
    }

    if (this.etfService._SRValue > 0 && this.etfService._SRValue < 100) {
      d3.selectAll('#gradArcLine').select('#Underpriced_Text').remove();
      d3.selectAll('#gradArcLine').select('#Overpriced_Text').remove();
    }

    if (this.Slide_count != 2 && UOpricestockPin == false) { d3.selectAll("#defCenCircle #gradArcLine").remove(); }
  }

  HFCompanyArc() {
    let that = this;
    d3.selectAll("#defCenCircle .HF_active").classed("HF_active", false);
    if (that.etfService.showHFCompanyRanges.selectedPin || this.Slide_count == 1) {
      if (that.etfService.showHFCompanyRanges.range0_25 == true) { d3.selectAll("#defCenCircle .HFCompRange0_25").classed("HF_active", true); }
      if (that.etfService.showHFCompanyRanges.range25_50 == true) { d3.selectAll("#defCenCircle .HFCompRange25_50").classed("HF_active", true); }
      if (that.etfService.showHFCompanyRanges.range50_75 == true) { d3.selectAll("#defCenCircle .HFCompRange50_75").classed("HF_active", true); }
      if (that.etfService.showHFCompanyRanges.range75_100 == true) { d3.selectAll("#defCenCircle .HFCompRange75_100").classed("HF_active", true); }
    }
  }

  rotateAngle(data: any) {
    var d: any = {};
    if (data.length == 2) {
      d['cx'] = data[0].cx + ((data[1].cx - data[0].cx) / 2);
      d['cy'] = data[0].cy + ((data[1].cy - data[0].cy) / 2);
      d['rx'] = data[0].rx + ((data[1].rx - data[0].rx) / 2)
    }
    else if (data.length > 2 || data.length < 2) { d = data[0]; }
    if (d['cx'] <= 90) { return "rotate(" + (d['cx']) + ")"; }
    else { return "rotate(" + (d['cx']) + ")"; }

  }

  getAngle(value: any, data_gArcMiden: any) {
    var data = [];
    for (var i = 0; i < value.length - 1; i++) {
      var v1 = parseFloat(d3.format('.1f')(value[i].score));
      var v2 = parseFloat(d3.format('.1f')(value[value.length - 1].score));
      if (i < value.length - 1) { v2 = parseFloat(d3.format('.1f')(value[i + 1].score)); }
      var Miden = parseFloat(d3.format('.1f')(data_gArcMiden));
      if (Miden == v1) { data.push(value[i]) }
      else if (Miden > v1 && Miden < v2) {
        data.push(value[i]);
        data.push(value[i + 1]); break;
      }
    }
    return data;
  }


  creatGradienArc(masterID: string) {
    let that = this;
    //this.Slide_count = 0;
    //this.releaseToolGraph = true;
    //this.controlLeft();
    var data: any = [];
    var tempArcData: any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    data = [...tempArcData];

    if (data != null && data.length > 0) {
      var len = data.length;
      data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }

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

    if (data != null) { }

    var gCArcColor = d3.scaleLinear()
      .domain([0, 90, 91, 180, 181, 270, 271, 360])
      .range([0, 100, 0, 100, 0, 100, 0, 100])
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

    var Data3: any = data.filter((x: any) => x.cx >= 91 && x.cx <= 180);
    var linearG3: any = linearGradient.append("linearGradient");
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

    //// Dragged Gradient color
    gArc.append('path')
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
      .style('display', 'block')
    //gArc.append('path')
    //  .attr('class', 'circle_overlay2')
    //  .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
    //  .attr('stroke', '#fff')
    //  .attr('stroke-width', '0.1')
    //  .attr('stroke-linecap', 'butt')
    //  .style('transform', 'scale(8.0) translate(18px, -18px) rotateY(180deg)')
    //  .attr('stroke-dasharray', '100 100')
    //  .attr('fill', 'none')
    //  .style('display', 'block')
  }

  showCompOver(dat: any) {
    let that = this;
    d3.select("#defCenCircle #crlChart").select("#gCompeOver").remove();
    var gs = d3.select("#defCenCircle #crlChart").append("g").attr('id', "gCompeOver");
    var ggs = gs.append("g")
      .attr("transform", function () {
        if (dat.cx <= 90) { return "rotate(" + (dat.cx + 1.0) + ")"; }
        else { return "rotate(" + (dat.cx - 1.0) + ")"; }
      });

    ggs.append("text")
      .attr("x", function (d) { return that.sharedData.txtx1(dat); })
      .style("font-family", 'var(--ff-medium)')
      .style("fill", function (d) { return "#4b4b4b"; })
      .attr("transform", function (d) { return that.sharedData.txttrans(dat); })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(dat); })
      .attr("class", function (d) { return ""; })
      .text(function (d) { return d3.format(",.1f")(dat.scores * 100) + "%" });

    ggs.append("text")
      .attr("x", function (d) { return that.sharedData.txtx(dat); })
      .style("fill", function (d) { return "#4b4b4b"; })
      .attr("transform", function (d) { return that.sharedData.txttrans(dat); })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(dat); })
      .attr("class", function (d) { return ""; })
      .text(function (d) {
        var cName: string = (isNotNullOrUndefined(dat.companyName)) ? dat.companyName : "";
        let val = dat.cx
        if (val > 90) {
          let txt = " (" + dat.ticker + ") " + cName.trim() + "...";
          let resvtxt = " (" + dat.ticker + ") ...";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          return " (" + dat.ticker + ") " + cName.slice(0, (17 - rsvcnt)).trim() + "...";
        }
        else {
          let txt = cName.trim() + "... (" + dat.ticker + ")";
          let resvtxt1 = "... (" + dat.ticker + ")";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          return cName.slice(0, (17 - rsvcnt1)).trim() + "... (" + dat.ticker + ")";
        }
      });
  }

  clipPathCheck(CPName: string, type: string, masterID: string) {
    let msID = masterID.replaceAll('#', '');
    if (type == 'ID') { return msID + '' + CPName; }
    else { return "url(#" + msID + '' + CPName + ')'; }
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
    d3.select("#defCenCircle #crlChart").select("#gCompetitive").remove();
    d3.select("#defCenCircle #crlChart").select("#defaultgCompetitiveRect").remove();
    gs = d3.select("#defCenCircle").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#defCenCircle").select('#crlChart').append("g").attr("id", "defaultgCompetitiveRect");
    data = dta;


    gs.selectAll("g").remove();
    data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / data.length) - 90); return d });
    d3.select("#defCenCircle #decile1").text(data.filter((x: any) => (x.hfScores * 100) > 0 && (x.hfScores *100) <= 25).length);
    d3.select("#defCenCircle #decile2").text(data.filter((x: any) => (x.hfScores * 100) > 25 && (x.hfScores * 100) <= 50).length);
    d3.select("#defCenCircle #decile3").text(data.filter((x: any) => (x.hfScores * 100) > 50 && (x.hfScores * 100) <= 75).length);
    d3.select("#defCenCircle #decile4").text(data.filter((x: any) => (x.hfScores * 100) > 75 && (x.hfScores * 100) <= 100).length);

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) { sdata = data.filter(function (d: any, i: any) { if (i == 0 || (i % sublen) == 0) { return d; } }); }
    else { sdata = data; }
    //alert('came here');
    var ggs = gs.selectAll("g").data(sdata).enter().append("g")
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      })
      .style("opacity", function (d: any) {
        let opa = 1;
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { opa = 1; }
        return opa;
      });
    var grpG = ggs;
    grpG.append("text")
      .attr("x", function (d) { return that.sharedData.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", function (d: any): any {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; }
      })
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : "none" })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if ((that.etfService.SRValue.value > 0 && that.etfService.SRValue.value < 100) && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])
          && that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) { return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold"); }
        else {
          if (d.ALNaaIndex != 0) { return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " avbold ALNaaIndex" }
          else { return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " avbold"; }
        }
      }).text(function (d: any) { return d3.format(",.1f")(d.scores * 100) + "%" });

    grpG.append("text")
      .attr("x", function (d) { return that.sharedData.txtx(d); })
      .style("fill", function (d: any): any {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; }
      })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if ((that.etfService.SRValue.value > 0 && that.etfService.SRValue.value < 100) && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])
          && that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) {
          return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
        }
        else {
          if (d.ALNaaIndex != 0) { return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " ALNaaIndex "; }
          else {
            return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges);
          }
        }
      })
      .text(function (d: any) {
        var cName: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = cName.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 13 - rsvcnt;
          var dottxt = "";
          if (txt.length > 13) { dottxt = (data.length > fillMaxlen) ? "" : "..."; }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = cName.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });

    ggs.on("pointerenter", function (ev: any, d: any) {
      if (data.length > fillMaxlen) {
        d3.select("#defaultgCompetitiveRect").raise();
        d3.select("#cSlider").raise();
      } else {
        if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100) {
          if (that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
        } else if(dta.filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      }
    }).on("pointerleave", function (event, d) { d3.select(this).classed("on", false); });

    grpG.on("click", function (event: any, d: any) {
      that.etfService.selComp.next(d);
      that.resetSlider()
      try {
        that.sharedData.userEventTrack('ETF Universe', that.etfService._selGICS.name, d.ticker, 'company click');
      } catch (e) { }
    });
    that.HFCompanyArc();
    if (data.length > fillMaxlen) { that.fillCompetivesRect(dta); }
    else { d3.select("#defaultgCompetitiveRect").selectAll("g").remove(); };
    d3.select("#cSlider").raise();
    //if (that.etfService.showHFCompanyRanges[that.selHFCompanyPath].selectedPin == false && that.Slide_count != 1) { ggs.selectAll("text").classed("HF_active", false); }
    //that.sharedData.activeALNaaIndex(that.sharedData._indexCheckBtn);
    /**** Mat Loader ***/
    setTimeout(function () { that.sharedData.showMatLoader.next(false); }.bind(this), 500);
    /**** Mat Loader ***/
    if (dta.length < 100) { d3.select('#gCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }
  }

  fillmouseOver(d: any) {
    if (+this.etfService.SRValue.value > 0 && +this.etfService.SRValue.value < 100) {
      if (this.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.stockKey == d.stockKey).length > 0) { this.showCompMOver(d); }
      else { this.hideCompMOver(); }
    } else { if (this.breadcrumbdata.length > 0) { this.showCompMOver(d); }; }
  }

  fillmouseOut() { if (this.breadcrumbdata.length > 0) { this.hideCompMOver(); } };

  showCompMOver(dat: any) {
    let that = this;
    var checkSelIsin: boolean = isNullOrUndefined(this.etfService._selComp);
    var lengthofComp: any = null;
    var cName: string = (isNotNullOrUndefined(dat.companyName)) ? dat.companyName : "";
    let svgId = "#defCenCircle";
    if (isNotNullOrUndefined(dat) && checkSelIsin) {
      var homeScore1length = ((parseInt((cName + ' (' + dat.ticker + ')').length.toString()) / 2) / 3) * 17 + 5;
      lengthofComp = (cName.length) < 45 ? 165 : 170;
      if (parseInt(cName + ' (' + dat.ticker + ')') < 12) homeScore1length = 42;
      if (lengthofComp != null) {
        var lngth = cName + ' (' + dat.ticker + ')';
        d3.select(svgId).select('.Sel_midCompS1').style('opacity', 1);

        d3.select(svgId).selectAll('.homeScore1').attr("fill", "#333")
          .attr('y', function () { if ((lngth.length) > 50) { return "33" } else { return (lngth.length) < 22 ? "50" : "40"; } }).style('display', 'block')
          .text(cName + ' (' + dat.ticker + ')').call(that.sharedData.wrapping, 127, 1.2);
      }

      var midtxt = cName + ' (' + dat.ticker + ')';
      if (cName.length > 55) { midtxt = cName.slice(0, 52) + "... (" + dat.ticker + ") "; }
      d3.select('.Sel_midCompS1').select('.SelCompName').attr('text-anchor', 'middle').attr('fill', 'var(--prim-button-color)').style('font-size', function () { if ((midtxt.length) > 30) { return "13px" } else { return "13px"; } })
        .attr('y', function () { if ((midtxt.length) > 6) { return "4" } else { return (midtxt.length) < 22 ? "6" : "6"; } })
        .style('font-family', 'var(--ff-semibold)').text(midtxt).call(that.sharedData.Crlwrapping, 185, "top");

      var medVel: any = d3.format(".1f")(dat.scores * 100);
      var colorVal: any = that.checkHandleColor(that.etfService.rightGridData.value, dat);
      d3.select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", '#d8dce5')
        .style('font-family', "var(--ff-bold)").text(medVel + "%");

      d3.select('#cSlider').select('.sRect').attr("stroke-width", 1).style("stroke", function () { return that.cl(medVel + 1); }).style("fill", "var(--cardsHighlightColorDark)");
      d3.select('#cSlider').select('.sRect1').style("fill", colorVal);
      d3.select(svgId).selectAll('.homeScore2').style("fill", colorVal)
        .style('display', 'flex').text((parseFloat(dat.scores) * 100).toFixed(1));
      d3.select('#Movercircle').attr("fill", function (d) { return "#fff"; });
    }
    if (checkSelIsin) {
      d3.select('#defCenCircle').select('.Sel_midCompS1').style('opacity', 1);

      d3.select("#defCenCircle").select('.STw_middle').style('display', 'none');
    }
  }

  hideCompMOver() {
    var that = this;
    var checkSelIsin: boolean = isNullOrUndefined(this.etfService._selComp);
    if (checkSelIsin) {
      d3.select('#defCenCircle').select('.Sel_midCompS1').style('opacity', 0);
      d3.select("#defCenCircle").select('.STw_middle').style('display', 'block');
    }
  }

  checkHandleColor(data: any, d: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    return this.cl(per(selIndex));
  }

  fillCompetivesRect(data: any) {
    var that = this;
    var gs: any;
    d3.select("#defaultgCompetitiveRect").selectAll("g").remove();
    d3.select("#defaultgCompetitiveRect").raise();
    gs = d3.select("#defaultgCompetitiveRect");
    var arc = d3.arc().innerRadius(220).outerRadius(285)
      .startAngle(function (d) { return 0 * (Math.PI / 180); })
      .endAngle(function (d) { return 360 * (Math.PI / 180); })

    var ggs = gs.append("g").append("path").attr("fill", 'transparent').attr("d", arc)

    ggs.on("pointerenter", function (ev: any, d: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        var filD: any = [];
        if (that.etfService._SRValue == 0 || that.etfService._SRValue == 100) {
          filD = data.filter((x: any) => x.stockKey == dst[0].stockKey);
        } else { filD = that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.stockKey == dst[0].stockKey); }
        if (filD.length > 0) { that.gfillCompMouseover(gs, dst[0], data, ev); }
        else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    }).on("mousemove", function (ev: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        var filD: any = [];
        if (that.etfService._SRValue == 0 || that.etfService._SRValue == 100) {
          filD = data.filter((x: any) => x.stockKey == dst[0].stockKey);
        } else { filD = that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.stockKey == dst[0].stockKey); }
        if (filD.length > 0) { that.gfillCompMouseover(gs, dst[0], data, ev); }
        else { gs.selectAll(".gfillCompMouseover").remove(); }
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
    ggs.append("text").attr("x", that.sharedData.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () {
        if ((that.etfService.SRValue.value > 0 && that.etfService.SRValue.value < 100) && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])
          && that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) {
          if (that.etfService.showHFCompanyRanges['selectedPin'] == false && that.Slide_count != 1) {
            return (" AVHideTxt avbold");
          } else {
            return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
          }
          //return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
        }
        else {
          if (that.etfService.showHFCompanyRanges['selectedPin'] == false && that.Slide_count != 1) {
            return (" AVHideTxt avbold");
          } else {
            return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
          }
          //return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " avbold";
        };
      }).text(function () { return d3.format(",.1f")(d.scores * 100) + "%" });

    ggs.append("text").attr("x", that.sharedData.txtx(d))
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () {
        if ((that.etfService.SRValue.value > 0 && that.etfService.SRValue.value < 100) && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])
          && that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length == 0) {
          if (that.etfService.showHFCompanyRanges['selectedPin'] == false && that.Slide_count != 1) {
            return (" AVHideTxt avbold");
          } else {
            return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
          }
         // return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt");
        }
        else {
          if (that.etfService.showHFCompanyRanges['selectedPin'] == false && that.Slide_count != 1) {
            return (" AVHideTxt avbold");
          } else {
            return (that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges) + " AVHideTxt avbold");
          }
         // return that.etfService.HFCompanyTxt(d, that.etfService.showHFCompanyRanges);
        };
      })
      .text(function () {
        var cName: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = "" + cName.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 15 - rsvcnt;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = cName.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 15 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });
    ggs.on("click", function () {
      if (that.etfService._SRValue == 0 || that.etfService._SRValue == 100) { that.etfService.selComp.next(d); }
      else if (that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.stockKey == d.stockKey).length > 0) { that.etfService.selComp.next(d); }
     
      try {
        that.sharedData.userEventTrack('ETF Universe', that.etfService._selGICS.name, d.ticker, 'company click');
      } catch (e) { }
    });
    //if (that.etfService.showHFCompanyRanges.selectedPin == false && that.Slide_count != 1) { ggs.selectAll("text").classed("HF_active", false); }

  }


  circleRange(values: any) {
    var that = this;
    d3.selectAll("#gradArcLine").remove();
    d3.selectAll(".text-drag").style('display', 'none');
    d3.select("#crlChart").append("g").attr("id", "gradArcLine");
    d3.selectAll("#slider").remove();
    var width = 320;
    var height = 320;
    var margin = { top: 20, left: 20, bottom: 20, right: 20 };
    var offset = 0;
    var indicatorWidth = 15;
    var accentColor = 'transparent';
    var handleRadius = 12;
    var handleStrokeWidth = 2;
    var handleIconColor = "var(--leftSideText-B)";
    var rangeTotal = 101;
    var tickColor1 = "var(--leftSideText-B)";
    var radius = (Math.min(width, height) - margin.top - margin.bottom) / 2;
    var outerRadius = (radius + 1) + indicatorWidth / 2;
    var innerRadius = outerRadius - indicatorWidth;
    var dragLiveData: any;
    var holder: any, indicatorArc: any, handles: any, dragBehavior: any;
    var a: any, e: any, startAngle: any, endAngle: any;
    var sliderDragRange = 5;
    var Intdata = values;
    var sliderInitValue: any = 100;
    var sliderEndValue: any = +values.start;
    var path = { up: 0, down: 5 };
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
        value = angleTO.invert(angle);
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
      "getData": function () {
        return this.graphdata;
      }
    }
    d3.select("#crlChart").append("g").attr("id", "slider").attr("transform", "translate(-160,-160)");
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
      d3.selectAll(".sliderDisp").style("display", "block");
      if ((sliderObject.a == 0 && sliderObject.e == 100) || (sliderObject.e == 0 && sliderObject.a == 0) || (sliderObject.e == 0 && sliderObject.a == 100)) {
        //that.sharedData.indexCheckBtn.next(false);
        sliderObject.a = 100;
        sliderObject.aAngle = 0;
        sliderObject.e = 0;
        sliderObject.eAngle = 360;
        d3.select('#resetHandle').style('display', 'none');
        d3.select('.sliderDispTicks').style('display', 'none');
        d3.select('#resetAL').style('display', 'none');
        // that.resetLRGrids();
        d3.select('.acc_comp').classed('collapsed', false);
        d3.select('#collapseComp').classed('show', true);
        d3.select('.perf_comp').classed('collapsed', true);
        d3.select('#collapsePerf').classed('show', false);
        //that.sharedData.checkHoldingDate();
      } else {
        if (sliderObject.e < 100 && sliderObject.e > 0) { that.etfService.SRValue.next(parseInt(sliderObject.e.toFixed(0))) }
        else if (sliderObject.a < 100 && sliderObject.a > 0) { that.etfService.SRValue.next(parseInt(sliderObject.a.toFixed(0))) }
        d3.select('#gradArc').select('.circle_overlay').attr('stroke-dasharray', (that.etfService.SRValue.value) + " " + '100').style('display', 'block');
        that.SliderOnChange();
        that.showCumAnnSlider = true;
        that.sharedData.showSpinner.next(true);
        that.sharedData.showMatLoader.next(true); 
        //that.Slide_count = -1;
        //that.controlRight();
        that.etfService.selComp.next(undefined);
        //if (that.SRValue < 100 && that.SRValue > 0) { that.highchartLine(); }
        d3.select('#resetHandle').style('display', 'block');
        d3.select('.sliderDispTicks').style('display', 'block');
        d3.select('#resetAL').style('display', 'block');
        //d3.selectAll('#gNav_def_head').selectAll('.subname').text(that.draggedSubName);

        //that.sharedData.getAnnumValue();
        d3.select('.acc_comp').classed('collapsed', true);
        d3.select('#collapseComp').classed('show', false);
        d3.select('.perf_comp').classed('collapsed', false);
        d3.select('#collapsePerf').classed('show', true);
      }
      that.creatgArcLine(that.etfService._rightGridData);
      that.createCircleSliderDot(that.Slide_count);
      d3.select('#pullRemove').style('display', 'none');
      path = that.checkSliderPath(that.SRValue);
    }

    var svg = d3.select("#slider").append('g').attr('id', 'holder').attr('transform', 'translate(' + (((width + offset) - width) / 2 + margin.top) + ',' + (((height + offset) - height) / 2 + margin.left) + ')');
    holder = svg.append('g').attr('id', 'arcindicator').attr("class", "sliderDisp").style("display", "none");
    helper.calculateInitialData(Intdata);
    a = helper.getValueOfDataSet("a");
    e = helper.getValueOfDataSet("e");
    startAngle = helper.getAngleOfDataSet("a");
    endAngle = helper.getAngleOfDataSet("e");

    writeTimeInfo({ a: a, e: e, aAngle: startAngle, eAngle: endAngle });

    drawTickers();
    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(function (d) { return startAngle * (Math.PI / 180); })
      .endAngle(function (d) { return endAngle * (Math.PI / 180); })

    indicatorArc = holder.append("g").attr("class", "arcindicator")
      .attr("transform", "translate(" + ((width / 2) - margin.top) + "," + ((height / 2) - margin.bottom) + ")")
      .append("path").attr("fill", function () { return accentColor; }).attr("d", arc)

    handles = svg.append('g').attr('id', 'handles')
      .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "sliderDisp").style("display", "none");
    dragBehavior = d3.drag().subject(function (d) { return d; }).on("drag", function (ev: any, d: any) {


      var coordinaters = d3.pointers(ev, svg.node());
      var x = coordinaters[0][0] - radius;
      var y = coordinaters[0][1] - radius;
      var nA = (Math.atan2(y, x) * 180 / Math.PI) + 90;
      if (nA < 0) { nA = 360 + nA; }
      nA = nA - ((nA * sliderEndValue) % 125) / rangeTotal;
      var newvalue = angularScale.invert(nA);
      var cvalue = ((newvalue / sliderDragRange) - ((newvalue / sliderDragRange) % 1)) * sliderDragRange;
      if (path.up == cvalue || path.down == cvalue) { dragmoveHandles(ev, d); }
    })
      .on("end", function (ev: any, d: any) {
        checkHandlesPosition();
        d3.select(this).classed('active', false);
        d3.select("#crlChart").select('.sliderToolTip').remove();
      });

    drawHandles();
    d3.selectAll(" #handles .handlercontainer").attr("class", function (d, i) { return "handlercontainer a" + (i + 1); });
    if (endAngle === 360) {
      d3.select('#handles').select('.a2').attr('transform', 'rotate(' + (endAngle) + ') translate(0,' + (radius-2) * -1 + ')');
    }
    if ($(' #handles .handle').length === 2) {
      d3.select('#handles').select('.handle').remove();
    }
    if (that.etfService.SRValue.value < 100 && that.etfService.SRValue.value > 0) {
      var aScale = d3.scaleLinear().range([0, 360]).domain([100, 0]);
      var getAngel = aScale(that.etfService.SRValue.value);
      helper.graphdata = [{ angle: 360, label: "a", value: 0 }, { angle: getAngel, label: "e", value: that.etfService.SRValue.value }];
      handles.selectAll('.handlercontainer').data(helper.getData());
      updateHandles({ angle: getAngel, label: "e", value: that.etfService.SRValue.value });
      checkHandlesPosition();
    }
    d3.selectAll(".sliderDisp").style("display", "block");
    function drawHandles() {
      var handlerContainer = handles.selectAll('.handlercontainer').data(helper.getData());
      var circles = handlerContainer.enter()
        .append('g')
        .attr('class', 'handlercontainer')
        .attr('transform', function (d: any) { return 'rotate(' + angularScale(d.value) + ') translate(0,' + (radius) * -1 + ')'; })
        .on("pointerenter", function (ev: any) {
          
          d3.select(ev).classed('active', true);
          if ($('#resetHandle').css('display') == 'none') {
            //console.log("entered");
            d3.select('#pullRemove').style('display', 'block');
          }

        })
        .on("pointerleave", function (ev: any) {
          d3.select(ev).classed('active', false);
          d3.select('#pullRemove').style('display', 'none');
        })
        .call(dragBehavior);

      circles.append('circle')
        .attr('r', handleRadius)
        .attr('class', 'handle')
        .style('stroke', handleIconColor)
        .style('stroke-width', handleStrokeWidth)
        .attr('cursor', 'pointer')
        .style('fill', "var(--primary-color")
        .style('stroke-opacity', 1)
        .attr('id', function (d: any) { return d.label; })
        .on('pointerenter', function (ev: any) { d3.select(ev).classed('active', true); })
        .on('pointereleave', function (ev: any) { d3.select(ev).classed('active', false); });

      circles.append("text")
        .attr("transform", function (d: any) {
          if (that.SRValue < 96 && that.SRValue > 4 && d.label == 'e') return "rotate(" + (d.angle * (-1)) + ")"; else return 'rotate(0)';
        })
        .style("text-anchor", "middle").style('dominant-baseline', 'central').attr("id", "SHMtext").attr("class", "dragH-val")
        .style('font-family', 'var(--ff-medium)').style('font-size', '10px').style('cursor', 'pointer').style('fill', handleIconColor)
        .text(function (d: any) { if (that.etfService.SRValue.value < 96 && that.etfService.SRValue.value > 4 && d.label == 'e') return that.SRValue.toFixed(0); else return ''; });
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
        .style("cursor", 'pointer')
        .attr("transform", function (d) {
          return "rotate(" + (d.angle - 90) + ")" + "translate(" + (innerRadius + 18) + ",0)";
        });
      ticks.append("line").attr('id', function (d) { return 'top' + d.label }).attr("y1", 0).attr('transform', 'translate(-18,0)')
        .attr("x1", function (d) { if (d.label || d.angle == 0) return -2; else return 0; })
        .attr("x2", function (d) { if (d.label || d.angle == 0) return -4; else return 0; })
        .attr("y2", 0).style("stroke", tickColor1).style("stroke-width", "0.6px");
      ticks.append("text").attr("x", 5).attr("dy", "0.35em")
        .attr("transform", function (d): any {
          if (d.angle > 0 && d.angle <= 90) { return checkPoi == 1 ? "rotate(90)translate(-10,15)" : "rotate(90)translate(-10,16)"; }
          else if (d.angle > 90 && d.angle <= 180) { return checkPoi == 1 ? "rotate(-90)translate(-10,-15)" : "rotate(-90)translate(-10,-15)"; }
          else if (d.angle > 180 && d.angle <= 270) { return checkPoi == 1 ? "rotate(-90)translate(5,-15)" : "rotate(-90)translate(5,-15)"; }
          else if (d.angle > 270 && d.angle <= 360) { return checkPoi == 1 ? "rotate(90)translate(5,15)" : "rotate(90)translate(5,15)"; }
        })
        .style("text-anchor", function (d) { return d.angle > 180 ? "end" : null; })
        .style("fill", tickColor1).style("font-size", "8px").style("font-family", 'var(--ff-regular)').text(function (d): any { if (d.label != null) { return d.label + "%"; } })
        .on('click', function (ev: any, d: any) {
          if (parseInt(d.label) < 100) {
            helper.graphdata = [{ angle: 360, label: "a", value: 0 }, { angle: d.angle, label: "e", value: parseInt(d.label) }];
            d3.select('#handles').selectAll('.handlercontainer').data(helper.getData());
            updateHandles({ angle: d.angle, label: "e", value: parseInt(d.label) });
            //that.draggedHandle = true;
            //checkHandlesPosition("");
            var currentData = { "a": 0, "aAngle": 360, "e": parseInt(d.label), "eAngle": d.angle };
            writeTimeInfo(currentData);
            path = that.checkSliderPath(parseInt(d.label));
            d3.select("#crlChart").select('.sliderToolTip').remove();
          }
        });

      var roTicker = d3.select("#slider").select("#holder").select("#ticks");
      roTicker.select(".tick0").select("text").attr("transform", function (d) { return checkPoi == 1 ? "rotate(90)translate(0,8)" : "rotate(90)translate(0,8)" }).style("font-family", "var(--ff-medium)").style("fill", tickColor1).style("font-size", checkPoi == 1 ? "7px" : "8px");
      roTicker.select(".tick0").select("line").attr("x2", "0");
      roTicker.select(".tick0").append("g").attr('transform', 'translate(-16, -8)').append("path").attr('transform', 'rotate(271)scale(0.015)').style("fill", '#2b468f80')
        .attr("d", "M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z");
      roTicker.select(".tick100").select("text").attr("transform", function (d) { return checkPoi == 1 ? "rotate(98)translate(11,12)" : "rotate(180)translate(18,0)" }).style("font-family", "var(--ff-medium)").style("fill", tickColor1).style("font-size", "6px");;
      var lastticks: string = '.tick' + sliderEndValue;
      roTicker.select(lastticks).select("text").attr("transform", function (d) { return checkPoi == 1 ? "rotate(84)translate(-21,13)" : "rotate(90)translate(-8,8)" }).style("font-family", "var(--ff-medium)").style("fill", tickColor1).style("font-size", checkPoi == 1 ? "6px" : "7px");
      roTicker.select(".tick100").select("line").attr("x2", "0");
      roTicker.select(".tick5").select("text").attr("x", "-1");
      roTicker.select(".tick100").append("g").attr('transform', 'translate(-8, 8)').append("path").attr('transform', 'rotate(90)scale(0.015)').style("fill", '#2b468f80')
        .attr("d", "M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z");
      roTicker.select(".tick50").select("text").style("font-family", "var(--ff-medium)").style("fill", tickColor1);

      svg.select("#resetHandle").remove();
      d3.selectAll(".text-drag").style('display', 'block');
      ////// Reset
      //var handles1 = svg.append('g')
      //  .attr('transform', 'translate(' + radius + ',' + radius + ')').attr("class", "resetHandle");
      //handles1.append('circle').attr('class', 'animateCircle').attr('r', '10').attr('fill', '#fff')
      //  .attr('transform', 'rotate(360) translate(0,-140)');

      var handles = svg.append('g').attr('id', 'resetHandle')
        .attr('transform', 'translate(' + radius + ',' + (radius+2) + ')').attr("class", "resetHandle");

      handles.style("display", "none").append('g').attr('transform', ('translate(0,' + (radius) * -1 + ')')).append('circle').attr('r', handleRadius).style('stroke', '#d0d4dc')
        .style('stroke-width', handleStrokeWidth).attr('cursor', 'pointer').style('fill', "#d0d4dc").style('stroke-opacity', 1)
        .on('click', function (d) {
          that.resetSlider();
          that.checkTickerLine();
          try {
            that.sharedData.userEventTrack('ETF Universe', that.etfService._selGICS.name, that.etfService._SRValue, 'Avoid loser Reset btn Click');
          } catch (e) { }
        });
    }
    function dragmoveHandles(ev: any, d: any) {
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
      updateHandles(d);
      path = that.checkSliderPath(dvalue);
    }
    function updateArc() {
      var handlerContainer = d3.selectAll('#handles .handlercontainer'); //select all handles
      var startValue = 0;
      var endValue = 0;
      handlerContainer.each(function (d: any, i) {
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
      var allHandles = handles.selectAll('.handlercontainer');
      var currentData: any = { "a": 0, "aAngle": 0, "e": 0, "eAngle": 0 };
      allHandles.each(function (d: any, i: any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      dragLiveData = currentData;
    }
    function updateHandles(dd: any) {
      if (dd.label === 'a') {
        d3.select('#handles').select('.a1').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius) * -1 + ')');
      } else {
        if (dd.angle <= 180) {
          d3.select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius - 4) * -1 + ')');
        } else {
          d3.select('#handles').select('.a2').attr('transform', 'rotate(' + dd.angle + ') translate(0,' + (radius - 2) * -1 + ')');
        }
      }
      d3.selectAll(".a2 #SHMtext").attr("transform", "rotate(" + (dd.angle * (-1)) + ")")
        .text(function (d) { if (dd.value.toFixed(0) < 96 && dd.value.toFixed(0) > 4) return dd.value.toFixed(0); else return ''; });
      that.onDragRem(dd);
      updateArc();
      d3.select('#handles').select('.a1').select('#sliderHandleLoader').remove();
      d3.selectAll('.animateCircle').style('display', 'none');
      d3.selectAll('.text-drag').style('display', 'none');
      d3.select('#handles').select('.a1').select('text').remove();
    }
    function checkHandlesPosition() {
      var allHandles: any = handles.selectAll('.handlercontainer');
      var currentData: any = {
        "a": 0,
        "aAngle": 0,
        "e": 0,
        "eAngle": 0
      }
      allHandles.each(function (d: any, i: any) {
        currentData[d.label] = d.value;
        currentData[d.label + "Angle"] = d.angle;
      });
      writeTimeInfo(currentData);
    }
  }

  checkSliderPath(val: any) {
    if (val == 0 || val == 100) { return { up: 5, down: 5 }; }
    else if (val == 95) { return { up: 90, down: 90 }; }
    else { return { up: (val - 5), down: (val + 5) }; }
  }

  resetSlider() {
    let that = this;
    that.etfService.SRValue.next(0);
    that.etfService.rightGridData.next([...that.etfService.rightGridData.value]);
    if (that.etfService.rightGridData.value.length > 19  && this.etfService._selGICS['group'] == "ETFIndex") {
      try { that.circleRange({ "start": 0, "end": 100 }); } catch (e) { }
      d3.selectAll(".sliderDisp").style("display", "block");
      d3.selectAll('.animateCircle').style('display', 'block');
      d3.selectAll('.text-drag').style('display', 'block');
    } else {
      d3.selectAll(".sliderDisp").style("display", "none");
      d3.selectAll('.animateCircle').style('display', 'none');
      d3.selectAll('.text-drag').style('display', 'none');
    }    
    that.showCumAnnSlider = false;   
    //d3.selectAll('#gNav_def_head').selectAll('.subname').text(that.selGICS_Group + ' / ' + that.totalcompLength);
    //d3.selectAll('.slider_total_components').selectAll('.totalcomps').text(that.totalcompLength);
    d3.select('#gradArc').select('.circle_overlay').attr('stroke-dasharray', '0 100').style('display', 'none');
    d3.select('#slider').raise();
    //that.resetLRGrids();
    that.Slide_count = 1;
    that.controlLeft();
  }
  Slide_count: number = 0;
  getAdditionalRtnData = [];
  selectedCompName: any;
  STW_Price: any;
  STW_Pricecurrency = '$';
  selectedRank: any;
  selectedProbability: any;
  STW_PriceRef(event: any) {
    var that = this;
  }
  onKeyEnterPrice(event: any) { }
  onFocusOutEvent(e: any, price: any) {
    let that = this;
    //if (isNullOrUndefined(price)) {
    //  var selData = [...that.sharedData._selResData].filter(x => x.isin == that.SelISIN);
    //  if (selData.length > 0) { that.STW_Price = that.priceTofix(selData[0].price); }
    //}
  }

  gAddRtn: any;
  checkTickerLine() {
    var that = this;
    if ((this.uname.indexOf('technogradient.com') > -1) || (this.uname.indexOf('newagealpha.com') > -1)) {
      var GICSId = 0;
      var CType = 'ETF';
      var IndexId = 123;
      var SelAssetId: any = 0;
      if (this.etfService._breadcrumbdata.length>0 && this.etfService._breadcrumbdata[this.etfService._breadcrumbdata.length - 1]['group'] == 'ETFIndex') {
        if (isNotNullOrUndefined(this.etfService._selGICS.assetId)) { SelAssetId = this.etfService._selGICS.assetId; };
        GICSId = parseInt(SelAssetId);
      }

      if (that.getAdditionalRtnData.length > 0 && isNotNullOrUndefined(that.getAdditionalRtnData[0]['indexid']) && isNotNullOrUndefined(that.getAdditionalRtnData[0]['gICSId'])
        && that.getAdditionalRtnData[0]['indexid'] != IndexId && that.getAdditionalRtnData[0]['gICSId'] != GICSId) { that.changeTickerLine(); }
      else {
        try { this.gAddRtn.unsubscribe(); } catch (e) { }
        this.gAddRtn = that.dataService.GetAdditionalReturns(IndexId, GICSId, CType).subscribe((res: any) => { that.getAdditionalRtnData = res; that.changeTickerLine(); },
          error => {
            this.logger.logError(error, 'GetAdditionalReturns');
          });
        that.subscriptions.add(this.gAddRtn);
      }
    }
  }

  changeTickerLine() {
    var that = this;
    var tics = ['top5', 'top10', 'top15', 'top20', 'top25', 'top30', 'top35', 'top40', 'top45', 'top50', 'top55', 'top60', 'top65', 'top70', 'top75', 'top80', 'top85', 'top90', 'top95', 'top100'];
    if ((this.uname.indexOf('technogradient.com') > -1) || (this.uname.indexOf('newagealpha.com') > -1)) {
      tics.forEach(function (d) {
        var id = '#' + d;
        if (Math.sign(that.getAdditionalRtnData[0][d]) == 1 || Math.sign(that.getAdditionalRtnData[0][d]) == 0) { d3.select(id).style('opacity', 1) } else { d3.select(id).style('opacity', 0) }
      });
    }
  }

  GetIndId(TabId: any, GICS: any) {
    if (TabId == 0 || GICS == 0) { GICS = 0; return GICS; } else if (TabId > 0) { return GICS.substring(0, TabId * 2); }
  }

  checkSelIndId(breadcrumbdata: any) {
    var SelIndId = 0;
    let indGroup = breadcrumbdata.length > 0 ? breadcrumbdata[breadcrumbdata.length - 1].group : "0";
    if (indGroup == "Sector") { SelIndId = 1; }
    else if (indGroup == "Industrygroup") { SelIndId = 2; }
    else if (indGroup == "Industry") { SelIndId = 3; }
    else if (indGroup == "Sub Industry") { SelIndId = 4; }
    return SelIndId;
  }

  SliderOnChange() {
    let that = this;
    //this.sharedData.AnalysisSliderLoader.next(true);
    this.etfService.GetAlloc().then((AllocData: any) => {
      this.etfService.currentAllocation(AllocData).then((res: any) => {
        var AllocDta: any = [...res['resData']];
        var addedCompanies: any = [...res['addedCompanies']];
        var removedCompanies: any = [...res['removedCompanies']];
        that.etfService.avoidLoserData.next({ 'addedCompanies': addedCompanies, 'removedCompanies': removedCompanies });
        this.circleCount = addedCompanies.length;
        this.componentsCount = AllocDta.length;
        const atext=  d3.select('#defCenCircle').selectAll('.total_components .header').text("Components: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(this.circleCount + " / " + this.componentsCount)

        /******* Dragged Values ********/
        var dt = [...addedCompanies].length;
        //that.draggedSubName = that.selGICS_Group + " / " + dt + " out of " + AllocDta.length;
        //that.sharedData.applySlider2Trigger.next(100 - that.sharedData._SRValue);
        //that.sharedData.getAnalysisSlider();
        d3.selectAll("#c_removed_comp").text((AllocDta.length - dt) + " " + "Components");
        d3.selectAll("#c_remaining_comp").text(dt + " " + "Components");
        /******* Dragged Values ********/
        that.CreateComps('#defCenCircle', [...AllocDta], "lvl1");
        if (that.etfService.checkFillCompCreation()) {
          try { that.fillCompetives([...AllocDta]); } catch (e) { console.log(e) }
        }
        else {
          d3.select("#defCenCircle #crlChart").select("#gCompetitive").remove();
          d3.select("#defCenCircle #crlChart").select("#defaultgCompetitiveRect").remove();
        }
        //if (d3.select(".AVLalert_c").style("display") == "block" && that.breadcrumbdata.length > 0 && that.SRValue != 0 && that.SRValue != 100) that.sharedData.UpdateAllocDialog("Alloc");
        d3.select('#slider').raise();
        //d3.selectAll('#gNav_def_head').selectAll('.subname').text(that.draggedSubName);
        d3.selectAll('.slider_total_components').selectAll('.totalcomps').text(dt);
        //this.sharedData.checkAllocAlertlist('');
        //that.sharedData.checkHoldingDate();
        this.etfService.checkAllocAlertlist().then((res) => {
          if (isNotNullOrUndefined(res) && res) {
            if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100 && this.sharedData.checkMenuPer(2028, 2249) == 'Y') { this.etfService.UpdateAllocDialog() }
          }
        });
        that.etfService.getAnnumValue().then((res: any) => {
          if (isNotNullOrUndefined(res) && res.length > 0 && that.etfService._SRValue > 0) {
            that.etfService.getCumulativeAnnData.next(res);
            that.getAnalysis(res);
            that.getAnalysisSlider();
          }
        });
      });
    });
    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService._selGICS.name, this.etfService._SRValue, 'Avoid loser draged');
    } catch (e) { }
  }

  

  openLineChart() {
    var ind: any = this.etfService._breadcrumbdata.filter((x: any) => x['group'] == "ETFIndex");
    try {
      var title = 'Index Linechart';
      var options = {
        from: 'etfUniverse',
        error: 'linechart',
        destination: 'linechartPopup',
        index: (ind.length > 0) ? ind[0] : undefined,
        SRValue: this.etfService.SRValue.value,
        breadcrumb: this.etfService.breadcrumbdata.value,
        selGICS: this.etfService.selGICS.value,
        CType: 'ETF'
      }

      var dilog = this.dialog.open(LineChartComponent, {
        width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
        data: { dialogTitle: title, dialogSource: options }
      }).afterClosed().subscribe((response:any) => {
        if (isNotNullOrUndefined(response['SRValue'])) {
          var SRValue: number = parseInt(response['SRValue']);
          if (this.etfService._SRValue != SRValue) {
            if (SRValue > 0 && SRValue < 100 && this.etfService._selGICS['group'] == "ETFIndex") {
              this.etfService.SRValue.next(SRValue);
              try { this.circleRange({ "start": 0, "end": SRValue }); } catch (e) { }
            } else { this.resetSlider(); };
          }
        }
      });
      this.subscriptions.add(dilog);
    } catch (e) { console.log(e) }
    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService._selGICS.name, this.etfService._SRValue, 'Avoid loser linechat popup Click');
    } catch (e) { }
  }
  getAnalysisSlider() {
    var that = this;
    that.showCumAnnSlider = true;
    that.Slide_count = 2;
    that.createCircleSliderDot(that.Slide_count);
    that.controlRight();
  }
  controlLeft() {
    var that = this;
    var controlLeft = d3.select('#defCenCircle').select('#left');
    var controlLeftDisable = d3.select('#defCenCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#defCenCircle').select('#right');
    var controlRightDisable = d3.select('#defCenCircle').select('#right .disableRightCircle');
    that.Slide_count--
    if (that.Slide_count < 0) { that.Slide_count = 0 }
    var con = d3.select('#defCenCircle').select('#left').classed('disable');
    var slideV = 320 * that.Slide_count;
    if (con == false) {
      if (that.Slide_count >= 0) {
        if (that.Slide_count == 1 && !that.showCumAnnSlider || that.Slide_count == 2 && that.showCumAnnSlider) {
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
    d3.select('#defCenCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot(that.Slide_count);
    that.creatgArcLine(that.etfService._rightGridData);
    that.HFCompanyArc();
  }
  HomeRootPath = '';
  createCircleSliderDot(eV:any) {
    var that = this;
    d3.select('#Circle_SliderDots').select('g').remove();
    var main = d3.select('#Circle_SliderDots');
    var dotCount = 3;
    var dotRadius = 3;
    if (that.showCumAnnSlider) { dotCount = 4 } else { dotCount = 3 }
    if (that.HomeRootPath == "User Portfolio") { dotCount = 0; }
    //else if ($('#resetHandle').css('display') == 'block') { dotCount = 4; }
    if (that.breadcrumbdata.length >= 0) {
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
    else { d3.select('#Circle_SliderDots').select('g').remove(); }
  
  }
  releaseToolGraph: boolean = true;
  controlRight() {
    var that = this;
    var controlLeft = d3.select('#defCenCircle').select('#left');
    var controlLeftDisable = d3.select('#defCenCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#defCenCircle').select('#right');
    var controlRightDisable = d3.select('#defCenCircle').select('#right .disableRightCircle');

    that.Slide_count++
    var con = d3.select('#defCenCircle').select('#right').classed('disable');
    if (that.Slide_count == 2 && $('#Circle_SliderDots #dots g').length < 4) { that.releaseToolGraph = true; } else { that.releaseToolGraph = false; }
    var slideV = 320 * that.Slide_count;

    if (con == false) {
      if (that.Slide_count <= 4) {
        controlLeft.classed("disable", false);
        controlLeftDisable.style("display", 'none');
       
        if (that.Slide_count == 2 && !that.showCumAnnSlider) {
          ///// After right icon triggered automatically right icon will be disabled without dragging/////
          controlRight.classed("disable", true);
          controlRightDisable.style("display", 'block');
        }
        else if (that.Slide_count == 3 && that.showCumAnnSlider) {
          controlRight.classed("disable", true);
          controlRightDisable.style("display", 'block');
        }
      }

    }
    var t = d3.transition()
      .duration(300)
      .ease(d3.easeLinear);
    d3.select('#defCenCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    this.createCircleSliderDot(that.Slide_count);
    that.creatgArcLine(that.etfService._rightGridData);
    that.HFCompanyArc();
  }
  openImpliedRevenue() {
    var ind: any = this.etfService._breadcrumbdata.filter((x: any) => x['group'] == "Index");
    try {
      var title = 'Index Implied Revenue';
      var options = {
        from: 'ETFUniverse',
        error: 'Implied Revenue',
        destination: 'Implied Revenue Popup',
        index: (ind.length > 0) ? ind[0] : undefined,
        selComp: this.etfService.selComp.value,
        breadcrumb: this.etfService.breadcrumbdata.value,
        selGICS: this.etfService.selGICS.value,
        CType: 'ETF'
      }

      this.dialog.open(ImpliedRevenueComponent, {
        width: "80%", height: "90%", maxWidth: "100%", maxHeight: "90vh",panelClass: 'impliedRevenueDialog',
        data: { dialogTitle: title, dialogSource: options }
      })
    } catch (e) { console.log(e) }
  }

  checkMyToolTip() {
    var data: any = this.etfService.performanceUIndexList.value;
    var tootip: string = "";
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['sinceDate']) && isNotNullOrUndefined(data[0]['date'])) {
      tootip = 'Returns calculated from ' + data[0]['sinceDate'] + ' to ' + data[0]['date']
    }
    return tootip;
  }

  private _filter(value: any) {
    let that = this;
    if (isNullOrUndefined(value) || value instanceof Object) { value = '' };
    if (isNotNullOrUndefined(value)) { value = value.toLowerCase(); };
    var data: any = [...this.rightGridData];
    try {
      if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100 && isNotNullOrUndefined(that.etfService._avoidLoserData['addedCompanies'])) {
        data = [...that.etfService._avoidLoserData['addedCompanies']];
      }
    } catch (e) { }
    if (isNullOrUndefined(data)) { data = [] };

    var compFilter: any = [...data].filter((res: any) => (res['companyName'].toLowerCase().includes(value) || res['ticker'].toLowerCase().includes(value)));
    if (value == '' || isNullOrUndefined(value)) { compFilter = [...data] };
    compFilter = compFilter.map((e: any) => ({ filIndex: false, ...e })).slice(0, 50);
    return [...compFilter];
  }

  circleSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.etfService.selComp.next(value); };
      this.glbSearch.reset();
    }
  }

  inputFocused() { this.glbSearch.setValue(''); };

  onDragRem(d: any) {
    const value = isNotNullOrUndefined(d?.value) ? d.value : 100;
    const dAngle = isNotNullOrUndefined(d?.angle) ? d.angle : null;
    d3.select('#gCompetitive').selectAll('.AVHideTxt').classed('AVHideTxt', false);
    d3.select('#gradArc').select('.circle_overlay').attr('stroke-dasharray', `${value} 100`).style('display', 'block');

    const checkAndToggle = (elements: d3.Selection<any, any, any, any>, hideText: boolean) => {
      elements.nodes().forEach((el: any) => {
        const data: any = d3.select(el).data();
        const angle = data?.[0]?.cx;
        if (isNotNullOrUndefined(dAngle) && isNotNullOrUndefined(angle) && (dAngle - 90) <= angle) {
          if (hideText) {
            d3.select(el).selectAll('text').classed('AVHideTxt', true);
          } else {
            d3.select(el).style('display', 'none');
          }
        }
      });
    };

    checkAndToggle(d3.select('#gCompetitive').selectAll('g'), true);

    const cTag = d3.select('.compList').selectAll('.comp');
    cTag.style('display', 'block');
    checkAndToggle(cTag, false);
  }
}

