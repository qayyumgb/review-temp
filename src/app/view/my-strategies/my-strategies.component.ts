import { Component, OnInit, ViewChild, viewChild ,ElementRef,OnChanges} from '@angular/core';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../core/services/sharedData/shared-data.service';

import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, map, concat, defer, combineLatest, Subscription, first } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

//import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { DataService } from '../../core/services/data/data.service';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import * as d3 from 'd3';
import { Router } from '@angular/router';
import { rebalanceStrategiesComponent } from '../rebalanceStrategies/rebalanceStrategies';
import { TradeOpenComponent } from '../trade-open/trade-open.component';
import { DialogControllerService } from '../../core/services/dialogContoller/dialog-controller.service';

declare var $: any;
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  isExpanded?: boolean;
}
interface Element {
  name: string;
  weight: number;
  position: number;
  symbol: string;
  elements?: Element[];
}

@Component({
  selector: 'app-my-strategies',
  templateUrl: './my-strategies.component.html',
  styleUrl: './my-strategies.component.scss',
  animations: [
    trigger('detailExpand', [
      state(
        'void',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('detailExpandT', [
      state(
        'void',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MyStrategiesComponent implements OnInit, OnChanges {
  pageSize: number = 25;
  @ViewChild('tpl') nameInputRef: ElementRef | any;
  subscriptions = new Subscription();
  DIEnabletradinglist: any[] = [];
  allstat: any = [];
  emptyFilterText = false;
  dataSource2: MatTableDataSource<any> | any;
  dataSource: MatTableDataSource<any> | any;
  dataSource3: MatTableDataSource<any> | any;
  ELEMENT_DATA: PeriodicElement[] = [];
  strategies_grouping: any[] = [];
  showLoadTabs: boolean = true;
  groupData: any = [];
  clickTab: string = 'saved';
  norec: boolean = false;
  // Checkbox filter
  isSavedFilCheck: boolean = true;
  isTradeFilCheck: boolean = true;
  isTradedCheck: boolean = true;
  // Checkbox filter
  isExpand: boolean = false;
  expandedElement: any | null;
  expandAll: boolean = false;
  groupBy(array: any[], key: string) {
    return array.reduce((result, currentItem) => {
      (result[currentItem[key]] = result[currentItem[key]] || []).push(
        currentItem
      );
      return result;
    }, {});
  }
  displayedColumns: string[] = [
    'Action',
    'strategyName',
    'basedOn',
    'm_date',
    't_date',
    'Status',
    'ViewFactsheet',
  ];
  displayedColumnsTraded: string[] = [
    'Action',
    'strategyName',
    'basedOn',
    'm_date',
    't_date',
    'Nextrebalance',
    'ViewFactsheet',
  ];
  @ViewChild('Custompaginator') Custompaginator: MatPaginator | any;
  @ViewChild('directPaginator') directPaginator: MatPaginator | any;
  @ViewChild('tradedPaginator') tradedPaginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;
  sortedData: any;
  isExpansionDetailRow = (index: any, row: any) =>
    row.hasOwnProperty('detailRow');

  /* Disable accordion click event */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
  /* Disable accordion click event */
  sortNestedData(sort: MatSort, data: Element[]): Element[] {
    const active = sort.active;
    const direction = sort.direction;

    if (!active || direction === '') {
      return data;
    }

    return data.sort((a: any, b: any) => {
      const valueA = a[active];
      const valueB = b[active];
      const compareResult =
        (valueA < valueB ? -1 : 1) * (direction === 'asc' ? 1 : -1);

      return compareResult;
    });
  }
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  constructor(
    public sharedData: SharedDataService,
    private router: Router,
    private dialogController: DialogControllerService,
    public cusIndexService: CustomIndexService,
    private dataService: DataService,
    public dirIndexService: DirectIndexService,
    private toastr: ToastrService
  ) {
    setTimeout(() => {
      this.sharedData.showCircleLoader.next(false);
      this.sharedData.showMatLoader.next(false);
    }, 1000);
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  treeData: any[] = [];
  ngOnInit() {
    var that = this;
    this.sharedData.openUniverseMenu.next(false);
    setTimeout(() => {
      that.dataSource.paginator = this.Custompaginator;
    }, 300);
    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe(x => {
      if (x) {
        setTimeout(function () {
          that.sharedData.showMatLoader.next(false);
          that.cusIndexService.GetStrListDashAccs();
        }.bind(this), 1000);
      };
    });
    this.subscriptions.add(refreshAlreadytradedStrategy);
    // this.dataSource.sort = this.sort;
    if (this.sharedData.checkShowLeftTab(12) == 'A') { this.dirIndexService.getAlphaIndex(); }
    var stgyListDashAccsData = this.cusIndexService.stgyListDashAccsData.subscribe((res) => {
        if (res.length == 0) {
          this.allstat = [];
          this.emptyFilterText = false;
       
        }
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData: any[] = [];
          res.forEach((x: any) => {
            x['activeTrade'] =
              isNotNullOrUndefined(x['enableTrading']) &&
              x['enableTrading'] == 'Y'
                ? true
                : false;
            if (x.tradeStatus != 'Y') {
              filterData.push(x);
            }
          });
          this.getRebalances();
          setTimeout(() => {
            that.loadDashData(filterData);
            // that.showLoadTabs = false;
          }, 500);
          setTimeout(() => {
            that.showLoadTabs = false;
          }, 1000);
        } else if (isNotNullOrUndefined(res) && res.length == 0) {
          setTimeout(() => {
            this.sharedData.showCircleLoader.next(false);
            that.sharedData.showMatLoader.next(false);
            // that.showLoadTabs = false;
          }, 1000);
          if(that.strategies_grouping_dp.length == 0 || that.strategies_grouping_dp.length > 0){
            that.showLoadTabs = false;
          }
        }
      });
    this.subscriptions.add(stgyListDashAccsData);
    this.gettradingList();
    // var openTab = that.sharedData.openTradedStrategiesTab.subscribe(res => {
    //   if(res){
    //     this.getTradedStrategies();
    //     this.sharedData.openTradedStrategiesTab.next(false);
    //   }
    //});
    //this.subscriptions.add(openTab);
    var UserTabsRolePermissionData =
      that.sharedData.UserTabsRolePermissionData.subscribe((res) => {
        if (this.sharedData.checkShowLeftTab(3) == 'A') {
          this.clickTab = 'saved';
        } else if (this.sharedData.checkShowLeftTab(12) == 'A') {
          this.clickTab = 'direct';
        } else if (this.sharedData.checkShowLeftTab(13) == 'A') {
          this.clickTab = 'traded';
        }
      });
    this.subscriptions.add(UserTabsRolePermissionData);
    // setTimeout(() => {
    //   that.showLoadTabs = false;
    // }, 2000);

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          this.sharedData.checkRoutePer(6);
        }
      }
    );
    that.subscriptions.add(unSubUTRPData);
    setTimeout(() => {
      if(that.strategies_grouping_dp.length == 0 || that.strategies_grouping_dp.length > 0){
        that.showLoadTabs=true
      }
    }, 200);
  }
  onSavedFilChange(event: any) {
    var that = this;
    if (!event.checked) {
      that.isSavedFilCheck = false;
      // console.log('false')
      if (that.DIEnabletradinglist.length == 0) {
        this.norec = false;
      }
    } else {
      that.isSavedFilCheck = true;
      // console.log('true')
      this.clearInput();
    }

    this.checkBoxFilter();
  }
  onTradeFilChange(event: any) {
    var that = this;
    if (!event.checked) {
      that.isTradeFilCheck = false;
      this.clearInput();
    } else {
      that.isTradeFilCheck = true;
    }
    this.checkBoxFilter();
  }
  onTradedChange(event: any) {
    var that = this;
    if (!event.checked) {
      that.isTradedCheck = false;
    } else {
      that.isTradedCheck = true;
    }
    this.checkBoxFilter();
  }

  checkBoxFilter() {
    var that = this;
    this.emptyFilterText = true;
    that.showLoadTabs = false;
    if (that.isSavedFilCheck && that.isTradeFilCheck) {
      // console.log('isTradeFilCheck 1')
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          this.loadDashData(res);
        }
      });
    } else if (!that.isSavedFilCheck && !that.isTradeFilCheck) {
      this.showLoadTabs = false;
      this.strategies_grouping = [];
      this.DIEnabletradinglist = [];
      // console.log('isTradeFilCheck 2',this.strategies_grouping)
    } else if (that.isSavedFilCheck && !that.isTradeFilCheck) {
      this.showLoadTabs = false;
      // console.log('isTradeFilCheck 3')
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData = res.filter((x: any) => {
            if (x.enableTrading != 'Y' && x.tradeStatus != 'Y') {
              return x;
            }
          });

          this.loadDashData(filterData);
        }
      });
    } else if (that.isSavedFilCheck && that.isTradeFilCheck) {
      this.showLoadTabs = false;
      // console.log('isTradeFilCheck 4')
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData = res.filter((x: any) => {
            if (x.tradeStatus === 'N') {
              return x;
            }
          });
          this.loadDashData(filterData);
        }
      });
    } else if (!that.isSavedFilCheck && that.isTradeFilCheck) {
      this.showLoadTabs = false;
      // console.log('isTradeFilCheck 5');
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData = res.filter((x: any) => {
            if (x.enableTrading === 'Y') {
              return x;
            }
          });
          this.clearInput();
          this.loadDashData(filterData);
        }
      });
    } else if (!that.isSavedFilCheck && !that.isTradeFilCheck) {
      this.showLoadTabs = false;
      // console.log('isTradeFilCheck 6');
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData = res.filter((x: any) => {
            if (x.tradeStatus === 'Y') {
              return x;
            }
          });
          this.loadDashData(filterData);
        }
      });
    } else if (that.isSavedFilCheck && !that.isTradeFilCheck) {
      this.showLoadTabs = false;
      // console.log('isTradeFilCheck 7');
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData = res.filter((x: any) => {
            if (x.enableTrading === 'N' || x.tradeStatus === 'Y') {
              return x;
            }
          });
          this.loadDashData(filterData);
        }
      });
    }
  }
  dataRefresh() {
    var that = this;
    this.showLoadTabs = true;
    setTimeout(() => {
      $('.strategies-expand-custom.expanded').trigger('click');
      $('.strategies-expand.expanded').trigger('click');
      $('.TRstrategies-expand-custom.expanded').trigger('click');
      that.isExpand = false
      that.showLoadTabs = false;
      that.sharedData.userEventTrack(
        'My Strategies',
        that.clickTab,
        that.clickTab,
        'Tab Click'
      );
    }, 500);
    this.searchText = '';
    this.norec = false;
  }
  clearInput() {
    this.searchText = '';
    this.filterItems();
    this.norec = false;
  }
  clearInputTS() {
    var that = this;
    this.searchText = '';
    this.showLoadTabs = true;
    setTimeout(() => {
      that.showLoadTabs = false;
    }, 500);
    this.getTradedStrategies();
    this.norec = false;
  }
  clearInputDI() {
    var that = this;
    this.searchText = '';
    this.directIndexfilter();
    this.showLoadTabs = true;
    setTimeout(() => {
      that.showLoadTabs = false;
    }, 500);
    // this.getDirectIndex();
    this.norec = false;
  }
  checkMyFactsheetView(d: any) {
    if (isNotNullOrUndefined(d['type']) && d['type'] == 'D') {
      return true;
    } else {
      return false;
    }
  }
  cloneStrategy(clStgy: any) {}
  checkUser(d: any) {
    let userid = atob(
      atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
    );
    if (
      isNotNullOrUndefined(d['accParent'][0]['userid']) &&
      parseInt(userid) == parseInt(d['accParent'][0]['userid'])
    ) {
      return true;
    } else {
      return false;
    }
  }

  getDirectIndex() {
    var stgyListDashAccsData =
      this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
        if (res.length == 0) {
          this.allstat = [];
          this.emptyFilterText = false;
        }
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var filterData: any[] = [];
          res.forEach((x: any) => {
            x['activeTrade'] =
              isNotNullOrUndefined(x['enableTrading']) &&
              x['enableTrading'] == 'Y'
                ? true
                : false;
            if (x.tradeStatus != 'Y') {
              filterData.push(x);
            }
          });
          // console.log('apr')
          // setTimeout(()=>{
          //   this.loadDashData(filterData);
          // },500)
        }
      });
    this.subscriptions.add(stgyListDashAccsData);
  }
  gettradingList() {
    var that = this;
    var alphaList = this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe(
      (res: any) => {
        this.cusIndexService.stgyListDashAccsData.next(res);
        that.sharedData.showCircleLoader.next(false);
      },
      (error: any) => {
        // this.logger.logError(error, 'GetStgyListDashboard');
        that.sharedData.showCircleLoader.next(false);
      }
    );
    this.subscriptions.add(alphaList);
  }
  tradedData: any = [];

  getTradedStrategies() {
    var that = this;
    this.cusIndexService.stgyListDashAccsData.pipe(first()).subscribe((res) => {
      if (
        isNotNullOrUndefined(res) &&
        res.length > 0 &&
        this.sharedData.checkShowLeftTab(13) == 'A'
      ) {
        var filterData = res.filter((x: any) => {
          return x.type == 'C' && x.tradeStatus == 'Y';
        });
        let beta_arr_trading: any = [];
        var fil_b = that.getUniArr(filterData);
        var CIfill = res.filter((x: any) => {
          return x.type == 'C' && x.tradeStatus == 'Y';
        });
        //console.log(res, 'CIfill--', CIfill );
        if (fil_b.length > 0 && this.sharedData.checkShowLeftTab(3) == 'A') {
          fil_b.forEach(function (value) {
            var b = CIfill.filter((x: any) => {
              return x.assetId == value.assetId;
            });
            var a: any = {};
            if (b.length > 0) {
              a['str_group'] = that.accGroup2(b);
              a['showname'] = b[0].Indexname;
              a['showticker'] = b[0].Ticker;
              a['indextype'] = 'ETF';
              //console.log('a',a)
              beta_arr_trading.push(a);
            }
          });
        }

        var filDiData = res.filter((x: any) => {
          return x.type == 'D' && x.tradeStatus == 'Y';
        });

        if (
          filDiData.length > 0 &&
          this.sharedData.checkShowLeftTab(12) == 'A'
        ) {
          var a: any = {};
          a['str_group'] = that.accGroup2(filDiData);
          if (this.sharedData.checkMyUserType()) {
            a['showname'] = 'Approved Strategies';
          } else {
            a['showname'] = 'Direct Index';
          }
          a['showticker'] = null;
          a['indextype'] = 'ETF';
          // console.log('a 2',a)
          beta_arr_trading.push(a);
        }
        that.tradedData = beta_arr_trading;
        //console.log(this.tradedData.length,'tradedData')
        that.dataSource3 = new MatTableDataSource<any>(that.tradedData);
        //console.log(that.dataSource3);
        setTimeout(() => {
          if (that.tradedData.length > 100) {
            this.tradedPaginator.pageSize = 100;
          } else {
            //this.tradedPaginator.pageSize = this.tradedData.length;
          }
          this.dataSource3.paginator = this.tradedPaginator;
        }, 300);
      }
    });
  }
  loadDashData(res: any) {
    var that = this;
    let beta_arr_trading: any[] = [];
    let DI_arr_trading: any[] = [];
    var fil_b = that.getUniArr(res);
    var CIfill = res.filter((x: any) => {
      return x.type == 'C' && x.tradeStatus != 'Y';
    });

    CIfill = CIfill.sort(function (x: any, y: any) {
      return d3.ascending(new Date(x.modifieddate), new Date(y.modifieddate));
    });
    //  console.log('CIfill',CIfill)
    fil_b.forEach(function (value) {
      var b = CIfill.filter((x: any) => { return x.assetId == value.assetId; });
      var a: any = {};
      if (b.length > 0) {
        try {
          a['str_group'] = that.accGroup(b, value);
          a['showname'] = b[0].Indexname;
          a['showticker'] = b[0].Ticker;
          a['m_date'] = b[0].createddate;
          a['t_date'] = b[0].modifieddate;
          a['indextype'] = 'ETF';
          if (a['str_group'].length == 0) {
          } else {
            beta_arr_trading.push(a);
          }
        } catch (e) {}
      }
    });
    // beta_arr_trading.sort(function (x, y) { return d3.ascending(x.showname, y.showname); });
 
    that.strategies_grouping = beta_arr_trading;

    
    this.showLoadTabs = false
    if (this.isSavedFilCheck && this.isTradeFilCheck) {
      that.strategies_grouping_dp = beta_arr_trading;
     // console.log(that.strategies_grouping,'that.strategies_grouping_dp')
    }

   
    this.dataSource = new MatTableDataSource<any>(that.strategies_grouping);
    setTimeout(() => {
      if (that.strategies_grouping.length > 100) {
        this.Custompaginator.pageSize = 100;
      } else {
        //this.Custompaginator.pageSize = this.strategies_grouping.length;
      }
      this.dataSource.paginator = this.Custompaginator;
    }, 300);
    var DIfill = res.filter((x: any) => {
      return x.type == 'D';
    });
    fil_b.forEach(function (value) {
      var b = DIfill.filter((x: any) => { return x.assetId == value.assetId; });
      var a: any = {};
      if (b.length > 0) {
        var body1: any = that.accGroup1(b, value);
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
        if (body.length > 0) {
          DI_arr_trading.push(a);
        }
      }
    });
    that.DIEnabletradinglist = DI_arr_trading;

    this.dataSource2 = new MatTableDataSource<any>(that.DIEnabletradinglist);
    setTimeout(() => {
      if (that.DIEnabletradinglist.length > 100) {
        this.directPaginator.pageSize = 100;
      } else {
        //this.directPaginator.pageSize = this.DIEnabletradinglist.length;
      }
      this.dataSource2.paginator = this.directPaginator;
    }, 300);
  }
  onSortTradedData(sort: any) {
    const data = this.dataSource3.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'strategyName': {
          return this.compare(a.showname, b.showname, isAsc);
        }
        case 'basedOn':
          return this.compare(a.basedOn, b.basedOn, isAsc);
        case 'm_date':
          return this.compare(a.m_date, b.m_date, isAsc);
        case 't_date':
          return this.compare(a.t_date, b.t_date, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource3.data = this.sortedData;
  }
  onSortCusData(sort: any) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'strategyName': {
          return this.compare(a.showname, b.showname, isAsc);
        }
        case 'basedOn':
          return this.compare(a.basedOn, b.basedOn, isAsc);
        case 'm_date':
          return this.compare(a.m_date, b.m_date, isAsc);
        case 't_date':
          return this.compare(a.t_date, b.t_date, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource.data = this.sortedData;
  }
  onSortData(sort: any) {
    const data = this.dataSource2.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'strategyName': {
          return this.compare(a.name, b.name, isAsc);
        }
        case 'basedOn':
          return this.compare(a.showname, b.showname, isAsc);
        case 'm_date':
          return this.compare(a.createddate, b.createddate, isAsc);
        case 't_date':
          return this.compare(a.modifieddate, b.modifieddate, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource2.data = this.sortedData;
  }
  compare(a: any, b: any, isAsc: any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  checkTradeStgy(d: any) {
    if (isNotNullOrUndefined(d) && d.filter((x: any) => x['enableTrading'] == 'Y').length > 0) { return true; } else { return false; }
  }
  checkBasedOn1(item1: any) {
    var name = item1.showname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 19) {
        name = name.slice(0, 19) + '...';
      }
      return name;
    }
    // if (isNotNullOrUndefined(item1['showticker'])) { name = name + " (" + item1['showticker'] +')'; }
  }
  Namehover(item1: any) {
    var name = item1.showname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      return name;
    }
  }
  Namehover2(item1: any) {
    var name = item1.Indexname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      return name;
    }
  }
  checkBasedOn2(item1: any) {
    var name = item1.Indexname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 22) {
        name = name.slice(0, 22) + '...';
      }
      return name;
    }
    // if (isNotNullOrUndefined(item1['Ticker'])) { name = name + " (" + item1['Ticker'] +')'; }
  }
  checkFactsheetAvail(d: any) {
    if (
      isNotNullOrUndefined(d['factsheetStatus']) &&
      d['factsheetStatus'] == 'Y'
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkEnableTradingAvail(d: any) {
    if (isNotNullOrUndefined(d['enableTrading']) && d['enableTrading'] == 'Y') {
      return true;
    } else {
      return false;
    }
  }
  checkTradeBtn(d: any) {
    if (isNotNullOrUndefined(d['tradeStatus']) && d['tradeStatus'] == 'Y') {
      return false;
    } else if (this.checkFactsheetAvail(d)) {
      return true;
    } else {
      return false;
    }
  }
  checkReallocBtn(d: any) {
    if (
      this.checkTradeBtn(d) &&
      isNotNullOrUndefined(d['alTradedfrdiffUser']) &&
      d['alTradedfrdiffUser'] == 'Y'
    ) {
      return true;
    } else {
      return false;
    }
  }
  toggleRow(element: PeriodicElement) {
    // console.log(element,'ele')
    element.isExpanded = !element.isExpanded;
  }
  @ViewChild('elementRef', { static: false }) elementRef:
    | ElementRef
    | undefined;
  onToggleExpand(event: any) {
    // console.log(this.expandAll, 'ontoggle');
    this.expandAll = !this.expandAll;
    if(this.clickTab =='saved')
      {
        if (this.expandAll) {
          if (!$('.strategies-expand-custom').hasClass('.expanded')) {
            $('.strategies-expand-custom').not('.expanded').trigger('click');
            //console.log(this.expandAll, 'true');
            this.checkExpand();
          }
        } else {
          //if ($('.strategies-expand-custom').hasClass('.expanded')) {
          $('.strategies-expand-custom.expanded').trigger('click');
          //console.log(this.expandAll, 'else');
          //}
        }
      }
      else if(this.clickTab =='traded'){
        if (this.expandAll) {
          if (!$('.TRstrategies-expand-custom').hasClass('.expanded')) {
            $('.TRstrategies-expand-custom').not('.expanded').trigger('click');
            // console.log(this.expandAll, 'this.expandAll');
           
          }
        } else {
          //if ($('.strategies-expand-custom').hasClass('.expanded')) {
          $('.TRstrategies-expand-custom.expanded').trigger('click');
          // console.log(this.expandAll, 'this.expandAll');
          //}
        }
      }
      else{
        if (this.expandAll) {
          if (!$('.strategies-expand').hasClass('.expanded')) {
            $('.strategies-expand').not('.expanded').trigger('click');
            // console.log(this.expandAll, 'this.expandAll');
           
          }
        } else {
          //if ($('.strategies-expand-custom').hasClass('.expanded')) {
          $('.strategies-expand.expanded').trigger('click');
          // console.log(this.expandAll, 'this.expandAll');
          //}
        }
      }
 

  }
  ngOnChanges(){
    // console.log('changed')
  }

  checkExpand() {
    var that = this;
   
    //   const panels = $(".expanded");
    //   const parentaccodion = document.querySelectorAll(".strategies-expand-custom");
    // if(panels.length == parentaccodion.length){
    //   that.isExpand=true;
    //   that.expandAll = true;
    //   console.log('true')
    // }
    // else{
    //   that.isExpand=false;
    //   that.expandAll = false;
    //   console.log('false')
    // }
    setTimeout(() => {
      const panels = document.querySelectorAll(".expanded");
      const parentaccodion = document.querySelectorAll(".strategies-expand-custom");
      const TRstrategies = document.querySelectorAll(".TRstrategies-expand-custom");
      const DIstrategies = document.querySelectorAll(".strategies-expand");
      
      // console.log(panels.length + 1, parentaccodion.length, 'panel');
      if(this.clickTab =='saved'){
        if(panels.length == parentaccodion.length){
          that.isExpand=true;
          that.expandAll = true;
          // console.log('true')
        }
        else{
          that.isExpand=false;
          that.expandAll = false;
          // console.log('false')
        }
      }
      else if(this.clickTab =='traded'){
        // console.log('traded')
        if(panels.length == TRstrategies.length){
          that.isExpand=true;
          that.expandAll = true;
          // console.log('true')
        }
        else{
          that.isExpand=false;
          that.expandAll = false;
          // console.log('false')
        }
      }
      else{
        if(panels.length == DIstrategies.length){
          that.isExpand=true;
          that.expandAll = true;
          // console.log('true')
        }
        else{
          that.isExpand=false;
          that.expandAll = false;
          // console.log('false')
        }
      }
    }, 500);
 
   
  }
  modifiedDateTime(dat: any) {
    var iso = dat;
    if (isNotNullOrUndefined(dat)) {
      var date = iso.split('T')[0];
      var datesp =
        date.substr(0, 4) + '-' + date.substr(5, 2) + '-' + date.substr(8, 2);
      var time = iso.split('T')[1].split('.')[0];
      var ds = datesp + ' ' + time;
      var dates = formatDate(ds, 'MM/dd/yyyy HH:mm', 'en-US');
      return dates;
    } else {
      return '-';
    }
  }
  checkMyStatus(d: any) {
    if (isNotNullOrUndefined(d['tradeStatus']) && d['tradeStatus'] == 'Y') {
      return 'Trade Completed';
    } else if (
      isNotNullOrUndefined(d['enableTrading']) &&
      d['enableTrading'] == 'Y'
    ) {
      return 'Enabled For Trading';
    } else {
      return 'Saved Strategy';
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
      } else if (opt[key].seq < item.seq) {
        opt[key] = item;
      }
    });
    return opt;
  }
  checkStrName(item: any) {
    var name = item.name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 15) {
        name = name.slice(0, 15) + '...';
      }
      return name;
    } else {
      return 'Index' + (item.rowno + 1);
    }
  }
  hoverStrNameTraded(item: any) {
    var name = item.name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
  
      return name;
    } else {
      return 'Index' + (item.rowno + 1);
    }
  }
  checkStrNameTR(item: any) {
    // console.log('item',item.length)
    var name;
    if (item[0] == undefined) name = item.name;
    else name = item[0].name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 15) {
        name = name.slice(0, 15) + '...';
      }
      return name;
    } else {
      return 'Index' + (item.rowno + 1);
    }
  }

  checkShortname(item: any) {
    var shortname;
    if (item[0] == undefined) shortname = item.shortname;
    else shortname = item[0].shortname;
    return shortname;
  }
  checkBasedIndexNameTR(item1: any) {
    var name;
    if (item1[0] == undefined) name = item1.Indexname;
    else name = item1[0].Indexname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 15) {
        name = name.slice(0, 15) + '...';
      }
      return name;
    }
  }
  getRebalancesData: any;
  getRebalances() {
    var GURs=this.dataService.GetUpcomingRebalances().pipe(first()).subscribe((data) => {
      if (data[0] != 'Failed') { this.getRebalancesData = data; }
    }, (error) => { this.getRebalancesData = []; });
    this.subscriptions.add(GURs);
  }
  rebalClass(d: any) {
    var that = this;
    if (isNotNullOrUndefined(that.getRebalancesData)) {
      var checkReb = that.getRebalancesData.filter(
        (x: any) => x.strategyId == d.id
      );
      if (checkReb.length > 0) {
        if (checkReb[0]['flag'] == 'N') {
          return 'upcomingRebalnce_span';
        } else if (checkReb[0]['flag'] == 'C') {
          return 'currentRebalnce_span';
        } else if (checkReb[0]['flag'] == 'P') {
          return 'prevRebalnce_span';
        } else {
          return 'active';
        }
      } else {
        return 'active';
      }
    } else {
      return 'active';
    }
  }
  checkBasedIndexName(item1: any) {
    var name = item1.Indexname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 18) {
        name = name.slice(0, 18) + '...';
      }
      return name;
    }
  }
  NamehoverTraded(item1: any) {
    var name = item1.Indexname;
    if (isNotNullOrUndefined(name) && name.length > 0) {
       return name;
    }
  }
  checkStrNameDirect(item1: any) {
    var name = item1.name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 22) {
        name = name.slice(0, 22) + '...';
      }
      return name;
    } else {
      return 'Index' + (item1.rowno + 1);
    }
  }
  checkFactsheetAvailMas(d: any) {
    if (isNotNullOrUndefined(d['type']) && d['type'] == 'D') {
      var data = [...this.sharedData.getNotificationQueue.value]
        .filter((u) => u.assetId == d.assetId && u.rowno == d.rowno && u.slid == d.id && u['notifyStatus'] == 'E');
      if (data.length > 0) { return true; } else { return false; };
    } else {
      var data = [...this.sharedData.getNotificationQueue.value]
        .filter((u) => u.assetId == d.assetId && u.rowno == d.rowno && u.slid == d.id && u.accountId == 0 && u['notifyStatus'] == 'E');
      if (data.length > 0) { return true; } else { return false; }
    }
  }

  checkFactsheetAvailMasTraded(d: any) {
    if (isNotNullOrUndefined(d['type']) && d['type'] == 'D') {
      var data = [...this.sharedData.getNotificationQueue.value].filter(
        (u) =>
          u.assetId == d.assetId &&
          u.rowno == d.rowno &&
          u.slid == d.id &&
          u['notifyStatus'] == 'E'
      );
      if (data.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      var data = [...this.sharedData.getNotificationQueue.value].filter(
        (u) =>
          u.assetId == d.assetId &&
          u.rowno == d.rowno &&
          u.slid == d.id &&
          u.accountId == 0 &&
          u['notifyStatus'] == 'E'
      );
      if (data.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
  checkAcclen(data: any, type: any) {
    if (isNotNullOrUndefined(data[type]) && data[type].length > 0) {
      return true;
    } else {
      return false;
    }
  }
  checkAcc(dt: any) {
    if (dt.length > 0) {
      if (isNotNullOrUndefined(dt[0].accountNo)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  disable(d: any) {
    if (d['accChild'].length == 0) {
      return true;
    } else {
      return false;
    }
  }
  accGroup(dt: any, d: any) {
    var data = dt.sort(function (x: any, y: any) { return d3.ascending(x.rowno, y.rowno); });
    data = data.sort(function (x: any, y: any) { return d3.descending(new Date(x.modifieddate), new Date(y.modifieddate)); });
    //  console.log(data,'descending')
    var gData = this.groupBy(data, 'id');
    var fData = [];

    for (const [key, value] of Object.entries(gData)) {
      // console.log(key,value,'value')
      var val: any = value;
      var accParent = val.filter((aG: any) => aG['accountId'] == 0);
      var accChild = val.filter((aG: any) => aG['accountId'] > 0);

      var CIfill = this.cusIndexService._stgyListDashAccsData
        .filter((x: any) => { return (accParent[0]['id'] == x['id'] && x.type == 'C' && x.tradeStatus == 'Y'); });

      if (accChild.length == 0 && CIfill.length > 0) {
      } else {
        accChild = accChild.sort(function (x: any, y: any) { return d3.descending(new Date(x.modifieddate), new Date(y.modifieddate)); });
        fData.push({ accParent: accParent, accChild: accChild });
      }
    }
    fData = fData.sort(function (x: any, y: any) { return d3.descending(new Date(x['accParent'][0]['modifieddate']), new Date(y['accParent'][0]['modifieddate'])); });
    return fData;
  }
  accGroup2(dt: any) {
    var data = dt.sort(function (x: any, y: any) {
      return d3.ascending(x.rowno, y.rowno);
    });
    var gData = this.groupBy(data, 'id');
    var fData = [];
    var fData_parentDup = [];
    for (const [key, value] of Object.entries(gData)) {
      var val: any = value;
      var accParent = val.filter((aG: any) => aG['accountId'] == 0);
      var accChild = val.filter((aG: any) => aG['accountId'] > 0);
      if (accChild.length > 0) {
        fData_parentDup.push(accChild[0]);
      }
      //var CIfill = this.cusIndexService._stgyListDashAccsData.filter((x: any) => {
      //  return (accParent[0]['id'] == x['id'] && x.type == "D" && x.tradeStatus == "Y")
      //});
      if (accChild.length == 0) {
      } else {
        fData.push({ accParent: accChild.slice(0, 1), accChild: accChild });
      }
      //fData.push(value);
    }
    fData = fData.sort(function (x: any, y: any) { return d3.descending(new Date(x['accParent'][0]['modifieddate']), new Date(y['accParent'][0]['modifieddate'])); });
    return fData;
  }
  accGroup1(dt: any, d: any) {
    // console.log('accGroup1',dt)
    var data = dt.sort(function (x: any, y: any) {
      return d3.ascending(x.rowno, y.rowno);
    });
    var gData = this.groupBy(data, 'id');
    var fData = [];
    for (const [key, value] of Object.entries(gData)) {
      fData.push(value);
    }
    return fData[0];
  }
  //applyFilter(filterValue: string) {
  //  if (this.dataSource) {
  //    filterValue = filterValue.trim(); // Remove whitespace
  //    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
  //    // Apply filter only if this.dataSource.filter is not null or undefined
  //    this.dataSource.filter = filterValue ?? '';
  //  }
  //}
  searchText = '';
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    var filterValue = this.searchText.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // Apply filter only if this.dataSource.filter is not null or undefined
    this.dataSource.filter = filterValue ?? '';
    this.norec = this.dataSource.filteredData.length === 0;
    if(this.norec){
      //console.log('norec')
      this.isExpand = false;
      this.expandAll = false;
    }
  }
  directIndexfilter() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    var filterValue = this.searchText.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // Apply filter only if this.dataSource.filter is not null or undefined
    this.dataSource2.filter = filterValue ?? '';
    this.norec = this.dataSource2.filteredData.length === 0;
    if(this.norec){
      //console.log('norec')
      this.isExpand = false;
      this.expandAll = false;
    }
  }
  tradedfilter() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    var filterValue = this.searchText.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // Apply filter only if this.dataSource.filter is not null or undefined
    this.dataSource3.filter = filterValue ?? '';
    this.norec = this.dataSource3.filteredData.length === 0;
    if(this.norec){
      //console.log('norec')
      this.isExpand = false;
      this.expandAll = false;
    }
  }
  deleteIndex: any;
  deleteindexId = '';
  deleteTableId: any = '';
  deleteremainindex: any;
  deleteremainindextrade: any;
  temp = 1;
  strategies_grouping_traded = [];
  totalsavedlist: any;

  deleteStgy(d: any) {
    if (isNotNullOrUndefined(d['accParent']) && d['accParent'].length > 0) {
      this.deleteIndex = d['accParent'][0];
    }
  }

  deleteStrategyDashboardconfirm(dta: any, row: any) {
    this.deleteIndex = dta;
    // if (i != this.deleteTableId) { this.temp = 1; }
    // this.deleteindexId = id;
    // this.deleteTableId = i;
    // this.deleteremainindex = Number(this.strategies_grouping[this.deleteTableId].str_group.length);
    // this.deleteremainindextrade = this.strategies_grouping_traded[this.deleteTableId].length;
    // this.totalsavedlist = this.totalsavedlist - 1;
  }
  expandedRows = new Set<number>();
  strategies_grouping_dp: any = [];
  deleteStrategyDashboard() {
    var that = this;
    var datas = that.deleteIndex;
    this.sharedData.showMatLoader.next(true);
    var statdata: any[] = [];
    statdata.push(datas);
    try {
      this.cusIndexService.checkRemData_v1(datas.assetId, datas.rowno);
    } catch (e) {}
    var DSD=that.dataService.DeleteStrategyData(statdata).pipe(first()).subscribe((data) => {
          if (data[0] != 'Failed') {
            this.totalsavedlist = this.totalsavedlist - 1;
            this.deleteremainindex = this.deleteremainindex - this.temp;
            this.deleteremainindextrade =
              this.deleteremainindextrade - this.temp;
            this.sharedData.showMatLoader.next(false);
            that.toastr.info('Strategy removed successfully', '', {
              timeOut: 5000,
            });
            if (this.strategies_grouping.length == 1) {
              if (this.strategies_grouping[0].str_group.length == 1) {
                this.strategies_grouping_dp = [];
              }
            }
            //this.dataSource.data.splice(that.deleteIndex, 1);
            //this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
            //this.expandedRows.delete(this.dataSource.id);
            //this.expandedRows.delete(rowno);
            this.cusIndexService.GetStrListDashAccs();

            this.temp++;
            try {
              var assetId = statdata[0].assetId;
              var rowno = statdata[0].rowno;
              var arrData = [
                ...that.cusIndexService.cusIndTempStrategyData.value,
              ].map((a) => ({ ...a }));
              var selIndex = arrData.findIndex(
                (x) => x.rowno == rowno && x.assetId == assetId
              );
              arrData.splice(selIndex, 1);
              that.cusIndexService.cusIndTempStrategyData.next(arrData);
              that.sharedData.getNotificationDataReload();
            } catch (e) {}
          }
        },
        (error) => {
          this.sharedData.showMatLoader.next(false);
          that.sharedData.showCenterLoader.next(false);
          that.toastr.info('Something went wrong. Please try again', '', {
            timeOut: 5000,
          });
        }
    );
    this.subscriptions.add(DSD);
  }
  viewDirIndFactsheet(d: any, type: string) {
    var that = this;
    that.dirIndexService.notifyDiClick.next(true);
    if (this.dirIndexService._getBetaIndex_Direct.length > 0) {
      this.loadFactsheet(d, type);
    } else {
      var GSAP=that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
          if (data1[0] != 'Failed') {
            var dtabeta: any;
            dtabeta = data1;
            dtabeta.forEach((x: any) => {
              x.srName = x.name;
              x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
              return x;
            });
            that.dirIndexService.getBetaIndex_Direct.next(dtabeta);
            that.loadFactsheet(d, type);
          }
      });
      this.subscriptions.add(GSAP);
    }
  }

  loadFactsheet(d: any, type: string) {
    var that = this;
    var fObj: any = [];
    if (type == 'B') {
      that.dirIndexService.selectedDirIndFactsheet.next(d.accountId);
      fObj = this.dirIndexService._getBetaIndex_Direct.filter(
        (du: any) => du.assetId == d.assetId
      );
    } else if (
      type == 'H' &&
      isNotNullOrUndefined(d['str_groupH']) &&
      d['str_groupH'].length > 0
    ) {
      fObj = this.dirIndexService._getBetaIndex_Direct.filter(
        (du: any) => du.assetId == d['str_groupH'][0].assetId
      );
      that.dirIndexService.selectedDirIndFactsheet.next(0);
    } else {
      /** Traded Default zero account **/
      if (type == 'H' && isNullOrUndefined(d['str_groupH'])) {
        fObj = this.dirIndexService._getBetaIndex_Direct.filter(
          (du: any) => du.assetId == d.assetId
        );
        that.dirIndexService.selectedDirIndFactsheet.next(0);
      }
      /** Traded Default zero account **/
    }
    if (this.sharedData.checkMyUserType()) {
      try {
        var txt: string =
          d['name'] + '  index:' + d['Indexname'] + ' id:' + d['id'];
        this.sharedData.userEventTrack(
          'My Strategies',
          txt,
          txt,
          'view Approved Strategies Factsheet Click'
        );
      } catch (e) {}

      if (fObj.length > 0) {
        that.router.navigate(['approvedStrategies']);
        setTimeout(() => {
          var Obj = Object.assign({}, fObj[0]);
          that.dirIndexService.dirIndSearch(Obj);
        }, 1000);
      }
    } else {
      try {
        var txt: string =
          d['name'] + '  index:' + d['Indexname'] + ' id:' + d['id'];
        this.sharedData.userEventTrack(
          'My Strategies',
          txt,
          txt,
          'view Direct Index Factsheet Click'
        );
      } catch (e) {}

      if (fObj.length > 0) {
        that.router.navigate(['directIndexing']);
        setTimeout(() => {
          var Obj = Object.assign({}, fObj[0]);
          that.dirIndexService.dirIndSearch(Obj);
        }, 1000);
      }
    }
  }

  CustToolEdit(d: any) {
    if (isNotNullOrUndefined(d['accParent']) && d['accParent'].length > 0) {
      try {
        var txt: string =
          d['accParent'][0]['name'] +
          '  index:' +
          d['accParent'][0]['Indexname'] +
          ' id:' +
          d['accParent'][0]['id'];
        this.sharedData.userEventTrack(
          'My Strategies',
          txt,
          txt,
          'Edit Strategies Click'
        );
      } catch (e) {}
      this.cusIndexService.customizeSelectedIndex_custom.next(
        d['accParent'][0]
      );
      this.cusIndexService.currentSNo.next(d['accParent'][0]['rowno']);
      this.router.navigate(['customIndexing']);
    }
  }

  viewCustIndFactsheet(d: any) {
    try {
      var txt: string =
        d['name'] + '  index:' + d['Indexname'] + ' id:' + d['id'];
      this.sharedData.userEventTrack(
        'My Strategies',
        txt,
        txt,
        'view Cust Index Factsheet Click'
      );
    } catch (e) {}
    this.cusIndexService.currentSNo.next(d['rowno']);
    this.cusIndexService.selectedCIIndFactsheet.next(d['accountId']);
    this.cusIndexService.customizeSelectedIndex_custom.next(d);
    this.cusIndexService.startIndexClick_custom.next(false);
    this.cusIndexService.notifyDiClick.next(true);
    this.router.navigate(['customIndexing']);
  }
  viewCustIndFactsheetTraded(d: any, defaultAcc: string) {
    /** Child view click **/
    if (d.type == 'C' && defaultAcc == '') {
      this.viewCustIndFactsheet(d);
    } else if (d.type == 'C' && defaultAcc == 'default') {
      try {
        var txt: string =
          d['name'] + '  index:' + d['Indexname'] + ' id:' + d['id'];
        this.sharedData.userEventTrack(
          'My Strategies',
          txt,
          txt,
          'view traded Cust Index Factsheet Click'
        );
      } catch (e) {}
      this.cusIndexService.currentSNo.next(d['rowno']);
      this.cusIndexService.selectedCIIndFactsheet.next(0);
      this.cusIndexService.customizeSelectedIndex_custom.next(d);
      this.cusIndexService.startIndexClick_custom.next(false);
      this.cusIndexService.notifyDiClick.next(true);
      this.router.navigate(['customIndexing']);
    } else if (d.type == 'D' && defaultAcc == '') {
      this.viewDirIndFactsheet(d, 'B');
    } else if (d.type == 'D' && defaultAcc == 'default') {
      this.viewDirIndFactsheet(d, 'H');
    }
    /** Child view click **/
  }
  CustToolEditTraded(d: any) {
    var that = this;
    if (d['accParent'][0].type == 'C') {
      if (isNotNullOrUndefined(d['accParent']) && d['accParent'].length > 0) {
        try {
          var txt: string =
            d['accParent'][0]['name'] +
            '  index:' +
            d['accParent'][0]['Indexname'] +
            ' id:' +
            d['accParent'][0]['id'];
          this.sharedData.userEventTrack(
            'My Strategies',
            txt,
            txt,
            'Edit traded Strategies Click'
          );
        } catch (e) {}
        that.cusIndexService.customizeSelectedIndex_custom.next(
          d['accParent'][0]
        );
        that.cusIndexService.currentSNo.next(d['accParent'][0]['rowno']);
        that.router.navigate(['customIndexing']);
      }
    } else {
      that.loadDirectIndexEdit(d);
    }
  }
  loadDirectIndexEdit(d: any) {
    var that = this;
    if (this.dirIndexService._getBetaIndex_Direct.length > 0) {
      var fObj = this.dirIndexService._getBetaIndex_Direct.filter(
        (du: any) => du.assetId == d['accParent'][0].assetId
      );
      if (this.sharedData.checkMyUserType()) {
        that.router.navigate(['approvedStrategies']);
        try {
          var txt: string =
            d['accParent'][0]['name'] +
            '  index:' +
            d['accParent'][0]['Indexname'] +
            ' id:' +
            d['accParent'][0]['id'];
          this.sharedData.userEventTrack(
            'My Strategies',
            txt,
            txt,
            'Edit Approved Strategies Click'
          );
        } catch (e) {}
      } else {
        that.router.navigate(['directIndexing']);
        try {
          var txt: string =
            d['accParent'][0]['name'] +
            '  index:' +
            d['accParent'][0]['Indexname'] +
            ' id:' +
            d['accParent'][0]['id'];
          this.sharedData.userEventTrack(
            'My Strategies',
            txt,
            txt,
            'Edit Direct Index Click'
          );
        } catch (e) {}
      }
      setTimeout(() => {
        var Obj = Object.assign({}, fObj[0]);
        that.dirIndexService.dirIndSearch(Obj);
      }, 1000);
    } else {
      var GSAP=that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
          if (data1[0] != 'Failed') {
            var dtabeta: any;
            dtabeta = data1;
            dtabeta.forEach((x: any) => {
              x.srName = x.name;
              x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
              return x;
            });
            that.dirIndexService.getBetaIndex_Direct.next(dtabeta);
            var fObj = this.dirIndexService._getBetaIndex_Direct.filter(
              (du: any) => du.assetId == d['accParent'][0].assetId
            );
            if (this.sharedData.checkMyUserType()) {
              that.router.navigate(['approvedStrategies']);
              setTimeout(() => {
                try {
                  var txt: string =
                    d['accParent'][0]['name'] +
                    '  index:' +
                    d['accParent'][0]['Indexname'] +
                    ' id:' +
                    d['accParent'][0]['id'];
                  this.sharedData.userEventTrack(
                    'My Strategies',
                    txt,
                    txt,
                    'Edit Approved Strategies Click'
                  );
                } catch (e) {}
                var Obj = Object.assign({}, fObj[0]);
                that.dirIndexService.dirIndSearch(Obj);
              }, 1000);
            } else {
              that.router.navigate(['directIndexing']);
              setTimeout(() => {
                try {
                  var txt: string =
                    d['accParent'][0]['name'] +
                    '  index:' +
                    d['accParent'][0]['Indexname'] +
                    ' id:' +
                    d['accParent'][0]['id'];
                  this.sharedData.userEventTrack(
                    'My Strategies',
                    txt,
                    txt,
                    'Edit Direct Index Click'
                  );
                } catch (e) {}
                var Obj = Object.assign({}, fObj[0]);
                that.dirIndexService.dirIndSearch(Obj);
              }, 1000);
            }
          }
      });
      this.subscriptions.add(GSAP);
    }
  }

  loadDirectIndexEdit1(d: any) {
    var that = this;
    if (this.dirIndexService._getBetaIndex_Direct.length > 0) {
      var fObj = this.dirIndexService._getBetaIndex_Direct.filter(
        (du: any) => du.assetId == d['str_group'][0].assetId
      );
      if (this.sharedData.checkMyUserType()) {
        that.router.navigate(['approvedStrategies']);
        try {
          var txt: string =
            d['accParent'][0]['name'] +
            '  index:' +
            d['accParent'][0]['Indexname'] +
            ' id:' +
            d['accParent'][0]['id'];
          this.sharedData.userEventTrack(
            'My Strategies',
            txt,
            txt,
            'Edit Approved Strategies Click'
          );
        } catch (e) {}
      } else {
        that.router.navigate(['directIndexing']);
        try {
          var txt: string =
            d['accParent'][0]['name'] +
            '  index:' +
            d['accParent'][0]['Indexname'] +
            ' id:' +
            d['accParent'][0]['id'];
          this.sharedData.userEventTrack(
            'My Strategies',
            txt,
            txt,
            'Edit Direct Index Click'
          );
        } catch (e) {}
      }
      setTimeout(() => {
        var Obj = Object.assign({}, fObj[0]);
        that.dirIndexService.dirIndSearch(Obj);
      }, 1000);
    } else {
      var GSALP=that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
          if (data1[0] != 'Failed') {
            var dtabeta: any;
            dtabeta = data1;
            dtabeta.forEach((x: any) => {
              x.srName = x.name;
              x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
              return x;
            });
            that.dirIndexService.getBetaIndex_Direct.next(dtabeta);
            var fObj = this.dirIndexService._getBetaIndex_Direct.filter(
              (du: any) => du.assetId == d['accParent'][0].assetId
            );
            if (this.sharedData.checkMyUserType()) {
              that.router.navigate(['approvedStrategies']);
              setTimeout(() => {
                try {
                  var txt: string =
                    d['accParent'][0]['name'] +
                    '  index:' +
                    d['accParent'][0]['Indexname'] +
                    ' id:' +
                    d['accParent'][0]['id'];
                  this.sharedData.userEventTrack(
                    'My Strategies',
                    txt,
                    txt,
                    'Edit Approved Strategies Click'
                  );
                } catch (e) {}
                var Obj = Object.assign({}, fObj[0]);
                that.dirIndexService.dirIndSearch(Obj);
              }, 1000);
            } else {
              that.router.navigate(['directIndexing']);
              setTimeout(() => {
                try {
                  var txt: string =
                    d['accParent'][0]['name'] +
                    '  index:' +
                    d['accParent'][0]['Indexname'] +
                    ' id:' +
                    d['accParent'][0]['id'];
                  this.sharedData.userEventTrack(
                    'My Strategies',
                    txt,
                    txt,
                    'Edit Direct Index Click'
                  );
                } catch (e) {}
                var Obj = Object.assign({}, fObj[0]);
                that.dirIndexService.dirIndSearch(Obj);
              }, 1000);
            }
          }
      });
      this.subscriptions.add(GSALP);
    }
  }

  lockedDataInfo: any = [];
  pausedDataInfo: any = [];
  tradeStrategyDt: any = { data: [], type: '' };
  tradeStrategy(d: any, type: string, multiSelType: boolean = false) {
    this.lockedDataInfo = [];
    this.pausedDataInfo = [];
    this.tradeStrategyDt['data'] = [];
    this.tradeStrategyDt['type'] = type;
    var da = d.filter(
      (x: any) => x['activeTrade'] == true && x['accountId'] > 0
    );
    if (multiSelType) {
      da = d;
    }
    if (da.length > 0) {
      let userid = atob(
        atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
      );
      var data: any = [];
      da.forEach((dx: any) => {
        var obj = { accid: dx['accountId'], userid: userid };
        data.push(obj);
      });
      var GLPAs=this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
          var lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
          var pauseInfo = res.filter((ld: any) => ld.pausestatus == 'Y');
          this.lockedDataInfo = lockInfo;
          this.pausedDataInfo = pauseInfo;
          if (
            res.length == 0 ||
            (lockInfo.length == 0 && pauseInfo.length == 0)
          ) {
            if (da.length == 1) {
              if (type == 'Rebalance') {
                this.sharedData.selTradeData.tradeType = 0;
                this.openTradeRebalance(da);
              } else {
                this.checkAccInfo(da[0], 'CI');
              }
            } else {
              this.sharedData.selTradeData.tradeType = 1;
              if (type == 'Rebalance') {
                this.openTradeRebalance(da);
              } else {
                this.openTrade(da);
              }
            }
          } else {
            this.tradeStrategyDt['data'] = da;
            $('#lockPauseInfoTradeModal').modal('show');
          }
      });
      this.subscriptions.add(GLPAs);
    } else {
      this.toastr.info('Select any strategy from the list', '', {
        timeOut: 5000,
      });
    }
  }

  openTradeRebalance(dd: any) {
    this.sharedData.selTradeData.data = dd;
    this.sharedData.selTradeData.accountInfo = dd;
    this.sharedData.selTradeData.type = 'CI';
    this.dialogController.openTrade(rebalanceStrategiesComponent);
  }

  openTrade(dd: any) {
    var notifyData = this.sharedData.getNotificationQueue.value.map(
      (a: any) => ({ ...a })
    );
    var fillNotifyData = notifyData.filter(this.tradecomp(dd));
    if (
      fillNotifyData.length > 0 &&
      fillNotifyData.filter((x: any) => 'E' == x.notifyStatus).length ==
        fillNotifyData.length
    ) {
      this.sharedData.selTradeData.data = dd;
      this.sharedData.selTradeData.accountInfo = dd;
      this.sharedData.selTradeData.type = 'CI';
      this.dialogController.openTrade(TradeOpenComponent);
    } else if (
      isNullOrUndefined(this.sharedData.getNotificationQueue.value) ||
      this.sharedData.getNotificationQueue.value.length == 0
    ) {
      this.toastr.info('Please wait trade data initializing...', '', {
        timeOut: 5000,
      });
    } else if (fillNotifyData.length > 0) {
      $('#viewQueueModal').modal('show');
    } else {
      this.sharedData.getNotificationDataReload();
      this.toastr.info(
        'Please wait trade data initializing try after sometime...',
        '',
        { timeOut: 5000 }
      );
    }
  }

  tradeData: any = { data: [], type: '' };
  checkAccInfo(dd: any, type: any) {
    this.sharedData.selTradeData.tradeType = 0;
    this.tradeData.data = [dd];
    this.tradeData.type = type;
    this.pausedDataInfo = [];
    const GetAccount = this.dataService.GetAccountData(dd['accountId']).pipe(first()).subscribe((res: any[]) => {
          if (res.length > 0 &&
            isNotNullOrUndefined(res[0]['lockstatus']) &&
            res[0]['lockstatus'] == 'Y') {
            $('#lockTradeModal').modal('show');
          } else if (
            res.length > 0 &&
            isNotNullOrUndefined(res[0]['pauseStatus']) &&
            res[0]['pauseStatus'] == 'Y'
          ) {
            this.pausedDataInfo = [...res];
            $('#pauseTradeModal').modal('show');
          } else {
            this.allowTade();
          }
        },
        (error) => {}
      );
    this.subscriptions.add(GetAccount);
  }

  unPauseAcc() {
    this.sharedData
      .PauseAccUpdate(this.tradeData.data[0]['accountId'], 'N')
      .then((res) => {
        this.allowTade();
      });
  }

  allowTade() {
    try {
      var tp =
        ' Strategy id ' +
        this.tradeData.data[0]['id'] +
        ' type ' +
        this.tradeData.type;
      this.sharedData.userEventTrack(
        'My Strategies',
        tp,
        tp,
        'Trade event Click'
      );
    } catch (e) {}
    if (this.tradeData.type == 'CI') {
      this.openTrade(this.tradeData.data);
    } else if (this.tradeData.type == 'DI') {
      this.openTradeDI(this.tradeData.data);
    }
  }

  openTradeDI(d: any) {
    this.sharedData.selTradeData.data = d;
    this.sharedData.selTradeData.accountInfo = d;
    this.sharedData.selTradeData.type = 'DI';
    this.dialogController.openTrade(TradeOpenComponent);
  }

  tradecomp(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return (
            other.id == current.slid &&
            current['accountId'] == other['accountId']
          );
        }).length > 0
      );
    };
  }

  tradeStrategyDI(d: any, type: string, multiSelType: boolean = false) {
    this.lockedDataInfo = [];
    this.pausedDataInfo = [];
    this.tradeStrategyDt['data'] = [];
    this.tradeStrategyDt['type'] = type;
    var da = d.filter(
      (x: any) => x['activeTrade'] == true && x['accountId'] > 0
    );
    if (multiSelType) {
      da = d;
    }
    if (da.length > 0) {
      let userid = atob(
        atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
      );
      var data: any = [];
      da.forEach((dx: any) => {
        var obj = { accid: dx['accountId'], userid: userid };
        data.push(obj);
      });
      var GLPAs=this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
          var lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
          var pauseInfo = res.filter((ld: any) => ld.pausestatus == 'Y');
          this.lockedDataInfo = lockInfo;
          this.pausedDataInfo = pauseInfo;
          if (
            res.length == 0 ||
            (lockInfo.length == 0 && pauseInfo.length == 0)
          ) {
            if (da.length == 1) {
              if (type == 'Rebalance') {
                this.sharedData.selTradeData.tradeType = 0;
                this.openTradeRebalance(da);
              } else {
                this.checkAccInfo(da[0], 'DI');
              }
            } else {
              this.sharedData.selTradeData.tradeType = 1;
              if (type == 'Rebalance') {
                this.openTradeRebalance(da);
              } else {
                this.openTradeDI(da);
              }
            }
          } else {
            this.tradeStrategyDt['data'] = da;
            $('#lockPauseInfoTradeModal').modal('show');
          }
      });
      this.subscriptions.add(GLPAs);
    } else {
      this.toastr.info('Select any strategy from the list', '', {
        timeOut: 5000,
      });
    }
  }

  rebalanceInfo(d: any) {
    this.tradeStrategy([d], 'Rebalance', true);
  }

  checkDeleteBtn(d: any) {
    if (isNotNullOrUndefined(d['accParent']) && d['accParent'].length > 0) {
      var filD: any = this.cusIndexService.stgyListDashAccsData.value.filter(
        (x: any) =>
          x['tradeStatus'] == 'Y' && d['accParent'][0]['id'] == x['id']
      );
      if (filD.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  cloneDy: any;
  cloneStgyD(d: any) {
    if (isNotNullOrUndefined(d['accParent']) && d['accParent'].length > 0) {
      this.cloneDy = d['accParent'][0];
    } else {
      this.cloneDy = undefined;
    }
  }

  cloneConfirm() {
    if (isNotNullOrUndefined(this.cloneDy)) {
      try {
        var txt: string =
          this.cloneDy['name'] +
          '  index:' +
          this.cloneDy['Indexname'] +
          ' id:' +
          this.cloneDy['id'];
        this.sharedData.userEventTrack(
          'My Strategies',
          txt,
          txt,
          'clone index click'
        );
      } catch (e) {}
      // console.log('cloneStgy', this.cloneDy);
      this.sharedData.showMatLoader.next(true);
      this.cusIndexService.cloneStgy(this.cloneDy);
    }
  }

  initTrade() {
    if (this.pausedDataInfo.length > 0) {
      this.pausedDataInfo.forEach((d: any) => {
        this.sharedData
          .PauseAccUpdate(JSON.stringify(d['accid']), 'N')
          .then((res) => {});
      });
    }
    var da: any = [];
    if (this.lockedDataInfo.length > 0) {
      da = this.tradeStrategyDt.data.filter(
        this.tradeLock(this.lockedDataInfo)
      );
    } else {
      da = this.tradeStrategyDt.data;
    }

    if (da.length == 1) {
      this.sharedData.selTradeData.tradeType = 0;
    } else {
      this.sharedData.selTradeData.tradeType = 1;
    }
    if (isNotNullOrUndefined(da) && da.length > 0) {
      if (da.filter((x: any) => x.type == 'D').length > 0) {
        if (this.tradeStrategyDt.type == 'Rebalance') {
          this.openTradeRebalance(da);
        } else {
          this.openTradeDI(da);
        }
      } else {
        if (this.tradeStrategyDt.type == 'Rebalance') {
          this.openTradeRebalance(da);
        } else {
          this.openTrade(da);
        }
      }
    } else {
      this.toastr.info('Please try again...', '', { timeOut: 4000 });
    }
  }
  tradeLock(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return current['accountId'] == other['accid'];
        }).length == 0
      );
    };
  }
}
