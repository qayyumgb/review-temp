import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { FormControl } from '@angular/forms';
import { scaleLinear } from 'd3';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { Subscription, first } from 'rxjs';
import { DataService } from '../../core/services/data/data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-custom-prebuild',
  templateUrl: './custom-prebuild.component.html',
  styleUrl: './custom-prebuild.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CustomPrebuildComponent implements OnInit, OnDestroy {
  pinnedCompRight: boolean = false;
  searchText = '';
  highlightList = '';
  toggleSearch: boolean = false;
  h_facData: any = [];
  StatData: any = [];
  perData: any = [];
  asOfDate: any = '-';
  sinceDate: any = '';
  indexName: string = "";
  Strategyname: string = "";
  pinnedPerformanceRight: boolean = false;
  cl: any = scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  sortedCustomerIndexGridData: any = [];
  showDefault_select: string = 'performance';
  subscriptions = new Subscription();
  showApplyChange: boolean = false;
  showPY_All_DList: any = [
    {
      "name": 'Low Volatility',
      "value": 'low-volatility',
      "showUniverse": true,
      "showTradingValue": true,
      "showStockPrice": true,
      "showHfactor": true,
      "showStocks": true,
      "showWeight": true,
      "showSelection": true,
      "showRebalance": true,
      "showBacktest": true,
      "showAccValue": true,
      "showRebComp": true,
      "showUnivWeight": true,
      "showSelectGics": false,
      "showCoreStockAmt": false,
    }, {
      "name": 'Core Index',
      "value": 'core-index',
      "showUniverse": true,
      "showTradingValue": true,
      "showStockPrice": true,
      "showSelectGics": true,
      "showCoreStockAmt": true,
      "showStocks": true,
      "showWeight": true,
      "showRebalance": true,
      "showBacktest": true,
      "showAccValue": true,
      "showHfactor": false,
      "showSelection": false,
      "showRebComp": false,
      "showUnivWeight": false,
     
    },
  ]
  selectionMatData: any = [
    { 'name': 'Largest Market Cap', 'value': 'largest market cap', 'isDisabled': false },
    { 'name': 'ETFW', 'value': 'etfw', 'isDisabled': false },
    { 'name': 'Largest Holdings Weight', 'value': 'largest holdings weight', 'isDisabled': false },
    { 'name': 'Lowest Volatility', 'value': 'lowest volatility', 'isDisabled': false },
    { 'name': 'Lowest HF Score', 'value': 'lowest human factor score', 'isDisabled': false }
  ]
  weightMatData: any = [
    { 'name': 'Market Cap', 'value': 'market cap', 'isDisabled': false },
    { 'name': 'ETFW', 'value': 'etfw', 'isDisabled': false },
    { 'name': 'EQW', 'value': 'equal', 'isDisabled': false },
    { 'name': 'Volatility', 'value': 'volatility', 'isDisabled': false },
    { 'name': 'Holdings', 'value': 'holdings', 'isDisabled': false },
    { 'name': 'HF Score', 'value': 'human factor score', 'isDisabled': false }
  ]
  universeMatData: any = [
    { 'name': 'Universe', 'value': 'universe', 'isDisabled': false },
    { 'name': 'Sector', 'value': 'sector', 'isDisabled': false },
    { 'name': 'Industry Group', 'value': 'industry group', 'isDisabled': false },
    { 'name': 'Industry', 'value': 'industry', 'isDisabled': false },
    { 'name': 'Sub Industry', 'value': 'sub industry', 'isDisabled': false }
  ]
  rebalanceMatData: any = [
    { 'name': 'Quarterly', 'value': 'quarterly', 'isDisabled': false },
    { 'name': 'Semi-annually', 'value': 'semi-annually', 'isDisabled': false },
    { 'name': 'Annually', 'value': 'annually', 'isDisabled': false }
  ]
  backTestMatData: any = [
    { 'name': 'Inception', 'value': 'inception', 'isDisabled': false },
    { 'name': '10 Years', 'value': 'ten years', 'isDisabled': false }
  ]
  factorMatData: any = {
    "name": 'h-factor',
    "selectionOptions": ['Remove', 'Select'],
    "selectionOptionsDisabled": false,
    "defaultSelection": 'Remove',
    "defaultRange": 'largest',
    "defaultType": 'percent',
    "fromValue": 10,
    "toValue": 100,
    "valueRange": [
      { 'name': 'Smallest', 'value': 'smallest', 'isDisabled': false },
      { 'name': 'Largest', 'value': 'largest', 'isDisabled': false },
      { 'name': 'Range', 'value': 'range', 'isDisabled': false }],
    "type": [
      { 'name': 'Percentage', 'value': 'percent', 'isDisabled': false },
      { 'name': 'Count', 'value': 'count', 'isDisabled': false },
      { 'name': 'Value', 'value': 'value', 'isDisabled': false }],
  }
  volatilityDataList: any = [
    { 'name': 'Low Volatility', 'value': 'low-volatility' },
    { 'name': 'Core Index', 'value': 'core-index' }]
  formNameToPropertyMap: { [key: string]: keyof CustomPrebuildComponent } = {
    selectBy: 'selected_Selection',
    weightBy: 'selected_Weight',
    rebalanceBy: 'selected_Rebalance',
    backtestBy: 'selected_Backtest',
    universeBy: 'selectFrom_factor',
    gicsBy: 'selectFrom_gics',
  };
  defaultDropdownValues = {
    selectBy: 'lowest volatility',
    weightBy: 'volatility',
    rebalanceBy: 'quarterly',
    backtestBy: 'ten years',
    universeBy: 'universe',
    gicsBy: 'industry group',
  };
  constructor(private toastr: ToastrService, private dataService: DataService, public sharedData: SharedDataService, public cusIndexService: CustomIndexService) { }
  displayFieldList: any = [];
  ngOnInit() {
    var that = this;
    setTimeout(() => {
      that.sharedData.showCircleLoader.next(false);
      that.sharedData.showMatLoader.next(false);
    }, 2000);
    this.displayFieldList = [...this.showPY_All_DList].filter((x: any) => x.name.toLowerCase() == this.selectedPYListName.toLowerCase())
    
    var equityIndexe = this.cusIndexService.equityIndexeMasData
      .subscribe((res: boolean) => { this.loadUnivers(); });
    this.subscriptions.add(equityIndexe);

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(2033); };
    });
    this.subscriptions.add(unSubUTRPData);
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  universe: any = new FormControl();
  universeList: any = [];
  selectedUniverse: any = [];
  selectedPYListName: string = 'Low Volatility';
  selectedPYListValue: string = 'low-volatility';
  selectPYList(data:any) {
    this.selectedPYListName = data.name;
    this.selectedPYListValue = data.value;
    this.isOpenFactorDrpdwn = false;
    /*** filter showPY_All_DList **/
    this.displayFieldList = [...this.showPY_All_DList].filter((x: any) => x.name.toLowerCase() == this.selectedPYListName.toLowerCase())
    //console.log('displayFieldList', this.displayFieldList);
    /*** filter showPY_All_DList **/
  }
  loadUnivers() {
    var data: any = [...this.cusIndexService.equityIndexeMasData.value];
    if (data.length > 0) {
      data = data.filter((obj1: any, i: any, arr: any) => arr.findIndex((obj2: any) => (obj2.assetId === obj1.assetId)) === i);
      this.universeList = data.filter((x: any) => x.universe == "Equity Universe" && x.country == "USA" && x.erfFlag == 'Y');
    } else { this.universeList = []; }
  }

  universeName(d: any) {
    if (isNotNullOrUndefined(d['universeId'])) {
      var fil = [...this.universeList].filter((dd: any) => dd['assetId'] == d['universeId']);
      if (fil.length > 0 && isNotNullOrUndefined(fil[0]['name'])) { return fil[0]['name'] } else {return '-' }
    } else { return '-' }
  }

  universeChange(ev: any) {
    if (isNotNullOrUndefined(ev.value)) { this.selectedUniverse = ev.value }
    if (this.selectedUniverse.length > 0) { this.showApplyChange = true } else { this.showApplyChange = false }
  }

  hfFromValue: any = 10;
  hfToInput: any = 100;
  selectedOptionFactor: string = 'per';
  hfError: string = "";

  volfromValue: any = 0;
  voltoValue: any = 100;
  selectedOptionVol: string = 'per';

  selected_Weight: string = this.defaultDropdownValues.weightBy;
  selected_Selection: string = this.defaultDropdownValues.selectBy;
  selected_Rebalance: string = this.defaultDropdownValues.rebalanceBy;
  selected_Backtest: string = this.defaultDropdownValues.backtestBy;
  selected_Gics: string = this.defaultDropdownValues.gicsBy;
  current_account_value: number = 1000000.00;
  n_final_stocks: any = 100;
  selectFrom_factor: string = 'universe';
  selectFrom_gics: string = 'universe';
  tradingValue: any = 0;
  stockPriceEligible: any = 0;
  selectedOptionHighest_Lowest: string = 'largest';
  receiveUnivSelectedList(data: any) {
    this.selectedUniverse = data;
    if (this.selectedUniverse.length > 0) { this.showApplyChange = true } else { this.showApplyChange = false }
  }
  receiveMatOptionSelectedList(data: any, formName: string) {
    var property = this.formNameToPropertyMap[formName];
    if (property) {
      (this as any)[property] = data;
    } else {
      console.warn(`No mapping found for formName: ${formName}`);
    }
  }

  onOptionChange(event: any, val: string): void {
    if (val = 'vol') {
      this.volfromValue = 0;
      this.voltoValue = 100;
      this.topBtmSlide = false;
    } else {
      this.hfError = '';
      this.hfFromValue = 0;
      this.hfToInput = 100;
      this.topBtmSlideFactor = false;
    }
  }
  hfData: any;
  receiveHFactorData(data: any) {
    this.hfData = data;
    this.hfFromValue = data['fromValue'];
    this.hfToInput = data['toValue'];
  }
  isOpenFactorDrpdwn: boolean = false;
  openFactorList() { this.isOpenFactorDrpdwn = !this.isOpenFactorDrpdwn }
  componentClick() { }
  openSearch() { }
  topBtmSlide: boolean = false;
  topBtmSlideFactor: boolean = false;
  topBtmSlideFactorText: string = 'Remove';
  onToggleAscending() {
    this.topBtmSlide = !this.topBtmSlide;
  }
  onToggleAscendingFactor() {
    this.topBtmSlideFactor = !this.topBtmSlideFactor;
    if (this.topBtmSlideFactor) { this.topBtmSlideFactorText = 'Select' }
    else { this.topBtmSlideFactorText = 'Remove' }
  }

  perKeyDown(e: any) {
    if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
    if (e.key == '.') { e.preventDefault(); }
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode >= 35 && e.keyCode <= 39) || (/^[0-9]*$/.test(e.key))) { } else { e.preventDefault(); }
  };

  countKeyDown(e: any) {
    var val = e.target?.value;
    if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
    if (e.key == '.') { e.preventDefault(); }
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) || (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) || (e.keyCode >= 35 && e.keyCode <= 39)) { }
    else if (e.target?.maxLength <= val.length) { e.preventDefault(); }
  }

  valKeyDown(e: any) {
    var val = e.target?.value;
    if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) || (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) || (e.keyCode >= 35 && e.keyCode <= 39)) { }
    else if (e.target?.maxLength <= val.length) { e.preventDefault(); }
  }

  hfactval(e: any, place: string, selop: string) {
    if (selop == 'value' && (parseFloat(this.hfFromValue) >= parseFloat(this.hfToInput))) { this.hfError = place }
    else if (selop == 'per' && parseInt(this.hfFromValue) >= parseInt(this.hfToInput)) { this.hfError = place}
    else if (selop == 'per' && place == 'endval' && 100 < parseInt(this.hfToInput)) { this.hfError = place }
    else if (this.hfFromValue === "" || this.hfToInput === "") { this.hfError = place }
    else { this.hfError = '' }
  }

  checkErr(val: any) {
    var hfFromValue: any = this.hfFromValue;
    var n_final_stocks: any = this.n_final_stocks;
    var current_account_value: any = this.current_account_value;
    hfFromValue = (isNotNullOrUndefined(hfFromValue) && hfFromValue !== "") ? parseInt(hfFromValue) : null;
    n_final_stocks = (isNotNullOrUndefined(n_final_stocks) && n_final_stocks !== "") ? parseInt(n_final_stocks) : null;
    current_account_value = (isNotNullOrUndefined(current_account_value) && current_account_value !== "") ? parseFloat(current_account_value) : null;
    this.n_final_stocksErr = (!isNotNullOrUndefined(n_final_stocks));
    this.curAccValueErr = (isNotNullOrUndefined(current_account_value) && current_account_value >= 1000000) ? false : true;
    this.hfFromValueErr = (isNotNullOrUndefined(hfFromValue) && hfFromValue < 100) ? false : true;
  }

  n_final_stocksErr: boolean = false;
  curAccValueErr: boolean = false;
  hfFromValueErr: boolean = false;
  return_rebalance_components: boolean = false;
  return_universe_mix: boolean = false;
  min_stock_price: number = 3;
  core_stocks_amount: number = 10;
  minSixmonth_avgDaily: number = 6;
  holdingData: any = [];
  universeMixData: any = [];
  applChg() {
    this.holdingData = [];
    this.universeMixData = [];
    var hf_index_strategy: any = this.hfData['selection'];
    var hf_direction: any = this.hfData['range'];
    var hf_value_type: any = this.hfData['type'];
    var hfFromValue: any = this.hfData['fromValue'];
    var hf_max_value: any = this.hfData['toValue'];
    var n_final_stocks: any = this.n_final_stocks;
    var current_account_value: any = this.current_account_value;
    hf_max_value = (isNotNullOrUndefined(hf_direction) && hf_direction == 'range') ? hf_max_value : (hf_value_type == 'value') ? 0.99 : 0;
    hfFromValue = (isNotNullOrUndefined(hfFromValue) && hfFromValue !== "") ? hfFromValue : null;
    n_final_stocks = (isNotNullOrUndefined(n_final_stocks) && n_final_stocks !== "") ? parseInt(n_final_stocks) : null;
    current_account_value = (isNotNullOrUndefined(current_account_value) && current_account_value !== "") ? parseFloat(current_account_value) : null;
    var data: any = {
      "hf_index_strategy": hf_index_strategy.toLowerCase(),
      "hf_direction": hf_direction,
      "hf_value_type": hf_value_type,
      "hf_values": hfFromValue,
      "hf_max_value": hf_max_value,
      "stock_selection_amount": n_final_stocks,
      "hf_index_strategy_from": (isNullOrUndefined(this.selectFrom_factor) || this.selectFrom_factor === '') ? 'None' : this.selectFrom_factor,
      "stock_selection_category": this.selected_Selection,
      "universe_ids": this.selectedUniverse,
      "min_stock_price": this.min_stock_price,
      "min_six_month_average_daily_trading_value_millions": this.minSixmonth_avgDaily,
      "weight": this.selected_Weight,
      "rebalance_frequency": this.selected_Rebalance,
      "back_test_length": this.selected_Backtest,
      "current_account_value": current_account_value,
      "return_rebalance_components": this.return_rebalance_components,
      "return_universe_mix": this.return_universe_mix,
    };

    var coreData: any = {
      "universe_ids": this.selectedUniverse,
      "min_stock_price": this.min_stock_price,
      "min_six_month_average_daily_trading_value_millions": this.minSixmonth_avgDaily,
      "core_stocks_amount": this.core_stocks_amount,
      "selection_gics": this.selected_Gics,
      "weight": this.selected_Weight,
      "rebalance_frequency": this.selected_Rebalance,
      "stock_selection_amount": n_final_stocks,
      "back_test_length": this.selected_Backtest,
      "current_account_value": current_account_value,
      "return_rebalance_components": this.return_rebalance_components,
      "return_universe_mix": this.return_universe_mix,
    };

    this.n_final_stocksErr = (!isNotNullOrUndefined(n_final_stocks));
    this.curAccValueErr = (isNotNullOrUndefined(current_account_value) && current_account_value >= 1000000) ? false : true;
    this.hfFromValueErr = (isNotNullOrUndefined(hfFromValue) && hfFromValue < 100) ? false : true;
    this.showDefault_select = 'performance';
    if (isNotNullOrUndefined(n_final_stocks) && isNotNullOrUndefined(current_account_value) && current_account_value >= 1000000) {
      this.sharedData.showMatLoader.next(true);

      if (this.selectedPYListValue == 'low-volatility') {
        this.dataService.postLowVolatilityPerformance(data).pipe(first()).subscribe((res: any) => {
          this.sharedData.showMatLoader.next(false);
          var performance: any = [];
          if (isNotNullOrUndefined(res['performance'])) { performance = res['performance']; }
          if (isNotNullOrUndefined(res['holdings'])) { this.holdingData = res['holdings']; };
          if (isNotNullOrUndefined(res['universeMix'])) { this.universeMixData = res['universeMix']; };
          if (performance.length > 1) { this.formatPerStatData([performance[1]], [performance[0]]); } else {
            this.h_facData = [];
            this.perData = [];
            this.StatData = [];
          };
        }, (error: any) => {
          this.h_facData = [];
          this.perData = [];
          this.StatData = [];
          this.sharedData.showMatLoader.next(false);
          var msg: string = (isNotNullOrUndefined(error)) ? error : 'server issues try again..';
          this.toastr.success(msg, '', { timeOut: 4000 });
        })
      } else if (this.selectedPYListValue == 'core-index') {
        this.dataService.postCorePerformance(coreData).pipe(first()).subscribe((res: any) => {
          //console.log('postCorePerformance', res);
          this.sharedData.showMatLoader.next(false);
          var performance: any = [];
          if (isNotNullOrUndefined(res['performance'])) { performance = res['performance']; }
          if (isNotNullOrUndefined(res['holdings'])) { this.holdingData = res['holdings']; };
          if (isNotNullOrUndefined(res['universeMix'])) { this.universeMixData = res['universeMix']; };
          if (performance.length > 1) { this.formatPerStatData([performance[1]], [performance[0]]); } else {
            this.h_facData = [];
            this.perData = [];
            this.StatData = [];
          };
        }, (error: any) => {
          this.h_facData = [];
          this.perData = [];
          this.StatData = [];
          this.sharedData.showMatLoader.next(false);
          var msg: string = (isNotNullOrUndefined(error)) ? error : 'server issues try again..';
          this.toastr.success(msg, '', { timeOut: 4000 });
        })
      }


    } else { console.log(data, 'check data') }
    this.sharedData.userEventTrack('PY Strategies ', "calculate", 'calculate', 'calculate Click');
  }
  formatPerStatData(resData: any, UIData: any) {
    var that = this;
    this.h_facData = [];
    this.perData = [];
    this.StatData = [];
    this.indexName = 'Universe';
    if (isNotNullOrUndefined(resData)) {
      this.asOfDate = (isNotNullOrUndefined(resData[0].date)) ? resData[0].date : '-';
      try {
        var datas = {
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
              'Statistics': 'Turnover', 'ETFticker': that.conv2percentage1(that.checkDataWithKey(resData, 'turnover')),
              'yourIndex': that.conv2percentage1(UIData == undefined ? that.checkDataWithKey(resData, 'turnover') : UIData.length == 0 ? "-" : that.checkDataWithKey(UIData, 'turnover'))
            },
          ],
        }

        this.h_facData = [];
        this.perData = [...datas['Performance']];
        this.StatData = [...datas['Statistics']];
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

}
