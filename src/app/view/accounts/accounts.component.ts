import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { SharedDataService,isNotNullOrUndefined,isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { AccountService } from '../../core/services/moduleService/account.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, first } from 'rxjs';
import { DataService } from '../../core/services/data/data.service';
import * as Highcharts from 'highcharts/highstock';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '../../core/services/logger/logger.service';
declare var $: any;
import * as d3 from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { dontSellComponent } from './dont-sell/dont-sell';
import { restrictedListComponent } from '../restrictedList/restrictedList';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import { MatSort, Sort } from '@angular/material/sort';
// @ts-ignore
import { saveAs } from "file-saver";
import { IndexstepsModalComponent } from './indexsteps-modal/indexsteps-modal.component';
import { IndexfactsheetModalComponent } from './indexfactsheet-modal/indexfactsheet-modal.component';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TradeOpenComponent } from '../trade-open/trade-open.component';
import { DialogControllerService } from '../../core/services/dialogContoller/dialog-controller.service';
import { DontbuyComponent } from './dontbuy/dontbuy.component';
import { Router } from '@angular/router';
import { AccountDirectTradeComponent } from './direct-trade/direct-trade';
import { DragDropComponent } from './direct-trade/drag-drop/drag-drop.component';
interface ExampleFlatNode1 {
  expandable: boolean;
  assetSubSubTypeDescription: string;
  Ticker: string;
  Position: number;
  Market_Value: number;
  assetTypeDescription: string;
  level: number;
}
interface FoodNode {
  assetSubSubTypeDescription: string;
  Ticker?: string;
  Position?: number;
  Market_Value?: number;
  assetTypeDescription?: string;
  children?: FoodNode1[];
}
interface FoodNode1 {
  assetSubSubTypeDescription: string;
  Ticker: string;
  Position?: number;
  Market_Value?: number;
  assetTypeDescription: string;
  children?: FoodNode1[];
}
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})

export class AccountsComponent implements OnInit, OnDestroy {
  @ViewChild('viewport1') viewport1: CdkVirtualScrollViewport | any;
  @ViewChild(MatSort) sort: MatSort | any;
  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      Ticker: node.Ticker,
      Position: node.Position,
      Market_Value: node.Market_Value,
      assetTypeDescription: node.assetTypeDescription,
      assetSubSubTypeDescription: node.assetSubSubTypeDescription,
      level: level,
    };
  }
  treeControl:any = new FlatTreeControl<ExampleFlatNode1>(
    (node) => node.level,
    (node) => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );
  dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  constructor(public sharedData: SharedDataService, public accountService: AccountService, private dataservice: DataService, private toastr: ToastrService, private logger: LoggerService, public dialog: MatDialog,  private dialogController: DialogControllerService, public cusIndexService: CustomIndexService, public datepipe: DatePipe, private zone: NgZone, private router: Router) {
    this.accTargetSettings();
 
  }
  accountTitleForm: FormGroup = new FormGroup({
    acctTitle: new FormControl('', [Validators.required, Validators.min(15), Validators.pattern(/^[_a-zA-Z0-9&,.\s'-]*$/)])
  })
  showMatLoaderAccountsRight: boolean = false;
  submitted = false;
  show_tab_content: boolean = false;
  selected_NF_Details: any;
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
  tradesAllocationHistoryData: any = [];
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
  defaultMarketCurrency: any = '';
  showDelay = new FormControl(100);
  hideDelay = new FormControl(100);
  GetAccountConfigSettings: any = [];
  bufferTargetData: any = [];
  showPositions: boolean = true;
  cashTargetMiMx = { min: 2, max: 99 };
  cashTarget: any = [];
  indexConstructionT: any;
  indexRulesData: any = [];
  factIndexStepGrp: any = [];
  factorsGrp: any = [];
  index_const_calcu: number = 0;
  indexRulesDataRange_W: any;
  indexrulesCmpy: any = [];
  indexrulesGICS: any = [];
  indexrulesCategory: any = [];
  index_const_weight: string = "-";
  index_const_tax: string = "-";
  index_const_select: string = "-";
  ratingIndexnumber: any = 0;
  accPauseCon: string = "";
  showMatLoader: boolean = false;
  taxTargetValid: boolean = false;
  shortTaxRateValid: boolean = false;
  longTaxRateValid: boolean = false;
  OpenCR_NextPage: string = 'showCashRaise';
  pershPortFolioPosition_NF: any = [];
  public accountDataSourceHeader = ['Instrument', 'Position', 'Last', 'Change', 'Market Value ($)', 'Daily P&L ($)'];
  public accountDataSourceHeader_UnrealizedPL = ['Instrument', 'Position', 'Last', 'Market Value ($)', 'Unrealized P&L ($)'];
  public accountDataSourceHeader_RealizedPL = ['Security Identifier', 'Opening Date', 'Closing Date', 'Quantity', 'Cost Basis', 'Proceeds', 'Realized P&L ($)', 'Term'];
  public accountDataSourceHeader_NF = ['assetSubSubTypeDescription', 'Ticker', 'Position', 'Market_Value', 'assetTypeDescription'];
  public accountHistoryDataSourceHeader = ['Date of trade', 'Ticker', 'Price ($)', 'Quantity', 'Value'];
  accountDataSource: MatTableDataSource<any> | any;
  accountDataSource_History: MatTableDataSource<any> | any;
  accountDataSource_HistoryAllocation: MatTableDataSource<any> | any;
  PershingaccountDataSource: MatTableDataSource<any> | any;
  PershingaccountDataSource_NF: MatTableDataSource<any> | any;
  PershingaccountUnrealizedDataSource: MatTableDataSource<any> | any;
  PershingaccountrealizedDataSource: MatTableDataSource<any> | any;
  public displayedColumns = ['Name', 'Account', 'Strategy', 'Account Value ($)', 'Daily P&L ($)', 'Unrealized P&L ($)', ' '];
  public displayedColumns_UnrealizedPL = ['Name', 'Account', 'Strategy', 'Account Value ($)', 'Daily P&L ($)', , 'Unrealized P&L ($)', ' '];
  PershingUnrealizedGL: any = [];
  dataSource: MatTableDataSource<any> | any;
  sortedData:any;
  gainList = ['Gain', 'Loss'];
  unRealizedTabLoader: boolean =  false;
  realizedTabLoader: boolean = false;
  activeLeftGrid: any = { funded: null, nonfunded: null, openDefaultFundedTab: false };
  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  ngOnInit(){
  
    var that = this;
    this.sharedData.openUniverseMenu.next(false);
    that.sharedData.showCircleLoader.next(true);
    that.sharedData.show_funded.subscribe((x: any) => {
      that.show_tab_content = x;
    });
   
    var GetSubAccounts = that.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
      that.accountService.GetAccounts.next(data);
      that.getAccounts(data);
 
      setTimeout(function () {
        that.sharedData.showCircleLoader.next(false);
      }.bind(this), 400);
    }, error => {
      that.getAccounts(undefined);
    });
    var GetAccount = this.accountService.GetAccounts.subscribe(data => { that.myAcclist = data; });
    this.subscriptions.add(GetAccount);
    this.subscriptions.add(GetSubAccounts);
    var triAccTrade = that.sharedData.triAccTrade.subscribe(res => {
       /** refresh after cash rise **/
      if (res) {
        this.showMatLoaderAccountsRight = true;
        //$('#showMatLoaderAccounts').show();
        that.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
         // that.accountService.GetAccounts.next(data);
          that.myAcclist = data;
          setTimeout(() => { that.refreshInd_accounts(true); },10)
        }, error => { this.showMatLoaderAccountsRight = false; });
        this.sharedData.triAccTrade.next(false);
      }
      /** refresh after cash rise **/
    });

    this.subscriptions.add(triAccTrade);
    this.sharedData.GetlatestBMComp();

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(5); };
    });
    that.subscriptions.add(unSubUTRPData);
  }

  numberValue: string = '';
  onInputChange(event: any) {
    const inputValue = event.target.value;
      // Remove all non-digit characters except for .
    const cleanValue = inputValue.replace(/[^0-9.]/g, '');

    // Split the value into integer and decimal parts (if any)
    const [integerPart, decimalPart] = cleanValue.split('.');

    // Format the integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine the formatted integer part with the decimal part (if any)
    this.numberValue = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }
  nonFundChange(event:any, type:any) {
    if (type == 'F') { this.nonFundClicked = "Funded"; }
    else {
      this.nonFundClicked = "Non Funded";
      if (this.nonFundCheckbox) { $('#myAccount_RemoveTrade').modal('show'); }
      else { this.nonFundCheckbox = false; };
    }
  }
  pershPortFolio_NF_Table: boolean = false;
  nonFundMatChange(event:any) {
    if (!this.pershPortFolio_NF_Table) {
      if (event.checked) { $('#myAccount_EnableTrade').modal('show'); } else { this.nonFundCheckbox = false; }
    }
  }
  pershPortFolioCategory_NF: any = [];
  pershPortFolioPosition_NF_Cat: FoodNode[] = [];
  checkNF_persing: boolean = false;
  selectedAccountPers_NF(id:any, selAcc:any) {
    var that = this;
    var Tite = selAcc.accountVan;
    var accID = selAcc.id;
    that.pershPortFolioPosition_NF = [];
    that.pershPortFolioPosition_NF_Cat = [];
    this.pershPortFolioCategory_NF = [];
    that.PershingaccountDataSource_NF = new MatTableDataSource([]);
    var accountData = { "accountIdentifier": Tite };
    this.checkNF_persing = false;
    this.pershPortFolio_NF_Table = false;
    if (selAcc.type == 'P') {
      this.checkNF_persing = true;
      const getpershingAcc = this.dataservice.PostPershingAccountDetails(accountData).pipe(first()).subscribe((pershAccList: any) => {
        let obj = { 'Account': that.myAcclist, 'acclist': pershAccList, 'accID': accID }

        //that.sharedData.selectedAccountCompanyList.next(obj)
        //that.selectedAccList = that.myAcclist['accounts'].filter(x => { return x.accountId == accID })[0];
        that.pershPortFolioPosition_NF = pershAccList['FilteredHoldings'];
        that.PershingaccountDataSource_NF = new MatTableDataSource(that.pershPortFolioPosition_NF);
        var treeData:any = [];
        that.pershPortFolioPosition_NF.forEach((obj:any) => {
          const pos = obj.Position;
          const obj1 = { assetSubSubTypeDescription: obj.assetSubSubTypeDescription, Ticker: obj.Instrument, Position: obj.Position, Market_Value: obj.Market_Value, assetTypeDescription: obj.assetTypeDescription };
          treeData.push(obj1);
        });
        // Step 1: Get all unique categories
        const allCategories = [...new Set(treeData.map((product:any) => product.assetSubSubTypeDescription))];
        //// Check COMMON STOCK to enable factsheet
        var filterCat_NF = [...allCategories].filter(x => (x != 'COMMON STOCK' && x != 'MONEY MARKET FUND'));
        if (filterCat_NF.length > 0) {
          this.pershPortFolioCategory_NF = [];
          this.pershPortFolio_NF_Table = true; // Show Table
        } else {
          this.pershPortFolioCategory_NF = filterCat_NF;
          this.pershPortFolio_NF_Table = false; // hide Table
        }
        //// Check COMMON STOCK to enable factsheet
        // Step 2: Create an array of objects with distinct categories
        //var filterCat = [...category].filter(x => (x != 'COMMON STOCK' && x != 'MONEY MARKET FUND'));
        const distinctCategories = filterCat_NF.map((category:any) => {
          return {
            assetSubSubTypeDescription: category,
            children: treeData.filter((product:any) => product.assetSubSubTypeDescription === category)
          };

        });
        that.pershPortFolioPosition_NF_Cat = distinctCategories;
        this.dataSourceTree.data = that.pershPortFolioPosition_NF_Cat;
        this.expandAll_tree();
        $('#showMatLoaderAccounts_nonFunded').hide();

      }, error => {
        this.checkNF_persing = false;
        this.pershPortFolioCategory_NF = [];
        this.pershPortFolioPosition_NF = [];
        that.PershingaccountDataSource_NF = new MatTableDataSource([]);
        //$('#showMatLoaderAccounts').hide();
        this.showMatLoaderAccountsRight = false;
        $('#showMatLoaderAccounts_nonFunded').hide();
        that.showSpinnerAcc_list = false;
        $('#SpinLoader-modal-acc').css('display', 'none');
        $('#account_comp').css('visibility', 'visible');
        that.sharedData.showCircleLoader.next(false);
        $('.refresh span').removeClass('rotate');
        setTimeout(function () {
          that.sharedData.showMatLoader.next(false);
        }.bind(this), 500);

      });
    } else { $('#showMatLoaderAccounts_nonFunded').hide(); }
  }
  expandAll_tree(): void {
    this.treeControl.expandAll();
  }
  uncheckCheckbox() {
    this.nonFundCheckbox = false;
  }
  checkCheckbox() {
    this.nonFundCheckbox = true;
    this.PostFundedET('Y', 'Y');
  }
  PostFundedET(enabled:any, funded:any) {
    var that = this;
    var accId = this.individual_selectedAcc_NF;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { "accountId": accId, "userid": userid, "enableTrading": enabled, "funded": funded };
    that.dataservice.PostFundedET(data).pipe(first()).subscribe(data => {
      that.toastr.success('Enabled successfully', '', { timeOut: 4000 });
      setTimeout(function () { 
        $('#nonFundedRefresh').trigger('click');
        that.refreshaccounts_DB(); 
      }.bind(this), 300)
    }, error => { this.logger.logError(error, 'PostFundedET'); });
  }
  trackTabClick(tab: string) { this.sharedData.userEventTrack('Accounts', tab, this.selectedAccount, 'Account view tab click'); }
  startRefresh: boolean = false;
  item: number | any;
  refreshInd_accounts(initRef: boolean = false) {
    var that = this;
    if (initRef) { that.startRefresh = false; } else { that.startRefresh = true; }
    that.sharedData.showCircleLoader.next(false);
    $('.refresh span').addClass('rotate');
    //console.log(this.selectedAccList.accountVan, that.individual_selectedAcc);
    that.selectedAccountVan = this.selectedAccList.accountVan;
    that.selectedAccountDropdown(that.individual_selectedAcc, 'view', that.selectedAccountVan, this.SelectedAccountType, '');
  }
  compare(a:any, b:any, isAsc:any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  assetDes_ModalOpen(port:any) { this.pershAssetDes = port; }
  onSortHistory(sort:any) {
    const data = this.accountDataSource_History.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Date of trade': { return this.compare(a.dateofTrade, b.dateofTrade, isAsc); }
        case 'Ticker': { return this.compare(a.ticker, b.ticker, isAsc); }
        case 'Price ($)': return this.compare(a.price, b.price, isAsc);
        case 'Quantity': return this.compare(a.quantity, b.quantity, isAsc);
        default: return 0;
      }
    });
    this.accountDataSource_History.data = this.sortedData;
  }
  onSortDataPersh(sort:any) {
    if (this.showPositions) {
      const data = this.PershingaccountDataSource.data.slice();
      if (!sort.active || sort.direction == '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a:any, b:any) => {
        let isAsc = sort.direction == 'asc';
        switch (sort.active) {
          case 'Instrument': { return this.compare(a.Instrument != null ? a.Instrument : a.exchangeCode, b.Instrument != null ? b.Instrument : b.exchangeCode, isAsc); }
          case 'Position': return this.compare(a.Position, b.Position, isAsc);
          case 'Last': return this.compare(a.last, b.last, isAsc);
          case 'Change': return this.compare(a.Change, b.Change, isAsc);
          case 'Market Value ($)': return this.compare(a.Market_Value, b.Market_Value, isAsc);
          case 'Daily P&L ($)': return this.compare(a.Daily_PL, b.Daily_PL, isAsc);
          default: return 0;
        }
      });
      this.PershingaccountDataSource.data = this.sortedData;
    }
    else {
      const data = this.PershingaccountUnrealizedDataSource.data.slice();
      if (!sort.active || sort.direction == '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a:any, b:any) => {
        let isAsc = sort.direction == 'asc';
        switch (sort.active) {
          case 'Instrument': { return this.compare(a.Instrument != null ? a.Instrument : a.exchangeCode, b.Instrument != null ? b.Instrument : b.exchangeCode, isAsc); }
          case 'Position': return this.compare(a.Position, b.Position, isAsc);
          case 'Last': return this.compare(a.last, b.last, isAsc);
          case 'Change': return this.compare(a.Change, b.Change, isAsc);
          case 'Market Value ($)': return this.compare(a.Market_Value, b.Market_Value, isAsc);
          case 'Unrealized P&L ($)': return this.compare(a.Unrealized_PL, b.Unrealized_PL, isAsc);
          default: return 0;
        }
      });
      this.PershingaccountUnrealizedDataSource.data = this.sortedData;
    }

  }
  onSortDataPershRealized(sort:any) {
    const data = this.PershingaccountrealizedDataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Security Identifier': return this.compare(a.SecurityIdentifier, b.SecurityIdentifier, isAsc);
        case 'Opening Date': return this.compare(a.OpeningDate, b.OpeningDate, isAsc);
        case 'Closing Date': return this.compare(a.ClosingDate, b.ClosingDate, isAsc);
        case 'Quantity': return this.compare(a.Quantity, b.Quantity, isAsc);
        case 'Cost Basis': return this.compare(a.CostBasis, b.CostBasis, isAsc);
        case 'Proceeds': return this.compare(a.Proceeds, b.Proceeds, isAsc);
        case 'Realized P&L ($)': return this.compare(a.GainLoss, b.GainLoss, isAsc);
        case 'Term': return this.compare(a.Term, b.Term, isAsc);
        default: return 0;
      }
    });
    this.PershingaccountrealizedDataSource.data = this.sortedData;
  }
  removeCommaWithNum(x:any) {
    var str = x.toString();
    str = str.replace(/\,/g, '');
    return str;
  }
  checkTaxRate() {

    if (this.acc_taxTargetLong <= 100 && this.acc_taxTargetLong >= 0 && this.acc_taxTargetLong != null) {
      this.longTaxRateValid = false;
    } else {
      this.longTaxRateValid = true;
    }
    if (this.acc_taxTargetShort <= 100 && this.acc_taxTargetShort >= 0 && this.acc_taxTargetShort != null) { this.shortTaxRateValid = false; } else { this.shortTaxRateValid = true; }
  }
  updateAccTaxinfo() {
    var that = this;
    var getcurrent_accId = that.selectedAccList.accountId;
    var getcurrent_slid = 0;
    $('#taxOptDisclosure').modal('show');
    this.sharedData.showMatLoader.next(true);
    var accountData = [];
    var checkgain: string = "";
    if (isNullOrUndefined(that.currentSettingsList.taxType) ||
      that.currentSettingsList.taxType == '' ||
      that.currentSettingsList.taxType == 'L') { checkgain = "Loss" }
    else { checkgain = "Gain" }
    var gains;
    if (that.gains == "Gain") { gains = "G" } else { gains = "L" }
    var taxTarget = parseFloat(that.removeCommaWithNum(that.acc_taxTarget));
    var cashTarget = that.acc_cashTarget;
    var bufferTarget = parseFloat(that.removeCommaWithNum(that.acc_bufferTarget));

    var marketValue = this.getsummary_dup('availablefunds');
    var per1 = d3.scaleLinear().domain([0, 100]).range([0, marketValue]);
    var maxval = marketValue;
    if (this.gains == 'Loss') { maxval = per1(this.GetAccountConfigSettings[0].dtaxTarget); }
    if (taxTarget > maxval) { this.taxTargetValid = true; } else { this.taxTargetValid = false; };
    this.checkTaxRate();
    var checkFrom = 'Accounts';
    if (taxTarget != that.acc_taxTarget_d || bufferTarget != that.acc_bufferTarget_d || checkgain != that.gains) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accData;
      if (that.savedStrategySettingsData.length > 0) {
        getcurrent_slid = that.savedStrategySettingsData[0].slid;
        checkFrom = 'saved';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "slid": getcurrent_slid,
          "taxType": gains,
          "taxTarget": taxTarget,
          "taxBufferGainTarget": bufferTarget
        }
      } else {
        checkFrom = 'Accounts';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "taxType": gains,
          "taxTarget": taxTarget,
          "taxBufferGainTarget": bufferTarget
        }
      }

      accountData.push(accData);
    }
    if (accountData.length > 0 && !this.taxTargetValid && !this.longTaxRateValid && !this.shortTaxRateValid) {
      this.postAccountSettings(accountData, checkFrom);
    }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 35), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }
  postAccountSettings(data:any, from:any) {
    var that = this;
    if (from == 'saved') {
      that.dataservice.PostStrategyAccountSettingsSA(data).pipe(first()).subscribe(
        data => {
          if (data[0].toLowerCase().indexOf('locked') > -1) {
            $('#API_lockmodal').modal('show');
          } else {
            this.toastr.success(this.sharedData.checkMyAppMessage(5, 45), '', { timeOut: 5000, progressBar: false, });
            that.refreshaccounts_DB();
          }
          this.sharedData.showMatLoader.next(false);
        },
        error => { this.logger.logError(error, 'PostAccountSettingsData'); this.sharedData.showMatLoader.next(false); });
    } else {
      that.dataservice.PostStrategyAccountSettings(data).pipe(first()).subscribe(
        data => {
          if (data[0].toLowerCase().indexOf('locked') > -1) {
            $('#API_lockmodal').modal('show');
          } else {

            this.toastr.success(this.sharedData.checkMyAppMessage(5, 45), '', { timeOut: 5000, progressBar: false, });
            that.refreshaccounts_DB();
          }
          this.sharedData.showMatLoader.next(false);
        },
        error => { this.logger.logError(error, 'PostAccountSettingsData'); this.sharedData.showMatLoader.next(false); });
    }
  }
  validateNumber(event: KeyboardEvent): boolean {
    const regex = /^[0-9.]+$/;
    var allowed = ["ArrowLeft", "ArrowRight", "Backspace"];
    if (!regex.test(event.key) && !allowed.includes(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  accsettinsButtonDisable() {
    var that = this;
    var checkgain: string = "";
    if (this.taxTargetValid) { return true; }
    else if (isNotNullOrUndefined(that.currentSettingsList)) {
      if (that.currentSettingsList.taxType == '' || that.currentSettingsList.taxType == 'L') { checkgain = "Loss" }
      else { checkgain = "Gain" }
      if (that.removeCommaWithNum(that.acc_taxTarget) == that.acc_taxTarget_d &&
        that.removeCommaWithNum(that.acc_bufferTarget) == that.acc_bufferTarget_d &&
        checkgain == that.gains) { return true }
      else { return false; }
    } else { return true; }
  }
  downloadPortfolioRealized() {
    var that = this;
    var tblData = [];
    var mergeCountTable:any[] = [];
    this.sharedData.userEventTrack('Accounts', 'Account realized download', this.selectedAccount, 'Account realized download click');
    this.PershingaccountrealizedDataSource.data.forEach((d:any) => {
      tblData.push([d.SecurityIdentifier, d.OpeningDate == "0001-01-01T00:00:00" ? 'Multiple' : this.sharedData.dateFormatMMDDYYYY(d.OpeningDate), d.ClosingDate == "0001-01-01T00:00:00" ? 'Multiple' : this.sharedData.dateFormatMMDDYYYY(d.ClosingDate), that.sharedData.numFormatWithComma(d.Quantity), that.sharedData.numFormatWithComma(d.CostBasis), that.sharedData.numFormatWithComma(d.Proceeds),  that.sharedData.numFormatWithComma(d.GainLoss), d.Term,] );
      var countTaxlot = 0;
      this.taxlotRealizedData.forEach((element:any) => {
        if (d.cusip == element.cusip && d.OpeningDate == '0001-01-01T00:00:00') {
          tblData.push([d.SecurityIdentifier, this.sharedData.dateFormatMMDDYYYY(element.OpeningDate), this.sharedData.dateFormatMMDDYYYY(element.ClosingDate), that.sharedData.numFormatWithComma(element.Quantity), that.sharedData.numFormatWithComma(element.CostBasis), that.sharedData.numFormatWithComma(element.Proceeds),  that.sharedData.numFormatWithComma(element.GainLoss), element.Term]);
          countTaxlot++
        }
      });
      mergeCountTable.push(countTaxlot)
    });

    tblData.push(['Total', '', '', '', '', '', that.sharedData.numFormatWithComma(that.pershRealizedGLTotal)]);
    tblData.push(['LongTerm Gain/Loss', '', '', '', '', '', that.sharedData.numFormatWithComma(that.pershRealizedLongTermGainLoss)]);
    tblData.push(['shortTerm Gain/Loss', '', '', '', '', '', that.sharedData.numFormatWithComma(that.pershRealizedShortTermGainLoss)]);
    let rd = new Date();
    var rdate = this.sharedData.formatedates(rd.getMonth() + 1) + '/' + this.sharedData.formatedates(rd.getDate()) + '/' + rd.getFullYear();
    try {
      const new_workbook = new Workbook();
      var name = this.selectedName.replaceAll(' ', '_').replaceAll(',', '_');
      var ws = new_workbook.addWorksheet(name);
      var account = this.myAcclist['accounts'].filter((x:any) => x.accountId == this.selectedAccount);
      if (account.length > 0) {
        var detail = [
          ['Portfolio-Realized'],
          ['Account Name', account[0]['displayName']],
          ['Account', account[0]['accountVan']],
          ['Report Date', (rdate + " (MM/DD/YYYY)")],
          []
        ];
        ws.addRows(detail)
        name = account[0]['accountVan'] + "_" + this.selectedName.replaceAll(' ', '_').replaceAll(',', '_')
      }

      var header = ws.addRow(['Security Identifier', 'Opening Date', 'Closing Date', 'Quantity', 'Cost Basis', 'Proceeds',  'Realized P&L ($)','Term'])
      header.font = { bold: true };
      tblData.forEach((d, i) => { ws.addRow(d).numFmt = '#,##0.00' });
      // expand collapse
      const property: any = ws.properties;
      property.outlineProperties = {
        summaryBelow: false,
        summaryRight: false,
      };
      var iterateLength = mergeCountTable.length;
      var i = 0;
      var rowStart = 7;
      while (i < iterateLength) {
        var rowEnd = rowStart + (mergeCountTable[i] - 1)

        for (let j = rowStart; j <= rowEnd; j++) {
          // console.log(j)
          ws.getRow(j).outlineLevel = 1;
        }
        rowStart = rowEnd + 2;
        i++;

      }
      // expand collapse
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }

      //Disclosures 1
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      ds.addRow([this.sharedData.checkMyAppMessage(5, 50)]).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 1), 10);
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
      //Disclosures 2
      if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
        var ds1 = new_workbook.addWorksheet("Disclosure II");
        ds1.addRow(["Disclosure II"]).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
        var Disclosures: any = [];
        that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
        Disclosures.forEach((du:any) => {
          ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
        });
        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }
      ws.columns.forEach((column: any, colNumber) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 5; // Minimum width 10
      });
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
        saveAs(blob, name + 'RealizedGain/Loss' + '.xlsx');
      });
    } catch (e) { console.log(e) }
  }
  checkMarketValueNull(v:any) {
    if (isNullOrUndefined(v)) { return this.C_AccountDetails_D.accountValue } else { return v; }
  }
  onSortData(sort:any) {
    const data = this.accountDataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Instrument': { return this.compare(a.contractDesc, b.contractDesc, isAsc); }
        case 'Position': return this.compare(a.position, b.position, isAsc);
        default: return 0;
      }
    });
    this.accountDataSource.data = this.sortedData;
  }

  onkeysDown(e: any) {
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode >= 35 && e.keyCode <= 39) || (/[_a-zA-Z0-9&,.\s'-]+$/.test(e.key))) { }
    else if (isNotNullOrUndefined(e.key) && isNotNullOrUndefined(e.target.value) && e.target.value.endsWith(' ') && e.key == " ") { e.preventDefault(); }
    else if (isNotNullOrUndefined(e.key) && isNotNullOrUndefined(e.target.value) && e.target.value.length == 0 && e.key == " ") { e.preventDefault(); }    
    else { e.preventDefault(); }
  };

  restricteSpecial(ev:any) {
    var e: any = ev.target.value
    var text = e.trim();
    if (text.length >= 0)
      this.submitted = true;
    else
      this.submitted = false;
  }
  taxOpt() {
    if (this.pauseTotalTrade) {
      this.accPauseCon = "taxOpt";
      $('#accPauseProcess').modal('show');
    }
    else {
      this.sharedData.showMatLoader.next(true);
      this.accountService.GetDBPershing(this.selectedAccList['accountId']).then(rT => {
        this.sharedData.showMatLoader.next(false);
        $('#AccEditModal').modal('show');
      });
    }
  }
  processACC() {
    this.sharedData.PauseAccUpdate(this.selectedAccount, "N").then((res: any) => {
      this.getAccount();
      this.pauseTotalTrade = false;
      if (this.accPauseCon == "taxOpt") { this.taxOpt(); }
      else if (this.accPauseCon == "dontBuy") { this.dontBuy(); }
      else if (this.accPauseCon == "dontLidt") { this.dontLidt(); }
      else if (this.accPauseCon == "editLidt") { this.editLidt(); }
      else if (this.accPauseCon == "CR" || this.accPauseCon == "LD") { this.checkAcc(this.accPauseCon); }
      else if (this.accPauseCon == "#AccRateEditModal" || this.accPauseCon == "#AccRateEditModal") { $(this.accPauseCon).modal('show'); }
      else { }
      this.accPauseCon = "";
    });
  }
  onSubmit() { if (this.accountTitleForm.valid) { this.PostUpdateAccName(); } }
  PostUpdateAccName() {
    var that = this;
    var getcurrent_accId = that.selectedAccList.accountId;
    this.sharedData.userEventTrack('Accounts', 'Account title', this.selectedAccount, 'Account title changed');
    this.sharedData.showMatLoader.next(true);
    var accountData:any;
    if (this.selectedNameEdit != that.selectedName) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      accountData = {
        "accountId": getcurrent_accId,
        "userid": userid,
        "accname": that.selectedNameEdit
      }
    }
    if (isNotNullOrUndefined(accountData) && accountData != '') {
      that.dataservice.PostUpdateAccName(accountData).pipe(first()).subscribe(
        data => {
          if (data[0].toLowerCase().indexOf('locked') > -1) {
            $('#API_lockmodal').modal('show');
          } else {
            this.toastr.success(this.sharedData.checkMyAppMessage(5, 44), '', { timeOut: 2000, progressBar: false, });
            this.selectedName = this.selectedNameEdit;
            that.refreshaccounts_DB();
          }
          this.sharedData.showMatLoader.next(false);
        },
        error => { this.logger.logError(error, 'Account name update'); });
    }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 40), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }
  hasError3(controlName: string, errorName: string) { return this.accountTitleForm.controls[controlName].hasError(errorName); }
  gainChange(event:any) {
    this.gains = event.value;
    this.acc_taxTarget = 0;
    this.taxTargetValid = false;
  }
  accRef() {
    // this.sharedData.showMatLoader.next(true);
    $('#CashtargetLoader').show();
    $('#CashraiseLoader').show();
    $('#LiquidateLoader').show();
    $('#TaxLoader').show();
    $('.refresh .icon_r').addClass('rotate');
    this.accountService.GetDBPershing(this.selectedAccList['accountId']).then(rT => {
      // this.sharedData.showMatLoader.next(false);
      $('#CashtargetLoader').hide();
      $('#CashraiseLoader').hide();
      $('#LiquidateLoader').hide();
      $('#TaxLoader').hide();
      $('.refresh .icon_r').removeClass('rotate');
    });
  }
  accTargetSettings() {
    var getED = this.dataservice.GetAccountConfigSettings().pipe(first()).subscribe((data: any[]) => {
      this.GetAccountConfigSettings = data;
      this.cashTargetMiMx.min = data[0]['dcashTargetStart'];
      this.cashTargetMiMx.max = data[0]['dcashTargetEnd'];
      if (data.length > 0) {
        this.defaultMarketCurrency = this.GetAccountConfigSettings[0].dMarketCurrency;
        this.bufferTargetData = Array.from({ length: this.GetAccountConfigSettings[0].dtaxbufferEnd + 1 }, (_, i) => i);
        this.cashTarget = Array.from({
          length: this.GetAccountConfigSettings[0].dcashTargetEnd
        }, (_, i) => i + this.GetAccountConfigSettings[0].dcashTargetStart);
      }
    }, error => {
      this.GetAccountConfigSettings = [];
      this.defaultMarketCurrency = '';
    });
  }
  checkDont_Info(val:any) {

    var dup = this.savedDontSell_List.filter((res:any) => res.StockKey == val.stockkey);
    // console.log(val, dup);
    if (dup.length > 0) { return true } else { return false; }
  }
 
  editLidt() {
    var that = this;
    if (this.pauseTotalTrade) {
      this.accPauseCon = "editLidt";
      $('#accPauseProcess').modal('show');
    }
    else {
      this.sharedData.viewPortFolio.next(false);
      this.sharedData.selEestrictedList = { type: "update", data: that.myAcclist['accounts'].filter((x: any) => { return parseInt(x.accountId) == parseInt(this.individual_selectedAcc) })[0] };
      this.dialog.open(restrictedListComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" });
    }
  }
  dontBuy() {
    var that = this;
    if (this.pauseTotalTrade) {
      this.accPauseCon = "dontBuy";
      $('#accPauseProcess').modal('show');
    }
    else {
      this.sharedData.selEestrictedList = { type: "update", data: that.myAcclist['accounts'].filter((x: any) => { return parseInt(x.accountId) == parseInt(this.individual_selectedAcc) })[0] };
      this.dialog.open(DontbuyComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" });
    }
  }
  isPershingLossorGain(value:any) {

    if (value < 0) {
      return false;
    }
    else {
      return true;
    }
  }
  dontLidt() {
    if (this.pauseTotalTrade) {
      this.accPauseCon = "dontLidt";
      $('#accPauseProcess').modal('show');
    }
    else { this.dialog.open(dontSellComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh",
    panelClass:'dontsellpopup',
     }); }
  }
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
    this.taxTargetValid = false;
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
        this.showMatLoaderAccountsRight = false;
        //$('#showMatLoaderAccounts').hide();
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
    that.accountService.tradedStrategyAccount.next(undefined);
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
        that.dataservice.GetTradeAccs(val).pipe(first()).subscribe((data: any) => {

          if (data.length > 0) {
            var d: any = data[0];
            that.dataservice.GetStrategyNotifyId(d.id, d.accountId).pipe(first()).subscribe((nID: any) => {
              if (nID.length > 0) {
                that.tradedNotifyId = nID[0].notifyId;
                that.cloneStrategyData = nID;
                that.alreadyselected_strategy = d; //// Traded Complted strategy
                //console.log('checkTradedAccount', d)
                that.accountService.tradedStrategyAccount.next(d);
                that.getLiquidatedata(d); //// Show filter for CashRise and Liquidate
                that.savedStrategyIndexSteps(d); //// Open Index Steps
              } else { this.showMatLoaderAccountsRight = false; }
            
            })
          } else {
            var d: any = data[0];
            that.dataservice.GetStrategyAccount(slid).pipe(first()).subscribe((accList: any) =>  {
              if (isNotNullOrUndefined(d)) {
                var checkCurrentAccount = accList.filter((x:any) => x.accountId == d.accountId);
                that.sharedData.showCircleLoader.next(false);
                //$('#showMatLoaderAccounts').hide();
                this.showMatLoaderAccountsRight = false;
                if (checkCurrentAccount.length > 0) {
                  that.savedStrategySettingsData = checkCurrentAccount;
                  that.updatetaxInfoModal(checkCurrentAccount[0], 'saved');// Update Tax Optimization data
                } else {
                  that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
                }
              } else {
                //$('#showMatLoaderAccounts').hide();
                this.showMatLoaderAccountsRight = false;
                that.sharedData.showCircleLoader.next(false);
                that.updatetaxInfoModal(that.selectedAccList, 'Accounts');
              }

            }, error => {
              this.logger.logError(error, 'GetGicsExList');
              that.sharedData.showCircleLoader.next(false);
              //$('#showMatLoaderAccounts').hide();
              this.showMatLoaderAccountsRight = false;
              this.savedStrategySettingsData = [];
            });
          }
        });
      }
      else {
        //that.sharedData.showCircleLoader.next(false);
        //that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
        //console.log(val, 'else---- Acc list noData')
        //// New User without saving strategy (No startegy has been saved)
        that.dataservice.GetTradeAccs(val).pipe(first()).pipe(first()).subscribe((data: any) => {
          if (data.length > 0) {
            var d: any = data[0];
            that.dataservice.GetStrategyNotifyId(d.id, d.accountId).pipe(first()).subscribe((nID: any) => {
              that.cloneStrategyData = nID;
              that.tradedNotifyId = nID[0].notifyId;
              that.alreadyselected_strategy = d; //// Traded Complted strategy
              //console.log('checkTradedAccount', d)
              that.accountService.tradedStrategyAccount.next(d);
              that.getLiquidatedata(d); //// Show filter for CashRise and Liquidate
              that.savedStrategyIndexSteps(d); //// Open Index Steps
            })
          } else {
            that.dataservice.GetStrategyAccount(slid).pipe(first()).subscribe((accList: any) => {
              var checkCurrentAccount = accList.filter((x:any) => x.accountId == d.accountId);
              that.sharedData.showCircleLoader.next(false);
              this.showMatLoaderAccountsRight = false;
              //$('#showMatLoaderAccounts').hide();
              if (checkCurrentAccount.length > 0) {
                that.savedStrategySettingsData = checkCurrentAccount;
                that.updatetaxInfoModal(checkCurrentAccount[0], 'saved');// Update Tax Optimization data
              } else {
                that.updatetaxInfoModal(that.selectedAccList, 'Accounts'); //// Update default account based information
              }
            }, error => {
              this.logger.logError(error, 'GetGicsExList');
              that.sharedData.showCircleLoader.next(false);
              this.showMatLoaderAccountsRight = false;
              //$('#showMatLoaderAccounts').hide();
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
          that.accountDataSource = new MatTableDataSource(that.checkPreviousDataSource);

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
  link_target_buffer(type:any) {
    var marketValue = this.getsummary_dup('availablefunds');
    var per1 = d3.scaleLinear().domain([0, 100]).range([0, marketValue]);
    // Max value is market value not above 20%
    var maxval = marketValue;
    if (this.gains == 'Loss') { maxval = per1(this.GetAccountConfigSettings[0].dtaxTarget); }
    if (type == 'T') {
      var val: any = parseFloat((this.acc_taxTarget).toString().split(',').join(""));
      if (isNaN(val)) { this.acc_taxTarget = 0; }
      if (val > maxval) { this.taxTargetValid = true; }
      else { this.taxTargetValid = false; };
    }
  }
  receiveDataFromChildNonFunded(data: any) {
    var that = this;
    var receivedData = data;
    that.selectedAccountNonfunded(receivedData.id, receivedData.selAcc);
  }
  receiveDataFromChildFunded(data: any) {
    var that = this;
    var receivedData = data;
    that.selectedAccountDropdown(receivedData.val, receivedData.frm, receivedData.Tite, receivedData.type, receivedData.i);
  }
  clearIntervalFactProgress: any;
  factsheet_progress = "(0s)";
  showSpinner_factsheet: boolean = true;
  startloader() {
    var that = this;
    clearInterval(that.clearIntervalFactProgress);
    that.factsheet_progress = "(0s)";
    that.showSpinner_factsheet = true;
    that.factsheetProgress();
  }
  factsheetProgress() {
    var that = this;
    var min = 0;
    var sec = 0;
    var seconds = "";
    $('#factsheet_loaderA .div_n_load').text('Implementing filtering and selection');
    that.clearIntervalFactProgress = setInterval(function () {
      var a = new Date();
      if (min == 0) {
        $('#factsheet_loaderA .div_n_load').text('Implementing filtering and selection');
      }
      else if (min > 0) {
        $('#factsheet_loaderA .div_n_load').text('Executing historical rebalances');
      }
      else if (min > 1) {
        $('#factsheet_loaderA .div_n_load').text('Back-testing historical values');
      } else if (min > 2) {
        $('#factsheet_loaderA .div_n_load').text('Producing portfolio characteristics');
      } else if (min > 3) {
        $('#factsheet_loaderA .div_n_load').text('Finalizing composition and performance metrics');
      }
      if (!that.showSpinner_factsheet) {
        that.factsheet_progress = "(0s)";
        clearInterval(that.clearIntervalFactProgress);
      }
      if (min > 0) {
        seconds = min + "m" + " " + sec + "s";
      } else {
        seconds = sec + "s";
      }
      that.factsheet_progress = "(" + seconds + ")";

      sec++;
      if (sec == 60) {
        min++;
        sec = 0;
      }
    }, 1000);
  }
  directTrade() {
    var that = this;
    var marketValue = this.getsummary_dup('availablefunds');
    var availableCash = this.accOverview.cashbalance;
    this.sharedData.userEventTrack('Accounts', 'Direct Trade', this.selectedAccount, 'Account Direct Trade Click');
    this.dialog.open(DragDropComponent, {
      disableClose: true, width: "80%", height: "95%", maxWidth: "1600px", maxHeight: "90vh",
      data: { accMarketValue: marketValue, accAvailableCash: availableCash, currentAccount: this.selectedAccList, notifyId: this.tradedNotifyId, savedStrategySettingsData: this.savedStrategySettingsData }
    })

  }
  clickIndexFactsheet() {
    var that = this;
     that.startloader();
    this.sharedData.userEventTrack('Accounts', 'Factsheet view', this.selectedAccount, 'Account factsheet view click');
   // this.clickData(this.alreadyselected_strategy, this.alreadyselected_strategy, 'CI');
    this.dialog.open(IndexfactsheetModalComponent, { width: "85vw", height: "auto", maxWidth: "85vw", maxHeight: "90vh", data: { savedStrategy: this.alreadyselected_strategy, notifyId: this.tradedNotifyId, savedStrategySettingsData: this.savedStrategySettingsData } })
  }
  taxOptFactSheet: boolean = false;
  clickedList: any;
  clickedListNames: any;
  indexName = "";
  perfName = "";
  checkIndexTab = "";
  modifyDate_for: any = "";
  asOfDate: any;
  YTD: string = '';
  dMyIndexMnthlyHPtradePayload: any;
  GPerETFRList: any;
  GTtrade: any;
  GetETFStrData: any = [];
  taxGainLossData: any = [];
  GBMHPtrade: any;
  bldMyIndexMntHPortfolioData: any = [];
  sectorData:any[] = [];
  performanceETFRList: any = [];
  indSector: any = [];
  indexData: any = [];
  showSpinner_trade: boolean = false;
  PerfData:any = [];
  perfData:any = { years: [], ETFind: {}, Uindex: {}, AUindex: {} };
  clickData(datas:any, item:any, type:any) {
   
    var that = this;
    this.taxOptFactSheet = false;
    that.clickedList = datas;
    if (type == 'DI') {
      this.indexName = this.clickedList.name;
      this.perfName = this.clickedList.basedon;
    }
    else if (isNotNullOrUndefined(that.clickedList.Ticker) && that.clickedList.Ticker != "") {
      this.perfName = this.clickedList.Indexname + ' (' + this.clickedList.Ticker + ')';
      this.indexName = this.clickedList.shortname;
    } else {
      this.perfName = this.clickedList.Indexname;
      this.indexName = this.clickedList.shortname;
    }
    this.checkIndexTab = "";
    that.clickedListNames = item;
    that.modifyDate_for = new Date();
    var d = new Date();
    var assetid:any;
    var indexId = 123;
    var userid = datas.userid;
    var tenYrFlag = 1;
    var re = [...this.sharedData.ETFIndex.value].filter((x:any)=>{
   
    })
    assetid = datas.assetId;
    var getETFIndex = [...this.sharedData.ETFIndex.value].filter(x => x.assetId == datas.assetId);
   
    if (type == 'DI') {
      this.checkIndexTab = 'DI';
      tenYrFlag = 1;
      if (isNotNullOrUndefined(datas.AUserid)) { userid = datas.AUserid; } else { userid = datas.userid; }
      if (getETFIndex.length > 0) {
        d = new Date(getETFIndex[0]['holdingsdate']);
      } else {
        var index:any = this.cusIndexService.myIndEqindex.filter((x:any) => x.assetId == datas.assetId);
        if (index.length > 0) { indexId = this.sharedData.getIndexId({ indexType: "Equity Universe", name: index[0].name }); };
        d = new Date(this.sharedData.equityHoldDate);
      }
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      assetid = datas.assetId;
    } else if (getETFIndex.length > 0) {
      d = new Date(getETFIndex[0]['holdingsdate']);
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      
    } else {
      var indName = datas.Indexname;
      if (datas.Indexname.toLowerCase().indexOf('growth') > -1) { indName = "S&P 500 Growth" }
      else if (datas.Indexname.toLowerCase().indexOf('value') > -1) { indName = "S&P 500 Value" }
      var index:any = this.cusIndexService.myIndEqindex.filter((x:any) => x.name.toLowerCase() == indName.toLowerCase());
      if (index.length > 0) { assetid = index[0].assetId; }
      d = new Date(this.sharedData.equityHoldDate);
      that.asOfDate = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();
      that.YTD = "(12/31/" + (d.getFullYear() - 1) + " - " + that.asOfDate + ")";
      indexId = this.sharedData.getIndexId({ indexType: "Equity Universe", name: indName });
    }
    var date = d.getFullYear() + '-' + that.formatedates(d.getMonth() + 1) + '-' + that.formatedates(d.getDate());
    let actuserid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = {
      "assetid": assetid,
      "userid": actuserid,
      "actuserid": datas.userid,
      "strategyId": datas.id,
      "enddate": date,
      "tenYrFlag": tenYrFlag,
      "indexId": indexId,
      "freqflag": that.sharedData.defaultRebalanceType,
      "notifyid": this.tradedNotifyId,
      "accountId": datas.accountId,
    }

    this.dMyIndexMnthlyHPtradePayload = data;
    try {
      try { this.GTtrade.unsubscribe(); } catch (e) { }
      this.GTtrade = this.dataservice.GetTaxharvestSavedCITAccskub(data).pipe(first()).subscribe((res: any) => {
        
        if (this.sharedData.checkServiceError(res)) {
          $('#myCustomIndErrorModal_review').modal('show');
          this.logger.logError(res, 'GetTaxharvesttrade');

        } else {
          that.GetETFStrData = res;
          try {
            if (res.length == 0 || isNullOrUndefined(res[0]['annualPnlList'])) { that.taxGainLossData = []; }
            else {
              that.taxGainLossData = res[0]['annualPnlList'].map((a:any) => ({ ...a }))
                .sort(function (x:any, y:any) { return d3.descending(x.year, y.year); });
            }
          } catch (e) { }
          var checktaxeff: boolean = false;
          if (isNotNullOrUndefined(that.clickedList['taxEffAwareness']) && that.clickedList['taxEffAwareness'] == "Y") { checktaxeff = true; }
          if (res.length > 2 && checktaxeff) { that.taxOptFactSheet = true; }
          try {
            that.formatPerfData(res);
            that.formatCharDataFact([...res][0]['graphvalues']);
            this.ETFIndexChart(that.clickedList);
          } catch (e) { }
          that.closecommon_progress();
          try { this.GBMHPtrade.unsubscribe(); } catch (e) { }
          this.GBMHPtrade = this.dataservice.GetBuildMyIndexMnthlyHPSavedCITAccskub(data).pipe(first()).subscribe((res: any) => {
          
            if (this.sharedData.checkServiceError(res)) {
              $('#myCustomIndErrorModal_review').modal('show');
              that.closecommon_progress();
              this.logger.logError(res, 'GetBuildMyIndexMnthlyHPtrade');
            } else {
              that.bldMyIndexMntHPortfolioData = res;
              var dta: any = res;
              if (this.checkIndexTab == "DI" && this.sharedData.checkMenuPer(12, 187) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
              else if (this.sharedData.checkMenuPer(3, 163) == 'Y') { that.bldMyIndexMntHPortfolioData = [...res].slice(0, 10); }
              var data:any[] = []
              dta.forEach((x:any) => {
                var newObj = Object.assign({}, x);
                if (isNotNullOrUndefined(x.Weight)) { newObj.Wt = x.Weight * 100; }
                else { newObj.Wt = x.weight * 100; }
                newObj['newSec'] = x.sector;
                data.push(newObj)
              });

              data = data.map(a => ({ ...a }));
              that.sectorData = this.createSector([...data])
              setTimeout(function () {
                that.barChart();
                that.closecommon_progress();
              }.bind(this), 1000);
            }
          }, error => {
            this.logger.logError(error, 'GetBuildMyIndexMnthlyHPtrade');
            that.toastr.info('Data not available', '', { timeOut: 5000 });
            that.closecommon_progress();
          });

          var data1 = {
            'strSector': [],
            'strStockkey': [],
            'assetid': assetid,
            'indexId': indexId,
            'range': 100,
            "strExStockkey": [],
            'tenYrFlag': 1,
            'enddate': date,
            "rating": '',
            "category": [],
            "taxflag": 'Y'
          };
          try { this.GPerETFRList.unsubscribe(); } catch (e) { }
          this.GPerETFRList = this.dataservice.GetPerformanceETFRList(data1).pipe(first()).subscribe(GetPerformanceETFRList => {
            if (this.sharedData.checkServiceError(GetPerformanceETFRList)) {
              $('#myCustomIndErrorModal_review').modal('show');
              this.logger.logError(GetPerformanceETFRList, 'GetPerformanceETFRList');
              that.closecommon_progress();
            } else {
              var data: any = GetPerformanceETFRList;
              if (isNotNullOrUndefined(GetPerformanceETFRList)) {
                this.performanceETFRList = data;
                that.closecommon_progress();
              }
            }
          }, error => {
            that.toastr.info('Data not available', '', { timeOut: 5000 });
            this.logger.logError(error, 'GetPerformanceETFRList');
            that.closecommon_progress();
          });
        }
      }, error => {
        this.logger.logError(error, 'GetTaxharvesttrade');
        $('#myCustomIndErrorModal_review').modal('show');
        that.closecommon_progress();
      });
      this.subscriptions.add(this.GTtrade);
    } catch (e) {
      that.toastr.info('Data not available', '', { timeOut: 5000 });
      that.closecommon_progress();
    }
  }
  formatPerfData(Data:any) {
    var that = this;
    if (Data.length > 0) {
      var dta = Data[0]['etfPerformanceYears'];
      var dta1 = Data[1]['etfPerformanceYears'];
      var ETFind:any = {};
      var Uindex:any = {};
      var AUindex:any = {};
      this.perfData.years = [...new Set(dta.map((x:any) => x.year))].sort(function (x: any, y: any) { return d3.descending(x, y); });
      this.perfData.years.forEach((d:any) => {
        var ETF = dta1.filter((x:any) => x.type == "ETF" && x.year == d);
        ETFind[d] = ETF[0]['yearReturns'];
        var Uind = dta.filter((x:any) => x.type == "Uindex" && x.year == d);
        Uindex[d] = Uind[0]['yearReturns'];
        if (that.taxOptFactSheet) {
          var Uind1 = Data[2]['etfPerformanceYears'].filter((x:any) => x.type == "Uindex" && x.year == d);
          AUindex[d] = Uind1[0]['yearReturns'];
        }
      });
      this.perfData.ETFind = ETFind;
      this.perfData.Uindex = Uindex;
      this.perfData.AUindex = AUindex;
    }
    else {
      this.perfData.years = [];
      this.perfData.ETFind = {};
      this.perfData.Uindex = {};
      this.perfData.AUindex = {};
    }
  }
  formatCharDataFact(Data:any) {
    var that = this;
    var chartTitle = "";
    var etfvalue:any = [];
    var date:any = [];
    var uindexvalue:any = [];
    var afterTax:any = [];
    if (Data.length > 0) {
      Data.forEach((x:any, i:any) => {
        if (isNotNullOrUndefined(x['top100']) && isNotNullOrUndefined(x['range']) && x['range'] != "" && x['top100'] != "") {
          date.push(x['date']);
          etfvalue.push(x['top100']);
          uindexvalue.push(x['range']);
          if (that.taxOptFactSheet) { afterTax.push(that.GetETFStrData[2]['graphvalues'][i]['range']) }
        }
      });
    }

    var series:any = [];
    if (uindexvalue.length > 0) {

      var d = new Date(date[date.length - 1]);
      var formatdate1 = that.formatedates(d.getMonth() + 1) + '/' + that.formatedates(d.getDate()) + '/' + d.getFullYear();

      series.push({
        name: (that.taxOptFactSheet) ? that.indexName + ' - Before Tax' : that.indexName,
        marker: {
          symbol: 'circle'
        },
        color: 'var(--prim-button-color)',
        data: uindexvalue,
        lineWidth: 0.8
      });
    }

    if (that.taxOptFactSheet) {
      series.push({
        name: that.indexName + ' - After Tax',
        marker: {
          symbol: ''
        },
        color: '#df762e',
        data: afterTax,
        lineWidth: 0.8
      });
    }
    var tick;
    if (isNotNullOrUndefined(that.clickedList.Ticker) && that.clickedList.Ticker != '') {
      tick = " (" + that.clickedList.Ticker + ")";
    } else { tick = "" }
    var name = that.perfName;
    if (this.checkIndexTab == "DI") { name = that.perfName } series.push({
      name: name,
      marker: {
        symbol: ''
      },
      color: '#9b9b9b',
      data: etfvalue,
      lineWidth: 0.8
    });

    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
    Highcharts.chart({
      chart: {
        renderTo: 'lineChartBuyModel',
        type: 'spline',
        style: {
          fontFamily: 'poppins-medium'
        },
        zooming: {
          mouseWheel: false
        }
      }, exporting: {
        url: 'https://export.highcharts.com/',
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
          },
        },
      },
      credits: {
        enabled: false
      },
      title: {
        text: chartTitle,
        style: {
          color: '#394e8b',
          fontSize: '15px',
          fontFamily: 'poppins-medium',
        }
      },
      subtitle: {
        text: ''
      },
      legend: {

      },
      xAxis: {
        type: 'datetime',
        categories: date,
        tickColor: '#f1f1f1',
        tickWidth: 1,
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          },

          style: {
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            color: '#333',
            fontSize: '10px',
          }

        }
      },
      yAxis: {
        maxPadding: 0.2,
        title: {
          text: ''
        },
        labels: {
          style: {
            color: '#333',
            fontSize: '10px'
          },
          formatter: function () { return Highcharts.numberFormat(parseInt(this.value.toString()), 0, '', ','); }

        }
      },

      tooltip: {
        xDateFormat: '%Y-%m-%d',
        valueDecimals: 2,
        shared: true,
        dateTimeLabelFormats: {
          millisecond: "%A, %b %e"
        },
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 0.1,
            lineColor: '#666666',
            lineWidth: 0.1
          }
        },
        series: { point: { events: { click: function (e) { } } } }
      },
      series: series,
      lang: { noData: "No data to display", },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
        }
      }
    });
  }
  createSector(data:any) {
    var arr:any[] = [];
    var list1 = [...new Set(data.map((x: { newSec: any; }) => x.newSec))];
    list1.forEach((x: any) => {
      var list = data.filter((y:any) => y.newSec == x);
      let tot = d3.sum(list, function (d: any) { return d.Wt; });
      arr.push({ "name": x, weight: d3.format(".2f")(tot) + "%" });
    });
    var dta = [...arr].map(a => ({ ...a })).sort(function (x, y) { return d3.descending((parseFloat(x.weight)), (parseFloat(y.weight))); });
    return [...dta];
  }
  format(d:any) { return d3.format(",.2f")(d) }
  barChart() {
    var that = this;
    var series:any = [];
    var categories: any = [];
    var indSector = this.indSector;
    var cat1:any = [...new Set(that.sectorData.map((x: { name: any; }) => x.name))];
    var cat2:any = [...new Set(indSector.map((x: { name: any; }) => x.name))];
    categories = [...new Set([].concat(cat1, cat2).map((x) => x))].filter(x => isNotNullOrUndefined(x));
    var data1:any[] = [];
    var data2:any[] = [];
    categories.forEach((x:any) => {
      var flDta1 = that.sectorData.filter(y => y.name == x);
      var flDta2 = indSector.filter((y:any) => y.name == x);
      if (flDta1.length > 0) {
        if (isNotNullOrUndefined(flDta1[0]['indexWeight'])) { data1.push(parseFloat(that.format(flDta1[0]['indexWeight'] * 100))) }
        else { data1.push(parseFloat(that.format(parseFloat(flDta1[0]['weight'])))) }
      } else { data1.push('') }
      if (flDta2.length > 0) { data2.push(parseFloat(flDta2[0]['weight'])) } else { data2.push('') };
    });

    if (this.sectorData.length > 0) { series.push({ 'name': that.indexName, 'data': data1, 'color': 'var(--prim-button-color)' }); };
    if (indSector.length > 0) { series.push({ 'name': that.perfName, 'data': data2, 'color': '#9999ab' }); };

    Highcharts.chart({
      chart: {
        renderTo: 'barChartBuyModel_popup1',
        type: 'bar',
        zooming: {
          mouseWheel: false
        }
      },
      title: { text: "" },
      subtitle: { text: "" },
      xAxis: {
        categories: categories,
        title: { text: 'Sector' }
      },
      yAxis: {
        min: 0,
        lineColor: 'transparent',
        gridLineColor: 'transparent',
        title: { text: 'Weight' },
        labels: { overflow: 'justify' }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' +
            this.series.name + ': ' + that.format(this.y) + '%'
        }
      },
      plotOptions: {
        series: {
          borderWidth: 0,

          dataLabels: {
            enabled: false,
            color: 'var(--leftSideText)',
            borderWidth: 0,
          }
        },
        bar: {
          dataLabels: {
            enabled: false
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        floating: true,
        borderWidth: 0,
        backgroundColor: 'transparent',
        shadow: false,
        itemStyle: {
          fontSize: '0.55rem',
        },
      },
      credits: { enabled: false },
      series: series
    });
  }
  ETFIndexChart(index:any) {
    var that = this;
    var dta = this.cusIndexService.myIndEqindex.filter((x:any) => x.assetId == index.assetId);
    if (dta.length > 0) {
      var filtercomp: any = [];
      if (index.assetId == 55551111) { filtercomp = [...that.sharedData._EqGrowthData]; }
      else if (index.assetId == 55553333) { filtercomp = [...that.sharedData._EqValueData]; }
      else { filtercomp = [...that.sharedData._selResData].filter(function (d) { return d.indexName == index.Indexname || d.indexName == index.basedon; }) }
      if (isNotNullOrUndefined(filtercomp) && filtercomp.length > 0) {
        that.indexData = [...filtercomp];
        let TotWt = d3.sum(that.indexData.map(function (d:any) { return (1 - d.scores); }));
        var matchData = [...that.sharedData._dbGICS].filter(x => x.type == "Sector");
        that.indexData.forEach((x:any) => {
          var newSec = matchData.filter(z => x.industry.indexOf(z.code) == 0);
          if (newSec.length > 0) { x['newSec'] = newSec[0].name; } else { x['newSec'] = x.industry; }
          x['Wt'] = ((1 - x.scores) / TotWt) * 100;
          return x;
        });
        dta = that.indexData.map((a:any) => ({ ...a })).sort(function (x:any, y:any) { return d3.descending((parseFloat(x.Wt)), (parseFloat(y.Wt))); });
        that.indSector = that.createSector([...dta]);
      } else { that.indSector = []; };
      that.barChart();
    } else {
      that.sharedData.getETFAllocScores(index, 0, 'ETF').then(res => {
        var da: any = res;
        var matchData = [...that.sharedData._dbGICS].filter(x => x.type == "Sector");
        if (isNotNullOrUndefined(da) && da.length > 0) {
          that.indexData = [...da];
          let TotWt = d3.sum(that.indexData.map(function (d:any) { return (1 - d.scores); }));
          that.indexData.forEach((x:any) => {
            var newSec = matchData.filter(z => x.industry.indexOf(z.code) == 0);
            if (newSec.length > 0) { x['newSec'] = newSec[0].name; } else { x['newSec'] = x.industry; }
            x['Wt'] = ((1 - x.scores) / TotWt) * 100;
            return x;
          });
          dta = that.indexData.map((a:any) => ({ ...a })).sort(function (x:any, y:any) { return d3.descending((parseFloat(x.Wt)), (parseFloat(y.Wt))); });
          that.indSector = that.createSector([...dta]);
        } else { that.indSector = []; };
        that.barChart();
      });
    }
  }
  closecommon_progress() {
    var that = this;
    if (that.bldMyIndexMntHPortfolioData.length > 0 && that.GetETFStrData.length > 0) {
      clearInterval(that.clearIntervalFactProgress);
      that.factsheet_progress = "(0s)";
      that.showSpinner_factsheet = false;

    }
    setTimeout(function () {
      that.showSpinner_trade = false;
    }, 100);
  }
  formatedates(value: any) { if (value < 10) { return '0' + value; } else { return value; } }
  updateAccTaxTargetinfo() {
    var that = this;
    var checkFrom = 'Accounts';
    var getcurrent_slid = 0;
    var accData;
    var getcurrent_accId = that.selectedAccList.accountId;
    this.sharedData.showMatLoader.next(true);
    var accountData = [];
    var longtarget = that.acc_taxTargetLong;
    var shorttarget = that.acc_taxTargetShort;
    if (longtarget != that.acc_taxTargetLong_d || shorttarget != that.acc_taxTargetShort_d) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      if (that.savedStrategySettingsData.length > 0) {
        getcurrent_slid = that.savedStrategySettingsData[0].slid;
        checkFrom = 'saved';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "longterm": longtarget,
          "shortterm": shorttarget,
          "slid": getcurrent_slid
        }
      } else {
        checkFrom = 'Accounts';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "longterm": longtarget,
          "shortterm": shorttarget,
        }
      }
      accountData.push(accData);
    }
    if (accountData.length > 0) {
      if (checkFrom == 'saved') {
        that.dataservice.PostlongShortSA(accountData[0]).pipe(first()).subscribe(
          data => {
            if (data[0].toLowerCase().indexOf('locked') > -1) {
              $('#API_lockmodal').modal('show');
            } else {
              this.toastr.success(this.sharedData.checkMyAppMessage(5, 41), '', { timeOut: 5000, progressBar: false, });
              that.refreshaccounts_DB();
            }
            this.sharedData.showMatLoader.next(false);
          },
          (error) => { this.logger.logError(error, 'postCashTargetSettings'); });
      }
      else {
        that.dataservice.PostlongShort(accountData[0]).pipe(first()).subscribe(
          data => {
            if (data[0].toLowerCase().indexOf('locked') > -1) {
              $('#API_lockmodal').modal('show');
            } else {
              this.toastr.success(this.sharedData.checkMyAppMessage(5, 42), '', { timeOut: 5000, progressBar: false, });
              that.refreshaccounts_DB();
            }
            this.sharedData.showMatLoader.next(false);
          },
          (error) => { this.logger.logError(error, 'PostlongShort'); });
      }
    }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 37), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }
  acctaxTargetButtonDisable() {
    var that = this;
    if (that.acc_taxTargetLong == that.acc_taxTargetLong_d && that.acc_taxTargetShort == that.acc_taxTargetShort_d) { return true }
    else if (that.acc_taxTargetLong == null || that.acc_taxTargetShort == null) { return true }
    else { return false; }
  }
  checkCR(key:string) {
    if (this.pauseTotalTrade) {
      this.accPauseCon = key;
      $('#accPauseProcess').modal('show');
    } else { $(key).modal('show'); }
  }
  accsettinsCashButtonDisable() {
    var that = this;
    if (that.acc_cashTarget == that.acc_cashTarget_d) { return true }
    else { return false; }
  }
  updateAccCashTargetinfo() {
    var that = this;
    var checkFrom = 'Accounts';
    var getcurrent_slid = 0;
    var getcurrent_accId = that.selectedAccList.accountId;
    this.sharedData.showMatLoader.next(true);
    var accountData = [];
    var cashTarget = that.acc_cashTarget;
    if (cashTarget != that.acc_cashTarget_d) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accData;
      if (that.savedStrategySettingsData.length > 0) {
        getcurrent_slid = that.savedStrategySettingsData[0].slid;
        checkFrom = 'saved';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "cashTarget": cashTarget,
          "slid": getcurrent_slid
        }
      } else {
        checkFrom = 'Accounts';
        accData = {
          "accountId": getcurrent_accId,
          "userid": userid,
          "cashTarget": cashTarget,
        }
      }
      accountData.push(accData);
    }
    if (accountData.length > 0) {
      this.postCashTargetSettings(accountData, checkFrom);
    }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 36), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }
  postCashTargetSettings(data:any, from:any) {
    var that = this;
    if (from == 'saved') {
      that.dataservice.PostCashTargetSA(data).pipe(first()).subscribe(
        data => {
          if (data[0].toLowerCase().indexOf('locked') > -1) {
            $('#API_lockmodal').modal('show');
          } else {
            this.toastr.success(this.sharedData.checkMyAppMessage(5, 46), '', { timeOut: 5000, progressBar: false, });
            that.refreshaccounts_DB();
          }
          this.sharedData.showMatLoader.next(false);
        },
        (error) => { this.logger.logError(error, 'postCashTargetSettings'); });
    }
    else {
      that.dataservice.PostCashTarget(data).pipe(first()).subscribe(
        data => {
          if (data[0].toLowerCase().indexOf('locked') > -1) {
            $('#API_lockmodal').modal('show');
          } else {
            this.toastr.success(this.sharedData.checkMyAppMessage(5, 46), '', { timeOut: 5000, progressBar: false, });
            that.refreshaccounts_DB();
          }
          this.sharedData.showMatLoader.next(false);
        },
        (error) => { this.logger.logError(error, 'postCashTargetSettings'); });
    }

  }
  arrangeIndexsteps() {
    var that = this;
    var type = "CI";
    this.dialog.open(IndexstepsModalComponent, { width: "75vw", height: "auto", maxWidth: "75vw", maxHeight: "90vh", data: { userSteps: this.userStepData, tradedStrategy: this.alreadyselected_strategy, savedStrategySettingsData: this.savedStrategySettingsData[0] } });
    // this.sharedData.userEventTrack('Accounts', 'Strategy view', this.selectedAccount, 'Account Strategy click');
    // this.indexStepSer.getIndexStepsDataCI(this.userStepData).then(res => {
    //   that.indexConstructionT = [{ 'indexStep': res['res'], 'compData': [], 'excludedData': [], 'factIndexStepGrp': res['factIndexStepGrp'] }];
    //   that.indexRulesData = that.indexConstructionT[0]['indexStep'];
    //   that.factIndexStepGrp = that.indexConstructionT[0]['factIndexStepGrp'];
    //   that.factorsGrp = that.indexConstructionT[0]['factIndexStepGrp'];
    //   that.index_const_calcu = res['res'][0]['removeCompCount'];
    //   that.loadIndexCons();
    // });
  }
  // loadIndexCons() {
  //   var that = this;
  //   var w = 100 - this.indexRulesData[0].range + '%';
  //   that.indexRulesDataRange_W = 'calc(' + w + ' - 1.2rem)';
  //   that.indexrulesCmpy = that.indexRulesData[0].strStockkey;
  //   that.indexrulesGICS = that.indexRulesData[0].strSector;
  //   that.indexrulesCategory = that.indexRulesData[0].category;
  //   if (that.indexRulesData[0].weightBy.length > 0) { that.index_const_weight = that.indexRulesData[0].weightBy[0].Name; }
  //   if (that.indexRulesData[0].selectBy.length > 0) { that.index_const_select = that.indexRulesData[0].selectBy[0].Name; };
  //   if (that.indexRulesData[0].taxEffAwareness == 'Y') { that.index_const_tax = 'Yes'; }
  //   else if (that.indexRulesData[0].taxEffAwareness == 'N') { that.index_const_tax = 'No'; }
  //   else { that.index_const_tax = '-'; }
  //   this.ratingIndexnumber = that.getRatingSSRval(that.indexRulesData[0].rating);
  // }
  getRatingSSRval(rating: any) {
    if (rating == undefined || rating == null || rating == 'NaN' || rating == "") { return 0; }
    else if (rating == "A+") { return 100; }
    else if (rating == "A") { return 90.97222; }
    else if (rating == "A-") { return 81.94444; }
    else if (rating == "B+") { return 72.91667; }
    else if (rating == "B") { return 63.88889; }
    else if (rating == "B-") { return 54.86111; }
    else if (rating == "C+") { return 45.83333; }
    else if (rating == "C") { return 36.80556; }
    else if (rating == "C-") { return 27.77778; }
    else if (rating == "D+") { return 18.75; }
    else if (rating == "D") { return 9.722222; }
    else if (rating == "D-") { return 0.694444; }
    else { return 0 }
  }
  getsummary_dup(d:any) {
    var that = this;
    if (d == 'availablefunds') {
      var x = that.myAcclist['summary'].filter((x:any) => x.accountcode.value == that.selectedAccount)[0];
      return x['availablefunds'].amount;
    }
    else {
      var x = that.myAcclist['ledger'].filter((x:any) => x.accountId == that.selectedAccount)[0];
      if (isNullOrUndefined(x['base'])) { return '-' }
      else if (isNotNullOrUndefined(x['base']['realizedpnl']) && x['base']['realizedpnl'] != 0) {
        return x['base']['realizedpnl'];
      }
      else {
        return x['base']['unrealizedpnl'];
      }
    }
  }
  checkValPrice(val:any) { if (isNullOrUndefined(val)) { return "-" } else { return d3.format("$,.2f")(val); } };
  modifiedDateTime(dat:any) {
    var iso = dat;
    if (isNotNullOrUndefined(dat)) {
      var date = iso.split('T')[0];
      var datesp = date.substr(0, 4) + '-' + date.substr(5, 2) + '-' + date.substr(8, 2);
      var time = iso.split('T')[1].split('.')[0];
      return datesp + " " + time;
    } else { return '-'; }
  }
  selectedAccountDropdown(val:any, frm:any, Tite:any, type:any, i:any) {
    var that = this;
    this.showAccOverview = true;
    //this.showPositions = true; 
    this.activeTab = 'position';
    $("#unrealizedTab").removeClass("active");
    $("#realizedTab").removeClass("active");
    $("#positionTab").addClass("active");

    var accID:any;
    if (frm == 'view') {
      accID = val;
      that.individual_selectedAcc = accID;
      this.zone.run(() => {
        that.activeLeftGrid = { ...this.activeLeftGrid, funded: accID, nonfunded: null, openDefaultFundedTab: true };
      });
    }
    else {
      accID = val;
      that.individual_selectedAcc = accID
    }
    this.sharedData.userEventTrack('Accounts', 'View funded Account', accID, 'Left grid view click');
    that.showSpinnerAcc_list = true; //// Portfolio table loader
    //$('#showMatLoaderAccounts').show();
    this.showMatLoaderAccountsRight = true;//// Right section top loader
    that.selectedAccount = accID;
    that.accPortfolioPosition = [];
    that.accountDataSource = new MatTableDataSource([]);
    this.SelectedAccountType = type;
    /*** Pershing account change reset ***/
    that.pershPortFolioPosition = [];
    that.PershingaccountDataSource = new MatTableDataSource([]);
    that.pershPortFolioPositionUnrealized = [];
    that.PershingaccountUnrealizedDataSource = new MatTableDataSource([]);
    that.pershMarketTotal = 0;
    that.pershMarketTotalCash = 0;
    that.pershAvailableCash = 0;
    that.pershUnrealizedMarketTotal = 0;
    that.pershUnrealizedMarketTotalCash = 0;
    that.pershUnrealizedAvailableCash = 0;
    that.pershUnrealizedGainLossTotal = 0;
    that.PershingaccountrealizedDataSource = new MatTableDataSource([]);
    const getportfolio = that.dataservice.GetAccountDetails_1(accID).pipe(first()).subscribe((acclist: any) => {
      that.avoid_MulClick = false;
      let obj = { 'Account': that.myAcclist, 'acclist': acclist, 'accID': accID }
      that.sharedData.selectedAccountCompanyList.next(obj)
      var objPortfolio = acclist['portfolioPositions'];
      if (isNullOrUndefined(objPortfolio)) { objPortfolio = []; }
      var objSummary = that.myAcclist['summary'].filter((x:any) => x.accountcode.value == accID)[0];
      var objUSD = that.myAcclist['ledger'].filter((x:any) => { return x.accountId == accID })[0]['usd'];
      that.marketdata = acclist['marketdata'];
      $('.refresh span').removeClass('rotate');
      that.lastRefrestDateInd = new Date();
      that.selectedAccList = that.myAcclist['accounts'].filter((x:any) => { return x.accountId == accID })[0];
      //that.acc_cashRise = that.selectedAccList.cashRise;
      //that.acc_cashRise_d = that.selectedAccList.cashRise;
      if (that.selectedAccList.cashRise == "" || that.selectedAccList.cashRise == 'I') { that.acc_cashRiseType = "I"; }
      else { that.acc_cashRiseType = that.selectedAccList.cashRiseType; }
      that.getLiquidateInfo();
      that.selectedName = that.myAcclist['accounts'].filter((x:any) => { return x.accountId == accID })[0].displayName;
      that.selectedNameEdit = that.selectedName;
      that.selectedAccountSummary = objSummary;
      that.AS_cashbalance = objUSD['cashbalance'];
      that.AS_dividends = objUSD['dividends'];
      try { that.AS_buyingpower = objSummary['buyingpower']['amount']; } catch (e) { }
      that.accOverview = objUSD;
      that.accPortfolioPosition = objPortfolio;
      that.checkAlreadysavedStrategy(that.selectedAccList);
      that.accountDataSource = new MatTableDataSource(that.accPortfolioPosition);
      //if (that.accPortfolioPosition.length == 0) {
      this.checkPreviousHoldings();
      //}
      //console.log(that.accountDataSource);     
      that.checkSaved_list();
      // const selectedIndex = this.getAcc_list_AccountList_Funded.findIndex(elem =>
      //   elem.id === this.getAcc_list_AccountList_Funded.accountId);

      this.item = i;
      if (i == '') {
        this.item = parseInt(this.sharedData.openAccOverviewActiveId.value);
      }
      // this.vir_ScrollGrids();
      // this.viewport2.scrollToIndex(0);
      that.dashAccFlag = false;
      $('.refresh span').removeClass('rotate');
      if (that.startRefresh) {
        that.toastr.success('Updated successfully', '', { timeOut: 4000 });
        that.startRefresh = false;
      }
      setTimeout(function () {
        var checkshared = that.sharedData.openAccOverviewId.value; //// Value from dashboard
        if (type === "M" || checkshared != '') {
          $('#SpinLoader-modal-acc').css('display', 'none');
          $('#account_comp').css('visibility', 'visible');
          that.showSpinnerAcc_list = false;
        }
        that.sharedData.showCircleLoader.next(false);
      }.bind(this), 1500);
    }, error => {
      this.showMatLoaderAccountsRight = false;
      //$('#showMatLoaderAccounts').hide();
      that.showSpinnerAcc_list = false;
      $('#SpinLoader-modal-acc').css('display', 'none');
      $('#account_comp').css('visibility', 'visible');
      that.sharedData.showCircleLoader.next(false);
      $('.refresh span').removeClass('rotate');
      that.avoid_MulClick = false;

    });
    this.subscriptions.add(getportfolio);
    if (type == 'P') {
      this.unRealizedTabLoader = true;
      this.realizedTabLoader = true;
      that.showSpinnerAcc_list = true;
      that.accPortfolioPosition = [];
      that.accountDataSource = new MatTableDataSource(that.accPortfolioPosition);
      var accountData = { "accountIdentifier": Tite };
      const getpershingAcc = this.dataservice.PostPershingAccountDetails(accountData).pipe(first()).subscribe((pershAccList: any) => {
        let obj = { 'Account': that.myAcclist, 'acclist': pershAccList, 'accID': accID }
        that.sharedData.selectedAccountCompanyList.next(obj)
        that.selectedAccList = that.myAcclist['accounts'].filter((x:any) => { return x.accountId == accID })[0];
        that.pershPortFolioPosition = pershAccList['FilteredHoldings'];
        if (isNullOrUndefined(that.pershPortFolioPosition)) { this.pershPortFolioPosition = []; }
        that.PershingaccountDataSource = new MatTableDataSource(that.pershPortFolioPosition);
        if (isNotNullOrUndefined(pershAccList['AccountValue']) && pershAccList['AccountValue'] != '') {
          that.pershMarketTotal = pershAccList['AccountValue']
        } if (isNotNullOrUndefined(pershAccList['Cash']) && pershAccList['Cash'] != '') {
          that.pershMarketTotalCash = pershAccList['Cash']
        } if (isNotNullOrUndefined(pershAccList['EquityValue']) && pershAccList['EquityValue'] != '') {
          that.pershAvailableCash = pershAccList['EquityValue']
        }
        that.checkAlreadysavedStrategy(that.selectedAccList);
        this.subscriptions.add(getpershingAcc);
        that.showSpinnerAcc_list = false;
      }, error => {
        //console.log('pershing retry-----');
        that.pershMarketTotal = 0;
        that.pershMarketTotalCash = 0;
        that.pershAvailableCash = 0;
        this.showMatLoaderAccountsRight = false;
        //$('#showMatLoaderAccounts').hide();
        that.showSpinnerAcc_list = false;
        $('#SpinLoader-modal-acc').css('display', 'none');
        $('#account_comp').css('visibility', 'visible');
        that.sharedData.showCircleLoader.next(false);
        $('.refresh span').removeClass('rotate');
        //this.showAccOverview = false;	
        this.pershPortFolioPosition = [];
        that.PershingaccountDataSource = new MatTableDataSource(this.pershPortFolioPosition);
      });
      const getpershingAccUnrealized = this.dataservice.PostPershingAccountUnrealizedGL(accountData).pipe(first()).subscribe((pershAccList: any) => {
        // that.pershPortFolioPosition = pershAccList['FilteredHoldings'];
        // if (isNullOrUndefined(pershAccList['FilteredHoldings'])) { this.pershPortFolioPosition = []; }
        this.unRealizedTabLoader = false;
        that.PershingaccountUnrealizedDataSource = new MatTableDataSource(pershAccList['FilteredHoldings']);
        that.pershPortFolioPositionUnrealized = pershAccList['FilteredHoldings'];
        //console.log(that.pershPortFolioPositionUnrealized,'pershPortFolioPositionUnrealized')
        if (isNotNullOrUndefined(pershAccList['AccountValue']) && pershAccList['AccountValue'] != '') {
          that.pershUnrealizedMarketTotal = pershAccList['AccountValue']
        } if (isNotNullOrUndefined(pershAccList['Cash']) && pershAccList['Cash'] != '') {
          that.pershUnrealizedMarketTotalCash = pershAccList['Cash']
        } if (isNotNullOrUndefined(pershAccList['EquityValue']) && pershAccList['EquityValue'] != '') {
          that.pershUnrealizedAvailableCash = pershAccList['EquityValue']
        }
        if (isNotNullOrUndefined(pershAccList['UnrealizedGainLossTotal']) && pershAccList['UnrealizedGainLossTotal'] != '') {
          that.pershUnrealizedGainLossTotal = pershAccList['UnrealizedGainLossTotal']
        }



      }, error => {
        that.pershUnrealizedMarketTotal = 0;
        that.pershUnrealizedMarketTotalCash = 0;
        that.pershUnrealizedAvailableCash = 0;
        that.pershUnrealizedGainLossTotal = 0
        this.unRealizedTabLoader = false;
        that.pershPortFolioPositionUnrealized = [];
     
      })
      const getPershingAccRealized = this.dataservice.PostPershingAccountRealizedGl(accountData).pipe(first()).subscribe((pershAccList: any) => {
        that.PershingaccountrealizedDataSource = new MatTableDataSource(pershAccList['FilteredHoldings']);
        that.taxlotRealizedData = pershAccList['FilteredHoldingsTaxlot']
        that.pershRealizedGLTotal = pershAccList['realizedGainLoss']
        //  that.pershRealizedLongTermGain = pershAccList['longTermGain']
        //  that.pershRealizedLongTermLoss = pershAccList['longTermLoss']
        //  that.pershRealizedShortTermGain = pershAccList['shortTermGain']
        //  that.pershRealizedShortTermLoss =pershAccList['shortTermLoss']
        that.pershRealizedShortTermGainLoss = pershAccList['shortTermGain'] + pershAccList['shortTermLoss']
        that.pershRealizedLongTermGainLoss = pershAccList['longTermGain'] + pershAccList['longTermLoss']
        this.realizedTabLoader = false;
      }, error => {
        that.taxlotRealizedData = [];
        that.pershRealizedGLTotal = 0.00
        //  that.pershRealizedLongTermGain = 0.00
        //  that.pershRealizedLongTermLoss = 0.00
        //  that.pershRealizedShortTermGain = 0.00
        //  that.pershRealizedShortTermLoss = 0.00
        that.pershRealizedShortTermGainLoss = 0.00
        that.pershRealizedLongTermGainLoss = 0.00
        this.realizedTabLoader = false;
      });
    }
    this.GetAccsTaxlot(val);
    this.tradesHistoryData = [];
    this.tradesAllocationHistoryData = [];
    this.tradesHistoryDetails = [];
    this.tradesHistoryOption = [];
    this.tradesHisData = [];
    const getTradesHistory = this.dataservice.GetTradesHistoryList(accID).pipe(first()).subscribe((accHis: any) => {
      if (this.sharedData.checkServiceError(accHis)) { this.tradesHistoryData = []; }
      else {
        this.tradesHisData = accHis;
        this.loadHis(accHis);
      }
    }, error => { this.tradesHistoryData = []; });
    this.subscriptions.add(getTradesHistory);
    this.getAccount();
    this.accountService.GetDBPershing(accID).then((res:any) => { });
    //clear sort
    if (type == 'P') {
      this.PershingaccountDataSource.sort = this.sort; 
      //this.PershingaccountDataSource.sort.direction = ''; // Clear the sorting direction
      //this.PershingaccountDataSource.sort.active = ''; // Clear the active sorting column
      $(".mat-sort-header-arrow ").css("opacity", "0")
    }
    else {
      this.accountDataSource.sort = this.sort;
      //this.accountDataSource.sort.direction = ''; // Clear the sorting direction
      //this.accountDataSource.sort.active = ''; // Clear the active sorting column.
      $(".mat-sort-header-arrow ").css("opacity", "0")
    }
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
  pauseInfo = { pauseUserName: "", pauseDate: '' };
  getAccount() {
    this.pauseInfo.pauseUserName = "";
    this.pauseInfo.pauseDate = "";
    const GetAccount = this.dataservice.GetAccountData(this.selectedAccount).pipe(first()).subscribe((res: any[]) => {
      this.taxTargetvalue(res);
      if (res.length > 0 && isNotNullOrUndefined(res[0]['pauseStatus']) && res[0]['pauseStatus'] == 'Y') {
        this.pauseTotalTrade = true;
        if (isNotNullOrUndefined(res[0]['pauseUserName'])) { this.pauseInfo.pauseUserName = res[0]['pauseUserName']; }
        if (isNotNullOrUndefined(res[0]['pauseDate'])) { this.pauseInfo.pauseDate = res[0]['pauseDate']; }
      }
      else { this.pauseTotalTrade = false; }
    }, error => { });
    this.subscriptions.add(GetAccount);
  }
  taxlotModalData: any = [];
  taxlotModalDataTicker: string = '';
  taxLotModalLastPrice: string = '';
  taxLot_ModalOpen(port:any) {
    var data = [];
    this.taxlotModalDataTicker = '';
    if (isNotNullOrUndefined(port['cusipIdentifier'])) {
      data = [...this.sharedData.taxLotData.value].filter(x => x.cusipIdentifier == port['cusipIdentifier']);
    } else if (isNotNullOrUndefined(port['stockkey'])) {
      data = [...this.sharedData.taxLotData.value].filter(x => x.stockKey == port['stockkey']);
    }
    this.taxlotModalData = [...data];
    this.taxlotModalDataTicker = (this.taxlotModalData[0].ticker).toString()
    this.taxLotModalLastPrice = (this.taxlotModalData[0].price).toString()
  }
  downloadPortfolioUnrealized() {
    var that = this;
    var tblData = [];
    this.sharedData.userEventTrack('Accounts', 'Account unrealized download', this.selectedAccount, 'Account unrealized download click');
    if (this.SelectedAccountType == "M") {
      this.accountDataSource.data.forEach((d:any) => {
        tblData.push([
          d.contractDesc,
          that.sharedData.numberWithCommas(d.position),
          that.sharedData.numFormatWithComma(d.lastPrice),
          // that.getmarketdata(d.conid, 'change'),
          that.sharedData.numFormatWithComma(d.mktValue),
          that.getmarketdata(d.conid, 'dailyprofitloss'),
          // that.getmarketdata(d.conid, 'unrealizedprofitloss')
        ])
      });
      tblData.push(['Total', (that.getsummary_total('availablefunds') - that.accOverview.cashbalance)]);
      tblData.push(['Cash & MM', that.accOverview.cashbalance]);
      tblData.push(['Total', that.getsummary_total('availablefunds')]);
    } else if (this.SelectedAccountType == "P") {
      this.PershingaccountUnrealizedDataSource.data.forEach((d:any) => {
        var tic = isNotNullOrUndefined(d.Instrument) ? d.Instrument : d.exchangeCode
        tblData.push([tic, parseInt(that.sharedData.numberWithCommas(d.Position)), d.last, that.sharedData.numFormatWithComma(d.Market_Value), that.sharedData.numFormatWithComma(d.Unrealized_PL)]);
      });
      tblData.push(['Total', '', '',  that.sharedData.numFormatWithComma(that.pershUnrealizedGainLossTotal), that.sharedData.numFormatWithComma(that.pershUnrealizedAvailableCash)]);
      tblData.push(['Cash & MM', '', '',  that.sharedData.numFormatWithComma(that.pershUnrealizedMarketTotalCash)]);
      tblData.push(['Account Total', '', '',  that.sharedData.numFormatWithComma(that.pershUnrealizedMarketTotal)]);
    }

    try {
      let rd = new Date();
      var rdate = this.sharedData.formatedates(rd.getMonth() + 1) + '/' + this.sharedData.formatedates(rd.getDate()) + '/' + rd.getFullYear();
      const new_workbook = new Workbook();
      var name = this.selectedName.replaceAll(' ', '_').replaceAll(',', '_');
      var ws = new_workbook.addWorksheet(name);
      var account = this.myAcclist['accounts'].filter((x:any) => x.accountId == this.selectedAccount);
      if (account.length > 0) {
        var detail = [
          ['Portfolio-Unrealized'],
          ['Account Name', account[0]['displayName']],
          ['Account', account[0]['accountVan']],
          ['Report Date', (rdate + " (MM/DD/YYYY)")],
          []
        ];
        ws.addRows(detail)
        name = account[0]['accountVan'] + "_" + this.selectedName.replaceAll(' ', '_').replaceAll(',', '_')
      }

      var header = ws.addRow(['Instrument', 'Position', 'Last', 'Market Value', 'Unrealized P&L ($)'])
      header.font = { bold: true };
      tblData.forEach((d, i) => { ws.addRow(d).numFmt = '#,##0.00' });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }

      //Disclosures 1
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      ds.addRow([this.sharedData.checkMyAppMessage(5, 50)]).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 1), 10);
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
      //Disclosures 2
      if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
        var ds1 = new_workbook.addWorksheet("Disclosure II");
        ds1.addRow(["Disclosure II"]).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
        var Disclosures: any = [];
        that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
        Disclosures.forEach((du:any) => {
          ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
        });
        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
        saveAs(blob, name + 'UnrealizedGain/Loss' + '.xlsx');
      });
    } catch (e) { console.log(e) }
  }
  tradeHisChanged(val:any) {
    var that = this;
    this.selTradeHisOption = val;
    this.tradesAllocationHistoryData = [];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.showMatLoaderAccountsRight = true;
    //$('#showMatLoaderAccounts').show();
    var rebId = val.rebalanceId;
    this.dataservice.GetTradesHistoryHoldings(rebId, this.selectedAccount).pipe(first()).subscribe((accHisReb: any) => {
      if (this.sharedData.checkServiceError(accHisReb)) { this.tradesHistoryData = [];
        //$('#showMatLoaderAccounts').hide();
        this.showMatLoaderAccountsRight = false;
        this.accountDataSource_History = new MatTableDataSource([]); 
        }
      else {
        if (that.openHisInput) {
          this.showMatLoaderAccountsRight = false;
          //$('#showMatLoaderAccounts').hide();
        }
        this.tradesHistoryData = accHisReb;
        this.accountDataSource_History = new MatTableDataSource(this.tradesHistoryData);
      }
    }, error => {
      this.logger.logError(error, 'GetTradesHistoryHoldings');
      this.showMatLoaderAccountsRight = false;
      //$('#showMatLoaderAccounts').hide();
      this.tradesHistoryData = []; 
    this.accountDataSource_History = new MatTableDataSource([]);
   });
    //// get rebalance for history Table

    var TAHdata: any = { "userid": parseInt(userid), "accountId": ((isNotNullOrUndefined(val.accountId) ? val.accountId : 0)), "rebalanceId": rebId };
    this.dataservice.GetTradesAllocationHis(TAHdata).pipe(first()).subscribe((res: any) => {
      if (this.sharedData.checkServiceError(res)) {
        this.tradesAllocationHistoryData = [];
        this.accountDataSource_HistoryAllocation = new MatTableDataSource([]); 
      } else {
        this.tradesAllocationHistoryData = [...res];
        this.accountDataSource_HistoryAllocation = new MatTableDataSource(this.tradesAllocationHistoryData); 
      }
    }, error => {
      this.tradesAllocationHistoryData = [];
      this.accountDataSource_HistoryAllocation = new MatTableDataSource([]); 
    });
    //// Get Trades Allocation for history Table

    if (isNotNullOrUndefined(val['createdDate'])) {     
      this.sharedData.userEventTrack('Accounts', val['createdDate'], this.selectedAccount, 'Account history tab chhanged');
    }

    var getHistoryDetails:any;    
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
    else { this.sharedData.showMatLoader.next(false); }
  }
  checkDataLen() {

    if (isNotNullOrUndefined(this.accountDataSource.data) && this.accountDataSource.data.length > 0) { return true }
    else if (this.activeTab == 'position' && isNotNullOrUndefined(this.PershingaccountDataSource.data) && this.PershingaccountDataSource.data.length > 0) { return true }
    else return false
  }
  getmarketdata(conid:any, column:any) {
    if (isNotNullOrUndefined(conid)) {
      var mktdata:any = this.marketdata.filter((x:any) => x.conid == parseInt(conid));
      if (mktdata.length > 0) {
        if (column == 'change' && mktdata[0]['change'] != null) return mktdata[0]['change'] + ' %';
        if (column == 'last' && mktdata[0]['last'] != null) return mktdata[0]['last'];
        if (column == 'costbasis' && mktdata[0]['costbasis'] != null) {
          return this.numberWithCommas(mktdata[0]['costbasis']);
        }
        if (column == 'marketvalue' && mktdata[0]['marketvalue'] != null) {
          var marketvalue = '';
          if (mktdata[0]['marketvalue'].includes('K')) {
            marketvalue = mktdata[0]['marketvalue'];
            marketvalue = (parseFloat(marketvalue.replace("K", "")) * 1000).toString();
            return this.numberWithCommas(marketvalue);
          } else { return this.numberWithCommas(mktdata[0]['marketvalue']); }
        }
        if (column == 'avgprice' && mktdata[0]['avgprice'] != null) return this.numberWithCommas(mktdata[0]['avgprice']);
        if (column == 'dailyprofitloss' && mktdata[0]['dailyprofitloss'] != null) return this.numberWithCommas(mktdata[0]['dailyprofitloss']);
        if (column == 'unrealizedprofitloss' && mktdata[0]['unrealizedprofitloss'] != null) return this.numberWithCommas(mktdata[0]['unrealizedprofitloss']);
      }
      return '';
    } else { return "-"; }
  }
  isShortLongTerm(cusip:any)
  {
    var countShort = 0;
    var countLong = 0;
   var taxlotdata = this.taxlotRealizedData.filter((x:any) => x.cusip == cusip);
   taxlotdata.forEach((x:any)=>{
    if(x.Term == "SHORT")
    countShort++
    else if(x.Term == "LONG")
    countLong++
   })
    if(countShort ==taxlotdata.length )
    return "SHORT";
    else if(countLong ==taxlotdata.length)
    return "LONG";
    else
    return "Multiple";

  }
    // taxlot Realized Modal Start 
    taxlotRealizedModalData: any = [];
    taxlotRealizedModalDataTicker: string = '';
    taxLotRealizedModalOpen(port:any, ticker:any) {
      this.taxlotRealizedModalData = [];
      this.taxlotRealizedModalData = this.taxlotRealizedData.filter((x:any) => x.cusip == port)
      this.taxlotRealizedModalDataTicker = ticker;
  
    }
    // taxlot Realized Modal end 
  downloadPortfolio() {
    var that = this;
    var tblData = [];
    if (this.SelectedAccountType == "M") {
      this.accountDataSource.data.forEach((d:any) => {
        tblData.push([
          d.contractDesc,
          that.sharedData.numberWithCommas(d.position),
          that.sharedData.numFormatWithComma(d.lastPrice),
          that.getmarketdata(d.conid, 'change'),
          that.sharedData.numFormatWithComma(d.mktValue),
          that.getmarketdata(d.conid, 'dailyprofitloss'),
          // that.getmarketdata(d.conid, 'unrealizedprofitloss')
        ])
      });
      tblData.push(['Total', '', '', '', (that.getsummary_total('availablefunds') - that.accOverview.cashbalance)]);
      tblData.push(['Cash & MM', '', '', '', that.accOverview.cashbalance]);
      tblData.push(['Account Total', '', '', '', that.getsummary_total('availablefunds')]);
    } else if (this.SelectedAccountType == "P") {
      this.PershingaccountDataSource.data.forEach((d:any) => {
        var tic = isNotNullOrUndefined(d.Instrument) ? d.Instrument : d.exchangeCode
        tblData.push([tic, that.sharedData.numberWithCommas(d.Position), d.last, d.Change, that.sharedData.numFormatWithComma(d.Market_Value), that.sharedData.numFormatWithComma(d.Daily_PL)]);
      });
      tblData.push(['Total', '', '', '', that.sharedData.numFormatWithComma(that.pershAvailableCash)]);
      tblData.push(['Cash & MM', '', '', '', that.sharedData.numFormatWithComma(that.pershMarketTotalCash)]);
      tblData.push(['Account Total', '', '', '', that.sharedData.numFormatWithComma(that.pershMarketTotal)]);
    }
    this.sharedData.userEventTrack('Accounts', 'Account portfolio download', this.selectedAccount, 'Account portfolio download click');
    try {
      let rd = new Date();
      var rdate = this.sharedData.formatedates(rd.getMonth() + 1) + '/' + this.sharedData.formatedates(rd.getDate()) + '/' + rd.getFullYear();
      const new_workbook = new Workbook();
      var name = this.selectedName.replaceAll(' ', '_').replaceAll(',', '_');
      var ws = new_workbook.addWorksheet(name);
      var account = this.myAcclist['accounts'].filter((x:any) => x.accountId == this.selectedAccount);
      if (account.length > 0) {
        var detail = [
          ['Portfolio'],
          ['Account Name', account[0]['displayName']],
          ['Account', account[0]['accountVan']],
          ['Report Date', (rdate + " (MM/DD/YYYY)")],
          []
        ];
        ws.addRows(detail)
        name = account[0]['accountVan'] + "_" + this.selectedName.replaceAll(' ', '_').replaceAll(',', '_')
      }

      var header = ws.addRow(['Instrument', 'Position', 'Last', 'Daily Price Change', 'Market Value', 'Daily P&L ($)'])
      header.font = { bold: true };
      tblData.forEach((d, i) => { ws.addRow(d).numFmt = '#,##0.00' });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }

      //Disclosures 1
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      ds.addRow([this.sharedData.checkMyAppMessage(5, 50)]).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 1), 10);
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
      //Disclosures 2
      if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
        var ds1 = new_workbook.addWorksheet("Disclosure II");
        ds1.addRow(["Disclosure II"]).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
        var Disclosures: any = [];
        that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
        Disclosures.forEach((du:any) => {
          ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
        });
        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }
      new_workbook.xlsx.writeBuffer().then((data:any) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
        saveAs(blob, (that.sharedData.downloadTitleConvert( name + '_Positions') + '.xlsx'));
      });
    } catch (e) { console.log(e) }
  }
  taxTargetvalue(selAcc:any) {
    let that = this;
    this.longTaxRateValid = false;
    this.shortTaxRateValid = false;
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
        //setTimeout(function () {
        //  $('#Funded ul li:first').trigger('click');
        //  that.show_fundedTab = true;
        //}.bind(this), 1000)
      } else { that.avoid_MulClick = false; }
    } else { that.avoid_MulClick = false; }
  }
  refreshTabName: string = 'NonFunded';
  refreshNonFundedTab() {
    var that = this;
    that.avoid_MulClick = true;
    if (that.refreshTabName === 'Funded') {
      
      that.startRefresh_NF = true;
      that.nonFundedTab();
      this.refreshaccounts_DB();
      var getED = this.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
        that.refreshTabName = 'NonFunded';//// Avoid multiple click using nonfunded tab
        that.myAcclist = data;
        that.accountService.GetAccounts.next(data);
        ///// Non funded Tab
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
  openStrategy() {
    this.router.navigate(['/home']);
    this.sharedData.openUniverseMenu.next(true);
  }
  refreshaccounts_DB() {
    let that = this;
    var filterCurrent = [];
    var getED = this.dataservice.GetSubAccounts().pipe(first()).subscribe((data: any) => {
      that.myAcclist = data;
      that.accountService.GetAccounts.next(data);
      ///// Non funded Tab
      if (!this.show_fundedTab) {
        that.getAcc_list = that.myAcclist;
        that.accountService.refreshAccount.next(true);
        //// Funded Data
        that.getAcc_list_AccountList_Funded = that.myAcclist['accounts'].filter((x:any) => x.funded == 'Y' && x.enabledforTrading == 'Y');
        that.getAcc_list_dupAccountList_Funded = that.getAcc_list_AccountList_Funded;
        var getAcc_list_AccountList = that.myAcclist['accounts'].filter((x:any) => x.funded != 'Y');// Exclude Funded One
        that.getAcc_list_AccountList = getAcc_list_AccountList;
        that.getAcc_list_dupAccountList = that.getAcc_list_AccountList;

        //// Non Funded Data
        if (getAcc_list_AccountList.length > 0) {
          that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
          // that.startRefresh_NF = false;
          this.zone.run(() => {
            that.activeLeftGrid = { ...this.activeLeftGrid,funded:null, nonfunded: this.getAcc_list_AccountList[0].accountId };
          });
        } else {
          that.selected_NF_Details = '';
          ///// If nonfunded tab all the records moved to funded switch tab to funded.
          if (!that.startRefresh_NF) { $('#funTabActive a').get(0).click(); 
          that.startRefresh_NF = false; }
          else { that.startRefresh_NF = false; }
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
  download() { if ($('#accNavTab .active').data('myvalue') == 'History') { this.downloadHis() } else { this.downloadPortfolio() } }
  downloadHis() {
    var that = this;
    var tblData:any = [];
    //this.accountDataSource_History.data.forEach((d:any) => {
    //  tblData.push([d.dateofTrade, d.ticker, d.price, d.noofShares, that.checkValPrice(d.noofShares * d.price)])
    //});
    this.accountDataSource_HistoryAllocation.data.forEach((d: any) => {
      tblData.push([d.ticker, d.price, d.buyOrSell,d.noofShares, d.tradedStatus])
    });
    this.sharedData.userEventTrack('Accounts', 'Account history download', this.selectedAccount, 'Account history download click');
    try {
      let rd = new Date();
      var rdate = this.sharedData.formatedates(rd.getMonth() + 1) + '/' + this.sharedData.formatedates(rd.getDate()) + '/' + rd.getFullYear();
      const new_workbook = new Workbook();
      var name = this.selectedName.replaceAll(' ', '_').replaceAll(',', '_');
      var ws = new_workbook.addWorksheet(name);
      var account = this.myAcclist['accounts'].filter((x:any) => x.accountId == this.selectedAccount);
      var dte = this.datepipe.transform(this.selTradeHisOption['createdDate'], 'MM/dd/YYYY')
      if (account.length > 0) {
        var detail = [
          ['History'],
          ['Account Name', account[0]['displayName']],
          ['Account', account[0]['accountVan']],
          ['Date', dte],
          ['Report Date', (rdate + " (MM/DD/YYYY)")],
        ];
        ws.addRows(detail)
        name = account[0]['accountVan'] + "_" + this.selectedName.replaceAll(' ', '_').replaceAll(',', '_')
      }
      //var header = ws.addRow(['Date', 'Ticker', 'Price ($)', 'Quantity', 'Value'])
      var header = ws.addRow(['Ticker', 'Price ($)','Action', 'Quantity', 'Traded Status'])
      header.font = { bold: true };
      tblData.forEach((d:any, i:any) => { ws.addRow(d).numFmt = '#,##0.00' });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }
      //Disclosures 1
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      ds.addRow([this.sharedData.checkMyAppMessage(5, 49)]).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 1), 10);
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
      //Disclosures 2
      if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
        var ds1 = new_workbook.addWorksheet("Disclosure II");
        ds1.addRow(["Disclosure II"]).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
        var Disclosures: any = [];
        that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
        Disclosures.forEach((du:any) => {
          ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
        });
        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }
      var fDate: any = new Date(this.selTradeHisOption['createdDate']);
      var fileName: string = this.sharedData.downloadTitleConvert(this.selectedName) + '_History_' + this.datepipe.transform(fDate, 'yyyyMMdd') + '_' + this.datepipe.transform(fDate, 'hhmmss')+ '.xlsx';
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
        saveAs(blob, fileName);
      });
    } catch (e) { console.log(e) }
  }
  openAccOverview(item:any) {
    var accountId = item.id;
    this.showAccOverview = true;
    this.selectedAccountDropdown(accountId, 'view', '', '', '');
    this.sharedData.userEventTrack('Accounts', 'View Account', accountId, 'center grid view click');
  }
  nonFundedTab() {
    var that = this;
    that.show_fundedTab = false;//// Display right section

    this.sharedData.openAccOverviewActiveId.next('');
  }
  selectedAccountNonfunded(id:any, selAcc:any) {
    var that = this;
    $('#showMatLoaderAccounts_nonFunded').show();
    //that.showAccOverview = true;
    that.individual_selectedAcc_NF = id;
    that.selected_NF_Details = selAcc;
    /////// Check it is Enabled for trading
    if (selAcc.funded == 'Y' && selAcc.enabledforTrading == 'Y') {
      that.nonFundClicked = 'Funded';
      that.nonFundCheckbox = true;
    } else {
      that.nonFundClicked = 'Non Funded';
      that.nonFundCheckbox = false;
    }
    this.sharedData.userEventTrack('Accounts', 'View Non funded Account', id, 'Left grid view click');
    /////// Check it is Enabled for trading
    that.selectedAccountPers_NF(id, selAcc);
    //console.log(that.refreshTabName);
    setTimeout( () => {
      that.viewport1.scrollToIndex(0);
      if (that.refreshTabName == 'NonFunded') {
        that.nonFundedTab();
      }
      this.showMatLoaderAccountsRight = false;
      //$('#showMatLoaderAccounts').hide();
      setTimeout( ()=> {
        that.sharedData.showMatLoader.next(false);
      }, 500);
      that.sharedData.showCircleLoader.next(false);

    }, 1500);
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
          that.showMatLoaderAccountsRight = false;
          //$('#showMatLoaderAccounts').hide();
          that.sharedData.showCircleLoader.next(false);
          $('#showMatLoaderAccounts_nonFunded').hide();
          that.openAccOverview(checkshared);
        }.bind(this), 1500);

      } else {
        if (that.getAcc_list_AccountList.length > 0) {
          try {
            that.selectedAccountNonfunded(that.getAcc_list_AccountList[0].accountId, that.getAcc_list_AccountList[0]);
            this.zone.run(() => {
              that.activeLeftGrid = { ...this.activeLeftGrid, nonfunded: this.getAcc_list_AccountList[0].accountId };
            });
            setTimeout(function () {
              $('#SpinLoader-modal-acc').css('display', 'none');
              $('#account_comp').css('visibility', 'visible');
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
            that.showMatLoaderAccountsRight = false;
            //$('#showMatLoaderAccounts').hide();
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
  numberWithCommas(x:any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  getsummary_total(d:any) {
    var that = this;
    if (d == 'availablefunds') {
      var x = that.myAcclist['summary'].filter((x:any) => x.accountcode.value == that.selectedAccount)[0];
      return x['availablefunds'].amount;
    }
    else if (d == 'daily') {
      var x = that.myAcclist['ledger'].filter((x:any) => x.accountId == that.selectedAccount)[0];
      if (isNotNullOrUndefined(x['base'])) { return this.numberWithCommas(x['base']['realizedpnl']); }
      return '-';
    }
    else {
      var x = that.myAcclist['ledger'].filter((x:any) => x.accountId == that.selectedAccount)[0];
      if (isNotNullOrUndefined(x['base'])) { return this.numberWithCommas(x['base']['unrealizedpnl']); }
      return '-';
    }
  }
  addCash_Validation: boolean = false;
  closeCashRaise() { this.OpenCR_NextPage = 'showCashRaise'; this.acc_cashRise = '0'; this.addCash_Validation = false; this.checkValidateCashRise = []; $('#AccEditModal_cashRise').modal('hide') }
  acc_cashRise: string = '0'
  postCashRaiseSettings() {
    var that = this;
    var datas;
    var getcurrent_accId = that.selectedAccList.accountId;
    var cashRaise = parseFloat(that.removeCommaWithNum(that.acc_cashRise));
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    datas = {
      "accountId": getcurrent_accId, "userid": userid, "cashRiseType": that.acc_cashRiseType, "cashRise": cashRaise
    };
    that.dataservice.PostStrategyCashRaise(datas).pipe(first()).subscribe(
      data => {
        if (data[0].toLowerCase().indexOf('locked') > -1) {
          $('#API_lockmodal').modal('show');
        } else {
          that.closeCashRaise();
          this.toastr.success(this.sharedData.checkMyAppMessage(5, 47), '', { timeOut: 5000, progressBar: false, });
          that.refreshaccounts_DB();
        }
        this.sharedData.showMatLoader.next(false);
        this.openTrade('C');
      },
      error => { this.logger.logError(error, 'PostCashRaiseSettings'); });
  }
  openTrade(Ttype:any) {
    var that = this;
    this.dataservice.GetStgyListDashboardAccs().pipe(first()).subscribe((res: any) => {
      this.cusIndexService.stgyListDashAccsData.next(res);
      var data = [...res];
      //that.dataService.GetTradeAccs(that.selectedAccList.accountId).pipe(first()).subscribe((data: any) => {
      //  if (data.length > 0) {
      //    var d: any = data[0];
      //  }
      //});
      if (isNotNullOrUndefined(this.alreadyselected_strategy)) {
        var dd = data.filter(x => x['accountId'] == this.alreadyselected_strategy['accountId'] && x['id'] == this.alreadyselected_strategy['id']);
        if (dd.length > 0) {
          this.sharedData.tradeCashType = Ttype;
          this.sharedData.selTradeData.data = dd;
          this.sharedData.selTradeData.accountInfo = dd;
          this.sharedData.selTradeData.type = "CI";
          if (isNotNullOrUndefined(dd[0]['type']) && dd[0]['type'] == "D") { this.sharedData.selTradeData.type = "DI"; }
          this.dialogController.openTrade(TradeOpenComponent);
        } else {
          var d = [];
          d.push(that.alreadyselected_strategy); ///// GetTradeAccs service for another users
          this.sharedData.tradeCashType = Ttype;
          this.sharedData.selTradeData.data = d;
          this.sharedData.selTradeData.accountInfo = d;
          this.sharedData.selTradeData.type = "CI";
          if (isNotNullOrUndefined(d[0]['type']) && d[0]['type'] == "D") { this.sharedData.selTradeData.type = "DI"; }
          this.dialogController.openTrade(TradeOpenComponent);
        }
      } else {
        var d = [];
        this.sharedData.immediateLiquidate.next(true);
        //d.push(that.alreadyselected_strategy); ///// GetTradeAccs service for another users
        this.sharedData.tradeCashType = Ttype;
        var da = Object.assign(that.selectedAccList, {});
        da['id'] = 0;
        this.sharedData.selTradeData.data = [da];
        this.sharedData.selTradeData.type = "ACCOUNT";
        this.sharedData.selTradeData.accountInfo = [da];
        //this.sharedData.selTradeData.type = "CI";
        //if (isNotNullOrUndefined(d[0]['type']) && d[0]['type'] == "D") { this.sharedData.selTradeData.type = "DI"; }
        this.dialogController.openTrade(TradeOpenComponent);
      }

    }, error => { });
  }
  checkValidateCashRise: any = [];
  ProceedWithCashRise(val:any) {
    var that = this;
   
    this.sharedData.selTradeData.dontSellflag = false;
    if (isNotNullOrUndefined(that.checkValidateCashRise[1]['donotselllist']) && that.checkValidateCashRise[1]['donotselllist'].length > 0 && that.checkValidateCashRise[1]['conditionalData'] == 'True') {
      //that.closeCashRaise();
      //this.openTrade('C');
      this.sharedData.selTradeData.dontSellflag = true;
      that.postCashRaiseSettings();
    }
    else {
      that.closeCashRaise();
      //this.openTrade('L');
       this.updateAccLiquidateinfo(true);
    }
  }
  checkLiquiDate() {
    var min:any = this.datepipe.transform(this.liquidMinDate, 'YYYYMMdd');
    var max:any = this.datepipe.transform(this.liquidMaxDate, 'YYYYMMdd');
    var liquidDate:any = this.datepipe.transform(this.liquidDate, 'YYYYMMdd');
    if (isNullOrUndefined(liquidDate) || min > liquidDate || max < liquidDate) { return false }
    else { return true }
  };
  checkAcc(type: string) {
    if (this.pauseTotalTrade) {
      this.accPauseCon = type;
      $('#accPauseProcess').modal('show');
    } else {
      this.sharedData.showMatLoader.next(true);
      this.accountService.GetDBPershing(this.selectedAccList['accountId']).then(rT => {
        if (isNotNullOrUndefined(this.selectedAccList['accountId'])) {
          let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
          var data = [{ "accid": this.selectedAccList['accountId'], "userid": userid }];
          this.dataservice.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
            this.sharedData.showMatLoader.next(false);
            var lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
            if (res.length == 0 || lockInfo.length == 0) {
              if (type == "CR") { $('#AccEditModal_cashRise').modal('show'); } else if (type == "LD") { $('#AccEditModal_liquidate').modal('show'); }
            } else { $('#API_lockmodal').modal('show'); }
          }, error => { this.sharedData.showMatLoader.next(false); });
        } else { this.sharedData.showMatLoader.next(false); }
      });
    }
  }
  pauseAcc(status:any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = {
      "accountId": this.selectedAccount,
      "userid": userid,
      "status": status,
      "slid": 0
    };
    this.dataservice.PostPauseAcc(data).pipe(first())
      .subscribe(res => {
        if (res[0].toLowerCase().indexOf('locked') > -1) {
          $('#API_lockmodal').modal('show');
        } else {
          this.getAccount();
        }
      }, error => { this.logger.logError(error, 'pauseAcc'); });
  }
  PostTradeLiquidate(data:any) {
    var that = this;

    that.dataservice.PostTradeLiquidate(data).pipe(first()).subscribe(
      data => {
        if (data[0].toLowerCase().indexOf('locked') > -1) {
          $('#API_lockmodal').modal('show');
        } else {
          this.toastr.success(this.sharedData.checkMyAppMessage(5, 48), '', { timeOut: 2000, progressBar: false, });
        }
        this.sharedData.showMatLoader.next(false);
        this.openTrade('L');
      },
      error => { this.logger.logError(error, 'PostCashRaiseSettings'); });
  }
  accTypeChange(isCheck:any, x:any, from:any) {
    if (from == 'cash') { if (x == 'I') { this.acc_cashRiseType = 'I'; } else { this.acc_cashRiseType = 'N'; } }
    else { if (x == 'I') { this.acc_liquidateType = 'I'; } else { this.acc_liquidateType = 'R'; } }
  }
  validateAccCashRaiseinfo() {
    var that = this;
    that.sharedData.selTradeData.routeflag = "C";
    var getcurrent_accId = that.selectedAccList.accountId;
    var getcurrent_slid = that.alreadyselected_strategy.id;
    this.sharedData.showMatLoader.next(true);
    var accountData:any;
    var cashRaise = parseFloat(that.removeCommaWithNum(that.acc_cashRise));
    if (cashRaise != 0) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      accountData = {
        "accountId": getcurrent_accId,
        "userid": userid,
        "slid": getcurrent_slid,
        "crValue": cashRaise
      }
    }
    if (isNotNullOrUndefined(accountData) && accountData != '') { this.PostValidateCashRise(accountData); }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 38), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }
  
  PostValidateCashRise(datas:any) {
    var that = this;
    that.OpenCR_NextPage = 'showCashRaise';
    that.dataservice.PostValidateCashRise(datas).pipe(first()).subscribe(
      (data:any) => {
        this.sharedData.showMatLoader.next(false);
        if (data.length > 1) {
          that.checkValidateCashRise = data;
          if (data[0]['conditionalData'] == 'True') {
            that.postCashRaiseSettings();
          }
          else {
            if (isNotNullOrUndefined(data[1]['donotselllist']) && data[1]['donotselllist'].length > 0 && data[1]['conditionalData'] == 'True') {
              that.OpenCR_NextPage = 'showDontSell';
            } else { that.OpenCR_NextPage = 'showLiquidate' }
          }

        } else {
          if (data[0].toLowerCase().indexOf('locked') > -1) { $('#API_lockmodal').modal('show'); }
        }

      },
      error => { that.logger.logError(error, 'PostCashRaiseSettings'); this.sharedData.showMatLoader.next(false); });
  }
  updateAccLiquidateinfo(proceedCR: boolean = false) {
    var that = this;
    var getcurrent_accId = that.selectedAccList.accountId;
    this.sharedData.selTradeData.routeflag = "L";
    var accountData:any;
    var liqType; var rebalance;
    if (isNotNullOrUndefined(this.C_AccountDetails_D) && isNotNullOrUndefined(this.C_AccountDetails_D.liqType)) { liqType = this.C_AccountDetails_D.liqType }
    else { liqType = 'I' }
    if (isNotNullOrUndefined(this.C_AccountDetails_D) && isNotNullOrUndefined(this.C_AccountDetails_D.liqRebalance)) { rebalance = this.C_AccountDetails_D.liqRebalance }
    else { rebalance = 0 }
    if (liqType == 'I') { that.liquidDate = new Date(); }
    if (proceedCR) {
      that.acc_liquidateType = 'I';
      that.liquidDate = new Date();
      that.sharedData.selTradeData.routeflag = "C";
    }
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var liquidDate = this.datepipe.transform(that.liquidDate, 'YYYY-MM-dd')
    accountData = {
      "accountId": getcurrent_accId,
      "userid": userid,
      "liquidType": that.acc_liquidateType,
      "liqRebalance": that.acc_liquidateRebalance,
      'liquidDate': liquidDate
    }

    this.checkLiqDate = false;
    if (!this.checkLiquiDate()) {
      this.checkLiqDate = true;
      var min = this.datepipe.transform(this.liquidMinDate, 'YYYY-MM-dd');
      var max = this.datepipe.transform(this.liquidMaxDate, 'YYYY-MM-dd');
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 43) + ' - ' + min + ' to ' + max + '.', '', { timeOut: 8000 });
    }
    else if (isNotNullOrUndefined(accountData) && accountData != '') {
      $('#AccEditModal_liquidate').modal('hide')
      this.sharedData.showMatLoader.next(true);
      this.PostTradeLiquidate(accountData);
    }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 39), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
  }

  addCashValidation(x:any, y:any) {
    var cashAvail = x - y;
    if (parseFloat(this.acc_cashRise.replace(/,/g, '')) > cashAvail) {
      this.addCash_Validation = true;
    }
    else {
      this.addCash_Validation = false;
    }
  }
}
