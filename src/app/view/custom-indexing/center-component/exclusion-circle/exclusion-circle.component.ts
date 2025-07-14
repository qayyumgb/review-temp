import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { scaleLinear } from 'd3';
import * as d3 from 'd3';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
@Component({
  selector: 'app-exclusion-circle',
  templateUrl: './exclusion-circle.component.html',
  styleUrl: './exclusion-circle.component.scss'
})
export class ExclusionCircleComponent implements OnInit, OnDestroy {
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  tradeDt: string = '';
  sinceDt: string = '';
  total_components: number = 0;
  radius = 150;
  excompData: any = [];
  subscriptions = new Subscription();
  STW_Pricecurrency = '$';
  MedTxtColor = "#eee";
  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public preIndexService: PrebuildIndexService,) {
    this.sharedData.showCenterLoader.next(true);
  }

  HFscore: any;
  impRevValue: any = undefined;
  selCompText: string = '';
  ngOnInit() {
    var that = this;    
    var remGicsData = that.cusIndexService.remGicsData.subscribe(res => { });
    that.subscriptions.add(remGicsData);
    var remCompData = that.cusIndexService.remCompData.subscribe(res => { });
    that.subscriptions.add(remCompData);
    var exclusionCompData = that.cusIndexService.exclusionCompData.subscribe(res => { });
    that.subscriptions.add(exclusionCompData);

    var applyTrigger = that.cusIndexService.applyTrigger.subscribe(res => {
      if (res) {
        that.cusIndexService.applyTrigger.next(false);
        that.loadData();
      }
      });
    that.subscriptions.add(applyTrigger);

    this.creatGradienArc('#excluCircle_main');
    this.loadData();

    var selCompany = this.cusIndexService.selCompany.subscribe(res => {
      this.impRevValue = undefined;
      if (isNotNullOrUndefined(res)) {
        this.impRevValue = d3.format(".1f")(res['impRev'] * 100);
        this.STW_Pricecurrency = res['currency'] + ' ' + d3.format(",.1f")(res['price']);
        this.checkHandlePos(res);
      } else { d3.select("#excluCircle_main").selectAll("#cSlider").remove(); };

    }, error => { });
    that.cusIndexService.selCompany.next(undefined);
    this.subscriptions.add(selCompany);
  }

  checkHandlePos(d: any) {
    var exclCompData = [...this.cusIndexService._exclusionCompData].map(a => ({ ...a }));
    if (this.resetCircleScore()) {
      exclCompData = exclCompData.filter((x: any) => isNotNullOrUndefined(x.scores)).sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });      
    } else {
      exclCompData = exclCompData.sort(function (x, y) { return d3.descending(parseFloat(x.marketCap), parseFloat(y.marketCap)); });
    }    
    exclCompData.forEach(function (d, i) { d.cx = ((i * 360 / exclCompData.length) - 90); return d; });
    var rightGridData = [...exclCompData];
    var filExc = [...rightGridData].findIndex(x => x.stockKey == d.stockKey);
    var filRG = rightGridData.filter(x => x.stockKey == d.stockKey);
    try {
      if (filExc > -1 && filRG.length) { this.creatClockSlider(filRG[0], (filExc + 1)); }
      else { d3.select("#excluCircle_main").selectAll("#cSlider").remove(); };
    } catch (e) { }
  }

  creatClockSlider(selComp: any, rank: any) {
    let that = this;
    d3.select("#excluCircle_main").selectAll("#cSlider").remove();
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      //this.Slide_count = 0;
      //this.controlLeft();
      var r: any = this.radius;
      d3.select("#excluCircle_main").selectAll("#cSlider").remove();

      var g = d3.select("#excluCircle_main").select("#crlChart").append("g").attr("id", "cSlider").attr('transform', 'rotate(' + (-90) + ')')
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
  SetClockHandle(d: any, rank: any) {
    let that = this;
    let txt = d.companyName;
    let ticker: string = (isNotNullOrUndefined(d.ticker)) ? "(" + d.ticker + ") " : '';
    var txt1 =  + d3.format(".1f")(d.scores*100) + "%";
    if (that.resetCircleScore()) {
      txt1 = ticker + d3.format(".1f")(d.scores*100) + "%";
    } else { txt1 = ticker; }
    if ((d.companyName.length) > 18) { txt = d.companyName.slice(0, 18).trim() + "..."; }

    let val = d.cx;
    var sliTag = d3.select("#excluCircle_main").select("#cSlider");
    var r:any = this.radius;
    sliTag.attr('transform', 'rotate(' + val + ')');
    sliTag.select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.cusIndexService.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", "var(--leftSideText-B)");

    sliTag.select(".sText1").text(txt1)
      .style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.cusIndexService.measureText(txt1, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", "var(--leftSideText-B)");

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
    var midtxt = d.companyName + ticker;
    if (d.companyName.length > 55) { midtxt = d.companyName.slice(0, 52) + "... " + ticker; }

    d3.select("#excluCircle_main").select('.Sel_midCompS1').select('.SelCompName').attr('text-anchor', 'middle').attr('fill', 'var(--prim-button-color)').style('font-size', function () { if ((midtxt.length) > 30) { return "10px" } else { return "12px"; } })
      .attr('y', function () { if ((midtxt.length) > 50) { return "4" } else { return (midtxt.length) < 22 ? "14" : "6"; } })
      .style('font-family', 'poppins-bold').text(midtxt).call(that.sharedData.Crlwrapping, 185, "top");
    var medVel: any = d3.format(".1f")(d.scores);
    if (that.resetCircleScore()) {
      var per = d3.scaleLinear().domain([0, that.cusIndexService._exclusionCompData.length]).range([0, 100]);
      var colorVal = per(rank - 1);
      d3.select("#excluCircle_main").select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", function () { return that.cl(colorVal); })
        .style('font-size', ((that.sharedData._uname.indexOf('technogradient.com') > -1) || (that.sharedData._uname.indexOf('newagealpha.com') > -1)) ? '40px' : '48px')
        .style('font-family', "poppins-bold").text(medVel);
      sliTag.select('.sRect1').style("fill", function () {
        if (!that.resetCircleScore()) { return '#7e7e85'; } else { return that.cl(colorVal); }
      })
      sliTag.select('.sRect').attr("stroke-width", 1).style("stroke", function () {
        if (!that.resetCircleScore()) { return '#7e7e85'; } else { return that.cl(colorVal); };
      });
    } else {
      d3.select("#excluCircle_main").select('.Sel_midCompS1').select('.SelCompScore').attr('text-anchor', 'middle').style("fill", function () { return that.cl(medVel + 1); })
        .style('font-size', ((that.sharedData._uname.indexOf('technogradient.com') > -1) || (that.sharedData._uname.indexOf('newagealpha.com') > -1)) ? '40px' : '48px')
        .style('font-family', "poppins-bold").text(medVel);
      sliTag.select('.sRect1').style("fill", function () {
        if (!that.resetCircleScore()) { return '#7e7e85'; } else { return that.cl(medVel + 1); }
      })
      sliTag.select('.sRect').attr("stroke-width", 1).style("stroke", function () {
        if (!that.resetCircleScore()) { return '#7e7e85'; } else { return that.cl(medVel + 1); };
      });      
    }
    var txt_m: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    var midtxt = txt_m + ' ' + ticker;
    if (txt_m.length > 20) { midtxt = txt_m.slice(0, 20) + '... ' + ticker; };
    that.selCompText = midtxt;
    that.HFscore = d3.format(".1f")(d.scores * 100) + '%';
  }

  resetCircleScore() {
    if (this.cusIndexService.custToolSelectByValue.value == 1 || this.cusIndexService.custToolWeightByValue.value == 1) {
      return true;
    } else { return false; };
  }

  creatGradienArc(masterID: string) {
    let that = this;
    var data: any = [];
    var gC100 = scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
    var tempArcData:any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    data = [...tempArcData];
    if (this.resetCircleScore()) {
      gC100 = scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
    } else { gC100 = d3.scaleLinear<any>().domain([0, 100]).range(this.sharedData.cirArcGrdClr); }
    d3.select(masterID).select("#gradNewArc").remove();
    d3.select(masterID).select("#gradCompNewArc").remove();
    var gArc = null;
    var gArcLine = null;
    var arcType = "score";

    data = data.map((a: any) => ({ ...a }));
    data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / [...data].length) - 90); return d; });

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
    linearG1.attr("id", that.clipPathCheck("linearColors0", 'ID', masterID))
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
    linearG2.attr("id", that.clipPathCheck("linearColors1", 'ID', masterID))
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
    linearG3.attr("id", that.clipPathCheck("linearColors2", 'ID', masterID))
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
    linearG4.attr("id", that.clipPathCheck("linearColors3", 'ID', masterID))
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

  }

  loadData() {

    this.cusIndexService.getExclCompData().then((res: any) => {
      this.excompData = [...res];
      this.total_components = [...res].length;      
      this.creatGradienArc('#excluCircle_main');
      this.CreateComps('#excluCircle_main', [...res], "lvl1");
      try { this.fillCompetives([...res]); } catch (e) { }
      this.slider1Txts_centercircle();
    });
  }
  customType: any;
  dateforSector(date:any) {
    var d = new Date(date);
    var month = d.toLocaleString('default', { month: 'long' });
    return (d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear());
  }
  slider1Txts_centercircle() {
    var that = this;
    that.tradeDt = '';
    that.sinceDt = '';
    this.cusIndexService.customizeSelectedIndex_custom.pipe(first()).subscribe(customizeSelectedIndex => {
      this.customType = customizeSelectedIndex.indexType;
      let modeStr = customizeSelectedIndex.group;
      var medTxt = customizeSelectedIndex.med;
      if (that.customType == 'New Age Alpha Indexes') {
        var xx = [...that.preIndexService.NaaTooltipDesText].filter(d => d.IndexCode == customizeSelectedIndex.indexCode);
        if (xx.length > 0) {
          var since = xx[0].FirstValueDt;
          that.tradeDt = xx[0].Date;
          that.sinceDt = that.dateforSector(since);
        }
        else {
          that.tradeDt = '';
          that.sinceDt = '';
        }
      }
      else {
        //console.log('slider1Txts_centercircle', customizeSelectedIndex);
        //this.cusIndexService.performanceETFRList.pipe(first()).subscribe(res => {
        //  if (res.length > 0) {
        //    that.tradeDt = res[0].date;
        //    that.sinceDt = res[0].sinceDate;
        //  }
        //  else {
        //    that.tradeDt = '';
        //    that.sinceDt = '';
        //  }
        //});
      }
    });
  }
  checkNewSort(dta:any) {
    var that = this;
    var data = dta.map((a:any) => ({ ...a }));
    if (this.resetCircleScore()) {
      data = data.filter((x:any) => isNotNullOrUndefined(x.scores) && x.scores > 0);
      data = [...data].sort(function (x, y) { return d3.ascending(x.scores, y.scores); });
    }
    else { data = [...data].sort(function (x, y) { return d3.descending(x.marketCap, y.marketCap); }); };
    data.forEach(function (d:any, i:any) { d.cx = ((i * 360 / data.length) - 90); return d; });
    return [...data]
  }

  conData(val:any) { return val; }

  clipPathCheck(CPName: any, type: any, masterID: string) {
    let msID = masterID.replaceAll('#', '');
    if (type == 'ID') { return msID + '' + CPName; }
    else { return "url(#" + msID + '' + CPName + ')'; }
  }

  CreateComps(masterID: string, data: any, lvl: string) {
    let that = this;
    var compLst;
    var dta = this.checkNewSort([...this.cusIndexService._exclusionCompData]);
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst' + lvl).remove();
   
   compLst = oSvg.append("g").attr('class', 'compList compLst' + lvl).style("display", "block");
    d3.select("#gradArcLine").remove();
    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);

    var compg = compC.selectAll("g").data(dta).enter().append("g")
      .attr("class", function (d, i) {
        if (isNotNullOrUndefined(data) && data.filter((x:any) => x.isin == d.isin).length == 0) {
          return 'comp hiderect';
        } else { return 'comp'; };
      })
      .attr("transform", function (d, i) { return "rotate(" + (d.cx) + ")"; })
      //.attr("name", function (d) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .on("pointerenter", function (event, d) { })
      .style("display", function (d) { return "block"; })
      .on("pointerleave", function (event, elemData) {
        d3.select("#gCompMOver").style("display", "none");
        d3.select("#gCompeOver").style("display", "none");
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

    var lineMin = d3.min(dta.map(x => x.marketCap));
    var lineMax = d3.max(dta.map(x => x.marketCap));
    var lineData = d3.scaleLinear().range([5, 30]).domain([lineMin, lineMax]);
    compg.append("rect")
      .attr("height", "1px")
      .attr("class", function (d) {
        if (dta.length > 600) { return ("crect rectOpa " + that.cusIndexService.HFCompanyTxt(d)); }
        else { return ("crect " + that.cusIndexService.HFCompanyTxt(d)); }
      })
      .attr("fill", "#4b4b4b").attr("x", that.radius + 3).attr("width", 0).transition().duration(10)
      .attr("width", function (d) {
        let wtdwidth = 0;
        if (that.resetCircleScore()) {
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
        } else { return lineData(d.marketCap); }
      });

    /** Close Loader **/
    setTimeout(() => {
      this.sharedData.showCenterLoader.next(false);
      if (!this.cusIndexService._notifyDiClick) {
        this.sharedData.showCircleLoader.next(false);
      }
    }, 1000)
    /** Close Loader **/
  }

  fillCompetives(dta: any) {
    let that = this;
    var gs = null;
    var data = this.checkNewSort([...this.cusIndexService._exclusionCompData]);
    d3.select("#excluCircle_main #crlChart").select("#gCompetitive").remove();
    d3.select("#excluCircle_main #crlChart").select("#exclugCompetitiveRect").remove();
    gs = d3.select("#excluCircle_main").select('#crlChart').append("g").attr("id", "gCompetitive");
    d3.select("#excluCircle_main").select('#crlChart').append("g").attr("id", "exclugCompetitiveRect");
    gs.selectAll("g").remove();
    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) {
      sdata = data.filter(function (d, i) {
        if (dta.length < that.sharedData.ciMinCircleShowCount && dta.filter((x:any) => x.isin == d.isin).length > 0) { return d; }
        else if (i == 0 || (i % sublen) == 0) { return d; }
      });
    } else { sdata = data; }

    var ggs = gs.selectAll("g")
      .data(sdata)
      .enter().append("g")
      .attr("id", function (d) { return 'Cu_' + d.isin; })
      .attr("class", function (d) { return 'Cus_' + d.industry; })

      .attr("transform", function (d) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      })
      .style("opacity", function (d) {
        let sMin = 0;
        let sMax = 100;
        let opa = 0.6;
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { opa = .4; }
        else if (data.length > 180) { opa = 1 - (((sMax - sMin) / 100) - (.4)); }
        return opa;
      });

    ggs.append("text")
      .attr("x", function (d) { return that.cusIndexService.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", function (d): any {
        if (data.filter(x => x.isin == d.isin).length == 0) { return "var(--leftSideText)"; }
      })
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : that.resetCircleScore() ? "none" : "none" })
      .style("visibility", function () { return that.resetCircleScore() ? "visible" : "hidden" })
      .attr("transform", function (d): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.cusIndexService.txtanch(d); })
      .attr("class", function (d) {
        let highlightclass = '';
        if (isNotNullOrUndefined(dta)
          && dta.filter((x:any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt avbold " + highlightclass); }
        else { return that.cusIndexService.HFCompanyTxt(d) + " avbold " + highlightclass; }
      }).transition().text(function (d) { return d3.format(",.1f")(d.scores*100) + "%" });

    ggs.append("text")
      .attr("x", function (d) { return that.cusIndexService.txtx(d); })
      .style("fill", function (d): any {
        if (data.filter(x => x.isin == d.isin).length == 0) { return "var(--leftSideText)"; }
      })
      .attr("transform", function (d): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.cusIndexService.txtanch(d); })
      .attr("class", function (d) {
        let highlightclass = '';
        if (isNotNullOrUndefined(dta)
          && dta.filter((x: any) => x.isin == d.isin).length == 0) { return (that.cusIndexService.HFCompanyTxt(d) + " AVHideTxt avbold " + highlightclass); }
        else { return that.cusIndexService.HFCompanyTxt(d) + " avbold " + highlightclass; }
      })
      .transition()
      .text(function (d) {
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
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return cname.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });

    ggs.on("pointerenter", function (event, d) {
      if (data.length > fillMaxlen) {
        d3.select("#excluCircle_main #exclugCompetitiveRect").raise();
        d3.select("#excluCircle_main").select("#cSlider").raise();
      } else {
        if (dta.filter((x: any) => x.isin == d.isin).length > 0) { d3.select(this).classed("on", true); }
      }
    }).on("pointerleave", function (event, d) { d3.select(this).classed("on", false); });

    ggs.on("click", function (event, d) { that.fillmouseClick(d); });
    if (data.length > fillMaxlen) {
      that.fillCompetivesRect(data,dta);
    } else {
      d3.select("#excluCircle_main #exclugCompetitiveRect").selectAll("g").remove();
    };
    if (dta.length < 100) { d3.select('#exclusionchart').select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }
    else { d3.select('#exclusionchart').select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }
    d3.selectAll('#cSlider').raise();
  }

  fillCompetivesRect(data:any, dta:any) {
    var that = this;
    var gs: any;
    data = this.checkNewSort([...data]);
    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / data.length) - 90); return d });
    d3.select("#excluCircle_main #exclugCompetitiveRect").selectAll("g").remove();
    d3.select("#excluCircle_main #exclugCompetitiveRect").raise();
    gs = d3.select("#excluCircle_main #exclugCompetitiveRect");
    var arc = d3.arc().innerRadius(220).outerRadius(285)
      .startAngle(function (d) { return 0 * (Math.PI / 180); })
      .endAngle(function (d) { return 360 * (Math.PI / 180); })

    var ggs = gs.append("g").append("path").attr("fill", 'transparent').attr("d", arc);

    ggs.on("pointerenter", function (ev: any, d: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        if (dta.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data,ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    }).on("mousemove", function (ev:any, d:any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      //if (nA < 0) { nA = 360 + nA; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        if (dta.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data, ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    })
    gs.on("pointerleave", function () { gs.selectAll(".gfillCompMouseover").remove(); });
  }

  gfillCompMouseover(gs: any, d: any, dta: any, ev: any) {
    var that = this;
    dta = this.checkNewSort([...dta]);
    dta.forEach(function (d:any, i:any) { d.cx = ((i * 360 / dta.length) - 90); return d });
    gs.selectAll(".gfillCompMouseover").remove();
    var ggs = gs.append("g").attr("class", "gfillCompMouseover")
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'var(--ff-medium)')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.cusIndexService.txtx1(d)).attr("id", "gcStxt")
      .style("display", function () { return that.resetCircleScore() ? "block" : "none" })
      .style("visibility", function () { return that.resetCircleScore() ? "visible" : "hidden" })
      .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText)"; } else { return "var(--leftSideText)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.cusIndexService.txtanch(d))
      .attr("class", function () { return that.cusIndexService.HFCompanyTxt(d) + " avbold"; })
      .text(function () { return d3.format(",.1f")(d.scores*100) + "%" });

    ggs.append("text").attr("x", that.cusIndexService.txtx(d))
      .style("fill", function () { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "var(--leftSideText-B)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.cusIndexService.txtanch(d))
      .attr("class", function () { return that.cusIndexService.HFCompanyTxt(d); })
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

  fillmouseClick(d:any) { if (this.excompData.filter((x:any) => x.isin == d.isin).length > 0) { this.cusIndexService.selCompany.next(d); } }
}
