import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
// @ts-ignore
import * as d3 from 'd3';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DataService } from '../../../../core/services/data/data.service';
declare var $: any;
@Component({
  selector: 'steps-performance-components',
  templateUrl: './indexsteps-performance-components.html',
  styleUrl: './indexsteps-performance-components.scss'
})
export class IndexStepsPerformanceComponents implements OnInit, OnDestroy,AfterViewInit{
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
  /* performance*/
  /*@HostListener('document:click', ['$event'])*/
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
  constructor(private dataService: DataService, public sharedData: SharedDataService, public cusIndexService: CustomIndexService) {
  }
  directIndexGridData: any[] = [];
  directIndexGridSearchData: any[] = [];
  sortedDirectIndexGridData: any[] = [];
  sortedIndexStepsGridData: any = [];
  directIndexGridSortedAsc: boolean = true;

  showSpinner: boolean = true;
  showSpinnerPercentage: number = 0;
  showSpinnerTiming: number = 0;
  remCompLength: number = 0;
  direct_progress = "(0s)";
  resetLoader: any;
  getPinnedMenuItems: any = [];
  selComp: any;
  ngOnInit() {
    var that = this;
    that.sharedData.showSpinner.next(true);
    this.loadGridData();
    //var applyTrigger = that.cusIndexService.applyTrigger
    //  .subscribe(res => { if (res) { this.loadGridData(); } });
    //that.subscriptions.add(applyTrigger);
    var showSpin = this.sharedData.showSpinner.subscribe(x => {
      that.showSpinner = x;
      if (that.showSpinner && that.direct_progress == '(0s)') {
        clearInterval(that.resetLoader);
        that.rightGridProgressCount();
      }
    });
    that.subscriptions.add(showSpin);
    var selCompany = that.cusIndexService.selCompany.subscribe(res => {   
      // console.log(res,'index steps')   
      // if (isNotNullOrUndefined(res.isin)) { this.highlightList = res.isin; }
      // else { this.highlightList = ""; };
      // that.vir_ScrollGrids('', this.rightGridData, this.highlightList);
      that.selComp = res  
      that.CenterCircleClick(that.selComp);
      if (isNotNullOrUndefined(res)) { 
       }
      else { 
        that.highlightList = ""; 
        setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
      };
      });
    that.subscriptions.add(selCompany);

    //var exclusionCompData = that.cusIndexService.indexStepsGridData
    //  .subscribe(res => {
    //    if (isNotNullOrUndefined(res) && res.length > 0) {
    //      this.loadGridData();
    //      exclusionCompData.unsubscribe();
    //    }
    //  });
    //that.subscriptions.add(exclusionCompData);
    ////var GetPinnedItems = that.sharedData.getPinnedMenuItems.subscribe(res => {
    ////  var filterCustom = res.filter((x: any) => x.menus == 'Custom Indexing');
    ////  if (filterCustom.length > 0) {
    ////    that.getPinnedMenuItems = filterCustom;
    ////    if (that.getPinnedMenuItems[0].performance == 'Y') {
    ////      this.pinnedPerformanceRight = true;
    ////      this.showDefault_select = 'performance';
    ////    } else { this.pinnedPerformanceRight = false; }

    ////    if (that.getPinnedMenuItems[0].components == 'Y') {
    ////      this.pinnedCompRight = true;
    ////      this.showDefault_select = 'company';
    ////    } else { this.pinnedCompRight = false; }
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
      //console.log('openPinnedRightSide', res)
      that.pinnedCompRight = res;
    });
    this.subscriptions.add(openPinnedRightSide);
    var custToolShortname = that.cusIndexService.custToolShortname.subscribe(res => {
      if (isNotNullOrUndefined(res) && res != '') { that.Strategyname = res; } else { that.Strategyname = ''; }
    });
    that.subscriptions.add(custToolShortname);
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
  CenterCircleClick(selComp:any){
    var that = this;
    that.searchClose();
    if (isNotNullOrUndefined(selComp) && isNotNullOrUndefined(selComp.stockKey)){
      this.highlightList = that.selComp.stockKey;
      that.vir_ScrollGrids('', that.sortedIndexStepsGridData, that.highlightList);
    }
    else{
      this.highlightList =''
     
    }
  }
  componentClick() {
    var that = this;
    if (this.highlightList) {
      setTimeout(() => {
        that.vir_ScrollGrids('', that.sortedIndexStepsGridData, that.highlightList);
      }, 200);
      that.vir_ScrollGrids('', that.sortedIndexStepsGridData, that.highlightList);
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
  IndexStepsGridSearchData: any[] = [];
  loadGridData() {
    this.cusIndexService.selCompany.next(undefined);
    try { this.GetBuildMyIndexMnthlySPortfolio(); } catch (e) { console.log(e) }
    this.cusIndexService.getExclCompData_indexsteps().then((d: any) => {
      var data: any = d['res'];
      data = [...data];
      //this.getPerData();
      if (data.length > 0) {
        this.rightGridData = [...data];
        this.sortedIndexStepsGridData = [...data];
        this.IndexStepsGridSearchData = [...data]
      } else {
        this.sharedData.showCenterLoader.next(false);
        this.rightGridData = [];
        this.sortedIndexStepsGridData = [];
      }
    });
    //this.cusIndexService.getExclCompData().then((res: any) => {
    //  this.rightGridData = [...res];
    //  this.sortedIndexStepsGridData = [...res];
    //  console.log('indexsteps', res);
    //  //this.getPerData();
    //  this.cusIndexService.removedcountCI = [...res].length;
    //});
  }


  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.sortedIndexStepsGridData = this.IndexStepsGridSearchData.filter(item => item.compname.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
  }
  clickComp(d: any) {
    this.cusIndexService.selCompany.next(d);
    this.searchClose()
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    var that = this;
    data.forEach(function (nextState:any, i:any) { return nextState.index = i; });
    
    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].findIndex(x => x.stockKey == selind);
      /*setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index); }, 700);*/
      if (selIsins >= this.IndexStepsGridSearchData.length - 10) {
        setTimeout(() => { that.viewPort.scrollToIndex(selIsins + 4); }, 500);
      } else { setTimeout(() => { that.viewPort.scrollToIndex(selIsins); }, 100); }
    }
  }
  GetBuildMyIndexMnthlySPortfolio() {
    var that = this;
    //that.skullLoader = true;
    this.cusIndexService.customizeSelectedIndex_custom.pipe(first()).subscribe((customizeSelectedIndex:any) => {
      var basedata = customizeSelectedIndex;
      var d = new Date();
      var assetid:any;
      var indexId = 123;
      if (customizeSelectedIndex.group == "Index") {
        indexId = this.cusIndexService.getIndexId(customizeSelectedIndex);
        d = new Date(this.sharedData.equityHoldDate);
        var index = this.cusIndexService._equityIndexeMasData.filter((x:any) => customizeSelectedIndex.name.toLowerCase().indexOf(x.name.toLowerCase()) > -1);

        if (indexId == 0 && index.length > 0 && customizeSelectedIndex.indexType == 'Equity Universe') {
          assetid = index[0].assetId;
          indexId = this.cusIndexService.getIndexId(index[0]);
        }
        else { assetid = customizeSelectedIndex.id; indexId = this.cusIndexService.getIndexId(customizeSelectedIndex); }

      } else {
        assetid = basedata.assetId;
        //var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetid)[0]['holdingsdate'];
        var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetid);
        if (etfHoldDate.length > 0) { d = new Date(etfHoldDate[0]['holdingsdate']) }
       // d = new Date(etfHoldDate);
        if (isNullOrUndefined(d.getFullYear()) || isNaN(d.getFullYear())) { d = new Date(); }
      }
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());

      var currentList = this.cusIndexService.currentSList.value;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == 0);
      let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
      var data = {
        "accountId": 0,
        "notifyid": notifyId[0]['notifyId'],
        "assetid": notifyId[0]['assetId'],
        "userid": userid,
        "strategyId": notifyId[0]['slid'],
        "enddate": date,
        "tenYrFlag": notifyId[0]['tenYrFlag'],
        "indexId": indexId,
        "freqflag": notifyId[0]['freqflag']
      };
     // try { GTharvestData.unsubscribe(); } catch (e) { }
      var GTharvestData = this.dataService.GetTaxharvestSavedCIkub(data).pipe(first()).subscribe(res => {
        if (this.sharedData.checkServiceError(res)) { } else {
          that.cusIndexService.indexStepsTaxData.next(res);
          that.formatPerStatData(this.cusIndexService.performanceTenYrETFRList.value, res);
        }
      }, error => { });
      this.subscriptions.add(GTharvestData);
    });
  }
  
  getPerData() {
    var that = this;
    if (that.direct_progress == '(0s)') {
      that.sharedData.showSpinner.next(true);
    } 
    this.cusIndexService.getPerStatData().then(gData => {
      var performanceETFRList = this.cusIndexService.performanceETFRList.value;
      var performanceUIndexList = this.cusIndexService.performanceUIndexList.value;
      if (this.sharedData.checkServiceError(performanceETFRList)) {alert('service error');}
      if (performanceETFRList.length > 0) {
        if (this.sharedData.checkServiceError(performanceETFRList)) {
          that.formatPerStatData(undefined, performanceUIndexList);
          //this.showNoData = true;
          //this.showSpinner = false;
        } else {
          //this.showNoData = false;
          that.formatPerStatData(performanceETFRList, performanceUIndexList);
        }
      }
    });
  }

  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };

  formatPerStatData(resData:any, UIData:any) {
    var that = this;
    var etfMFVal: any;
    var recMval: any;
    var yourindMval: any;
    this.h_facData = [];
    this.perData = [];
    this.StatData = [];
    this.indexName = '';
    if (isNotNullOrUndefined(resData)) {
      if (resData.length > 0) {
        this.asOfDate = resData[0].date;
        this.sinceDate = "* Date range: " + resData[0].sinceDate + ' to ' + resData[0].date;
      }
      if (resData.length > 1) {
        this.asOfDate = resData[1].date;
        this.sinceDate = "* Date range: " + resData[1].sinceDate + ' to ' + resData[1].date;
      }
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

      if (that.cusIndexService._indexStepsTaxData.length > 1) { resData = [that.cusIndexService._indexStepsTaxData[1]]; }
      try {
        var datas = {
          'H-Factor': [{
            'H-Factor': 'Median h-factor', 'ETFticker': that.percentageFormate(etfMFVal),
            'yourIndex': that.percentageFormate(UIData == undefined ? etfMFVal : yourindMval)
          }],
          'Performance': [
            {
              'Performance': 'YTD', 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'ytdReturn')),
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
              'Performance': ('Since ' + ((isNotNullOrUndefined(resData[0]['sinceDate']) ? resData[0]['sinceDate'] : ''))), 'ETFticker': that.percentageFormateDash(that.checkDataWithKey(resData, 'annReturns')),
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
              'Statistics': 'Turnover', 'ETFticker': that.conv2percentage1(that.checkDataWithKey(resData, 'turnOver')),
              'yourIndex': that.conv2percentage1(UIData == undefined ? that.checkDataWithKey(resData, 'turnOver') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'turnOver'))
            },
          ],
        }

      this.h_facData = [...datas['H-Factor']];
      this.perData = [...datas['Performance']];
      this.StatData = [...datas['Statistics']];
      var basedata: any = this.cusIndexService.customizeSelectedIndex_custom.value;

      //if (isNotNullOrUndefined(basedata.basedon) && basedata.basedon != "") { this.indexName = basedata.basedon; }
      //else if (isNotNullOrUndefined(basedata['Indexname'])) { this.indexName = basedata['Indexname']; }
      //else if (isNotNullOrUndefined(basedata['ticker'])) { this.indexName = basedata['ticker']; }
      //  else if (isNotNullOrUndefined(basedata['name'])) { this.indexName = basedata['name']; }

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

      that.resetLoaderProgressbar();
      that.sharedData.showSpinner.next(false);
      //this.skullLoader = false;
    } catch (e) { }
    that.resetLoaderProgressbar();
    }
  }

  checkDataWithKey(data: any, key: string) { if (isNotNullOrUndefined(data) && data.length > 0 && isNotNullOrUndefined(data[0][key])) { return data[0][key]; } else { return null } }

  resetLoaderProgressbar() {
    var that = this;
    that.showSpinner = false;
    that.direct_progress = "(0s)";
    clearInterval(that.resetLoader);
    this.sharedData.showSpinner.next(false);
  }
  sortProductsAsc() {
    var that = this;
    that.directIndexGridSortedAsc = !that.directIndexGridSortedAsc;
    if (!this.directIndexGridSortedAsc) {
      // Sort in ascending order
      that.sortedDirectIndexGridData = [...that.directIndexGridData].sort((a, b) => a.compname.localeCompare(b.compname));
      //console.log('Sorted in ascending order:', this.sortedDirectIndexGridData);
    } else {
      // Sort in descending order
      that.sortedDirectIndexGridData = [...that.directIndexGridData].sort((a, b) => b.compname.localeCompare(a.compname));
     // console.log('Sorted in descending order:', this.sortedDirectIndexGridData);
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
