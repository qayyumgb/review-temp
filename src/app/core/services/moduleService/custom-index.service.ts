import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { DataService } from '../data/data.service';
import {  SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../sharedData/shared-data.service';
import { formatDate } from '@angular/common';
import { LoggerService } from '../logger/logger.service';
import { ascending, descending, format, max, median, min, scaleLinear } from 'd3';
import { AccountService } from './account.service';
declare var $: any;
import * as d3 from 'd3';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from '../../../view/custom-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { Router } from '@angular/router';
import { ImpliedRevenueComponent } from '../../../view/universeDialogsModule/implied-revenue/implied-revenue.component';
@Injectable({
  providedIn: 'root'
})
export class CustomIndexService {
  myIndEqindex = [];
  removedcountCI: number = 0;

  checkStgyAlreadyTraded: BehaviorSubject<boolean>;
  _checkStgyAlreadyTraded: boolean = false;

  updateBtnTrigger: BehaviorSubject<boolean>;
  _updateBtnTrigger: boolean = false;

  bldMyIndAccountData: BehaviorSubject<any>;
  _bldMyIndAccountData: any = [];

  bldIndAccountData: BehaviorSubject<any>;
  _bldIndAccountData: any = [];

  equityIndexeMasData: BehaviorSubject<any>;
  _equityIndexeMasData: any = [];

  BuildMyIndexOptions: any = [];

  stgyListDashAccsData: BehaviorSubject<any>;
  _stgyListDashAccsData: any = [];

  factorMasterData: BehaviorSubject<any>;
  _factorMasterData: any = [];

  stgyDefalutData = { cashTarget: 2, rebalanceType: 'q' };

  customIndexBrcmData: BehaviorSubject<any>;
  _customIndexBrcmData: any = [];

  enableTrading_factsheet: BehaviorSubject<string>;
  _enableTrading_factsheet: string = "N";

  diStrFactsheetAccData: BehaviorSubject<any>;
  _diStrFactsheetAccData: any = [];

  getBetaIndex_custom: BehaviorSubject<any>;
  _getBetaIndex_custom: any = [];

  calculateTrigger: BehaviorSubject<boolean>;
  _calculateTrigger: boolean = false;

  startIndexClick_custom: BehaviorSubject<boolean>;
  _startIndexClick_custom: boolean = false;

  showReviewIndexLoaded: BehaviorSubject<boolean>;
  _showReviewIndexLoaded: boolean = false;

  showBackButton_bcrumb: BehaviorSubject<boolean>;
  _showBackButton_bcrumb: boolean = false;

  showRightSideGrid_custom: BehaviorSubject<boolean>;
  _showRightSideGrid_custom: boolean = false;

  customizeSelectedIndex_custom: BehaviorSubject<any>;
  _customizeSelectedIndex_custom: any;

  forcepopupStrategy: BehaviorSubject<boolean>;
  _forcepopupStrategy: boolean = false;

  checkExistingStrategy: BehaviorSubject<any>;
  _checkExistingStrategy: any = [];

  getBetaIndex_prebuilt: BehaviorSubject<any>;
  _getBetaIndex_prebuilt: any = [];

  factorCircleFlagData: BehaviorSubject<factorCircleFlag>;
  _factorCircleFlagData: factorCircleFlag = new factorCircleFlag;

  errorList_custom: BehaviorSubject<any>;
  _errorList_custom: any;

  currentSList: BehaviorSubject<any>;
  _currentSList: any;

  selCompany: BehaviorSubject<any>;
  _selCompany: any;

  customIndexData: BehaviorSubject<any>;
  _customIndexData: any = [];

  taxharvestData_customIndex: BehaviorSubject<any>;
  _taxharvestData_customIndex: any = [];

  selectedCIIndFactsheet: BehaviorSubject<any>;
  _selectedCIIndFactsheet: any;

  selectedDirIndStry: BehaviorSubject<any>;
  _selectedDirIndStry: any;


  notifyDiClick: BehaviorSubject<boolean>;
  _notifyDiClick: boolean = false;

  returnAsOfDate: BehaviorSubject<string>;
  _returnAsOfDate: string = '';

  custToolSelectByValue: BehaviorSubject<number>;
  _custToolSelectByValue: number = 0;

  custToolWeightByValue: BehaviorSubject<number>;
  _custToolWeightByValue: number = 0;

  custToolNoOfComp: BehaviorSubject<number>;
  _custToolNoOfComp: number = 0;

  custToolWeightLimit: BehaviorSubject<number>;
  _custToolWeightLimit: number = 0;

  custToolCashTarget: BehaviorSubject<number>;
  _custToolCashTarget: number = 0;

  custToolRebalanceType: BehaviorSubject<string>;
  _custToolRebalanceType: string = '';

  custToolTaxEffAwareness: BehaviorSubject<string>;
  _custToolTaxEffAwareness: string = '';

  custToolWeightFlag: BehaviorSubject<string>;
  _custToolWeightFlag: string = '';

  bldMyIndselWeightLimit: BehaviorSubject<any>;
  _bldMyIndselWeightLimit: any;

  custToolName: BehaviorSubject<string>;
  _custToolName: string = '';

  custToolShortname: BehaviorSubject<string>;
  _custToolShortname: string = '';

  custToolDescription: BehaviorSubject<string>;
  _custToolDescription: string = '';

  selTabLeftMenu: BehaviorSubject<string>;
  _selTabLeftMenu: string = 'Alpha';

  PrebuiltMainTab = [{ name: 'Equities', group: 'Beta' }, { name: 'Fixed Income', group: 'Fixed' }];

  CIEnabletradinglist: BehaviorSubject<any>;
  _CIEnabletradinglist: any = [];

  exclusionCompData: BehaviorSubject<any>
  _exclusionCompData: any = [];

  minCustInd = { count: 0, message: '' };

  comFactorsData: BehaviorSubject<any>;
  _comFactorsData: any = [];

  //filter DATA

  PostStrategyFactorsData: BehaviorSubject<any>;
  _PostStrategyFactorsData: any = [];

  initPostStrategyFactorsData: BehaviorSubject<any>;
  _initPostStrategyFactorsData: any = [];

  indexStepsGridData: BehaviorSubject<any>;
  _indexStepsGridData: any = [];

  indexStepsLoaded: BehaviorSubject<boolean>;
  _indexStepsLoaded: boolean = false;

  remCompData: BehaviorSubject<any>
  _remCompData: any = [];

  companyExList: BehaviorSubject<any>
  _companyExList: any = [];

  remGicsData: BehaviorSubject<any>
  _remGicsData: any = [];

  gicsExList: BehaviorSubject<any>
  _gicsExList: any = [];

  strategyList: BehaviorSubject<any>;
  _strategyList: any = [];

  currentSNo: BehaviorSubject<number>;
  _currentSNo: any = -1;

  applyTrigger: BehaviorSubject<boolean>;
  _applyTrigger: boolean = false;

  clonedStratTrigger: BehaviorSubject<boolean>;
  _clonedStratTrigger: boolean = false;

  alphaFactorChangeDetection: BehaviorSubject<object>;
  _alphaFactorChangeDetection: rangeTriger = { type: "", flag: false };

  performanceUIndexList: BehaviorSubject<any>
  _performanceUIndexList: any = [];

  performanceETFRList: BehaviorSubject<any>
  _performanceETFRList: any = [];

  performanceTenYrETFRList: BehaviorSubject<any>
  _performanceTenYrETFRList: any = [];

  calculate_active: BehaviorSubject<boolean>;
  _calculate_active: boolean = false;

  CIcalculateBtnEnable: boolean = false;

  factorChangeDetection: BehaviorSubject<object>;
  _factorChangeDetection: rangeTriger = { type: "", flag: false };

  custSelectFactor: BehaviorSubject<any>;
  _custSelectFactor: any;

  custSelectFactorData: BehaviorSubject<any>
  _custSelectFactorData: any = [];

  cusIndTempStrategyData: BehaviorSubject<any>;
  _cusIndTempStrategyData: any = [];

  reviewIndexClickedData: BehaviorSubject<any>;
  _reviewIndexClickedData: any = [];

  indexStepsTaxData: BehaviorSubject<any>;
  _indexStepsTaxData: any = [];

  getCumulativeAnnData: BehaviorSubject<any>
  _getCumulativeAnnData: any = [];

  constructor(private dataService: DataService, private logger: LoggerService, public dialog: MatDialog, private router: Router,
    private sharedData: SharedDataService, private accountService: AccountService, private toastr: ToastrService) {

    this.checkStgyAlreadyTraded = new BehaviorSubject<boolean>(this._checkStgyAlreadyTraded);
    this.checkStgyAlreadyTraded.subscribe(data => { this._checkStgyAlreadyTraded = data; });

    this.updateBtnTrigger = new BehaviorSubject<boolean>(this._updateBtnTrigger);
    this.updateBtnTrigger.subscribe(data => { this._updateBtnTrigger = data; });

    this.indexStepsTaxData = new BehaviorSubject<any>(this._indexStepsTaxData);
    this.indexStepsTaxData.subscribe(data => { this._indexStepsTaxData = data; });

    this.custSelectFactor = new BehaviorSubject<any>(this._custSelectFactor);
    this.custSelectFactor.subscribe(data => { this._custSelectFactor = data; });

    this.custSelectFactorData = new BehaviorSubject<any>(this._custSelectFactorData);
    this.custSelectFactorData.subscribe(data => { this._custSelectFactorData = data; });

    this.cusIndTempStrategyData = new BehaviorSubject<any>(this._cusIndTempStrategyData);
    this.cusIndTempStrategyData.subscribe(data => { this._cusIndTempStrategyData = data; });

    this.reviewIndexClickedData = new BehaviorSubject<any>(this._reviewIndexClickedData);
    this.reviewIndexClickedData.subscribe(data => { this._reviewIndexClickedData = data; });

    this.factorChangeDetection = new BehaviorSubject<object>(this._factorChangeDetection);
    this.factorChangeDetection.subscribe((data: any) => { this._factorChangeDetection = data; });

    this.calculate_active = new BehaviorSubject<boolean>(this._calculate_active);
    this.calculate_active.subscribe(data => { this._calculate_active = data; });

    this.forcepopupStrategy = new BehaviorSubject<boolean>(this._forcepopupStrategy);
    this.forcepopupStrategy.subscribe(data => { this._forcepopupStrategy = data; });

    this.strategyList = new BehaviorSubject<any>(this._strategyList);
    this.strategyList.subscribe(data => { this._strategyList = data; });

    this.custToolWeightLimit = new BehaviorSubject<number>(this._custToolWeightLimit);
    this.custToolWeightLimit.subscribe(data => { this._custToolWeightLimit = data; });

    this.custToolSelectByValue = new BehaviorSubject<number>(this._custToolSelectByValue);
    this.custToolSelectByValue.subscribe(data => { this._custToolSelectByValue = data; });

    this.custToolWeightByValue = new BehaviorSubject<number>(this._custToolWeightByValue);
    this.custToolWeightByValue.subscribe(data => { this._custToolWeightByValue = data; });

    this.custToolNoOfComp = new BehaviorSubject<number>(this._custToolNoOfComp);
    this.custToolNoOfComp.subscribe(data => { this._custToolNoOfComp = data; });

    this.custToolCashTarget = new BehaviorSubject<number>(this._custToolCashTarget);
    this.custToolCashTarget.subscribe(data => { this._custToolCashTarget = data; });

    this.custToolRebalanceType = new BehaviorSubject<string>(this._custToolRebalanceType);
    this.custToolRebalanceType.subscribe(data => { this._custToolRebalanceType = data; });

    this.custToolTaxEffAwareness = new BehaviorSubject<string>(this._custToolTaxEffAwareness);
    this.custToolTaxEffAwareness.subscribe(data => { this._custToolTaxEffAwareness = data; });

    this.custToolWeightFlag = new BehaviorSubject<string>(this._custToolWeightFlag);
    this.custToolWeightFlag.subscribe(data => { this._custToolWeightFlag = data; });

    this.bldMyIndselWeightLimit = new BehaviorSubject<any>(this._bldMyIndselWeightLimit);
    this.bldMyIndselWeightLimit.subscribe(data => { this._bldMyIndselWeightLimit = data; });

    this.custToolName = new BehaviorSubject<string>(this._custToolName);
    this.custToolName.subscribe(data => { this._custToolName = data; });

    this.custToolShortname = new BehaviorSubject<string>(this._custToolShortname);
    this.custToolShortname.subscribe(data => { this._custToolShortname = data; });

    this.custToolDescription = new BehaviorSubject<string>(this._custToolDescription);
    this.custToolDescription.subscribe(data => { this._custToolDescription = data; });

    this.selTabLeftMenu = new BehaviorSubject<string>(this._selTabLeftMenu);
    this.selTabLeftMenu.subscribe(data => { this._selTabLeftMenu = data; });

    this.performanceETFRList = new BehaviorSubject<any>(this._performanceETFRList);
    this.performanceETFRList.subscribe(data => { this._performanceETFRList = data; });

    this.performanceTenYrETFRList = new BehaviorSubject<any>(this._performanceTenYrETFRList);
    this.performanceTenYrETFRList.subscribe(data => { this._performanceTenYrETFRList = data; });

    this.performanceUIndexList = new BehaviorSubject<any>(this._performanceUIndexList);
    this.performanceUIndexList.subscribe(data => { this._performanceUIndexList = data; });

    this.comFactorsData = new BehaviorSubject<any>(this._comFactorsData);
    this.comFactorsData.subscribe(data => { this._comFactorsData = data; });

    this.applyTrigger = new BehaviorSubject<boolean>(this._applyTrigger);
    this.applyTrigger.subscribe(data => { this._applyTrigger = data; });

    this.clonedStratTrigger = new BehaviorSubject<boolean>(this._clonedStratTrigger);
    this.clonedStratTrigger.subscribe(data => { this._clonedStratTrigger = data; });

    this.indexStepsLoaded = new BehaviorSubject<boolean>(this._indexStepsLoaded);
    this.indexStepsLoaded.subscribe(data => { this._indexStepsLoaded = data; });

    this.currentSNo = new BehaviorSubject<any>(this._currentSNo);
    this.currentSNo.subscribe(data => { this._currentSNo = data; });

    this.PostStrategyFactorsData = new BehaviorSubject<any>(this._PostStrategyFactorsData);
    this.PostStrategyFactorsData.subscribe(data => { this._PostStrategyFactorsData = data; });

    this.initPostStrategyFactorsData = new BehaviorSubject<any>(this._initPostStrategyFactorsData);
    this.initPostStrategyFactorsData.subscribe(data => { this._initPostStrategyFactorsData = data; });

    this.remCompData = new BehaviorSubject<any>(this._remCompData);
    this.remCompData.subscribe(data => { this._remCompData = data; });

    this.companyExList = new BehaviorSubject<any>(this._companyExList);
    this.companyExList.subscribe(data => { this._companyExList = data; });

    this.remGicsData = new BehaviorSubject<any>(this._remGicsData);
    this.remGicsData.subscribe(data => { this._remGicsData = data; });

    this.gicsExList = new BehaviorSubject<any>(this._gicsExList);
    this.gicsExList.subscribe(data => { this._gicsExList = data; });

    this.bldMyIndAccountData = new BehaviorSubject<any>(this._bldMyIndAccountData);
    this.bldMyIndAccountData.subscribe(data => { this._bldMyIndAccountData = data; });

    this.bldIndAccountData = new BehaviorSubject<any>(this._bldIndAccountData);
    this.bldIndAccountData.subscribe(data => { this._bldIndAccountData = data; });

    this.equityIndexeMasData = new BehaviorSubject<any>(this._equityIndexeMasData);
    this.equityIndexeMasData.subscribe(data => { this._equityIndexeMasData = data; });

    this.factorMasterData = new BehaviorSubject<any>(this._factorMasterData);
    this.factorMasterData.subscribe(data => { this._factorMasterData = data; });

    this.stgyListDashAccsData = new BehaviorSubject<any>(this._stgyListDashAccsData);
    this.stgyListDashAccsData.subscribe(data => { this._stgyListDashAccsData = data; });

    this.customIndexBrcmData = new BehaviorSubject<any>(this._customIndexBrcmData);
    this.customIndexBrcmData.subscribe(data => { this._customIndexBrcmData = data; });

    this.enableTrading_factsheet = new BehaviorSubject<string>(this._enableTrading_factsheet);
    this.enableTrading_factsheet.subscribe(data => { this._enableTrading_factsheet = data; });

    this.CIEnabletradinglist = new BehaviorSubject<any>(this._CIEnabletradinglist);
    this.CIEnabletradinglist.subscribe(data => { this._CIEnabletradinglist = data; });

    this.diStrFactsheetAccData = new BehaviorSubject<any>(this._diStrFactsheetAccData);
    this.diStrFactsheetAccData.subscribe(data => { this._diStrFactsheetAccData = data; });

    this.getBetaIndex_custom = new BehaviorSubject<any>(this._getBetaIndex_custom);
    this.getBetaIndex_custom.subscribe(data => { this._getBetaIndex_custom = data; });

    this.customIndexData = new BehaviorSubject<any>(this._customIndexData);
    this.customIndexData.subscribe(data => { this._customIndexData = data; });

    this.taxharvestData_customIndex = new BehaviorSubject<any>(this._taxharvestData_customIndex);
    this.taxharvestData_customIndex.subscribe(data => { this._taxharvestData_customIndex = data; });

    this.startIndexClick_custom = new BehaviorSubject<boolean>(this._startIndexClick_custom);
    this.startIndexClick_custom.subscribe(data => { this._startIndexClick_custom = data; });

    this.calculateTrigger = new BehaviorSubject<boolean>(this._calculateTrigger);
    this.calculateTrigger.subscribe(data => { this._calculateTrigger = data; });

    this.showReviewIndexLoaded = new BehaviorSubject<boolean>(this._showReviewIndexLoaded);
    this.showReviewIndexLoaded.subscribe(data => { this._showReviewIndexLoaded = data; });

    this.showBackButton_bcrumb = new BehaviorSubject<boolean>(this._showBackButton_bcrumb);
    this.showBackButton_bcrumb.subscribe(data => { this._showBackButton_bcrumb = data; });

    this.customizeSelectedIndex_custom = new BehaviorSubject<any>(this._customizeSelectedIndex_custom);
    this.customizeSelectedIndex_custom.subscribe(data => { this._customizeSelectedIndex_custom = data; });

    this.errorList_custom = new BehaviorSubject<any>(this._errorList_custom);
    this.errorList_custom.subscribe(data => { this._errorList_custom = data; });

    this.currentSList = new BehaviorSubject<any>(this._currentSList);
    this.currentSList.subscribe(data => { this._currentSList = data; });

    this.selCompany = new BehaviorSubject<any>(this._selCompany);
    this.selCompany.subscribe(data => { this._selCompany = data; });

    this.selectedCIIndFactsheet = new BehaviorSubject<any>(this._selectedCIIndFactsheet);
    this.selectedCIIndFactsheet.subscribe(data => { this._selectedCIIndFactsheet = data; });

    this.selectedDirIndStry = new BehaviorSubject<any>(this._selectedDirIndStry);
    this.selectedDirIndStry.subscribe(data => { this._selectedDirIndStry = data; });

    this.showRightSideGrid_custom = new BehaviorSubject<boolean>(this._showRightSideGrid_custom);
    this.showRightSideGrid_custom.subscribe(data => { this._showRightSideGrid_custom = data; });

    this.notifyDiClick = new BehaviorSubject<boolean>(this._notifyDiClick);
    this.notifyDiClick.subscribe(data => { this._notifyDiClick = data; });

    this.alphaFactorChangeDetection = new BehaviorSubject<object>(this._alphaFactorChangeDetection);
    this.alphaFactorChangeDetection.subscribe((data:any) => { this._alphaFactorChangeDetection = data; });

    this.returnAsOfDate = new BehaviorSubject<string>(this._returnAsOfDate);
    this.returnAsOfDate.subscribe(data => { this._returnAsOfDate = data; });

    this.exclusionCompData = new BehaviorSubject<any>(this._exclusionCompData);
    this.exclusionCompData.subscribe(data => { this._exclusionCompData = data; });

    this.getBetaIndex_prebuilt = new BehaviorSubject<any>(this._getBetaIndex_prebuilt);
    this.getBetaIndex_prebuilt.subscribe(data => { this._getBetaIndex_prebuilt = data; });

    this.checkExistingStrategy = new BehaviorSubject<any>(this._checkExistingStrategy);
    this.checkExistingStrategy.subscribe(data => { this._checkExistingStrategy = data; });

    this.factorCircleFlagData = new BehaviorSubject<factorCircleFlag>(this._factorCircleFlagData);
    this.factorCircleFlagData.subscribe(data => { this._factorCircleFlagData = data; });

    this.indexStepsGridData = new BehaviorSubject<any>(this._indexStepsGridData);
    this.indexStepsGridData.subscribe(data => { this._indexStepsGridData = data; });

    this.getCumulativeAnnData = new BehaviorSubject<any>(this._getCumulativeAnnData);
    this.getCumulativeAnnData.subscribe(data => { this._getCumulativeAnnData = data; });
  }

  getFactorMasterData() {
    this.dataService.GetFactorMaster().pipe(first()).subscribe((data:any) => {
        var filtereddt = data.filter((x: any) => x.sortno != null);
        this.factorMasterData.next(filtereddt);
      }, error => {
        this.factorMasterData.next([]);
        this.logger.logError(error, 'getFactorMasterData');
      });
  }
  checkShowStockPrice() { if (isNullOrUndefined(this._selCompany) || this._selCompany.SelISIN == "") { return false } else { return true } };
  checkAccountFilter(ar1: any, ar2: any, slid: any) {
    var postAccData: any[] = [];
    ar1.forEach((item:any): void => {
      var filDt = ar2.filter((x: { accountId: any; }) => x.accountId == item.accountId);
      if (item['status'] == 'A') {
        var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == slid && x.accountId == item.accountId);
        var dashAccs = [...this.stgyListDashAccsData.value].filter(x => x.id == slid && x.accountId == item.accountId);
        if (notifyId.length > 0 && notifyId[0]['notifyStatus'] == 'F') { postAccData.push(item) }
        else if (dashAccs.length > 0 && dashAccs[0]['factsheetStatus'] == 'N') { postAccData.push(item) }
        else if (filDt.length > 0) {
          try {
            if (filDt[0]["cashTarget"] == item["cashTarget"] &&
              //filDt[0]["transitionno"] == item["transitionno"] &&
              filDt[0]["taxType"] == item["taxType"] &&
              filDt[0]["taxTarget"] == item["taxTarget"] &&
              filDt[0]["taxBufferGainTarget"] == item["taxBufferGainTarget"] &&
              filDt[0]["transitionGainTgt"] == item["transitionGainTgt"] &&
              formatDate(filDt[0]["transitionDate"], 'yyyy/MM/dd', 'en-US') == item["transitionDate"] &&
              filDt[0]["shortterm"] == item["shortterm"] &&
              filDt[0]["longterm"] == item["longterm"]) { } else { postAccData.push(item) }
          } catch (e) { postAccData.push(item) }
        } else { postAccData.push(item) }
      } else { postAccData.push(item) }
    });
    return postAccData;
  }

  GetStrListDashAccs1() {
    return new Promise((resolve, reject) => {
      this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe((data: any[]) => {
          this.stgyListDashAccsData.next(data)
          resolve(resolve);
        }, error => {
            this.stgyListDashAccsData.next([]);
            resolve([])
          });
    });
  }

  GetStrListDashAccs() {
    var that = this;
    this.dataService.GetStgyListDashboardAccs().pipe(first())
      .subscribe((data: any[]) => { this.stgyListDashAccsData.next(data) },
        error => { this.stgyListDashAccsData.next([]) });
  }

  GetEquityIndexe() {
    this.dataService.GetEquityIndexes().pipe(first())
      .subscribe((res: any) => { this.equityIndexeMasData.next(res); },
        (error: any) => { this.equityIndexeMasData.next([]); });
  }

  GetBuildMyIndexOptions() {
    let that = this;
    this.dataService.GetBuildMyIndexOptions().pipe(first())
      .subscribe((res: any) => { that.BuildMyIndexOptions = res; }, (error: any) => { });
  }

  getLevelExclusionDataMC(level: any) {
    var that = this;
    var indID = this.checkMyIndexId(level.assetId);
    return new Promise((resolve, reject) => {
      var ETFIndex:any = [...that.sharedData._ETFIndex].filter(x => x.assetId == level.assetId);
      if (ETFIndex.length > 0) {
        this.GetAllocScoresFactMC(level.assetId, ETFIndex[0]['holdingsdate']).then((resDt: any) => { resolve(resDt); }).catch((error: any) => {reject(error)});
      }
      else if (level.assetId == 55551111 || level.assetId == 55553333) {
        this.GetAllocScoresFactMC(indID, this.sharedData.equityHoldDate).then((resDt: any) => { resolve(resDt); }).catch((error: any) => { reject(error) });
      } else {
        this.GetEquityScores(indID, this.sharedData.equityHoldDate).then((resDt: any) => { resolve(resDt); }).catch((error: any) => { reject(error) });
      }
    });
  }
  checkRemData_v1(assetId: any, rowno: any) {
    var that = this;
    try {
      var arrData = [...that.cusIndTempStrategyData.value].map(a => ({ ...a }));
      var selIndex = arrData.findIndex(x => x.rowno == rowno && x.assetId == assetId);
      if (selIndex > -1) {
        arrData.splice(selIndex, 1);
        that.cusIndTempStrategyData.next(arrData);
      }
    } catch (e) { }
  }
  GetEquityScoresSub: any;
  GetEquityScores(indexid: number,date:any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var d = new Date(date);
      var GetAllocDate = d.getFullYear().toString() + that.sharedData.formatedates(d.getMonth() + 1).toString() + that.sharedData.formatedates(d.getDate()).toString();
      try { this.GetEquityScoresSub.unsubscribe(); } catch (e) { }
      this.GetEquityScoresSub=this.dataService.GetEquityScores(indexid, GetAllocDate).pipe(first()).subscribe((res: any) => {
        resolve(res)
        }, error => {
          that.logger.logError(error, 'GetEquityScores');
        reject(error);
        });
    });
  }

  GetAllocScoresSub: any;
  GetAllocScoresFactMC(assetId: any,date:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      var indexType = "ETF";
      var d = new Date(date);
      var GetAllocDate = d.getFullYear().toString() + that.sharedData.formatedates(d.getMonth() + 1).toString() + that.sharedData.formatedates(d.getDate()).toString();
      var data = { "date": GetAllocDate, "sector": assetId, "percentage": 1, "universe": 123, "toporbottom": 1, "type": indexType, "assetId": assetId };
      try { this.GetAllocScoresSub.unsubscribe(); } catch (e) { }
      that.GetAllocScoresSub = that.dataService.GetAllocScoresv1(data).pipe(first()).subscribe((res: any) => { resolve(res); }, (error: any) => {
          that.logger.logError(error, 'GetAllocScoresv1');
          reject(error);
        });

    });
  }

  GetCompanyExListSub: any;
  //get rem company 
  GetCompanyExList(slid:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      try { this.GetCompanyExListSub.unsubscribe(); } catch (e) { }
      that.GetCompanyExListSub= that.dataService.GetCompanyExList(slid).pipe(first()).subscribe((res: any) => {
          resolve(res);
        }, (error: any) => {
          resolve([])
        that.logger.logError(error, 'GetCompanyExList');
      });
    });
  }

  //post rem company 
  PostCompExData(data:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      that.dataService.PostCompExData(data).pipe(first()).subscribe((data: any) => {
        resolve(data)
      }, (error: any) => {
        resolve(data)
        this.logger.logError(error, 'PostCompExData');
      });
    });
  }

  GetGicsExListSub: any;
  //get Gics Data
  GetGicsExList(slid: any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      try { this.GetGicsExListSub.unsubscribe(); } catch (e) { }
      that.GetGicsExListSub=that.dataService.GetGicsExList(slid).pipe(first()).subscribe((res: any) => {
        resolve(res);
      }, (error: any) => {
        resolve([])
        that.logger.logError(error, 'GetGicsExList');
      });
    });
  }

  //post Gics Data
  PostGicsExData(glist: any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      that.dataService.PostGicsExData(glist).pipe(first()).subscribe((res: any) => {
        resolve(res);
      }, (error: any) => {
        resolve([])
        that.logger.logError(error, 'PostGicsExData');
      });
    });
  }

  GetStrategyFactorSub: any;
  //get Factor
  GetStrategyFactors(slid:any, assetId:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      try { this.GetStrategyFactorSub.unsubscribe(); } catch (e) { }
      this.GetStrategyFactorSub=that.dataService.GetStrategyFactors(slid, assetId).pipe(first()).subscribe((res: any) => {
        resolve(res);
      }, (error: any) => {
        resolve([])
        that.logger.logError(error, 'GetStrategyFactors');
      });
    });
  }

  //post Factor
  PostStrategyFactorsByStatus(data: any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      that.dataService.PostStrategyFactorsByStatus(data).pipe(first()).subscribe((data: any) => {
        resolve(data)
      }, (error: any) => {
        resolve(data)
        this.logger.logError(error, 'PostStrategyFactorsByStatus');
      });
    });
  }

  GetStrategyAccountSub: any;
  //get stgy account
  GetStrategyAccount(slid: number) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      try { this.GetStrategyAccountSub.unsubscribe(); } catch (e) { }
      that.GetStrategyAccountSub= that.dataService.GetStrategyAccount(slid).pipe(first()).subscribe((res: any) => {
        resolve(res);
      }, (error: any) => {
        resolve([])
        that.logger.logError(error, 'GetStrategyAccount');
      });
    });
  }

  //post stgy account
  PostStrategyAccount(data: any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      that.dataService.PostStrategyAccount(data).pipe(first()).subscribe((res: any) => {
        resolve(res);
      }, (error: any) => {
        resolve([])
        that.logger.logError(error, 'PostStrategyAccount');
      });
    });
  }

  checkMyIndexId(assetId:any) {
    var indID = 0;
    var value = this.equityIndexeMasData.getValue();
    var flData = value.filter((x:any) => x.assetId == assetId);
    if (flData.length > 0) { indID = flData[0]['cusIndexId']; }
    return indID;
  }

  getMedvalue(comp: any, code: any, ind: any) {
    var that = this;
    var med = '0.0';
    if (comp == null || comp == undefined || comp.length == 0) { med = '0.0'; } else {
      var filtercomp = comp.filter((x: any) => x.industry.toString().substring(0, ind) == code);
      filtercomp = filtercomp.filter((x: any) => isNotNullOrUndefined(x.scores))
      if (filtercomp.length > 0) { med = format(".1f")(that.getMedScore(filtercomp)); }
      else { med = '0.0' }
    }
    return med;
  }

  getMedScore(data: any): any { return median(data, (d: any) => d.scores*100); }

  Equitylvl = ["Sector", "Industrygroup", "Industry", "Sub Industry"];
  getLvlGics(level: any) {
    var that = this;
    var filtercomp: any = this.exclusionCompData.value;
    return new Promise((resolve, reject) => {
      var lvl = that.Equitylvl.indexOf(level.type) + 1;
      switch (level.type) {
        case ("Sector"): {
          let matchData: any = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(level.code) == 0)];
          matchData = matchData.map((item: any) => ({
              med: that.getMedvalue(filtercomp, item.code, 4),
              ...item
          }));
          matchData = matchData.filter((x: any) => x.med > 0);
          resolve(matchData);
          break;
        }
        case ("Industrygroup"): {
          let matchData: any = [...that.sharedData._dbGICS].filter(x => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(level.code) == 0);
          matchData = matchData.map((item: any) => ({
            med: that.getMedvalue(filtercomp, item.code, 6),
            ...item
          }));
          matchData = matchData.filter((x: any) => x.med > 0);
          resolve(matchData);
          break;
        }
        case ("Industry"): {
          let matchData: any = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(level.code) == 0)];
          matchData = matchData.map((item: any) => ({
            med: that.getMedvalue(filtercomp, item.code, 8),
            ...item
          }));
          matchData = matchData.filter((x: any) => x.med > 0);
          resolve(matchData);
          break;
        }
        case ("Sub Industry"): {
          resolve([]);
          break;
        }
        default: {
          var data = this.exclusionCompData.value;
          var Gics: any = this.sharedData.dbGICS.value;
          var sector = Gics.filter((x: any) => x.type == "Sector");
          var sectorData = sector.filter(that.checkSector(data));
          sectorData = sectorData.map((item: any) => ({
            med: that.getMedvalue(filtercomp, item.code, 2),
            ...item
          }));
          sectorData = sectorData.filter((x: any) => x.med > 0);
          resolve(sectorData);
          break;
        }
      }
    });
  }

  checkSector(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.industry.toString().indexOf(current.code) == 0 }).length > 0; } }

  rememptyGD1(PostStrategyFactorsData: any, bldMyIndSelByVal: any, bldMyIndweightByVal: any) {
    var erfFact = PostStrategyFactorsData.filter((xd: any) => xd.factorid == 18);
    if (bldMyIndSelByVal == 1 || bldMyIndweightByVal == 1 || erfFact.length > 0) {
      return true
    } else { return false }
  }

  rememptyGD() {
    var erfFact = this.PostStrategyFactorsData.value.filter((xd: any) => xd.factorid == 18);
    if (this.custToolSelectByValue.value == 1 || this.custToolWeightByValue.value == 1 || erfFact.length > 0) {
      return true
    } else { return false }
  }

  getExclCompData() {
    var that = this;
    return new Promise((resolve, reject) => {
      var resData: any = [...that.exclusionCompData.value].map(a => ({ ...a }));
      var remGicsData: any = that.remGicsData.value;
      var remCompData: any = that.remCompData.value;
      if (that.rememptyGD()) { resData = [...resData].filter(x => isNotNullOrUndefined(x.scores) && x.scores > 0); }
      resData = [...resData].sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });

      if (remGicsData.length > 0) { resData = [...resData].filter(that.remGics(remGicsData)); };
      if (remCompData.length > 0) { resData = [...resData].filter(that.remComp(remCompData)); };

      resData = that.factorDataHandle(resData, that.PostStrategyFactorsData.value);
      resData = resData.sort(function (x: any, y: any) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      resData.forEach(function (d: any, i: any) { d.cx = ((i * 360 / resData.length) - 90); return d; });
      resolve([...resData]);
    });
  }

  getExclFactorCompData() {
    var that = this;
    return new Promise((resolve, reject) => {
      var exclusionCompData = [...that.exclusionCompData.value].map(a => ({ ...a }));
      var remGicsData: any = that.remGicsData.value;
      var remCompData: any = that.remCompData.value;

      var resData = [...exclusionCompData].map(a => ({ ...a }));
      if (this.rememptyGD()) { resData = [...resData].filter(x => isNotNullOrUndefined(x.scores) && x.scores > 0); }
      resData = [...resData].sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });

      if (remGicsData.length > 0) { resData = [...resData].filter(this.remGics(remGicsData)); };
      if (remCompData.length > 0) { resData = [...resData].filter(this.remComp(remCompData)); };

      resData = resData.sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      resData.forEach(function (d, i) { d.cx = ((i * 360 / resData.length) - 90); return d; });
      resolve([...resData]);
    });
  }

  checkBelow100Comp(exclusionCompData: any, remCompData: any, remGicsData: any, PostStrategyFactorsData: any) {
    var that = this;
    var factorCheck: boolean = false;
    var resData = [...exclusionCompData];
    try {
      if (PostStrategyFactorsData == undefined || PostStrategyFactorsData == null) { PostStrategyFactorsData = []; }
      if (this.rememptyGD1(PostStrategyFactorsData, this.custToolSelectByValue.value, this.custToolWeightByValue.value)) { resData = [...resData].filter(x => isNotNullOrUndefined(x.scores) && x.scores > 0); }
      resData = [...resData].sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      
      resData = resData.sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      resData.forEach(function (d, i) { d.cx = ((i * 360 / [...resData].length) - 90); return d; });

      if (remGicsData.length > 0) { resData = [...resData].filter(this.remGics(remGicsData)); };
      if (remCompData.length > 0) { resData = [...resData].filter(this.remComp(remCompData)); };
      
      resData = that.factorDataHandle(resData, PostStrategyFactorsData);

      resData = resData.sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      resData.forEach(function (d, i) { d.cx = ((i * 360 / resData.length) - 90); return d; });
      factorCheck = that.checkFactorVal(PostStrategyFactorsData);
    } catch (e) { console.log(e) }
    if (factorCheck) { return false } else if (resData.length > (this.minCustInd.count - 1)) { return true } else { return false };
  }

  addcomparerfact(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.Stockkey == current.stockKey }).length > 0; } }
  remcomparerfact(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.stockKey == current.stockKey }).length == 0; } }
  remComp(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other == current.stockKey }).length == 0; } }
  remGics(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return current.industry.toString().indexOf(other) == 0 }).length == 0; } }
  addcomparer(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.StockKey == current.stockKey }).length == 0; } }
  remcomparer(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.stockKey == current.stockKey }).length > 0; } }

  checkFactorVal(data: any) {
    var val: boolean = false;
    if (data.length > 0) {
      var filPec = data.filter((x:any) => x.perorval == 0);
      if (filPec.length > 0) { filPec.forEach((d:any) => { if (d.startval > 0 && d.endval < 100 && d.startval == d.endval) { val = true } }); }
    }
    return val;
  }

  checkFactorDt(d:any) {
    var that = this;
    var data: any = that.factorMasterData.getValue();
    return data.filter((x:any) => x.id == d)[0];
  }

  factorDataHandle(data: any, PostStrategyFactorsData: any) {
    var that = this;
    var masterData = [...data].map(a => ({ ...a }));

    var erfRemData: any = [];

    /* ------------------ factor Technical ---------------- */

    var fac_19RemData: any = [];
    var fac_19 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 19);
    if (fac_19.length > 0) { fac_19RemData = this.factorRemData(masterData, fac_19[0]); };

    var fac_20RemData: any = [];
    var fac_20 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 20);
    if (fac_20.length > 0) { fac_20RemData = this.factorRemData(masterData, fac_20[0]); };

    var fac_21RemData: any = [];
    var fac_21 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 21);
    if (fac_21.length > 0) { fac_21RemData = this.factorRemData(masterData, fac_21[0]); };

    var fac_17RemData: any = [];
    var fac_17 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 17);
    if (fac_17.length > 0) { fac_17RemData = this.factorRemData(masterData, fac_17[0]); };

    /* ------------------ factor Technical ---------------- */

    /* ------------------ factor Growth ---------------- */

    var fac_2RemData: any = [];
    var fac_2 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 2);
    if (fac_2.length > 0) { fac_2RemData = this.factorRemData(masterData, fac_2[0]); };

    var fac_6RemData: any = [];
    var fac_6 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 6);
    if (fac_6.length > 0) { fac_6RemData = this.factorRemData(masterData, fac_6[0]); };

    var fac_13RemData: any = [];
    var fac_13 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 13);
    if (fac_13.length > 0) { fac_13RemData = this.factorRemData(masterData, fac_13[0]); };

    var fac_14RemData: any = [];
    var fac_14 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 14);
    if (fac_14.length > 0) { fac_14RemData = this.factorRemData(masterData, fac_14[0]); };

    /* ------------------ factor Growth ---------------- */

    /* ------------------ factor Quality ---------------- */

    var fac_1RemData: any = [];
    var fac_1 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 1);
    if (fac_1.length > 0) { fac_1RemData = this.factorRemData(masterData, fac_1[0]); };

    var fac_8RemData: any = [];
    var fac_8 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 8);
    if (fac_8.length > 0) { fac_8RemData = this.factorRemData(masterData, fac_8[0]); };

    var fac_9RemData: any = [];
    var fac_9 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 9);
    if (fac_9.length > 0) { fac_9RemData = this.factorRemData(masterData, fac_9[0]); };

    var fac_10RemData: any = [];
    var fac_10 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 10);
    if (fac_10.length > 0) { fac_10RemData = this.factorRemData(masterData, fac_10[0]); };

    /* ------------------ factor Quality ---------------- */

    /* ------------------ factor Value ---------------- */

    var fac_4RemData: any = [];
    var fac_4 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 4);
    if (fac_4.length > 0) { fac_4RemData = this.factorRemData(masterData, fac_4[0]); };

    var fac_5RemData: any = [];
    var fac_5 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 5);
    if (fac_5.length > 0) { fac_5RemData = this.factorRemData(masterData, fac_5[0]); };

    var fac_7RemData: any = [];
    var fac_7 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 7);
    if (fac_7.length > 0) { fac_7RemData = this.factorRemData(masterData, fac_7[0]); };

    var fac_15RemData: any = [];
    var fac_15 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 15);
    if (fac_15.length > 0) { fac_15RemData = this.factorRemData(masterData, fac_15[0]); };

    var fac_12RemData: any = [];
    var fac_12 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 12);
    if (fac_12.length > 0) { fac_12RemData = this.factorRemData(masterData, fac_12[0]); };

    /* ------------------ factor Value ---------------- */

    /* ------------------ factor Alpha ---------------- */
    var fac_18RemData: any = [];
    var fac_18 = PostStrategyFactorsData.filter((fu: any) => fu.factorid == 18);
    if (fac_18.length > 0) { fac_18RemData = this.factorRemData(masterData, fac_18[0]); };
    /* ------------------ factor Alpha ---------------- */

    var allRemFactorData: any = [].concat(erfRemData,   fac_18RemData,  fac_1RemData, fac_8RemData, fac_9RemData, fac_10RemData, fac_17RemData, fac_2RemData, fac_4RemData, fac_5RemData, fac_7RemData, fac_15RemData, fac_6RemData, fac_13RemData, fac_14RemData, fac_20RemData, fac_21RemData, fac_19RemData, fac_12RemData);
    var resFactorData = masterData.filter(that.remcomparerfact(allRemFactorData));
    return [...resFactorData].map(a => ({ ...a }));
  }

  dValFormat(val: any) {
    var v1 = parseFloat(val).toFixed(4);
    return parseFloat(v1);
  }

  checkValue(ndata: any, factorid: any) {
    var data: any = [];
    var factorname = "";
    if (factorid == 13) { factorname = "ROE" }
    else if (factorid == 8) { factorname = "GrossMargin" }
    else if (factorid == 6) { factorname = "EPSGrowthQuarterly" }
    else if (factorid == 17) { factorname = "MarketCapFreeFloat" }
    else if (factorid == 14) { factorname = "SalesGrowth" }
    else if (factorid == 4) { factorname = "BookToMarket" }
    else if (factorid == 10) { factorname = "LeverageRatioBook" }
    else if (factorid == 12) { factorname = "PriceToEarnings" }
    else if (factorid == 5) { factorname = "DividendYield" }
    else if (factorid == 1) { factorname = "Accruals" }
    else if (factorid == 7) { factorname = "FCFYield" }
    else if (factorid == 15) { factorname = "SalesYield" }
    else if (factorid == 9) { factorname = "InterestCoverage" }
    else if (factorid == 20) { factorname = "Momentum1Year" }
    else if (factorid == 2) { factorname = "AssetGrowth" }
    else if (factorid == 21) { factorname = "Volatility1Year" }
    else if (factorid == 19) { factorname = "Beta1Year" }
    var factorData = [...this.comFactorsData.value].filter(x => x[factorname] != undefined && x[factorname] != null);
    if (factorid == 18) {
      [...ndata].forEach(function (d, i) {
        var cDt = Object.assign({}, d);
        cDt['factorValue'] = d['scores'];
        cDt['factorWeight'] = d['Wt'];
        data.push(cDt);
      });
    } else {
      var newComp = factorData.filter(this.addcomparerfact(ndata));
      var dmin = min(newComp.map(x => x[factorname]));
      var dmax = max(newComp.map(x => x[factorname]));
      var per = scaleLinear().domain([dmin, dmax]).range([0, 100]);
      [...ndata].forEach(function (d, i) {
        var nda = factorData.filter(dd => dd.Stockkey == d.stockKey);
        if (nda.length > 0) {
          var cDt = Object.assign({}, d);
          cDt['factorValue'] = nda[0][factorname];
          cDt['factorWeight'] = per(nda[0][factorname]);
          data.push(cDt);
        }
      });
    }
    data = data.filter((x: any) => isNotNullOrUndefined(x.factorValue));
    data.sort(function (x: any, y: any) { return ascending(parseFloat(x.factorValue), parseFloat(y.factorValue)); });
    return data;
  }

  factorRemData(data: any, factorInfo: any) {
    var that = this;
    var rightGridData = [...data].map(a => ({ ...a }));
    rightGridData = this.checkValue(rightGridData, factorInfo.factorid).map((a: any) => ({ ...a }));
    var dmin = min([factorInfo.startval, factorInfo.endval]);
    var dmax = max([factorInfo.startval, factorInfo.endval]);
    if (factorInfo.factorid == 18) {
      rightGridData = [...that._exclusionCompData].map(a => ({ ...a }));
      rightGridData = rightGridData.filter(x => isNotNullOrUndefined(x.scores) && x.scores > 0);
      rightGridData = rightGridData.sort(function (x, y) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      if (factorInfo.perorval == 0) {
        var val: any = factorInfo.endval;
        var val1: any = 100 - factorInfo.startval;
        if (val == 100 || val == 0) { val = 0 };
        var GridAllComps = [...rightGridData];
        let GridDtLength = (GridAllComps.length * val1) / 100;
        let GridDtLength1 = (GridAllComps.length * val) / 100;
        var removedCompanies: any = [...GridAllComps].slice(GridDtLength, GridAllComps.length);
        var removedCompanies1: any = [...GridAllComps].slice(0, GridDtLength1);
        if (val == 100 || val == 0) { removedCompanies1 = []; }
        if (val1 == 100 || val1 == 0) { removedCompanies = []; }
        let removedCompaniesData = [].concat(removedCompanies, removedCompanies1);
        return removedCompaniesData;
      } else {
        var val: any = dmax;
        var val1: any = dmin;
        var removedCompanies: any = [];
        var removedCompanies1: any = [];
        var GridAllComps = [...rightGridData];
        var GridAllComps1 = [...rightGridData];
        var GridAllComps2 = [...rightGridData];

        removedCompanies = [...GridAllComps1].filter((x: any) => that.dValFormat(x.scores) > that.dValFormat(val));
        removedCompanies1 = [...GridAllComps2].filter((x: any) => that.dValFormat(x.scores) < that.dValFormat(val1));
        //var FI2 = 0;
        //if (FI2 == 0) { removedCompanies1 = []; }

        //var FI1 = [...GridAllComps].findIndex(x => that.dValFormat(x.scores) == that.dValFormat(val));
        //if (isNotNullOrUndefined(FI1) && FI1 > -1) { removedCompanies = [...GridAllComps].slice(FI1, GridAllComps.length); }
        //else {
        //  var tP = rightGridData.filter(x => that.dValFormat(x.scores) <= that.dValFormat(val));
        //  if (tP.length > 0) {
        //    FI1 = [...GridAllComps].findIndex(x => that.dValFormat(x.scores) == that.dValFormat(tP[tP.length - 1].scores));
        //    removedCompanies = [...GridAllComps].slice(FI1, GridAllComps.length);
        //  }
        //}
        let removedCompaniesData: any = [].concat(removedCompanies, removedCompanies1);
        //var addedCompanies = [...GridAllComps1].slice(FI2, FI1);

        //if (FI1 == ([...rightGridData].length - 1) && removedCompanies.length > 0) {
        //  removedCompanies = [];
        //  addedCompanies = [...GridAllComps1].slice(FI2, [...rightGridData].length);
        //  removedCompaniesData = [].concat(removedCompanies, removedCompanies1);
        //} else if (addedCompanies.length == 0) {
        //  addedCompanies = [...rightGridData];
        //  removedCompaniesData = [];
        //}

        //if (FI2 < 0 || FI1 < 0 || (FI2 == 0 && FI1 == 0)) { removedCompaniesData = [...rightGridData]; }
        var nullData = data.filter(that.remcomparerfact(rightGridData));
        removedCompaniesData = [].concat(removedCompaniesData, nullData);
        return [...removedCompaniesData];
      }
    } else {
      if (factorInfo.perorval == 0) {
        var val: any = factorInfo.startval;
        var val1: any = factorInfo.endval;
        if (val == 100) { val = 0 };
        if (val1 == 100 || val1 == 0) { val1 = 100 };
        var GridAllComps = [...rightGridData];
        let GridDtLength = (GridAllComps.length * val1) / 100;
        let GridDtLength1 = (GridAllComps.length * val) / 100;
        var removedCompanies: any = [...GridAllComps].slice(GridDtLength, GridAllComps.length);
        var removedCompanies1: any = [...GridAllComps].slice(0, GridDtLength1);
        if (val == 100 || val == 0) { removedCompanies1 = []; }
        if (val1 == 100 || val1 == 0) { removedCompanies = []; }
        let removedCompaniesData = [].concat(removedCompanies, removedCompanies1);
        return removedCompaniesData;
      } else {
        rightGridData = rightGridData.sort(function (x, y) { return descending(parseFloat(x.factorValue), parseFloat(y.factorValue)); });
        var val = dmax;
        var val1 = dmin;
        var removedCompanies: any = [];
        var removedCompanies1: any = [];
        var GridAllComps = [...rightGridData];
        var GridAllComps1 = [...rightGridData];
        var GridAllComps2 = [...rightGridData];

        removedCompanies = [...GridAllComps1].filter((x: any) => that.dValFormat(x.factorValue) < that.dValFormat(val1))
        removedCompanies1 = [...GridAllComps2].filter((x: any) => that.dValFormat(x.factorValue) > that.dValFormat(val))
        //var FI1 = [...GridAllComps].findIndex(x => that.dValFormat(x.factorValue) == that.dValFormat(val1));
        //var FI2 = [...GridAllComps].findIndex(x => that.dValFormat(x.factorValue) == that.dValFormat(val));
        //if (isNotNullOrUndefined(FI2) && FI2 > -1) { removedCompanies1 = [...GridAllComps2].slice(0, FI2); }
        //else {
        //  var tP = rightGridData.filter(x => that.dValFormat(x.factorValue) <= that.dValFormat(val));
        //  if (tP.length > 0) {
        //    FI2 = [...GridAllComps].findIndex(x => that.dValFormat(x.factorValue) == that.dValFormat(tP[0].factorValue));
        //    removedCompanies1 = [...GridAllComps2].slice(0, FI2);
        //  }
        //}
        //if (isNotNullOrUndefined(FI1) && FI1 > -1) { removedCompanies = [...GridAllComps].slice(FI1, GridAllComps.length); }
        //else {
        //  var tP = rightGridData.filter(x => that.dValFormat(x.factorValue) <= that.dValFormat(val1));
        //  if (tP.length > 0) {
        //    FI1 = [...GridAllComps].findIndex(x => that.dValFormat(x.factorValue) == that.dValFormat(tP[0].factorValue));
        //    removedCompanies = [...GridAllComps].slice(FI1, GridAllComps.length);
        //  }
        //}
        let removedCompaniesData: any = [].concat(removedCompanies, removedCompanies1);
        //var addedCompanies = [...GridAllComps1].slice(FI2, FI1);
        //if (FI2 == 0) { removedCompanies1 = []; }
        //if (FI1 == ([...rightGridData].length - 1) && removedCompanies.length > 0) {
        //  removedCompanies = [];
        //  addedCompanies = [...GridAllComps1].slice(FI2, [...rightGridData].length);
        //  removedCompaniesData = [].concat(removedCompanies, removedCompanies1);
        //} else if (addedCompanies.length == 0) {
        //  addedCompanies = [...rightGridData];
        //  removedCompaniesData = [];
        //}
        //if (FI2 < 0 || FI1 < 0 || (FI2 == 0 && FI1 == 0)) { removedCompaniesData = [...rightGridData]; }
        var nullData = data.filter(that.remcomparerfact(rightGridData));
        removedCompaniesData = [].concat(removedCompaniesData, nullData);
        return [...removedCompaniesData];
      }
    }
  }
  pinnedPostMethod(data: any) {
    var that = this;
    that.dataService.PostPinnedItems(data).pipe(first()).subscribe((data1: any) => {
          if (data1[0] != "Failed") {
            this.dataService.getPinnedMenuItems().subscribe((data: any) => {
              //that.toastr.info('Layout preferences have been updated.', '', { timeOut: 4000, positionClass: "toast-top-center" });
              this.sharedData.getPinnedMenuItems.next(data);
            } , (err: any) => {
                this.sharedData.getPinnedMenuItems.next([]);
              });
            //console.log('pinnedPostMethod', data1)
          }
        }, error => { });
  }
  pinnedPostMethodDashboardSwitch(data: any) {
    var that = this;
    that.dataService.PostPinnedItems(data).pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        this.dataService.getPinnedMenuItems().subscribe((data: any) => {
          that.toastr.info('Layout preferences have been updated.', '', { timeOut: 4000, positionClass: "toast-top-center" });
          this.sharedData.getPinnedMenuItems.next(data);
        }, (err: any) => {
          this.sharedData.getPinnedMenuItems.next([]);
        });
      }
    }, error => { });
  }
  checkTrade(selStgy:any) {
    var data = this._stgyListDashAccsData;
    if (isNullOrUndefined(data)) { data = []; }
    if (isNotNullOrUndefined(selStgy) && data.length > 0) {
      var filD = data.filter((x:any) => x.id == selStgy.id && x.tradeStatus == 'Y');
      if (filD.length > 0) { return false } else { return true }
    } else { return true }
  }

  tempFactorSwitch: number = 0;

  getStrFacData(factorid: any, SSRValueStart: any, SSRValueEnd: any, switchTabName_P: any, orgTopValue: number, orgBottomValue: number) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    let slist = [];
    slist = this.strategyList.value;
    var no = this.currentSNo.value;
    var clist = slist.filter((x: any) => x.rowno == no);
    if (clist.length == 0) { } else {
      var clist = this.currentSList.value;
      if (isNotNullOrUndefined(clist)) {
        if (switchTabName_P == 'percent') { SSRValueEnd = SSRValueEnd; };
        if (slist.filter((x: any) => x.id == clist.id).length > 0) {
          var fact = this.checkFactorDt(factorid)
          var data: factorRangeObject = {
            "factorid": factorid,
            "slid": clist.id,
            "userid": parseInt(userid),
            "assetid": parseInt(clist.assetId),
            "startval": SSRValueStart,
            "endval": SSRValueEnd,
            "perorval": ((switchTabName_P == 'val') ? 1 : 0),
            "status": 'A',
            "name": fact['name'],
            "displayname": fact['displayname'],
            "orgTopValue": orgTopValue,
            "orgBottomValue": orgBottomValue,
            "orgTopPct": 0.0,
            "orgBottomPct": 100.0,
          };
          var tempfacter = this.PostStrategyFactorsData.value.map((a: any) => ({ ...a }));
          var filterFactor = [...tempfacter].map(a => ({ ...a })).filter(x => x.factorid == factorid);
          var index = [...tempfacter].map(a => ({ ...a })).findIndex(x => x.factorid == factorid);
          if (filterFactor.length > 0) {
            tempfacter[index]['startval'] = SSRValueStart;
            tempfacter[index]['endval'] = SSRValueEnd;
            tempfacter[index]['factorid'] = factorid;
            tempfacter[index]['slid'] = clist.id;
            tempfacter[index]['orgTopValue'] = orgTopValue;
            tempfacter[index]['orgBottomValue'] = orgBottomValue;
            tempfacter[index]['assetid'] = parseInt(clist.assetId);
            tempfacter[index]['userid'] = parseInt(userid);
            tempfacter[index]['perorval'] = ((switchTabName_P == 'val') ? 1 : 0);
            return tempfacter;
          }
          else {
            tempfacter.push(data);
            return tempfacter;
          }
        }
      }
    }
  }

  HFCompanyTxt(d:any) {
    var scores = d.scores;
    if (scores >= 0 && scores <= 0.25) { return 'HFCompRange0_25' }
    else if (scores >= 0.25 && scores <= 0.50) { return 'HFCompRange25_50' }
    else if (scores >= 0.50 && scores <= 0.75) { return 'HFCompRange50_75' }
    else if (scores >= 0.75 && scores <= 1) { return 'HFCompRange75_100' }
    else { return '' }
  }

  txtx(d: any) { return ((d.cx) > 90) ? "-222" : "222"; }
  txtx1(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx1d(d: any) { return ((d.rx) > 90) ? "-190" : "188"; }
  txtx2(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx3(d: any) { return ((d.cx) > 90) ? "-192" : "192"; }
  txttrans(d: any) { return ((d.cx) > 90) ? "rotate(180)" : null; }
  txtanch(d: any) { return ((d.cx) > 90) ? "end" : null; }

  getIndexId(d:any) {
    var data:any = this.equityIndexeMasData.value;
    var indexId: number = 123;
    if (isNotNullOrUndefined(d['assetId']) && data.length > 0) {
      var fiData: any = data.filter((x: any) => x.assetId == d['assetId']);
      if (fiData.length > 0) { indexId = fiData[0]['indexId']; }
    }
    return indexId;
  }

  temp: any;
  ETFStrategyPlainIndexApi: any;
  initPerfLoader: boolean = false;
  checkGetVal(temp: any, newData: any) { if (JSON.stringify(temp) == JSON.stringify(newData)) { return false } else { return true }; };

  getPerStatData() {
    var that = this;
    this.GetPerformanceETFRList();
    return new Promise((resolve, reject) => {
      var basedata: any = that.customizeSelectedIndex_custom.value;
      var remCompData: any = that.remCompData.value;
      var remGicsData: any = that.remGicsData.value;
      var compdata: any = [];
      [...remCompData].forEach(function (value) { compdata.push(value); });
      var gicsdata: any = [];
      [...remGicsData].forEach(function (value) { gicsdata.push(value); });
      var d = new Date();
      var assetid: any = (isNotNullOrUndefined(basedata.assetId)) ? basedata.assetId : (isNotNullOrUndefined(basedata.assetid)) ? basedata.assetid:0;
      var indexId: number = 123;
      var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == assetid);
      if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
      else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
      else {
        d = new Date(this.sharedData.equityHoldDate);
        try { indexId = this.getIndexId(basedata); } catch (e) { console.log(e) }
      }
      var taxflag: string = (isNotNullOrUndefined(this.custToolTaxEffAwareness.value) && this.custToolTaxEffAwareness.value != '') ? this.custToolTaxEffAwareness.value : 'N';
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
      var data = {
        'strSector': gicsdata,
        'strStockkey': compdata,
        'assetid': assetid,
        'indexId': indexId,
        'range': 0,
        "strExStockkey": [],
        'tenYrFlag': 0,
        'enddate': date,
        "rating": "",
        "category": [],
        "taxflag": taxflag,
        //"taxflag": that.applyTax.value,
        "factorParams": that.PostStrategyFactorsData.value
      };
      if (that.checkGetVal(that.temp, JSON.stringify(data))) {
        that.temp = JSON.stringify(data);
        //that.PerStatDtl.next(data);
        try { this.ETFStrategyPlainIndexApi.unsubscribe(); } catch (e) { }
        that.initPerfLoader = true;
        this.ETFStrategyPlainIndexApi = this.dataService.GetETFStrategyPlainIndex(data).pipe(first()).subscribe(GetPerformanceUIndexList => {
          if (this.sharedData.checkServiceError(GetPerformanceUIndexList)) {
            that.temp = "";
            that.sharedData.showSpinner.next(false);
            this.initPerfLoader = false;
      //      that.sharedData.performanceLoader.next(true);
            that.perfDatanotAvailable();
            this.performanceUIndexList.next([]);
            this.logger.logError(GetPerformanceUIndexList, 'GetETFStrategyPlainIndex');
            resolve({ 'GetPerformanceETFRList': this._performanceETFRList, 'GetPerformanceUIndexList': undefined });
          } else {
            this.initPerfLoader = false;
            this.performanceUIndexList.next(GetPerformanceUIndexList);
            that.sharedData.showSpinner.next(false);
            if (this._PostStrategyFactorsData.length == 0 && this._remCompData.length == 0 && this._remGicsData.length == 0) {
              resolve({ 'GetPerformanceETFRList': this._performanceETFRList, 'GetPerformanceUIndexList': undefined });
            } else { resolve({ 'GetPerformanceETFRList': this._performanceETFRList, 'GetPerformanceUIndexList': GetPerformanceUIndexList }); }
          }
        }, (error:any)=> {
          this.initPerfLoader = false;
          that.sharedData.showSpinner.next(false);
          this.performanceUIndexList.next([]);
          //   that.sharedData.performanceLoader.next(true);
          that.toastr.success('Performance data not available. Please try again later.', '', { timeOut: 4000, positionClass: "toast-top-center" });
          that.perfDatanotAvailable();
          this.logger.logError(error, 'GetETFStrategyPlainIndex');
          that.temp = "";
        });
      } else {
        resolve({ 'GetPerformanceETFRList': this._performanceETFRList, 'GetPerformanceUIndexList': this._performanceUIndexList });
      }
    });
  }
  perfDatanotAvailable() {
    var that = this;
    that.sharedData.showCenterLoader.next(false);
    that.sharedData.showCircleLoader.next(false);
    that.sharedData.showMatLoader.next(false);
    //// Move to filters
    /*** Error while opening indexfactsheet ****/
    var checkInd_fact = JSON.stringify(that.sharedData._notifyIndexClick);
    /// While open Index factsheet
    if (checkInd_fact && that._showReviewIndexLoaded) {
      that.openErrorComp_MoveAlpha();
      //$('#myCustomIndErrorModal_review').modal('show');
    }
    /// Custom Index error While open filters
    if (!that._showReviewIndexLoaded && that.startIndexClick_custom) {
      that.sharedData.showSpinner.next(false);/// hide rightgrid loader
      that.openErrorComp_MoveDashboard();
      //$('#myCustomIndErrorModal').modal('show');
    }
  }
  openErrorComp_MoveAlpha() {
    var title = 'Error';
    var options = { from: 'reviewFactsheet', error: 'Error', destination: 'loadDefaultAlpha' }
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
  }
  openErrorComp_MoveDashboard() {
    var title = 'goToHome';
    this.sharedData.showErrorDialogBox.next(true);
    var options = { from: 'buildYourIndex', error: 'goToHome', destination: 'goToDashboard' }
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "30%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  }
  tempCustAssetId: any;
  GPerETFRList: any;
  GPerETFRList1: any;
  GetPerformanceETFRList() {
    var that = this;
    var basedata: any = that.customizeSelectedIndex_custom.value;    
    var d = new Date();
    var assetid;
    var indexId: number = 123;
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
    if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
    else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
    else { d = new Date(this.sharedData.equityHoldDate); }
    indexId = this.getIndexId(basedata);
    assetid = basedata.assetId;
    var taxflag: string = (isNotNullOrUndefined(this.custToolTaxEffAwareness.value) && this.custToolTaxEffAwareness.value != '') ? this.custToolTaxEffAwareness.value : 'N';
    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
    var data = {
      'strSector': [],
      'strStockkey': [],
      'assetid': assetid,
      'indexId': indexId,
      'range': 100,
      "strExStockkey": [],
      'tenYrFlag': 0,
      'enddate': date,
      "rating": '',
      "category": [],
      "taxflag": taxflag
    };
    var tenYrdata = {
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
      "taxflag": taxflag
    };
    if (that.tempCustAssetId != JSON.stringify(assetid)) {
      that.tempCustAssetId = JSON.stringify(assetid);
      try {
        this.GPerETFRList.unsubscribe();
        this.GPerETFRList1.unsubscribe();
      } catch (e) { }
      this.GPerETFRList = this.dataService.GetPerformanceETFRList(data).pipe(first()).subscribe(GetPerformanceETFRList => {
        if (this.sharedData.checkServiceError(GetPerformanceETFRList)) {
          that.tempCustAssetId = "";
          that.perfDatanotAvailable();
          this.logger.logError(GetPerformanceETFRList, 'GetPerformanceETFRList');
          this.performanceETFRList.next([]);
        } else { this.performanceETFRList.next(GetPerformanceETFRList); }
      },
        error => {
          this.performanceETFRList.next([]);
          that.tempCustAssetId = "";
          that.perfDatanotAvailable();
          this.logger.logError(error, 'GetPerformanceETFRList');
        });

      this.GPerETFRList1 = this.dataService.GetPerformanceETFRList(tenYrdata).pipe(first()).subscribe(performanceTenYrETFRList => {
        if (this.sharedData.checkServiceError(performanceTenYrETFRList)) {
          that.perfDatanotAvailable();
          this.logger.logError(performanceTenYrETFRList, 'performanceTenYrETFRList');
          this.performanceTenYrETFRList.next([]);
        } else { this.performanceTenYrETFRList.next(performanceTenYrETFRList); }
      },
        error => {
          this.performanceTenYrETFRList.next([]);
          that.toastr.success('Performance data not available. Please try again later.', '', { timeOut: 4000, positionClass: "toast-top-center" });
          that.perfDatanotAvailable();
          this.logger.logError(error, 'performanceTenYrETFRList');
        });
    }
  }

  GetStrategyAssetList(assetId: number) {
    return new Promise((resolve, reject) => {
      this.dataService.GetStrategyAssetList(assetId, 'A').pipe(first()).subscribe((data: any) => {
        if (this.sharedData.checkServiceError(data)) {
          this.strategyList.next([]);
          resolve([])
        } else {
          this.strategyList.next(data);
          resolve(data)
        }
      }, (error:any) => {
        resolve([])
        this.strategyList.next([]);
      })
    });
  }

  getStgyList() {
    return new Promise((resolve, reject) => {
      var data = this.customizeSelectedIndex_custom.value;
      var stgyNo: any = this.currentSNo.value;
      if (isNotNullOrUndefined(data['assetId'])) {
        this.GetStrategyAssetList(data['assetId']).then((res: any) => {
          if (isNullOrUndefined(stgyNo) || stgyNo < 0) {
            var EPstgy = [...res].filter((x: any) => isNullOrUndefined(x.name) || isNullOrUndefined(x.shortname) || x.name == "" || x.shortname == "");
            if (EPstgy.length > 0) {
              this.currentSNo.next(EPstgy[0]['rowno']);
              this.DeleteStrategyList(EPstgy[0]).then(res => {
                if (isNotNullOrUndefined(res)) {
                  this.createNewStrategy(EPstgy[0]['rowno']).then(res1 => {
                    if (isNotNullOrUndefined(res1)) {
                      this.getSelStgy(data['assetId'], EPstgy[0]['rowno']).then(res3 => {
                        if (isNotNullOrUndefined(res3)) { resolve(res3) }
                        else { reject({ 'from': 'getSelStgy' }) }
                      });
                    } else {
                      reject({ 'from': 'createNewStrategy' })
                    }
                  });
                } else {
                  reject({ 'from':'DeleteStrategyList'})
                }
              
              });
            } else {
              var newRowNo: number = 0;
              if (isNotNullOrUndefined(res) && res.length > 0) {
                newRowNo = max([...res].map((x: any) => x.rowno)) + 1
              }
              this.currentSNo.next(newRowNo);
              this.createNewStrategy(newRowNo).then(res => {
                if (isNotNullOrUndefined(res)) {
                  this.getSelStgy(data['assetId'], newRowNo).then(res2 => {
                    if (isNotNullOrUndefined(res2)) { resolve(res2) }
                    else { reject({ 'from': 'getSelStgy' }) }
                  });
                }
                else { reject({ 'from': 'createNewStrategy' }) }
                
              });
            }
          } else {
            var stgy = [...res].filter((x: any) => x.assetId == data['assetId'] && x.rowno == stgyNo);
            if (stgy.length > 0) { resolve(stgy[0]) } else { reject({ 'from': 'getSelStgy' }) }
          }
        })
      }
    });
  }

  getSelStgy(assetId: number, stgyNo: number) {
    return new Promise((resolve, reject) => {
      this.GetStrategyAssetList(assetId).then((res: any) => {
        var stgy = [...res].filter((x: any) => x.assetId == assetId && x.rowno == stgyNo);
        if (stgy.length > 0) { resolve(stgy[0]) } else { resolve(undefined) }
      });
    });
  }

  createNewStrategy(sno: number) {
    var that = this;
    return new Promise((resolve, reject) => {
      var basedata: any = that.customizeSelectedIndex_custom.value;
      var d = new Date();
      var assetid;
      var indexId: number = 123;
      var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
      if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
      else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
      else { d = new Date(this.sharedData.equityHoldDate); }
      indexId = this.getIndexId(basedata);
      assetid = basedata.assetId;

      var selectBy: number = 0;
      var weightBy: number = 0;
      var noofComp: number = 0;
      var cashTarget: number = 2;
      var weightLimit: number = 0;
      var rebalanceType: string = 'q';
      var taxEffAwareness: string = 'N';
      var weightFlag: string = 'N';
      var selectedByName: string = '';
      var weightedByName: string = '';
      var rebalanceByName: string = '';
      try {
        if (isNotNullOrUndefined(basedata['mode']) && basedata['mode'] == "B") {
          if (isNotNullOrUndefined(basedata['selectBy'])) { selectBy = basedata['selectBy']; }
          if (isNotNullOrUndefined(basedata['weightBy'])) { weightBy = basedata['weightBy']; }
          if (isNotNullOrUndefined(basedata['noofComp'])) { noofComp = basedata['noofComp']; }
          if (isNotNullOrUndefined(basedata['cashTarget'])) { cashTarget = basedata['cashTarget']; }
          if (isNotNullOrUndefined(basedata['rebalanceType'])) { rebalanceType = basedata['rebalanceType']; }
          if (isNotNullOrUndefined(basedata['taxEffAwareness'])) { taxEffAwareness = basedata['taxEffAwareness']; }
          if (isNotNullOrUndefined(basedata['weightFlag'])) { weightFlag = basedata['weightFlag']; }
          if (isNotNullOrUndefined(basedata['selectedByName'])) { selectedByName = basedata['selectedByName']; }
          if (isNotNullOrUndefined(basedata['weightedByName'])) { weightedByName = basedata['weightedByName']; }
          if (isNotNullOrUndefined(basedata['rebalanceByName'])) { rebalanceByName = basedata['rebalanceByName']; }
        }
      } catch (e) { }
     
      try {
        if (isNullOrUndefined(d.getFullYear()) || isNaN(d.getFullYear())) { d = new Date(); }
        var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
        let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
        let datas = {
          "id": 0,
          "userid": userid,
          "rowno": sno,
          "category": "ETF",
          "assetId": assetid,
          "createddate": new Date(),
          "modifieddate": new Date(),
          "status": "A",
          "mode": 'A',
          "defaultStgy": "N",
          "selectBy": selectBy,
          "noofComp": noofComp,
          "weightBy": weightBy,
          "taxEffAwareness": taxEffAwareness,
          "name": "",
          "shortname": "",
          "description": "",
          "enableTrading": "N",
          "basedon": "",
          "cashTarget": cashTarget,
          "rebalanceType": rebalanceType,
          "endDate": date,
          "tenYrFlag": 1,
          "selectedByName": selectedByName,
          "weightedByName": weightedByName,
          "rebalanceByName": rebalanceByName,
          "erfflag": "N",
          "indextotalcount": 0,
          "removedcount": noofComp,
          "weightLimit": weightLimit,
          "weightFlag": weightFlag,
        }
        var statdata: any = [];
        statdata.push(datas);
        that.dataService.PostStrategyData(statdata).pipe(first()).subscribe(data => { resolve(data) },
          error => {
            resolve(undefined);
            this.logger.logError(error, 'PostStrategyData');
          });
      } catch (e) {
        reject(e)
        this.logger.logError(e, 'catch error');
      }
    });
  }
  checkFlagPostStr: checkpostFilAPI = { 'compFilter': false, 'gicsFilter': false, 'selection_Weighting': false, postNotify: false, accountSelect: false, factor:false };

  DeleteStrategyList(data: any,) {
    var that = this;
    var statdata:any = [];
    statdata.push(data);
    return new Promise((resolve, reject) => {
      that.dataService.DeleteStrategyData(statdata).pipe(first()).subscribe((data: any) => {
        resolve(data)
      }, (error: any) => {
        resolve(undefined);
        this.logger.logError(error, 'DeleteStrategyData');
      });
    });
  }

  measureText(string: any, fontSize = 9) {
    const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
    const avg = 0.5279276315789471
    return string
      .split('')
      .map((c: any) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur: any, acc: any) => acc + cur) * fontSize
  }

  saveCustomIndexFilter() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.checkFlagPostStr = { 'compFilter': false, 'gicsFilter': false, 'selection_Weighting': false, postNotify: false, accountSelect: false, factor: false };
    var compData: any = [];
    var assetId = this.currentSList.value.assetId;
    var gicsdata: any = [];
    var no = that.currentSNo.value;
    var checkFactorPost: boolean = false;
    var clist = that.strategyList.value.filter((x: any) => x.rowno == no);
    if (clist.length > 0) {

      //filter company data
      var rCompData = that.companyExList.value.filter((d: any) => d.status != 'E');
      [...rCompData].forEach((d: any) => {
        if (that.remCompData.value.filter((x: any) => x == d.stockKey).length == 0) {
          var compExdata: PostCompObj = {
            "id": parseInt(d.id),
            "slid": clist[0].id,
            "stockKey": d.stockKey,
            //"createddate": new Date(),
            //"modifieddate": new Date(),
            "status": "D",
            "userid": parseInt(userid),
            "name": '',
            ticker: '',
            "score": 0,
            "marketvalue": 0,
            "indexweight": 0,
          };
          compData.push(compExdata);
        }
      });
      [...that.remCompData.value].forEach((x: any) => {
        if (rCompData.filter((d: any) => x == d.stockKey).length == 0) {
          var stockInfo: any = that.checkStockDt(x);
          var compExdata: PostCompObj = {
            "id": 0,
            "slid": clist[0].id,
            "stockKey": x,
            //"createddate": new Date(),
            //"modifieddate": new Date(),
            ticker: (stockInfo.length == 0 || isNullOrUndefined(stockInfo[0]['ticker'])) ? '' : stockInfo[0]['ticker'],
            "status": 'A',
            "userid": parseInt(userid),
            "name": (stockInfo.length == 0 || isNullOrUndefined(stockInfo[0]['companyName'])) ? '' : stockInfo[0]['companyName'],
            "score": that.checkScore(stockInfo),
            "marketvalue": (stockInfo.length == 0 || isNullOrUndefined(stockInfo[0]['marketCap'])) ? 0 : stockInfo[0]['marketCap'],
            "indexweight": (stockInfo.length == 0 || isNullOrUndefined(stockInfo[0]['Wt'])) ? 0 : stockInfo[0]['Wt'],
          };
          compData.push(compExdata);
        }
      });

      if (compData.length > 0) {
        checkFactorPost = true;
        that.createCompExList(compData, clist[0].id);
      } else {
        that.checkFlagPostStr.compFilter = true;
        that.checkPostFilersData();
      };

      //filter sector data
      [...that.gicsExList.value].forEach((d: any) => {
        if (that.remGicsData.value.filter((x: any) => x == d.industry).length == 0) {
          var gicsExdata: PostGicsObj = {
            "id": d.id,
            "slid": clist[0].id,
            "userid": parseInt(userid),
            "industry": parseInt(d.industry),
            //"createddate": new Date(),
            //"modifieddate": new Date(),
            "status": "D",
            "name": '',
            "category": '',
          }
          gicsdata.push(gicsExdata);
        }
      });
      [...that.remGicsData.value].forEach((x: any) => {
        if (that.gicsExList.value.filter((d: any) => x == d.industry).length == 0) {
          var secInfo: any = that.checkSectorDt(parseInt(x));
          var gicsExdata: PostGicsObj = {
            "id": 0,
            "slid": clist[0].id,
            "userid": parseInt(userid),
            "industry": parseInt(x),
            //"createddate": new Date(),
            //"modifieddate": new Date(),
            "status": "A",
            "name": (isNullOrUndefined(secInfo) || secInfo.length == 0) ? null : secInfo[0]['name'],
            "category": (isNullOrUndefined(secInfo) || secInfo.length == 0) ? null : secInfo[0]['type'],
          }
          gicsdata.push(gicsExdata);
        }
      });
      if (gicsdata.length > 0) {
        checkFactorPost = true;
        that.createGicsExList(gicsdata, clist[0].id);
      } else {
        that.checkFlagPostStr.gicsFilter = true;
        that.checkPostFilersData();
      };

      //selection Account data from DB
      var accountData: any = [];
      [...that.bldIndAccountData.value].forEach(d => {
        if (that.bldMyIndAccountData.value.filter((x: any) => parseInt(x.accountId) == parseInt(d.accountId)).length == 0) {
          var CTtype = 'G';
          if (d['taxType'] == 'G' || d['taxType'] == "L") { CTtype = d['taxType'] }
          var accData: PostStgyAccDt = {
            "id": d.id,
            "accountId": parseInt(d.accountId),
            "userid": parseInt(userid),
            "slid": clist[0].id,
            "status": "D",
            "cashTarget": d['cashTarget'],
            "taxType": CTtype,
            "taxTarget": d['taxTarget'],
            "taxBufferGainTarget": d['taxBufferGainTarget'],
            "marketvalue": d['marketvalue'],
            "shortterm": d['shortterm'],
            "longterm": d['longterm'],
            "transitionDate": formatDate(d['transitionDate'], 'yyyy/MM/dd', 'en-US'),
            "transitionGainTgt": d['transitionGainTgt'],
          }
          if (d['tradedStatus'] != 'Y') { accountData.push(accData); }
        }
      });
      [...that.bldMyIndAccountData.value].forEach(x => {
        var oldData = that.bldIndAccountData.value.filter((d: any) => parseInt(x.accountId) == parseInt(d.accountId))
        var CTtype = 'L';
        if (x['taxType'] == 'G' || x['taxType'] == "L") { CTtype = x['taxType'] }
        var accData: PostStgyAccDt = {
          "id": (oldData.length > 0) ? oldData[0]['id'] : 0,
          "accountId": parseInt(x.accountId),
          "userid": parseInt(userid),
          "slid": clist[0].id,
          "status": "A",
          "cashTarget": x['cashTarget'],
          "taxType": CTtype,
          "taxTarget": x['taxTarget'],
          "taxBufferGainTarget": x['taxBufferGainTarget'],
          "marketvalue": x['marketValue'],
          "shortterm": x['shortterm'],
          "longterm": x['longterm'],
          "transitionDate": formatDate(x['transitionDate'], 'yyyy/MM/dd', 'en-US'),
          "transitionGainTgt": x['transitionGainTgt'],
        }
        if (oldData.length > 0 && isNotNullOrUndefined(oldData[0]['tradedStatus']) && oldData[0]['tradedStatus'] == 'Y') { }
        else { accountData.push(accData); }
      });

      var filAccDt = that.checkAccountFilter(accountData, [...that.bldIndAccountData.value], clist[0].id);
      if (filAccDt.length > 0) { that.createAccountList(filAccDt, clist[0].id); }
      else {
        that.checkFlagPostStr.accountSelect = true;
        that.checkPostFilersData();
      }
      this.sharedData.checkHoldingQueue(clist[0].id, accountData,'CI');

      /*factor data*/
      var postFactData: any = [];
      this.getExclFactorCompData().then((factGData: any) => {
        this.initPostStrategyFactorsData.value.forEach((dd: any) => {
          if (that.PostStrategyFactorsData.value.filter((x: any) => x.factorid == dd.factorid).length == 0) {
            var d = Object.assign({}, dd);
            var minMax: any = this.checkFactMinMaxDt(d, factGData);
            d['orgTopPct'] = 0;
            d['orgBottomPct'] = 100;
            d['orgTopValue'] = minMax.min;
            d['orgBottomValue'] = minMax.min;
            d['status'] = 'D';
            postFactData.push(d);
          }
        });
        this.PostStrategyFactorsData.value.forEach((d: any) => {
          var minMax: any = this.checkFactMinMaxDt(d, factGData);
          d['orgTopPct'] = 0;
          d['orgBottomPct'] = 100;
          d['orgTopValue'] = minMax.min;
          d['orgBottomValue'] = minMax.max;
          d['status'] = 'A';
          d['endval'] = that.CheckFactorTopValue(d, minMax.max, 'orgBottomValue', 'endval');
          d['startval'] = that.CheckFactorTopValue(d, minMax.min, 'orgTopValue', 'startval');
          postFactData.push(d);
        });
        if (checkFactorPost && postFactData.length > 0) { this.PostStrategyFactor(postFactData, clist[0].id, assetId); }
        else if (postFactData.length > 0 && that.compareFactorDa(postFactData, [...this.initPostStrategyFactorsData.value])) {          
          this.PostStrategyFactor(postFactData, clist[0].id, assetId);
        } else {
          that.checkFlagPostStr.factor = true;
          this.checkPostFilersData();
        }
      });
    }
  }

  createCompExList(clist: any, slid: any) {
    var that = this;
    this.PostCompExData(clist).then((postRes: any) => {
      this.GetCompanyExList(slid).then((getRes: any) => {
        if (this.sharedData.checkServiceError(getRes)) {
          that.companyExList.next([]);
          that.checkFlagPostStr.compFilter = true;
        } else {
          that.companyExList.next(getRes);
          if (getRes.length > 0) {
            let data = [];
            getRes.forEach(function (value: any) { data.push(value.stockKey); });
          }
          that.checkFlagPostStr.compFilter = true;
        }
        this.checkPostFilersData();
      });
    });
  }

  createGicsExList(glist: any, slid: any) {
    var that = this;
    this.PostGicsExData(glist).then((postRes: any) => {
      this.GetGicsExList(slid).then((getRes: any) => {
        if (this.sharedData.checkServiceError(getRes)) {
          that.gicsExList.next([]);
          that.checkFlagPostStr.gicsFilter = true;
        } else {
          that.gicsExList.next(getRes);
          if (getRes.length > 0) {
            let data = [];
            getRes.forEach(function (value: any) { data.push(value.industry); });
          }
          that.checkFlagPostStr.gicsFilter = true;
        }
        this.checkPostFilersData();
      });
    });
  }

  checkSectorDt(d:any) {
    var that = this;
    var data: any = that.sharedData.dbGICS.getValue();
    return data.filter((x:any) => x.code == d);
  }

  createAccountList(data: any, slid: any) {
    var that = this;
    this.PostStrategyAccount(data).then((postRes: any) => {
      this.GetStrategyAccount(slid).then((getRes: any) => {
        if (this.sharedData.checkServiceError(getRes)) {
          that.bldIndAccountData.next([]);
          that.checkFlagPostStr.accountSelect = true;          
        } else {
          that.bldIndAccountData.next(getRes);
          if (getRes.length > 0) {
            var val = that.loadeStrAccuntInfo(getRes);
            that.bldMyIndAccountData.next(val);
          } else { that.bldMyIndAccountData.next(getRes); };
          that.checkFlagPostStr.accountSelect = true;
        }
        this.checkPostFilersData();
      });
    });
  }

  loadeStrAccuntInfo(data:any) {
    var accList = data.map((a:any) => ({ ...a }));
    return accList;
  }

  compareFactorDa(ar1: any, ar2: any) {
    var factChange: boolean = false;
    ar1.forEach((item:any) => {
      var filDt = ar2.filter((x: any) => x.factorid == item.factorid);
      if (filDt.length > 0) {
        if (filDt[0]["startval"] == item["startval"] && filDt[0]["status"] == item["status"] &&
          filDt[0]["endval"] == item["endval"] && filDt[0]["perorval"] == item["perorval"]) { } else { factChange = true; }
      } else { factChange = true; }
    });
    return factChange;
  }

  PostStrategyFactor(data: any, slid: any, assetId: any) {
    var that = this;
    var FnlFact: any = this.remDupArrOfObj(data, 'factorid');
    this.PostStrategyFactorsByStatus(FnlFact).then((postRes: any) => {
      this.GetStrategyFactors(slid, assetId).then((getRes: any) => {       
          if (this.sharedData.checkServiceError(getRes)) {
            that.PostStrategyFactorsData.next([]);
            that.initPostStrategyFactorsData.next([]);
          } else {
            this.PostStrategyFactorsData.next([...getRes]);
            this.initPostStrategyFactorsData.next([...getRes]);
          }
        that.checkFlagPostStr.factor = true;
        this.checkPostFilersData();
      });
    });
  }

  remDupArrOfObj(myArray: any, Prop: any) {
    return myArray.filter((obj: any, pos: any, arr: any) => { return arr.map((mapObj: any) => mapObj[Prop]).indexOf(obj[Prop]) === pos; });
  }

  checkPostFilersData() {
    var that = this;
    if (that.checkFlagPostStr.compFilter && that.checkFlagPostStr.gicsFilter &&
      that.checkFlagPostStr.factor && that.checkFlagPostStr.accountSelect &&
      that.checkFlagPostStr.selection_Weighting &&
      that.checkFlagPostStr.postNotify && that.checkFlagPostStr.accountSelect) {
      setTimeout(() => { that.postNotification(); }, 2000);
    };
  }

  lockInfo:any = [];
  postNotification() {
    var that = this;
    this.lockInfo= [];
    var clist = this.currentSList.value;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var basedata: any = that.customizeSelectedIndex_custom.value;
    var d = new Date();
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
    if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
    else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
    else { d = new Date(this.sharedData.equityHoldDate); }
    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
    var factDt: any = [];
    factDt.push({ "accountId": 0, "userid": parseInt(userid), "slid": clist.id });
    that.bldMyIndAccountData.getValue().forEach((acc:any) => {
      var oldData = that.bldIndAccountData.value.filter((d: any) => parseInt(acc.accountId) == parseInt(d.accountId))
      if (oldData.length > 0 && isNotNullOrUndefined(oldData[0]['tradedStatus']) && oldData[0]['tradedStatus'] == 'Y') { } else {
        factDt.push({ "accountId": acc['accountId'], "userid": parseInt(userid), "slid": clist.id })
      }
    });

    this.checkFactsheetInit(factDt).then((res:any) => {
      if (res.status && res.data.length > 0) {
        var postData: any = [];
        res.data.forEach((acc:any) => {
          if (acc['factsheetAvail'] == 'Y' || (acc['factsheetAvail'] == 'N' && acc['notifyId'] == 0)) {
            postData.push({
              "accountId": acc['accountId'],
              "slid": clist.id,
              "userid": parseInt(userid),
              "status": "A",
              "enddate": date,
              "freqflag": isNullOrUndefined(clist['rebalanceType']) ? that.sharedData.defaultRebalanceType : clist['rebalanceType'],
              "tenYrFlag": 1,
              "erfflag": that.checkErfflag()
            });
          }
        });
        if (postData.length > 0) {
          that.dataService.PostStrategyNotificationQueue(postData).pipe(first())
            .subscribe(data => {
              if (data[0] != "Failed") {
                if (data[0].toLowerCase().indexOf('locked') > -1) { that.checkReloadpostNotification(); }
                else {
                  that.toastr.success('Added to queue successfully', '', {
                    timeOut: 5000,
                    progressBar: false,
                    positionClass: "toast-top-center"
                  });
                  this.sharedData.showMatLoader.next(false);
                  //that.sharedData.showFactorsLoader.next(false);
                  that.sharedData.getNotificationDataReload();
                  that.CIcalculateBtnEnable = false;
                }
              }
            }, error => { this.logger.logError(error, 'PostStrategyNotificationQueue'); });
        } else {
          that.toastr.success('No changes are made in strategy to calculate', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
          this.sharedData.showMatLoader.next(false);
          //that.sharedData.showFactorsLoader.next(false);
          that.CIcalculateBtnEnable = false;
        }
      } else {
        this.sharedData.showMatLoader.next(false);
        //that.sharedData.showFactorsLoader.next(false);
        that.CIcalculateBtnEnable = false;
      }
    })
  }

  checkReloadpostNotification() {
    var that = this;
    this.sharedData.showMatLoader.next(true);
    this.lockInfo = [];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data:any = [];
    this.bldMyIndAccountData.getValue().forEach((d: any) => {
      var obj = { "accid": d['accountId'], "userid": userid };
      data.push(obj);
    });
    this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
      this.sharedData.showMatLoader.next(false);
      this.lockInfo = res.filter((ld:any) => ld.lockstatus == 'Y');
      //$('#API_lockmodal_CI').modal('show');
    });
  }

  checkFactsheetInit(data: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService.GetFactSheetGConditions(data).pipe(first()).subscribe(data => {
        if (this.sharedData.checkServiceError(data)) { resolve({ data: [], status: false }) } else { resolve({ data: data, status: true }) }
      }, error => { resolve({ data: [], status: false }) });
    });
  }

  checkFactMinMaxDt(d: any, factGData: any) {
    var factdata = this.checkFactorKey(d.factorid);
    var compDat = [];
    if (d.factorid == 18) {
      compDat = this.exclusionCompData.getValue().map((x: any) => x.scores).filter((du: any) => isNotNullOrUndefined(du));
      var minCompDat: any = d3.min(compDat);
      var maxCompDat: any = d3.max(compDat);
      var min = parseFloat(minCompDat);
      var max = parseFloat(maxCompDat);
      return { min: min, max: max }
    } else {
      var factValue: any = this.comFactorsData.getValue().filter(this.addcomparerfact(factGData)).map((x: any) => x[factdata]).filter((du: any) => isNotNullOrUndefined(du));
      if (isNotNullOrUndefined(factValue) && factValue.legth > 0) {
        compDat = factValue.map((x: any) => x[factdata]).filter((du:any) => isNotNullOrUndefined(du));
      } else {
        compDat = this.comFactorsData.getValue().map((x: any) => x[factdata]).filter((du: any) => isNotNullOrUndefined(du));
      }
      var minCompDat: any = d3.min(compDat);
      var maxCompDat: any = d3.max(compDat);
      var min = parseFloat(minCompDat);
      var max = parseFloat(maxCompDat);
      return { min: min, max: max }
    };
  }

  checkFactorKey(factorid: number): string {
    var factorname = '';
    if (factorid == 13) { factorname = "ROE" }
    else if (factorid == 8) { factorname = "GrossMargin" }
    else if (factorid == 6) { factorname = "EPSGrowthQuarterly" }
    else if (factorid == 17) { factorname = "MarketCapFreeFloat" }
    else if (factorid == 14) { factorname = "SalesGrowth" }
    else if (factorid == 4) { factorname = "BookToMarket" }
    else if (factorid == 10) { factorname = "LeverageRatioBook" }
    else if (factorid == 12) { factorname = "PriceToEarnings" }
    else if (factorid == 5) { factorname = "DividendYield" }
    else if (factorid == 1) { factorname = "Accruals" }
    else if (factorid == 7) { factorname = "FCFYield" }
    else if (factorid == 15) { factorname = "SalesYield" }
    else if (factorid == 9) { factorname = "InterestCoverage" }
    else if (factorid == 20) { factorname = "Momentum1Year" }
    else if (factorid == 2) { factorname = "AssetGrowth" }
    else if (factorid == 21) { factorname = "Volatility1Year" }
    else if (factorid == 19) { factorname = "Beta1Year" }
    return factorname;
  }

  checkStockDt(d:any) {
    var that = this;
    var data: any = that.exclusionCompData.getValue();
    return data.filter((x:any) => x.stockKey == d);
  }

  checkScore(d:any) {
    if (isNotNullOrUndefined(d[0].scores)) { return d.scores * 100; }
    else if (isNotNullOrUndefined(d[0].score)) { return d.score; }
    else { return 0 }
  }

  saveBldsel(postNotify: boolean = false) {
    var that = this;
    this.checkFlagPostStr.postNotify = postNotify;
    if (isNullOrUndefined(that.custToolWeightByValue.value) || that.custToolWeightByValue.value == 0) { that.custToolWeightByValue.next(2); }
    if (isNullOrUndefined(that.custToolSelectByValue.value) || that.custToolSelectByValue.value == 0) { that.custToolSelectByValue.next(2); }
    if (isNullOrUndefined(that.custToolCashTarget.value) || that.custToolCashTarget.value == 0) { that.custToolCashTarget.next(2); }
    if (isNotNullOrUndefined(that.currentSList.value)) {
      var tencheck: boolean = false;
      var curSList = Object.assign({}, that.currentSList.value);
      if (isNullOrUndefined(curSList.tenYrFlag)) {
        curSList.tenYrFlag = 1;
        tencheck = true;
      }
      if (isNullOrUndefined(curSList.endDate)) {
        var d = new Date(this.sharedData.equityHoldDate);
        var lipperDate = formatDate(this.sharedData.GetSchedularMaster.value[0]['LipperHoldingDt'], 'yyyy/MM/dd', 'en-US');
        if (isNotNullOrUndefined(this.sharedData.equityHoldDate) && this.sharedData.equityHoldDate != '') { d = new Date(this.sharedData.equityHoldDate); }
        else { d = new Date(lipperDate); }
        var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == curSList.assetId);
        if (etfHoldDate.length > 0) { d = new Date(etfHoldDate[0]['holdingsdate']) }
        if (isNullOrUndefined(d.getFullYear()) || isNaN(d.getFullYear())) { d = new Date(); }
        var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
        curSList.endDate = date;
        tencheck = true;
      }
      if (this.compareStgyDt(curSList)) {
        curSList.noofComp = that.custToolNoOfComp.value;
        curSList.weightLimit = that.bldMyIndselWeightLimit.value;
        curSList.weightBy = that.custToolWeightByValue.value;
        curSList.selectBy = that.custToolSelectByValue.value;
        curSList.cashTarget = that.custToolCashTarget.value;
        curSList.rebalanceType = that.custToolRebalanceType.value;
        curSList.taxEffAwareness = (that.custToolTaxEffAwareness.value);
        curSList.weightFlag = (that.custToolWeightFlag.value);
        curSList.selectedByName = that.checkSel_WeiOption(that.custToolSelectByValue.value, 'S');
        curSList.weightedByName = that.checkSel_WeiOption(that.custToolWeightByValue.value, 'W');
        curSList.rebalanceByName = that.sharedData.checkLiquidateType(that.custToolRebalanceType.value)
        curSList.erfflag = that.checkErfflag();
        curSList.indextotalcount = this._exclusionCompData.length;
        curSList.removedcount = this.removedcountCI;
        that.dataService.PostStrategyData([curSList]).pipe(first()).subscribe(data => {
              if (data[0] != "Failed") {
                that.dataService.GetStrategyAssetList(curSList.assetId, curSList.mode).pipe(first()).subscribe((slist: any) => {
                  that.strategyList.next(slist);
                  that.currentSList.next("");
                  var currentval = that.strategyList.value.filter((x: any) => x.rowno == that.currentSNo.value);
                  that.currentSList.next(currentval[0]);
                  if (that.calculate_active.value) {
                    that.calculate_active.next(false);
                    that.checkFlagPostStr.selection_Weighting = true;
                    that.checkPostFilersData();
                  }

                }, error => { this.logger.logError(error, 'GetStrategyAssetList'); });
              }
            }, error => { this.logger.logError(error, 'PostStrategyData'); });
      } else {
        if (that.calculate_active.value) {
          that.calculate_active.next(false);
          that.checkFlagPostStr.selection_Weighting = true;
          that.checkPostFilersData();
        }
      }
    }
  }

  compareStgyDt(curSList: any) {
    var that = this;
    var StgyChange: boolean = false;
    if (curSList.noofComp == that.custToolNoOfComp.value && curSList.weightLimit == (that.bldMyIndselWeightLimit.value) &&
      curSList.weightBy == that.custToolWeightByValue.value &&
      curSList.selectBy == that.custToolSelectByValue.value &&
      curSList.cashTarget == that.custToolCashTarget.value &&
      curSList.rebalanceType == that.custToolRebalanceType.value &&
      curSList.taxEffAwareness == (that.custToolTaxEffAwareness.value) && curSList.weightFlag == (that.custToolWeightFlag.value) &&
      curSList.erfflag == that.checkErfflag() &&
      curSList.erfflag == that.checkErfflag() &&
      curSList.indextotalcount == this._exclusionCompData.length &&
      curSList.removedcount == that.removedcountCI) { } else { StgyChange = true; }
    return StgyChange;
  }

  checkErfflag() {
    var rangeData = this.PostStrategyFactorsData.value.filter((xd: any) => xd.factorid == 18);
    if (this.custToolSelectByValue.value == 1 || this.custToolWeightByValue.value == 1) { return "Y" }
    else if (rangeData.length > 0) { return "Y" }
    else { return "N" }
  }

  checkSel_WeiOption(id:any, type:any) {
    var that = this;
    var sData = that.BuildMyIndexOptions.filter((d: any) => ((d.Id == id) && (d.Type == type)));
    if (sData.length > 0) { return sData[0]['Name'] } else { return '' }
  }

  saveStrategy(sno: any, mode: any): any {
    var that = this;
    $('#strategyForce_Modal .close-l').click();    
    var basedata: any = that.customizeSelectedIndex_custom.value;
    var d = new Date();
    var assetid:number;
    var indexId: number = 123;
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
    if (isNotNullOrUndefined(basedata['allocDate'])) { d = new Date(basedata['allocDate']); }
    else if (ETFIndex.length > 0) { d = new Date(ETFIndex[0]['holdingsdate']); }
    else { d = new Date(this.sharedData.equityHoldDate); }
    indexId = this.getIndexId(basedata);
    assetid = basedata.assetId;
    if (isNullOrUndefined(that.custToolCashTarget.value) || that.custToolCashTarget.value == 0) { that.custToolCashTarget.next(2); }
    try {
      if (isNullOrUndefined(d.getFullYear()) || isNaN(d.getFullYear())) { d = new Date(); }
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
      var no = sno;
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let datas = {
        "id": 0,
        "userid": userid,
        "rowno": no,
        "category": "ETF",
        "assetId": assetid,
        "createddate": new Date(),
        "modifieddate": new Date(),
        "status": "A",
        "mode": mode,
        "defaultStgy": "N",
        "selectBy": that.custToolSelectByValue.value,
        "noofComp": that.custToolNoOfComp.value,
        "weightBy": that.custToolWeightByValue.value,
        "taxEffAwareness": that.custToolTaxEffAwareness.value,
        "weightLimit": that.bldMyIndselWeightLimit.value,
        "weightFlag": that.custToolWeightFlag.value,
        "name": that._custToolName,
        "shortname": that._custToolShortname,
        "description": that._custToolDescription,
        "enableTrading": that._enableTrading_factsheet,
        "basedon": "",
        "cashTarget": that.custToolCashTarget.getValue(),
        "rebalanceType": that.custToolRebalanceType.getValue(),
        "endDate": date,
        "tenYrFlag": 1,
        "selectedByName": "",
        "weightedByName": "",
        "rebalanceByName": that.sharedData.checkLiquidateType(that.custToolRebalanceType.getValue()),
        "erfflag": that.checkErfflag(),
        "indextotalcount": 0,
        "removedcount": 0
      }
      var statdata: any = [];
      statdata.push(datas);
      that.dataService.PostStrategyData(statdata).pipe(first()).subscribe(data => {
            if (data[0] != "Failed") {
              that.dataService.GetStrategyAssetList(assetid, mode).pipe(first()).subscribe((slist: any) => {
                $('#SpinLoader_Exclu_left').css('display', 'none');
                that.strategyList.next(slist);
                that.currentSList.next("");
                var currentval = that.strategyList.value.filter((x: any) => x.rowno == that.currentSNo.value);
                that.currentSList.next(currentval[0]);
                //console.log(this._custStrShortName == '', 'createNew------')
                //if ((isNotNullOrUndefined(this._custToolShortname) && isNotNullOrUndefined(this._custToolName)) && this._custToolShortname.trim().length > 0 && this._custToolName.trim().length > 0) {

                  //that.sharedData.showStatDisclosure.next(false);
                  //that.toastr.success(this.sharedData.checkMyAppMessage(0, 16), '', {
                  //  timeOut: 4000,
                  //  progressBar: false,
                  //  positionClass: "toast-top-center"

                  //});
                //} else { that.sharedData.showStatDisclosure.next(true); };

                //this.showFactorsLoader.next(false);
                if (that._forcepopupStrategy) {
                  if ((isNotNullOrUndefined(this._custToolShortname) && isNotNullOrUndefined(this._custToolName)) && this._custToolShortname.trim().length > 0 && this._custToolName.trim().length > 0) {
                    setTimeout((x: any) => {
                      that.calculateTrigger.next(true);
                      //$('#buildMyIndex .calBtn button').trigger('click');
                    }, 2000);
                  }
                }// else { that.getStrategyData(sno, mode); };
                this.checkExistingStrategy.next(statdata);
                //setTimeout((x: any) => { that.customSavedStrategyLoad.next(true); }, 5000);
                }, (error:any) => {
                this.logger.logError(error, 'GetStrategyAssetList');
                //this.sharedData.showFactorsLoader.next(false);
                this.sharedData.showMatLoader.next(false);
              });
            }
          },
          error => {
            this.logger.logError(error, 'PostStrategyData');
            //this.sharedData.showFactorsLoader.next(false);
            this.sharedData.showMatLoader.next(false);
            // that.snackBar.open('Try Again', '', { duration: 2000 });
            //that.toastr.info('Try Again', '', { timeOut: 5000 });
          });
    } catch (e) {
      this.logger.logError(e, 'catch error');
      //console.log(e)
    }
  }

  resetFactorFlags() {
    const dt: any = {
      erfScore: false, accruals: false, assetGrowth: false, beta6: false, beta12: false, bookToMarket: false,
      dividendYield: false, ePSGrowthQuarterly: false, fCFYield: false, grossMargin: false, interestCoverage: false,
      leverageRatioBook: false, momentum6: false, momentum12: false, PriceToEarnings: false, rOE: false, salesGrowth: false,
      salesYield: false, volatility6: false, volatility12: false, marketCapFreeFloat: false,
    };    
    //this.selCompany.next(undefined);
    this.factorCircleFlagData.next(dt)
  }

  getStrategyData(slid: any, assetId:number) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
    this.GetCompanyExList(slid).then((compRes: any) => {
      that.companyExList.next(compRes);
      let remdata: any = [];
      compRes.forEach(function (d: any, i: number) { if (d.status == 'E') {  } else { remdata.push(d.stockKey); } });
      that.remCompData.next([...remdata]);
      this.GetGicsExList(slid).then((GicsRes: any) => {
        that.gicsExList.next(GicsRes);
        let data: any = [];
        GicsRes.forEach(function (d: any, i: number) { data.push(d.industry); });
        that.remGicsData.next([...data]);
          this.GetStrategyFactors(slid, assetId).then((factorRes: any) => {
            this.PostStrategyFactorsData.next([...factorRes]);
            this.initPostStrategyFactorsData.next([...factorRes]);
            this.GetStrategyAccount(slid).then((accRes: any) => {
              that.bldIndAccountData.next(accRes);
              var val = that.loadeStrAccuntInfo(accRes);
              that.bldMyIndAccountData.next(val);
              resolve(1);
            });
          });
      });
    });
    });
  }

  CombinedFactorsData() {
    var that = this;
    var curSList = Object.assign({}, this.currentSList.value);
    return new Promise((resolve, reject) => {
      if (isNotNullOrUndefined(curSList) && Object.keys(curSList).length > 0) {
        var etfdata = this.sharedData.ETFIndex.value.filter((x: any) => x.assetId == curSList.assetId);
        if (etfdata.length > 0) {
          var d = new Date(etfdata[0]['holdingsdate']);
          var holdingdate = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
          this.dataService.CombinedFactorsETFData(curSList.assetId, holdingdate).pipe(first())
            .subscribe(TechBetaData => {
              if (this.sharedData.checkServiceError(TechBetaData)) {
                resolve([])

                this.logger.logError(TechBetaData, 'getFactorTechBeta');
              } else { resolve(TechBetaData) };
            }, error => {
              //resolve([])
              reject(error);
              this.logger.logError(error, 'getFactorTechBeta');
            });
        } else {
          this.dataService.CombinedFactorsData(curSList.assetId).pipe(first())
            .subscribe(TechBetaData => {
              if (this.sharedData.checkServiceError(TechBetaData)) {
                resolve([])
                this.logger.logError(TechBetaData, 'getFactorTechBeta');
              } else { resolve(TechBetaData) };
            }, error => {
              //resolve([])
              reject(error);
              this.logger.logError(error, 'getFactorTechBeta');
            });
        }
      }
    });
  }

  getAccountDt() {
    var that = this;
    return new Promise((resolve, reject) => {
      this.dataService.GetSubAccounts().pipe(first()).subscribe((data: any) => {
        that.accountService.GetAccounts.next(data);
        resolve(data)
      }, error => { resolve([]) });
    });
  }
  //saveEnableTradingDI(sno: any, accId: number): any {
  //  var that = this;
  //  try {
  //    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
  //    let datas = { "userid": parseInt(userid), "slid": sno, "enableTrading": that._enableTrading_factsheet, "accountId": accId };
  //    var statdata = [];
  //    statdata.push(datas);
  //    that.dataService.PostEnableTrading(datas).pipe(first()).subscribe((data: any) => {
  //      if (data[0] != "Failed") {
  //        if (that._enableTrading_factsheet == "Y") { that.toastr.success(that.sharedData.checkMyAppMessage(0, 17), '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" }); }
  //        else { that.toastr.success(that.sharedData.checkMyAppMessage(0, 18), '', { timeOut: 4000, positionClass: "toast-top-center" }); }
  //        that.getCIEnabletradinglist(accId);
  //      }
  //    }, (error: any) => {
  //      //this.logger.logError(error, 'PostTrading');
  //      that.toastr.info('Try Again', '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
  //    });
  //  } catch (e) {
  //    //this.logger.logError(e, 'catch error'); console.log(e)
  //  }
  //}
  //getCIEnabletradinglist(accId: number) {
  //  this.dataService.GetDIEnabletradinglist(accId).pipe(first()).subscribe(data => {
  //    if (this.sharedData.checkServiceError(data)) { this.CIEnabletradinglist.next([]); } else { this.CIEnabletradinglist.next(data); }
  //  }, error => { this.CIEnabletradinglist.next([]); });
  //}
  checkCashTarget(d:any) { if (isNullOrUndefined(d['cashTarget'])) { return this.stgyDefalutData.cashTarget; } else { return d['cashTarget'] } }
  checkRebalanceType(d:any) { if (isNullOrUndefined(d['rebalanceType'])) { return this.stgyDefalutData.rebalanceType; } else { return d['rebalanceType'] } }

  GetBuildMyIndexMnthlyHPSavedCIkubSub: any;
  getExclCompData_indexsteps() {
    var that = this;
    return new Promise((resolve, reject) => {
      this.customizeSelectedIndex_custom.pipe(first()).subscribe(customizeSelectedIndex => {
        var d = new Date();
        var indexId = 123;
        var assetId = (isNotNullOrUndefined(customizeSelectedIndex['assetId'])) ? customizeSelectedIndex['assetId'] : 0;
        var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetId);
        if (etfHoldDate.length > 0) { d = new Date(etfHoldDate[0]['holdingsdate']); } else {
          indexId = this.getIndexId(customizeSelectedIndex);
          d = new Date(this.sharedData.equityHoldDate);
        }
        var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
        var accID = 0;
        var currentList = this.currentSList.value;
        var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList.id && x.accountId == accID);
        let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
        var data = {
          "accountId": accID,
          "notifyid": notifyId[0]['notifyId'],
          "assetid": notifyId[0]['assetId'],
          "userid": userid,
          "strategyId": notifyId[0]['slid'],
          "enddate": date,
          "tenYrFlag": notifyId[0]['tenYrFlag'],
          "indexId": indexId,
          "freqflag": notifyId[0]['freqflag']
        };
       this.GetBuildMyIndexMnthlyHPSavedCIkubSub=this.dataService.GetBuildMyIndexMnthlyHPSavedCIkub(data).pipe(first()).subscribe(res => {
          if (this.sharedData.checkServiceError(res)) { resolve({ 'res': [], 'factIndexStepGrp': [] }); }
          else {
            var dta: any = res;
            var data:any = []
              dta.forEach((x:any) => {
                var newObj = Object.assign({}, x);
                var mkFilter = this._exclusionCompData.filter((cu:any) => cu.isin == x.isin)
                if (isNotNullOrUndefined(x.Weight)) { newObj.Wt = x.Weight * 100; }
                else { newObj.Wt = x.weight * 100; }
                newObj['score'] = mkFilter.length > 0 ? (mkFilter[0]['scores']*100) : 0;
                newObj['scores'] = mkFilter.length > 0 ? (mkFilter[0]['scores']) : 0;
                newObj['newSec'] = x.sector;
                newObj['marketCap'] = mkFilter.length > 0 ? mkFilter[0]['marketCap'] : 0;
                data.push(newObj)
              });
              data = data.map((a:any) => ({ ...a }));
              data = data.sort(function (x:any, y:any) { return d3.descending((x.Wt), (y.Wt)); });            
            resolve({ 'res': [...data], 'factIndexStepGrp': [] });
          }
        }, error => { resolve({ 'res': [], 'factIndexStepGrp': [] }); });
      });
    });
  }

  factPval(id: number, value: any) {
    if (id == 19 || id == 10 || id == 4 || id == 9 || id == 1) { return format(".2f")(value); }
    else if (id == 17) {
      let ActVal = value * 1000000;
      return this.CurrencyFormat(ActVal).toString();
    }
    else if (id == 12 || id == 2 || id == 7 || id == 5 || id == 8 || id == 15 || id == 18 ||
      id == 20 || id == 14 || id == 13 || id == 6 || id == 21) { return format(".2f")(value * 100) + "%"; }
    else { return value }
  }

  CurrencyFormat(val: any) {
    return Math.abs(Number(val)) >= 1.0e+12
      ? (Math.abs(Number(val)) / 1.0e+12).toFixed(2) + " T" : Math.abs(Number(val)) >= 1.0e+9
        ? (Math.abs(Number(val)) / 1.0e+9).toFixed(1) + " B" : Math.abs(Number(val)) >= 1.0e+6
          ? (Math.abs(Number(val)) / 1.0e+6).toFixed(1) + " M" : Math.abs(Number(val)) >= 1.0e+3
            ? (Math.abs(Number(val)) / 1.0e+3).toFixed(1) + " K" : Math.abs(Number(val));
  }

  CheckFactorTopValue(d: any, minMax: any, orgKey: string, val: string) {
    var that = this;
    var oldFactor: any = that.PostStrategyFactorsData.value.filter((x: any) => x.factorid == d.factorid);
    if (oldFactor.length > 0) {
      if (oldFactor[0][orgKey] == oldFactor[0][val]) {
        if (oldFactor[0][orgKey] == minMax) { return d[val] }
        else { return minMax }
      } else { return d[val] }
    } else { return d[val] }
  }

  cloneStgyfromAccount(d: any) {
    var newRow: number = 0;
    this.GetStrategyAssetList(d['assetId']).then((res: any) => {
      if (res.length > 0) {
        res = res.sort((a: any, b: any) => a.rowno - b.rowno);
        var rowD: any = res.slice(-1)[0];
        newRow = rowD.rowno + 1;
      } else {
        /** new strategy **/
        newRow = 1;
      }
      var stgyD = [...res].filter((x: any) => x.rowno);
      //console.log(stgyD);
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     /* if (stgyD.length > 0) {*/
        var statdata = [{
          "id": d['id'],
          "userid": userid,
          "slid": 0,
          "rowno": newRow,
          "mode": d['mode']
        }]
        this.PostCloneSData(statdata).then((res) => {
          if (isNotNullOrUndefined(res)) {
            this.GetStrategyAssetList(d['assetId']).then((filterData: any) => {
              var latestClonedSdata = filterData.filter((u: any) => u.assetId == d.assetId && u.rowno == newRow);
              if (latestClonedSdata.length > 0) {
                this.customizeSelectedIndex_custom.next(latestClonedSdata[latestClonedSdata.length-1]);
                this.currentSNo.next(newRow);
                this.startIndexClick_custom.next(false);
                this.router.navigate(["customIndexing"]);
                this.clonedStratTrigger.next(true);
              }
            })
            this.toastr.info('Strategy cloned successfully', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
          }
        }).catch((res) => { this.toastr.info('Strategy clonning error, please try again...', '', { timeOut: 5000, progressBar: false,  positionClass: "toast-top-center" }); this.clonedStratTrigger.next(true); });
     /* }*/
    });
  }

  cloneStgy(d: any) {
    var newRow: number = 0;
    this.GetStrategyAssetList(d['assetId']).then((res: any) => {
      if (res.length > 0) {
        res = res.sort((a: any, b: any) => a.rowno - b.rowno);
        var rowD: any = res.slice(-1)[0];
        newRow = rowD.rowno + 1;
      } else {
        /** new strategy **/
        newRow = 1;
      }
      var stgyD = [...res].filter((x: any) => x.rowno);
      //console.log(stgyD);
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     /* if (stgyD.length > 0) {*/
        var statdata = [{
          "id": d['id'],
          "userid": userid,
          "slid": 0,
          "rowno": newRow,
          "mode": d['mode']
        }]
        //var obj = Object.assign({}, stgyD[0]);
        //obj.slid = 0;
        //obj.rowno = newRow;
        //var statdata: any = [obj];
        this.PostCloneSData(statdata).then((res) => {
          if (isNotNullOrUndefined(res)) {
            this.GetStrategyAssetList(d['assetId']).then((filterData: any) => {
              var latestClonedSdata = filterData.filter((u: any) => u.assetId == d.assetId && u.rowno == newRow);
              if (latestClonedSdata.length > 0) {
                this.customizeSelectedIndex_custom.next(latestClonedSdata[latestClonedSdata.length - 1]);
                this.currentSNo.next(newRow);
                this.startIndexClick_custom.next(false);
                this.router.navigate(["customIndexing"]);
                this.toastr.info('Strategy cloned successfully', '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                this.clonedStratTrigger.next(true);
              }
            })
          }
        }).catch((res) => { this.toastr.info('Strategy clonning error, please try again...', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" }); });
     /* }*/
    });
  }

  PostCloneSData(statdata:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      that.dataService.PostCloneSData(statdata).pipe(first()).subscribe((res: any) => {
        if (isNotNullOrUndefined(res) && res.length > 0 && res[0] != "Failed") { resolve(res); }
        else { reject(undefined) };
      }, (error: any) => {
        reject(undefined)
        that.logger.logError(error, 'PostCloneSData');
      });
    });
  }

  checkAccTrans(accId:any) {
    var data = this.accountService.GetAccounts.value;
    var find = data['accounts'].findIndex((xu:any) => parseInt(xu.accountId) == parseInt(accId));
    if (find > -1) {
      var mkValue = data['summary'][find]['availablefunds']['amount'];
      var cashBal = data['ledger'][find]['usd']['cashbalance'];
      if (mkValue == cashBal) { return false } else { return true }
    } else { return true }
  }

  checkCircleAnnCum() {
    if (this._remCompData.length > 0 || this._remGicsData.length > 0 || 
      this._PostStrategyFactorsData.length > 0) { return true } else { return false }
  }

  checkFactorResetBtn(factorid: number) {
    var showResetBtn: boolean = false;
    var factDt: any[] = this.PostStrategyFactorsData.value;
    var fDt = factDt.findIndex((x: any) => x.factorid == factorid);
    if (fDt > -1) { showResetBtn = true };
    return showResetBtn;
  }

  checkEnableFactSheet() {
    var that = this;
    var val: boolean = false;
    var all_list = that.sharedData.getNotificationQueue.value;
    var currentList = that.currentSList.value;
    var x = all_list.filter((x: any) => x.slid == currentList.id && x.assetId == currentList.assetId && x.rowno == currentList.rowno);
    if (x.length > 0) {
      if (x[0].notifyStatus == 'A' || x[0].notifyStatus == 'I') { val = false; } else { val = true; }
    } else { val = true; };
    return val;
  }

  checkEnFact(slid: number, assetId: number, rowno: number) {
    var that = this;
    var val: boolean = false;
    var all_list = that.sharedData.getNotificationQueue.value;
    var x = all_list.filter((x: any) => x.slid == slid && x.assetId == assetId && x.rowno == rowno);
    if (x.length > 0) {
      if (x[0].notifyStatus == 'A' || x[0].notifyStatus == 'I') { val = false; } else { val = true; }
    } else { val = true; };
    return val;
  }

  checkMyToolTip() { return 'Returns calculated from ' + this._returnAsOfDate; }

  checkStrModify() {
    var that = this;
    var no = that.currentSNo.value;
    var clist = that.strategyList.value.filter((x: any) => x.rowno == no);

    if (clist.length > 0) {

      var comp: boolean = false;
      //filter company data     
      [...that.companyExList.value].forEach(d => {
        if (that.remCompData.value.filter((x: any) => x == d.stockKey && d.status != 'E').length == 0) { comp = true; };
      });
      if (that.companyExList.value.length == 0 && that.remCompData.value.length > 0) { comp = true; }

      var sector: boolean = false;
      //filter sector data
      [...that.gicsExList.value].forEach(d => {
        if (that.remGicsData.value.filter((x: any) => x == d.industry).length == 0) { sector = true; };
      });
      [...that.remGicsData.value].forEach(x => {
        if (that.gicsExList.value.filter((d: any) => x == d.industry).length == 0) { sector = true; };
      });

      

      var factor: boolean = false;
      /*factor data*/
      this.initPostStrategyFactorsData.value.forEach((d: any) => {
        if (that.PostStrategyFactorsData.value.filter((x: any) => x.factorid == d.factorid).length == 0) { factor = true; }
      });
      this.PostStrategyFactorsData.value.forEach((d: any) => {
        if (that.initPostStrategyFactorsData.value.filter((x: any) => x.factorid == d.factorid).length == 0) { factor = true; }
      });
      if (!factor && this.initPostStrategyFactorsData.value.length == 0 && this.PostStrategyFactorsData.value.length > 0) { factor = true; }
      if (!factor && this.initPostStrategyFactorsData.value.length > 0 && this.PostStrategyFactorsData.value.length > 0) {
        this.PostStrategyFactorsData.value.forEach((d: any) => {
          var filFact = this.initPostStrategyFactorsData.value.filter((x: any) => x.factorid == d.factorid);
          if (filFact.length > 0) { if (filFact[0].startval != d.startval || filFact[0].endval != d.endval) { factor = true; } }
        });
      }

      var selWei: boolean = false;
      /*selection & Weight data*/
      if (clist.length > 0) {
        if (clist[0]['selectBy'] != this.custToolSelectByValue.value ||
          clist[0]['weightBy'] != this.custToolWeightByValue.value ||
          clist[0]['noofComp'] != this.custToolNoOfComp.value || clist[0]['weightLimit'] != this.bldMyIndselWeightLimit.value) {
          selWei = true;
        }
      }
      if ( comp || sector || factor || selWei) { return true; } else { return false; };
    } else { return false; }
  }

  checkcompTrans() {
    let type = 2;
    if (isNullOrUndefined(this._selCompany) || this._selCompany.SelISIN == "") { type = 2 }
    else if ($('#fil_STW_Price').css('display') != 'none') { type = 4 }
    else if ((this.sharedData._uname.indexOf('technogradient.com') > -1) || (this.sharedData._uname.indexOf('newagealpha.com') > -1)) {
      if ($('#fil_STW_Price').css('display') != 'none') { type = 3 }
      else { type = 2 }
    } else { type = 2 }
    return type;
  }

  openImpliedRevenue() {
    var selcomp: any = this.selCompany.value;
    if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['isin'])) {
      var newSel: any = [...this.sharedData._selResData].filter((x: any) => x.aisin == selcomp['isin']);
      if (newSel.length > 0) {
        try {
          var title = 'Index Implied Revenue';
          var options = {
            from: 'equityUniverse',
            error: 'Implied Revenue',
            destination: 'Implied Revenue Popup',
            selComp: newSel[0],
            CType: 'MC'
          }

          this.dialog.open(ImpliedRevenueComponent, {
            width: "80%", height: "90%", maxWidth: "100%", maxHeight: "90vh",panelClass: 'impliedRevenueDialog',
            data: { dialogTitle: title, dialogSource: options }
          })
        } catch (e) { console.log(e) }
      }
    }
  }

  resetService() {    
    this.bldMyIndAccountData.next([]);
    this.bldIndAccountData.next([]);
    this.equityIndexeMasData.next([]);
    this.stgyListDashAccsData.next(undefined);
    this.factorMasterData.next(undefined);
    this.customIndexBrcmData.next(undefined);
    this.diStrFactsheetAccData.next(undefined);
    this.getBetaIndex_custom.next(undefined);
    this.customizeSelectedIndex_custom.next(undefined);
    this.checkExistingStrategy.next(undefined);
    this.getBetaIndex_prebuilt.next([]);    
    this.currentSList.next(undefined);
    this.selCompany.next(undefined);
    this.customIndexData.next(undefined);
    this.taxharvestData_customIndex.next(undefined);
    this.selectedCIIndFactsheet.next(undefined);
    this.selectedDirIndStry.next(undefined);
    this.returnAsOfDate.next('');
    this.custToolSelectByValue.next(0);
    this.custToolWeightByValue.next(0);
    this.custToolNoOfComp.next(0);
    this.custToolWeightLimit.next(0);
    this.custToolCashTarget.next(0);
    this.custToolRebalanceType.next('');
    this.custToolTaxEffAwareness.next('');
    this.custToolWeightFlag.next('');
    this.custToolName.next('');
    this.custToolShortname.next('');
    this.custToolDescription.next('');
    this.CIEnabletradinglist.next([]);
    this.exclusionCompData.next([]);
    this.comFactorsData.next([]);
    this.PostStrategyFactorsData.next([]);
    this.initPostStrategyFactorsData.next([]);
    this.indexStepsGridData.next([]);
    this.remCompData.next([]);
    this.companyExList.next([]);
    this.remGicsData.next([]);
    this.gicsExList.next([]);
    this.strategyList.next([]);
    this.custSelectFactor.next(undefined);    
    this.performanceUIndexList.next([]);
    this.performanceETFRList.next([]);
    this.performanceTenYrETFRList.next([]);
    this.custSelectFactorData.next([]);
    this.cusIndTempStrategyData.next([]);
    this.reviewIndexClickedData.next([]);
    this.indexStepsTaxData.next([]);
    this.accountService.resetService();
    this.tempCustAssetId = undefined;
    this.GPerETFRList1 = undefined;
    this.GPerETFRList = undefined;
    this.temp = undefined;
    this.ETFStrategyPlainIndexApi = undefined;
  }
}

export class checkpostFilAPI {
  'compFilter': boolean;
  'gicsFilter': boolean;
  'selection_Weighting': boolean;
  'postNotify': boolean;
  'accountSelect': boolean;
  'factor': boolean;
}

export class PostGicsObj {
  "id": number;
  "slid": number;
  "userid": number;
  "industry": number;
  //"createddate": Date;
  //"modifieddate": Date;
  "status": string;
  "name": string;
  "category": string;
}

export class PostStgyAccDt {
  "id": number;
  "accountId": number;
  "userid": number;
  "slid": number;
  "status": string;
  "cashTarget": number;
  "taxType": string;
  "taxTarget": number;
  "taxBufferGainTarget": number;
  "marketvalue": number;
  "shortterm": number;
  "longterm": number;
  "transitionDate": any;
  "transitionGainTgt": any;
}

export class PostCompObj {
  "id": number;
  "slid": number;
  "userid": number;
  "stockKey": number;
  //"createddate": Date;
  //"modifieddate": Date;
  "status": string;
  "name": string;
  "score": number;
  "marketvalue": number;
  "indexweight": number;
  'ticker': string;
}

export class factorRangeObject {
  "factorid": number;
  "slid": number;
  "userid": number;
  "assetid": number;
  "startval": number;
  "endval": number;
  "perorval": number;
  "status": string;
  "name": string;
  "displayname": string;
  "orgTopValue": number;
  "orgBottomValue": number;
  "orgTopPct": number;
  "orgBottomPct": number;
}

export class rangeTriger {
  type: string='';
  flag: boolean = false;
}

export class factorCircleFlag {
  'accruals': boolean;
  'assetGrowth': boolean;
  'beta6': boolean;
  'beta12': boolean;
  'bookToMarket': boolean;
  'dividendYield': boolean;
  'ePSGrowthQuarterly': boolean;
  'fCFYield': boolean;
  'grossMargin': boolean;
  'interestCoverage': boolean;
  'leverageRatioBook': boolean;
  'momentum6': boolean;
  'momentum12': boolean;
  'PriceToEarnings': boolean;
  'rOE': boolean;
  'salesGrowth': boolean;
  'salesYield': boolean;
  'volatility6': boolean;
  'volatility12': boolean;
  'marketCapFreeFloat': boolean;
  'erfScore': boolean;
}
