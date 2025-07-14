import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first } from 'rxjs';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../sharedData/shared-data.service';
import { Workbook } from 'exceljs';
// @ts-ignore
import { saveAs } from "file-saver";
// @ts-ignore
import * as d3 from 'd3';
import { DataService } from '../data/data.service';
import { LoggerService } from '../logger/logger.service';
import { CustomIndexService, PostStgyAccDt } from './custom-index.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from '../../../view/direct-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { DatePipe, formatDate } from '@angular/common';
import { Router, RoutesRecognized } from '@angular/router';
// @ts-ignore
import * as FileSaver from 'file-saver';
import { HttpResponse } from '@angular/common/http';
import { ImpliedRevenueComponent } from '../../../view/universeDialogsModule/implied-revenue/implied-revenue.component';
@Injectable({
  providedIn: 'root'
})
export class DirectIndexService {

  checkSortTitle(d: any) {
    if (isNullOrUndefined(d)) { if (this._directIndexBrcmData.length > 1) { return 'Index' } else { return d } }
    else if (d.toLowerCase() == 'beta' || this.directIndexBrcmData.value.length ==0) { return 'Type' }
    else if (d.toLowerCase() == 'cat') { return 'Category' }    
    else { return d }
  }

  stgyDefalutData = { cashTarget: 2, rebalanceType: 'q' };

  directIndexBrcmData: BehaviorSubject<any>;
  _directIndexBrcmData: any = [];

  enableTrading_factsheet: BehaviorSubject<string>;
  _enableTrading_factsheet: string = "N";

  diStrFactsheetAccData: BehaviorSubject<any>;
  _diStrFactsheetAccData: any = [];

  getBetaIndex_Direct: BehaviorSubject<any>;
  _getBetaIndex_Direct: any = [];

  startIndexClick_direct: BehaviorSubject<boolean>;
  _startIndexClick_direct: boolean = false;

  showReviewIndexLoaded: BehaviorSubject<boolean>;
  _showReviewIndexLoaded: boolean = false;

  showBackButton_bcrumb: BehaviorSubject<boolean>;
  _showBackButton_bcrumb: boolean = false;
  
  showRightSideGrid_direct: BehaviorSubject<boolean>;
  _showRightSideGrid_direct: boolean = false;

  customizeSelectedIndex_Direct: BehaviorSubject<any>;
  _customizeSelectedIndex_Direct: any;

  errorList_Direct: BehaviorSubject<any>;
  _errorList_Direct: any;

  currentSList: BehaviorSubject<any>;
  _currentSList: any;

  selCompany: BehaviorSubject<any>;
  _selCompany: any;

  directIndexData: BehaviorSubject<any>;
  _directIndexData: any = [];

  taxharvestData_DirectIndex: BehaviorSubject<any>;
  _taxharvestData_DirectIndex: any = [];

  selectedDirIndFactsheet: BehaviorSubject<any>;
  _selectedDirIndFactsheet: any;

  selectedDirIndStry: BehaviorSubject<any>;
  _selectedDirIndStry: any=[];

  stgyListDashAccsData: BehaviorSubject<any>;
  _stgyListDashAccsData: any = [];

  notifyDiClick: BehaviorSubject<boolean>;
  _notifyDiClick: boolean = false;

  reviewIndexClickedData: BehaviorSubject<any>;
  _reviewIndexClickedData: any = [];

  returnAsOfDate: BehaviorSubject<string>;
  _returnAsOfDate: string = '';
  
  PrebuiltMainTab = [{ name: 'Equities', group: 'Beta' }, { name: 'Fixed Income', group: 'Fixed' }];

  DIEnabletradinglist: BehaviorSubject<any>;
  _DIEnabletradinglist: any = [];

  exclusionCompData: BehaviorSubject<any>
  _exclusionCompData: any = [];

  constructor(private datepipe: DatePipe, private router: Router, public sharedData: SharedDataService, public dataService: DataService, public dialog: MatDialog,
    public cusIndexService: CustomIndexService, private toastr: ToastrService) {

    try {
      this.router['events'].pipe(filter((event: any) => event instanceof RoutesRecognized))
        .subscribe((event: any) => {
          if (isNotNullOrUndefined(event) && isNotNullOrUndefined(event['url']) && event['url'] === '/logout') { this.resetService(); }
        });
    } catch (e) { }

    this.directIndexBrcmData = new BehaviorSubject<any>(this._directIndexBrcmData);
    this.directIndexBrcmData.subscribe(data => { this._directIndexBrcmData = data; });

    this.enableTrading_factsheet = new BehaviorSubject<string>(this._enableTrading_factsheet);
    this.enableTrading_factsheet.subscribe(data => { this._enableTrading_factsheet = data; });

    this.DIEnabletradinglist = new BehaviorSubject<any>(this._DIEnabletradinglist);
    this.DIEnabletradinglist.subscribe(data => { this._DIEnabletradinglist = data; });

    this.diStrFactsheetAccData = new BehaviorSubject<any>(this._diStrFactsheetAccData);
    this.diStrFactsheetAccData.subscribe(data => { this._diStrFactsheetAccData = data; });

    this.stgyListDashAccsData = new BehaviorSubject<any>(this._stgyListDashAccsData);
    this.stgyListDashAccsData.subscribe(data => { this._stgyListDashAccsData = data; });

    this.reviewIndexClickedData = new BehaviorSubject<any>(this._reviewIndexClickedData);
    this.reviewIndexClickedData.subscribe(data => { this._reviewIndexClickedData = data; });

    this.getBetaIndex_Direct = new BehaviorSubject<any>(this._getBetaIndex_Direct);
    this.getBetaIndex_Direct.subscribe(data => { this._getBetaIndex_Direct = data; });

    this.directIndexData = new BehaviorSubject<any>(this._directIndexData);
    this.directIndexData.subscribe(data => { this._directIndexData = data; });

    this.taxharvestData_DirectIndex = new BehaviorSubject<any>(this._taxharvestData_DirectIndex);
    this.taxharvestData_DirectIndex.subscribe(data => { this._taxharvestData_DirectIndex = data; });

    this.startIndexClick_direct = new BehaviorSubject<boolean>(this._startIndexClick_direct);
    this.startIndexClick_direct.subscribe(data => { this._startIndexClick_direct = data; });

    this.showReviewIndexLoaded = new BehaviorSubject<boolean>(this._showReviewIndexLoaded);
    this.showReviewIndexLoaded.subscribe(data => { this._showReviewIndexLoaded = data; });

    this.showBackButton_bcrumb = new BehaviorSubject<boolean>(this._showBackButton_bcrumb);
    this.showBackButton_bcrumb.subscribe(data => { this._showBackButton_bcrumb = data; });

    this.customizeSelectedIndex_Direct = new BehaviorSubject<any>(this._customizeSelectedIndex_Direct);
    this.customizeSelectedIndex_Direct.subscribe(data => { this._customizeSelectedIndex_Direct = data; });

    this.errorList_Direct = new BehaviorSubject<any>(this._errorList_Direct);
    this.errorList_Direct.subscribe(data => { this._errorList_Direct = data; });

    this.currentSList = new BehaviorSubject<any>(this._currentSList);
    this.currentSList.subscribe(data => { this._currentSList = data; });

    this.selCompany = new BehaviorSubject<any>(this._selCompany);
    this.selCompany.subscribe(data => { this._selCompany = data; });

    this.selectedDirIndFactsheet = new BehaviorSubject<any>(this._selectedDirIndFactsheet);
    this.selectedDirIndFactsheet.subscribe(data => { this._selectedDirIndFactsheet = data; });

    this.selectedDirIndStry = new BehaviorSubject<any>(this._selectedDirIndStry);
    this.selectedDirIndStry.subscribe(data => { this._selectedDirIndStry = data; });
    
    this.showRightSideGrid_direct = new BehaviorSubject<boolean>(this._showRightSideGrid_direct);
    this.showRightSideGrid_direct.subscribe(data => { this._showRightSideGrid_direct = data; });

    this.notifyDiClick = new BehaviorSubject<boolean>(this._notifyDiClick);
    this.notifyDiClick.subscribe(data => { this._notifyDiClick = data; });

    this.returnAsOfDate = new BehaviorSubject<string>(this._returnAsOfDate);
    this.returnAsOfDate.subscribe(data => { this._returnAsOfDate = data; });

    this.exclusionCompData = new BehaviorSubject<any>(this._exclusionCompData);
    this.exclusionCompData.subscribe(data => { this._exclusionCompData = data; });

  }
  getAlphaIndex() {
    var that = this;
    if (isNullOrUndefined(that._getBetaIndex_Direct) || that._getBetaIndex_Direct.length == 0) {
      that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
            if (data1[0] != "Failed") {
              var dtabeta: any;
              dtabeta = data1;
              dtabeta.forEach((x: any) => {
                x.srName = x.name;
                x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon']:'';
                return x
              });
              that.getBetaIndex_Direct.next(dtabeta.map((a: any) => ({ ...a })));
            }
          }, error => { that.getBetaIndex_Direct.next([]); });
    }
  }

  checkViewpage() {
    var that = this;
    if (isNullOrUndefined(that._getBetaIndex_Direct) || that._getBetaIndex_Direct.length == 0) {
      that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
        if (isNullOrUndefined(data1) || data1.length == 0) { this.router.navigate(["/home"]); }
      });
    }
  }
  
  getDirectlvlData(level: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var group = level.group;
      if (isNotNullOrUndefined(level['pbGroupType'])) { group = level['pbGroupType'] }
      switch (group) {
        case ("Fixed"): {
          //var dtas = [...[this.cusIndexService.myIndMain[2]]];
          resolve({ 'menuData': [], 'CompanyList': [] });
          //resolve({ 'menuData': [...dtas], 'CompanyList': [] });
          break;
        }
        case ('Index'): {
          that.getBuildMyIndMnthlyHPortfolioDirect(level).then((resDt: any) => {
            that.directIndexData.next(resDt)
            resolve({ 'menuData': [], 'CompanyList': resDt });
          });
          break;
        } case ("ETFName"): {
          that.getBuildMyIndMnthlyHPortfolioDirect(level).then((resDt: any) => {
            that.directIndexData.next(resDt)
            resolve({ 'menuData': [], 'CompanyList': resDt });
          });
          break;
        }
        case ("Beta"): {
          var matchData: any = [];
          var checkPermission = that.getWithoutDup_Array(that._getBetaIndex_Direct, 'pbName');
          matchData = checkPermission.map((item: any) => ({ assetId: item.assetId, pbName: item.pbName, basedon: item.basedon, group: 'Cat', name: item.pbName }));
          matchData = matchData.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.name), parseFloat(y.name)); });
          resolve({ 'menuData': [...matchData], 'CompanyList': [] });
          break;
        }
        case ("Cat"): {
          var data = [...that._getBetaIndex_Direct];
          var matchData: any = [...data].filter((x: any) => x.pbName == level.pbName);
          matchData = matchData.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.name), parseFloat(y.name)); });
          resolve({ 'menuData': [...matchData], 'CompanyList': [] });
          break;
        }
        default: {
          var ddta: any = [];
          if (this.sharedData.checkMenuPer(12, 169) == "Y") { ddta.push(this.PrebuiltMainTab[0]); }
          if (this.sharedData.checkMenuPer(12, 174) == "Y") { ddta.push(this.PrebuiltMainTab[1]); }
          resolve({ 'menuData': [...ddta], 'CompanyList': [] });
          break;
        }
      }
    });
  }
  getWithoutDup_Array(arr: any, filterValue: any) {
    var opt: any = [];
    var indexArr: any = [];
    arr.map((item: any) => {
      let key = indexArr.indexOf(item[filterValue]);
      if (key == -1) {
        indexArr.push(item[filterValue]);
        opt.push(item);
      } else if (opt[key].seq < item.seq) {
        opt[key] = item;
      }
    })
    return opt;
  }
  directBrcmClick(i: any) {
    this.startIndexClick_direct.pipe(first()).subscribe(val => {
      if (val) {
        //this.cusIndexService.customizeSelectedIndex.next(undefined);
        //this.customizeSelectedIndex_prebuilt.next(undefined);

        //this.startIndexClick_direct.next(false);
        //this.sharedData.showRightSideGrid.next(false);
      }
    });
    if (this._directIndexBrcmData.length > 0 && i > -1) {
      var brData = [...this._directIndexBrcmData].map(a => ({ ...a }));
      let data = brData.splice(0, i + 1);
      this.directIndexBrcmData.next(data);
    } else { this.directIndexBrcmData.next([]); }
  }

  GetStrListDashAccs() {
    var that = this;
    this.dataService.GetStgyListDashboardAccs().pipe(first()).subscribe((
      data: any[]) => { this.stgyListDashAccsData.next(data) }, (error:any) => { this.stgyListDashAccsData.next([]) });
  }

  getStrategyData_rebuilt(stNo: any, mode: any, frm: any = null) {
    var that = this;

    //this.initStrData = { 'GetCompanyExList': false, 'GetGicsExList': false, 'GetEsgCatList': false, 'GetEsgRatingList': false, 'GetExSummaryList': false, 'GetFactorsData': false, 'GetAccountData': false };
    //if (frm != 'load') {
    //  if (this.remHFScoreEnable.value) this.remHFScoreEnable.next(false); this._remHFScoreEnable = false;
    //  if (this.esgRangeExcluEnable.value) this.esgRangeExcluEnable.next(false); this._esgRangeExcluEnable = false;
    //}
    //that.currentSNo.next(stNo);
    this.customizeSelectedIndex_Direct.pipe(first()).subscribe((basedata: any) => {
      var assetId = 0;
      if (basedata.group == "Index") {
        if (basedata.indexType == 'Equity Universe') { assetId = basedata.assetId; }
        else {
          if (isNotNullOrUndefined(basedata.assetId)) { assetId = basedata.assetId; }
          else { assetId = basedata.id; }
        }
      } else { assetId = basedata.assetId; }
      //var sData = this.currentSList.value;
      //if (isNotNullOrUndefined(sData)) {
      //  //that.currentSList.next(sData);
      //  //that.bldMyIndSelByVal.next(sData.selectBy);
      //  //that.bldMyIndselNoCompVal.next(sData.noofComp);
      //  //that.bldMyIndCashTarget.next(sData.cashTarget);
      //  //that.bldMyIndRebalanceType.next(sData.rebalanceType);
      //  //that.bldMyIndweightByVal.next(sData.weightBy);
      //  //var etList = [...that.DIEnabletradinglist.value].filter(u => u.id == sData.id);
      //  //if (etList.length > 0) { that.enableTrading_factsheet.next(etList[0].enableTrading); }
      //  //else { that.enableTrading_factsheet.next("N"); }
      //  //var taxVal = sData.taxEffAwareness == "N" ? 2 : sData.taxEffAwareness == "Y" ? 1 : 2
      //  //if (taxVal == null || taxVal == undefined) { taxVal = 2 }
      //  //that.bldMyIndTaxEffVal.next(taxVal);

      //  // that.getPerStatData_prebuilt();
      //}
    }, error => {
      //that.toastr.info('Try Again', '', { timeOut: 4000, positionClass: "toast-top-center" });
      //this.sharedData.showReviewIndexLoaded.next(false);
      //this.showReviewIndex.next(false);
      //this.sharedData.breadCrumbClk('');
      //this.dirIndexService.startIndexClick_pre.next(false);
      //this.sharedData.showRightSideGrid.next(false);
    });

  }

  getPerStatData_prebuilt() {
    var that = this;
    return new Promise((resolve, reject) => {
      this.customizeSelectedIndex_Direct.pipe(first()).subscribe((selIndex: any) => {
        var d = new Date();
        if (isNotNullOrUndefined(selIndex['allocDate'])) { d = new Date(selIndex['allocDate']); }
        var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
        var indexId = selIndex['indexId'];
        if (isNullOrUndefined(indexId)) { indexId = 123; }
        var data = {
          "assetid": selIndex['assetId'],
          "userid": -1,
          "strategyId": selIndex['id'],
          "enddate": date,
          "tenYrFlag": 1,
          "indexId": indexId,
          "freqflag": selIndex['rebalanceType']
        };

        //var dataper = {
        //  'strSector': [],
        //  'strStockkey': [],
        //  'assetid': selIndex['assetId'],
        //  'indexId': indexId,
        //  'range': 100,
        //  "strExStockkey": [],
        //  'tenYrFlag': 1,
        //  'enddate': date,
        //  "rating": '',
        //  "category": [],
        //  "taxflag": selIndex['taxEffAwareness']
        //};

        that.GetTaxharvestData_DirectIndex(data).then((GetPerformanceUIndexList: any) => { resolve(GetPerformanceUIndexList); });
      });
    });
  }
  openDirectErrorComp(title_D:string, from_D:string, error_D:string, destination_D:string  ) {
    var title = title_D;
    this.sharedData.showErrorDialogBox.next(true);
    var options = { from: from_D, error: error_D, destination: destination_D };
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
  }

  GetPerformanceETFRListSub: any;
  GetPerformanceETFRList_DirectIndex(data: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      try { that.GetPerformanceETFRListSub.unsubscribe(); } catch (e) { }
      that.GetPerformanceETFRListSub = that.dataService.GetPerformanceETFRList(data).pipe(first()).subscribe((res:any) => {
        if (that.sharedData.checkServiceError(res)) { resolve([]); }
        else { resolve(res); };
      }, (error: any) => { resolve([]); });
    });
  }
  GetTaxharvestDataDirectSub: any;
  GetTaxharvestData_DirectIndex(data: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      try { this.GetTaxharvestDataDirectSub.unsubscribe(); } catch (e) { }
      that.GetTaxharvestDataDirectSub=that.dataService.GetTaxharvestDataDirect(data).pipe(first()).subscribe(res => {
        that.taxharvestData_DirectIndex.next(res);
        ////console.log('taxharvestData_DirectIndex');
        
        if (that.sharedData.checkServiceError(res)) {
          resolve([]);
          /** Check error dialog already open **/
          if (!that.sharedData._showErrorDialogBox){
            that.openDirectErrorComp('Error', 'performance', 'performanceError', 'moveToHome');
          }
          
        }
        else { resolve(res); };
      }, (error: any) => {
        that.taxharvestData_DirectIndex.next([]); resolve([]);
        if (!that.sharedData._showErrorDialogBox) {
          that.openDirectErrorComp('Error', 'performance', 'performanceError', 'moveToHome');
        }
      });
    });
  }

  perfDatanotAvailablepre() {
    //this.cusIndexService.buildIndxEnable.next(true);
    //this.prebuiltBrcmData.next([]);
    //this.prebuiltBrcmClick(0)
    //this.sharedData.showCenterLoader.next(false);
    //this.startIndexClick_pre.next(false);
    //this.sharedData.showRightSideGrid.next(false);
    //$('#myCustomIndErrorModal').modal('show');
  }
  checkGetVal(temp: any, newData: any) { if (JSON.stringify(temp) == JSON.stringify(newData)) { return false } else { return true }; };
  //GetPerformanceETFRList_prebuilt() {
  //  var that = this;
  //  return new Promise((resolve, reject) => {
  //    var d = new Date();
  //    var assetid: any;
  //    var indexId = 123;
  //    if (that.cusIndexService._customizeSelectedIndex.group == "Index") {
  //      indexId = this.sharedData.getIndexId(that.cusIndexService._customizeSelectedIndex);
  //      d = new Date(this.sharedData.equityHoldDate);
  //      if (that.cusIndexService._customizeSelectedIndex.indexType == "New Age Alpha Indexes") {
  //        assetid = that.cusIndexService._customizeSelectedIndex.id;
  //      } else {
  //        //var index = this.myIndEqindex.filter(x => x.name.toLowerCase() == that._customizeSelectedIndex.usingName.toLowerCase() || x.name.toLowerCase() == that._customizeSelectedIndex.country.toLowerCase());
  //        if (that.cusIndexService._customizeSelectedIndex.indexType == 'Equity Universe') { assetid = that.cusIndexService._customizeSelectedIndex.assetId; }
  //        else {
  //          if (isNotNullOrUndefined(that.cusIndexService._customizeSelectedIndex.assetId)) { assetid = that.cusIndexService._customizeSelectedIndex.assetId; }
  //          else { assetid = that.cusIndexService._customizeSelectedIndex.id; }
  //        }
  //      }
  //    } else {
  //      assetid = that.cusIndexService._customizeSelectedIndex.assetId;
  //      var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetid)[0]['holdingsdate'];
  //      d = new Date(etfHoldDate);
  //    }
  //    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
  //    var data = {
  //      'strSector': [],
  //      'strStockkey': [],
  //      'assetid': assetid,
  //      'indexId': indexId,
  //      'range': 100,
  //      "strExStockkey": that.cusIndexService.AddCompData.value,
  //      'tenYrFlag': 1,
  //      'enddate': date,
  //      "rating": '',
  //      "category": [],
  //      "taxflag": that.cusIndexService.applyTax.value
  //    };
  //    if (that.tempCustAssetId1 != JSON.stringify(assetid)) {
  //      that.tempCustAssetId1 = JSON.stringify(assetid);
  //      try { this.GPerETFRList2.unsubscribe(); } catch (e) { }
  //      this.GPerETFRList2 = this.dataService.GetPerformanceETFRList(data).subscribe(GetPerformanceETFRList => {
  //        if (this.sharedData.checkServiceError(GetPerformanceETFRList)) {
  //          that.tempCustAssetId1 = "";
  //          that.cusIndexService.perfDatanotAvailable();
  //          //that.toastr.success('Performance data not available', '', { timeOut: 4000, positionClass: "toast-top-center" });
  //          this.logger.logError(GetPerformanceETFRList, 'GetPerformanceETFRList');
  //          this.cusIndexService.performanceETFRList.next([]);
  //          resolve([]);
  //        } else {
  //          this.cusIndexService.performanceETFRList.next(GetPerformanceETFRList);
  //          resolve(GetPerformanceETFRList);
  //        }

  //      },
  //        error => {
  //          that.tempCustAssetId1 = "";
  //          that.cusIndexService.perfDatanotAvailable();
  //          //that.toastr.success('Performance data not available', '', { timeOut: 4000, positionClass: "toast-top-center" });
  //          this.logger.logError(error, 'GetPerformanceETFRList');
  //          this.cusIndexService.performanceETFRList.next([]);
  //          resolve([]);
  //        });
  //    }

  //  });

  //}
  GetEquityScoresSub: any;
  getDirectIndexData(selIndex:any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var indexid: number = 0;
      if (isNotNullOrUndefined(selIndex['assetId'])) {
        var ind = this.cusIndexService.equityIndexeMasData.value.filter((x: any) => selIndex['assetId'] == x['assetId']);
        if (ind.length > 0) { indexid = ind[0]['cusIndexId'] }
      }
      var d = new Date(that.sharedData.equityHoldDate);
      var GetAllocDate = d.getFullYear().toString() + that.sharedData.formatedates(d.getMonth() + 1).toString() + that.sharedData.formatedates(d.getDate()).toString();
      try { this.GetEquityScoresSub.unsubscribe(); } catch (e) { }
      this.GetEquityScoresSub=this.dataService.GetEquityScores(indexid, GetAllocDate).pipe(first()).subscribe((res: any) => {
          if (that.sharedData.checkServiceError(res)) {
            //that.logger.logError(res, 'GetEquityScores');
            resolve([]);
          } else { resolve(res); }
        }, (error:any) => {
          //that.logger.logError(error, 'GetEquityScores');
          resolve([])
        });
    });
  }
  GetBuildMyIndexMnthlyHPortfolioDirectSub: any;
  getBuildMyIndMnthlyHPortfolioDirect(selIndex: any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      if (isNotNullOrUndefined(selIndex) && isNotNullOrUndefined(selIndex['assetId'])) {
        var d = new Date();
        if (isNotNullOrUndefined(selIndex['allocDate'])) { d = new Date(selIndex['allocDate']); }
        var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
        var indexId = selIndex['indexId'];
        if (isNullOrUndefined(indexId)) { indexId = 123; }
        var data = {
          "assetid": selIndex['assetId'],
          "userid": -1,
          "strategyId": selIndex['id'],
          "enddate": date,
          "tenYrFlag": selIndex['tenYrFlag'],
          "indexId": indexId,
          "freqflag": selIndex['rebalanceType']
        };
        try { this.GetBuildMyIndexMnthlyHPortfolioDirectSub.unsubscribe(); } catch (e) { }
        this.GetBuildMyIndexMnthlyHPortfolioDirectSub=this.dataService.GetBuildMyIndexMnthlyHPortfolioDirect(data).pipe(first()).subscribe((res: any) => {
          if (this.sharedData.checkServiceError(res) || res.length == 0) {
            resolve([]);
            if (!that.sharedData._showErrorDialogBox) {
              that.openDirectErrorComp('Error', 'performance', 'performanceError', 'moveToHome');
            }
          }
          else { resolve([...res]); }
        }, (error: any) => {
          resolve([]);
          if (!that.sharedData._showErrorDialogBox) {
            that.openDirectErrorComp('Error', 'performance', 'performanceError', 'moveToHome');
          }
        });
      } else { resolve([]); }
    });
  }

  dirIndSearch(d: any) {
    var that = this;
    if (isNotNullOrUndefined(d['pbGroupType'])) { d.group = d['pbGroupType']; }
    var selectedPath = [];
    selectedPath.push([...that.PrebuiltMainTab][0]);
    var checkPermission = that.getWithoutDup_Array(that.getBetaIndex_Direct.value, 'pbName');
    checkPermission.map((item: any) => {
      if (isNotNullOrUndefined(d['pbName']) && item.pbName == d['pbName']) {
        selectedPath.push({ assetId: d.assetId, pbName: item.pbName, basedon: item.basedon, group: 'Cat', name: item.pbName });
      }
    });
    selectedPath.push(d);
    that.directIndexBrcmData.next(selectedPath);
    that.customizeSelectedIndex_Direct.next(d);
    that.showBackButton_bcrumb.next(true);
  }
  GetFactSheetGConditionsSub: any;
  checkFactsheetInit(data: any) {
    return new Promise<any>((resolve, reject) => {     
      this.GetFactSheetGConditionsSub=this.dataService.GetFactSheetGConditions(data).pipe(first()).subscribe((data:any) => {
        if (this.sharedData.checkServiceError(data)) { resolve({ data: [], status: false }) } else { resolve({ data: data, status: true }) }
      }, (error:any) => { resolve({ data: [], status: false }) });
    });
  }

  GetlockPauseAccsSub: any;
  checkReloadpostNotification(accData:any) {
    var that = this;
    this.sharedData.showMatLoader.next(true);
    var lockInfo:any = [];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data:any = [];
    accData.forEach((d: any) => {
      var obj = { "accid": d['accountId'], "userid": userid };
      data.push(obj);
    });
    try { that.GetlockPauseAccsSub.unsubscribe(); } catch (e) { }
    this.GetlockPauseAccsSub=this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
      this.sharedData.showMatLoader.next(false);
      lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
    });
  }

  saveEnableTradingDI(sno: any, accId: number): any {
    var that = this;
    try {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let datas = { "userid": parseInt(userid), "slid": sno, "enableTrading": that._enableTrading_factsheet, "accountId": accId };
      var statdata = [];
      statdata.push(datas);
      that.dataService.PostEnableTrading(datas).pipe(first()).subscribe((data:any) => {
            if (data[0] != "Failed") {
              if (that._enableTrading_factsheet == "Y") { that.toastr.success(that.sharedData.checkMyAppMessage(0, 17), '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" }); }
              else { that.toastr.success(that.sharedData.checkMyAppMessage(0, 18), '', { timeOut: 4000, positionClass: "toast-top-center" }); }              
              that.getDIEnabletradinglist(accId);
            }
      }, (error:any)=> {
            //this.logger.logError(error, 'PostTrading');
            that.toastr.info('Try Again', '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
          });
    } catch (e) {
      //this.logger.logError(e, 'catch error'); console.log(e)
    }
  }
  GetDIEnabletradinglistSub: any;
  getDIEnabletradinglist(accId: number) {
    try { this.GetDIEnabletradinglistSub.unsubscribe(); } catch (e) { }
    this.GetDIEnabletradinglistSub=this.dataService.GetDIEnabletradinglist(accId).pipe(first()).subscribe(data => {
      if (this.sharedData.checkServiceError(data)) { this.DIEnabletradinglist.next([]); } else { this.DIEnabletradinglist.next(data); }
    }, error => { this.DIEnabletradinglist.next([]); });
  }

  eventTrack(from: any, data: any) {
    var stxt: any = "";
    if (isNotNullOrUndefined(data['name'])) { stxt = data['name']; }
    this.sharedData.userEventTrack('Direct Indexing', stxt, stxt, from);
  }

  tradeDownload1(filesName: any, resData: any, type: any) {
    var that = this;
    var daTe: any = (resData.length > 0 && isNotNullOrUndefined(resData[0]['hdate'])) ? new Date(resData[0]['hdate']) : new Date();
    var indate = formatDate(daTe, 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var rpdate = formatDate(new Date(), 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.compname, item.ticker, item.stockKey, item.isin, that.sharedData.formatWt_percentage(item.weight*100)]); });
    ws.addRow([filesName]).font = { bold: true };
    ws.addRow(['As of', indate]).font = { bold: true };
    ws.addRow(['Report Date', rpdate]).font = { bold: true };
    ws.addRow([]);
    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey', 'ISIN', 'Weight'])
    header.font = { bold: true };
    //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (this.sharedData.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      this.sharedData.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && this.sharedData.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosure II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      this.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.dirIndSearch(value); }
    }
  }
  GetStrategyAccountSub: any;
  updateFactsheet() {
    var that = this;
    var d = this._currentSList;
    var data = [...this.sharedData.getNotificationQueue.value].map(a => ({ ...a }));
    var filData = data.filter(xu => xu.dIRefId == d.id && xu.assetId == d.assetId && xu.accountId == this._selectedDirIndFactsheet);
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (filData.length > 0) {
      var accountData: any = [];
      try { that.GetStrategyAccountSub.unsubscribe(); } catch (e) { }
      that.GetStrategyAccountSub=that.dataService.GetStrategyAccount(filData[0].slid).pipe(first()).subscribe((accList: any) => {
        var x = accList.filter((du: any) => parseInt(filData[0].accountId) == parseInt(du.accountId));
        if (x.length > 0) {
          var CTtype = 'G';
          if (d['taxType'] == 'G' || d['taxType'] == "L") { CTtype = d['taxType'] }
          var accData: PostStgyAccDt = {
            "id": x[0]['id'],
            "accountId": parseInt(x[0].accountId),
            "userid": parseInt(userid),
            "slid": filData[0].slid,
            "status": "A",
            "cashTarget": x[0]['cashTarget'],
            "taxType": CTtype,
            "taxTarget": x[0]['taxTarget'],
            "taxBufferGainTarget": x[0]['taxBufferGainTarget'],
            "marketvalue": x[0]['marketValue'],
            "shortterm": x[0]['shortterm'],
            "longterm": x[0]['longterm'],
            "transitionDate": formatDate(x[0]['transitionDate'], 'yyyy/MM/dd', 'en-US'),
            "transitionGainTgt": x[0]['transitionGainTgt'],
          }
          accountData.push(accData);
          that.dataService.PostStrategyAccount(accountData).pipe(first()).subscribe(data => {
            if (data[0] != "Failed") {
              this.cusIndexService.updateBtnTrigger.next(true);
              var ds = new Date(this.sharedData.equityHoldDate);
              var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == filData[0].assetId);
              if (etfInd.length > 0) { d = new Date(etfInd[0]['holdingsdate']); }
              var date = ds.getFullYear() + '-' + this.sharedData.formatedates(ds.getMonth() + 1) + '-' + this.sharedData.formatedates(ds.getDate());
              var postData: any = [];
              postData.push({
                "accountId": filData[0]['accountId'],
                "slid": filData[0].slid,
                "userid": parseInt(userid),
                "status": "A",
                "enddate": date,
                "freqflag": filData[0]['freqflag'],
                "tenYrFlag": 1,
                "erfflag": filData[0]['erfFlag']
              });
              if (postData.length > 0) {
                that.dataService.PostStrategyNotificationQueue(postData).pipe(first()).subscribe(data => {
                    if (data[0] != "Failed") {
                      if (data[0].toLowerCase().indexOf('locked') > -1) { that.cusIndexService.checkReloadpostNotification(); }
                      else {
                        this.sharedData.showMatLoader.next(false);
                        that.toastr.success('Added to queue successfully', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
                        that.sharedData.getNotificationDataReload();
                      }
                    }
                  }, error => {  this.sharedData.showMatLoader.next(false); });
              }
            }
          }, error => { this.sharedData.showMatLoader.next(false);});
        }
      });
    }
  }

  checkUpdateBtnEnable(d: any, asofDate:any) {
    var dDate: any;
    var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
    if (etfInd.length > 0) {
      dDate = formatDate(etfInd[0]['holdingsdate'], 'yyyy/MM/dd', 'en-US');
    } else {
      dDate = formatDate(this.sharedData.GetSchedularMaster.value[0]['LipperHoldingDt'], 'yyyy/MM/dd', 'en-US');
    }
    if (isNotNullOrUndefined(asofDate) && asofDate !='' && isNotNullOrUndefined(this._selectedDirIndFactsheet) && this._selectedDirIndFactsheet > 0) {
      var fdDate = formatDate(asofDate, 'yyyy/MM/dd', 'en-US');
      if (new Date(dDate).getTime() == new Date(fdDate).getTime()) { return false; } else { return true; }
    } else { return false; }
  }

  checkPostStrategyData() {
    var that = this;
    var clist = that.customizeSelectedIndex_Direct.value;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return new Promise<any>((resolve, reject) => {
      if (isNotNullOrUndefined(clist)) {
        that.dataService.GetStrategyAssetList(clist.assetId, clist.mode).pipe(first()).subscribe((slist: any) => {
          if (isNotNullOrUndefined(slist) && slist.length > 0) { resolve([...slist]); } else {
            var Obj = Object.assign({}, clist);
            Obj['id'] = (that._selectedDirIndStry.length > 0) ? that._selectedDirIndStry[0]['id'] : 0;
            Obj['dIRefId'] = clist['id'];
            Obj['userid'] = userid;
            Obj['name'] = Obj['name'].replaceAll('-', ' ');
            Obj['shortname'] = Obj['shortname'].replaceAll('_', ' ');
            Obj['basedOn'] = '';
            Obj['basedon'] = '';
            Obj['tenYrFlag'] = 1;
            Obj['freqflag'] = that.sharedData.defaultRebalanceType;
            Obj['erfflag'] = that.checkErfflag(clist);
            Obj['description'] = '';
            Obj['indextotalcount'] = 0;
            Obj['removedcount'] = 0;
            var statdata = [];
            statdata.push(Obj);
            that.dataService.PostStrategyData(statdata).pipe(first())
              .subscribe((data: any) => {
                if (data[0] != "Failed") {
                  that.dataService.GetStrategyAssetList(clist.assetId, clist.mode).pipe(first())
                    .subscribe((slist1: any) => { resolve([...slist1]); });
                }
              });
          }
        });
      } else { reject(undefined) }
    });
  }

  checkErfflag(data: any) { if (data['selectBy'] == 1 || data['weightBy'] == 1) { return "Y" } else { return "N" } };

  onlyLettersNumbersAndSpaces(str: any) {
    var a = /^[a-zA-Z\s]*$/.test(str);
    return a;
  }

  saveproposalPDF(Preparedby: string, Preparedfor: string, enableTaxCalendar: boolean, enableTaxPerformance: boolean) {
    var that = this;
    return new Promise((resolve, reject) => {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accID = this.selectedDirIndFactsheet.value;
      var taxEffAwareness: boolean = true;
      const currentDate = new Date();
      var strategyId: any =0;
      var PDate = currentDate.getFullYear() + '-' + that.sharedData.formatedates(currentDate.getMonth() + 1) + '-' + that.sharedData.formatedates(currentDate.getDate());

      var basedata = this.customizeSelectedIndex_Direct.value;
      var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == basedata.id && x.accountId == accID);
      if (notifyId.length > 0) {
        strategyId = notifyId[0]['slid'];
        taxEffAwareness = (isNotNullOrUndefined(notifyId[0]['taxEffAwareness']) && notifyId[0]['taxEffAwareness'] == 'Y') ? true : false;
      }
      var barcharttype: any;
      var assetid: any = basedata['assetId'];
      var indexId: number = 123;
      if (isNotNullOrUndefined(basedata['assetId'])) {
        var ind = this.cusIndexService.equityIndexeMasData.value.filter((x: any) => basedata['assetId'] == x['assetId']);
        if (ind.length > 0) { indexId = ind[0]['indexId'] }
      }

      var d = new Date();
      var etfHoldDate = [...this.sharedData._ETFIndex].filter(x => x.assetId == assetid);
      if (etfHoldDate.length > 0) {
        d = new Date(etfHoldDate[0]['holdingsdate']);
        barcharttype = "ETF";
      } else {
        barcharttype = that._customizeSelectedIndex_Direct.name;
        d = new Date(this.sharedData.equityHoldDate);
      }
      var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());

      var proposaldata: any = {
        "factsheetParameter": {
          "name1": this._customizeSelectedIndex_Direct.name,
          "name2": that._customizeSelectedIndex_Direct.basedon,
          "assetid": assetid,
          "userid": userid,
          "strategyId": strategyId,
          "enddate": date,
          "tenYrFlag": 1,
          "indexId": indexId,
          "freqflag": isNullOrUndefined(basedata['rebalanceType']) ? basedata['rebalanceType'] : that.sharedData.defaultRebalanceType,
          "barcharttype": barcharttype,
          "holdingdate": date,
          "accountId": accID,
          "calendarTaxflag": enableTaxCalendar,
          "performanceTaxflag": enableTaxPerformance,
          "range": 0,
          "taxflag": (isNotNullOrUndefined(this._customizeSelectedIndex_Direct['taxEffAwareness'])) ? this._customizeSelectedIndex_Direct['taxEffAwareness'] : 'N',
          "notifyid": notifyId.length > 0 ? notifyId[0]['notifyId'] : 0,
        },
        "methodologyParameter": {
          "Userid": userid,
          "indexname": that._customizeSelectedIndex_Direct.name,
          "accountId": accID,
          "strategyId": strategyId,
          "taxEffAwareness": taxEffAwareness
        },
        "StrategyName": that._customizeSelectedIndex_Direct.name,
        "ProposalDate": PDate,
        "Preparedby": Preparedby,
        "Client": Preparedfor
      };

      this.dataService.DirectIndexExport_ProposalDI(proposaldata).pipe(first()).subscribe((event) => {
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], { type: data.body?.type });
        if (downloadedFile.type != "" && downloadedFile.type == "application/pdf") {
          var filename: string = that.sharedData.downloadTitleConvert(that._customizeSelectedIndex_Direct.name + '_' + Preparedfor) + "_Proposal.pdf";
          FileSaver.saveAs(downloadedFile, filename);
        } else {
          this.toastr.info("Something went wrong.. please try again", '', { timeOut: 10000, positionClass: 'toast-top-center' });
          reject(event);
        }
        resolve('download');
      }, (error: any) => {
        this.toastr.info("Something went wrong.. please try again", '', { timeOut: 10000, positionClass: 'toast-top-center' });
        reject(error);
      });
    });
  }

  openImpliedRevenue(d:any) {
    var selcomp: any = d;
    if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['stockKey'])) {
      var newSel: any = [...this.sharedData._selResData].filter((x: any) => x.stockKey == selcomp['stockKey']);
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
    this.directIndexData.next([]);
    this.directIndexBrcmData.next([]);
    this.diStrFactsheetAccData.next([]);
    this.getBetaIndex_Direct.next([]);
    this.customizeSelectedIndex_Direct.next(undefined);
    this.errorList_Direct.next(undefined);
    this.currentSList.next(undefined);
    this.selCompany.next(undefined);
    this.taxharvestData_DirectIndex.next(undefined);
    this.selectedDirIndFactsheet.next(undefined);
    this.selectedDirIndStry.next(undefined);
    this.stgyListDashAccsData.next([]);
    this.reviewIndexClickedData.next(undefined);
    this.returnAsOfDate.next('');
    this.DIEnabletradinglist.next([]);
    this.exclusionCompData.next([]);
  }
}
