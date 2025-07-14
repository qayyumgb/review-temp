import { Component, Inject,ElementRef, OnDestroy, OnInit,ViewChild, ViewEncapsulation ,AfterViewInit} from '@angular/core';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../core/services/data/data.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
declare var $: any;
import * as d3 from 'd3';
import { Subscription, first } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';
@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CompareComponent implements OnInit, OnDestroy,AfterViewInit {
  radius = 150;
  subscriptions = new Subscription();
  selComp: any;
  selGICS: any;
  compGridData: any = [];
  breadcrumb: any = [];
  addCompGridData: any = [];
  comSearchData: any = [];
  selQtrData: any=[];
  circleData: any = [];
  selKey: any = "";
  showSelectAllBtn: boolean = false;
  ascCheck:boolean= false;
  compSelectAll: boolean = false;
  showSpinnerAcc_loaded: boolean = true;
  highlightList: any = '';
  selectedCompName: string = '';
  selectedCompTicker: string = '';
  holdingDate:any;
  from: string = '';
  asOfDate: string = "-";
  selectedIndex: string = '';
  selectedCat: any ;
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  FilterList: any = [];
  @ViewChild(CdkVirtualScrollViewport) virtualScroll!: CdkVirtualScrollViewport;
  constructor(private dialogref: MatDialogRef<CompareComponent>, public dataService: DataService,
    public sharedData: SharedDataService,public etfService: EtfsUniverseService,public equityService: EquityUniverseService, private logger: LoggerService, @Inject(MAT_DIALOG_DATA) public modalData: any) { }

  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };

  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'compare'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'compare', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    that.selComp = that.modalData.dialogSource['selComp'];
    that.breadcrumb = that.modalData.dialogSource['breadcrumb'];
    that.selGICS = that.modalData.dialogSource['selGICS'];
    that.from = that.modalData.dialogSource['from'];
    that.circleData = [...that.modalData.dialogSource['circleData']];
    that.holdingDate = that.modalData.dialogSource['holdingDate'];
   // console.log('circleData',that.holdingDate)
    that.loadCompareData();

    if (that.breadcrumb.length > 0) {
      var filtIndex = that.breadcrumb.filter((x: any) => x.group == 'Index');
      that.selectedCat = that.breadcrumb[that.breadcrumb.length - 1];
      if (filtIndex.length > 0) {
        that.selectedIndex = filtIndex[0]['name'];
      } else { that.selectedIndex = '' }
    }
    if (isNotNullOrUndefined(that.selComp) && isNotNullOrUndefined(that.selComp.stockKey)) {
      that.highlightList = that.selComp.stockKey;
      this.checkRankIndex(that.selComp);
      that.vir_ScrollGrids('', that.compGridData, that.highlightList);
    } else {
      that.vir_ScrollGrids('', that.compGridData, that.highlightList);
    }
    if (that.circleData.length > 0) {
      if (isNotNullOrUndefined(that.circleData[0]['tradeDate'])) {
        var date_t = that.circleData[0]['tradeDate'];
        this.asOfDate = date_t.slice(4, 6) + "/" + date_t.slice(6, 8) + "/" + date_t.slice(0, 4);
        const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Scores as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(this.asOfDate)
      } else { 
        // this.asOfDate = "-" 
        const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text('-')
      }
    } else {
      //  this.asOfDate = "-"
      const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text('-')
       }
    if (this.holdingDate.length > 0) {
      var filterDate = [...this.holdingDate].filter(x => x.group == 'ETFIndex');
      if (filterDate.length > 0 && isNotNullOrUndefined(filterDate[0]['holdingsdate'])) {
        var d = new Date(filterDate[0]['holdingsdate']);
        var dateMerge = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
        const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(dateMerge)
        // this.asOfDate = dateMerge;
      } else {
        // this.asOfDate = "-"
        const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text('-')
      }
    } else { 
      // this.asOfDate = "-" 
      const atext=  d3.select('#compareCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text('-')
    }
  
  }
  ngAfterViewInit(){
  
  this.virelementScrolled();
  }
  virelementScrolled() { this.virtualScroll.elementScrolled().pipe(first()).subscribe((event) => { }); };

  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    var virData = [];
    setTimeout(() => {
      const dontMove = 7;
    const viewportSize = this.virtualScroll.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 45);
    const totalItems = this.comSearchData.length - itemsVisible;
    virData = [...data]
    virData.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.virtualScroll.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...virData].filter(x => x.stockKey == selind);
      if (selIsins[0].index >= totalItems) {
        // console.log(selIsins[0].index)
         that.virtualScroll.scrollToIndex(selIsins[0].index + dontMove);
         setTimeout(() => { that.virtualScroll.scrollToIndex(selIsins[0].index + 10); }, 20);
       } else {
         setTimeout(() => {
          // console.log(selIsins[0].index)
           if (selIsins[0].index < dontMove) {
             this.virtualScroll.scrollToIndex(0);
           } else {
  
             //if (that.SRValue > 0 && virData.length > 500) {
             //  that.viewPort.scrollToIndex(selIsins[0].index + 10);
             //} else {
               that.virtualScroll.scrollToIndex(selIsins[0].index+3);
             //}
           }
         }, 100);
       }
    }
    }, 200);
    
  }
  GetScoreDtls() {  }
  close() { this.dialogref.close() }
  creatClockSlider(dta:any, selComp:any) {
    let that = this;
    d3.selectAll('#compare__Comp').selectAll("#cSlider").remove();
    var midtxt = '';
    var compNameLength = '';
    if (selComp.companyName.length > 15) { compNameLength = selComp.companyName.slice(0, 15) + "..."; }
    else { compNameLength = selComp.companyName };
    if (isNotNullOrUndefined(selComp.ticker) && selComp.ticker != '') {
      midtxt = compNameLength + " (" + selComp.ticker + ") ";
    } else { midtxt = compNameLength; }
    d3.select('#compareCircle').select('.SelCompName').text(midtxt);
    that.selectedCompName = selComp.companyName;
    that.selectedCompTicker = selComp.ticker;
    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d; });

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var da = dta.filter((x: any) => x.stockKey == selComp.stockKey);
      if (da.length > 0) { selComp = da[0]; }
    }

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      var r: any = that.radius;
      this.SetClockHandle(dta, selComp);
    }
   
  }

  checkHandleIndex(d:any) {
    var dt = [...this.equityService.rightGridData.value].map(a => ({ ...a }));
    // console.log('checkHandleIndex',dt)
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    return selIndex + 1 + "/" + dt.length;
  }
  checkRankIndex(d: any) {
    var data: any = [...this.circleData].sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); })
      .findIndex((x: any) => x.stockKey == d['stockKey']);
    this.selectedRank = (data + 1) + '/' + [...this.circleData].length;
  }
  selectedProbability: any;
  selectedRank: any;
  SetClockHandle(data: any, d: any, type: boolean = false) {
    //var rank = this.checkHandleIndex(d);
    //this.selectedRank = rank;
    this.selectedProbability = d3.format(".1f")(d.score);
    /*** CLick first slide value ***/
  }

  loadCompareData() {
  
    var that = this;
    this.showSelectAllBtn = false;
    if (isNotNullOrUndefined(that.selComp) && isNotNullOrUndefined(that.selComp['stockKey'])) {
      this.selKey = that.selComp['stockKey'];
      this.addCompGridData.push(that.selComp['stockKey']);
      d3.selectAll('#compare__Comp').selectAll("#cSlider" + this.selComp.isin).classed("clkd_cmp_active", true); 
    }
    var compData = [...this.sharedData._selResData];
   
    if (isNotNullOrUndefined(that.selGICS) && isNotNullOrUndefined(that.selGICS['code'])) {
      if (that.selGICS.group == "Sector") {
        that.compGridData = compData.filter((d: any) => d.industry.toString().substring(0, 2) == that.selGICS.code.toString());
      }
      else if (that.selGICS.group == "Industrygroup") {
        that.compGridData = compData.filter((d: any) => d.industry.toString().substring(0, 4) == that.selGICS.code.toString());
      }
      else if (that.selGICS.group == "Industry") {
        that.compGridData = compData.filter((d: any) => d.industry.toString().substring(0, 6) == that.selGICS.code.toString());
      }
      else if (that.selGICS.group == "Sub Industry") {
        that.compGridData = compData.filter((d: any) => d.industry.toString() == that.selGICS.code.toString());
        this.showSelectAllBtn = true;
      } else { that.compGridData = [...that.modalData.dialogSource['circleData']]; }
    } else { that.compGridData = [...that.modalData.dialogSource['circleData']]; }
    that.compGridData = that.compGridData.map((e: any, i: number) => ({ addComp: false, ...e }));
 
    this.comSearchData =  this.findMyHandleIndex_H([...that.compGridData]);
    this.selQtrData = this.findMyHandleIndex_H([...that.compGridData]);
  
    this.creatGradienArc('#compareCircle');
    try { that.loadeCircle(); } catch (e) { console.log(e) }
  }
  findMyHandleIndex_H(data: any) {

    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      return d
    });
    return data
  }
  ngOnDestroy() { }
  forceCloseLoader() {
    var that = this;
    setTimeout(() => { that.showSpinnerAcc_loaded = false; }, 500)
  }

  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'compare');
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Compare', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.compGridData);
    var selind = that.compGridData.filter((x: any) => x.isin == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.compGridData = [...dat]; } catch (e) { }
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.compGridData, that.highlightList);
        }, 200);
      }
    } catch (e) { }
  }
  onToggleAscending() {  
    let that = this;
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'compare'); }
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
 

  loadeCircle() {
    var that = this;
    that.circleData = that.circleData.sort(function (x: any, y: any) { return d3.ascending(x.score, y.score); });
    var len: number = that.circleData.length;
   
    
    that.circleData.forEach(function(e: any, i: number){
      e.cx = ((i * 360 / len) - 90);
      return e;
      });
    that.CreateComps('#compareCircle', that.circleData);
    that.fillCompetives(that.circleData);
    var filComp = [...that.circleData].filter(that.compare1([...that.addCompGridData]));
    try {
      if (filComp.length > 0) {
        this.AddClockSlider(filComp); 
        var midtxt = '';
        var compNameLength = '';
        if (this.selComp.companyName.length > 15) { compNameLength = this.selComp.companyName.slice(0, 15) + "..."; }
        else { compNameLength = this.selComp.companyName };
        if (isNotNullOrUndefined(this.selComp.ticker) && this.selComp.ticker != '') {
          midtxt = compNameLength + " (" + this.selComp.ticker + ") ";
        } else { midtxt = compNameLength; }
        d3.select('#compareCircle').select('.SelCompName').text(midtxt);
        that.selectedCompName = this.selComp.companyName;
        that.selectedCompTicker = this.selComp.ticker;
        var rank = this.checkHandleIndex(this.selComp);
        //this.selectedRank = rank;
        // console.log(this.selectedRank,rank,'selectedRank')
        d3.selectAll('#compare__Comp').selectAll("#cSlider" + this.selComp.isin).classed("clkd_cmp_active", true);
        that.forceCloseLoader();
      }
      else { d3.selectAll('.AddSlider').remove(); that.forceCloseLoader(); }
    } catch (e) { console.log(e) }
  }

  compare1(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return current.stockKey == other }).length > 0; } }

  addComp(d: any) {
    // console.log(d,'d')
    if (isNotNullOrUndefined(d['stockKey'])) {
      var addFI: any = this.addCompGridData.findIndex((x: any) => x == d['stockKey']);
      if (addFI < 0) { this.addCompGridData.push(d['stockKey']); }
      var cirFI: any = this.circleData.findIndex((x: any) => x.stockKey == d['stockKey']);
      if (cirFI<0) { this.circleData.push(d); }
      this.loadeCircle();
     
    }
    if (this.showSelectAllBtn) {
      if (this.addCompGridData.length >= this.comSearchData.length) { this.compSelectAll = true; }
      else { this.compSelectAll = false; }
    }
    if (isNotNullOrUndefined(d['companyName'])) {
      try {
        this.sharedData.userEventTrack('Compare', d['companyName'], d['companyName'], 'right grid add company click');
      } catch (e) { }
    }   
  }

  remComp(d: any) {
    if (isNotNullOrUndefined(d['stockKey'])) {
      var addFI: any = this.addCompGridData.findIndex((x:any)=> x == d['stockKey']);
      var cirFI: any = this.circleData.findIndex((x: any) => x.stockKey == d['stockKey']);
      this.addCompGridData.splice(addFI, 1);
      this.circleData.splice(cirFI, 1);
      this.loadeCircle();
    }

    if (this.showSelectAllBtn) {   
      if (this.addCompGridData.length >= this.comSearchData.length) { this.compSelectAll = true; }
      else { this.compSelectAll = false; }
    }
    if (isNotNullOrUndefined(d['companyName'])) {
      try {
        this.sharedData.userEventTrack('Compare', d['companyName'], d['companyName'], 'right grid remove company click');
      } catch (e) { }
    }    
  }

  creatGradienArc(masterID: string) {
    let that = this;
    var data = [];
    var tempArcData: any = [];
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

  CreateComps(masterID: string, dta:any) {
    let that = this;
    var compLst;
    var oSvg = d3.select(masterID).select("#crlChart");
    oSvg.selectAll('.compLst').remove();
    compLst = oSvg.append("g").attr('class', 'compList compLst').style("display", "block");

    d3.select("#gradArcLine").remove();
    var compC = compLst.append("g").attr("class", 'compLstC');
    var compg = compC.selectAll("g")
      .data(dta)
      .enter().append("g")
      .attr("class", "comp")
      .attr("transform", function (d: any, i: any) { return "rotate(" + (d.cx) + ")"; })
      .attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .on("pointerenter", function (event: any, d: any) {  })
      .style("display", "block")
      .on("pointerleave", function (event: any, d: any) {});

    let SelRes: any = [...that.sharedData._selResData];
    var dmin:any = d3.min(SelRes.map((x:any) => x.marketCap));
    var dmax: any = d3.max(SelRes.map((x: any) => x.marketCap));
    var dmean: any = d3.mean(SelRes.map((x: any) => x.marketCap));
    var dsum: any = d3.sum(SelRes.map((x: any) => x.marketCap));

    let ResMarketCap = SelRes.map((x: any) => x.marketCap);
    let LimitedCap = ResMarketCap.filter((x: any) => x < dmean && x != null);
    let dlimitedSum = d3.sum(LimitedCap);

    var rmax = (dmax - dmin) > 100 ? 100 : (dmax - dmin);
    rmax = rmax < 50 ? 50 : rmax;

    compg.append("rect")
      .attr("height", "1px")
      .attr("class", function (d: any) {
        if (dta.length > 600) { return ("crect rectOpa " + that.HFCompanyTxt(d)); }
        else { return ("crect " + that.HFCompanyTxt(d)); }
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

  }

  HFCompanyTxt(data: any) {
    var that = this;
    var scores = (data.score / 100);
    if (scores >= 0 && scores <= 0.25) { return 'HFCompRange0_25' }
    else if (scores >= 0.25 && scores <= 0.50) { return 'HFCompRange25_50' }
    else if (scores >= 0.50 && scores <= 0.75) { return 'HFCompRange50_75' }
    else if (scores >= 0.75 && scores <= 1) { return 'HFCompRange75_100' } else { return '' }
  }

  fillCompetives(dta: any) {
    let that = this;
    var gs = null;    
    let data = [...dta];
    d3.select("#compareCircle #crlChart").select("#gCCompetitive").remove();
    d3.select("#compareCircle #crlChart").select("#gCCompetitiveRect").remove();
    gs = d3.select("#compareCircle").select('#crlChart').append("g").attr("id", "gCCompetitive");
    d3.select("#compareCircle").select('#crlChart').append("g").attr("id", "gCCompetitiveRect");
    gs.selectAll("g").remove();

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) {
      sdata = data.filter(function (d, i) { if (i == 0 || (i % sublen) == 0) { return d; } });
    } else { sdata = data; }

    var ggs = gs.selectAll("g").data(sdata).enter().append("g")
      .attr("transform", function (d) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      }).style("opacity", 0.6);

    var grpG = ggs.append("g");
    grpG.append("text")
      .attr("x", function (d) { return that.sharedData.txtx1(d); })
      .attr("id", "gcStxt")
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : "none" })
      .attr("transform", function (d): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(d); })
      .attr("class", function (d) { return that.HFCompanyTxt(d) + " avbold" })
      .text(function (d) { return d3.format(",.1f")(d.score) + "%" });

    grpG.append("text")
      .attr("x", function (d) { return that.sharedData.txtx(d); })
      .attr("transform", function (d): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d) { return that.sharedData.txtanch(d); })
      .attr("class", function (d) { return that.HFCompanyTxt(d); })
      .text(function (d) {
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
          var rsvcnt1 = resvtxt1.length;
          var tolen = 13 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 13) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });
    grpG.on("click", function (event: any, d: any) { that.compClick(d) });

    ggs.on("pointerenter", function (event, d) { d3.select(this).classed("on", true); })
      .on("pointerleave", function (event, d) { d3.select(this).classed("on", false); });
    if (data.length > fillMaxlen) { that.fillCompetivesRect(dta); }
    else { d3.select("#gCCompetitiveRect").selectAll("g").remove(); }
  }

  fillCompetivesRect(data: any) {
    var that = this;
    var gs: any;
    d3.select("#gCCompetitiveRect").selectAll("g").remove();
    d3.select("#gCCompetitiveRect").raise();
    gs = d3.select("#gCCompetitiveRect");

    var arc: any = d3.arc().innerRadius(220).outerRadius(285)
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
        if (data.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data, ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    }).on("mousemove", function (ev: any) {
      var coordinaters = d3.pointers(ev, ggs.node());
      var x = coordinaters[0][0];
      var y = coordinaters[0][1];
      var nA = ((Math.atan2(y, x) * (180)) / Math.PI);
      if (nA < -90) { nA = nA + 360; }
      var dst = data.filter((x: any) => x.cx >= nA);
      if (dst.length > 0) {
        if (data.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
          that.gfillCompMouseover(gs, dst[0], data, ev);
        } else { gs.selectAll(".gfillCompMouseover").remove(); }
      }
    })
    gs.on("pointerleave", function () { gs.selectAll(".gfillCompMouseover").remove(); });
  }

  gfillCompMouseover(gs: any, d: any, dta: any, ev: any) {
    var that = this;
    gs.selectAll(".gfillCompMouseover").remove();
    var ggs = gs.append("g").attr("class", "gfillCompMouseover")
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'poppins-medium')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.sharedData.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () { return that.HFCompanyTxt(d) + " avbold"; }).text(function () { return d3.format(",.1f")(d.scores * 100) + "%" });

    ggs.append("text").attr("x", that.sharedData.txtx(d))
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () { return that.HFCompanyTxt(d); })
      .text(function () {
        var cName: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((d.cx) > 90) {
          let txt = "" + cName.trim() + "...";
          let resvtxt = "";
          var rsvcnt = resvtxt.length;
          var tolen = 15 - rsvcnt;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
        else {
          let txt = cName.trim() + "...";
          let resvtxt1 = "";
          var rsvcnt1 = resvtxt1.length;
          var tolen = 15 - rsvcnt1;
          var dottxt = "";
          if (txt.length > 15) { dottxt = "..." }
          return cName.slice(0, (tolen < 0 ? 1 : tolen)).trim() + dottxt;
        }
      });
    ggs.on("click", function () { that.compClick(d) });
  }

  AddClockSlider(filComp:any) {
    let that = this;
    var r: any = this.radius;
    d3.selectAll('.AddSlider').remove();
    //d3.selectAll("#cSlider" + this.selComp.isin).classed("clkd_cmp_active", true); 

    var g = d3.select("#compareCircle #crlChart").selectAll('.AddSlider').data(filComp).enter().append("g").attr("id", function (d: any) { return "cSlider" + d.isin; })
      .attr("class", "AddSlider").attr('transform', function (d: any) { return 'rotate(' + d.cx + ')'; }).attr('name', function (d: any) { return d.isin; });

    g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 2).attr("width", 20).attr("fill", "#A0A0A0");

    g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (15)).attr("height", "30").attr("width", "125")
      .attr("fill", "var(--primary-color-Alt)");

    g.append("text").attr("class", "sText-cmp").attr("x", 180).style("text-anchor", "start").attr("y", -3)
      .style("font-family", 'var(--ff-medium)').style("font-size", "10px").attr("fill", "#fff")
      .text(function (d: any) {
        var txt: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if ((txt.length) >= 12) {
          txt = txt.slice(0, 12).trim() + "...";
        } return txt;
      });

    g.append("text").attr("class", "sText1-cmp").attr("x", 180).attr("y", 9).style("text-anchor", "start")
      .style("font-size", "8px").attr("fill", "#f6f6f6").style("font-family", 'var(--ff-regular)')
      .text(function (d: any) { let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%"; return txt1; });

    g.append("circle").attr("class", "mCircle-cmp").style("text-anchor", "middle").attr("y", -3).attr("r", 12).attr("cx", 295).attr("cy", 0).attr("fill", "var(--cardsHighlightColor)");

    g.append("text").attr("class", "mText-cmp").attr("x", 295).style("text-anchor", "middle").attr("y", 4).style("font-family", 'var(--ff-medium)').style("font-size", "12px")
      .attr("fill", "#fff").text(function (d: any) { let txt1Score = d3.format(".0f")(d.score); return txt1Score; });

    g.select(".sRect").style("display", function (d: any) { return d.companyName == null ? "none" : "block"; }).attr("height", 30).attr("width", 125).attr("y", -(30 / 2));

    g.select(".sText-cmp").attr("transform", function (d: any) { return d.cx > 90 ? "rotate(180)" : null; }).style("text-anchor", function (d: any) { return d.cx > 90 ? "end" : "start"; })
      .style("display", function (d: any) { return d.companyName == null ? "none" : "block"; }).attr("fill", function () { return "#A0A0A0"; })
      .attr("x", function (d: any) { return d.cx > 90 ? "-180" : "180"; });

    g.select(".sText1-cmp")
      .attr("transform", function (d: any) { return d.cx > 90 ? "rotate(180)" : null; })
      .style("text-anchor", function (d: any) { return d.cx > 90 ? "end" : "start"; })
      .style("display", function (d: any) { return d.ticker == null ? "none" : "block"; }).attr("fill", function () { return "#A0A0A0"; })
      .attr("x", function (d: any) { return d.cx > 90 ? "-180" : "180"; });

    g.select(".mCircle-cmp").attr("transform", function (d: any) { return d.cx > 90 ? "rotate(180)" : null; })
      .style("text-anchor", function (d: any) { return d.cx > 90 ? "end" : "start"; })
      .style("display", function (d: any) { return d.score == null ? "none" : "block"; })
      .attr("cx", function (d: any) {
        var calW = that.mesureCompTx(d);
        return d.cx > 90 ? ((parseFloat(r) + (calW < 60 ? (calW + 20) : calW) + 45) * -1) : (parseFloat(r) + (calW < 60 ? (calW + 20) : calW < 64 ? (calW + 5) : calW) + 45);
      });

    g.select(".mText-cmp").attr("transform", function (d: any) { return d.cx > 90 ? "rotate(180)" : null; })
      .style("text-anchor", function (d: any) { return d.cx > 90 ? "middle" : "middle"; })
      .style("display", function (d: any) { return d.score == null ? "none" : "block"; }).attr("fill", function () { return "#fff"; })
      .attr("x", function (d: any) {
        var calW = that.mesureCompTx(d);
        return d.cx > 90 ? ((parseFloat(r) + (calW < 60 ? (calW + 20) : calW) + 45) * -1) : (parseFloat(r) + (calW < 60 ? (calW + 20) : calW < 64 ? (calW + 5) : calW) + 45);
      });

  }

  mesureCompTx(d: any) {
    var txt: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    if ((txt.length) > 15) { txt = txt.slice(0, 13).trim() + "..."; };
    let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%";
    var val = this.measureText(txt, 10);
    var val1 = this.measureText(txt1, 8);
    var max: any = d3.max([val, val1]);
    return parseFloat(max) + 5;
  }

  measureText(string:any, fontSize = 9) {
    const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
    const avg = 0.5279276315789471
    return string
      .split('')
      .map((c:any) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur: any, acc: any) => acc + cur) * fontSize
  }

  onSelAllChange(ev: any) {
    var that = this;
    that.addCompGridData = [];
    that.searchClose();

    setTimeout(() => {
      if (isNotNullOrUndefined(ev.checked) && ev.checked) {
        that.compSelectAll = true;
        that.circleData = [...that.modalData.dialogSource['circleData']];
        that.addCompGridData = that.compGridData.map((x: any) => x['stockKey']);
        that.compGridData.forEach((e: any) => {
          var cirFI: any = that.circleData.findIndex((x: any) => x.stockKey == e['stockKey']);
          if (cirFI < 0) { that.circleData.push(e) }
          e.addComp = true;
          return e;
        });
        that.virelementScrolled();
      } else {
        that.compSelectAll = false;
        that.circleData = [...that.modalData.dialogSource['circleData']];
        that.addCompGridData.push(that.selComp['stockKey']);
        that.compGridData.forEach((e: any) => { e.addComp = false; return e; });
      }
      that.loadeCircle();
    }, 200);

    try {
      this.sharedData.userEventTrack('Compare', 'Compare', 'Compare', 'right grid select all btn click');
    } catch (e) { }
  }
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  toggleSearch: boolean = false;
  searchText = '';
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
  }
  filterItems() {
    // console.log(this.compSelectAll,'compGridData')
    // console.log(this.addCompGridData,'addCompGridData')
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.compGridData = this.comSearchData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
    // if(!this.compSelectAll){

    //   this.addCompGridData = this.compGridData.map((x: any) => x['stockKey']);
    // }
    this.onSort();
  }
  selQtrDataSortedAsc: boolean = true;
  sortProductsAsc() {
    var that = this;
    that.selQtrDataSortedAsc = !that.selQtrDataSortedAsc;
    if (!this.selQtrDataSortedAsc) {
      // Sort in ascending order
      that.compGridData = [...that.selQtrData].sort((a, b) => a.companyName.localeCompare(b.companyName));
      //console.log('Sorted in ascending order:', this.sortedDirectIndexGridData);
    } else {
      // Sort in descending order
      that.compGridData = [...that.selQtrData].sort((a, b) => b.companyName.localeCompare(a.companyName));
      // console.log('Sorted in descending order:', this.sortedDirectIndexGridData);
    }
  }

  checkActive(d: any) {
    if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d['stockKey'])) {
      var fin: any = this.addCompGridData.findIndex((x: any) => x == d['stockKey']);
      if (fin > -1) { return true } else { return false }
    } else { return false; }
  }

  compClick(d: any) { this.dialogref.close({ selComp: d }); };

}
