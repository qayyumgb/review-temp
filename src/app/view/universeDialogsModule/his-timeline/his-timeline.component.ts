import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { DataService } from '../../../core/services/data/data.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { ascending, descending, group } from 'd3';
import * as d3 from 'd3';
declare var $: any;
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';
import { Subscription, first } from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
@Component({
  selector: 'app-his-timeline',
  templateUrl: './his-timeline.component.html',
  styleUrl: './his-timeline.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HisTimelineComponent implements OnInit, OnDestroy ,AfterViewInit{
  subscriptions = new Subscription();
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  clkdRgeText: string = 'top';
  SRValue: number = 0;
  radius = 150;
  assgUserDrpVal: number = 0;
  //value: number = 10;
  options: Options = {
    floor: 0,
    ceil: 100,
    step: 10,
    showSelectionBar: true
  };
  toggleSearch: boolean = false;
  selGICS: any;
  CType: string = "ETF";
  from: string = "";
  allYearData: any = [];
  yrListTab: any = [];
  rightGridData: any = [];
  hisRightGridData: any = [];
  hisaddGridData: any = [];
  hisremGridData: any = [];
  selHistroyTimeDate: any;
  avoidLoserData: any;
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  MedTxtColor: string = "#3a4f7b";
  HisSelComp: any;
  showSpinnerAcc_loaded: boolean = true;
  showCenterLoader_popup: boolean = false;
  selectedTabIndex: number = 0;
  asOfDate: string = "-";
  compDate: string = '';
  returnDate: string = '';
  showErrorMsg: boolean = false;
  isAtTop: boolean = true;
  isAtBottom: boolean = false;
  showArrows: boolean = true;
  FilterList: any = [];
  showMatLoader:boolean = false;
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  constructor(private dialogref: MatDialogRef<HisTimelineComponent>,
    private datePipe: DatePipe, public sharedData: SharedDataService, public etfService: EtfsUniverseService,
    public dataService: DataService, public equityService: EquityUniverseService, public cusIndexService: CustomIndexService,
    private logger: LoggerService, @Inject(MAT_DIALOG_DATA) public modalData: any) { }

  selectedSectorName: any;
  isPinCompVisible = true;
  getPinnedMenuItems: any = [];
  showDefault_select: string = '';
  pinnedCompRight: boolean = false;
  pinnedPerformanceRight: boolean = false;
  //@HostListener('document:click', ['$event'])
  //onDocumentClick(event: MouseEvent) {
  //  const target = event.target as HTMLElement;
  //  // Check if the click occurred outside of the specific div
  //  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  //    this.isPinCompVisible = false;
  //    if (this.pinnedCompRight && this.showDefault_select == 'company' ) {
  //      this.showDefault_select = this.showDefault_select;
  //    }
  //    else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance' ) { this.showDefault_select = this.showDefault_select; }
  //    else { this.showDefault_select = ''; }

  //  } else {
  //    this.isPinCompVisible = true;
  //  }
  //}
  Slide_count: number = 0;
  exclControlLeft() {
    var that = this;
    var controlLeft = d3.select('#hisTimelineCircle').select('#left');
    var controlLeftDisable = d3.select('#hisTimelineCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#hisTimelineCircle').select('#right');
    var controlRightDisable = d3.select('#hisTimelineCircle').select('#right .disableRightCircle');

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
    d3.select('#hisTimelineCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    //this.createCircleSliderDot();

  }

  exclControlRight() {
    var that = this;
    var controlLeft = d3.select('#hisTimelineCircle').select('#left');
    var controlLeftDisable = d3.select('#hisTimelineCircle').select('#left .disableLeftCircle');
    var controlRight = d3.select('#hisTimelineCircle').select('#right');
    var controlRightDisable = d3.select('#hisTimelineCircle').select('#right .disableRightCircle');

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
    d3.select('#hisTimelineCircle').select('#slidingSVG').transition(t).attr('transform', 'translate(-' + slideV + ', 0)');
    //this.createCircleSliderDot();
  }
  // Helper function to check if an element is inside the specific div
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  }
  ngOnDestroy() {
    try { this.performanceAPI.unsubscribe(); } catch (e) { };
    try { this.GetAllocScoresSubscribe.unsubscribe(); } catch (e) { };
    try { this.indexPreRuns.unsubscribe(); } catch (e) { };
    this.subscriptions.unsubscribe();
  }
  ngAfterViewInit() {
 
    setTimeout(() => {
      this.checkScrollPosition();
  
    }, 1000);
    this.updateArrowVisibility();
  }
  @HostListener('window:resize')
  onResize() {
    this.updateArrowVisibility();
    this.checkScrollPosition();
  }
  private updateArrowVisibility() {

    
    // Show arrows only if content height is greater than container height
    setTimeout(() => {
      const containerHeight = this.scrollContainer.nativeElement.clientHeight;
      const contentHeight = this.scrollContainer.nativeElement.scrollHeight;
      this.showArrows = contentHeight > containerHeight;
      // console.log(this.showArrows,'showArrows')
    }, 1000);
  
  }
  scrollUp() {
    this.scrollContainer.nativeElement.scrollBy({
      top: -150, // Adjust this value to control the scroll speed
      behavior: 'smooth'
    });
    setTimeout(() => {
      this.checkScrollPosition();
    }, 300);
  }
  scrollDown() {
    this.scrollContainer.nativeElement.scrollBy({
      top: 150, // Adjust this value to control the scroll speed
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
    this.isAtTop = scrollTop === 0;
    this.isAtBottom = (Math.round(scrollTop)  + Math.round(containerHeight)) + 1  >= Math.round(scrollHeight);
   
    //console.log(this.isAtBottom,'isAtBottom')
  }
  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'hisTimeline'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'hisTimeline', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    that.from = that.modalData.dialogSource['from'];
    that.rightGridData = that.modalData.dialogSource['rightGridData'];
    that.avoidLoserData = that.modalData.dialogSource['avoidLoserData'];
    that.selGICS = that.modalData.dialogSource['selGICS'];
    that.SRValue = that.modalData.dialogSource['SRValue'];
    that.CType = that.modalData.dialogSource['CType'];
    //var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
    //  var filterCustom = res.filter((x: any) => x.menus == 'History Timeline');
    //  if (filterCustom.length > 0) {
    //    that.getPinnedMenuItems = filterCustom;
    //    if (that.getPinnedMenuItems[0].performance == 'Y') {
    //      this.pinnedPerformanceRight = true;
    //      this.showDefault_select = 'performance';
    //      this.pinnedCompRight = true;
    //    }
    //    else if (that.getPinnedMenuItems[0].components == 'Y') {
    //      this.pinnedCompRight = true;
    //      this.showDefault_select = 'company';
    //      this.pinnedPerformanceRight = true;
    //    }
    //    else {
    //      this.pinnedPerformanceRight = false;
    //      this.pinnedCompRight = false;
    //    }
    //  } else { that.getPinnedMenuItems = []; }

    //}, error => { });
    //that.subscriptions.add(GetPinnedItems);
    this.getIndexPreRuns();
    this.creatGradienArc();
    var breadcrumb = that.modalData.dialogSource['breadcrumb'];
    if (breadcrumb.length > 0) {
      breadcrumb = breadcrumb[breadcrumb.length - 1];
      that.selectedSectorName = breadcrumb;
    } else if (that.from == 'equityUniverse') {
      that.selectedSectorName = { name: 'Equity Universe', group: 'Universe' };
    }
    $('.dropdown-menu-right').click(function (event: any) { event.stopPropagation(); });
    //var selComp: any = this.equityService.selComp.subscribe((res: any) => { });
    //this.subscriptions.add(selComp);
    setTimeout(() => {
      this.checkScrollPosition();
      this.updateArrowVisibility();
      that.Slide_count = -1;
      that.exclControlRight();
    }, 1000);
    // that.sharedData.showSpinner.next(false);

    var getSelectedRightSide: any = this.sharedData.getSelectedRightSide.subscribe((res: any) => {
      this.getSelectedRightSide = res;
      if (res == 'Y') {
        if (this.showDefault_select == '') { this.showDefault_select = 'company' }
        else { this.showDefault_select = this.showDefault_select }
      }
      else {
        that.pinnedCompRight = this.sharedData._openPinnedRightSide;
        setTimeout(() => { this.showDefault_select = '' }, 200)
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

  forceCloseLoader() {
    var that = this;
    setTimeout(() => { that.showSpinnerAcc_loaded = false; this.showCenterLoader_popup = false; }, 500)
  }
  spinnerOff() {
    var that = this;
    if (that.hisRightGridData.length > 0 && this.portfolioData.length > 0) {
      setTimeout(() => { that.showSpinnerAcc_loaded = false; this.showCenterLoader_popup = false; }, 500)
    }
  }
  excessCumReturns: any;
  excessAnnReturns: any;
  findCumAnnFullData: any = [];
  //getAnalysis(data: any, srvalue:any) {
  //  var d = srvalue;
  //  console.log(data, srvalue);
  //  var filt = data;
  //  var c_remaining = "BP_Cbottom" + d + "Rtn";
  //  console.log(c_remaining, 'c_remaining')
  //  var cum_removed = (filt[0][c_remaining] - filt[0]["BP_Cbottom100Rtn"]).toFixed(2);
  //  this.excessCumReturns = cum_removed;
  //  var A_remaining = "BP_Abottom" + d + "Rtn";
  //  var annu_removed = (filt[0][A_remaining] - filt[0]["BP_Abottom100Rtn"]).toFixed(2);
  //  this.excessAnnReturns = annu_removed;
  //}
  noDataEr = { title: "Error", msg: "No records available for the chosen quarter. Please try again later." };
  indexPreRuns: any;
  getIndexPreRuns() {
    var that = this;
    var indexid: number = 123;
    var GICSId: number = 0;
    var srVal = that.SRValue;
    if (srVal != 100) { srVal = 100 - srVal; }
    if (that.from == 'equityUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      //that.equityService.getAnnumValue().then((res: any) => { if (isNotNullOrUndefined(res) && res.length > 0) { that.getAnalysis(res, this.equityService._SRValue); } });
      if (isNotNullOrUndefined(index)) {
        if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['indexId'])) { indexid = index['indexId']; }
        if (isNotNullOrUndefined(this.selGICS['code'])) { GICSId = this.selGICS['code']; }
      } else { indexid = this.equityService.getMyIndexId(this.selGICS); }
      if (isNotNullOrUndefined(this.selGICS) && isNotNullOrUndefined(this.selGICS['code']) && isNotNullOrUndefined(this.selGICS['indexType']) && this.selGICS['indexType'] === "Global Universe") { GICSId = this.selGICS['code']; }
    } else if (that.from == 'etfUniverse') {
      //that.etfService.getAnnumValue().then((res: any) => { if (isNotNullOrUndefined(res) && res.length > 0) { that.getAnalysis(res, this.etfService._SRValue); } });
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['assetId'])) { GICSId = index['assetId']; }
    }
    try { that.indexPreRuns.unsubscribe(); } catch (e) { }
    that.indexPreRuns=this.dataService.getIndexPreRuns(indexid, GICSId, that.CType, (that.clkdRgeText + srVal)).pipe(first()).subscribe((res: any) => {
      if (isNullOrUndefined(res) || res.length == 0) {
        this.yrListTab = [];
        this.noDataEr.title = "Alert";
        this.noDataEr.msg = "No records available.";
        $('#errorMainModalHT').modal('show');
      } else {
        this.allYearData = [...res];
        var resData = res.filter((d: any) => {
          var DD = new Date(d['date']);
          var month = DD.getMonth() + 1; if (month == 3 || month == 6 || month == 9 || month == 12) { return d; }
        });
        /** Cumulative and annualized data function ***/
        var Data = resData.reverse();
        this.findCumAnnFullData = [...Data];
        /** Cumulative and annualized data function ***/
        if ([...resData].length > 0) {
          var grp: any = group([...resData], d => new Date(d.date).getFullYear());
          var years = Array.from(grp, ([keys, v]) => ({ year: keys, qtrList: that.qtrSort(v) }));
          years = years.sort(function (x: any, y: any) { return descending(x.year, y.year); });
          this.yrListTab = [...years];
          if (years.length > 0) { this.leftHisTimeMenuClick(years[0]['qtrList'][0]); }
        } else { this.yrListTab = []; }
      }
    }, (error: any) => {
      this.noDataEr.title = "Error";
      this.noDataEr.msg = "No records available for the chosen quarter. Please try again later.";
      this.logger.logError(error, 'getIndexPreRuns'); $('#errorMainModalHT').modal('show');
    });
    that.subscriptions.add(this.indexPreRuns);
  }

  qtrSort(data: any) {
    return data.sort(function (x: any, y: any) { return descending(new Date(x.date).getMonth(), new Date(y.date).getMonth()); });
  }

  formatedates(value: any) { if (value < 10) { return '0' + value; } else { return value; } }
  selHistroyactiveDate: string = "";
  leftHisTimeMenuClick(data: any) {
    this.HisSelComp = undefined;
    this.rankComp = "";
    this.showCenterLoader_popup = true;
    this.hisRightGridData = [];
    this.portfolioData = [];
    //this.selectedTabIndex = 0;
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    const scrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    const containerHeight = this.scrollContainer.nativeElement.clientHeight;
    this.isAtTop = scrollTop === 0;
    this.isAtBottom = (Math.round(scrollTop)  + Math.round(containerHeight)) - 1  >= Math.round(scrollHeight);
    // console.log(scrollTop,'this.isAtTop ')
    if(scrollTop == 150){
      this.scrollDown()
    }
    if(scrollTop == 46){
      this.scrollUp()
    }
    this.hisCompClick(this.HisSelComp);
    this.selHistroyTimeDate = data['date'];
    this.selHistroyactiveDate = this.selHistroyTimeDate.split("/")[2];
    if ((this.sharedData.checkMenuPer(2027, 2237) == 'Y' && this.from == 'equityUniverse') || (this.from == 'etfUniverse' && this.sharedData.checkMenuPer(2028, 2253) == 'Y')) {
      this.showDefault_select = this.showDefault_select;
    } else { this.showDefault_select = ''; }
    this.assgUserDrpVal = 0;
    this.findAnnCumValue(data, this.findCumAnnFullData);
    this.GetAllocScores();
    this.createHisTimePerformanceData();
    this.searchClose();
    this.viewPort.scrollToIndex(0);
    try {
      this.sharedData.userEventTrack('History Timeline', data['date'], data['date'], 'left grid Qtr click');
    } catch (e) { }
  }
  hiscumReturn: any;
  hisannReturn: any;
  findAnnCumValue(d: any, data: any) {
    var that = this;
    var CalData: any = [];
    that.hiscumReturn = null;
    that.hisannReturn = null;
    data.forEach((val: any) => CalData.push(Object.assign({}, val)));
    CalData = CalData.reverse();
    var index = CalData.findIndex((x: any) => x.date === d['date']);
    index = index + 1;
    CalData = CalData.slice(0, index);
    let ReturnVal: any = [];
    let ReturnVal1: any = [];
    var cumReturn: any;
    var annReturn: any;
    let indexValue1 = [];
    let date = [];
    for (let i = 0; i <= (CalData.length - 1); ++i) {
      indexValue1.push(CalData[i]['top100']);
      date.push(CalData[i]['date']);
    }
    ReturnVal = that.calcCumAndAnnReturns(indexValue1, date);

    let indexValue = [];
    let date1 = [];
    for (let i = 0; i <= (CalData.length - 1); ++i) {
      indexValue.push(CalData[i]["range"]);
      date1.push(CalData[i]['date']);
    }
    ReturnVal1 = that.calcCumAndAnnReturns(indexValue, date1);
    cumReturn = (ReturnVal1[0] - ReturnVal[0]).toFixed(2);
    annReturn = (ReturnVal1[1] - ReturnVal[1]).toFixed(2);
    that.hiscumReturn = cumReturn;
    that.hisannReturn = annReturn;
  }
  calcCumAndAnnReturns(indexValue: any, date: any) {
    let that = this;
    var newd = (indexValue[indexValue.length - 1] / 1000) - 1;
    let cumReturn = "0.0%";
    let annReturn = "0.0%";
    var startDate = new Date(date[0]);
    var endDate = new Date(date[date.length - 1]);
    const oneDay = 24 * 60 * 60 * 1000;
    var Difference_In_Time = endDate.getTime() - startDate.getTime();
    var diffDays = Difference_In_Time / (1000 * 3600 * 24);

    var years = diffDays / 365;
    if (years == 0) { years = 1; }
    cumReturn = (newd * 100).toFixed(2);

    var MathVal = 1 + newd;
    if (years < 1) {
      annReturn = ((indexValue[indexValue.length - 1] / indexValue[0]) - 1).toFixed(2);
    }
    else {
      annReturn = ((Math.pow(MathVal, (1 / years)) - 1) * 100).toFixed(2);
    }
    return [cumReturn, annReturn];
  }
  highlightList: any;

  close() { this.dialogref.close() }
  GetAllocScoresSubscribe: any
  GICSId: any;
  GetAllocScores() {
    var that = this;
    var indexid: number = 123;
    var top = 1;
    var GICSId: number = 0;
    var MedTxt: any = '0.0';
    var range = ((100 - that.SRValue) / 100);
    if (that.from == 'equityUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index)) {
        if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['indexId'])) { indexid = index['indexId']; }
        if (isNotNullOrUndefined(this.selGICS['code'])) { GICSId = this.selGICS['code']; }
      } else { indexid = this.equityService.getMyIndexId(this.selGICS); }
      if (isNotNullOrUndefined(this.selGICS) && isNotNullOrUndefined(this.selGICS['code']) && isNotNullOrUndefined(this.selGICS['indexType']) && this.selGICS['indexType'] === "Global Universe") { GICSId = this.selGICS['code']; }
    } else if (that.from == 'etfUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['assetId'])) { GICSId = index['assetId']; }
    }
    this.GICSId = GICSId;
    var d = new Date(that.selHistroyTimeDate);
    d.setDate(d.getDate() + 1)
    var GetAllocDate = d.getFullYear().toString() + this.formatedates(d.getMonth() + 1).toString() + this.formatedates(d.getDate()).toString();
    /** Get performance ***/
    try { that.GetAllocScoresSubscribe.unsubscribe(); } catch (e) { }
    this.GetAllocScoresSubscribe = this.dataService.GetAllocScoresMsgkubTimeline(GetAllocDate, GICSId, range, indexid, top, that.CType).pipe(first()).subscribe((res: any) => {
      if (isNullOrUndefined(res) || res.length == 0) {
        //if (this.yrListTab.length > 0) { this.leftHisTimeMenuClick(this.yrListTab[0]['qtrList'][0]); }
        that.showErrorMsg = true;
        that.forceCloseLoader();
      } else {
      res = res.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.hfScores), parseFloat(y.hfScores)); });
      res.forEach(function (d: any, i: any) {
        d.colorRank = i + 1;
        d.score = d.hfScores * 100;
        d.cx = ((i * 360 / res.length) - 90);
        return d
      });
      that.hisRightGridData = this.findMyHandleIndex_H([...res]);
      that.showErrorMsg = false;
      that.CreateComps([...res], "lvl1");
      this.hisaddGridData = [...res].filter((x: any) => x.action == 1 || x.action == "1");
      this.hisremGridData = [...res].filter((x: any) => x.action == 0 || x.action == "0");
      var findMed: any = d3.median([...res].map(x => x.score))
      //console.log(that.hisRightGridData, this.hisaddGridData)
        this.fillCompetives(this.hisRightGridData);
        that.spinnerOff();
        console.log('popup spinnerOff')
      var MedTxt = d3.format(".1f")(findMed);
      that.checkMedFillYear(res, MedTxt);
      this.onSort();
    }
    }, (error: any) => {
      that.showErrorMsg = true;
      $('#errorModalHisTimeline').modal('show');
      this.logger.logError(error, 'GetAllocScoresData');
      that.forceCloseLoader();
    });
    /** Get performance ***/
    that.subscriptions.add(this.GetAllocScoresSubscribe);
  }
  findMyHandleIndex_H(data: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    let TotWt: any = d3.sum([...data].filter((x: any) => x.action == 1 || x.action == "1").map(function (d: any) { return (1 - d.hfScores); }));
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      d['Wt'] = ((1 - d.hfScores) / TotWt) * 100;
      return d
    });
    return data
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    var virData = [];
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    const totalItems = this.sortedhisRightGridData.length - itemsVisible;
    virData = [...data]
    virData.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...virData].filter(x => x.isin == selind);
      if (selIsins[0].index >= totalItems) {
       // console.log(selIsins[0].index)
        that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
        setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + 10); }, 20);
      } else {
        setTimeout(() => {
         // console.log(selIsins[0].index)
          if (selIsins[0].index < dontMove) {
            this.viewPort.scrollToIndex(0);
          } else {

            //if (that.SRValue > 0 && virData.length > 500) {
            //  that.viewPort.scrollToIndex(selIsins[0].index + 10);
            //} else {
              that.viewPort.scrollToIndex(selIsins[0].index);
            //}
          }
        }, 100);
      }
    }
  }
  checkMedColor(data: any, med: any) {
    var medVal = parseFloat(med);
    data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = d3.scaleLinear().domain([0, data.length]).range([0, 100]);
    var index = data.filter((x: any) => x.score <= medVal);
    var perVal = per(index.length);
    if (data.length <= 1) { perVal = 0; }
    return perVal;
  }
  checkMedFillYear(res: any, MedTxt: any) {
    var that = this;
    var gC100 = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
    var color = this.checkMedColor(res, MedTxt);
    if (isNotNullOrUndefined(res) && res.length == 1) { color = 1 };
    d3.select("#yearMedian").selectAll(".SelCompScore").text(MedTxt).style("fill", function () { return gC100(color); });
  }
  ecllipseCompName(selComp: any) {
    var midtxt = '';
    var compNameLength = '';
    if (selComp.companyName.length > 15) { compNameLength = selComp.companyName.slice(0, 15) + "..."; }
    else { compNameLength = selComp.companyName };
    if (isNotNullOrUndefined(selComp.ticker) && selComp.ticker != '') {
      midtxt = compNameLength + " (" + selComp.ticker + ") ";
    } else { midtxt = compNameLength; }
    return midtxt;
  }
  checkMedFillCompany(d: any,) {
    var that = this;
    var color = that.checkHandleColor(that.hisRightGridData, d);
    var compName = that.ecllipseCompName(d);
    if (this.hisaddGridData.length == 1) { color = that.cl(1) };
    d3.select("#companyMedian").selectAll(".SelCompName").text(compName).style("fill", 'var(--leftSideText-B)');
    d3.select("#companyMedian").selectAll(".SelCompScore").text(d3.format(",.1f")(d.score)).style("fill", function () { return color; });
    //this.cl(per(selIndex));
  }

  performanceAPI: any;
  createHisTimePerformanceData() {
    var that = this;
    /* /// warning message OFF */
    that.showErrorMsg = false;
    var indexid: number = 123;
    var srVal: any = that.SRValue;
    var GICSId: number = 0;
    var naa: number = 100 - that.assgUserDrpVal;
    if (srVal != 100) { srVal = 100 - srVal; }
    if (that.from == 'equityUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index)) {
        if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['indexId'])) { indexid = index['indexId']; }
        if (isNotNullOrUndefined(this.selGICS['code'])) { GICSId = this.selGICS['code']; }
      } else { indexid = this.equityService.getMyIndexId(this.selGICS); }
      if (isNotNullOrUndefined(this.selGICS) && isNotNullOrUndefined(this.selGICS['code']) && isNotNullOrUndefined(this.selGICS['indexType']) && this.selGICS['indexType'] === "Global Universe") { GICSId = this.selGICS['code']; }
    } else if (that.from == 'etfUniverse') {
      var index: any = that.modalData.dialogSource['index'];
      if (isNotNullOrUndefined(index) && isNotNullOrUndefined(index['assetId'])) { GICSId = index['assetId']; }
    }
    var ssDate = new Date(that.selHistroyTimeDate);
    var sdate = ssDate.getFullYear() + '-' + that.formatedates(ssDate.getMonth() + 1) + '-' + that.formatedates(ssDate.getDate());
    try { that.performanceAPI.unsubscribe(); } catch (e) { }
    this.performanceAPI = that.dataService.GetIndexRunsPerformanceDate(indexid, GICSId, that.CType, (that.clkdRgeText + parseInt(srVal)), naa, that.assgUserDrpVal, sdate).pipe(first()).subscribe((PortfolioData: any) => {
      this.HisTimePerformanceLoad(PortfolioData);
    }, (error: any) => {
      this.logger.logError(error, 'GetIndexRunsPerformanceDate');
      that.showErrorMsg = true;
      $('#errorModalHisTimeline').modal('show');
      that.forceCloseLoader();
      that.GetAllocScoresSubscribe.unsubscribe();
    });
    that.subscriptions.add(this.performanceAPI);
  }
  portfolioData: any = [];
  h_facData: any = [];
  StatData: any = [];
  perData1: any = [];
  HisTimePerformanceLoad(PortfolioData: any) {
    let that = this;
    that.portfolioData = PortfolioData;
    var compScores: any = [];
    var usrScores: any = [];
    var naaScores: any = [];
    if ([...this.rightGridData].length > 0) {
      naaScores.push(d3.median([...this.rightGridData].map(x => x.score)));
      naaScores.push(d3.max([...this.rightGridData].map(x => x.score)));
    }
    if ((this.SRValue < 100 && this.SRValue > 0) && isNotNullOrUndefined(that.avoidLoserData) && that.avoidLoserData['addedCompanies'].length > 0) {
      usrScores.push(d3.median(that.avoidLoserData['addedCompanies'].map((x: any) => x.score)));
      usrScores.push(d3.max(that.avoidLoserData['addedCompanies'].map((x: any) => x.score)));
      compScores.push((naaScores[0] * that.assgUserDrpVal + usrScores[0] * (100 - that.assgUserDrpVal)) / 100);
      compScores.push((naaScores[1] * that.assgUserDrpVal + usrScores[1] * (100 - that.assgUserDrpVal)) / 100);
    } else {
      usrScores.push(d3.median([...this.rightGridData].map(x => x.score)));
      usrScores.push(d3.max([...this.rightGridData].map(x => x.score)));
      compScores.push((naaScores[0] * that.assgUserDrpVal + usrScores[0] * (100 - that.assgUserDrpVal)) / 100);
      compScores.push((naaScores[1] * that.assgUserDrpVal + usrScores[1] * (100 - that.assgUserDrpVal)) / 100);
    }

    //this.sharedData.compScores.next(compScores);
    //this.sharedData.usrScores.next(usrScores);
    //this.sharedData.naaScores.next(naaScores);

    if (PortfolioData.length > 0) {
      var datas = {
        'H-Factor': [{ 'H-Factor': 'Median h-factor', 'UserPortfolio': that.percentageFormate(naaScores[0]), 'NAAPortfolio': that.percentageFormate(usrScores[0]), 'Combined': that.percentageFormate(compScores[0]) }],
        'Performance': [
          { 'Performance': 'YTD', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['ytdReturn']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['ytdReturn']), 'Combined': that.percentageFormateDash(PortfolioData[2]['ytdReturn']) },
          { 'Performance': '1 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y1Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y1Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y1Return']) },
          { 'Performance': '3 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y3Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y3Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y3Return']) },
          { 'Performance': '5 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y5Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y5Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y5Return']) },
          //{ 'Performance': '7 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y7Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y7Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y7Return']) },
          { 'Performance': '10 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y10Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y10Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y10Return']) },
          { 'Performance': 'Since ' + PortfolioData[0]['sinceDate'], 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['annReturns']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['annReturns']), 'Combined': that.percentageFormateDash(PortfolioData[2]['annReturns']) }],
        'Statistics': [
          { 'Statistics': 'Annualized Alpha', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['annulaizedAlpha']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['annulaizedAlpha']), 'Combined': that.percentageFormate(PortfolioData[2]['annulaizedAlpha']) },
          { 'Statistics': 'Information Ratio', 'UserPortfolio': that.valueFormat(PortfolioData[1]['informationRatio']), 'NAAPortfolio': that.valueFormat(PortfolioData[0]['informationRatio']), 'Combined': that.valueFormat(PortfolioData[2]['informationRatio']) },
          { 'Statistics': 'Beta', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['beta']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['beta']), 'Combined': that.percentageFormate(PortfolioData[2]['beta']) },
          { 'Statistics': 'Upside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['upsideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['upsideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['upsideCapture']) },
          { 'Statistics': 'Downside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['downSideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['downSideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['downSideCapture']) },
          { 'Statistics': 'Correlation', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['correlation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['correlation']), 'Combined': that.percentageFormate(PortfolioData[2]['correlation']) },
          { 'Statistics': 'Batting Average', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['battingAverage']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['battingAverage']), 'Combined': that.percentageFormate(PortfolioData[2]['battingAverage']) },
          { 'Statistics': 'Standard Deviation', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['stdDeviation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['stdDeviation']), 'Combined': that.percentageFormate(PortfolioData[2]['stdDeviation']) },],

      }
      if (that.assgUserDrpVal == 0) { datas = that.assgUserDrpValDash(datas); }
      that.h_facData = datas['H-Factor'];
      that.StatData = datas['Statistics'];
      // console.log(that.StatData,'StatData')
      that.perData1 = datas['Performance'];
      that.spinnerOff();
      //that.skullLoader = false;
      //that.hisRtnDate = 'Returns as of ' + that.selHistroyTimeDate;
      that.compDate = 'Returns as of ' + PortfolioData[1].date;
      if (isNotNullOrUndefined(PortfolioData) && PortfolioData.length > 0 && isNotNullOrUndefined(PortfolioData[0]['sinceDate']) && isNotNullOrUndefined(PortfolioData[0]['date'])) {
        this.returnDate = 'Returns calculated from ' + PortfolioData[0]['sinceDate'] + ' to ' + PortfolioData[0]['date'];
        this.returnAsOfDate = PortfolioData[0]['sinceDate'] + ' to ' + PortfolioData[0]['date'];
      }
    } else if (PortfolioData.length <= 0) { }
  }
  returnAsOfDate: string = '';
  assgUserDrpValDash(datas: any) {
    datas['H-Factor'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    datas['Performance'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    datas['Statistics'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    return datas;
  }

  percentageFormate(value: any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00%'; }
    else { return value.toFixed(2) + "%" }
  }

  percentageFormateDash(value: any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return value.toFixed(2) + "%" }
  }

  valueFormat(value: any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00'; }
    else { return value.toFixed(2) }
  }

  hisperStatSliderChange(ev: any) {
    if (isNotNullOrUndefined(ev.value)) {
      this.assgUserDrpVal = parseInt(ev.value);
      this.createHisTimePerformanceData();
    } else {
      this.assgUserDrpVal = 0;
      this.createHisTimePerformanceData();
    }
  }

  creatGradienArc() {
    var that = this;
    var data: any = [];
    var tempArcData: any = [];
    d3.range(0, 101).map(function (v, i) { tempArcData.push({ 'score': i }); });
    data = [...tempArcData];

    if (data != null && data.length > 0) {
      var len = data.length;
      data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
    };

    var gArc = null;
    d3.select("#gHisTimeChart #gradCompArc").remove();
    gArc = d3.select("#gHisTimeChart #gcrlChart_his").append("g").attr("id", "gradCompArc");
    var arc: any = d3.arc().innerRadius(this.radius - 18).outerRadius(this.radius - 2);
    var gC100 = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);

    // create our gradient
    var colors: any = [];

    var linearGradient = gArc.append("defs");
    var linearG1 = linearGradient.append("linearGradient");

    if (data != null) { }

    var gCArcColor = d3.scaleLinear().domain([0, 90, 91, 180, 181, 270, 271, 360]).range([0, 100, 0, 100, 0, 100, 0, 100])
    var MaxColor: any = "";
    var MaxScore: any = "";
    var Data1 = data.filter((x: any) => x.cx >= -90 && x.cx <= 0);
    linearG1.attr("id", "linearColors0")
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
    linearG2.attr("id", "linearColors1")
      .attr("x1", "0.8").attr("y1", "0").attr("x2", "0.5").attr("y2", "0.5");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 1 && data[i].cx <= 90) {
          linearG2.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 90) {
          //   linearG2.append("stop").attr("offset", "100%").attr("stop-color", gC100(data[i].score));
          break;
        }
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
    linearG3.attr("id", "linearColors2")
      .attr("x1", "0.8").attr("y1", "0.8").attr("x2", "0").attr("y2", "0.3");
    if (data != null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].cx >= 91 && data[i].cx <= 180) {
          linearG3.append("stop").attr("offset", gCArcColor((data[i].cx) + 90) + "%").attr("stop-color", gC100(data[i].score));
        }
        if (data[i].cx > 180) {
          break;
        }
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
    linearG4.attr("id", "linearColors3")
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
      .attr('fill', function (d, i) { return 'url(#' + 'linearColors' + i + ')'; });

    gArc.append('path')
      .attr('class', 'Hiscircle_overlay')
      .attr('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')
      .attr('stroke', '#323238')
      .attr('stroke-width', '2')
      .attr('stroke-linecap', 'butt')
      .style('transform', 'scale(8.8) translate(18px, -18px) rotateY(180deg)')
      .attr('stroke-dasharray', (that.SRValue + ' 100'))
      .style('display', function () {
        if (that.SRValue < 100 && that.SRValue > 0) { return 'block' } else { return 'none' }
      })
      .attr('fill', 'none');

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

  CreateComps(dta: any, lvl: any) {
    let that = this;
    var compLst;
    var oSvg: any = d3.select('#gHisTimeChart #gcrlChart_his');
    oSvg.selectAll('.compLst' + lvl).remove();
    compLst = oSvg.append("g").attr('class', 'compList show_comp_list compLst' + lvl).style("display", "block");
    d3.select("#gradArcLine").remove();

    var compC = compLst.append("g").attr("class", 'compLstC' + lvl);
    var compg = compC.selectAll("g")
      .data(dta)
      .enter().append("g")
      .attr("class", "comp")
      .attr("transform", function (d: any, i: any) { return "rotate(" + (d.cx) + ")"; })
      .attr("name", function (d: any) { return d.isin + "_" + d.indexName.replace(/ /g, '_') })
      .style("display", function (d: any) {
        if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.action) && d.action == 1) { return 'block' } else {return 'none' }
      })
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
    if (dta.length > 0) {
      if (isNotNullOrUndefined(dta[0]['tradeDate'])) {
        var date_t = dta[0]['tradeDate'];
        this.asOfDate = date_t.slice(4, 6) + "/" + date_t.slice(6, 8) + "/" + date_t.slice(0, 4);
      } else { this.asOfDate = "-" }
    } else { this.asOfDate = "-" }
    /*that.HFCompanyArc();*/
    d3.select("#HiscSlider").raise();
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
    let data = [];
    var gs: any = d3.select("#gHisTimeCompetitive");
    data = that.hisRightGridData;

    gs.selectAll("g").remove();
    data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });

    var fillMaxlen = 300;
    var sublen = parseInt((data.length / fillMaxlen).toFixed(0));
    var sdata = [];
    if (data.length > fillMaxlen) { sdata = data.filter(function (d: any, i: any) { if (i == 0 || (i % sublen) == 0) { return d; } }); }
    else { sdata = data; }

    var ggs = gs.selectAll("g")
      .data(sdata)
      .enter().append("g")
      .attr("transform", function (d: any) {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; }
        else { return "rotate(" + (d.cx - 1.0) + ")"; }
      }).attr("id", function (d: any) { return "his_" + d.stockKey })
      .style("opacity", function (d: any) {
        let opa = 1;
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) { opa = 1; }
        return opa;
      });

    ggs.append("text")
      .attr("x", function (d: any) { return that.sharedData.txtx1(d); })
      .attr("id", "gcStxt")
      .style("fill", function (d: any): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } })
      .style("display", function () { return (data.length > fillMaxlen) ? "none" : "none" })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if (that.hisaddGridData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt avbold"); }
        else { return that.HFCompanyTxt(d) + " avbold"; }
      }).text(function (d: any) { return d3.format(",.1f")(d.hfScores * 100) + "%" });

    ggs.append("text")
      .attr("x", function (d: any) { return that.sharedData.txtx(d); })
      .style("fill", function (d: any): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "#1d397b"; } })
      .attr("transform", function (d: any): any { if ((d.cx) > 90) { return "rotate(180)"; } })
      .style("text-anchor", function (d: any) { return that.sharedData.txtanch(d); })
      .attr("class", function (d: any) {
        if (that.hisaddGridData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt"); }
        else { return that.HFCompanyTxt(d); }
      })
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

    ggs.on("pointerenter", (event: any, d: any) => {

      if (data.length > fillMaxlen) {
        d3.select("#gCompetitiveRect").raise();
        d3.select('#gcrlChart_his').raise();
        d3.select("#HiscSlider").raise();
      } else {
      
          var key: string = "#his_" + d.stockKey;
        //console.log(d);
        if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.action) && d.action==1 ) {
          d3.select("#gHisTimeCompetitive").selectAll("g").classed("on", false);
          d3.select(key).classed("on", true);
        }

          //if (that.etfService._SRValue > 0 && that.etfService._SRValue < 100) {
          //  console.log(that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin));
          //  if (that.etfService._avoidLoserData['addedCompanies'].filter((x: any) => x.isin == d.isin).length > 0) {
          //    d3.select("#gHisTimeCompetitive").selectAll("g").classed("on", false);
          //    d3.select(key).classed("on", true);
          //}
          //} else if (dta.filter((x: any) => x.isin == d.isin).length > 0) {
          //  d3.select("#gHisTimeCompetitive").selectAll("g").classed("on", false);
          //  d3.select(key).classed("on", true);
          //}

         
        
      }
    }).on("pointerleave", (event: any, d: any) => { d3.select("#gHisTimeCompetitive").selectAll("g").classed("on", false); });

    ggs.on("click", function (eve: any, d: any) {
      that.fillmouseClick(d);
       that.showDefault_select = 'company'
      });
    //that.HFCompanyArc();
    if (data.length > fillMaxlen) { that.fillCompetivesRect(data, dta); } else {
      d3.select("#gHisTimeCompetitiveRect").selectAll("g").remove();
    }

    //that.checkCenSliChange();

    if (dta.length < 100) { d3.select('#gHisTimeChart').select('#gHisTimeCompetitive').selectAll('g').style('opacity', '0.6'); }
    else { d3.select('#gHisTimeChart').select('#gHisTimeCompetitive').selectAll('g').style('opacity', '0.4'); }

    d3.select('#gcrlChart_his').raise();
    d3.select("#HiscSlider").raise();
    that.forceCloseLoader();
  }

  fillmouseOver(selTag: any, d: any) { }
  fillmouseClick(d: any) { this.hisCompClick(d); }
  fillmouseOut(d: any) { }

  fillCompetivesRect(data: any, dta: any) {
    var that = this;
    var gs: any;
    d3.select("#gHisTimeCompetitiveRect").selectAll("g").remove();
    d3.select("#gHisTimeCompetitiveRect").raise();
    gs = d3.select("#gHisTimeCompetitiveRect");

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
        if (that.hisaddGridData.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
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
        if (that.hisaddGridData.filter((x: any) => x.stockKey == dst[0].stockKey).length > 0) {
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
      .style("cursor", "pointer").style("font-size", "9px").style("font-family", 'var(--ff-medium)')
      .attr("transform", function () {
        if (d.cx <= 90) { return "rotate(" + (d.cx + 1.0) + ")"; } else { return "rotate(" + (d.cx - 1.0) + ")"; }
      });
    d3.select(ev).raise();
    ggs.append("text").attr("x", that.sharedData.txtx1(d)).attr("id", "gcStxt")
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText-B)"; } else { return "var(--leftSideText-B)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () {
        if ((that.SRValue > 0 && that.SRValue < 100) && isNotNullOrUndefined(that.hisaddGridData)
          && that.hisaddGridData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt avbold"); }
        else { return that.HFCompanyTxt(d) + " avbold"; };
      }).text(function () { return d3.format(",.1f")(d.hfScores * 100) + "%" });

    ggs.append("text").attr("x", that.equityService.txtx(d))
      .style("fill", function (): any { if (dta.filter((x: any) => x.isin == d.isin).length == 0) { return "var(--leftSideText-B)"; } else { return "var(--leftSideText-B)"; } })
      .attr("transform", function (): any { if ((d.cx) > 90) { return "rotate(180)"; } }).style("text-anchor", that.sharedData.txtanch(d))
      .attr("class", function () {
        if ((that.SRValue > 0 && that.SRValue < 100) && isNotNullOrUndefined(that.hisaddGridData)
          && that.hisaddGridData.filter((x: any) => x.isin == d.isin).length == 0) { return (that.HFCompanyTxt(d) + " AVHideTxt"); }
        else { return that.HFCompanyTxt(d); };
      })
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
    ggs.on("click", function () { that.hisCompClick(d); });

  }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'hisTimeline');
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('History Timeline', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, this.hisaddGridData);
    var selind = this.hisaddGridData.filter((x: any) => x.isin == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.sortedhisRightGridData = [...dat]; } catch (e) { }
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.sortedhisRightGridData, that.highlightList);
        }, 500);
      }
    } catch (e) { }
  }
  onToggleAscending() {
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'hisTimeline'); }
  }
  RangeFilterGrid(IndexN: any, data: any) {
    var that = this;
    data = data.filter((d:any) => d.companyName !== null && d.score !== null &&  d.ticker !== null);
    data = this.sharedData.onRightGridSort(data, this.SelFilter, this.ascending_val);
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState: any, i: any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  scrollToIndexClick(index: number) {
    const middleIndex = Math.max(0, index - Math.floor(this.viewPort.getViewportSize() / 100));
    this.viewPort.scrollToIndex(middleIndex);
  }
  hisCompClick(d: any) {
    if (isNotNullOrUndefined(d)) {
      if (this.hisaddGridData.filter((x: any) => x.stockKey == d.stockKey).length > 0) {
        this.showDefault_select = 'company'
        this.HisSelComp = d;
        this.highlightList = d.stockKey;
        d3.select("#yearMedian").style('display', 'none');
        d3.select("#companyMedian").style('display', 'block');
        this.checkMedFillCompany(d);
        this.creatClockSlider(this.hisRightGridData, d);
        this.searchClose()
        setTimeout(() => {
          this.vir_ScrollGrids('', this.sortedhisRightGridData, this.highlightList)
        }, 200)
        this.Slide_count = -1;
        this.exclControlRight();

      }
    } else {
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 60);
      this.highlightList = "";
      d3.select("#hisTimelineCircle").selectAll("#HiscSlider").remove();
      d3.select("#yearMedian").style('display', 'block');
      d3.select("#companyMedian").style('display', 'none');
    }
  }

  creatClockSlider(dta: any, selComp: any) {
    let that = this;
    d3.select("#hisTimelineCircle").selectAll("#HiscSlider").remove();

    dta = dta.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    dta.forEach(function (d: any, i: any) { d.cx = ((i * 360 / dta.length) - 90); return d; });

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)) {
      var da = dta.filter((x: any) => x.stockKey == selComp.stockKey);
      if (da.length > 0) { selComp = da[0]; }
    }

    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.isin)) {
      var r: any = that.radius;
      this.highlightList = selComp.isin;
      d3.select("#hisTimelineCircle").selectAll("#HiscSlider").remove();
      var g = d3.select("#hisTimelineCircle").select("#gHisTimeChart").append("g").attr("id", "HiscSlider").attr('transform', 'rotate(' + (-90) + ')').on('mousedown', onDown).on("touchstart", onDown)
        .on("pointerenter", function (eve) { if (d3.selectAll("#gCompMOver").style("display") != 'none') { d3.selectAll("#gCompMOver").style("display", 'none') } });

      g.append("rect").attr("class", "sRect1").attr("x", r).attr("y", -.5).attr("height", 3).attr("width", 50).attr("fill", "#767676");

      g.append("rect").attr("class", "sRect").attr("rx", 20).attr("ry", 20).attr("x", + r + (25)).attr("height", "42").attr("width", "125").style("display", "none");

      g.append("text").attr("class", "sText").attr("x", + r + (40)).attr("y", -3).style("font-family", 'var(--ff-medium)').style("font-size", "9px")
        .style("display", "none").text("0.00");

      g.append("text").attr("class", "sText1").attr("x", + r + (40)).attr("y", 9).style("display", "none")
        .style("font-size", "8px").attr("fill", "var(--theme-def-bg)").style("font-family", 'var(--ff-medium)').text("0.00");

      var cancelX = parseInt(r) + parseInt('170');
      var cancelBtn = g.append("g").attr('id', 'cSliderCancel').style('display', 'none').attr('transform', 'translate(' + (cancelX) + ',0)');
      cancelBtn.append("g").attr('transform', 'scale(0.03)').append("path").attr('fill', '#319de0').attr("class", "bg")
        .attr('d', 'M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085 c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z');
      cancelBtn.select('g').append("path").attr('fill', 'var(--primary-color)').attr("class", "bg_stroke")
        .attr('d', 'M277.042,248.082l72.528-84.196c7.91-9.182,6.876-23.041-2.31-30.951  c-9.172-7.904-23.032-6.876-30.947,2.306l-68.236,79.212l-68.229-79.212c-7.91-9.188-21.771-10.216-30.954-2.306  c-9.186,7.91-10.214,21.77-2.304,30.951l72.522,84.196l-72.522,84.192c-7.91,9.182-6.882,23.041,2.304,30.951  c4.143,3.569,9.241,5.318,14.316,5.318c6.161,0,12.294-2.586,16.638-7.624l68.229-79.212l68.236,79.212  c4.338,5.041,10.47,7.624,16.637,7.624c5.069,0,10.168-1.749,14.311-5.318c9.186-7.91,10.22-21.77,2.31-30.951L277.042,248.082z');
      var data;
      function onDown() { data = d3.selectAll(".compList[style='display: block;']").selectAll(".comp").data(); }
      this.SetClockHandle(dta, selComp);
    }
  }

  checkHandleIndex(d: any) {
    var dt = [...this.hisRightGridData].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    return selIndex + 1 + "/" + dt.length;
  }
  rankComp: string = '';
  SetClockHandle(data: any, d: any, type: boolean = false) {
    let that = this;
    var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    let txt = Cname;
    var rank = this.checkHandleIndex(d);
    that.rankComp = rank;
      setTimeout(function () { 
        const atext=  d3.select('#hisTimelineCircle').selectAll('.total_components .header').text("Rank: ")
        atext.append("tspan")
      .attr("class", "")
      .attr("fill", "#fff")
      .text(that.rankComp)
      }, 200);
    let txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%  [" + rank + "]";
    if (txt1.length > 24) { txt1 = "(" + d.ticker + ") " + d3.format(".1f")(d.score) + "%  [" + rank + "]"; }
    if ((Cname.length) > 18) { txt = Cname.slice(0, 18).trim() + "..."; }
    let val = d.cx;
    var r: any = that.radius;
    d3.select("#HiscSlider").attr('transform', 'rotate(' + val + ')');
    d3.select("#HiscSlider").select(".sText").text(txt).style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen = that.equityService.measureText(txt, 9);
        return d.cx > 90 ? ((parseFloat(r) + txtlen + 40) * -1) : "190";
      })
      .attr("transform", function () { return d.cx > 90 ? "rotate(180)" : null; })
      .attr("fill", function () {
        if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        else { return that.cl(d.score + 1); }
      })

    d3.select("#HiscSlider").select(".sText1").text(txt1).style("display", function () { return txt1 == null ? "none" : "block"; })
      .attr("x", function () {
        var txtlen1 = that.equityService.measureText(txt1, 9);
        //console.log('txtlen1 srect1', txtlen1)
        if (txtlen1 > 105) {
          if (txtlen1 > 126) {
            return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 20) * -1) : "190";
          } else { return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 28) * -1) : "190"; }
          
        } else {
          return d.cx > 90 ? ((parseFloat(r) + txtlen1 + 36) * -1) : "190";
        }
        
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
        if (d.score >= 40 && d.score < 55) { return that.MedTxtColor; }
        else { return that.cl(d.score + 1); }
      });

    const slide: any = d3.select("#HiscSlider").select(".sText");
    var bbox: any = slide.node().getBBox();
    var bboxH: any = +bbox.height + 20; bboxH = bboxH > 40 ? bboxH : 40;
    var cSliderWidth = (bbox.width + 17) < 125 ? 125 : (bbox.width + 17);

    d3.select("#HiscSlider").select(".sRect")
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
    d3.select("#HiscSlider").select("#cSliderCancel").attr('transform', 'translate(' + (171 + (cancelX)) + ',' + (-((bboxH / 4) - 3)) + ')');
    d3.select("#HiscSlider").select("#cSliderCancel").on('click', function () {
      that.HisSelComp = undefined;
      that.rankComp = "";
      that.searchClose();
      that.hisCompClick(that.HisSelComp);
    });
    d3.select("#HiscSlider").on('pointerenter', function () { d3.select("#HiscSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('mousemove', function () { d3.select("#HiscSlider").select("#cSliderCancel").style('display', 'block'); })
      .on('pointerleave', function () { d3.select("#HiscSlider").select("#cSliderCancel").style('display', 'none'); })

    d3.select("#HiscSlider").select(".sTextReverse").attr("fill", "#fff").style("display", function () { return txt == null ? "none" : "block"; })
      .attr("x", function (): any {
        if (bboxH == 40) { return -(bboxH + 0); }
        else if (bboxH < 50) { return -(bboxH - 3); }
        else if (bboxH > 50) { return -(bboxH - 15); }
      }).attr("y", -(calW + 17));
    d3.select("#HiscSlider").style('display', 'block').raise();
    var Cname: string = (isNotNullOrUndefined(d.companyName)) ? d.companyName : "";
    var midtxt = Cname + " (" + d.ticker + ") ";

    if (Cname.length > 25) { midtxt = Cname.slice(0, 20) + "... (" + d.ticker + ") "; }
    var colorVal = that.checkHandleColor(that.hisRightGridData, d);
    if (type) { colorVal = that.checkHandleColor(data, d); };
    d3.select('#HiscSlider').select('.sRect1').style("fill", colorVal);
    d3.select('#HiscSlider').select('.sRect').attr("stroke-width", 1).style("stroke", colorVal)
  }

  checkHandleColor(data: any, d: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    return this.cl(per(selIndex));
  }
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  selQtrDataSortedAsc: boolean = true;
  sortedhisRightGridData: any = [];
  SearchhisRightGridData: any = [];
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
    if (this.searchText != '') {
      // this.sortedhisRightGridData = this.hisaddGridData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
      this.sortedhisRightGridData = this.hisaddGridData.filter((item: any) => 
        (item.ticker && item.ticker.toLowerCase().includes(this.searchText.toLowerCase())) ||
      (item.companyName && item.companyName.toLowerCase().includes(this.searchText.toLowerCase()))
      );
      
    } else {
      this.sortedhisRightGridData = this.hisaddGridData;
    }
    //this.onSort();
  }
  openLineChart: boolean = false;
  hisChartTitle: string = '';
  hisChartTitleDate: string = '';
  openHistoryChart() {
    var that = this;
    that.openLineChart = true;
    setTimeout(() => {
      var SelISIN: any;
      var chartTitle = '';
      this.hisChartTitle = '';
      //chartTitle = that.selectedSectorName['name'];
      //console.log(that.selectedSectorName)
      let indexValue: any = [];
      let date: any = [];
      var srVal: any = that.SRValue;
      if (srVal != 100) { srVal = 100 - srVal; }
      var res = this.allYearData;
      if (that.CType == 'ETF') { res = that.filterETFCurrentData(res); }
      var filHisData: any = [...res].filter((x: any) => x.date == that.selHistroyTimeDate);
      if (filHisData.length > 0) {
        this.hisChartTitle = 'All: ' + this.sharedData.numberWithCommas(filHisData[0].top100.toFixed(2)) + ',' + ' Top ' + srVal + '%: ' + this.sharedData.numberWithCommas(filHisData[0].range.toFixed(2));
        this.hisChartTitleDate = filHisData[0].date;
      }
      if (res.length > 0) {
        let indexValue1 = [];
        for (let i = 0; i <= (res.length - 1); ++i) {
          indexValue1.push(res[i]['top100']);
          date.push(res[i]['date']);
        }
        var d = new Date(date[date.length - 1]);
        var formatdate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
        var series: any = [];
        series.push({
          name: "All  (" + formatdate + ' : ' + this.sharedData.numberWithCommas(indexValue1[indexValue1.length - 1].toFixed(2)) + ")",
          marker: { symbol: '' }, color: 'var(--leftSideText)', data: indexValue1, lineWidth: 0.8
        });
        if (that.SRValue <= 100 && that.SRValue > 0) {
          for (let i = 0; i <= (res.length - 1); ++i) {
            indexValue.push(res[i]["range"]);
            date.push(res[i]['date']);
          }
          var d = new Date(date[date.length - 1]);
          var formatdate1 = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();

          series.push({
            name: "Top " + (+srVal.toFixed(0)) + "% (" + formatdate1 + ' : ' + this.sharedData.numberWithCommas(indexValue[indexValue.length - 1].toFixed(2)) + ")",
            marker: { symbol: 'circle' }, color: 'var(--prim-button-color)', data: indexValue, lineWidth: 0.8
          });
        }

        Highcharts.chart({
          chart: {
            renderTo: 'lineChartModal', type: 'spline', style: { fontFamily: 'var(ff-medium)' },
            zooming: {
              mouseWheel: false
            }
          },
          exporting: {
            url: 'https://export.highcharts.com/', enabled: true,
            buttons: { contextButton: { menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'], }, },
          },
          credits: { enabled: false },
          title: { text: chartTitle, style: { color: '#394e8b', fontSize: '13px', fontFamily: 'var(ff-medium)',display:'none' } },
          subtitle: { text: '' }, legend: {},
          xAxis: {
            type: 'datetime', categories: date,
            plotLines: [{
              color: 'var(--border)', width: 1, value: date.indexOf(that.selHistroyTimeDate),
              //label: {
              //  style: {
              //    color: 'var(--warning)',
              //    fontWeight: 'bold',
              //    fontSize: '9px'
              //  },
              //  formatter: function () {
              //    return that.selHistroyTimeDate;
              //  }
              //}
            }],
            tickColor: '#f1f1f1', tickWidth: 1,
            labels: {
              formatter: function () {
                let d = new Date(this.value);
                var currentMonth: any = (d.getMonth() + 1);
                if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
                return (currentMonth + '/' + d.getFullYear().toString());
              },
              style: { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '10px', color: '#333', fontSize: '10px', }
            }
          },
          yAxis: {
            maxPadding: 0.2, lineWidth: 1,
            lineColor: '#2f2f41', title: { text: '' },
            labels: {
              style: { color: '#333', fontSize: '10px' },
              formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); }
            }
          },

          tooltip: {
            xDateFormat: '%Y-%m-%d', valueDecimals: 2,
            shared: true,
            dateTimeLabelFormats: { millisecond: "%A, %b %e" },
          },
          plotOptions: {
            spline: { marker: { radius: 0.1, lineColor: '#666666', lineWidth: 0.1 } },
            series: { point: { events: { click: function (e) { } } } }
          },
          series: series,
          lang: { noData: "No data to display", },
          noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } }
        });
      }
    }, 50)
    //}, error => { that.logger.logError(error, 'GetTop10Holdings'); });
    //that.subscriptions.add(GetIR);
  }

  GetIndId(TabId: any, GICS: any) {
    if (TabId == 0 || GICS == 0) { GICS = 0; return GICS; }
    else if (TabId > 0) { return GICS.substring(0, TabId * 2); }
  }

  filterETFCurrentData(res: any) {
    var that = this;
    let result = [];
    var holdingsDate = that.selectedSectorName['holdingsdate'];
    if (isNotNullOrUndefined(holdingsDate)) holdingsDate = holdingsDate.split('/')[2] + holdingsDate.split('/')[0] + holdingsDate.split('/')[1];
    for (let i = 0; i < res.length; i++) {
      let integerdate = res[i]['date'].split('/')[2] + res[i]['date'].split('/')[0] + res[i]['date'].split('/')[1];
      if (integerdate <= holdingsDate) { result.push(res[i]); }
    }
    return result;
  }

}
