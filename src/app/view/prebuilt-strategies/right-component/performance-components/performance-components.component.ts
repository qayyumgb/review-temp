import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
// @ts-ignore
import * as d3 from 'd3';
declare var $: any;
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { DataService } from '../../../../core/services/data/data.service';
import { DialogControllerService } from '../../../../core/services/dialogContoller/dialog-controller.service';
import { IndexConstComponent } from '../../../../core/Dialogs/index-const/index-const.component';
import { MatDialog } from '@angular/material/dialog';
import { PerformancePopupComponent } from '../../../charts-popup/performance-popup/performance-popup.component';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
import { ToastrService } from 'ngx-toastr';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
Drilldown(Highcharts);
More(Highcharts);
@Component({
  selector: 'pre-performance-components',
  templateUrl: './performance-components.component.html',
  styleUrl: './performance-components.component.scss'
})
export class PerformanceComponentsComponent_Prebuilt implements AfterViewInit, OnDestroy{
  showDefault_select: string = '';
  pinnedCompRight: boolean = false;
  pinnedPerformanceRight: boolean = false;
  subscriptions = new Subscription();
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  highlightList = '';
  toggleSearch: boolean = false;
  directIndexGridData: any[] = [];
  directIndexGridSearchData: any[] = [];
  sortedDirectIndexGridData: any[] = [];
  directIndexGridSortedAsc: boolean = true;
  isPinCompVisible = true;
  indexDescription: string = '';
  GetNAAIndexStrategyPerf: any = [];
  getPinnedMenuItems: any = [];
  compSelectAll: boolean = false;
  showFixedIncome: boolean = false;
  showFamilyIndex: boolean = false;
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  FilterList: any = [];
  constructor(public sharedData: SharedDataService, public preBuiltService: PrebuildIndexService, private logger: LoggerService, public cusIndexService: CustomIndexService,
    private dataService: DataService, private dialogController: DialogControllerService, public dialog: MatDialog, private toastr: ToastrService) { }


  //@HostListener('document:click', ['$event'])
  //onDocumentClick(event: MouseEvent) {
  //  const target = event.target as HTMLElement;
  //  //console.log(target);
  //  // Check if the click occurred outside of the specific div
  //  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  //    this.isPinCompVisible = false;
  //    if (this.pinnedCompRight && this.showDefault_select == 'company') {
  //      this.showDefault_select = this.showDefault_select;
  //    }
  //    else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance') { this.showDefault_select = this.showDefault_select; }
  //    else {
  //      if (!this.pinnedCompRight && !this.pinnedPerformanceRight) {
  //        this.showDefault_select = '';
  //      }
        
  //    }

  //  } else {
  //    this.isPinCompVisible = true;
  //  }
  //}
  //private isInsideDiv(element: HTMLElement): boolean {
  //  return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  //}
  Top10HoldingData: any = [];
  SectorBreakDownData: any = [];
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
  openCumulativeChart() {
    //apperance_ModalOpen() {
    var title = 'Cumulative Performance';
    var clickeddata: any = this.preBuiltService._preBuiltLineChartData;
    var titleData: any = this.selIndexSector;
    var DM: any = this.preBuiltService.GetNAAIndexPerf.value;
    var BMvalue: string = '';
    if (isNotNullOrUndefined(DM['indexperformanceAll']) && DM['indexperformanceAll'].length > 1 && isNotNullOrUndefined(DM['indexperformanceAll'][1]['IndexName'])) {
      BMvalue = this.preBuiltService.getBMIndexName(DM['indexperformanceAll'][1]).replace('New Age Alpha ', '');
    } else { BMvalue = '' }

    if (isNotNullOrUndefined(clickeddata.indexValues) && clickeddata.indexValues.length > 0) {
      this.dialog.open(PerformancePopupComponent, { width: "90%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, selectedIndex: titleData, BMData: BMvalue } });
    } else { this.toastr.info('Please wait cumulative performance data initializing...', '', { timeOut: 5000 }); }

    //}
    //$('#myAppearanceModal').modal('show');
  }
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  openCumulativeChartStgy() {
    //apperance_ModalOpen() {
    var title = 'Cumulative Performance';
    var clickeddata: any = this.preBuiltService._preBuiltLineChartData;
    var titleData: any = this.preBuiltService.customizeSelectedIndex_prebuilt.value;
    var DM: any = this.preBuiltService.GetNAAIndexPerf.value;
    var BMvalue: string = '';
    if (isNotNullOrUndefined(DM['indexperformanceAll']) && DM['indexperformanceAll'].length > 0 && isNotNullOrUndefined(DM['indexperformanceAll'][1]['IndexName'])) {
      BMvalue = this.preBuiltService.getBMIndexName(DM['indexperformanceAll'][1]).replace('New Age Alpha ', '');
    } else { BMvalue = ''}
    
    if (isNotNullOrUndefined(clickeddata) && clickeddata.length > 0) {
      this.dialog.open(PerformancePopupComponent, { width: "90%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, selectedIndex: [titleData], BMData: BMvalue } });
    } else { this.toastr.info('Please wait cumulative performance data initializing...', '', { timeOut: 5000 }); }

    this.eventTrack(title);
  }

  showStaData: boolean = true
  showIndexPer: boolean = true
  chartData: any = [];
  showSpinner: boolean = true;
  showSpinnerPercentage: number = 0;
  showSpinnerTiming: number = 0;
  direct_progress = "(0s)";
  resetLoader: any;
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
  ngOnInit() {
    var that = this;

    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'prebuild'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'prebuild', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var getIndexConstruction_prebuilt = that.preBuiltService.getIndexConstruction_prebuilt
      .subscribe((res: any) => { this.chartData = res; });
    that.subscriptions.add(getIndexConstruction_prebuilt);
    var showSpin = that.sharedData.showSpinner.subscribe(x => {
      that.showSpinner = x;
      if (that.showSpinner && that.direct_progress == '(0s)') {
        clearInterval(that.resetLoader);
        that.rightGridProgressCount();
      }
    });
    that.subscriptions.add(showSpin);
    var customizeSelectedIndex_prebuilt = that.preBuiltService.customizeSelectedIndex_prebuilt.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        if (isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") { this.showIndexPer = true; }
        else if (isNotNullOrUndefined(res['type']) && res['type'] == "strategy") {
          this.showIndexPer = false;
        } else { this.showIndexPer = true; }
      } else { this.showIndexPer = true; }
      if (isNotNullOrUndefined(res['indexname'])) { this.indexName = res['indexname']; }
      if (isNotNullOrUndefined(res['description'])) { this.indexDescription = res['description']; }
      this.checkFI(res);
      this.checkFamilyIndex(res);
    });
    that.subscriptions.add(customizeSelectedIndex_prebuilt);

    var exclusionCompData = that.preBuiltService.exclusionCompData.subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.directIndexGridData = [...res];
        this.directIndexGridSearchData = [...res];
        var scoreAsc = [...res].sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
        this.sortedDirectIndexGridData = scoreAsc;
        this.onSort();
        this.sharedData.showCenterLoader.next(false);
        this.Top10HoldingData = [...res].sort(function (x, y) { return d3.descending(x.indexWeight, y.indexWeight); }).slice(0, 10);
        this.SectorBreakDownData = this.preBuiltService.createSector([...res]);
      }
    });
    that.subscriptions.add(exclusionCompData);

    var GetNAAIndexStrategyPerf = that.preBuiltService.GetNAAIndexStrategyPerf.subscribe((res: any) => {
      var selInd = that.preBuiltService.customizeSelectedIndex_prebuilt.value;
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(selInd['type']) && selInd['type'] == "strategy") {
        this.GetNAAIndexStrategyPerf = res;
        that.formatPerStatData(res);
      }
    });
    that.subscriptions.add(GetNAAIndexStrategyPerf);

    var GetNAAIndexPerf = that.preBuiltService.GetNAAIndexPerf.subscribe((res: any) => {
      var selInd = that.preBuiltService.customizeSelectedIndex_prebuilt.value;
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(selInd['type']) && selInd['type'] == "NAAIndexes") {
        this.onLoadIndexPer();
      } else {
      /*  this.showDefault_select = ''*/
      }
    });
    that.subscriptions.add(GetNAAIndexPerf);
    var selCompany = this.preBuiltService.selCompany.subscribe(data => {
      that.searchClose();
      that.highlightList = '';
      if (isNotNullOrUndefined(data) && isNotNullOrUndefined(data.stockkey)) {
        that.highlightList = data.stockkey;
        that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
      } else {
        that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
      }
    });
  
    this.subscriptions.add(selCompany);
    ////var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
    ////  var filterCustom = res.filter((x: any) => x.menus == 'Prebuilt Strategies');
    //// // console.log('getPinnedMenuItems', filterCustom);
    ////  if (filterCustom.length > 0) {
    ////    that.getPinnedMenuItems = filterCustom;
    ////    if (that.getPinnedMenuItems[0].performance == 'Y' && this.sharedData.checkMenuPer(4, 104) == 'Y') {
    ////      this.pinnedPerformanceRight = true;
    ////      if (!this.checkDisableIcon()) {
    ////        this.showDefault_select = 'performance';
    ////      } else { this.showDefault_select = ''; }

    ////      this.pinnedCompRight = true;
    ////    }
    ////    else if (that.getPinnedMenuItems[0].components == 'Y' && this.sharedData.checkMenuPer(4, 103) == 'Y') {
    ////      this.pinnedCompRight = true;
    ////      if (!this.checkDisableIcon()) {
    ////        this.showDefault_select = 'company';
    ////      } else { this.showDefault_select = ''; }
    ////      this.pinnedPerformanceRight = true;
    ////    }
    ////    else {
    ////      this.pinnedPerformanceRight = false;
    ////      this.pinnedCompRight = false;
    ////    }

    ////  } else { that.getPinnedMenuItems = []; }

    ////}, error => { that.getPinnedMenuItems = []; });
    ////that.subscriptions.add(GetPinnedItems);

    var getSelectedRightSide: any = this.sharedData.getSelectedRightSide.subscribe((res: any) => {

      if (res == 'Y') {
        if (this.showDefault_select == '') { this.showDefault_select = 'performance' } else { this.showDefault_select = this.showDefault_select }

      }
      else {
        that.pinnedCompRight = this.sharedData._openPinnedRightSide;;
        setTimeout(() => { this.showDefault_select = '' },200)
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
  componentClick(){
    var that = this;
    if(this.highlightList){
      setTimeout(() => {
        that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
      }, 200);
      that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
    }
  
  }
  ngAfterViewInit() { }


  checkFI(res: any) {
    this.showFixedIncome = false;
    this.showFamilyIndex = false;
    if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") {
      if (isNotNullOrUndefined(res['indexid']) && res['indexid'] == 76) { this.showFixedIncome = true; }
      if (isNotNullOrUndefined(res['indexid']) && (res['indexid'] == 260 || res['indexid'] == 262)) { this.showFamilyIndex = true; }
    }
  }
  checkFamilyIndex(res: any) {
    var that = this;
    var id = res['indexid'];
    var GPICF=that.dataService.GetPrebuildIndexConstructionFamily(id).pipe(first()).subscribe((res: any) => {
      // console.log(res,'getIndexConstruction')
      if (res[0] != "Failed" && res.length > 0) {
        that.preBuiltService.getIndexConstruction_prebuiltFamily.next(res);
      } else {
        that.preBuiltService.getIndexConstruction_prebuiltFamily.next([]); 
      }

    }, (error: any) => { that.preBuiltService.getIndexConstruction_prebuiltFamily.next([]); })
    this.subscriptions.add(GPICF);
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
  formName(name: string) {
    if (isNullOrUndefined(name)) { return name.replace("New Age Alpha ", ""); } else { return name.replace("New Age Alpha ", ""); }
  }

  fsiAsofDate: any = '';
  asOfDateRange: any = '';
  selIndexSector: any = [];
  fsIndexPerformance: any = [];
  indexperformanceData: any = [];
  onLoadIndexPer() {
    var that = this;
    if (that.direct_progress == '(0s)') { that.sharedData.showSpinner.next(true); }
    var data: any = that.preBuiltService.GetNAAIndexPerf.value;
    if (isNotNullOrUndefined(data)) {
      if (isNotNullOrUndefined(data['fsIndexPerformance']) && data['fsIndexPerformance'].length > 0) {
        this.fsIndexPerformance = data['fsIndexPerformance'];
        if (isNotNullOrUndefined(this.fsIndexPerformance[0]['description'])) {
          this.indexDescription = this.fsIndexPerformance[0]['description']; 
        }
        if (isNotNullOrUndefined(this.fsIndexPerformance[0]['date'])) {
          this.fsiAsofDate = this.fsIndexPerformance[0]['date']; 
        }

        this.asOfDateRange = "Returns calculated from " + ((isNotNullOrUndefined(data["fsIndexPerformance"][0].firstValueDt)) ? data["fsIndexPerformance"][0].firstValueDt : '-') + ' to ' + ((isNotNullOrUndefined(data["fsIndexPerformance"][0].date)) ? data["fsIndexPerformance"][0].date : '-');
      } else { this.fsIndexPerformance = []; }
      if (isNotNullOrUndefined(data['indexperformanceAll']) && data['indexperformanceAll'].length > 0) {
        this.indexperformanceData = data['indexperformanceAll'];
        // console.log('indexperformanceData', this.indexperformanceData)
        var BenchMarkId: number = (isNotNullOrUndefined(data["indexperformanceAll"][0]['BenchMarkId'])) ? data["indexperformanceAll"][0]['BenchMarkId'] : 0;
        if (BenchMarkId > 0) { this.showStaData = true; } else { this.showStaData = false; }
        this.createYRtable(this.indexperformanceData);
        if (this.indexperformanceData.length > 0) { that.asOfDate = this.indexperformanceData[0].Date; }        
      } else { this.indexperformanceData = []; }
      if (isNotNullOrUndefined(data['indexMaster']) && data['indexMaster'].length > 0) {
        this.selIndexSector = data['indexMaster'];
        //console.log(this.selIndexSector, 'selIndexSector[0]')
      } else { this.selIndexSector = []; }
    }
    setTimeout(() => { that.sharedData.showSpinner.next(false); }, 1000);
  }

  checkDisableIcon() {
    if (this.preBuiltService._GetNAAIndexPerf == undefined) {
      return true;
    } else { return false; }
  }
  replacehf(x: any) { if (isNotNullOrUndefined(x)) { return x.replace("HF", "h-factor"); } else { return '-'; } }
  checkDOI(d: any) {
    if (isNotNullOrUndefined(d['dOI'])) { return d['dOI'] }
    else if (isNotNullOrUndefined(d['doi'])) { return d['doi'] }
    else { return undefined }
  }

  // filterItems() {
  //   var search: string = this.searchText.trim().toLowerCase();
  //   this.sortedDirectIndexGridData = this.directIndexGridSearchData.filter(item => {
  //     if (isNotNullOrUndefined(item.compname) || isNotNullOrUndefined(item.ticker)) {
  //       return item.compname.toLowerCase().includes(search) || item.ticker.toLowerCase().includes(search);
  //     }
  //   })
  //   this.onSort();
  // }
  filterItems() {
    // console.log(this.sortedDirectIndexGridData,'sortedDirectIndexGridData')
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    // this.sortedDirectIndexGridData = this.directIndexGridSearchData.filter(item => item.compname.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
    this.sortedDirectIndexGridData = this.directIndexGridSearchData.filter(
      (item: any) => {
        if (
          isNotNullOrUndefined(item.compname) ||
          isNotNullOrUndefined(item.ticker)
        ) {
          // console.log(item.compname,item.ticker)
          return (
            item.compname
              .toLowerCase()
              .includes(this.searchText.toLowerCase()) ||
            item.ticker.toLowerCase().includes(this.searchText.toLowerCase())
          );
        }
      }
    );
    // console.log(this.sortedDirectIndexGridData,'after')
    this.onSort();
  }
  clickComp(d: any) {
    if (this.showIndexPer) {
      this.highlightList = d.stockkey;
      this.preBuiltService.selCompany.next(d);
      if (this.searchText.length > 0) { this.searchClose(); }
    }
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    // const currentIndex = this.viewPort.getRenderedRange().start;
    const totalItems = this.directIndexGridSearchData.length - itemsVisible;
    data.forEach(function (nextState: any, i: any) { return nextState.index = i; });
    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].filter(x => x.stockkey == selind);
      if (selIsins[0].index >= totalItems - 2){
        that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
        setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + dontMove); }, 10);
      }
      else{
        setTimeout(() => {
          if (selIsins[0].index < dontMove) {
            this.viewPort.scrollToIndex(0);
          } else {
            that.viewPort.scrollToIndex(selIsins[0].index);
          }
        }, 100);
      }
      // if (selIsins[0].index >= this.directIndexGridSearchData.length - 20) {
      //   setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + 10); }, 500);
      // } else { setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index); }, 100); }
    }

    ////data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    ////if (selind == undefined || selind == "" || selind == null) {
    ////  that.highlightList = "";
    ////  setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);

    ////}
    ////else {
    ////  var selIsins = [...data].filter(x => x.stockkey == selind);
    ////  if (selIsins[0].index >= this.directIndexGridSearchData.length - 20) {

    ////    setTimeout(() => {
    ////      const middleIndex = Math.max(selIsins[0].index - Math.floor(this.viewPort.getViewportSize() / 100));
    ////      this.viewPort.scrollToIndex(middleIndex);
    ////    }, 500);
    ////  } else {
    ////    setTimeout(() => {
    ////      const middleIndex = Math.max(selIsins[0].index - Math.floor(this.viewPort.getViewportSize() / 100));
    ////      this.viewPort.scrollToIndex(middleIndex);
    ////    }, 100);
    ////  }
    ////}
  }


  YRData: any = [];
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

    //if (isNotNullOrUndefined(BMIndex)) {
    //  YRData[0] = { 'year': '', 'perfVal': selIndex.IndexName.replace('New Age Alpha ', ''), 'BMVal': that.getBMIndexName(BMIndex) };
    //}
    //else { YRData[0] = { 'year': '', 'perfVal': selIndex.IndexName.replace('New Age Alpha ', '') }; }
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
   // console.log(this.YRData,'YRData')
  }

  //sortProductsAsc() {
  //  var that = this;
  //  that.directIndexGridSortedAsc = !that.directIndexGridSortedAsc;
  //  if (!this.directIndexGridSortedAsc) {
  //    // Sort in ascending order
  //    that.sortedDirectIndexGridData = [...that.directIndexGridData].sort((a, b) => a.compname.localeCompare(b.compname));
  //    //console.log('Sorted in ascending order:', this.sortedDirectIndexGridData);
  //  } else {
  //    // Sort in descending order
  //    that.sortedDirectIndexGridData = [...that.directIndexGridData].sort((a, b) => b.compname.localeCompare(a.compname));
  //    // console.log('Sorted in descending order:', this.sortedDirectIndexGridData);
  //  }

  //}
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'prebuild');
  }

  eventTrack(d:any) {
    try { this.sharedData.userEventTrack('Prebuild Index', d, d, 'right grid tab click'); } catch (e) { };
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Prebuild Index', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.sortedDirectIndexGridData);
    try { this.sortedDirectIndexGridData = [...dat]; } catch (e) { }
    var selind:any = that.sortedDirectIndexGridData.filter((x: any) => x.isin == that.highlightList);
    if (selind.length < 1) { selind = undefined; } else { selind = selind[0]; };
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
        }, 200);
      }      
    } catch (e) { }
  }

  onToggleAscending() {
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { that.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    that.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'prebuild'); }
  }

  RangeFilterGrid(IndexN: any, data: any) {
    data = data.filter((d:any) => d.compname !== null && d.scores !== null &&  d.ticker !== null);
    var that = this;
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
  h_facData: any = [];
  StatData: any = [];
  perData: any = [];
  asOfDate: any = '-';
  sinceDate: any = '';
  indexName: string = "";
  DIname: string = ""

  //formatPerStatData(UIData: any) {
  //  var that = this;
  //  var etfMFVal: any;
  //  var recMval: any;
  //  var yourindMval: any;
  //  var resData: any = [];
  //  const selIndex = this.preBuiltService.customizeSelectedIndex_prebuilt.value;

  //  if (isNotNullOrUndefined(selIndex['basedon'])) { this.indexName = selIndex['basedon']; } else { this.indexName = ""; }
  //  if (isNotNullOrUndefined(selIndex['name'])) { this.DIname = selIndex['name']; } else { this.DIname = ""; }

  //  if (isNotNullOrUndefined(UIData) && UIData.length > 1) { resData = [UIData[1]]; }
  //  if (isNullOrUndefined(resData)) {
  //    this.h_facData = [];
  //    this.perData = [];
  //    this.StatData = [];
  //  } else {
  //    if (resData.length > 0) {
  //      this.asOfDate = resData[0].date;
  //      this.sinceDate = "* Date range: " + resData[0].sinceDate + ' to ' + resData[0].date;
  //      //this.dirIndexService.returnAsOfDate.next(resData[0].sinceDate + ' to ' + resData[0].date);
  //    }
  //    if (resData.length > 1) {
  //      this.asOfDate = resData[1].date;
  //      this.sinceDate = "* Date range: " + resData[1].sinceDate + ' to ' + resData[1].date;
  //      //this.dirIndexService.returnAsOfDate.next(resData[1].sinceDate + ' to ' + resData[1].date);
  //    }

  //    try {

  //      if (isNullOrUndefined(UIData) || UIData.length == 0) { UIData = undefined; }
  //      var datas = {
  //        'H-Factor': [{
  //          'H-Factor': 'Median ERF', 'ETFticker': '0',
  //          'yourIndex': that.percentageFormate(UIData == undefined ? '-' : '0')
  //        }],
  //        'Performance': [
  //          {
  //            'Performance': 'YTD', 'ETFticker': that.percentageFormateDash(resData[0]['ytdReturn']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['ytdReturn'])
  //          },
  //          {
  //            'Performance': '1 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y1Return']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y1Return'])
  //          },
  //          {
  //            'Performance': '3 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y3Return']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y3Return'])
  //          },
  //          {
  //            'Performance': '5 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y5Return']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y5Return'])
  //          },
  //          {
  //            'Performance': '7 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y7Return']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y7Return'])
  //          },
  //          {
  //            'Performance': '10 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y10Return']),
  //            'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y10Return'])
  //          }
  //        ],
  //        'Statistics': [
  //          {
  //            'Statistics': 'Annualized Alpha', 'ETFticker': that.percentageFormate(resData[0]['annulaizedAlpha']),
  //            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['annulaizedAlpha'])
  //          },
  //          {
  //            'Statistics': 'Information Ratio', 'ETFticker': that.valueFormat(resData[0]['informationRatio']),
  //            'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['informationRatio'])
  //          },
  //          {
  //            'Statistics': 'Beta', 'ETFticker': that.valueFormat(resData[0]['beta']),
  //            'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['beta'])
  //          },
  //          {
  //            'Statistics': 'Upside Capture', 'ETFticker': that.percentageFormate(resData[0]['upsideCapture']),
  //            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['upsideCapture'])
  //          },
  //          {
  //            'Statistics': 'Downside Capture', 'ETFticker': that.percentageFormate(resData[0]['downSideCapture']),
  //            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['downSideCapture'])
  //          },
  //          {
  //            'Statistics': 'Correlation', 'ETFticker': that.valueFormat(resData[0]['correlation']),
  //            'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['correlation'])
  //          },
  //          {
  //            'Statistics': 'Batting Average', 'ETFticker': that.percentageFormate(resData[0]['battingAverage']),
  //            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['battingAverage'])
  //          },
  //          {
  //            'Statistics': 'Standard Deviation', 'ETFticker': that.percentageFormate(resData[0]['stdDeviation']),
  //            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['stdDeviation'])
  //          },
  //          {
  //            'Statistics': 'Tracking Error', 'ETFticker': that.conv2percentage(resData[0]['trackingError']),
  //            'yourIndex': that.conv2percentage(UIData == undefined ? '-' : UIData[0]['trackingError'])
  //          },
  //          {
  //            'Statistics': 'Turnover', 'ETFticker': that.conv2percentage1(resData[0]['turnOver']),
  //            'yourIndex': that.conv2percentage(UIData == undefined ? '-' : UIData[0]['turnOver'])
  //          }
  //        ],
  //      }

  //      this.h_facData = [...datas['H-Factor']];
  //      this.perData = [...datas['Performance']];
  //      this.StatData = [...datas['Statistics']];
  //    } catch (e) { }
  //  }

  //}

  formatPerStatData(resData: any) {
    var that = this;
    if (that.direct_progress == '(0s)') { that.sharedData.showSpinner.next(true); };
    if (isNotNullOrUndefined(resData) && resData.length > 0 && isNotNullOrUndefined(resData[0]['benchMarkId'])) {
      this.showStaData = true;
    } else { this.showStaData = false; }
    if (isNullOrUndefined(resData)) {
      that.h_facData = [];
      that.perData = [];
      that.StatData = [];
    } else {
      if (resData.length > 0) {
        that.asOfDate = resData[0].date;
        this.asOfDateRange = "Returns calculated from " + ((isNotNullOrUndefined(resData[0].sinceDate)) ? resData[0].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(resData[0].date)) ? resData[0].date : '-');
      }
      var datas = {
        'H-Factor': [{ 'H-Factor': 'Median H-Factor', 'yourIndex': that.percentageFormate('') }],
        'Performance': [
          { 'Performance': 'YTD', 'yourIndex': that.percentageFormateDash(resData[0]['ytdReturn']) },
          { 'Performance': '1 Year', 'yourIndex': that.percentageFormateDash(resData[0]['y1Return']) },
          { 'Performance': '3 Year', 'yourIndex': that.percentageFormateDash(resData[0]['y3Return']) },
          { 'Performance': '5 Year', 'yourIndex': that.percentageFormateDash(resData[0]['y5Return']) },
          //{ 'Performance': '7 Year', 'yourIndex': that.percentageFormateDash(resData[0]['y7Return']) },
          { 'Performance': '10 Year', 'yourIndex': that.percentageFormateDash(resData[0]['y10Return']) },
          { 'Performance': 'Since ' + resData[0]['sinceDate'], 'yourIndex': that.percentageFormateDash(resData[0]['annReturns']) }],
        'Statistics': [
          { 'Statistics': 'Annualized Alpha', 'yourIndex': that.percentageFormate(resData[0]['annulaizedAlpha']) },
          { 'Statistics': 'Information Ratio', 'yourIndex': that.valueFormat(resData[0]['informationRatio']) },
          { 'Statistics': 'Beta', 'yourIndex': that.percentageFormate(resData[0]['beta']) },
          { 'Statistics': 'Upside Capture', 'yourIndex': that.percentageFormate(resData[0]['upsideCapture']) },
          { 'Statistics': 'Downside Capture', 'yourIndex': that.percentageFormate(resData[0]['downSideCapture']) },
          { 'Statistics': 'Correlation', 'yourIndex': that.percentageFormate(resData[0]['correlation']) },
          { 'Statistics': 'Batting Average', 'yourIndex': that.percentageFormate(resData[0]['battingAverage']) }],

      }
      that.h_facData = [...datas['H-Factor']];
      that.perData = [...datas['Performance']];
      that.StatData = [...datas['Statistics']];
      that.sharedData.showSpinner.next(false);
    }
  }

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

  openConst() {
    var that = this;
    var indexDescription = this.indexDescription;
    // var indexperformanceData=this.indexperformanceData[0]
    var indexName = this.indexName; 
    var indexperformanceData: any = that.preBuiltService.GetNAAIndexPerf.value;
    var clickedData = that.preBuiltService.customizeSelectedIndex_prebuilt.value;
    var chartDataFamily = that.preBuiltService.getIndexConstruction_prebuiltFamily.value;
    //  console.log('clickedData',indexDescription,indexName)

    if (this.chartData.length > 0 && isNotNullOrUndefined(clickedData)) {
      var filterData = this.chartData.filter((x: any) => x.ticker == clickedData.CommonTicker);
    } else {
      this.chartData = [];
    }
    this.dialog.open(IndexConstComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh",
    panelClass:'prebuild_indexconstruction',
      data: { dialogData: filterData, dialogSource: indexDescription, dialogIndexname: indexName, dialogIndexperformace: indexperformanceData, familyIndex: chartDataFamily } });
  }
  ngOnDestroy() { this.subscriptions.unsubscribe(); this.sharedData.showSpinner.next(false); }

}

