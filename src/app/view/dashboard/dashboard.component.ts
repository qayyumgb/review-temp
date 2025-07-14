import { Component, DestroyRef, HostListener, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { CompactType, DisplayGrid, GridsterComponentInterface, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType } from 'angular-gridster2';
import { GridsterComponent, GridsterItemComponentInterface } from 'angular-gridster2';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { nodesCB, GridstackComponent } from 'gridstack/dist/angular';
import { Subscription, delay, filter, first, of } from 'rxjs';
import { DataService } from '../../core/services/data/data.service';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import * as d3 from 'd3';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RoutesRecognized } from '@angular/router';
import { EtfsUniverseService } from '../../core/services/moduleService/etfs-universe.service';
import { EquityUniverseService } from '../../core/services/moduleService/equity-universe.service';
import { PrebuildIndexService } from '../../core/services/moduleService/prebuild-index.service';
import { ThematicIndexService } from '../../core/services/moduleService/thematic-index.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  //@ViewChild('gridStack', { static: false }) gridStackElement!: ElementRef;
  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  //grid!: GridStack;
  
  subscriptions = new Subscription();
  classFlag: boolean = false;
  showRouletDash: boolean = true;
  resetCards: boolean = true;
  show_Gridoptions: boolean = false;
  showPresentMode: boolean = false;
  showUniverseMenu: boolean = false;
  showMatLoader_checkBox: boolean = false;
  DIEnabletradinglist: any[] = [];
  allstat: any = [];
  UserTabsRolePermissionData: any = [];
  UPermissionData: boolean = true;
  getPinnedMenuItems: any = [];
  getSwapCardList: any = [];
  public reset_items_session: GridStackWidget[] = [];
  emptyFilterText = false;
  gridOptionsCheckbox: any = { 'equity': true, 'direct': true, 'prebuilt': true, 'thematic': true, 'portfolio': true, 'strategies': true, 'etf': true }
  gridsterReset: any = [{ 'name': 'equity', 'pidName': 'Equity Universe', 'grid': 'grid1', 'show': true },
  { 'name': 'etf', 'pidName': 'ETF Universe', 'grid': 'grid7', 'show': true },
  { 'name': 'direct', 'pidName': 'Direct Indexing', 'grid': 'grid2', 'show': true },
  { 'name': 'prebuilt', 'pidName': 'Prebuilt Strategies', 'grid': 'grid3', 'show': true },
  { 'name': 'thematic', 'pidName': 'Thematic Strategies', 'grid': 'grid4', 'show': true },
  { 'name': 'portfolio', 'pidName': 'Upload Portfolios', 'grid': 'grid5', 'show': true },
  { 'name': 'strategies', 'pidName': 'My Strategies', 'grid': 'grid6', 'show': true },]

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    var that = this;
    var innerW = event.target.innerWidth;
    if (innerW <= 1600) { that.classFlag = true; } else { that.classFlag = false; }
  }
 
  ruletReset(data: any) {
    var that = this;
    var receivedData = data;
    if (receivedData) { that.showRouletDash = false; this.sharedData.rouletCircleHomeClick.next(false) }
  }
  loadGridStack() {

  }
  public reset_items: GridStackWidget[] = [
    { x: 0, y: 0, minW: 12, minH: 2, id: 'equity', },
    { x: 0, y: 2, minW: 12, minH: 2, id: 'etf', },
    { x: 0, y: 4, minW: 12, minH: 2, id: 'direct', },
    { x: 0, y: 6, minW: 12, minH: 2, id: 'prebuilt', },
    { x: 0, y: 8, minW: 12, minH: 2, id: 'thematic', },
    { x: 0, y: 10, minW: 12, minH: 2, id: 'strategies', },
  ];
 
  public items: GridStackWidget[] = [
    { x: 0, y: 0, minW: 12, minH: 2, id: 'equity', },
    { x: 0, y: 2, minW: 12, minH: 2, id: 'etf', },
    { x: 0, y: 4, minW: 12, minH: 2, id: 'direct', },
    { x: 0, y: 6, minW: 12, minH: 2, id: 'prebuilt', },
    { x: 0, y: 8, minW: 12, minH: 2, id: 'thematic', },
    { x: 0, y: 10, minW: 12, minH: 2, id: 'strategies', },
  ];
  public gridOptions: GridStackOptions = {
    margin: 5,
    column: 'auto',
    cellHeight: '7.2vh',
    disableResize: true,
    disableDrag: false
  }
  SwappedGrid: any = [];
  public onChange(data: nodesCB) {
    var that = this;
    const parentGridEngine: GridStackWidget[] = that.gridComp?.grid?.engine?.nodes ?? [];
    
    if (isNotNullOrUndefined(parentGridEngine) && parentGridEngine.length > 0) {
      that.SwappedGrid = parentGridEngine;
    } else { that.SwappedGrid = []; }
    
    //console.log(this.items, this.gridsterReset)
    //console.log('this.SwappedGrid', this.SwappedGrid);
    //console.log('change ', data, data.nodes.length > 1 ? data.nodes : data.nodes[0], data.nodes);
  
    // Create a map to store the desired order and y values
    const matchOrder = new Map([...that.SwappedGrid].map((item:any, index:any) => [item.id, { order: index, y: item.y }]));

    // Update the y values in reset_items based on matchOrder and sort
    var matchSort = that.reset_items.map(item => {
      const matchedItem = matchOrder.get(item.id);
      return matchedItem ? { ...item, y: matchedItem.y } : item;
    }).sort((a, b) => {
      const aOrder = matchOrder.get(a.id)?.order ?? Infinity;
      const bOrder = matchOrder.get(b.id)?.order ?? Infinity;
      return aOrder - bOrder;
    });
    // Update y values incrementally by 2 starting from 0
    for (let i = 0; i < matchSort.length; i++) {
      matchSort[i].y = i * 2;
    }
    this.sharedData.getSwapTileData.next(matchSort); 
    that.reset_items_session = matchSort;
    that.postCardSwapSettings(that.reset_items_session);
  }
  public identify(index: number, w: GridStackWidget) {
    return w.id; // or use index if no id is set and you only modify at the end...
  }
  disclosureHref:string = '';
  ngAfterViewInit() {
    var that = this;
    if (window.location.href.indexOf("https://space.buildyourindex.com") > -1) {
      that.disclosureHref = "https://www.newagealpha.com/disclaimers";
    }
    else {
      that.disclosureHref = "https://demo-alpha7.newagealpha.com/disclaimers";
    }
  
  }
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService,
    private dataService: DataService, public dirIndexService: DirectIndexService, public dialog: MatDialog,
    public preBuiltService: PrebuildIndexService, public theBuiltService: ThematicIndexService,
    public etfService: EtfsUniverseService, public equityService: EquityUniverseService,
    private toastr: ToastrService, private router: Router) {
    if (window.innerWidth <= 1600) { this.classFlag = true; } else { this.classFlag = false; };
    this.sharedData.showCircleLoader.next(true);
  }
  //getRebalances() {
  //  var that = this;
  //  let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
  //  const sList = this.dataService.GetUpcomingRebalances()
  //    .subscribe((data: any) => {
  //      if (data[0] != "Failed") {
  //        this.sharedData.getRebalancesPopupData.next(data);
  //        if (data.length > 0) {
  //          setTimeout(function () { that.openRebalanceAlert(); }.bind(this), 500);
  //        }
  //      }
  //    }, error => {
  //      this.sharedData.getRebalancesPopupData.next([]);
  //    });
  //}
  //openRebalanceAlert() {
  //  var title = 'Upcoming rebalance accounts';
  //  var options = { from: 'authentication', error: 'notifyError', destination: 'close' }
  //  var clickeddata: any = this.sharedData._getRebalancesPopupData;
  //  this.dialog.open(RebalanceNavComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  //}
  equityCountryList: any = [];
  getEquitList() {
    this.equityService.getEquityLevelData().then((res: any) => {
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['menuData'])) { this.equityCountryList = res['menuData']; }
    });
  }
  equityClickMain() {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
    //  that.router.navigate(["/equityUniverse"]);
    //}, 10)
    that.sharedData.userEventTrack('Dashboard', "Equity", 'View Equity', 'View Equity');
    that.router.navigate(['/equityUniverse']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }
  equityClick(d: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
   /* setTimeout(() => {*/
      that.equityService.selGICS.next(d);
      that.equityService.countryCheckClick(d).then((res: any) => {
        var crumbdata: any = that.equityService.breadcrumbdata.value;
        if (isNotNullOrUndefined(res) && res[0]) {
          crumbdata.push(d);
          crumbdata.push(res[1]);
          that.equityService.selGICS.next(res[1]);
        } else { crumbdata.push(d); }
        that.equityService.breadcrumbdata.next(crumbdata);
        //that.router.navigate(["/equityUniverse"]);
      });
   /* }, 10)*/
    that.sharedData.userEventTrack('Dashboard', "Equity", d['name'], 'View Grid Click');
    that.router.navigate(['/equityUniverse']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }

  trackEV(d: string) {
    this.sharedData.userEventTrack('Dashboard', d, d, 'View Grid Click');
  }

  etfList: any = [];
  getEtfList() {
    this.etfService.getETFsLevelData().then((res: any) => {
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['menuData'])) { this.etfList = res['menuData']; }
    });
  }
  matLoaderOn() {
    this.sharedData.showMatLoader.next(true);
  }
  etfClickMain() {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
    //  that.router.navigate(["/etfUniverse"]);
    //}, 10)
    that.sharedData.userEventTrack('Dashboard', "ETF", "ETF", 'View ETF');
    that.router.navigate(['/etfUniverse']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }
  etfClick(d: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    that.sharedData.showCircleLoader.next(true);
    //setTimeout(() => {
    //  that.etfService.selGICS.next(d);
    //  that.etfService.breadcrumbdata.next([d]);
    //  that.router.navigate(["/etfUniverse"]);
    //}, 10)

    that.etfService.selGICS.next(d);
    that.etfService.breadcrumbdata.next([d]);

    that.sharedData.userEventTrack('Dashboard', "ETF", d['name'], 'View Grid Click');

    that.router.navigate(['/etfUniverse']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }

  dirIndList: any = [];
  getDirIndList() {
    this.dirIndexService.getDirectlvlData({ 'group': "" }).then((res: any) => {
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['menuData'])) { this.dirIndList = res['menuData']; }
    });
  }
  dirIndClickMain() {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
    //  that.router.navigate(["/directIndexing"]);
    //}, 10)
    that.sharedData.userEventTrack('Dashboard', "Direct", 'Direct', 'View Grid Click');
    that.router.navigate(['/directIndexing']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }
  dirIndClick(d: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
    //  //this.sharedData.showCircleLoader.next(true);
    //  that.dirIndexService.customizeSelectedIndex_Direct.next(d);
    //  that.dirIndexService.directIndexBrcmData.next([d]);
    //  that.router.navigate(["/directIndexing"]);
    //}, 10)

    that.dirIndexService.customizeSelectedIndex_Direct.next(d);
    that.dirIndexService.directIndexBrcmData.next([d]);

    that.sharedData.userEventTrack('Dashboard', "Direct", d['name'], 'View Grid Click');
    that.router.navigate(['/directIndexing']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }

  approvedClickMain() {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    setTimeout(() => {
      that.router.navigate(["/approvedStrategies"]);
    }, 10)
    that.sharedData.userEventTrack('Dashboard', "Approved",'Approved', 'View Grid Click');
  }

  approvedStrategiesClick(d: any) {
    var that = this;
    setTimeout(() => {
      that.dirIndexService.customizeSelectedIndex_Direct.next(d);
      that.dirIndexService.directIndexBrcmData.next([d]);
      that.router.navigate(["/approvedStrategies"]);
    }, 10)
    that.sharedData.userEventTrack('Dashboard', "Approved", d['name'], 'View Grid Click');
  }

  prebuildIndList: any = [];
  getPrebuildIndList() {
    var that = this;
    that.preBuiltService.getNaaIndexLvlData({ 'group': "" }).then((res: any) => {
      if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['menuData'])) { this.prebuildIndList = res['menuData']; }
    });
  }
  prebuildIndClickMain() {
    var that = this;
    //that.sharedData.showMatLoader.next(true);
    //that.sharedData.userEventTrack('Dashboard', "prebuilt", 'prebuilt', 'View Grid Click');
    //setTimeout(() => {
    //  that.router.navigate(["/prebuilt"]);
    //}, 10)
    that.sharedData.showMatLoader.next(true); // Show the loader

    // Track the user event
    that.sharedData.userEventTrack('Dashboard', 'prebuilt', 'prebuilt', 'View Grid Click');

    // Navigate to the route and hide the loader when navigation is complete
    that.router.navigate(['/prebuilt']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
    });
  }
  prebuildIndClick(d: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
    //  that.preBuiltService.customizeSelectedIndex_prebuilt.next(d);
    //  that.preBuiltService.prebuiltIndexBrcmData.next([d]);
    //  that.router.navigate(["/prebuilt"]);
    //}, 10)

    that.preBuiltService.customizeSelectedIndex_prebuilt.next(d);
    that.preBuiltService.prebuiltIndexBrcmData.next([d]);

    that.sharedData.userEventTrack('Dashboard', "prebuilt", d['name'], 'View Grid Click');

    this.router.navigate(['/prebuilt']).then(() => {
      this.sharedData.showMatLoader.next(false); // Hide loader after navigation completes
    }).catch((error) => {
      console.error('Navigation Error:', error);
      this.sharedData.showMatLoader.next(false); // Hide loader in case of navigation error
    });
  }


  thematicIndexList: any = [];
  thematicIndexClick(d: any) {
    var that = this;
    /*that.router.navigate(["/thematicStrategies"]);*/
    that.theBuiltService.thematicIndexClick(d);
   /* setTimeout(() => { that.sharedData.showCircleLoader.next(false); }, 1000);*/
    that.sharedData.userEventTrack('Dashboard', "Thematic", d['indexname'], 'View Grid Click');
    that.router.navigate(['/thematicStrategies']).then(() => {
      that.sharedData.showMatLoader.next(false); // Hide the loader after navigation is complete
      that.sharedData.showCircleLoader.next(false);
    }).catch((error) => {
      console.error('Navigation Error:', error);
      that.sharedData.showMatLoader.next(false); // Hide the loader in case of an error
      that.sharedData.showCircleLoader.next(false);
    });
  }

  closeUniverse() {
    this.sharedData.openUniverseMenu.next(false);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.sharedData.openUniverseMenu.next(false);
  }

  createGridOptionCheckbox(jsonData: any) {
    var that = this;
    jsonData.forEach((item: any) => {
      switch (item.menus) {
        case 'Equity Universe':
          var perCheck: any = this.sharedData.checkShowLeftTab(2027);
          if (perCheck == 'N' || perCheck == 'H') {
            this.gridOptionsCheckbox.equity = false;
          } else {
            this.gridOptionsCheckbox.equity = item.menuDisplay === 'Y';
          }
          break;
        case 'ETF Universe':
          var perCheck1: any = this.sharedData.checkShowLeftTab(2028);
          if (perCheck1 == 'N' || perCheck1 == 'H') {
            this.gridOptionsCheckbox.etf = false;
          } else {
            this.gridOptionsCheckbox.etf = item.menuDisplay === 'Y';
          }
          break;
        case 'Direct Indexing':
          var perCheck: any = this.sharedData.checkShowLeftTab(12);
          if (perCheck == 'N' || perCheck == 'H') {
            this.gridOptionsCheckbox.direct = false;
          } else {
            this.gridOptionsCheckbox.direct = item.menuDisplay === 'Y';
          }
          break;
        case 'Prebuilt Strategies':
          var perCheck: any = this.sharedData.checkShowLeftTab(4);
          if (perCheck == 'N' || perCheck == 'H') {
            this.gridOptionsCheckbox.prebuilt = false;
          } else {
            this.gridOptionsCheckbox.prebuilt = item.menuDisplay === 'Y';
          }
          break;
        case 'Thematic Strategies':
          var perCheck: any = this.sharedData.checkShowLeftTab(25);
          if (perCheck == 'N' || perCheck == 'H') {
            this.gridOptionsCheckbox.thematic = false;
          } else {
            this.gridOptionsCheckbox.thematic = item.menuDisplay === 'Y';
          }
          break;
        case 'Upload Portfolios':
          this.gridOptionsCheckbox.portfolio = item.menuDisplay === 'Y';
          break;
        case 'My Strategies':
          var perCheck: any = this.sharedData.checkShowLeftTab(6);
          if (perCheck == 'N' || perCheck == 'H') {
            this.gridOptionsCheckbox.strategies = false;
          } else {
            this.gridOptionsCheckbox.strategies = item.menuDisplay === 'Y';
          }
          break;
        default:
          break;
      }
    });
    this.showMatLoader_checkBox = false;
    var stackData:any = [];
    if (that.sharedData._getSwapTileData.length > 0) {
      stackData = [...that.sharedData._getSwapTileData];
    } else { stackData = [...that.reset_items]; }
    var showHideData = that.gridsterReset;
    let mappedGridsterReset = showHideData.map((item: any) => {
      if (this.gridOptionsCheckbox.hasOwnProperty(item.name)) {
        item.show = this.gridOptionsCheckbox[item.name];
      }
      return item;
    });

    var filteredArray = stackData.filter((item2: any) =>
      showHideData.some((item1: any) => item1.name === item2.id && item1.show)
    );
  
    if (filteredArray.length == 6) {
      //filteredArray.forEach((item:any) => {
      //    item.minH = 2;
      //});
      that.gridOptions.cellHeight = '7.2vh'
    }
    else if (filteredArray.length == 5) {
      //filteredArray.forEach((item: any) => {
      //  item.minH = 2;
      //});
      that.gridOptions.cellHeight = '8.5vh'
    }
    else if (filteredArray.length == 4) {
      //const hasThematic = filteredArray.some((item: any) => item.id === "thematic");
      //const hasStrategies = filteredArray.some((item: any) => item.id === "strategies");
      //const hasPrebuilt = filteredArray.some((item: any) => item.id === "prebuilt");
      //if (hasThematic && hasStrategies) {
      //  filteredArray.forEach((item: any) => {
      //    if (item.id === "thematic" || item.id === "strategies") {
      //      item.minH = 4;
      //    }
      //  });
      //    } else if (hasPrebuilt && hasStrategies) {
      //  filteredArray.forEach((item: any) => {
      //    if (item.id === "prebuilt" || item.id === "strategies") {
      //      item.minH = 4;
      //    }
      //  });
      //    }
      //    else if (hasPrebuilt && hasThematic) {
      //  filteredArray.forEach((item: any) => {
      //    if (item.id === "prebuilt" || item.id === "thematic") {
      //      item.minH = 4;
      //    }
      //  });
      //    }
      //else {
      //  filteredArray.forEach((item1: any) => {
      //    if (item1.id === "prebuilt" && !hasThematic) {
      //      item1.minH = 6;
      //    }
      //    else if (item1.id === "thematic" && !hasPrebuilt) {
      //      item1.minH = 6;
      //    }
      //    else if (item1.id === "strategies" && !hasPrebuilt && !hasThematic) {
      //      item1.minH = 6;
      //    }
      //  })

      //    }
      //filteredArray.forEach((item: any) => {
      //  item.minH = 2;
      //});
      that.gridOptions.cellHeight = '10.8vh'
    }
    else if (filteredArray.length == 3) {
      //const hasThematic = filteredArray.some((item: any) => item.id === "thematic");
      //const hasStrategies = filteredArray.some((item: any) => item.id === "strategies");
      //const hasPrebuilt = filteredArray.some((item: any) => item.id === "prebuilt");
      //filteredArray.forEach((item: any) => {
      //  if (item.id === "strategies" && !hasThematic && !hasPrebuilt) {
      //    item.minH = 6;
      //    that.gridOptions.cellHeight = '8.5vh'
      //  } else {
      //    item.minH = 2;
      //    that.gridOptions.cellHeight = '14.2vh'
      //  }
      //});
      that.gridOptions.cellHeight = '14.2vh'
    }
    else if (filteredArray.length <= 2) {
      //filteredArray.forEach((item: any) => {
      //  if (item.id === "thematic") {
      //    item.minH = 4;
      //  } else if (item.id === "strategies") {
      //    item.minH = 6;
      //  }
      //});
      that.gridOptions.cellHeight = '16vh'
    }
    //console.log('filteredArray', filteredArray)
    if (filteredArray.length > 0) {
      //that.items = [];
      that.resetCards = false;
      that.items = filteredArray;
    } else {
      that.items = [];
      //that.reset_items_session = [];
    }
  }
 
  //getCardSwapSettings() {
  //  var that = this;
  //  var swapList = that.dataService.getpostCardSettings().pipe(first()).subscribe((res: any) => {
  //    //console.log('swapsettings', res);
  //    if (res.length > 0) {
  //      that.reset_items_session = res;
  //    } else { that.reset_items_session = []; }
  //  },
  //    (error: any) => {
  //     // this.logger.logError(error, 'GetStgyListDashboard');
  //      that.reset_items_session = [];
  //    });
  //  this.subscriptions.add(swapList);
  //}
  postCardSwapSettings(dat: any) {
    //this.pre_mode = !this.pre_mode;
    let that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var postData = dat;
    const postSwap = that.dataService.postCardSettings(postData).pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        //that.toastr.info('Layout preferences have been updated.', '', { timeOut: 4000, positionClass: "toast-top-center" });
        //console.log('postCardSwapSettings success')
      }
    }, error => { });
  }
  ngOnInit() {
    //this.getCardSwapSettings();
    //Upcoming rebalance accounts popup
    ////var showRebalanceTrigger = this.sharedData.showRebalanceTrigger.subscribe(res => {
    ////  if (res) {
    ////    //if (this.sharedData._getRebalancesPopupData.length > 0) {
    ////    //  setTimeout(() => { this.openRebalanceAlert(); }, 2500);
    ////    //}
    ////    this.sharedData.showRebalanceTrigger.next(false);
    ////  }
    ////}, error => { this.sharedData.showRebalanceTrigger.next(false); });
    ////this.subscriptions.add(showRebalanceTrigger);

    var GetToolIcons = this.sharedData.openUniverseMenu.subscribe(res => {
      this.showUniverseMenu = res;
      //this.resizeOptions();
      //if (this.showUniverseMenu == true) {
      //  // setTimeout(() => { this.loadGridStack(); },300)
      //}
    }, error => { });

    var rouletCircleHome = this.sharedData.rouletCircleHomeClick.subscribe(res => {
      if (res) {
        this.showRouletDash = true;
      } else { this.showRouletDash = false; }
    }, error => { });
    this.subscriptions.add(GetToolIcons);
    this.subscriptions.add(rouletCircleHome);
    var equityIndexeMasData = this.cusIndexService.equityIndexeMasData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) {

        this.getEquitList()
      }
    });
    this.subscriptions.add(equityIndexeMasData);

    var ETFIndex = this.sharedData.ETFIndex.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.getEtfList() }
    });
    this.subscriptions.add(ETFIndex);

    var naaIndexOrderList = this.preBuiltService.naaIndexOrderList.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.getPrebuildIndList() }
    });
    this.subscriptions.add(naaIndexOrderList);

    var getBetaIndex_Direct = this.dirIndexService.getBetaIndex_Direct.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.getDirIndList() }
    });
    this.subscriptions.add(getBetaIndex_Direct);

    var thematicIndexList = this.theBuiltService.thematicIndexList.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.thematicIndexList = [...res]; }
    });
    this.subscriptions.add(thematicIndexList);

    var UserTabsRolePermissionData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.UserTabsRolePermissionData = [...res];
      } else { this.UserTabsRolePermissionData = []; }
    });
    this.subscriptions.add(UserTabsRolePermissionData);

    var GetuserItems = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      //console.log(res);
      if (this.getPinnedMenuItems.length > 0) {
        this.createGridOptionCheckbox(this.getPinnedMenuItems)
      }
    }, error => { });

    var GetPinnedItems = this.sharedData.getPinnedMenuItems.subscribe(res => {
      //console.log(res);
      this.getPinnedMenuItems = res;
      if (res.length > 0) {
        this.createGridOptionCheckbox(res);
        if (this.UPermissionData) {
          this.saveMultiplePinneditems(this.getPinnedMenuItems);
          this.UPermissionData = false;
        }
        
      }
    }, error => { });
    //var stgyListDashAccsData = this.cusIndexService.stgyListDashAccsData.subscribe(res => {
    //  if (res.length == 0) { this.allstat = []; this.emptyFilterText = false }
    //  if (isNotNullOrUndefined(res) && res.length > 0) {
    //    var filterData: any[] = [];
    //    res.forEach((x: any) => {
    //      x['activeTrade'] = (isNotNullOrUndefined(x['enableTrading']) && x['enableTrading'] == 'Y') ? true : false;
    //      if (x.tradeStatus != "Y") { filterData.push(x) };
    //    });
    //    this.loadDashData(filterData);
    //  }
    //});
    this.subscriptions.add(GetuserItems);
    this.subscriptions.add(GetPinnedItems);
    this.gettradingList();
    this.GetRecentFrequentIndexes();
  }
  loadDashData(res: any) {
    var that = this;
    let DI_arr_trading: any = [];
    let beta_arr_trading: any = [];
    var fil_b = that.getUniArr(res);
    var CIfill = res.filter((x: any) => { return (x.type == "C" && x.tradeStatus != "Y") });
    fil_b.forEach(function (value) {
      var b = CIfill.filter((x: any) => { return (x.assetId == value.assetId) });
      var a: any = {};
      if (b.length > 0) {
        try {
          a['str_group'] = that.accGroup(b, value);
          a['showname'] = b[0].Indexname;
          a['showticker'] = b[0].Ticker;
          a['m_date'] = b[0].createddate;
          a['t_date'] = b[0].modifieddate;
          a['indextype'] = 'ETF';
          if (a['str_group'].length == 0) { } else { beta_arr_trading.push(a); }
        } catch (e) { }
      }
    });
    var DIfill = res.filter((x: any) => { return (x.type == "D") });
    fil_b.forEach(function (value) {
      var b = DIfill.filter((x: any) => { return (x.assetId == value.assetId) });
      var a: any = {};
      if (b.length > 0) {
        var body1: any = that.accGroup1(b, value)
        var body = body1.filter((xu: any) => xu.accountId > 0);

        a['str_group'] = body;
        a['str_groupH'] = body1.filter((xu: any) => xu.accountId == 0);
        a['showname'] = b[0].Indexname;
        a['basedon'] = b[0].basedon;
        a['name'] = b[0].name;
        a['createddate'] = b[0].createddate;
        a['modifieddate'] = b[0].modifieddate;
        a['showticker'] = b[0].Ticker;
        a['indextype'] = 'ETF';
        if (body.length > 0) { DI_arr_trading.push(a); }
      }
    });
    that.DIEnabletradinglist = DI_arr_trading;
  }

  recentData: any = [];
  GetRecentFrequentIndexes() {
    var that = this;
    let recent: any = [];
    let frequent: any = [];
    that.recentData = [];
    var getED = this.dataService.GetRecentFrequentIndexes().pipe(first()).subscribe((stockIndex: any) => {
      stockIndex.forEach(function (value: any) { if (value.Type == 'R') { recent.push(value); } else { frequent.push(value); }; });
      that.recentData = recent.sort(function (x: any, y: any) { return d3.ascending(x.orderno, y.orderno); });
    }, (error: any) => { });
    this.subscriptions.add(getED);
  }

  viewFactSheet(d: any) {
    var that = this;
    var data: any = this.cusIndexService.stgyListDashAccsData.value;
    var cI: any = data.filter((x: any) => x.rowno == d.rowno && x.assetId == d.assetid && x.type == 'C');
    if (cI.length > 0) {
      that.cusIndexService.customizeSelectedIndex_custom.next(cI[0]);
      that.cusIndexService.currentSNo.next(cI[0]['rowno']);
      that.router.navigate(["customIndexing"]);
    }
  }


  getUniArr(arr: any) {
    var opt: any[] = [];
    var indexArr: any[] = [];
    arr.map((item: any) => {
      let key = indexArr.indexOf(item.assetId);
      if (key == -1) {
        indexArr.push(item.assetId);
        opt.push(item);
      } else if (opt[key].seq < item.seq) { opt[key] = item; }
    })
    return opt;
  }
  checkStrNameDirect(item1: any) {
    var name = item1.name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 20) { name = name.slice(0, 20) + "..."; }
      return name;
    } else { return "Index" + (item1.rowno + 1); }
  }
  accGroup(dt: any, d: any) {
    var data = dt.sort(function (x: any, y: any) { return d3.ascending(x.rowno, y.rowno); });
    var gData = this.groupBy(data, 'id');
    var fData = [];
    for (const [key, value] of Object.entries(gData)) {
      var val: any = value;
      var accH = val.filter((aG: any) => aG['accountId'] == 0);
      var accB = val.filter((aG: any) => aG['accountId'] > 0);
      var CIfill = this.cusIndexService._stgyListDashAccsData.filter((x: any) => { return (accH[0]['id'] == x['id'] && x.type == "C" && x.tradeStatus == "Y") });
      if (accB.length == 0 && CIfill.length > 0) { } else { fData.push({ accH: accH, accB: accB }); }
    };
    return fData;
  }
  accGroup1(dt: any, d: any) {
    var data = dt.sort(function (x: any, y: any) { return d3.ascending(x.rowno, y.rowno); });
    var gData = this.groupBy(data, 'id');
    var fData = [];
    for (const [key, value] of Object.entries(gData)) { fData.push(value); };
    return fData[0];
  }
  groupBy(array: any, key: any) {
    return array.reduce((result: any, currentValue: any) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  };
  gettradingList() {
    var that = this;
    var alphaList = this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe((res: any) => {
      this.cusIndexService.stgyListDashAccsData.next(res);
      //that.sharedData.showCircleLoader.next(false);
    },
      (error: any) => {
        // this.logger.logError(error, 'GetStgyListDashboard');
        // that.sharedData.showCircleLoader.next(false);
      });
    this.subscriptions.add(alphaList);
  }
  viewDIstr(item: any, d: any) {
    var that = this;
    this.sharedData.showMatLoader.next(true);
    setTimeout(function () {
      if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d['str_groupH']) &&
        d['str_groupH'].length > 0) {
        var fObj = that.dirIndexService._getBetaIndex_Direct.filter((du: any) => du.assetId == d['str_groupH'][0]['assetId']);
        var Obj = Object.assign({}, fObj[0]);
        //that.sharedData.selAccountFactsheet.next(d['str_groupH'][0]['accountId']);
        that.moveDIView(Obj)
      }
      else {
        that.sharedData.showMatLoader.next(false);
        that.toastr.info('Something went wrong. Please try again', '', { timeOut: 5000 });
      }
    }.bind(this), 10)
  }
  openPageLoad() {
    var that = this;
    that.sharedData.showCircleLoader.next(true);
  }
  moveDIView(item: any) {
    var that = this;
    this.sharedData.openNotification.next(false);
    that.sharedData.showCircleLoader.next(true);
    that.dirIndexService.startIndexClick_direct.pipe(first())
      .subscribe((res: boolean) => { if (res) { that.dirIndexService.startIndexClick_direct.next(false); } });
    that.dirIndexService.showReviewIndexLoaded.pipe(first())
      .subscribe((res: boolean) => { if (res) { that.dirIndexService.showReviewIndexLoaded.next(false); } });
    if (that.dirIndexService.directIndexBrcmData.value.length > 0) { that.dirIndexService.directIndexBrcmData.next([]); }
    that.dirIndexService.notifyDiClick.next(true);
    that.router.navigate(["/directIndexing"]);
    that.sharedData.userEventTrack('My Strategies', "Direct Indexing", item.name, 'View indexClick');
    //setTimeout(() => { }, 1000);
  }

  savePinnedStrategy(e: any, name: string) {
    //this.pre_mode = !this.pre_mode;
    let that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    that.gridOptionsCheckbox[name] = e.checked;
    that.showMatLoader_checkBox = true;
    //this.gridReset();
    if (e.checked == true) {
      var updatedGridsterReset = [...this.gridsterReset].filter(item => item.name === name);
      var filterpId = [...this.getPinnedMenuItems].filter(item => item.menus === updatedGridsterReset[0].pidName);
      if (filterpId.length > 0) {
        var postData = {
          "userid": userid,
          "pId": filterpId[0].pid,
          "menuDisplay": "Y",
          "pMenu": "",
        }
        this.cusIndexService.pinnedPostMethodDashboardSwitch(postData);
        //this.gridOptions.cellHeight = '10vh';
        // console.log(updatedGridsterReset);
      }
      this.sharedData.userEventTrack('Dashboard', name, 'ON', 'View Pin Grid Click');
    }
    else {
      var updatedGridsterReset = [...this.gridsterReset].filter(item => item.name === name);
      var filterpId = [...this.getPinnedMenuItems].filter(item => item.menus === updatedGridsterReset[0].pidName);
      if (filterpId.length > 0) {
        var postData = {
          "userid": userid,
          "pId": filterpId[0].pid,
          "menuDisplay": "N",
          "pMenu": "",
        }
        this.cusIndexService.pinnedPostMethodDashboardSwitch(postData);
        //this.gridOptions.cellHeight = '10vh';
        // console.log(updatedGridsterReset);
      }
      //this.gridsterReset = updatedGridsterReset;
      this.sharedData.userEventTrack('Dashboard', name, 'OFF', 'View Pin Grid Click');
    }
  }
  getpId_users(TileName:string) {
    var pinnedItem = this.getPinnedMenuItems;
    if (pinnedItem.length > 0) {
      var filterId = pinnedItem.filter((x: any) => x.menus == TileName);
      if (filterId.length > 0) { return filterId[0].pid }
      else {return null }
    }
  }
  saveMultiplePinneditems(pinnedList:any) {
    let that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var postData = [
      { "userid": userid, "pId": that.getpId_users('Equity Universe'), "menuDisplay": that.checkShowLeftTab(2027, that.getpId_users('Equity Universe')), "pMenu": "" },
      { "userid": userid, "pId": that.getpId_users('ETF Universe'), "menuDisplay": that.checkShowLeftTab(2028, that.getpId_users('ETF Universe')), "pMenu": "" },
      { "userid": userid, "pId": that.getpId_users('Direct Indexing'), "menuDisplay": that.checkShowLeftTab(12, that.getpId_users('Direct Indexing')), "pMenu": "" },
      { "userid": userid, "pId": that.getpId_users('Prebuilt Strategies'), "menuDisplay": that.checkShowLeftTab(4, that.getpId_users('Prebuilt Strategies')), "pMenu": "" },
      { "userid": userid, "pId": that.getpId_users('Thematic Strategies'), "menuDisplay": that.checkShowLeftTab(25, that.getpId_users('Thematic Strategies')), "pMenu": "" },
      { "userid": userid, "pId": that.getpId_users('My Strategies'), "menuDisplay": that.checkShowLeftTab(6, that.getpId_users('My Strategies')), "pMenu": "" }
    ];
    const bList = that.dataService.PostPinnedMultipleItems(postData).pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        that.dataService.getPinnedMenuItems().subscribe((data: any) => {
          //that.toastr.info('Layout preferences have been updated.', '', { timeOut: 4000, positionClass: "toast-top-center" });
          that.sharedData.getPinnedMenuItems.next(data);
        }, (err: any) => {
          that.sharedData.getPinnedMenuItems.next([]);
        });
      }
    }, error => { that.sharedData.getPinnedMenuItems.next([]); });
  }
  checkShowLeftTab(CatId: any, pId: any) {
    var filterPinned = this.getPinnedMenuItems.filter((x: any) => x.pid == pId);
    var tabData = this.UserTabsRolePermissionData;
    if (tabData.length > 0) {
      var d = tabData.filter((x: any) => x.CatId == CatId);
      if (d.length > 0) {
        if (d[0].Status == 'A') {
          if (filterPinned.length > 0 && filterPinned[0].menuDisplay == 'Y') {
            return 'Y'
          } else { return 'N' }
        }
        else { return 'N' }
      } else { return 'N'; }
    } else { return 'N'; }
  }
}
interface Datum {
  cx: number;
  isin: string;
  indexName: string;
}
