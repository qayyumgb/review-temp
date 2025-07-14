import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
// @ts-ignore
import * as d3 from 'd3';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
import { ImpliedRevenueComponent } from '../../../universeDialogsModule/implied-revenue/implied-revenue.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'the-exclusion-circle',
  templateUrl: './exclusion-circle.component.html',
  styleUrl: './exclusion-circle.component.scss'
})
export class ExclusionCircleComponent_Thematic implements OnInit, OnDestroy {
  radius = 150;
  circleData: any = [];
  subscriptions = new Subscription();
  returnAsof: string = '';
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  constructor(public dialog: MatDialog, public sharedData: SharedDataService, public thematicService: ThematicIndexService) { }

  HFscore: any;
  impRevValue: any = undefined;
  selCompText: string = '';
  STW_Pricecurrency = '$';
  selFilComp: any;

  loadSel() {
    this.selFilComp = undefined;
    this.impRevValue = undefined;
    var stockKey: any = (isNotNullOrUndefined(this.thematicService.selCompany.value) && isNotNullOrUndefined(this.thematicService.selCompany.value['stockKey'])) ? this.thematicService.selCompany.value['stockKey'] : 0;
    var filComp = [...this.sharedData._selResData].filter((x: any) => x.stockKey == stockKey);
    if (filComp.length > 0) {
      var d: any = filComp[0];
      this.selFilComp = d;
      let ticker: string = (isNotNullOrUndefined(d.ticker)) ? "(" + d.ticker + ") " : '';
      var txt_m: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
      var midtxt = txt_m + ' ' + ticker;
      if (txt_m.length > 20) { midtxt = txt_m.slice(0, 20) + '... ' + ticker; };
      this.selCompText = midtxt;
      this.HFscore = d3.format(".1f")(d.scores * 100) + '%';
      this.impRevValue = d3.format(".1f")(d['impRev'] * 100);
      this.STW_Pricecurrency = d['currency'] + ' ' + d3.format(",.1f")(d['price']);
    }
  }

  openImpliedRevenue(d: any) {
    var selcomp: any = d;
    if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['stockKey'])) {
      var newSel: any = [...this.sharedData._selResData].filter((x: any) => x.stockKey == selcomp['stockKey']);
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

  ngOnInit() {
    var that = this;
    var exclusionCompData = that.thematicService.exclusionCompData.subscribe((data: any) => {
      if (isNotNullOrUndefined(data) && data.length > 0) {
        var da = [...data];
        da = da.sort(function (x: any, y: any) { return d3.ascending(x.score, y.score); });
        da.forEach(function (d: any, i: number) { d['cx'] = ((i * 360 / da.length) - 90); return d });
        this.circleData = [...da];
        this.onloadIndexData(da);
      }
    });
    that.subscriptions.add(exclusionCompData);

    var selCompany_sub = this.thematicService.selCompany.subscribe((resData: any) => {
      try {
        if (isNotNullOrUndefined(resData)) { this.creatClockSlider(resData) }
        else { d3.select("#excluCircle_pre").selectAll("#cSlider").remove(); }
        this.loadSel();
      } catch (e) { console.log(e) }
    });
    this.subscriptions.add(selCompany_sub);
  }

  onloadIndexData(data: any) {
    try {
      this.fillCompetives([...data]);
      this.CreateComps('#excluCircle_pre', [...data]);
      this.creatGradienArc(0, 100, [...data], "", '#excluCircle_pre');
      var Bdata = this.thematicService.thematicIndexBrcmData.value;
      if (isNotNullOrUndefined(Bdata) && Bdata.length>0) {
        var selectSectorName = Bdata[Bdata.length - 1].name;
        d3.selectAll(".slider1 .mainsectorTxt .med__title").text(selectSectorName)
          .attr('y', function () { if ((selectSectorName.length) > 15) { return '-10' } else { return '0' } })
          .style('font-size', function () { if ((selectSectorName.length) > 20) { return '15px' } else { return '17px' } })
          .call(this.sharedData.Crlwrapping, 180, "top");
      }
    } catch (e) { console.log(e) }
  }

  fillCompetives(dta: any[]) {
    let that = this;
    var gs = null;
    let data = dta;

    d3.select("#excluCircle_pre #crlChart").select("#gCompetitive").remove();
    d3.select("#excluCircle_pre #crlChart").select("#exclugCompetitiveRect").remove();
    gs = d3.select("#excluCircle_pre").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#excluCircle_pre").select('#crlChart').append("g").attr("id", "exclugCompetitiveRect");
    gs.selectAll("g").remove();

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) { sdata = data.filter(function (d: any, i: number) { if (i == 0 || (i % sublen) == 0) { return d; } }); }
    else { sdata = data; }

    var ggs = gs.selectAll("g")
      .data(sdata)
      .enter().append("g")
      .attr("id", function (d) { return 'Cu_' + d.isin; })
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      }).style("opacity", 0.5);

    ggs.append("text")
      .attr("x", function (d) { return that.sharedData.txtx(d); })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(d); })
      .text(function (d: any) {
        if ((d.cx) > 90) {
          let txt = d.compname.trim() + "...";
          let resvtxt = "";
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 13 - rsvcnt;
          var dottxt = "";
          if (txt.length > 13) { dottxt = (data.length > fillMaxlen) ? "" : "..."; }
          return d['compname'].slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = d.compname.trim() + "...";
          let resvtxt1 = "";
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return d.compname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });

    ggs.on("pointerenter", function (event, d) { d3.select(this).classed("on", true); })
      .on("pointerleave", function (event, d) { d3.select(this).classed("on", false); })
      .on("click", function (event, d) { that.thematicService.selCompany.next(d); });

    //if (data.length > fillMaxlen) { that.fillCompetivesRect(data, dta, mode); } else { d3.select("#excluCircle_pre #exclugCompetitiveRect").selectAll("g").remove(); };

    if (dta.length < 100) { d3.select('#exclusionchart').select('#gCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#exclusionchart').select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }

  }

  CreateComps(masterID: any, dta: any) {
    let that = this;
    var compLst;
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst').remove();
    compLst = oSvg.append("g").attr('class', 'compLst').style("display", "block");
    try {

      var compC = compLst.append("g").attr("class", 'compLstC');
      var compg = compC.selectAll("g").data(dta).enter().append("g").attr("class", 'comp')
        .attr("transform", function (d: any, i: number) { return "rotate(" + (d.cx) + ")"; })
        .on("pointerenter", function (d) { d3.select(this).raise(); })
        .style("display", "block")
        .on("pointerleave", function (elemData) {
          d3.select("#gCompMOver").style("display", "none");
          d3.select("#gCompeOver").style("display", "none");
        });

      let SelRes: any = [...that.sharedData._selResData];
      var dmin: any = d3.min(SelRes.map((x: any) => x.marketCap));
      var dmax: any = d3.max(SelRes.map((x: any) => x.marketCap));
      var dmean: any = d3.mean(SelRes.map((x: any) => x.marketCap));
      var dsum: any = d3.sum(SelRes.map((x: any) => x.marketCap));

      let ResMarketCap: any = SelRes.map((x: any) => x.marketCap);
      let LimitedCap: any = ResMarketCap.filter((x: any) => x < dmean && x != null);
      let dlimitedSum: any = d3.sum(LimitedCap);

      var rmax = (dmax - dmin) > 100 ? 100 : (dmax - dmin);
      rmax = rmax < 50 ? 50 : rmax;

      var lineMin: any = d3.min(dta.map((x: any) => x.marketCap));
      var lineMax: any = d3.max(dta.map((x: any) => x.marketCap));
      var lineData = d3.scaleLinear().range([5, 30]).domain([lineMin, lineMax]);
      compg.append("rect")
        .attr("height", "1px")
        .attr("class", function (d) { if (dta.length > 600) { return "crect rectOpa "; } else { return "crect "; } })
        .attr("fill", "#4b4b4b")
        .attr("x", that.radius + 3)
        .attr("width", 0)
        .transition()
        .duration(10)
        .attr("width", function (d: any) {
          let wtdwidth = 0;
          //if (that.cusIndexService.bldMyIndweightByVal.value == 1 || that.cusIndexService.bldMyIndSelByVal.value == 1) {
          //  var wt = ((d.marketCap / dlimitedSum) * 10000);
          //  if (d.marketCap < dmean) { wtdwidth = wt; }
          //  else {
          //    wt = ((d.marketCap / dsum) * 10000);
          //    if (wt > 18) { wt = 18 + wt / 10; }
          //    wtdwidth = wt;
          //  }
          //  if (wtdwidth > 25) { wtdwidth = 25 + wtdwidth / 10; }
          //  if (wtdwidth > 40) { wtdwidth = 40; }
          //  return wtdwidth + 2;
          //} else {
          //  return lineData(d.marketCap);
          //}
          return lineData(d.marketCap);
        });
    } catch (e) { console.log(e) }
  }

  creatGradienArc(sMin = 0, sMax = 100, datas: any, path = "", masterID: any) {
    var tempArcData: any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    var data = [...tempArcData];
    if (data != null && data.length > 0) {
      var len = data.length;
      data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    }
    d3.select(masterID).select("#gradNewArc").remove();
    d3.select(masterID).select("#gradCompNewArc").remove();
    var gC100 = d3.scaleLinear<any>().domain([0, 100]).range(this.sharedData.cirArcGrdClr);
    let that = this;
    if (sMin == null) { sMin = 0; }
    if (sMax == null) { sMax = 100; }
    var gArc = null;
    var gArcLine = null;
    var arcType = "score";

    d3.select(masterID).select("#gradNewArc").remove();
    d3.select(masterID).select("#gradArcLine").remove();
    gArc = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradNewArc");
    gArcLine = d3.select(masterID).select("#crlChart").append("g").attr("id", "gradArcLine");

    var arc: any = d3.arc().innerRadius(that.radius - 18).outerRadius(that.radius - 2);

    // create our gradient
    var colors: any = [];

    var linearGradient = gArc.append("defs");
    var linearG1 = linearGradient.append("linearGradient");

    var gCArcColor = d3.scaleLinear()
      .domain([0, 90, 91, 180, 181, 270, 271, 360])
      .range([0, 100, 0, 100, 0, 100, 0, 100])
    var MaxColor: any = "";
    var MaxScore: any = "";
    var Data1 = data.filter((x: any) => x.cx >= -90 && x.cx <= 0);
    linearG1.attr("id", that.clipPathCheck(path + "linearColors0", 'ID', masterID))
      .attr("x1", "0").attr("y1", "0").attr("x2", ".5").attr("y2", "1");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= -90 && data[i].cx <= 0) {
          linearG1.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(that.conData(data[i][arcType])));
        }
        if (data[i].cx > 0) {
          linearG1.append("stop").attr("offset", "100%").attr("stop-color", gC100(that.conData(data[i][arcType])));
          break;
        }
      }

      if (Data1.length > 0) {
        MaxColor = gC100(that.conData(Data1[Data1.length - 1][arcType]));
        MaxScore = Data1[Data1.length - 1].cx;
      }
    }

    var Data2 = data.filter((x: any) => x.cx >= 1 && x.cx <= 90);
    var linearG2 = linearGradient.append("linearGradient");
    linearG2.attr("id", that.clipPathCheck(path + "linearColors1", 'ID', masterID))
      .attr("x1", "0.8").attr("y1", "0").attr("x2", "0.5").attr("y2", "0.5");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 1 && data[i].cx <= 90) {
          linearG2.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(that.conData(data[i][arcType])));
        }
        if (data[i].cx > 90) { break; }
      }
      if (Data2 == null || Data2.length == 0) {
        linearG2.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      } else {
        MaxColor = gC100(that.conData(Data2[Data2.length - 1][arcType]));
        MaxScore = Data2[Data2.length - 1].cx;
      }
    }

    var Data3 = data.filter((x: any) => x.cx >= 91 && x.cx <= 180);
    var linearG3 = linearGradient.append("linearGradient");
    linearG3.attr("id", that.clipPathCheck(path + "linearColors2", 'ID', masterID))
      .attr("x1", "0.8").attr("y1", "0.8").attr("x2", "0").attr("y2", "0.3");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 91 && data[i].cx <= 180) {
          linearG3.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(that.conData(data[i][arcType])));
        }
        if (data[i].cx > 180) { break; }
      }
      if (Data3 == null || Data3.length == 0) {
        linearG3.append("stop").attr("offset", gCArcColor(MaxScore + 90) + "%").attr("stop-color", MaxColor);
      } else {
        MaxColor = gC100(that.conData(Data3[Data3.length - 1][arcType]));
        MaxScore = Data3[Data3.length - 1].cx;
      }
    }

    var Data4 = data.filter((x: any) => x.cx >= 181 && x.cx <= 270);
    var linearG4 = linearGradient.append("linearGradient");
    linearG4.attr("id", that.clipPathCheck(path + "linearColors3", 'ID', masterID))
      .attr("x1", "0").attr("y1", "1").attr("x2", "1").attr("y2", "0");

    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 181 && data[i].cx <= 270) {
          linearG4.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(that.conData(data[i][arcType])));
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
      colors.push({ startAngle: start, endAngle: end });
    });

    // add arcs
    gArc.selectAll('.arc')
      .data(colors)
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('d', arc)
      .attr('stroke', 'none')
      .attr('fill', function (d, i) { return that.clipPathCheck(path + 'linearColors' + i, '', masterID); });
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
    if (datas.length > 0) {
      this.sharedData.showCenterLoader.next(false);
      that.sharedData.showMatLoader.next(false);
      that.sharedData.showCircleLoader.next(false);
    }
  }

  conData(val: any) { return val; }

  clipPathCheck(CPName: any, type: any, masterID: any) {
    let msID = masterID.replaceAll('#', '');
    if (type == 'ID') { return msID + '' + CPName; }
    else { return "url(#" + msID + '' + CPName + ')'; }
  }

  creatClockSlider(selComp: any) {
    let that = this;
    d3.select("#excluCircle_pre").selectAll("#cSlider").remove();
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var r: any = 150;
      r = parseInt(r);
      d3.select("#excluCircle_pre").selectAll("#cSlider").remove();

      var g = d3.select("#excluCircle_pre").select("#crlChart").append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')')
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

      this.SetClockHandle(selComp);
    }
  }

  SetClockHandle(d: any) {
    let that = this;
    let txt = d.compname;
    let txt1 = "(" + d.ticker + ") ";
    //if (that.showCircleScores) {
    //  txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%";
    //} else { txt1 = "(" + d.ticker + ") "; }
    if ((d.compname.length) > 18) { txt = d.compname.slice(0, 18).trim() + "..."; }
    try {
      var indexname: string = this.thematicService.customizeSelectedIndex_thematic.value['indexname'];
      this.sharedData.userEventTrack('Thematic Strategies', indexname, txt, 'center circle compani clicked');
    } catch (e) { }
    let val = d.cx;
    var sliTag = d3.select("#excluCircle_pre").select("#cSlider");
    var r: any = 150;
    sliTag.attr('transform', 'rotate(' + val + ')');
    sliTag.select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 50) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", "var(--leftSideText-B)");
    //.attr("fill", function () {
    //  if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
    //  else { return that.cl(d.score + 1); }
    //})

    sliTag.select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.measureText(txt1, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 40) * -1) : "190";
      }).attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", "var(--leftSideText-B)");

    var vBox: any = sliTag.select(".sText");
    var bbox: any = vBox.node().getBBox();
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
    sliTag.select("#cSliderCancel").on('click', function () { that.thematicService.selCompany.next(undefined); });
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
    var midtxt = d.compname + " (" + d.ticker + ") ";
    if (d.compname.length > 55) { midtxt = d.compname.slice(0, 52) + "... (" + d.ticker + ") "; }

    d3.select("#excluCircle_pre").select('.Sel_midCompS1').select('.SelCompName').attr('text-anchor', 'middle').attr('fill', 'var(--prim-button-color)').style('font-size', function () { if ((midtxt.length) > 30) { return "10px" } else { return "12px"; } })
      .attr('y', function () { if ((midtxt.length) > 50) { return "4" } else { return (midtxt.length) < 22 ? "14" : "6"; } })
      .style('font-family', 'var(--ff-bold)').text(midtxt).call(that.Crlwrapping, 185, "top", '');
    var medVel: any = d3.format(".1f")(d.score);
    d3.select("#excluCircle_pre").select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", function () { return that.cl(medVel + 1); })
      .style('font-size', ((that.sharedData._uname.indexOf('technogradient.com') > -1) || (that.sharedData._uname.indexOf('newagealpha.com') > -1)) ? '40px' : '48px')
      .style('font-family', "var(--ff-bold)").text(medVel);
    sliTag.select('.sRect1').style("fill", '#7e7e85')
    sliTag.select('.sRect').attr("stroke-width", 1).style("stroke", '#7e7e85');
  }

  Crlwrapping(text: any, width: any, p: any, X: any) {
    text.each(function (ev: any, d: any) {
      var text: any = d3.select(ev),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0, //<-- 0!
        lineHeight = 1.2, // ems
        x = text.attr("x"), //<-- include the x!
        y = text.attr("y"),
        dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
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

  measureText(string: any, fontSize = 9) {
    const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
    const avg = 0.5279276315789471
    return string.split('').map((c: any) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur: any, acc: any) => acc + cur) * fontSize
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
}
