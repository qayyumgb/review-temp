import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { Workbook } from 'exceljs';
// @ts-ignore
import { saveAs } from "file-saver";
// @ts-ignore
import * as d3 from 'd3';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { DatePipe } from '@angular/common';
declare var $: any;
@Component({
  selector: 'interactive-right-components',
  templateUrl: './right-components.html',
  styleUrl: './right-components.scss'
})
export class InteractiveRightComponent implements OnInit, OnDestroy,AfterViewInit{
  showDefault_select: string = '';
  pinnedCompRight: boolean = false;
  pinnedPerformanceRight: boolean = false;
  subscriptions = new Subscription();
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  highlightList = '';
  toggleSearch: boolean = false;
  isPinCompVisible = true;
 /* performance*/
  h_facData: any = [];
  StatData: any = [];
  perData: any = [];
  asOfDate: any = '-';
  sinceDate: any = '';
  indexName: string = "";
  Strategyname: string = ""
  compSelectAll: boolean = false;
  FilterList: any = [];
  cl: any = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  /* performance*/
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    //console.log(target);
    // Check if the click occurred outside of the specific div
    if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
      this.isPinCompVisible = false;
      if (this.pinnedCompRight && this.showDefault_select == 'company') {
        this.showDefault_select = this.showDefault_select;
      }
      else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance') { this.showDefault_select = this.showDefault_select; }
      else { this.showDefault_select = ''; }
      
      // console.log(this.isPinCompVisible);
    } else {
      this.isPinCompVisible = true;
      // console.log(this.isPinCompVisible);
    }
  }
  excessCumReturns: any;
  excessAnnReturns: any;
  returnAsOfDateCumulative: string = '';
  getAnalysis() {
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
  returnAsOfDate: string = '';
  // Helper function to check if an element is inside the specific div
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  }

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
  SelFilter: any = 'erf_Score';
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    $('.dropdown-menu-right').removeClass('show');
    this.sortTrack();
    if (this.SelFilter == 'FV_asc' || this.SelFilter == 'erf_Score') {
      let selFilterData = this.FilterList.filter((x: any) => x.value == 5);
      if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'ci'); }
    } else { this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'ci'); };
  }
  onToggleAscending() {  
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (this.SelFilter == 'FV_asc' || this.SelFilter == 'erf_Score') { selFilterData = this.FilterList.filter((x: any) => x.value == 5); };    
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'ci'); }
  }

  sortTrack() {
    try {
      if (this.SelFilter == 'FV_asc') {
        this.sharedData.userEventTrack('Custom Index', 'Factor Grid', 'Factor Grid', 'right grid sort click');
      } else if (this.SelFilter == 'erf_Score') {
        this.sharedData.userEventTrack('Custom Index', "ERF SCORE", "ERF SCORE", 'right grid sort click');
      } else {
        let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
        if (selFilterData.length > 0) {
          this.sharedData.userEventTrack('Custom Index', selFilterData.Name, selFilterData.Name, 'right grid sort click');
        }
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    var dat:any = [];
    if (this.SelFilter == 'FV_asc') {
      dat = that.RangeFilterGrid(that.SelFilter, that.sortedCustomerIndexGridData);
    } else if (this.SelFilter == 'erf_Score') {
      dat = that.RangeFilterGrid(that.SelFilter, that.sortedCustomerIndexGridData);
    } else {
      let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
      dat = that.RangeFilterGrid(selFilterData.value, that.sortedCustomerIndexGridData);
    }
    try {
      this.sortedCustomerIndexGridData = [...dat];
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.sortedCustomerIndexGridData, that.highlightList);
        }, 200);
      }
    } catch (e) { }
    var selind: any = that.sortedCustomerIndexGridData.filter((x: any) => x.isin == that.highlightList);   
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
  }
  RangeFilterGrid(IndexN:any, data:any) {
    var that = this;
    if (IndexN == 1) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'companyName'))]; }
    else if (IndexN == 4) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'marketCap'))]; }
    else if (IndexN == 3) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'ticker'))]; }
    else if (IndexN == "FV_asc") { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'factorValue'))]; }
    else if (IndexN == "erf_Score") {
      data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'scores'))];
      data = this.findMyHandleIndex_H(data);
      data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'scores'))];
    }

    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }

  sortwithNullScore(ascending: any, key: any) {
    return function (a: any, b: any) {
      if (a[key] === b[key]) { return 0; }
      if (isNullOrUndefined(a[key]) || a[key] == 0) { return 1; }
      if (isNullOrUndefined(b[key]) || b[key] == 0) { return -1; }
      if (ascending) { return a[key] < b[key] ? -1 : 1; }
      return a[key] < b[key] ? 1 : -1;
    }
  }

  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, private datepipe: DatePipe) { }
  directIndexGridData: any[] = [];
  directIndexGridSearchData: any[] = [];
  cusIndexGridSearchData: any[] = [];
  sortedCustomerIndexGridData: any = [];
  directIndexGridSortedAsc: boolean = true;
  factorId: number = 0;
  showSpinner: boolean = false;
  showSpinnerPercentage: number = 0;
  showSpinnerTiming: number = 0;
  remCompLength: number = 0;
  direct_progress = "(0s)";
  resetLoader: any;
  getPinnedMenuItems: any = [];
  currentSList: any;
  selComp: any;
  selTabLeftMenu: string = 'Alpha'
  checkCumAnn() {
    if (this.cusIndexService.checkFactorResetBtn(this.factorId) && this.selTabLeftMenu == 'Alpha') {
      return false;
    } else if (this.selTabLeftMenu == 'Factors' && this.cusIndexService.checkCircleAnnCum() && this.cusIndexService._custSelectFactor) {
      return false;
    } else { return true; }
  }

  checkSelFilter() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var dt: any = this.sharedData.getSortDropdownlist('R', 'ci', true);
    var select: any = [...this.sharedData.getSortSettingData.value].filter((x: any) => parseInt(x.userid) == parseInt(userid) && x.type == 'R' && isNotNullOrUndefined(x['ci']) && x['ci'] == true);
    var res: any = this.cusIndexService.custSelectFactor.value;
    this.SelFilter = (select.length > 0 && isNotNullOrUndefined(dt['SelFilter']) && dt['SelFilter'] < 5) ? dt['SelFilter'] : 4;
    this.ascending_val = (select.length > 0 && isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : false;
    if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['id']) && res['id'] > 0) {
      this.SelFilter = (select.length > 0 && isNotNullOrUndefined(dt['SelFilter']) && dt['SelFilter'] < 5) ? dt['SelFilter'] : 'FV_asc';
      this.ascending_val = (select.length > 0 && isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : false;
      if (res['id'] == 18) {
        this.SelFilter = (select.length > 0 && isNotNullOrUndefined(dt['SelFilter']) && dt['SelFilter'] < 5) ? dt['SelFilter'] : 'erf_Score';
        this.ascending_val = (select.length > 0 && isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      }
    }
  }
  createComponentsList(dta:any) {
    this.rightGridData = [...dta];
    this.sortedCustomerIndexGridData = [...dta]; 
  }
  receiveClickedList(data: any) {
    console.log('receiveClickedList', data);
  }
  sendComponentList: any = [];
  ngOnInit() {
    var that = this;
    this.sharedData.selResData.subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.createComponentsList(res);
        this.sendComponentList = res;
        console.log('selResData', res);
      }
    })



    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'ci'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      this.checkSelFilter();
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    that.loadGridData();
    var performanceData = this.cusIndexService.performanceUIndexList.subscribe(res => {
      if (isNotNullOrUndefined(res)) { this.getAnalysis(); };
    }, error => { });

    var _selTabLeftMenu = this.cusIndexService.selTabLeftMenu.subscribe(res => {
      this.selTabLeftMenu = res;     
    }, error => { });
    this.subscriptions.add(performanceData);
    this.subscriptions.add(_selTabLeftMenu);

    var applyTrigger = that.cusIndexService.applyTrigger
      .subscribe(res => { if (res) { that.loadGridData(); } });

    that.subscriptions.add(applyTrigger);

    var showSpin = that.sharedData.showSpinner.subscribe(x => {
      that.showSpinner = x;
      if (that.showSpinner && that.direct_progress == '(0s)') {
        clearInterval(that.resetLoader);
        that.rightGridProgressCount();
      }
    });
    that.subscriptions.add(showSpin);
    var selCompany = that.cusIndexService.selCompany.subscribe(res => {      
        if (isNotNullOrUndefined(res)) {
          that.selComp = res;
          that.CenterCircleClick(that.selComp);
        }
        else {
          that.highlightList = "";
          setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
        };
  
      });
    that.subscriptions.add(selCompany);

    //var exclusionCompData = that.cusIndexService.exclusionCompData
    //  .subscribe(res => {
    //    if (isNotNullOrUndefined(res) && res.length > 0) {
    //      that.loadGridData();
    //      exclusionCompData.unsubscribe();
    //    }
    //  });
    //that.subscriptions.add(exclusionCompData);

    var custSelectFactor = that.cusIndexService.custSelectFactor.subscribe(res => {
      this.checkSelFilter();
      this.onSort();
      });
    that.subscriptions.add(custSelectFactor);

    var custSelectFactor = that.cusIndexService.custSelectFactor.subscribe(res => {
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['id'])) { that.factorId = res['id']; }
      else { that.factorId = 0 };
    });
    that.subscriptions.add(custSelectFactor);

    var custToolShortname = that.cusIndexService.custToolShortname.subscribe(res => {
      if (isNotNullOrUndefined(res) && res != '') { that.Strategyname = res; } else { that.Strategyname = ''; }
    });
    that.subscriptions.add(custToolShortname);

    //var custSelectFactorData = that.cusIndexService.custSelectFactorData
    //  .subscribe(res => { if (that.factorId > 0) { that.loadGridData(); } });
    //that.subscriptions.add(custSelectFactorData);

    var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
      var filterCustom = res.filter((x: any) => x.menus == 'Custom Indexing');
      if (filterCustom.length > 0) {
        that.getPinnedMenuItems = filterCustom;
        if (that.getPinnedMenuItems[0].performance == 'Y' && this.sharedData.checkMenuPer(3, 85) == 'Y') {
          this.pinnedPerformanceRight = true;
          this.showDefault_select = 'performance';
          this.pinnedCompRight = true;
        }
        else if (that.getPinnedMenuItems[0].components == 'Y' && this.sharedData.checkMenuPer(3, 86) == 'Y') {
          this.pinnedCompRight = true;
          this.showDefault_select = 'company';
          this.pinnedPerformanceRight = true;
        }
        else {
          this.pinnedPerformanceRight = false;
          this.pinnedCompRight = false;
        }
      } else { that.getPinnedMenuItems = []; }
      
    }, error => { });
    that.subscriptions.add(GetPinnedItems);
  }
  ngAfterViewInit() {
    // $('.dropdown-menu-right').click(function(event:any){
    //   console.log('click')
    //   event.stopPropagation();
    // });
  }
  CenterCircleClick(selComp:any){
    var that = this;
    this.searchClose()
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)){
      this.highlightList = that.selComp.stockKey;
      //console.log(this.highlightList,'his')
      that.vir_ScrollGrids('', that.sortedCustomerIndexGridData, that.highlightList);
    }
    else{
      this.highlightList =''
    }
  }
  componentClick(){
    var that = this;
    if(this.highlightList){
      setTimeout(() => {
        that.vir_ScrollGrids('', that.sortedCustomerIndexGridData, that.highlightList);
      }, 200);
      that.vir_ScrollGrids('', that.sortedCustomerIndexGridData, that.highlightList);
    }
  
  }
  defaultPushPin(val: string) {
    var that = this;
    var pinnedName: string = '';
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));

    if (val == 'performance') {
      that.pinnedPerformanceRight = !that.pinnedPerformanceRight;
      pinnedName = that.pinnedPerformanceRight ? val : '';
    } else if (val == 'components') {
      that.pinnedCompRight = !that.pinnedCompRight;
      pinnedName = that.pinnedCompRight? val: '';
    }
    
    if (that.getPinnedMenuItems.length > 0) {
      var postData = {
        "userid": userid,
        "pId": that.getPinnedMenuItems[0].pid,
        "menuDisplay": "",
        "pMenu": pinnedName,
      }
      that.cusIndexService.pinnedPostMethod(postData);
    }
  }
  rightGridProgressCount() {
    var that = this;
    var min = 0;
    var sec = 0;
    var seconds = "";
    that.resetLoader = setInterval(function () {
      //var a = new Date();
      if (!that.showSpinner) {
        clearInterval(that.resetLoader);
        that.direct_progress = "(0s)";
        setTimeout(function () {
          that.direct_progress = "(0s)";
        }, 200)
      }
      if (min > 0) {
        seconds = min + "m" + " " + sec + "s";
      } else {
        seconds = sec + "s";
      }
      that.direct_progress = "(" + seconds + ")";
      sec++;
      if (sec == 60) {
        min++;
        sec = 0;
      }
    }, 1000);
  }
  rightGridData: any = [];
  cusQtrData: any=[];
  loadGridData() {
    this.cusIndexService.getExclCompData().then((res: any) => {
      this.rightGridData = [...res];
      this.sortedCustomerIndexGridData = [...res];  
      this.directIndexGridSortedAsc = true;
      try {
        this.getPerData();
        this.cusIndexGridSearchData = this.findMyHandleIndex_H([...res]);
        this.cusQtrData = this.findMyHandleIndex_H([...res]);        
        if (this.factorId > 0) { this.loadFactValue([...res]); }
      } catch (e) { console.log(e) }
      this.cusIndexService.removedcountCI = [...res].length;
      if (isNotNullOrUndefined(this.cusIndexService.selCompany.value) && [...res].length > 0 && isNotNullOrUndefined(this.cusIndexService._selCompany.isin)) {
        if ([...res].filter((x: any) => x.isin == this.cusIndexService._selCompany.isin).length == 0) {
          this.cusIndexService.selCompany.next(undefined);
        }
      }
    });
  }
  findMyHandleIndex_H(data: any) {
    var dt = [...this.cusIndexService._exclusionCompData].map(a => ({ ...a })).filter((x: any) => x.scores>0); 
    dt = dt.sort(function (x, y) { return d3.ascending(parseFloat(escape(x.scores)), parseFloat(escape(y.scores))); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      return d
    });
    return data
  }

  loadFactValue(resData:any) {
    var data = this.cusIndexService.custSelectFactorData.value;
    var arr: any = resData.map((obj1:any) => {
      const matchingObj = data.find((obj2:any) => obj2.stockKey === obj1.stockKey);
      return { ...obj1, ...matchingObj };
    });
    this.cusIndexGridSearchData = [...arr]; 
    this.sortedCustomerIndexGridData = [...arr];
    //console.log(this.cusIndexGridSearchData, this.sortedCustomerIndexGridData);
    this.onSort()
  }

  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };

  addCompare() { }

  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.sortedCustomerIndexGridData = this.cusIndexGridSearchData.filter(item => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
    this.onSort();
    // console.log(this.cusIndexGridSearchData, this.sortedCustomerIndexGridData);
  }

  clickComp(d: any) {
    if (this.factorId == 18 && (isNullOrUndefined(d['scores']) || d['scores'] <= 0)) { } else { this.cusIndexService.selCompany.next(d); }    
    this.searchClose()
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    const totalItems = this.cusIndexGridSearchData.length - itemsVisible;
    data.forEach(function (nextState:any, i:any) { return nextState.index = i; });
    
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

  
  getPerData() {
    var that = this;
    if (that.direct_progress == '(0s)') {
      // console.log('start perf loader')
      that.sharedData.showSpinner.next(false);
    } 
    this.cusIndexService.getPerStatData().then(gData => {
      var performanceETFRList = this.cusIndexService.performanceETFRList.value;
      var performanceUIndexList = this.cusIndexService.performanceUIndexList.value;
      if (this.sharedData.checkServiceError(performanceETFRList)) {alert('service error');}
      if (performanceETFRList.length > 0) {
        if (this.sharedData.checkServiceError(performanceETFRList)) {
          that.formatPerStatData(undefined, performanceUIndexList);
          that.sharedData.showSpinner.next(false);
          //this.showNoData = true;
          //this.showSpinner = false;
        } else {
          //this.showNoData = false;
          that.formatPerStatData(performanceETFRList, performanceUIndexList);
        }
      }
    });
  }

  formatPerStatData(resData:any, UIData:any) {
    var that = this;
    var etfMFVal: any;
    var yourindMval: any;
    this.h_facData = [];
    this.perData = [];
    this.StatData = [];
    this.indexName = '';
    var returnAsOfD = '';
    if (isNotNullOrUndefined(resData)) {
      if (resData.length > 1) {
        this.asOfDate = (isNotNullOrUndefined(resData[1].date)) ? resData[1].date : '-';
        this.sinceDate = "* Date range: " + ((isNotNullOrUndefined(resData[1].sinceDate)) ? resData[1].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(resData[1].date)) ? resData[1].date : '-');
        returnAsOfD = ((isNotNullOrUndefined(resData[1].sinceDate)) ? resData[1].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(resData[1].date)) ? resData[1].date : '-');
        
      } else if (resData.length > 0) {
        this.asOfDate = (isNotNullOrUndefined(resData[0].date)) ? resData[0].date:'-';
        this.sinceDate = "* Date range: " + ((isNotNullOrUndefined(resData[0].sinceDate)) ? resData[0].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(resData[0].date)) ? resData[0].date : '-');
        returnAsOfD = ((isNotNullOrUndefined(resData[0].sinceDate)) ? resData[0].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(resData[0].date)) ? resData[0].date : '-');
        
      }
     
      this.cusIndexService.returnAsOfDate.next(returnAsOfD);
      
      if (this.cusIndexService._exclusionCompData.length > 0) {
        var fScore = [...this.cusIndexService._exclusionCompData].map((x: any) => x.scores).filter(y => isNotNullOrUndefined(y));
        var med: any = d3.median(fScore);
        etfMFVal = d3.format(".1f")((parseFloat(med) * 100));
        }
      if (this.rightGridData.length > 0) {
        var rScore = [...that.rightGridData].map((x: any) => x.scores).filter(y => isNotNullOrUndefined(y));
        var med1: any = d3.median(rScore);
        yourindMval = d3.format(".1f")((parseFloat(med1) * 100));
      };
      if (this.cusIndexService._remCompData.length == 0 && this.cusIndexService._remGicsData.length == 0 && this.cusIndexService._PostStrategyFactorsData.length == 0) { UIData = undefined; }
        else { if (isNullOrUndefined(UIData) || UIData.length == 0) { UIData = []; } }

        try {
          var datas = {
            'H-Factor': [{
              'H-Factor': 'Median h-factor', 'ETFticker': that.percentageFormate(etfMFVal),
              'yourIndex': that.percentageFormate(UIData == undefined ? etfMFVal : yourindMval)
            }],
            'Performance': [
              {
                'Performance': 'YTD', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData,'ytdReturn')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'ytdReturn') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'ytdReturn'))
              },
              {
                'Performance': '1 Year', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'y1Return')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'y1Return') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'y1Return'))
              },
              {
                'Performance': '3 Year', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'y3Return')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'y3Return') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'y3Return'))
              },
              {
                'Performance': '5 Year', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'y5Return')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'y5Return') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'y5Return'))
              },
              {
                'Performance': '10 Year', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'y10Return')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'y10Return') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'y10Return'))
              },
              {
                'Performance': ('Since ' + ((isNotNullOrUndefined(resData[0]['sinceDate']) ? resData[0]['sinceDate']:''))), 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'annReturns')),
                'yourIndex': that.percentageFormateDash(UIData == undefined ? that.checkDataWithKey(resData, 'annReturns') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'annReturns'))
              }
            ],
            'Statistics': [
              {
                'Statistics': 'Annualized Alpha', 'ETFticker': that.percentageFormate(that.checkDataWithKey(resData, 'annulaizedAlpha')),
                'yourIndex': that.percentageFormate(UIData == undefined ? that.checkDataWithKey(resData, 'annulaizedAlpha') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'annulaizedAlpha'))
              },
              {
                'Statistics': 'Information Ratio', 'ETFticker': that.valueFormat(that.checkDataWithKey(resData, 'informationRatio')),
                'yourIndex': that.valueFormat(UIData == undefined ? that.checkDataWithKey(resData, 'informationRatio') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'informationRatio'))
              },
              {
                'Statistics': 'Beta', 'ETFticker': that.valueFormat(that.checkDataWithKey(resData, 'beta')),
                'yourIndex': that.valueFormat(UIData == undefined ? that.checkDataWithKey(resData, 'beta') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'beta'))
              },
              {
                'Statistics': 'Upside Capture', 'ETFticker': that.percentageFormate(that.checkDataWithKey(resData, 'upsideCapture')),
                'yourIndex': that.percentageFormate(UIData == undefined ? that.checkDataWithKey(resData, 'upsideCapture') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'upsideCapture'))
              },
              {
                'Statistics': 'Downside Capture', 'ETFticker': that.percentageFormate(that.checkDataWithKey(resData, 'downSideCapture')),
                'yourIndex': that.percentageFormate(UIData == undefined ? that.checkDataWithKey(resData, 'downSideCapture') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'downSideCapture'))
              },
              {
                'Statistics': 'Correlation', 'ETFticker': that.valueFormat(that.checkDataWithKey(resData, 'correlation')),
                'yourIndex': that.valueFormat(UIData == undefined ? that.checkDataWithKey(resData, 'correlation') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'correlation'))
              },
              {
                'Statistics': 'Batting Average', 'ETFticker': that.percentageFormate(that.checkDataWithKey(resData, 'battingAverage')),
                'yourIndex': that.percentageFormate(UIData == undefined ? that.checkDataWithKey(resData, 'battingAverage') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'battingAverage'))
              },
              {
                'Statistics': 'Standard Deviation', 'ETFticker': that.percentageFormate(that.checkDataWithKey(resData, 'stdDeviation')),
                'yourIndex': that.percentageFormate(UIData == undefined ? that.checkDataWithKey(resData, 'stdDeviation') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'stdDeviation'))
              },
              {
                'Statistics': 'Tracking Error', 'ETFticker': that.conv2percentage(that.checkDataWithKey(resData, 'trackingError')),
                'yourIndex': that.conv2percentage(UIData == undefined ? that.checkDataWithKey(resData, 'trackingError') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'trackingError'))
              },
              {
                'Statistics': 'Turnover', 'ETFticker': that.conv2percentage1(that.checkDataWithKey(resData, 'turnover')),
                'yourIndex': that.conv2percentage1(UIData == undefined ? that.checkDataWithKey(resData, 'turnover') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'turnover'))
              },
            ],
          }

          
          this.h_facData = [...datas['H-Factor']];
          this.perData = [...datas['Performance']];
          this.StatData = [...datas['Statistics']];

          var basedata: any = this.cusIndexService.customizeSelectedIndex_custom.value;
          if (isNotNullOrUndefined(basedata) && basedata['Ticker'] != "" && basedata['Ticker'] != null) {
            this.indexName = basedata['Ticker'];
          }
          else if (isNullOrUndefined(basedata['Ticker']) || basedata['Ticker'] == "" && isNotNullOrUndefined(basedata['assetId'])) {
            var ETFIndex: any = [...this.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
            var equtiyIndex: any = [...this.cusIndexService.equityIndexeMasData.value].filter(x => x.assetId == basedata.assetId);
            if (ETFIndex.length > 0) { this.indexName = ETFIndex[0]['ticker']; }
            else if (equtiyIndex.length > 0) { this.indexName = equtiyIndex[0]['name']; }
          }
          else {
            if (isNotNullOrUndefined(basedata.basedon) && basedata.basedon != "") {
              this.indexName = basedata.basedon;
            }
            else if (isNotNullOrUndefined(basedata['Indexname'])) {
              this.indexName = basedata['Indexname'];
            }
            else if (isNotNullOrUndefined(basedata['ticker'])) { this.indexName = basedata['ticker']; }
            else if (isNotNullOrUndefined(basedata['name'])) { this.indexName = basedata['name']; }
          }
         
          that.sharedData.showSpinner.next(false);
        } catch (e) { }
    }
  }

  checkDataWithKey(data: any, key: string) { if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0][key])) { return data[0][key]; } else { return null } }

  conv2percentage(value: any) {
    value = +value;
    if (value == '-') { return '-'; }
    else if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '0.00%'; }
    else { return (value * 100).toFixed(2) + "%" }
  }

  conv2percentage1(value: any) {
    value = +value;
    if (value == '-') { return '-'; }
    else if (value == null || value == undefined || value == "" || value == "NaN" || isNaN(value)) { return '-'; }
    else { return (value * 100).toFixed(2) + "%" }
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

  ngOnDestroy() { this.subscriptions.unsubscribe(); this.cusIndexService.returnAsOfDate.next(''); }

  checkGridActive() {
    var rtn: boolean = false;
    var erfFact = this.cusIndexService.PostStrategyFactorsData.value.filter((xd: any) => xd.factorid == 18);
    if (this.factorId == 18) { return false }
    if (isNotNullOrUndefined(this.factorId) && this.factorId > 0 && this.factorId != 18) { rtn = true }
    else if (this.cusIndexService.custToolSelectByValue.value == 1 || this.cusIndexService.custToolWeightByValue.value == 1) {
      return false
    } else { rtn = true }
    return rtn;
  }

  checkFactName() {
    var that = this;
    var factorName = "";
    var factorMD = this.cusIndexService.factorMasterData.value;
    var d = factorMD.filter((x:any) => x.id == that.factorId);
    if (d.length > 0) { factorName = d[0].displayname; }
    else { factorName = ""; }
    return factorName;
  }

  showRightGridDownloadBtn: boolean = false;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (isNotNullOrUndefined(e['ctrlKey']) && isNotNullOrUndefined(e['shiftKey']) &&
      isNotNullOrUndefined(e['keyCode']) && e['keyCode'] == 76 && e['ctrlKey'] && e['shiftKey'] ) {
      this.showRightGridDownloadBtn=true
    }
  }

  //@HostListener('window:keyup', ['$event'])
  //onKeyUp(e: any) { this.showRightGridDownloadBtn = false; };

  rightGridDownload() {
    var data: any = [...this.sortedCustomerIndexGridData];
    var that = this;
    var flName = 'myIndex';
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    data.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, item.price]); });
    var header = ws.addRow(['Company Name', 'Ticker', 'Price ($)'])
    header.font = { bold: true };    
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }
}
