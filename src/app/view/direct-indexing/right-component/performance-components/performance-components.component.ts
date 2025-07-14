import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { Subscription } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
// @ts-ignore
import * as d3 from 'd3';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
declare var $: any;
@Component({
  selector: 'app-performance-components',
  templateUrl: './performance-components.component.html',
  styleUrl: './performance-components.component.scss'
})
export class PerformanceComponentsComponent implements OnInit, OnDestroy,AfterViewInit {
  showDefault_select: string = '';
  pinnedCompRight: boolean = false;
  pinnedPerformanceRight: boolean = false;
  subscriptions = new Subscription();
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  highlightList = '';
  toggleSearch: boolean = false;
  getPinnedMenuItems: any = [];
  isPinCompVisible = true;
  compSelectAll: boolean = false;
  selComp: any;
  FilterList: any = [];
  ////@HostListener('document:click', ['$event'])
  ////onDocumentClick(event: MouseEvent) {
  ////  const target = event.target as HTMLElement;
  ////  //console.log(target);
  ////  // Check if the click occurred outside of the specific div
  ////  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  ////    this.isPinCompVisible = false;
  ////    if (this.pinnedCompRight && this.showDefault_select == 'company') {
  ////      this.showDefault_select = this.showDefault_select;
  ////    }
  ////    else if (this.pinnedPerformanceRight && this.showDefault_select == 'performance') { this.showDefault_select = this.showDefault_select; }
  ////    else { this.showDefault_select = ''; }
      
  ////   // console.log(this.isPinCompVisible);
  ////  } else {
  ////    this.isPinCompVisible = true;
  ////   // console.log(this.isPinCompVisible);
  ////  }
  ////}

  ////// Helper function to check if an element is inside the specific div
  ////private isInsideDiv(element: HTMLElement): boolean {
  ////  // Logic to check if element is inside the specific div
  ////  return element.closest('.select__accounts__details') !== null || element.closest('.select__steps__details') !== null || element.closest('.buildYourIndex__sec__rightG') !== null;
  ////}
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
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
  constructor(public sharedData: SharedDataService, public dirIndexService: DirectIndexService, public cusIndexService: CustomIndexService) { }
  directIndexGridData: any[] = [];
  directIndexGridSearchData: any[] = [];
  sortedDirectIndexGridData: any[] = [];
  directIndexGridSortedAsc: boolean = true;
  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('R', 'di'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('R', 'di', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var directIndexData_sub = this.dirIndexService.directIndexData.subscribe((resData: any[]) => {
      if (isNotNullOrUndefined(resData) && resData.length > 0) {
        this.directIndexGridData = [...resData];
        this.directIndexGridSearchData = [...resData];
        this.directIndexGridSortedAsc = true;
        this.sortProductsAsc();
      } else { this.directIndexGridData = []; }
    });
    var selCompany_sub = this.dirIndexService.selCompany.subscribe((resData: any) => {
     
      // try {
      //   if (isNotNullOrUndefined(resData)) {
      //     this.highlightList = resData.isin;
      //     this.vir_ScrollGrids('', this.sortedDirectIndexGridData, this.highlightList)
      //   }
      //   else { this.highlightList = ''; }
      // } catch (e) { console.log(e) }
      // that.highlightList = resData.stockkey;
      
      this.searchClose();
    
      if (isNotNullOrUndefined(resData)) {
        that.selComp = resData
        that.fillCenterCircle(that.selComp);
        // this.highlightList = ''
        // that.highlightList = resData.stockkey;
        // that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
      } else {
        this.highlightList = '';
        setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    
        // that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
      }
    });
    this.subscriptions.add(directIndexData_sub);
    this.subscriptions.add(selCompany_sub);
    this.getPerStatData();
    ////var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
    ////  var filterCustom = res.filter((x: any) => x.menus == 'Direct Indexing');
    ////  if (filterCustom.length > 0) {
    ////    that.getPinnedMenuItems = filterCustom;
    ////    if (that.getPinnedMenuItems[0].performance == 'Y') {
    ////      this.pinnedPerformanceRight = true;
    ////      this.showDefault_select = 'performance';
    ////      this.pinnedCompRight = true;
    ////    }
    ////    else if (that.getPinnedMenuItems[0].components == 'Y') {
    ////      this.pinnedCompRight = true;
    ////      this.showDefault_select = 'company';
    ////      this.pinnedPerformanceRight = true;
    ////    }
    ////    else {
    ////      this.pinnedPerformanceRight = false;
    ////      this.pinnedCompRight = false;
    ////    }
    ////  } else { that.getPinnedMenuItems = []; }

    ////}, error => { });
    ////that.subscriptions.add(GetPinnedItems);
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
  fillCenterCircle(selComp:any){
    var that = this;
   
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)){
      this.highlightList = that.selComp.stockKey;
      that.vir_ScrollGrids('', that.sortedDirectIndexGridData, that.highlightList);
    }
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
    this.onSort();
  }
  clickComp(d: any) {
    this.highlightList = d.stockKey;
    this.dirIndexService.selCompany.next(d);
    this.searchClose()
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    const currentIndex = this.viewPort.getRenderedRange().start;
    const totalItems = this.directIndexGridSearchData.length - itemsVisible;
    data.forEach(function (nextState:any, i:any) { return nextState.index = i; });
    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].filter(x => x.stockKey == selind);
      if (selIsins[0].index >= totalItems) {
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

  getPerStatData() {
    this.dirIndexService.getPerStatData_prebuilt().then((res: any) => {
      if (isNotNullOrUndefined(res)) { this.formatPerStatData(res); } else { };
    })
  }
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    $('.dropdown-menu-right').removeClass('show');
    this.sortTrack();
    this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'di');
  }
  onToggleAscending() {  
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'di'); }
  }

  sortTrack() {
    try {
      let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
      if (selFilterData.length > 0) {
        this.sharedData.userEventTrack('Direct Index', selFilterData.Name, selFilterData.Name, 'right grid sort click');
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
  sortProductsAsc() {
    var that = this;
    that.directIndexGridSortedAsc = !that.directIndexGridSortedAsc;
    if (!this.directIndexGridSortedAsc) {
      // Sort in ascending order
      that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x:any, y:any) { return d3.ascending(parseFloat(x.marketcap), parseFloat(y.marketcap)); });
   
    } else {
      // Sort in descending order
      that.sortedDirectIndexGridData = [...that.directIndexGridData].sort(function (x:any, y:any) { return d3.ascending(parseFloat(x.marketcap), parseFloat(y.marketcap)); });
     // console.log('Sorted in descending order:', this.sortedDirectIndexGridData);
    }
    
  }
  h_facData: any = [];
  StatData: any = [];
  perData: any = [];
  asOfDate: any = '-';
  sinceDate: any = '';
  indexName: string = "";
  shortName:string="";
  DIname: string = ""

  formatPerStatData(UIData: any) {
    var that = this;
    var etfMFVal: any;
    var recMval: any;
    var yourindMval: any;
    var resData: any = [];
    const selIndex = this.dirIndexService.customizeSelectedIndex_Direct.value;
    //console.log(selIndex,'selIndex')
    if (isNotNullOrUndefined(selIndex['basedon'])) { this.indexName = selIndex['basedon']; } else { this.indexName = ""; }
    if (isNotNullOrUndefined(selIndex['shortname']) && selIndex['pbGroupType'] == 'ETFName') {
      this.shortName = selIndex['shortname'];
    }
    else if (isNotNullOrUndefined(selIndex['basedon']) && selIndex['pbGroupType'] == 'Index') {
      this.shortName = selIndex['basedon'];
    }
    else { this.shortName = ""; }
    if (isNotNullOrUndefined(selIndex['name'])) { this.DIname = selIndex['name']; } else { this.DIname = ""; }

    if (isNotNullOrUndefined(UIData) && UIData.length > 1) { resData = [UIData[1]]; }
    if (isNullOrUndefined(resData)) {
      this.h_facData = [];
      this.perData = [];
      this.StatData = [];
    } else {
      if (resData.length > 0) {
        this.asOfDate = resData[0].date;
        this.sinceDate = "Returns calculated from " + resData[0].sinceDate + ' to ' + resData[0].date;
        this.dirIndexService.returnAsOfDate.next(resData[0].sinceDate + ' to ' + resData[0].date);
      }
      if (resData.length > 1) {
        this.asOfDate = resData[1].date;
        this.sinceDate = "Returns calculated from " + resData[1].sinceDate + ' to ' + resData[1].date;
        this.dirIndexService.returnAsOfDate.next(resData[1].sinceDate + ' to ' + resData[1].date);
      }

      try {

        if (isNullOrUndefined(UIData) || UIData.length == 0) { UIData = undefined; }
        var datas = {
          'H-Factor': [{
            'H-Factor': 'Median h-factor', 'ETFticker': '0',
            'yourIndex': that.percentageFormate(UIData == undefined ? '-' : '0')
          }],
          'Performance': [
            {
              'Performance': 'YTD', 'ETFticker': that.percentageFormateDash(resData[0]['ytdReturn']),
              'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['ytdReturn'])
            },
            {
              'Performance': '1 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y1Return']),
              'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y1Return'])
            },
            {
              'Performance': '3 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y3Return']),
              'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y3Return'])
            },
            {
              'Performance': '5 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y5Return']),
              'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y5Return'])
            },
            //{
            //  'Performance': '7 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y7Return']),
            //  'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y7Return'])
            //},
            {
              'Performance': '10 Year', 'ETFticker': that.percentageFormateDash(resData[0]['y10Return']),
              'yourIndex': that.percentageFormateDash(UIData == undefined ? '-' : UIData[0]['y10Return'])
            }
          ],
          'Statistics': [
            {
              'Statistics': 'Annualized Alpha', 'ETFticker': that.percentageFormate(resData[0]['annulaizedAlpha']),
              'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['annulaizedAlpha'])
            },
            {
              'Statistics': 'Information Ratio', 'ETFticker': that.valueFormat(resData[0]['informationRatio']),
              'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['informationRatio'])
            },
            {
              'Statistics': 'Beta', 'ETFticker': that.valueFormat(resData[0]['beta']),
              'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['beta'])
            },
            {
              'Statistics': 'Upside Capture', 'ETFticker': that.percentageFormate(resData[0]['upsideCapture']),
              'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['upsideCapture'])
            },
            {
              'Statistics': 'Downside Capture', 'ETFticker': that.percentageFormate(resData[0]['downSideCapture']),
              'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['downSideCapture'])
            },
            {
              'Statistics': 'Correlation', 'ETFticker': that.valueFormat(resData[0]['correlation']),
              'yourIndex': that.valueFormat(UIData == undefined ? '-' : UIData[0]['correlation'])
            },
            {
              'Statistics': 'Batting Average', 'ETFticker': that.percentageFormate(resData[0]['battingAverage']),
              'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['battingAverage'])
            },
            {
              'Statistics': 'Standard Deviation', 'ETFticker': that.percentageFormate(resData[0]['stdDeviation']),
              'yourIndex': that.percentageFormate(UIData == undefined ? '-' : UIData[0]['stdDeviation'])
            },
            {
              'Statistics': 'Tracking Error', 'ETFticker': that.conv2percentage(resData[0]['trackingError']),
              'yourIndex': that.conv2percentage(UIData == undefined ? '-' : UIData[0]['trackingError'])
            },
            {
              'Statistics': 'Turnover', 'ETFticker': that.conv2percentage1(resData[0]['turnOver']),
              'yourIndex': that.conv2percentage(UIData == undefined ? '-' : UIData[0]['turnOver'])
            }
          ],
        }

        this.h_facData = [...datas['H-Factor']];
        this.perData = [...datas['Performance']];
        this.StatData = [...datas['Statistics']];
      } catch (e) { }
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

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
}
