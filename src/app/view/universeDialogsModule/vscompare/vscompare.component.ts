import { Component, Inject, OnDestroy, OnInit,ViewChild,ElementRef,AfterViewInit } from '@angular/core';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../core/services/data/data.service';
import { PrebuildIndexService } from '../../../core/services/moduleService/prebuild-index.service';
import { median } from 'd3';
// @ts-ignore
import * as d3 from 'd3';
declare var $: any;
import { animate, style, transition, trigger } from '@angular/animations';
import { first,Subscription } from 'rxjs';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IndexConstComponent } from '../../../core/Dialogs/index-const/index-const.component';
import { MatDialog } from '@angular/material/dialog';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { PerformancePopupComponent } from '../../charts-popup/performance-popup/performance-popup.component';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';
export const slideLeftAnimation = trigger('slideLeft', [
  transition(':enter', [
    style({ transform: 'translateX(50%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
]);
export const newListAnimation = trigger('newList', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);

declare var $: any;
@Component({
  selector: 'app-vscompare',
  templateUrl: './vscompare.component.html',
  styleUrl: './vscompare.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class VscompareComponent implements OnInit, OnDestroy,AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  options: Options = {
    floor: 0,
    ceil: 100,
    step: 10,
    showSelectionBar: true
  };
  radius = 150;
  subscriptions = new Subscription();
  showDefault_select: string = 'company';
  pinnedCompRight: boolean = false;
  indexSwitab: string = 'ETF';
  asOfDate: string = '';
  SectorEffecDate:string = '';
  Top10HoldingEffecDate:string = ''
  indexDescription: string = '';
  toggleSearch: boolean = false;
  assgUserDrpVal: number = 0;
  drilldown_List: any = [];
  rightGridData: any = [];
  naaGridData: any = [];
  bCrum: any = [];
  selGics: any;
  highlightList: any = '';
  selETFsGICS: any;
  showNaaIndex: boolean = false;
  showMatLoader:boolean = false;
  selvsNaaIndexes: any;
  selIndexSector: any = [];
  fsIndexPerformance: any = [];
  indexperformanceData: any = [];
  SectorBreakDownData: any = [];
  Top10HoldingData: any = [];
  YRData: any = [];
  comSearchData: any = [];
  naaSearchData: any = [];
  selETFIndex:any;
  selETFMed:any;
  selETFIndexname:any='';
  selETFIndexticker:any='';
  holdingDate:any;
  showSpinnerAcc_loaded: boolean = true;
  showStaData: boolean = true;
  MedTxtColor: string = "#3a4f7b";
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  FilterList: any = [{ "Name": 'Company Name', "value": "1", "ID": "CN_asc" }, { "Name": 'h-factor Score', "value": "2", "ID": "HF_asc" }, { "Name": 'Ticker', "value": "3", "ID": "T_asc" }];
  perStaTicker = { naaTic: '', etfTic: "", tab1: '', tab2: '' };
  chartData:any=[];
  constructor(private dialogref: MatDialogRef<VscompareComponent>, public dataService: DataService, private preBuiltService: PrebuildIndexService, public equityService: EquityUniverseService, public dialog: MatDialog, public etfService: EtfsUniverseService,
    public sharedData: SharedDataService, private logger: LoggerService, @Inject(MAT_DIALOG_DATA) public modalData: any) { }

  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  ngOnInit() { 
    var that = this;

    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'vs'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'vs', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var getIndexConstruction_prebuilt =that.preBuiltService.getIndexConstruction_prebuilt.subscribe((res: any) => { this.chartData = res; });
    // console.log('preBuiltService',this.preBuiltService.customizeSelectedIndex_prebuilt.value)
    var customizeSelectedIndex_prebuilt = that.preBuiltService.customizeSelectedIndex_prebuilt.subscribe((res: any) => {
      if (isNotNullOrUndefined(res['description'])) { this.indexDescription = res['description'];}
      if (isNotNullOrUndefined(res['indexname'])) { this.indexName = res['indexname']; }
      if (isNotNullOrUndefined(res['indexCode'])) { this.indexCode = res['indexCode']; }
      
    });
    that.subscriptions.add(getIndexConstruction_prebuilt);
    that.subscriptions.add(customizeSelectedIndex_prebuilt);
    this.selETFsGICS = this.modalData.dialogSource['selGICS'];
    this.selETFIndex = this.modalData.dialogSource['index'];
    this.selETFIndexname = this.selETFIndex.name;
    this.selETFIndexticker = this.selETFIndex.ticker;
    that.holdingDate = that.modalData.dialogSource['holdingDate'];
    if (isNotNullOrUndefined(this.selETFIndex['med'])) { this.selETFMed = this.selETFIndex['med']; };
    var gridData: any = this.findMyHandleIndex_H([...this.modalData.dialogSource['rightGridData']]); 
    this.rightGridData = [...gridData];
    this.comSearchData = [...gridData];
    if (this.holdingDate.length > 0) {
      var filterDate = [...this.holdingDate].filter(x => x.group == 'ETFIndex');
      if (filterDate.length > 0 && isNotNullOrUndefined(filterDate[0]['holdingsdate'])) {
        var d = new Date(filterDate[0]['holdingsdate']);
        var dateMerge = that.sharedData.formatedates(d.getMonth() + 1) + '/' + that.sharedData.formatedates(d.getDate()) + '/' + d.getFullYear();
        const atext=  d3.select('#vsCompCircle').selectAll('#sinceRCIncep').text("Holdings as of: ")
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
    this.getNAAData();
    this.creatGradienArc('#vsCompCircle');
    this.loadCircle();
    this.getIndexConstruction([]);

    var getSelectedRightSide: any = this.sharedData.getSelectedRightSide.subscribe((res: any) => {
      if (res == 'Y') {
        this.getSelectedRightSide = 'Y';
        if (this.showDefault_select == '') { this.showDefault_select = 'company' }
        else { this.showDefault_select = this.showDefault_select }
      }
      else {
        this.getSelectedRightSide = 'N';
        that.pinnedCompRight = this.sharedData._openPinnedRightSide;
        this.showDefault_select = ''
      }
    });
    this.subscriptions.add(getSelectedRightSide);
    var openPinnedRightSide: any = this.sharedData.openPinnedRightSide.subscribe((res: any) => {
      that.pinnedCompRight = res;
    });
    this.subscriptions.add(openPinnedRightSide);
  }
  showDefault_select_hover(select: string) {
    if (!this.sharedData._openPinnedRightSide) {
      this.showDefault_select = select;
    }
  }
  toggleIconSelect(select: string) {
    if (this.sharedData._getSelectedRightSide == 'Y' && this.showDefault_select == select) { this.showDefault_select = ''; this.sharedData.getSelectedRightSide.next('N'); }
    else { this.showDefault_select = select; this.sharedData.getSelectedRightSide.next('Y'); this.pinnedCompRight = this.sharedData._openPinnedRightSide; }
  }
  getSelectedRightSide: string = 'N';
  isSidebarHovered: boolean = false;
  openRightSideGrid() {
    this.getSelectedRightSide = 'Y';
  }
  onSidebarRightLeave() {
    this.isSidebarHovered = false;
    this.closeSidebarRightIfNeeded();
  }
  onSidebarRightEnter() {
    this.isSidebarHovered = true;
  }

  closeSidebarRightIfNeeded() {
    var rightSidebarOpen = this.sharedData._openPinnedRightSide;
    if (rightSidebarOpen) {
      this.getSelectedRightSide = 'Y';
    }
    else {
      this.getSelectedRightSide = 'N';
      setTimeout(() => { this.showDefault_select = '' }, 200)
    }
  }

  leftGridClick(d: any) {
    this.searchClose();
    this.selGics = d;
    this.selectedbCrumName = this.selGics.name;
    this.assgUserDrpVal = 0;
    if (isNotNullOrUndefined(d['group']) && d['group'] == "Index") {
      this.loadNaaData();
      // console.log('naa')
      d3.select("#vsCompCircle").selectAll("#vscSlider").remove()
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
      this.indexName = d.indexName;
      try {
        this.sharedData.userEventTrack('VS Compare', d.name, d.name, 'left grid index click');
      } catch (e) { }
    }
    else {
      this.bCrum.push(d);
      this.getNaaLvlData(d).then((res: any) => {
        this.drilldown_List = [...res];
        // console.log(this.drilldown_List,'drilldown_List')
        this.loadCircle();
        // console.log('loadCircle')
        d3.select("#vsCompCircle").selectAll("#vscSlider").remove()
        this.highlightList = "";
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
      });
    }
  this.preBuiltService.customizeSelectedIndex_prebuilt.next(d);
  }

  getIndexConstruction(data:any){
    var that = this;
    var getprebuild= that.dataService.GetPrebuildIndexConstruction(data).pipe(first()).subscribe((res:any)=>{
      // console.log(res,'getIndexConstruction')
      if (res[0] != "Failed") {
        that.preBuiltService.getIndexConstruction_prebuilt.next(res);
      }
   
    }, (error: any) => { console.log(error), that.sharedData.showCircleLoader.next(false); })
    this.subscriptions.add(getprebuild);
  }
  defaultPushPin(val: string) {
    var that = this;
    var pinnedName: string = '';
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    that.pinnedCompRight = !that.pinnedCompRight;
    if (that.pinnedCompRight) {
      that.sharedData.openPinnedRightSide.next(true);
    } else { that.sharedData.openPinnedRightSide.next(false); }
    //if (val == 'performance') {
    //  that.pinnedPerformanceRight = !that.pinnedPerformanceRight;
    //  pinnedName = that.pinnedPerformanceRight ? val : '';
    //} else if (val == 'components') {
    //  that.pinnedCompRight = !that.pinnedCompRight;
    //  pinnedName = that.pinnedCompRight ? val : '';
    //}

    //if (that.getPinnedMenuItems.length > 0) {
    //  var postData = {
    //    "userid": userid,
    //    "pId": that.getPinnedMenuItems[0].pid,
    //    "menuDisplay": "",
    //    "pMenu": pinnedName,
    //  }
    //  that.cusIndexService.pinnedPostMethod(postData);
    //}
  }
  ngAfterViewInit() {
    $('.dropdown-menu-right').click(function(event:any){
      // console.log('click')
      event.stopPropagation();
    });
  }
  findMyHandleIndex_H(data: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    let TotWt: any = d3.sum(data.map(function (d: any) { return (1 - d.scores); }));
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      d['Wt'] = ((1 - d.scores) / TotWt) * 100; 
      return d
    });
    var dat: any = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    return dat;
  }
  vsSelComp: any;
  vsCompClickNAA(d: any) {
    if (isNotNullOrUndefined(d)) {
      this.vsSelComp = d;
      // console.log('circleclick', d);
      //this.checkMedFillCompany(d);
      if (this.indexSwitab == 'ETF') {
        this.searchClose()
        this.searchCloseETF()
        this.creatClockSlider(this.rightGridData, d, this.rightGridData);
        this.showDefault_select = 'company'
        this.vir_ScrollGrids('', this.rightGridData, this.highlightList);
      } else {
        this.searchClose()
        this.searchCloseETF()
        this.creatClockSlider(this.naaGridData, d, this.naaGridData);
        this.showDefault_select = 'company'
        this.vir_ScrollGrids('', this.naaGridData, this.highlightList);
      }
      
    } else {
      this.highlightList = "";
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
      d3.select("#vsCompCircle").selectAll("#vscSlider").remove();
      d3.select("#yearMedian").style('display', 'block');
      d3.select("#companyMedian").style('display', 'none');
    }
  }
  findMyHandleIndex_NAA(data: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    let TotWt: any = d3.sum(data.map(function (d: any) { return (1 - d.scores); }));
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      d['Wt'] = ((1 - d.scores) / TotWt) * 100; 
      return d
    });
    var dat:any = data.sort(function (x:any, y:any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    return dat;
  }
  loadNaaData() {
    this.indexSwitab = "NAA";
    this.GetIndexDetails();
  }
  lineChartData: any = [];
  getIndex: any;
  GetIndexDetails() {
    this.showMatLoader = true;
    var that = this;
    var selectedIndex = this.selGics;
    this.lineChartData = [];
    var data = { "indexcode": selectedIndex['indexCode'] };
    this.perStaTicker.naaTic = selectedIndex['indexCode'];
    var getInd=this.dataService.GetIndexDetails(data).pipe(first()).subscribe((res: any) => {
      this.showNaaIndex = true;
      this.getIndex = res;
      that.preBuiltService.GetNAAIndexPerf.next(res);
      // console.log(this.getIndex,'getindex')
      if (isNotNullOrUndefined(res['indexMaster']) && res['indexMaster'].length > 0) {
        var indexId: number = res['indexMaster'][0]['indexId'];
        this.indexDescription = res['indexMaster'][0]['description'];
        this.selIndexSector = res['indexMaster'];
        // console.log(this.selIndexSector,'selIndexSector')
        this.GetTop10Holdings(indexId);
        this.GetSectorBreakDown(indexId);
        this.getNAAHoldings(indexId);
        this.createcomPPerformanceData();
        this.showDefault_select = 'etfPerformance';
        var BenchMarkId: number = (isNotNullOrUndefined(res["indexperformanceAll"][0]['BenchMarkId'])) ? res["indexperformanceAll"][0]['BenchMarkId'] : 0;
        this.GetIndexReturnsCalc(indexId, BenchMarkId);
      }
      if (isNotNullOrUndefined(res['fsIndexPerformance']) && res['fsIndexPerformance'].length > 0) {
        this.fsIndexPerformance = res['fsIndexPerformance'];      
      }
      if (isNotNullOrUndefined(res['indexperformanceAll']) && res['indexperformanceAll'].length > 0) {
        this.indexperformanceData = res['indexperformanceAll'];
        this.createYRtable(this.indexperformanceData);
        if (this.indexperformanceData.length > 0) { that.asOfDate = this.indexperformanceData[0].Date; }

        if (isNotNullOrUndefined(res["indexperformanceAll"][0]['BenchMarkId'])) { this.showStaData = true; } else { this.showStaData = false; }
      }      
    }, (error: any) => { });
    this.subscriptions.add(getInd);
  }

  GetIndexReturnsCalc(indexID: any, BMIndID: any) {
    var lineChart= this.dataService.getLineChartData(indexID, BMIndID).pipe(first()).subscribe((res: any) => {
      this.lineChartData = res;
    }, (error: any) => {
      this.lineChartData = [];
      this.logger.logError(error, 'getLineChartData');
    });
    this.subscriptions.add(lineChart);
  }

  getNAAHoldings(indexId: number) {
    var that = this;
    var naaHold= that.dataService.getNAAHoldings(indexId).pipe(first()).subscribe((naaStocks: any) => {
      this.naaGridData = [...naaStocks].map((e: any) => ({ stockKey: e.stockkey, ...e }));
      this.naaGridData = this.findMyHandleIndex_NAA([...this.naaGridData]);
      // console.log('naaGridData', this.naaGridData);
      this.naaSearchData = this.findMyHandleIndex_NAA([...this.naaGridData]); 
      // this.naaSearchData = [...naaStocks]; 
     
      this.loadCircle();
    }, (error: any) => { this.naaGridData = []; });
    this.subscriptions.add(naaHold);
  }

  GetTop10Holdings(indexId: number) {
    var getHold = this.dataService.GetTop10Holdings(indexId).pipe(first()).subscribe((res: any) => { this.Top10HoldingData = [...res]; 
      this.Top10HoldingEffecDate = this.dateforSectorWeight(this.Top10HoldingData[0].effectiveDate)
    });
    this.subscriptions.add(getHold);
  }

  GetSectorBreakDown(indexId: number) {
    var getSec= this.dataService.GetSectorBreakDown(indexId).pipe(first()).subscribe((res: any) => { this.SectorBreakDownData = [...res]; 
      this.SectorEffecDate = this.dateforSectorWeight(this.SectorBreakDownData[0].effectiveDate);  
    });
    this.subscriptions.add(getSec);
  }

  CompCheckPerfBefore: any;
  CompcheckPerfAfter: any;
  CompcheckPerfData: any;
  CompcheckPerformanceload() {
    if (isNullOrUndefined(this.CompCheckPerfBefore) || isNullOrUndefined(this.CompcheckPerfAfter)) { return true }
    else if (this.CompCheckPerfBefore.IndexId == this.CompcheckPerfAfter.IndexId && this.CompCheckPerfBefore.NAAIndexId == this.CompcheckPerfAfter.NAAIndexId
      && this.CompCheckPerfBefore.GICSid == this.CompcheckPerfAfter.GICSid && this.CompCheckPerfBefore.Range == this.CompcheckPerfAfter.Range
      && this.CompCheckPerfBefore.BMPercentage == this.CompcheckPerfAfter.BMPercentage && this.CompCheckPerfBefore.NAApercentage == this.CompcheckPerfAfter.NAApercentage
      && this.CompCheckPerfBefore.date == this.CompcheckPerfAfter.date && this.CompCheckPerfBefore.Ctype == this.CompcheckPerfAfter.Ctype) { return false } else { return true }
  }
  ComperNode: any = { NAApercentage: 0, BMPercentage: 100 };

  createcomPPerformanceData() {
    let that = this;
    that.ComperNode.BMPercentage = 100 - that.assgUserDrpVal;
    that.ComperNode.NAApercentage = that.assgUserDrpVal;
    var IndexId = 123;
    var SelAssetId = this.selETFsGICS.assetId;
    var NAAIndexId: number = this.selGics['indexId'];
    var seldate = new Date();
    var selEtfInd = [...that.sharedData._ETFIndex].filter(x => x.assetId == SelAssetId);
    if (selEtfInd.length > 0) {
      this.perStaTicker.etfTic = selEtfInd[0]['ticker'];
      this.perStaTicker.tab1 = (selEtfInd[0]['ticker'] + " & " + this.selGics['indexCode']);
      this.perStaTicker.tab2 = (selEtfInd[0]['ticker'] + " & Combined");
      seldate = new Date(selEtfInd[0].holdingsdate);
    }
    var date = seldate.getFullYear() + '-' + that.sharedData.formatedates(seldate.getMonth() + 1) + '-' + that.sharedData.formatedates(seldate.getDate());

    that.CompCheckPerfBefore = { 'indexid': IndexId, 'NAAIndexId': NAAIndexId, 'GICSid': SelAssetId, 'Ctype': "ETF", 'Range': 'top100', 'BMPercentage': that.ComperNode.NAApercentage, 'NAApercentage': that.ComperNode.BMPercentage, 'date': date };
    if (that.CompcheckPerformanceload() && isNotNullOrUndefined(NAAIndexId) && isNotNullOrUndefined(SelAssetId)) {
      var getETF= that.dataService.GetETFIndexRunsPerformanceDate(IndexId, NAAIndexId, SelAssetId, "ETF", 'top100', that.ComperNode.NAApercentage, that.ComperNode.BMPercentage, date).pipe(first()).subscribe((PortfolioData: any) => {
        that.CompcheckPerfAfter = { 'indexid': IndexId, 'NAAIndexId': NAAIndexId, 'GICSid': SelAssetId, 'Ctype': "ETF", 'Range': 'top100', 'BMPercentage': that.ComperNode.NAApercentage, 'NAApercentage': that.ComperNode.BMPercentage, 'date': date };
        that.CompcheckPerfData = PortfolioData;
        that.createcomPPerformanceLoad(PortfolioData);
      }, (error: any) => {
        this.logger.logError(error, 'GetETFIndexRunsPerformanceDate');
      });
      this.subscriptions.add(getETF);
    } else {
      if (that.CompcheckPerfData.length > 0) { that.createcomPPerformanceLoad(that.CompcheckPerfData); }
    }
  }

  indexSwitch(ev: any) {
    if (isNotNullOrUndefined(ev.value)) { this.indexSwitab = ev.value; } else { this.indexSwitab = "ETF"; };
    this.highlightList = "";
    d3.select("#vsCompCircle").selectAll("#vscSlider").remove();
    this.loadCircle();
  }
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  openSearch() {
    this.toggleSearch = true;
    setTimeout(() => {
      this.searchBox.nativeElement.focus();
    }, 100);
  }
  forceCloseLoader() {
    var that = this;
    setTimeout(() => { that.showSpinnerAcc_loaded = false; }, 500)
  }
  searchClose() {
    this.searchText = '';
    this.toggleSearch = false;
    this.filterItems();
    this.onSort();
  }
  searchCloseETF(){
    this.searchText = '';
    this.toggleSearch = false;
    this.filterItemsETF();
    this.onSortNAA()
  }
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.rightGridData = this.comSearchData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
  }
  filterItemsETF() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.naaGridData = this.naaSearchData.filter((item: any) => item.compname.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
  }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'vs');
  }
  FilterChangedNAA(val:any){
    this.SelFilter = val.value;
    this.onSortNAA();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'vs');
  }
  onSortNAA(){
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGridNAA(selFilterData.value, that.naaGridData);
    var selind = that.naaGridData.filter((x: any) => x.stockKey == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try {
      this.naaGridData = [...dat];
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.naaGridData, that.highlightList);
        }, 200);
      }

    } catch (e) { }
  }
  formatNameTrim(d: any) {
    if (isNotNullOrUndefined(d.name)) {
      var name = d.name.replaceAll('New Age Alpha', 'NAA');
      return name = name;
    } 
  }
  digitFormat(d: any) { return d3.format(",.1f")(d) }
  checkName(d:any) {
    // console.log(d,'name')
    
     if (d.group == "Index" && isNotNullOrUndefined(d.name)) {
      var name = d.name.replaceAll('New Age Alpha', 'NAA');
      if (name.length > 20) {
        name = name.slice(0, 19).trim() + "...";
       
      }
      else {
        name = name;
      }
      return name + ' (' + (d.indexCode) + ')';
    }
    return d.name;
  }
  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.rightGridData);
    var selind = that.rightGridData.filter((x: any) => x.stockKey == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.rightGridData = [...dat]; } catch (e) { }
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.rightGridData, that.highlightList);
        }, 200);
      }
    } catch (e) { }
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('VS Compare', selFilterData.Name, selFilterData.Name, 'right grid sort click');
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
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'vs'); }
  }
  onToggleAscendingNAA() {  
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSortNAA();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'vs'); }
  }
  RangeFilterGridNAA(IndexN:any, data:any) {
    var that = this;
    data = this.sharedData.onRightGridSort(data, this.SelFilter, this.ascending_val);
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.stockKey != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  RangeFilterGrid(IndexN:any, data:any) {
    var that = this;
    data = this.sharedData.onRightGridSort(data, this.SelFilter, this.ascending_val);
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.stockKey != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  h_facData:any = [];
  StatData: any = [];
  perData1: any = [];
  vsCompDate: any = '';
  rnAsofCompDate: any = '';
  createcomPPerformanceLoad(PortfolioData:any) {
    // console.log(PortfolioData,'PortfolioData')
    let that = this;
    var ETFcompScores: any = [];
    var ETFnaaScores: any = [];
    var ETFusrScores: any = [];
    var usrScores: any = [];

    if ([...this.rightGridData].length > 0) {
      var Sc: any = d3.median([...this.rightGridData].map(x => x.scores))
      ETFnaaScores.push((parseFloat(Sc) * 100));
      usrScores.push((parseFloat(Sc) * 100));
    }
    if ([...that.naaGridData].length > 0) {
      var naaSc: any = d3.median([...this.naaGridData].map(x => x.scores))
      ETFusrScores.push((parseFloat(naaSc) * 100));
      ETFusrScores.push((parseFloat(naaSc) * 100));

      ETFcompScores.push((ETFnaaScores[0] * that.assgUserDrpVal + usrScores[0] * (100 - that.assgUserDrpVal)) / 100);
      ETFcompScores.push((ETFnaaScores[1] * that.assgUserDrpVal + usrScores[1] * (100 - that.assgUserDrpVal)) / 100);
    }


    if (PortfolioData.length > 0) {
      if ([...this.rightGridData].length > 0 && ETFnaaScores.length > 0 && ETFusrScores.length > 0) {
        ETFcompScores = [];
        ETFcompScores.push((ETFnaaScores[0] * that.ComperNode.BMPercentage + ETFusrScores[0] * (100 - that.ComperNode.BMPercentage)) / 100);
        ETFcompScores.push((ETFnaaScores[1] * that.ComperNode.BMPercentage + ETFusrScores[1] * (100 - that.ComperNode.BMPercentage)) / 100);
      }
     
      var datas = {
        'H-Factor': [
          { 'H-Factor': 'Median h-factor', 'UserPortfolio': that.percentageFormate(this.selETFMed), 'NAAPortfolio': that.percentageFormate(this.selGics['medianCont']), 'Combined': that.percentageFormate(this.selGics['medianCont']) }],
        'Performance': [
          { 'Performance': 'YTD', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['ytdReturn']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['ytdReturn']), 'Combined': that.percentageFormateDash(PortfolioData[2]['ytdReturn']) },
          { 'Performance': '1 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['y1Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['y1Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y1Return']) },
          { 'Performance': '3 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['y3Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['y3Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y3Return']) },
          { 'Performance': '5 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['y5Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['y5Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y5Return']) },
          //{ 'Performance': '7 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['y7Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['y7Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y7Return']) },
          { 'Performance': '10 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[0]['y10Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[1]['y10Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y10Return']) },
        ],
        'Statistics': [
          { 'Statistics': 'Annualized Alpha', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['annulaizedAlpha']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['annulaizedAlpha']), 'Combined': that.percentageFormate(PortfolioData[2]['annulaizedAlpha']) },
          { 'Statistics': 'Information Ratio', 'UserPortfolio': that.valueFormat(PortfolioData[0]['informationRatio']), 'NAAPortfolio': that.valueFormat(PortfolioData[1]['informationRatio']), 'Combined': that.valueFormat(PortfolioData[2]['informationRatio']) },
          { 'Statistics': 'Beta', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['beta']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['beta']), 'Combined': that.percentageFormate(PortfolioData[2]['beta']) },
          { 'Statistics': 'Upside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['upsideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['upsideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['upsideCapture']) },
          { 'Statistics': 'Downside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['downSideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['downSideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['downSideCapture']) },
          { 'Statistics': 'Correlation', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['correlation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['correlation']), 'Combined': that.percentageFormate(PortfolioData[2]['correlation']) },
          { 'Statistics': 'Batting Average', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['battingAverage']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['battingAverage']), 'Combined': that.percentageFormate(PortfolioData[2]['battingAverage']) },
          { 'Statistics': 'Standard Deviation', 'UserPortfolio': that.percentageFormate(PortfolioData[0]['stdDeviation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[1]['stdDeviation']), 'Combined': that.percentageFormate(PortfolioData[2]['stdDeviation']) }]
      }

      that.h_facData = datas['H-Factor'];
      that.StatData = datas['Statistics'];
      that.perData1 = datas['Performance'];
      if(isNotNullOrUndefined(PortfolioData[1].date)){
        that.vsCompDate = PortfolioData[1].date;
        this.rnAsofCompDate = 'Returns calculated from ' + PortfolioData[1]['sinceDate'] + ' to ' + PortfolioData[1]['date']
      }
      // console.log(PortfolioData[1],'PortfolioData[1]');
    } else if (PortfolioData.length <= 0) { }
    that.forceCloseLoader();
  }
  selectedbCrumName: string = '';
  indexName:string = '';
  indexCode:string='';

  prevClick() {
    this.indexSwitab = "ETF";
    this.bCrum.splice(this.bCrum.length - 1, 1);
    if (this.bCrum.length > 0) {
      this.selGics = this.bCrum[this.bCrum.length - 1];
      this.selectedbCrumName = this.selGics.name
      this.indexName='';
       d3.select("#vsCompCircle").selectAll("#vscSlider").remove()
      this.highlightList = ''
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
    } else { 
      this.selGics = undefined;
      this.selectedbCrumName = '';
       d3.select("#vsCompCircle").selectAll("#vscSlider").remove()
      this.highlightList = ''
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
      // d3.select("#vsCompCircle").selectAll("#cSlider").remove();
      // this.searchClose();
      // console.log('false')
     };
    this.getNaaLvlData(this.selGics).then((res: any) => {
      // console.log('getNaaLvlData')
      this.drilldown_List = [...res];
      this.loadCircle();
     
    });
  }

  ngOnDestroy() {
    this.preBuiltService.GetNAAIndexPerf.next([]);
    this.subscriptions.unsubscribe();
  }

  getNAAData() {
    var that = this;
    if (that.preBuiltService.NAAEquityIndexes.value.length > 0) { this.buildNaaData() } else {
    var naaMas=  this.dataService.getNAAMaster_1().pipe(first()).subscribe((naaIndex: any) => {
        var naaInd = naaIndex.filter((x: any) => x.indexId != that.preBuiltService.EQGrowthValue['S&PValue'] && x.indexId != that.preBuiltService.EQGrowthValue['S&PGrowth']);
        that.preBuiltService.NAAEquityIndexes.next(naaInd);
        this.buildNaaData()
      });
      this.subscriptions.add(naaMas);
    }
  }

  buildNaaData() { this.getNaaLvlData(this.selGics).then((res: any) => { 
    this.drilldown_List = [...res]; 
    // console.log(this.drilldown_List,'naa')
    // var filterIndex = this.drilldown_List.filter((x:any)=>x['group'] == "Index")
    // console.log(filterIndex,'drill')

  });
 };

  getNaaLvlData(level:any) {
    var that = this;
    this.showNaaIndex = false;
    // console.log('showNaaIndex')
    this.showDefault_select = 'company'
    this.assgUserDrpVal = 0;
    this.indexSwitab = "ETF";
    var data: any = that.preBuiltService.NAAEquityIndexes.value;
    // console.log(data,'data')
    if (isNullOrUndefined(level)) { level = { group: "Home" }; }
    return new Promise((resolve, reject) => {
      switch (level.group) {
        case ("Category"): {
          var countryCat: any = data.filter((x: any) => x.category == level.name).map((x: any) => x.countryCat);
          let country: any = [...new Set(countryCat)];
          var matchData: any = country.map((item: any) => ({
            name: item,
            group: "Country",
            Category: level.name,
            med: that.GetNaaCountryMed(level.name, item),
            indexType: 'New Age Alpha Indexes',
            ...item
          }));
          resolve(matchData)
          break;
        }
        case ("Country"): {
          let Index: any = data.filter((x: any) => x.category == level.Category && x.countryCat == level.name);
          var matchData: any = Index.map((item: any) => ({
            name: item['indexName'],
            group: "Index",
            med: item.medianCont,
            indexType: 'New Age Alpha Indexes',
            ...item
          })); 
          resolve(matchData)
          break;
        }
        default: {
          let category:any= [...new Set(data.map((x: any) => x.category))];
          // console.log(category,'category')
          // var matchData: any = category.map((item: any) => ({
          //   name: item, group: "Category",
          //   med: that.GetNaaMed(item),
          //   indexType: 'New Age Alpha Indexes',
          //   ...item
          // }));
          var matchData: any = [];
           category.forEach((item: any) => {
            matchData.push({
              name: item, group: "Category",
              med: that.GetNaaMed(item),
              indexType: 'New Age Alpha Indexes'
            })
          });
          resolve(matchData)
          break;
        }
      }
    });
  }

  GetNaaMed(ctname: string) {
    var data: any = this.preBuiltService.NAAEquityIndexes.value;
    var medianCont: any = data.filter((x: any) => x.category == ctname).map((x: any) => x.medianCont);
    return median(medianCont);
  }

  GetNaaCountryMed(ctname: string, country: string) {
    var data: any = this.preBuiltService.NAAEquityIndexes.value;
    var medianCont: any = data.filter((x: any) => x.category == ctname && x.countryCat == country).map((x: any) => x.medianCont);
    return median(medianCont);
  }

  close() { this.dialogref.close() }

  checkDOI(d: any) {
    if (isNotNullOrUndefined(d['dOI'])) { return d['dOI'] }
    else if (isNotNullOrUndefined(d['doi'])) { return d['doi'] }
    else { return undefined }
  }

  formName(name: string) {
    if (isNullOrUndefined(name)) { return name.replace("New Age Alpha ", ""); } else { return name.replace("New Age Alpha ", ""); }
  }

  replacehf(x: any) { if (isNotNullOrUndefined(x)) { return x.replace("HF", "h-factor"); } else { return '-'; } }



  openCumulativeChart() {
    var title = 'Cumulative Performance';
    var clickeddata: any = this.lineChartData;
    // console.log(clickeddata, 'clickeddata')
    var titleData: any = this.selIndexSector;
    var DM: any = this.indexperformanceData;
    var BMvalue: string = '';
    if (isNotNullOrUndefined(DM['indexperformanceAll']) && DM['indexperformanceAll'].length > 1 && isNotNullOrUndefined(DM['indexperformanceAll'][1]['IndexName'])) {
      BMvalue = this.preBuiltService.getBMIndexName(DM['indexperformanceAll'][1]).replace('New Age Alpha ', '');
    } else { BMvalue = '' }

    if (isNotNullOrUndefined(clickeddata.indexValues) && clickeddata.indexValues.length > 0) {
      this.dialog.open(PerformancePopupComponent, { width: "90%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, selectedIndex: titleData, BMData: BMvalue } });
    } else {}

  }
  dateforSectorWeight(date:any) {
    var d = new Date(date);
    return (d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear());
  }
  createYRtable(perfData: any) {
    var that = this;
    var yearList = [];
    var YRData: any = [];
    var selIndex: any = (perfData.length > 0) ? perfData[0] : undefined;
    var BMIndex: any = (perfData.length > 1) ? perfData[1] : undefined;
    if (isNotNullOrUndefined(selIndex)) {
      for (var i = 0; i < 30; i++) {
        var temp = that.preBuiltService.GetYear(selIndex.Date, i + 1);
        var cDate;
        if (parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(0, 2)) != 1) {
          cDate = parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(6, 10)) + 1;
        } else { cDate = parseInt(that.preBuiltService.dateforSector(selIndex.FirstValueDt).slice(6, 10)); }
        if (cDate <= temp) { yearList.push(temp); }
      }
    }

    yearList.forEach((item, i) => {
      var perftemp = selIndex['Year' + (i + 1)];
      if (perftemp != null) {
        perftemp = that.preBuiltService.formatPercentage(perftemp)
        perftemp = perftemp.toLocaleString('en') + '%';
      } else {
        perftemp = '-';
      }
      if (isNotNullOrUndefined(BMIndex)) {
        var BMtemp = BMIndex['Year' + (i + 1)];
        if (BMtemp != null) {
          BMtemp = that.preBuiltService.formatPercentage(BMtemp);
          BMtemp = BMtemp.toLocaleString('en') + '%';
        } else {
          BMtemp = '-';
        }
        if (perftemp != '-' && BMtemp != '-') { YRData.push({ 'year': item, 'perfVal': perftemp, 'BMVal': BMtemp }); }
      }
      else { if (perftemp != '-') { YRData.push({ 'year': item, 'perfVal': perftemp }); } }
    });
    this.YRData = [...YRData];
  }

  valueFormat(value: any) {
    value = +value;
    if (value == '-') { return '-'; }
    else if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00'; }
    else { return value.toFixed(2) }
  }

  percentageFormateDash(value: any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return value.toFixed(2) + "%" }
  }

  percentageFormate(value: any) {
    value = +value;
    if (value == '-') { return '-'; }
    else if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00%'; }
    else { return value.toFixed(2) + "%" }
  }

  vsperStatSliderChange(ev: any) {
    if (isNotNullOrUndefined(ev.value)) {
      this.assgUserDrpVal = parseInt(ev.value);
      this.createcomPPerformanceData();
    } else {
      this.assgUserDrpVal = 0;
      this.createcomPPerformanceData();
    }
  }

  loadCircle() {
    var data: any = [];
    if (this.indexSwitab == 'NAA') { data = [...this.naaGridData]; }
    else { data = [...this.rightGridData]; }
    data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    data.forEach(function (d: any, i: any) {
      d.cx = ((i * 360 / data.length) - 90);
      return d
    });
    this.showMatLoader = false;
    this.CreateComps(data, "lvl1");
    this.fillCompetives(data);
    this.centerSliderTxt(data);
    if (this.indexSwitab == 'NAA') { this.onSortNAA(); } else { this.onSort(); }
  }
  
  centerSliderTxt(data: any) {
    var that = this;
    var name: string = "";
    var ticker: string = "";
    var med: number = 0;
    
    if (this.indexSwitab == 'NAA' && isNotNullOrUndefined(this.selGics)) {
      name = this.formName(this.selGics.name);
      ticker = "(" + this.selGics['indexCode'] + ")";
      if (isNotNullOrUndefined(this.selGics['medianCont'])) {
        med = this.selGics['medianCont'];
      } else {
        var scr: any = d3.median(data.map((x: any) => x.scores));
        med = parseFloat(scr) * 100;
      }
    } else {
      name = this.selETFIndexname;
      ticker = "(" + this.selETFIndexticker + ")";
      med = this.selETFMed;
    }
    if (name.length > 28) { name = name.slice(0, 28).trim() + "..."; }
    d3.select('#vsCompCircle').select('#indexName').text(name)
    d3.select('#vsCompCircle').select('#indexTicker').text(ticker)
    var color = this.etfService.checkMedColor(data, med);
    d3.select('#vsCompCircle').select('#indexMed').text(d3.format(".1f")(med)).style("fill", function () { return that.cl(color); })
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
    gArc = d3.select(masterID).select("#crlChart_vs").append("g").attr("id", "gradArc");
    gArcLine = d3.select(masterID).select("#crlChart_vs").append("g").attr("id", "gradArcLine");

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

  CreateComps(dta: any, lvl: any) {
    let that = this;
    var compLst;

    var oSvg: any = d3.select('#vsCompCircle #crlChart_vs');
    oSvg.selectAll('.compLst' + lvl).remove();
    compLst = oSvg.append("g").attr('class', 'compList show_comp_list compLst' + lvl).style("display", "block");
    d3.select("#gradArcLine").remove();

    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);
    var compg = compC.selectAll("g")
      .data(dta)
      .enter().append("g")
      .attr("class", "comp")
      .attr("transform", function (d: any, i: any) { return "rotate(" + (d.cx) + ")"; })
      //.attr("name", function (d: any) { return d.stockKey + "_" + d.indexName.replace(/ /g, '_') })
      .style("display", "block")
      .on("mouseover", function (ev: any, d: any) {
        d3.select(ev).raise();
      })
      .on("mouseout", function (ev: any, d: any) {
        d3.select("#gCompMOver").style("display", "none");
        d3.select("#gCompeOver").style("display", "none");
        d3.select(ev).select(".crect").classed("onrect", false);
      });

    let SelRes = [...that.sharedData._selResData];
    if (SelRes.length == 0) { SelRes = [...dta]; }
    var dmin = d3.min(SelRes.map(x => x.marketCap));
    var dmax = d3.max(SelRes.map(x => x.marketCap));
    var dmean: any = d3.mean(SelRes.map(x => x.marketCap));
    var dsum = d3.sum(SelRes.map(x => x.marketCap));

    let ResMarketCap = SelRes.map(x => x.marketCap);
    let LimitedCap = ResMarketCap.filter(x => x < dmean && x != null);
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
        var mcap: number = d.marketCap;
        if (isNullOrUndefined(mcap) || isNotNullOrUndefined(d.marketcap)) { mcap = d.marketcap; }
        let wtdwidth = 0;
        var wt = ((mcap / dlimitedSum) * 10000);
        if (mcap < dmean) {
          wtdwidth = wt;
        }
        else {
          wt = ((mcap / dsum) * 10000);
          if (wt > 18) { wt = 18 + wt / 10; }
          wtdwidth = wt;
        }
        if (wtdwidth > 25) { wtdwidth = 25 + wtdwidth / 10; }
        if (wtdwidth > 40) { wtdwidth = 40; }
        return wtdwidth + 2;
      });
    /*that.HFCompanyArc();*/
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
    var gs: any = null;
    let data = [...dta];
    d3.select("#vsCompCircle #crlChart_vs").select("#gCompetitive").remove();
    d3.select("#vsCompCircle #crlChart_vs").select("#vsCompCirclegCompetitiveRect").remove();
    gs = d3.select("#vsCompCircle").select('#crlChart_vs').append("g").attr("id", "gCompetitive");
    d3.select("#vsCompCircle").select('#crlChart_vs').append("g").attr("id", "vsCompCirclegCompetitiveRect");

    gs.selectAll("g").remove();
    data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) { sdata = data.filter(function (d: any, i: any) { if (i == 0 || (i % sublen) == 0) { return d; } }); }
    else { sdata = data; }

    var ggs: any = gs.selectAll("g")
      .data(sdata)
      .enter().append("g")
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      }).attr("id", function (d: any) { return "vs_" + d.stockKey })
      //.style("opacity", function (d: any) {
      //  let opa = 1;
      //  if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { opa = 1; }
      //  return opa;
      //});

    ggs.append("text")
      .attr("x", function (d: any) { return that.sharedData.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", function (d: any): any { if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return "#1d397b"; } })
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : "none" })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt avbold"); }
        else { return that.HFCompanyTxt(d) + " avbold"; }
      }).text(function (d: any) { return d3.format(",.1f")(d.scores * 100) + "%" });

    ggs.append("text")
      .attr("x", function (d: any) { return that.sharedData.txtx(d); })
      .style("fill", function (d: any): any { if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return "#1d397b"; } })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt"); }
        else { return that.HFCompanyTxt(d); }
      })
      .text(function (d: any) {
        var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if (isNotNullOrUndefined(d.compname)) { Cname = d.compname; }
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

    ggs.on("pointerenter", function (event: any, d: any) {
      if (data.length > fillMaxlen) {
        d3.select("#gCCompetitiveRect").raise();
        d3.select('#crlChart_vs').raise();
        if (dta.filter((x: any) => x.stockKey == d.stockKey).length > 0) {
          var key: string = "#vs_" + d.stockKey;
          d3.select("#vsCompCircle").select("#gCompetitive").selectAll("g").classed("on", false);
          d3.select(key).classed("on", true);
        }
      } else {
        if (dta.filter((x: any) => x.stockKey == d.stockKey).length > 0) {
           //console.log(d.stockkey, d, dta.filter((x: any) => x.stockKey == d.stockKey));
          var key: string = "#vs_" + d.stockKey;
          d3.select("#vsCompCircle").select("#gCompetitive").selectAll("g").classed("on", false);
          d3.select(key).classed("on", true);
        }
      }
    }).on("pointerleave", function (event: any, d: any) {
      d3.select("#vsCompCircle").select("#gCompetitive").selectAll("g").classed("on", false);
    });

    ggs.on("click", function (eve: any, d: any) { that.fillmouseClick(d); });
    //that.HFCompanyArc();
    if (data.length > fillMaxlen) { that.fillCompetivesRect(data, dta); } else {
      d3.select("#vsCompCircleRect").selectAll("g").remove();
    }

    //that.checkCenSliChange();
    if (dta.length < 100) { d3.select('#vsCompCircle').select('#gCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#vsCompCircle').select('#gCompetitive').selectAll('g').style('opacity', '0.4'); }

    d3.select('#crlChart_vs').raise();
    that.forceCloseLoader();
  }

  fillmouseOver(selTag: any, d: any) { }
  fillmouseClick(d: any) { this.vsCompClickNAA(d); }
  fillmouseOut(d: any) { }

  fillCompetivesRect(data: any, dta: any) {
    var that = this;
    var gs: any;
    d3.select("#vsCompCircleRect").selectAll("g").remove();
    d3.select("#vsCompCircleRect").raise();
    gs = d3.select("#vsCompCircleRect");

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
    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d });
    gs.selectAll(".gfillCompMouseover").remove();
    var ggs = gs.append("g").attr("class", "gfillCompMouseover")
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'poppins-medium')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.sharedData.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function (): any { if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () { return that.HFCompanyTxt(d) + " avbold"; }).text(function () { return d3.format(",.1f")(d.scores * 100) + "%" });

    ggs.append("text").attr("x", that.sharedData.txtx(d))
      .style("fill", function (): any { if (dta.filter((x: any) => x.stockKey == d.stockKey).length == 0) { return "#1d397b"; } else { return "#4b4b4b"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () { return that.HFCompanyTxt(d); })
      .text(function () {
        var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
        if (isNotNullOrUndefined(d.compname)) { Cname = d.compname; }
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
    ggs.on("click", function () { that.vsCompClickNAA(d); });

  }

  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    //data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    //if (selind == undefined || selind == "" || selind == null) {
    //  that.highlightList = "";
    //  setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);

    //}
    //else {
    //  var selIsins = [...data].filter(x => x.stockKey == selind);
    //  if (selIsins[0].index >= data.length - 20) {

    //    setTimeout(() => {
    //      const middleIndex = Math.max(selIsins[0].index - Math.floor(this.viewPort.getViewportSize() / 100));
    //      this.viewPort.scrollToIndex(middleIndex);
    //    }, 500);
    //  } else {
    //    setTimeout(() => {
    //      const middleIndex = Math.max(selIsins[0].index - Math.floor(this.viewPort.getViewportSize() / 100));
    //      this.viewPort.scrollToIndex(middleIndex);

    //    }, 100);
    //  }
    //}
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    // const currentIndex = this.viewPort.getRenderedRange().start;
    const totalItems = data.length - itemsVisible;
    // console.log(viewportSize, itemsVisible, currentIndex);
    data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].filter(x => x.stockKey == selind);
      if (selIsins[0].index >= totalItems) {
        // console.log(selIsins[0].index)
        that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
        setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + dontMove); }, 10);
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
  }

  creatClockSlider(dta: any, selComp: any, gridData:any) {
    let that = this;
    d3.select("#vsCompCircle").selectAll("#vscSlider").remove();

    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d; });

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var da = dta.filter((x: any) => x.stockKey == selComp.stockKey);
      if (da.length > 0) { selComp = da[0]; }
    }

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var r: any = that.radius;
      this.highlightList = selComp.stockKey;
      d3.select("#vsCompCircle").selectAll("#vscSlider").remove();
      var g = d3.select("#vsCompCircle").select("#crlChart_vs").append("g").attr("id", "vscSlider").attr('transform', 'rotate(' + (-90) + ')').on('mousedown', onDown).on("touchstart", onDown)
        .on("pointerenter", function (eve) { if (d3.selectAll("#gCompMOver").style("display") != 'none') { d3.selectAll("#gCompMOver").style("display", 'none') } });

      g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 3).attr("width", 50).attr("fill", "#767676");

      g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (25)).attr("height", "42").attr("width", "125").style("display", "none");

      g.append("text").attr("class", "sText").attr("x", + r + (40)).attr("y", -3).style("font-family", 'var(--ff-medium)').style("font-size", "9px")
        .style("display", "none").text("0.00");

      g.append("text").attr("class", "sText1").attr("x", + r + (40)).attr("y", 9).style("display", "none")
        .style("font-size", "8px").attr("fill", "var(--theme-def-bg)").style("font-family", 'var(--ff-medium)').text("0.00");

      var cancelX = parseInt(r) + parseInt('170');
      var cancelBtn = g.append("g").attr('id', 'cSliderCancel').style('display', 'none').attr('transform', 'translate(' + (cancelX) + ',0)');
      cancelBtn.append("g").attr('transform', 'scale(0.03)').append("path").attr('fill', 'var(--prim-button-color)').attr("class", "bg")
        .attr('d', 'M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085 c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z');
      cancelBtn.select('g').append("path").attr('fill', 'var(--primary-color)').attr("class", "bg_stroke")
        .attr('d', 'M277.042,248.082l72.528-84.196c7.91-9.182,6.876-23.041-2.31-30.951  c-9.172-7.904-23.032-6.876-30.947,2.306l-68.236,79.212l-68.229-79.212c-7.91-9.188-21.771-10.216-30.954-2.306  c-9.186,7.91-10.214,21.77-2.304,30.951l72.522,84.196l-72.522,84.192c-7.91,9.182-6.882,23.041,2.304,30.951  c4.143,3.569,9.241,5.318,14.316,5.318c6.161,0,12.294-2.586,16.638-7.624l68.229-79.212l68.236,79.212  c4.338,5.041,10.47,7.624,16.637,7.624c5.069,0,10.168-1.749,14.311-5.318c9.186-7.91,10.22-21.77,2.31-30.951L277.042,248.082z');
      var data;
      function onDown() { data = d3.selectAll(".compList[style='display: block;']").selectAll(".comp").data(); }
      this.SetClockHandle(dta, selComp, gridData);
    }
  }

  checkHandleIndex(d: any, passClockData:any) {
    var dt = [...passClockData].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    return selIndex + 1 + "/" + dt.length;
  }
  findScoreValue(d:any) {
    if (isNotNullOrUndefined(d.score)) {
      return d.score;
    } else {
      return d.scores*100;
    }
  }
  SetClockHandle(data: any, d: any, gridData:any, type: boolean = false) {
    let that = this;
    var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : d.compname;
    let txt = Cname;
    var passClickedData = gridData;
    var rank = this.checkHandleIndex(d, passClickedData);
    let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(that.findScoreValue(d)) + "%  [" + rank + "]";
    if (txt1.length > 24) { txt1 = "(" + d.ticker + ") " + d3.format(".1f")(that.findScoreValue(d)) + "%  [" + rank.split('/')[0] + "]"; }
    if ((Cname.length) > 18) { txt = Cname.slice(0, 18).trim() + "..."; }
    let val = d.cx;
    var r: any = that.radius;
    d3.select("#vscSlider").attr('transform', 'rotate(' + val + ')');
    // console.log(that.findScoreValue(d), txt);
    d3.select("#vscSlider").select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.equityService.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        return 'var(--leftSideText-B)';
        //if (that.findScoreValue(d) >= 40 && that.findScoreValue(d) < 55) { return that.MedTxtColor; }
        //else { return that.cl(that.findScoreValue(d) + 1); }
      })
    // console.log(d3.select("#vscSlider").select(".sText"));
    d3.select("#vscSlider").select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.equityService.measureText(txt1, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 40) * -1) : "190";
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
      .attr("fill", function () {
        return 'var(--leftSideText-B)';
        //if (that.findScoreValue(d) >= 40 && that.findScoreValue(d) < 55) { return that.MedTxtColor; }
        //else { return that.cl(that.findScoreValue(d) + 1); }
      });

    const slide: any = d3.select("#vscSlider").select(".sText");
    var bbox: any = slide.node().getBBox();
    var bboxH: any = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    d3.select("#vscSlider").select(".sRect")
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
    d3.select("#vscSlider").select("#cSliderCancel").attr('transform', 'translate(' + (171 + (cancelX)) + ',' + (-((bboxH / 4) - 3)) + ')');
    d3.select("#vscSlider").select("#cSliderCancel").on('click', function () {
      that.vsSelComp = undefined;
      that.vsCompClickNAA(that.vsSelComp);
    });
    d3.select("#vscSlider").on('pointerenter', function () { d3.select("#vscSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('mousemove', function () { d3.select("#vscSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('pointerleave', function () { d3.select("#vscSlider").select("#cSliderCancel").style('display', 'none'); })

    d3.select("#vscSlider").select(".sTextReverse").attr("fill", "#fff").style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function (): any {
        if (bboxH == 40) { return -(bboxH + 0); }
        else if (bboxH < 50) { return -(bboxH - 3); }
        else if (bboxH > 50) { return -(bboxH - 15); }
      }).attr("y", -(calW + 17));
    d3.select("#vscSlider").style('display', 'block').raise();
    var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : d.compname;
    var midtxt = Cname + " (" + d.ticker + ") ";

    if (Cname.length > 25) { midtxt = Cname.slice(0, 20) + "... (" + d.ticker + ") "; }
    var colorVal = that.checkHandleColor(gridData, d);
    if (type) { colorVal = that.checkHandleColor(data, d); };
    d3.select('#vscSlider').select('.sRect1').style("fill", colorVal);
    d3.select('#vscSlider').select('.sRect').attr("stroke-width", 1).style("stroke", colorVal)
  }

  checkHandleColor(data: any, d: any) {
    var that = this;
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(that.findScoreValue(d)), parseFloat(that.findScoreValue(d))); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    return this.cl(per(selIndex));
  }
  openConst() {
    var that = this;
    var indexDescription = this.indexDescription;
    var indexName = this.indexName; 
    var indexCode = this.indexCode
     var clickedData = that.preBuiltService.customizeSelectedIndex_prebuilt.value;
    if (this.chartData.length > 0 && isNotNullOrUndefined(clickedData)) {
      var filterData = this.chartData.filter((x: any) => x.ticker == clickedData.indexCode);
    } else {
      this.chartData = [];
    }
    // this.dialogController.openIndexConst(IndexConstComponent);
    this.dialog.open(IndexConstComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh", data: { dialogData: filterData, dialogSource: indexDescription, dialogIndexname: indexName, dialogTicker: indexCode, selIndexSector: this.getIndex } });
  }
}
