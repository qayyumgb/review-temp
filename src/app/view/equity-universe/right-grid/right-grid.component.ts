import { Component, OnDestroy, OnInit,ViewChild,ElementRef,HostListener,AfterViewInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { DataService } from '../../../core/services/data/data.service';
import { max, median } from 'd3';
import * as d3 from 'd3';
declare var $: any;
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { MatDialog } from '@angular/material/dialog';
import { TimelineComponent } from '../../universeDialogsModule/timeline/timeline.component';
import { HisTimelineComponent } from '../../universeDialogsModule/his-timeline/his-timeline.component';
import { CompareComponent } from '../../universeDialogsModule/compare/compare.component';
@Component({
  selector: 'equityDefaultRightGrid',
  templateUrl: './right-grid.component.html',
  styleUrl: './right-grid.component.scss'
})
export class RightGridComponent implements OnInit, OnDestroy,AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  options: Options = {
    floor: 0,
    ceil: 100,
    step: 10,
    showSelectionBar: true
  };
  showDefault_select: string = '';
  subscriptions = new Subscription();
  pinnedCompRight: boolean = true;
  toggleSearch: boolean = false;
  pinnedPerformanceRight: boolean = false;
  highlightList: any = '';
  selIndex: any = '';
  assgUserDrpVal: number = 0;
  rightGridData: any = [];
  showPerf: boolean = false;
  showIndexPerf: boolean = false;
  filteredSearchData: any = [];
  selQtrData: any = [];
  getPinnedMenuItems: any = [];
  SelISIN: any;
  compSelectAll: boolean = false;
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  FilterList: any = [];
  isPinCompVisible = true;
 
  /** top icons **/
  showCutomTool: boolean = false;
  showTimelineBtn: boolean = false;
  showCompareBtn: boolean = false;
  showWatchListIcon: boolean = false;
  watchListIconClicked: boolean = false;
  /** top icons **/
  //@HostListener('document:click', ['$event'])
  //onDocumentClick(event: MouseEvent) {
  //  const target = event.target as HTMLElement;
  //  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  //    this.isPinCompVisible = false;
  //    if (this.pinnedCompRight && this.showDefault_select == 'company' && this.sharedData.checkMenuPer(2027, 2236) == 'Y') {
  //      this.showDefault_select = this.showDefault_select;
  //    }
  //    else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance' && this.sharedData.checkMenuPer(2027, 2237) == 'Y') { this.showDefault_select = this.showDefault_select; }
  //    else { this.showDefault_select = ''; }

  //  } else {
  //    this.isPinCompVisible = true;
  //  }
  //}
  //private isInsideDiv(element: HTMLElement): boolean {
  //  return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  //}
  //excessCumReturns: any;
  //excessAnnReturns: any;
  //getAnalysis(data: any) {
  //  var d = this.equityService._SRValue;
  //  var filt = data;
  //  var c_remaining = "BP_Cbottom" + d + "Rtn";
  //  var cum_removed = (filt[0][c_remaining] - filt[0]["BP_Cbottom100Rtn"]).toFixed(2);
  //  this.excessCumReturns = cum_removed;
  //  var A_remaining = "BP_Abottom" + d + "Rtn";
  //  var annu_removed = (filt[0][A_remaining] - filt[0]["BP_Abottom100Rtn"]).toFixed(2);
  //  this.excessAnnReturns = annu_removed;
   
  //  if (this.sharedData.checkMenuPer(2027, 2237) != 'Y') {
  //    this.sharedData.showMatLoader.next(false);
  //    this.sharedData.showSpinner.next(false);
  //  }
  //}
  returnAsOfDate: string = '';
  checkMyToolTip() {
    var data: any = this.equityService.performanceUIndexList.value;
    var tootip: string = "";
    if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0]['sinceDate']) && isNotNullOrUndefined(data[0]['date'])) {
      this.returnAsOfDate = 'Returns calculated from ' + data[0]['sinceDate'] + ' to ' + data[0]['date']
    } else { this.returnAsOfDate = '' }
  }
  avDataCount: number = 0;
  constructor(public sharedData: SharedDataService,public dataService: DataService, public equityService: EquityUniverseService, public cusIndexService: CustomIndexService, public dialog: MatDialog) { }
  ngOnInit() {
    var that = this;

    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'equity'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'equity', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);


    var rightGridData: any = this.equityService.rightGridData.subscribe((res: any) => { this.pr([...res]); });
    this.subscriptions.add(rightGridData);

    var performanceUIndexList: any = this.equityService.performanceUIndexList.subscribe((res: any) => {
      this.checkMyToolTip();
       });
    this.subscriptions.add(performanceUIndexList);

    var closePPTHideShow: any = this.sharedData.showNavPPT_CenterCircle.subscribe((res: any) => {
      setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
    });
    this.subscriptions.add(closePPTHideShow);
    
    this.selQtrData = [...that.rightGridData];
    var SRValue: any = this.equityService.SRValue.subscribe((res: any) => {
      if (res == 0 || res == 100) {
        if (this.sharedData.checkMenuPer(2027, 2236) == 'Y' && this.sharedData._openPinnedRightSide) {
          this.showDefault_select = 'company';
          this.sharedData.getSelectedRightSide.next('Y')
        };
        this.assgUserDrpVal = 0;
        this.showPerf = false;
        this.showIndexPerf = false;
      } else { this.showPerf = true; };
    });
    //var SRValue: any = this.equityService.getCumulativeAnnData.subscribe((res: any) => {
    //  that.getAnalysis(res);
    //});
    this.subscriptions.add(SRValue);
    var avoidLoserData: any = this.equityService.avoidLoserData.subscribe((res: any) => {
      if (this.equityService._SRValue == 0 || this.equityService._SRValue == 100) {       
        this.pr([...this.equityService.rightGridData.value]);
      } else {
        if (isNotNullOrUndefined(this.equityService._selGICS) && isNotNullOrUndefined(this.equityService._selGICS['group']) &&
          this.sharedData.checkMenuPer(2027, 2235) == 'Y' && this.equityService._selGICS['group'] == "Index" && this.checkIndexPer()) {
          this.loadIndexPerf();
        } else { this.loadPerf() }
        if (isNotNullOrUndefined(res['addedCompanies'])) {
          this.avDataCount = res['addedCompanies'].length;
          this.pr([...res['addedCompanies']]);
        };
      }
    });
    this.subscriptions.add(avoidLoserData);

    var selComp: any = this.equityService.selComp.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) { this.showTimelineBtn = true }
      else { this.showTimelineBtn = false }
      this.GetCaseStudyKey();
      this.checkWatchList();
      
        that.highlightList = '';
        this.searchClose();
        if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res.stockKey)) {
          that.highlightList = res.stockKey;
          that.vir_ScrollGrids('', that.rightGridData, that.highlightList);
        } else {
          that.vir_ScrollGrids('', that.rightGridData, that.highlightList);
        }
    });
    this.subscriptions.add(selComp);
    //var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
    //  var filterCustom = res.filter((x: any) => x.menus == 'ETF Universe');
    //  if (filterCustom.length > 0) {
    //    that.getPinnedMenuItems = filterCustom;
    //    if (that.getPinnedMenuItems[0].performance == 'Y' && this.sharedData.checkMenuPer(2027, 2237) == 'Y') {
    //      this.pinnedPerformanceRight = true;
    //      this.showDefault_select = 'performance';
    //      this.pinnedCompRight = true;
    //    }
    //    else if (that.getPinnedMenuItems[0].components == 'Y' && this.sharedData.checkMenuPer(2027, 2236) == 'Y') {
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
     var crumbdata: any = this.equityService.breadcrumbdata
      .subscribe((res: any) => {
        /*this.breadcrumbdata = res;*/
        this.loadEquityData();
        this.checkWatchList();
      });
    this.subscriptions.add(crumbdata);
    var selResData: any = this.sharedData.selResData.subscribe((res: any) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          this.loadEquityData();
      }
    });
    this.subscriptions.add(selResData);
    var WatchListData: any = this.sharedData.WatchListData.subscribe((res: any) => { this.checkWatchList(); });
    this.subscriptions.add(WatchListData);

    var getSelectedRightSide: any = this.sharedData.getSelectedRightSide.subscribe((res: any) => {

      if (res == 'Y') {
        if (this.showDefault_select == '') { this.showDefault_select = 'company' } else { this.showDefault_select = this.showDefault_select }
        
      }
      else {
        that.pinnedCompRight = this.sharedData._openPinnedRightSide;
        setTimeout(() => { this.showDefault_select = '' }, 200)
      }

    });
    this.subscriptions.add(getSelectedRightSide);
    var openPinnedRightSide: any = this.sharedData.openPinnedRightSide.subscribe((res: any) => {
      //console.log('openPinnedRightSide', res)
      that.pinnedCompRight = res;
    });
    this.subscriptions.add(openPinnedRightSide);
  }
  //pinnedCompRight: boolean = false;
  //showDefault_select: string = '';
  ngAfterViewInit() {
    //$('.dropdown-menu-right .sortingArrow').click(function (event: any) { event.stopPropagation(); });
  }
  showDefault_select_hover(select: string) {
    if (!this.sharedData._openPinnedRightSide) {
      this.showDefault_select = select;
    }
  }
  toggleIconSelect(select: string) {
    this.sharedData.openClickedRightSide.next(!this.sharedData._openClickedRightSide);
    if (this.sharedData._getSelectedRightSide == 'Y' && this.showDefault_select == select) { this.showDefault_select = ''; this.sharedData.getSelectedRightSide.next('N'); }
    else { this.showDefault_select = select; this.sharedData.getSelectedRightSide.next('Y'); this.pinnedCompRight = this.sharedData._openPinnedRightSide; }
  }
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  itemSize = 50;
  maxViewportHeight = 476;
  viewportHeight = 0;
  get viewportDynamicHeight() {
    const windowHeight = window.innerHeight;
    const calculatedHeight = this.rightGridData.length * this.itemSize;
    const finalHeight = Math.min(calculatedHeight, this.maxViewportHeight)
    if(this.rightGridData.length > 14) {

      return `${finalHeight}px`
    }
    else{
      return `calc(100vh - 25rem)`
    }
    // console.log(calculatedHeight,this.rightGridData,'calculatedHeight')
    // this.viewportHeight = Math.min(calculatedHeight, windowHeight);
  }

  pr(data: any) {
    var that= this;
    var gridData: any = this.findMyHandleIndex_H([...data]);
    this.rightGridData = [...gridData];
    // console.log(this.rightGridData,'data')
    // SelFilter: string = 'HF_asc';
    // let selFilterData = this.FilterList.filter((x: any) => x.ID == that.SelFilter)[0];
    // if(selFilterData.ID == 'T_asc' || selFilterData.ID == 'CN_asc'){
    //   that.SelFilter = 'HF_asc';
    // }
    this.onSort();
    this.filteredSearchData = [...gridData];
  }
  checkIconsVisible() {
    if (this.showTimelineBtn && this.equityService.checkFillCompCreation()) { return true; }
    else if ((!this.equityService.checkFillCompCreation() && this.equityService._SRValue > 0 && this.equityService._SRValue < 100) || this.equityService.checkFillCompCreation()) { return true }
    else if (this.equityService._SRValue > 0 && this.equityService._SRValue < 100) { return true }
    else if (this.showWatchListIcon && this.sharedData.checkMenuPer(2027, 2234) == 'Y') { return true }
    else if (this.showTimelineBtn && this.showCompareBtn) { return true }
    else if (this.CaseStudy != undefined && this.CaseStudy != null && this.CaseStudy.length > 0 && this.sharedData.checkMenuPer(2027, 2246) == 'Y') { return true }
    else { return false; }
  }
  eventTrack(e: any) {
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService._selGICS.name,e, 'right grid tab click');
    } catch (e) { }
  }
  scrollToIndexClick(index: number) {
    // console.log(index,'index')
    const middleIndex = Math.max(0, index - Math.floor(this.viewPort.getViewportSize() / 100));
    this.viewPort.scrollToIndex(middleIndex);
  }
  trigger(){
    
    var that = this;
    if (this.highlightList) {
      setTimeout(() => {
        that.vir_ScrollGrids('', that.rightGridData, that.highlightList);
      }, 200);
      /* that.vir_ScrollGrids('', that.rightGridData, that.highlightList);*/
    } else { setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10); }
  }
  compClick(d: any) {
    // console.log(d,'com')
    if (isNotNullOrUndefined(d.stockKey))
      this.highlightList = d.stockKey;
    var fil: any = this.equityService.rightGridData.value.filter((x: any) => x.stockKey == d.stockKey);
    if (fil.length > 0) { this.equityService.selComp.next(fil[0]); }
    this.searchClose()
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService._selGICS.name, d.ticker, 'right grid company click');
    } catch (e) { }
  }

  
  checkIndexPer() {
    var showInd: boolean = false;
    var Gics: any = this.equityService._selGICS;    
    if (isNotNullOrUndefined(Gics) && isNotNullOrUndefined(Gics['assetId'])) {
      if (this.equityService.index.filter((x: any) => x[0] == Gics['assetId']).length > 0) { showInd = true; }
    }
    return showInd;
  }

  findMyHandleIndex_H(data: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    if (this.equityService._SRValue > 0 && this.equityService._SRValue < 100 && isNotNullOrUndefined(this.equityService.avoidLoserData.value)) {
      if (isNotNullOrUndefined(this.equityService.avoidLoserData.value['resData'])) {
        per = d3.scaleLinear().domain([0, [...this.equityService.avoidLoserData.value['resData']].length]).range([0, 100]);
      }
      
    }
    let TotWt:any = d3.sum(data.map(function (d:any) { return (1 - d.scores); }));
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      d['Wt'] = ((1 - d.scores) / TotWt) * 100; 
      return d
    });
    return data
  }
  // scrollToPosition(targetIndex: number) {
  //   var that = this;
  //   const totalItems = this.rightGridData.length;
  //   const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
   

  //   if (targetIndex < 7) {
  
  //     this.viewPort.scrollToIndex(0);
  //   } else if (targetIndex >= totalItems - 8) {

  //     that.viewPort.scrollToIndex(targetIndex + 10); 
  //   } else {

  //     that.viewPort.scrollToIndex(targetIndex + 15); 
  //   }
  // }

  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    // const currentIndex = this.viewPort.getRenderedRange().start;
    const totalItems = this.filteredSearchData.length - itemsVisible;
   // console.log(viewportSize, itemsVisible, currentIndex);
    data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].filter(x => x.stockKey == selind);
      if (selIsins[0].index >= totalItems) {
        //console.log(selIsins[0].index)
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

  checkWeight(d:any) {
    return d.Wt
    //if (this.sharedData._HomeRootPath == 'New Age Alpha Indexes' && isNotNullOrUndefined(d['indexWeight'])) {
    //  return parseFloat(d['indexWeight']) * 100;
    //} else { return d.Wt }
  }
  loadPerf() {
    this.sharedData.showMatLoader.next(true);
    if (this.sharedData.checkMenuPer(2027, 2237) == 'Y' && this.sharedData._getSelectedRightSide == 'Y') { this.showDefault_select = 'performance'; };
    this.equityService.getPerformanceData(this.assgUserDrpVal).then((res: any) => { this.performanceLoad(res); });
  }

  loadIndexPerf() {
    this.showIndexPerf = true;
    this.sharedData.showMatLoader.next(true);
    if (this.sharedData.checkMenuPer(2027, 2237) == 'Y' && this.sharedData._getSelectedRightSide == 'Y') { this.showDefault_select = 'performance'; };
    this.equityService.getPerformanceDataIndex(this.assgUserDrpVal).then((res: any) => { this.IndexperforLoad(res[0], res[1]); });
  }

  hisperStatSliderChange(ev: any) {
    if (isNotNullOrUndefined(ev.value)) {
      this.assgUserDrpVal = parseInt(ev.value);
      this.loadPerf();
    } else {
      this.assgUserDrpVal = 0;
      this.loadPerf();
    }
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); this.equityService.getCumulativeAnnData.next([]) }

  defaultPushPin(val: string) {
    var that = this;
    var pinnedName: string = '';
    try {
      that.sharedData.userEventTrack('Equity Universe', that.equityService._selGICS.name, val, 'right grid pin click');
    } catch (e) { }
    that.pinnedCompRight = !that.pinnedCompRight;
    if (that.pinnedCompRight) {
      that.sharedData.openPinnedRightSide.next(true);
    } else { that.sharedData.openPinnedRightSide.next(false); }
    //let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    //that.pinnedPerformanceRight = !that.pinnedPerformanceRight;
    //if (val == 'performance' && this.sharedData.checkMenuPer(2027, 2237) == 'Y') {
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

  h_facData:any = [];
  StatData:any = [];
  perData1: any = [];
  perData: any = [];
  compDate: string = '';
  performanceLoad(PortfolioData:any) {
  
    let that = this;
    this.sharedData.showMatLoader.next(false);
    var compScores: any = [];
    var usrScores:any = [];
    var naaScores: any = [];
    if ([...this.equityService._rightGridData].length > 0) {
      naaScores.push(median([...this.equityService._rightGridData].map(x => x.score)));
      naaScores.push(max([...this.equityService._rightGridData].map(x => x.score)));
    }
    if (isNotNullOrUndefined(that.equityService._avoidLoserData) && that.equityService._avoidLoserData['addedCompanies'].length > 0) {
      usrScores.push(median(that.equityService._avoidLoserData['addedCompanies'].map((x:any) => x.score)));
      usrScores.push(max(that.equityService._avoidLoserData['addedCompanies'].map((x: any) => x.score)));
      compScores.push((naaScores[0] * that.assgUserDrpVal + usrScores[0] * (100 - that.assgUserDrpVal)) / 100);
      compScores.push((naaScores[1] * that.assgUserDrpVal + usrScores[1] * (100 - that.assgUserDrpVal)) / 100);
    }

    //this.sharedData.compScores.next(compScores);
    //this.sharedData.usrScores.next(usrScores);
    //this.sharedData.naaScores.next(naaScores);
 
    if (PortfolioData.length > 0) {
      that.perData = {
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
          { 'Statistics': 'Standard Deviation', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['stdDeviation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['stdDeviation']), 'Combined': that.percentageFormate(PortfolioData[2]['stdDeviation']) },]
      };
      if (that.assgUserDrpVal == 0) { that.perData = that.assgUserDrpValDash(that.perData); }
      that.h_facData = that.perData['H-Factor'];
      that.StatData = that.perData['Statistics'];
      that.perData1 = that.perData['Performance'];
      that.compDate = 'Returns as of ' + PortfolioData[1].date;
      // console.log('that.compDate',that.compDate)
      this.sharedData.showSpinner.next(false);
      // console.log(that.h_facData, that.StatData, that.perData1);
    }
  }
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
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
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    // this.rightGridData = this.filteredSearchData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
    this.rightGridData = this.filteredSearchData.filter(
      (item: any) => {
        if (isNotNullOrUndefined(item.companyName) && isNotNullOrUndefined(item.ticker) && item.companyName != '' && item.ticker != '') {
          return (
            item.companyName
              .toLowerCase()
              .includes(this.searchText.toLowerCase()) ||
            item.ticker.toLowerCase().includes(this.searchText.toLowerCase())
          );
        }
      }
    );
    // console.log(this.rightGridData,'this.rightGridData')
    this.onSort();
  }
  selQtrDataSortedAsc: boolean = true;
  sortProductsAsc() {
    var that = this;
    that.selQtrDataSortedAsc = !that.selQtrDataSortedAsc;
    if (!this.selQtrDataSortedAsc) {
      // Sort in ascending order
      that.rightGridData = [...that.selQtrData].sort((a, b) => a.companyName.localeCompare(b.companyName));    
    } else {
      // Sort in descending order
      that.rightGridData = [...that.selQtrData].sort((a, b) => b.companyName.localeCompare(a.companyName));  
    }
  }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'equity');
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Equity Universe', selFilterData[0].Name, selFilterData[0].Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    // console.log(selFilterData,'selFilterData')
      var dat = that.RangeFilterGrid(selFilterData.value, that.rightGridData);
      var selind = that.rightGridData.filter((x: any) => x.isin == that.highlightList);
   
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

  onToggleAscending() {  
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'equity'); }
  }

  RangeFilterGrid(IndexN:any, data:any) {
    var that = this;
    data = data.filter((d: any) => d.companyName !== null && d.score !== null && d.ticker !== null);
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
  IndexperforLoad(portIndexData: any, PortfolioData:any) {
    let that = this;
    this.sharedData.showMatLoader.next(false);
    var compScores:any = [];
    var usrScores:any = [];
    var naaScores: any = [];
    this.selIndex = this.equityService._selGICS['name'];
    var indScore = median([...this.equityService._rightGridData].map(x => x.score));
    if ([...this.equityService._rightGridData].length > 0) {
      naaScores.push(indScore);
      naaScores.push(max([...this.equityService._rightGridData].map(x => x.score)));
    }

    if (isNotNullOrUndefined(that.equityService._avoidLoserData) && that.equityService._avoidLoserData['addedCompanies'].length > 0) {
      usrScores.push(median(that.equityService._avoidLoserData['addedCompanies'].map((x:any) => x.score)));
      usrScores.push(max(that.equityService._avoidLoserData['addedCompanies'].map((x: any) => x.score)));
      compScores.push((naaScores[0] * that.assgUserDrpVal + usrScores[0] * (100 - that.assgUserDrpVal)) / 100);
      compScores.push((naaScores[1] * that.assgUserDrpVal + usrScores[1] * (100 - that.assgUserDrpVal)) / 100);
    }

    //this.sharedData.compScores.next(compScores);
    //this.sharedData.usrScores.next(usrScores);
    //this.sharedData.naaScores.next(naaScores);

    if (PortfolioData.length > 0) {
      that.perData = {
        'H-Factor': [
          { 'H-Factor': 'Median h-factor', 'UserPortfolio': that.percentageFormate(naaScores[0]), 'NAAPortfolio': that.percentageFormate(usrScores[0]), 'Combined': that.percentageFormate(compScores[0]), 'NaaIndex': that.percentageFormate(indScore) },
        ],
        'Performance': [
          { 'Performance': 'YTD', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['ytdReturn']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['ytdReturn']), 'Combined': that.percentageFormateDash(PortfolioData[2]['ytdReturn']), 'NaaIndex': that.percentageFormateDash(portIndexData['ytdReturn']) },
          { 'Performance': '1 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y1Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y1Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y1Return']), 'NaaIndex': that.percentageFormateDash(portIndexData['y1Return']) },
          { 'Performance': '3 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y3Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y3Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y3Return']), 'NaaIndex': that.percentageFormateDash(portIndexData['y3Return']) },
          { 'Performance': '5 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y5Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y5Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y5Return']), 'NaaIndex': that.percentageFormateDash(portIndexData['y5Return']) },
          //{ 'Performance': '7 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y7Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y7Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y7Return']), 'NaaIndex': that.percentageFormateDash(portIndexData['y7Return']) },
          { 'Performance': '10 Year', 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['y10Return']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['y10Return']), 'Combined': that.percentageFormateDash(PortfolioData[2]['y10Return']), 'NaaIndex': that.percentageFormateDash(portIndexData['y10Return']) },
          { 'Performance': 'Since ' + PortfolioData[0]['sinceDate'], 'UserPortfolio': that.percentageFormateDash(PortfolioData[1]['annReturns']), 'NAAPortfolio': that.percentageFormateDash(PortfolioData[0]['annReturns']), 'Combined': that.percentageFormateDash(PortfolioData[2]['annReturns']), 'NaaIndex': that.percentageFormateDash(portIndexData['annReturns']) }],
        'Statistics': [
          { 'Statistics': 'Annualized Alpha', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['annulaizedAlpha']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['annulaizedAlpha']), 'Combined': that.percentageFormate(PortfolioData[2]['annulaizedAlpha']), 'NaaIndex': that.percentageFormate(portIndexData['annulaizedAlpha']) },
          { 'Statistics': 'Information Ratio', 'UserPortfolio': that.valueFormat(PortfolioData[1]['informationRatio']), 'NAAPortfolio': that.valueFormat(PortfolioData[0]['informationRatio']), 'Combined': that.valueFormat(PortfolioData[2]['informationRatio']), 'NaaIndex': that.valueFormat(portIndexData['informationRatio']) },
          { 'Statistics': 'Beta', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['beta']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['beta']), 'Combined': that.percentageFormate(PortfolioData[2]['beta']), 'NaaIndex': that.percentageFormate(portIndexData['beta']) },
          { 'Statistics': 'Upside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['upsideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['upsideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['upsideCapture']), 'NaaIndex': that.percentageFormate(portIndexData['upsideCapture']) },
          { 'Statistics': 'Downside Capture', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['downSideCapture']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['downSideCapture']), 'Combined': that.percentageFormate(PortfolioData[2]['downSideCapture']), 'NaaIndex': that.percentageFormate(portIndexData['downSideCapture']) },
          { 'Statistics': 'Correlation', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['correlation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['correlation']), 'Combined': that.percentageFormate(PortfolioData[2]['correlation']), 'NaaIndex': that.percentageFormate(portIndexData['correlation']) },
          { 'Statistics': 'Batting Average', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['battingAverage']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['battingAverage']), 'Combined': that.percentageFormate(PortfolioData[2]['battingAverage']), 'NaaIndex': that.percentageFormate(portIndexData['battingAverage']) },
          { 'Statistics': 'Standard Deviation', 'UserPortfolio': that.percentageFormate(PortfolioData[1]['stdDeviation']), 'NAAPortfolio': that.percentageFormate(PortfolioData[0]['stdDeviation']), 'Combined': that.percentageFormate(PortfolioData[2]['stdDeviation']), 'NaaIndex': that.percentageFormate(portIndexData['stdDeviation']) },],

      }

      if (that.assgUserDrpVal == 0) { that.perData = that.assgUserDrpValDash(that.perData); }

      //that.sharedData.showIndexURL = 'https://presentations.newagealpha.com/indexes/indexes?' + selIndex['indexCode'];

      that.h_facData = that.perData['H-Factor'];
      that.StatData = that.perData['Statistics'];
      that.perData1 = that.perData['Performance'];
      this.sharedData.showSpinner.next(false);
      //that.skullLoader = false;
      //that.indexCompDate = 'Returns as of ' + PortfolioData[1].date;
      that.compDate = 'Returns as of ' + PortfolioData[1].date;
    }
  }

  assgUserDrpValDash(datas:any) {
    datas['H-Factor'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    datas['Performance'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    datas['Statistics'].forEach(function (d: any) { if (isNotNullOrUndefined(d['Combined'])) { d['Combined'] = '-'; return d; } });
    return datas;
  }

  percentageFormate(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00%'; }
    else { return value.toFixed(2) + "%" }
  }

  percentageFormateDash(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return value.toFixed(2) + "%" }
  }

  valueFormat(value:any) {
    value = +value;
    if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00'; }
    else { return value.toFixed(2) }
  }
  openTimeline() {
    var title = 'Index Timeline';
    var options = { from: 'equityUniverse', error: 'Timline', destination: 'timelinePopup', selComp: this.equityService.selComp.value, breadcrumb: this.equityService.breadcrumbdata.value }

    this.dialog.open(TimelineComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    });
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selComp.value.name, this.equityService.selGICS.value.name, 'Timeline popup Click');
    } catch (e) { }
  }
  openHisTimeline() {
    var title = 'Index History Timeline';
    var ind: any = this.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Index");
    var options = {
      from: 'equityUniverse',
      error: 'hisTimline',
      destination: 'HistimelinePopup',
      selGICS: this.equityService.selGICS.value,
      index: (ind.length > 0) ? ind[0] : undefined,
      rightGridData: this.equityService._rightGridData,
      avoidLoserData: this.equityService._avoidLoserData,
      SRValue: this.equityService._SRValue,
      CType: 'MC',
      breadcrumb: this.equityService.breadcrumbdata.value
    }

    this.dialog.open(HisTimelineComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    });
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selGICS.value.name, this.equityService.selGICS.value.name, 'History Timeline popup Click');
    } catch (e) { }
  }
  openAvoidLosers() {
    this.equityService.triggerCumulativeLinechart.next(true);
  }
  loadEquityData() {
    var that = this;
    this.showCompareBtn = false;
    var sector: any = that.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Sector");
    if (sector.length > 0){ this.showCompareBtn = true; }
  }
  openCompare() {
    var title = 'Sector Compare';
    var options = {
      from: 'equityUniverse',
      error: 'Compare',
      destination: 'comparePopup',
      selComp: this.equityService.selComp.value,
      selGICS: this.equityService.selGICS.value,
      circleData: this.equityService.rightGridData.value,
      breadcrumb: this.equityService.breadcrumbdata.value
    }

    var dilog = this.dialog.open(CompareComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    }).afterClosed().subscribe(response => {
      if (isNotNullOrUndefined(response) && isNotNullOrUndefined(response['selComp'])) {
        this.equityService.selComp.next(response['selComp']);
      }
    });
    this.subscriptions.add(dilog);
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selComp.value.name, this.equityService.selGICS.value.name, 'Compare popup Click');
    } catch (e) { }
  }
   checkWatchList() {
    this.showWatchListIcon = false;
    this.watchListIconClicked = false;
    var selComp: any = this.equityService._selComp;
    var index: any = this.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Index");

    var watchListData: any = this.sharedData.WatchListData.value;
    if (isNotNullOrUndefined(selComp)) {
      this.showWatchListIcon = true;
      var filComp: any = watchListData.filter((x: any) => x['stockkey'] == selComp['stockKey']);
      if (filComp.length > 0) { this.watchListIconClicked = true; }
    } else if (index.length > 0) {
      this.showWatchListIcon = true;
      var filInd: any = watchListData.filter((x: any) => x['indexname'] == index[0]['name'] && isNullOrUndefined(x['stockkey']));
      if (filInd.length>0) { this.watchListIconClicked = true; }
    }
  }

  addWatchList() {
    var indexAdd: boolean = false;
    var companyAdd: boolean = false;
    var Type: string = '';

    if (isNotNullOrUndefined(this.equityService._selComp)) {
      companyAdd = true;
      Type = "Company";
    } else {
      indexAdd = true;
      Type = "Index";
    }
    this.sharedData.AddToWatchList(indexAdd, companyAdd, Type, 'Equity', this.equityService._selComp, this.equityService._breadcrumbdata, this.watchListIconClicked);
  }
  caseKey: any;
  CaseStudy: any;
  CaseStudyKey: any;
  GetCaseStudyKey() {
    if (this.sharedData.checkMenuPer(2027, 2246) != 'N' && isNotNullOrUndefined(this.equityService._selComp) && isNotNullOrUndefined(this.equityService._selComp['stockKey'])) {
      if (this.CaseStudyKey != this.equityService._selComp['stockKey']) {
        this.CaseStudyKey = this.equityService._selComp['stockKey'];
        try { this.caseKey.unsubscribe(); } catch (e) { }
        this.caseKey = this.dataService.getCaseStudyData(this.equityService._selComp['stockKey']).pipe(first())
          .subscribe((caseStudy: any) => { this.CaseStudy = caseStudy; }, (error: any) => { this.CaseStudy = undefined; });
        this.subscriptions.add(this.caseKey);
      } else {}
    } else {
      this.CaseStudy = undefined;
      this.CaseStudyKey = undefined;
    };      
  }
  openCaseStudyPdf(url:any) {
    window.open(url, '_blank'); // Replace with the actual PDF path
  }
}
