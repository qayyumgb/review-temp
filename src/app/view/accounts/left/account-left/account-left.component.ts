import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { SharedDataService,isNotNullOrUndefined,isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { AccountService } from '../../../../core/services/moduleService/account.service';
import { Subscription, first } from 'rxjs';
import { DataService } from '../../../../core/services/data/data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { FormControl } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-account-left',
  templateUrl: './account-left.component.html',
  styleUrl: './account-left.component.scss'
})
export class AccountLeftComponent implements OnInit, OnDestroy{
  
  @Input() getAcc_list_Funded: any = [];
  @Input() getAcc_list_NonFunded: any = [];
  @Input() activeLeftGrid: any;
  @Output() clickedNonFundedData = new EventEmitter();
  @Output() clickedFundedData = new EventEmitter();
  @ViewChild('viewport1') viewport1: CdkVirtualScrollViewport | any;
  @ViewChild('viewport2') viewport2: CdkVirtualScrollViewport | any;
  constructor(public sharedData: SharedDataService,public accountService: AccountService,private dataservice: DataService,private toastr: ToastrService,private logger: LoggerService,private el: ElementRef) {

  }
  showDelay = new FormControl(100);
  hideDelay = new FormControl(100);
  subscriptions = new Subscription();
  myAcclist: any;
  lastRefrestDate: any;
  lastRefrestDateInd: any;
  showAccOverview: boolean = false;
  getAcc_list: any;
  getAcc_list_AccountList: any;
  getAcc_list_AccountList_Funded: any;
  dataLoaded: boolean = false;
  getAcc_list_dupAccountList: any;
  getAcc_list_dupAccountList_Funded: any;
  getAcc_list_live: any;
  dashAccFlag: boolean = false;
  individual_selectedAcc_Dup: any;
  individual_selectedAcc: any;
  individual_selectedAcc_NF: any;
  showSpinnerAcc_list: boolean = false;
  show_fundedTab: boolean = false;
  startRefresh_NF: boolean = false;
  accPortfolioPosition: any = [];
  avoid_MulClick: boolean = false;
  showcenterslider: boolean = false;
  pershPortFolioPosition: any = [];
  pershPortFolioPositionUnrealized: any = [];
  pershAssetDes: any = [];
  pershMarketTotal: number = 0
  pershMarketTotalCash: number = 0
  pershAvailableCash: number = 0
  pershUnrealizedMarketTotal: number = 0
  pershUnrealizedMarketTotalCash: number = 0
  pershUnrealizedAvailableCash: number = 0;
  pershUnrealizedGainLossTotal: number = 0;
  marketdata = [];
  selected_NF_Details: any;
  selectedAccountVan: string = '';
  selectedAccList: any = '';
  SelectedAccountType: string = "M";
  selectedAccount: any;
  activeTab: string = "position";
  nonFundClicked = "Non Funded";
  nonFundCheckbox: boolean = false;
  acc_cashRiseType: string = 'I';
  acc_liquidateType: string = 'I';
  acc_liquidateRebalance: number = 0;
  selectedName: any = '';
  selectedNameEdit: any = '';
  selectedAccountSummary: any;
  AS_cashbalance: number = 0;
  accOverview: any = [];
  AS_dividends: number = 0;
  AS_buyingpower: number = 0;
  taxlotRealizedData: any = [];
  tradeLock_Strategy: boolean = false;
  pershRealizedGLTotal: number = 0;
  pershRealizedShortTermGainLoss: number = 0;
  pershRealizedLongTermGainLoss: number = 0;
  tradesHistoryData: any = [];
  tradesHistoryDetails: any = [];
  tradesHisData: any = [];
  tradesHistoryOption: any = [];
  acc_taxTargetLong: number = 0;
  acc_taxTargetLong_d: number = 0;
  acc_taxTargetShort_d: number = 0;
  acc_taxTargetShort: number = 0;
  selTradeHisOption: any;
  openHisInput: boolean = false;
  pauseTotalTrade: boolean = false;
  showSearchBox_vs: boolean = false;

  ngOnDestroy() { this.subscriptions.unsubscribe(); };

  ngOnInit(){
    var that= this;

    var refreshAcc = that.accountService.refreshAccount.subscribe((data: any) => {
      if (data) {
        that.refreshNonfundedTabTrigger();
        that.accountService.refreshAccount.next(false);
      }
    })
     var GetSubAccounts = that.dataservice.GetSubAccounts().subscribe((data: any) => {
      that.accountService.GetAccounts.next(data);
      that.getAccounts(data);
 
      setTimeout(function () {
        that.sharedData.showCircleLoader.next(false);
      }.bind(this), 1000);
    }, error => {
      that.getAccounts(undefined);
    });
    var GetAccount = this.accountService.GetAccounts.subscribe(data => {
      that.myAcclist = data;
    });
    this.subscriptions.add(refreshAcc);
    this.subscriptions.add(GetAccount);
    this.subscriptions.add(GetSubAccounts);
     var triAccTrade = that.sharedData.triAccTrade.subscribe(res => {
      if (res) {
        //$('#showMatLoaderAccounts').show();
        //that.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
        //  that.accountService.GetAccounts.next(data);
        //  that.myAcclist = data;
        //  that.refreshInd_accounts(true);
        //  $('#showMatLoaderAccounts').hide();
        // }, error => { });
        //console.log(this.individual_selectedAcc, that.individual_selectedAcc_Dup);
        that.individual_selectedAcc = this.individual_selectedAcc_Dup;
        //this.sharedData.triAccTrade.next(false);
       
      }
    });
    this.subscriptions.add(triAccTrade);
  }
  ngOnChanges(changes: SimpleChanges) {
    var that = this;
  
      if (changes['activeLeftGrid'].currentValue.nonfunded != null ) {
        var accID = changes['activeLeftGrid'].currentValue.nonfunded;
        that.individual_selectedAcc_NF = accID;
      } else { that.individual_selectedAcc_NF = null; }
      if (changes['activeLeftGrid'].currentValue.funded != null) {
        var accID = changes['activeLeftGrid'].currentValue.funded;
        that.individual_selectedAcc = accID;
        that.individual_selectedAcc_Dup = accID;
      } else { that.individual_selectedAcc = null; that.individual_selectedAcc_Dup = null; }
      //if (changes['activeLeftGrid'].currentValue.openDefaultFundedTab == true) {
      //  that.fundedTab();
      //} else { that.nonFundedTab(); }
      // console.log('Parent data changed:', changes['getAcc_list_NonFunded'].currentValue.length,  changes['activeLeftGrid'].currentValue, changes['getAcc_list_Funded'].currentValue.length);
      // Perform actions when data from child changes
    
    if (changes['getAcc_list_Funded'].currentValue.length > 0) {
      that.getAcc_list_dupAccountList_Funded = that.getAcc_list_Funded;
    } else { that.getAcc_list_dupAccountList_Funded = []; }

    if (changes['getAcc_list_NonFunded'].currentValue.length > 0) {
      that.getAcc_list_dupAccountList = that.getAcc_list_NonFunded;
    } else { that.getAcc_list_dupAccountList = []; }

  }
  startRefresh: boolean = false;
  item: number | any;
  //refreshInd_accounts(initRef: boolean = false) {
  //  var that = this;
  //  if (initRef) { that.startRefresh = false; } else { that.startRefresh = true; }
  //  that.sharedData.showCircleLoader.next(false);
  //  $('.refresh span').addClass('rotate');
  //  that.selectedAccountVan = this.selectedAccList.accountVan;
  //}
  checkLiqDate: boolean = false;
  liquidDate: any;
  liquidMinDate = new Date();
  liquidMaxDate = new Date();
  C_AccountDetails: any;
  C_AccountDetails_D: any;
  getLiquidateInfo() {
    var that = this;
    var passAccId = that.selectedAccList.accountId;
    this.dataservice.GetAccountDataInd(passAccId).pipe(first()).subscribe(data => {
      if (this.sharedData.checkServiceError(data)) { } else {
        this.C_AccountDetails = data[0];
        if (this.C_AccountDetails.lockstatus == 'Y') {
          this.tradeLock_Strategy = true;
        } else { this.tradeLock_Strategy = false; }

        if (isNotNullOrUndefined(this.C_AccountDetails.liqType)) { that.acc_liquidateType = this.C_AccountDetails.liqType }
        else { that.acc_liquidateType = 'I' }

        if (isNotNullOrUndefined(this.C_AccountDetails.liquidateDate)) { that.liquidDate = new Date(this.C_AccountDetails.liquidateDate); }

        if (isNotNullOrUndefined(this.C_AccountDetails.liqRebalance)) { that.acc_liquidateRebalance = this.C_AccountDetails.liqRebalance }
        else { that.acc_liquidateRebalance = 0 }

        this.C_AccountDetails_D = data[0];
      }
    }, error => { this.tradeLock_Strategy = false; });
  }
  currentSettingsList: any;
  acc_taxTarget: number = 0;
  acc_cashTarget: number = 0;
  acc_bufferTarget: number = 20;
  acc_bufferTarget_d: number = 20;
  acc_taxTarget_d: number = 0;
  acc_cashTarget_d: number = 0;
  gains = "Loss";
  updatetaxInfoModal(selAcc:any, frm:any) {
    let that = this;
    that.currentSettingsList = selAcc;
    that.acc_taxTarget = selAcc.taxTarget;
    that.acc_cashTarget = selAcc.cashTarget;
    that.acc_bufferTarget = selAcc.taxBufferGainTarget;
    that.acc_bufferTarget_d = selAcc.taxBufferGainTarget;
    if (isNullOrUndefined(selAcc.taxBufferGainTarget)) {
      that.acc_bufferTarget = 20;
      that.acc_bufferTarget_d = 20;
    }
    //// validation
    that.acc_taxTarget_d = selAcc.taxTarget;
    that.acc_cashTarget_d = selAcc.cashTarget;
    //// validation
    if (isNullOrUndefined(selAcc.taxType) || selAcc.taxType == '' || selAcc.taxType == 'L') { that.gains = "Loss" } else { that.gains = "Gain" }
  }
  tradedLiquidateData: any = [];
  getLiquidatedata(d:any) {
    var that = this;
    this.tradedLiquidateData = [];
    this.savedStrategySettingsData = [];
    that.dataservice.GetStrategyAccount(d.id).pipe(first()).subscribe((accList: any) => {
      var checkCurrentAccount = accList.filter((x:any) => x.accountId == d.accountId);
      if (checkCurrentAccount.length > 0) {
        this.savedStrategySettingsData = checkCurrentAccount;
        that.updatetaxInfoModal(checkCurrentAccount[0], 'saved'); // Update Tax Optimization data
        this.tradedLiquidateData = checkCurrentAccount;
      }

    }, error => {
      this.logger.logError(error, 'GetGicsExList');
      this.tradedLiquidateData = [];
      this.savedStrategySettingsData = [];
    });
  }
  userStepData: any;
  cuselindName = "";
  cuselindTicker = "";
  AT_strategyListDetails: any;
  AT_strategyListFilters: any;
  savedStrategyIndexSteps(val:any) {
    var that = this;
    that.cuselindName = "";
    that.cuselindTicker = "";
    this.dataservice.GetUserSteps(that.tradedNotifyId).pipe(first()).subscribe((data: any) => {
      this.userStepData = data;
      if (isNotNullOrUndefined(data)) {
        that.AT_strategyListDetails = data.strategyListQueueAccs[0];
        that.AT_strategyListFilters = data.factIndexSteps;
        that.cuselindName = that.AT_strategyListDetails.Indexname;
        $('#showMatLoaderAccounts').hide();
        if (isNotNullOrUndefined(that.AT_strategyListDetails.Ticker)) {
          that.cuselindTicker = ' (' + that.AT_strategyListDetails.Ticker + ')';
        }
      }
    });
  }
  GetStgyListDashboardAccs: any = [];
  tradedNotifyId: any;
  alreadyselected_strategy: any;
  savedStrategySettingsData: any = [];
  cloneStrategyDataText: boolean = false;
  cloneStrategyData: any = [];
  checkAlreadysavedStrategy(value:any) {
    var that = this;
    var val = parseInt(value.id);
    var slid:any;
    this.GetStgyListDashboardAccs = [];
    that.tradedNotifyId = 0;
    that.alreadyselected_strategy = undefined;
    this.savedStrategySettingsData = [];
    //// User saved strategey list
    that.dataservice.GetStgyListDashboardAccs().pipe(first()).subscribe((
      res: any[]) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.GetStgyListDashboardAccs = res;
        var getslid = res.filter(x => x.accountId == val);
        if (getslid.length > 0) {
          slid = getslid[0].id;
        }
        that.dataservice.GetTradeAccs(val).pipe(first()).pipe(first()).subscribe((data: any) => {

          if (data.length > 0) {
            var d: any = data[0];
            that.dataservice.GetStrategyNotifyId(d.id, d.accountId).pipe(first()).subscribe((nID: any) => {
              that.tradedNotifyId = nID[0].notifyId;
              that.cloneStrategyData = nID;
              that.alreadyselected_strategy = d; //// Traded Complted strategy
              that.getLiquidatedata(d); //// Show filter for CashRise and Liquidate
              that.savedStrategyIndexSteps(d); //// Open Index Steps
            })
          } else {
            var d: any = data[0];
            that.dataservice.GetStrategyAccount(slid).pipe(first()).subscribe((accList: any) =>  {
              if (isNotNullOrUndefined(d)) {
                var checkCurrentAccount = accList.filter((x:any) => x.accountId == d.accountId);
                that.sharedData.showCircleLoader.next(false);
                $('#showMatLoaderAccounts').hide();
                if (checkCurrentAccount.length > 0) {
                  that.savedStrategySettingsData = checkCurrentAccount;
                  that.updatetaxInfoModal(checkCurrentAccount[0], 'saved');// Update Tax Optimization data
                } else {
                  that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
                }
              } else {
                $('#showMatLoaderAccounts').hide();
                that.sharedData.showCircleLoader.next(false);
                that.updatetaxInfoModal(that.selectedAccList, 'Accounts');
              }

            }, error => {
              this.logger.logError(error, 'GetGicsExList');
              that.sharedData.showCircleLoader.next(false);
              $('#showMatLoaderAccounts').hide();
              this.savedStrategySettingsData = [];
            });
          }
        });
      }
      else {
        //that.sharedData.showCircleLoader.next(false);
        //$('#showMatLoaderAccounts').hide();
        //that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
        //console.log(val, 'else---- Acc list noData')
        //// New User without saving strategy (No startegy has been saved)
        that.dataservice.GetTradeAccs(val).pipe(first()).subscribe((data: any) => {
          if (data.length > 0) {
            var d: any = data[0];
            that.dataservice.GetStrategyNotifyId(d.id, d.accountId).pipe(first()).subscribe((nID: any) => {
              that.cloneStrategyData = nID;
              that.tradedNotifyId = nID[0].notifyId;
              that.alreadyselected_strategy = d; //// Traded Complted strategy
              that.getLiquidatedata(d); //// Show filter for CashRise and Liquidate
              that.savedStrategyIndexSteps(d); //// Open Index Steps
            })
          } else {
            //$('#showMatLoaderAccounts').hide();
            that.dataservice.GetStrategyAccount(slid).pipe(first()).subscribe((accList: any) => {
              var checkCurrentAccount = accList.filter((x:any) => x.accountId == d.accountId);
              that.sharedData.showCircleLoader.next(false);
              $('#showMatLoaderAccounts').hide();
              if (checkCurrentAccount.length > 0) {
                that.savedStrategySettingsData = checkCurrentAccount;
                that.updatetaxInfoModal(checkCurrentAccount[0], 'saved');// Update Tax Optimization data
              } else {
                that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
              }
            }, error => {
              this.logger.logError(error, 'GetGicsExList');
              that.sharedData.showCircleLoader.next(false);
              $('#showMatLoaderAccounts').hide();
              that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
              this.savedStrategySettingsData = [];
            });
          }
        });

      }
    }, error => { that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); });
  }
  checkPreviousDataSource: any = [];
  checkPreviousHoldings() {
    var that = this;
    var acc = that.selectedAccList.accountId;
    var GetTradeAccountPortfolio = that.dataservice.GetTradeAccountPortfolio(acc, 0).pipe(first()).subscribe(res => {
      if (this.sharedData.checkServiceError(res)) {
        this.checkPreviousDataSource = [];
        this.logger.logError(res, 'GetTradeAccountPortfolio');
      } else {
        var prevHD: any = res;
        that.checkPreviousDataSource = res; //// Validation for Enable Liquidate menu in account settings.
        if (that.checkPreviousDataSource.length > 0 && that.accPortfolioPosition.length == 0) {
          var ndata = [...prevHD];
          ndata.forEach(function (xu) {
            xu['contractDesc'] = xu['ticker'];
            xu['position'] = xu['noofShares'];
            return xu;
          });
          that.accPortfolioPosition = that.checkPreviousDataSource;
          // that.accountDataSource = new MatTableDataSource(that.checkPreviousDataSource);

        }
      }
    }, error => {
      this.checkPreviousDataSource = [];
      this.logger.logError(error, 'GetTradeAccountPortfolio');
    });
    this.subscriptions.add(GetTradeAccountPortfolio);
  }
  savedDontSell_List: any = [];
  checkSaved_list() {
    var that = this;
    if (that.accPortfolioPosition.length > 0) {
      var assetId = that.accPortfolioPosition[0];
      that.dataservice.GetDNSList(assetId.acctId).pipe(first()).subscribe((data: any) => {
        this.savedDontSell_List = data;
        //console.log('savedDontSell_List', data);
      })
    } else { this.savedDontSell_List = []; }

  }
  items: any[] = [];
  selectedAccountDropdown(val:any, frm:any, accountVan:any, type:any, i:any) {
    var that = this;
    this.items = i
    var accID;
    accID = val;
    that.individual_selectedAcc = accID;
    that.individual_selectedAcc_Dup = accID;
    let sendData = { "val": val, "frm": frm, "Tite": accountVan, "type": type, "ind": i }

    this.clickedFundedData.emit(sendData);
   
  } 
  
  vir_ScrollGrids(i:any){
  

    //const middleIndex = Math.floor(i / 2);
    //this.viewport2.scrollToIndex(middleIndex);
    //console.log(this.getAcc_list_AccountList_Funded,'items')
   
  }
  // getItemHeight(){
  //   const viewportElement: HTMLElement = this.viewport2.elementRef.nativeElement;
  //   const viewportHeight = viewportElement.offsetHeight;
  //   console.log('Viewport Height:', viewportHeight);
  // }
  
  selectedAccountNonfunded(id:any, selAcc:any) {
    var that = this;
    var accID;
    accID = id;
    that.individual_selectedAcc_NF = accID;
    let sendData = { "id": id, "selAcc": selAcc }
    this.clickedNonFundedData.emit(sendData);
  }
  GetAccsTaxlot(accID: any) {
    this.sharedData.taxLotData.next([])
    try {
      this.dataservice.GetAccsTaxlot(accID).pipe(first()).subscribe((Taxlotlist: any[]) => {
        this.sharedData.taxLotData.next(Taxlotlist);
      }, error => { });
    } catch (e) { console.log(e) }
  }
  loadHis(data: any) {
    this.tradesHistoryOption = data;
    if (isNotNullOrUndefined(data) && data.length > 0) { this.tradeHisChanged(data[0]); };
  }
  getAccount() {
    const GetAccount = this.dataservice.GetAccountData(this.selectedAccount).pipe(first()).subscribe((res: any[]) => {
      this.taxTargetvalue(res);
      if (res.length > 0 && isNotNullOrUndefined(res[0]['pauseStatus']) && res[0]['pauseStatus'] == 'Y') { this.pauseTotalTrade = true; }
      else { this.pauseTotalTrade = false; }
    }, error => { });
    this.subscriptions.add(GetAccount);
  }
  tradeHisChanged(val:any) {
    var that = this;
    this.selTradeHisOption = val;
    $('#showMatLoaderAccounts').show();
    var rebId = val.rebalanceId;
    const getRebalance = this.dataservice.GetTradesHistoryHoldings(rebId, this.selectedAccount).pipe(first()).subscribe((accHisReb: any) => {
      if (this.sharedData.checkServiceError(accHisReb)) { this.tradesHistoryData = [];
         $('#showMatLoaderAccounts').hide();
          // this.accountDataSource_History = new MatTableDataSource([]); 
        }
      else {
        if (that.openHisInput) { $('#showMatLoaderAccounts').hide(); }
        this.tradesHistoryData = accHisReb;
        // this.accountDataSource_History = new MatTableDataSource(this.tradesHistoryData);
      }
    }, error => { this.logger.logError(error, 'GetTradesHistoryHoldings'); $('#showMatLoaderAccounts').hide(); this.tradesHistoryData = []; 
    // this.accountDataSource_History = new MatTableDataSource([]);
   });
    //// get rebalance for history Table

    if (isNotNullOrUndefined(val['createdDate'])) {
      this.sharedData.userEventTrack('Accounts', val['createdDate'], this.selectedAccount, 'Account history tab chhanged');
    }

    var getHistoryDetails:any;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    getHistoryDetails = {
      "Userid": userid,
      "tradedUserid": val.createdBy,
      "accountId": val.accountId,
      "notifyId": val.notifyId,
      "rebalanceId": val.rebalanceId,
      "strategyId": val.strategyId
    }

    if (isNotNullOrUndefined(getHistoryDetails) && getHistoryDetails != '') {
      that.dataservice.GetTradesHistoryAccDtls(getHistoryDetails).pipe(first()).subscribe(
        (data:any) => {
          if (data.length > 0) {
            this.tradesHistoryDetails = data;
          } else { this.tradesHistoryDetails = []; }
        },
        (error:any) => { this.logger.logError(error, 'GetTradesHistoryAccDtls'); this.tradesHistoryDetails = []; });
    }
    else {
      this.sharedData.showMatLoader.next(false);
    }
  }
  taxTargetvalue(selAcc:any) {
    let that = this;
    that.acc_taxTargetLong = selAcc[0].longTerm; // Long Term
    that.acc_taxTargetShort = selAcc[0].shortTerm; // Short Term
    //// validation
    that.acc_taxTargetLong_d = selAcc[0].longTerm;
    that.acc_taxTargetShort_d = selAcc[0].shortTerm;
    //// validation
  }
  resetInputFilter() {
    var that = this;
    that.getAcc_list_AccountList = that.getAcc_list_dupAccountList;
    that.getAcc_list_AccountList_Funded = [];
    setTimeout(() => { that.getAcc_list_AccountList_Funded = [...that.getAcc_list_dupAccountList_Funded]; }, 100);
    var that = this;
    if (that.getAcc_list_dupAccountList.length > 0 || that.getAcc_list_dupAccountList_Funded.length > 0) {
      that.getAcc_list_NonFunded = that.getAcc_list_dupAccountList;
      that.getAcc_list_Funded = that.getAcc_list_dupAccountList_Funded;
    }
  }
  public doFilter = (event: KeyboardEvent) => {
    var that = this;
    const value = (event.target as HTMLInputElement).value;
    if (that.show_fundedTab) {
      var filterData = that.getAcc_list_dupAccountList_Funded;
  
      var x = filterData.filter((element:any) => {
        if (isNotNullOrUndefined(element.accountVan)) {
          return element.accountVan.trim().toLocaleLowerCase().indexOf(value.trim().toLocaleLowerCase()) > -1;
        } else { return element.accountVan.trim().toLocaleLowerCase().indexOf(value.trim().toLocaleLowerCase()) > -1; }
      });
      x.forEach((xx:any, i:any) => { return xx.index = i });
      that.getAcc_list_AccountList_Funded = [...x];
    } else {
      var filterData = that.getAcc_list_dupAccountList;

      var x = filterData.filter((element:any) => {
        if (isNotNullOrUndefined(element.accountVan)) {
          return element.accountVan.trim().toLocaleLowerCase().indexOf(value.trim().toLocaleLowerCase()) > -1;
        } else { return element.accountVan.trim().toLocaleLowerCase().indexOf(value.trim().toLocaleLowerCase()) > -1; }
      });
      x.forEach((xx:any, i:any) => { return xx.index = i });
      that.getAcc_list_AccountList = [...x];
    }

  }
  fundedTab() {
  
    var that = this;
    that.avoid_MulClick = true;
    if (!that.show_fundedTab) {
      that.startRefresh_NF = true;
      this.sharedData.show_funded.next(true);
      that.show_fundedTab = true; //// Display right section
      //$(".fundedTab").css("display", "block");
      //$(".nonFundedTab").css("display", "none");
      that.refreshTabName = 'Funded'; //// Avoid multiple click using nonfunded tab
      that.selectedAccount = null;
      if (that.getAcc_list_AccountList_Funded.length > 0 && !this.dashAccFlag) {
        ////// Click default first one
        var framwork = that.getAcc_list_AccountList_Funded[0];
        that.selectedAccountDropdown(framwork.accountId, '', framwork.accountVan, framwork.type, 0);
        ////// Click default first one
        that.show_fundedTab = true;
        setTimeout(function () {
          that.startRefresh_NF = false;
        //  $('#Funded ul li:first').trigger('click');
        //  that.show_fundedTab = true;
      
        }.bind(this), 1000)
      } else { that.avoid_MulClick = false; that.startRefresh_NF = false; }
    } else { that.avoid_MulClick = false; }
  }
  refreshNonfundedTabTrigger() {
    var that = this;
    if (that.refreshTabName != 'Funded') {
      that.myAcclist = that.accountService._GetAccounts;
      that.getAcc_list = that.myAcclist;
      //// Funded Data
      that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x: any) => x.funded == 'Y' && x.enabledforTrading == 'Y');
      that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
      //// Funded Data
      var getAcc_list_AccountList = that.myAcclist['accounts'].filter((x: any) => x.funded != 'Y');// Exclude Funded One
      that.getAcc_list_AccountList = getAcc_list_AccountList;
      that.getAcc_list_dupAccountList = that.getAcc_list_AccountList;
      that.startRefresh_NF = false;
      that.avoid_MulClick = false;
      //// Non Funded Data
      if (getAcc_list_AccountList.length > 0) {
        that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
      } else {
        that.selected_NF_Details = '';
        that.startRefresh_NF = false;
      }
    }
  }
  refreshTabName: string = 'NonFunded';
  refreshNonFundedTab() {
    var that = this;
    that.avoid_MulClick = true;
  
    if (that.refreshTabName === 'Funded') {
      this.sharedData.show_funded.next(false);
      that.startRefresh_NF = true;
      that.nonFundedTab();
      this.refreshaccounts_DB();
      var getED = this.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
        that.refreshTabName = 'NonFunded';//// Avoid multiple click using nonfunded tab
        that.myAcclist = data;
        that.accountService.GetAccounts.next(data);
        ///// Non funded Tab
        setTimeout(() => {
          $('#showMatLoaderAccounts_nonFunded').hide();
          
        }, 200);
        if (!this.show_fundedTab) {
          that.getAcc_list = that.myAcclist;
          //// Funded Data
          that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x:any) => x.funded == 'Y' && x.enabledforTrading == 'Y');
          that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
          //// Funded Data
          var getAcc_list_AccountList = that.myAcclist['accounts'].filter((x:any) => x.funded != 'Y');// Exclude Funded One
          that.getAcc_list_AccountList = getAcc_list_AccountList;
          that.getAcc_list_dupAccountList = that.getAcc_list_AccountList;
          that.startRefresh_NF = false;
          that.avoid_MulClick = false;
          //// Non Funded Data
          if (getAcc_list_AccountList.length > 0) {
            that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
          } else {
            that.selected_NF_Details = '';
            that.startRefresh_NF = false;
          }
        }
      }, error => {
        this.refreshTabName = 'NonFunded';//// Avoid multiple click using nonfunded tab
        that.avoid_MulClick = false;
      })
    } else {
      that.avoid_MulClick = false;
      this.refreshTabName = 'NonFunded';
    }

  }
  refreshaccounts_DB() {
    let that = this;
    var filterCurrent = [];
    $('.refreshBtn_funded span').addClass('rotate');
    var getED = this.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
      that.myAcclist = data;
      that.accountService.GetAccounts.next(data);
      ///// Non funded Tab
      if (!this.show_fundedTab) {
        that.getAcc_list = that.myAcclist;
        //// Funded Data
        that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x:any) => x.funded == 'Y' && x.enabledforTrading == 'Y');
        that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
        var getAcc_list_AccountList = that.myAcclist['accounts'].filter((x:any) => x.funded != 'Y');// Exclude Funded One
        that.getAcc_list_AccountList = getAcc_list_AccountList;
        that.getAcc_list_dupAccountList = that.getAcc_list_AccountList;

        //// Non Funded Data
        if (getAcc_list_AccountList.length > 0) {
          that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
          that.startRefresh_NF = false;
          $('.refreshBtn_funded span').removeClass('rotate');
        } else {
          that.selected_NF_Details = '';
          $('.refreshBtn_funded span').removeClass('rotate');
          ///// If nonfunded tab all the records moved to funded switch tab to funded.
          if (!that.startRefresh_NF) { 
            // $('#funTabActive a').get(0).click(); 
            that.startRefresh_NF = false; }
          else { that.startRefresh_NF = false;  }
        }

      } else {
        that.getAcc_list = that.myAcclist;
        //// Funded Data
        that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x:any) => x.funded == 'Y' && x.enabledforTrading == 'Y');
        that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
        that.startRefresh_NF = false;
       
        //// Funded Data
      }
    });
  }
  openAccOverview(item:any) {
    var accountId = item.id;
    this.showAccOverview = true;
    this.sharedData.userEventTrack('Accounts', 'View Account', accountId, 'center grid view click');
  }
  nonFundedTab() {
    var that = this;
    that.show_fundedTab = false;//// Display right section

    this.sharedData.openAccOverviewActiveId.next('');
  }


  getAccounts(data:any) {
    var that = this;
    this.sharedData.showCircleLoader.next(true);
    that.accountService.GetAccounts.next(data);
    if (isNotNullOrUndefined(data)) {
      that.myAcclist = data;
      that.getAcc_list = that.myAcclist;

      that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x:any) => x.funded == 'Y');
      that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
      var getAcc_list_AccountList = that.myAcclist['accounts'].filter((x:any) => x.funded != 'Y');
      that.getAcc_list_AccountList = getAcc_list_AccountList;
      that.getAcc_list_dupAccountList = that.getAcc_list_AccountList;


      var checkshared = that.sharedData.openAccOverviewId.value;
      if (checkshared != '') {
        that.dashAccFlag = true;
        setTimeout(function () {
          $('#funTabActive a').get(0).click();
          that.fundedTab();
          that.sharedData.showMatLoader.next(false);
          $('#showMatLoaderAccounts').hide();
          that.sharedData.showCircleLoader.next(false);
          $('#showMatLoaderAccounts_nonFunded').hide();
          that.openAccOverview(checkshared);
        }.bind(this), 1500);

      } else {
        if (that.getAcc_list_AccountList.length > 0) {
          try {
            that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
            setTimeout(function () {
              $('#SpinLoader-modal-acc').css('display', 'none');
              $('#account_comp').css('visibility', 'visible');
              that.sharedData.show_funded.next(false);
            }, 300)
          } catch (e) { console.log(e) }
        }
        else {
          that.getAcc_list_AccountList = [];
          that.dashAccFlag = false;
          setTimeout(function () {
            $('#funTabActive a').get(0).click();
            that.fundedTab();
            that.sharedData.showMatLoader.next(false);
            $('#showMatLoaderAccounts').hide();
            that.sharedData.showCircleLoader.next(false);
            $('#showMatLoaderAccounts_nonFunded').hide();
          }.bind(this), 1500);
        }
      }
      that.lastRefrestDate = new Date();
    } else {
      that.dataLoaded = false;
      $('#SpinLoader-modal-acc').css('display', 'none');
      $('#account_comp').css('visibility', 'visible');
      this.sharedData.showCircleLoader.next(false);
    }



  }
}
