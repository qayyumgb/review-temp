import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
import { DataService } from '../../../../core/services/data/data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
declare var $: any;

@Component({
  selector: 'thematic-performance-components',
  templateUrl: './performance-components.component.html',
  styleUrl: './performance-components.component.scss'
})
export class PerformanceComponentsThematic implements OnInit, OnDestroy,AfterViewInit {
  showDefault_select: string = '';
  pinnedCompRight: boolean = false;
  pinnedPerformanceRight: boolean = false;
  getPinnedMenuItems: any = [];
  subscriptions = new Subscription();
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  highlightList = '';
  toggleSearch: boolean = false;
  FilterList: any = [];
  isPinCompVisible = true;
  ////@HostListener('document:click', ['$event'])
  ////onDocumentClick(event: MouseEvent) {
  ////  const target = event.target as HTMLElement;
  ////  // Check if the click occurred outside of the specific div
  ////  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  ////    this.isPinCompVisible = false;
  ////    if (this.pinnedCompRight && this.showDefault_select == 'company' && this.sharedData.checkMenuPer(25, 2260) == 'Y') {
  ////      this.showDefault_select = this.showDefault_select;
  ////    }
  ////    else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance' && this.sharedData.checkMenuPer(25, 2261) == 'Y') { this.showDefault_select = this.showDefault_select; }
  ////    else { this.showDefault_select = ''; }
      
  ////  } else {
  ////    this.isPinCompVisible = true;
  ////  }
  ////}

  ////// Helper function to check if an element is inside the specific div
  ////private isInsideDiv(element: HTMLElement): boolean {
  ////  // Logic to check if element is inside the specific div
  ////  return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  ////}

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
  constructor(public theIndexService: ThematicIndexService, public dataService: DataService, public sharedData: SharedDataService, public cusIndexService: CustomIndexService,) { }
  directIndexGridData: any[] = [];
  directIndexGridSearchData: any[] = [];
  sortedDirectIndexGridData: any[] = [];
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  ngOnInit() {
    var that = this;

    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'thematic'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'thematic', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var directIndexData_sub = this.theIndexService.exclusionCompData.subscribe((resData: any[]) => {
      if (isNotNullOrUndefined(resData) && resData.length > 0) {
        this.sortedDirectIndexGridData = [...resData];
     
        this.directIndexGridData = [...resData];
        this.directIndexGridSearchData = [...resData];
      } else { this.directIndexGridData = []; }
      // this.onSort();
    });
    var selCompany_sub = this.theIndexService.selCompany.subscribe((resData: any) => {
      try {
        if (isNotNullOrUndefined(resData)) {
          this.searchClose()
          this.highlightList = resData.isin;
          this.vir_ScrollGrids('', this.sortedDirectIndexGridData, this.highlightList)
        } else { this.highlightList = ''; }
      } catch (e) { console.log(e) }
    });
    this.subscriptions.add(directIndexData_sub);
    this.subscriptions.add(selCompany_sub);
    this.getPerStatData();

    var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
      var filterCustom = res.filter((x: any) => x.menus == 'Thematic Strategies');
      if (filterCustom.length > 0) {
        that.getPinnedMenuItems = filterCustom;
        if (that.getPinnedMenuItems[0].performance == 'Y' ) {
          this.pinnedPerformanceRight = true;
          this.showDefault_select = 'performance';
          this.pinnedCompRight = true;
        }
        else if (that.getPinnedMenuItems[0].components == 'Y') {
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

    var getSelectedRightSide: any = this.sharedData.getSelectedRightSide.subscribe((res: any) => {

      if (res == 'Y') {
        if (this.showDefault_select == '') { this.showDefault_select = 'performance' } else { this.showDefault_select = this.showDefault_select }

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
  ngAfterViewInit() {
    $('.dropdown-menu-right').click(function (event: any) { event.stopPropagation(); });
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
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.sortedDirectIndexGridData = this.directIndexGridSearchData.filter(item => item.compname.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
  }
  clickComp(d: any) {
    this.highlightList = d.isin;
    this.theIndexService.selCompany.next(d);
    this.searchClose()
  }
 
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    // const currentIndex = this.viewPort.getRenderedRange().start;
    const totalItems = this.directIndexGridSearchData.length - itemsVisible;
    data.forEach(function (nextState:any, i:any) { return nextState.index = i; });
    
    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    // else {
      // var selIsins = [...data].filter(x => x.isin == selind);
      // if (selIsins[0].index >= this.directIndexGridSearchData.length - 20) {
      //   setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + 10); }, 500);
      // } else { setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index); }, 100); }
    // }
    else {
      var selIsins = [...data].filter(x => x.isin == selind);
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
  }

  asOfDate: any = '-';
  asOfDateRange: any = '-';
  sinceDate: any = '';
  perStatData: any = [];
  getPerStatData() {
    var id: number = this.theIndexService.customizeSelectedIndex_thematic.value['indexid'];
   var getnaa= this.dataService.GetNAAIndexStrategyPerf(id).pipe(first()).subscribe((res: any) => {
        this.perStatData = res;
        if (isNotNullOrUndefined(res[0]['date'])) { this.asOfDate = res[0]['date']; }
      if (isNotNullOrUndefined(res[0]['sinceDate'])) { this.sinceDate = res[0]['sinceDate']; }
      this.asOfDateRange = "Returns calculated from " + ((isNotNullOrUndefined(res[0].sinceDate)) ? res[0].sinceDate : '-') + ' to ' + ((isNotNullOrUndefined(res[0].date)) ? res[0].date : '-');
      },
      (error: any) => { this.perStatData = []; });
    this.subscriptions.add(getnaa);
  }
 
  indexName: string = "";
  DIname: string = ""

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

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  tabtrack(tab: string) {
    var event: string = "Right side " + tab + " tab clicked";
    var indexname: string = this.theIndexService.customizeSelectedIndex_thematic.value['indexname'];
    this.sharedData.userEventTrack('Thematic Strategies', indexname, indexname, event);
    this.searchClose();
  }

  // SelSortOption: string = 'MC_asc';
  // ascending_val: boolean = true;
  // compSortClick(id: any) {
  //   this.SelSortOption = id;
  //   this.onSort();
  // }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.onSort();
    this.sortTrack();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'thematic');
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Thematic Strategies', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      }
    } catch (e) { }
  }

  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.sortedDirectIndexGridData);
    var selind:any = that.sortedDirectIndexGridData.filter((x: any) => x.isin == that.highlightList);

    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }  
    try { this.sortedDirectIndexGridData = [...dat]; } catch (e) { }
    try {
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
        }, 200);
      }      
    } catch (e) { }
  }
  // onSort() {
  //   var that = this;
  //   if (this.SelSortOption == "MC_asc" && this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return ascending(x.marketCap, y.marketCap) });
  //   } else if (this.SelSortOption == "MC_asc" && !this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return descending(x.marketCap, y.marketCap) });
  //   } else if (this.SelSortOption == "CN_asc" && this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return ascending(x.compname, y.compname) });
  //   } else if (this.SelSortOption == "CN_asc" && !this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return descending(x.compname, y.compname) });
  //   } else if (this.SelSortOption == "T_asc" && this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return ascending(x.ticker, y.ticker) });
  //   } else if (this.SelSortOption == "T_asc" && !this.ascending_val) {
  //     that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x: any, y: any) { return descending(x.ticker, y.ticker) });
  //   } else { that.sortedDirectIndexGridData = [...that.directIndexGridData]; };
  // }
  RangeFilterGrid(IndexN: any, data: any) {
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
  onToggleAscending() {
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'thematic'); }
  }
}
