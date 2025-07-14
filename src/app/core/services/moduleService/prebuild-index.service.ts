import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../sharedData/shared-data.service';
import { Workbook } from 'exceljs';
// @ts-ignore
import { saveAs } from "file-saver";
// @ts-ignore
import * as d3 from 'd3';
import { DataService } from '../data/data.service';
import { LoggerService } from '../logger/logger.service';
import { CustomIndexService } from './custom-index.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent_Prebuilt } from '../../../view/prebuilt-strategies/error-dialogs/common-error-dialog/common-error-dialog.component';
import { DatePipe, formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PrebuildIndexService {

  NaaTooltipDesText: any;
  errorOptions: any;
  EQGrowthValue = { 'S&PGrowth': 208, 'S&PValue': 209 };
  NAAlvl = ["Home", "Category", "Country", "Index", "Sector", "Industrygroup", "Industry", "Sub Industry"];

  naaDonutchart = {
    "New Age Alpha Matrix Indexes":
    {
      "Conservative 5":
        [
          { "Equity": "20.00%", "Fixed income": "78.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ],
      "Moderate 5":
        [
          { "Equity": "40.00%", "Fixed income": "58.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ],
      "Growth 5":
        [
          { "Equity": "75.00%", "Fixed income": "23.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ],
      "Balanced 5":
        [
          { "Equity": "60.00%", "Fixed income": "38.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ],
      "Equity 5":
        [
          { "Equity": "98.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ],
      "Aggressive 5":
        [
          { "Equity": "90.00%", "Fixed income": "8.00%", "Commodity": "0.00%", "Cash": "2.00%" }
        ]
    },
    "New Age Alpha Orbit Indexes":
    {
      "Sector Rotation 4":
        [
          { "Equity": "46.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "54.00%" }
        ],
      "Sector Rotation 5":
        [
          { "Equity": "46.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "54.00%" }
        ],
      "Sector Rotation 6":
        [
          { "Equity": "46.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "54.00%" }
        ]
    },
    "New Age Alpha Compass Indexes":
    {
      "Compass 4":
        [
          { "Equity": "0.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "100.00%" }
        ],
      "Compass 5":
        [
          { "Equity": "0.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "100.00%" }
        ],
      "Compass 6":
        [
          { "Equity": "0.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "100.00%" }
        ]
    },
    "New Age Alpha Vector Indexes":
    {
      "Vector 4":
        [
          { "Equity": "18.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "82.00%" }
        ],
      "Vector 5":
        [
          { "Equity": "22.50%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "77.50%" }
        ],
      "Vector 6":
        [
          { "Equity": "27.00%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "73.00%" }
        ]
    },
    "New Age Alpha Voyager Indexes":
    {
      "Voyager EW 4":
        [
          { "Equity": "50.00%", "Fixed income": "0.00%", "Commodity": "50.00%", "Cash": "0.00%" }
        ],
      "Voyager EW 5":
        [
          { "Equity": "50.00%", "Fixed income": "0.00%", "Commodity": "50.00%", "Cash": "0.00%" }
        ],
      "Voyager EW 6":
        [
          { "Equity": "50.00%", "Fixed income": "0.00%", "Commodity": "50.00%", "Cash": "0.00%" }
        ]
    },
    "New Age Alpha Target Volatility Indexes":
    {
      "US Large-cap Leading 50 Target Volatility 4":
        [
          { "Equity": "18.19%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "81.81%" }
        ],
      "US Large-cap Leading 50 Target Volatility 5":
        [
          { "Equity": "22.74%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "77.26%" }
        ],
      "US Large-cap Leading 50 Target Volatility 6":
        [
          { "Equity": "27.28%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "72.72%" }
        ],
      "US Large-cap Leading Target Volatility 4":
        [
          { "Equity": "19.46%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "80.54%" }
        ],
      "US Large-cap Leading Target Volatility 5":
        [
          { "Equity": "24.33%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "75.67%" }
        ],
      "US Large-cap Leading Target Volatility 6":
        [
          { "Equity": "29.19%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "70.81" }
        ],
      "US Large-cap Low Volatility Target Volatility 4":
        [
          { "Equity": "25.50%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "74.50%" }
        ],
      "US Large-cap Low Volatility Target Volatility 5":
        [
          { "Equity": "31.88%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "68.12%" }
        ],
      "US Large-cap Low Volatility Target Volatility 6":
        [
          { "Equity": "38.26%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "61.74%" }
        ],
      "US Small-cap Leading Target Volatility 4":
        [
          { "Equity": "20.52%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "79.48%" }
        ],
      "US Small-cap LeadingTarget Volatility 5":
        [
          { "Equity": "25.65%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "74.35%" }
        ],
      "US Small-cap Leading Target Volatility 6":
        [
          { "Equity": "30.78%", "Fixed income": "0.00%", "Commodity": "0.00%", "Cash": "69.22%" }
        ]
    }
  };

  familyindexsectorData: BehaviorSubject<any>;
  _familyindexsectorData: any = [];

  prebuiltIndexBrcmData: BehaviorSubject<any>;
  _prebuiltIndexBrcmData: any = [];

  showReviewIndexLoaded: BehaviorSubject<boolean>;
  _showReviewIndexLoaded: boolean = false;

  showBackButton_bcrumb: BehaviorSubject<boolean>;
  _showBackButton_bcrumb: boolean = false;

  showRightSideGrid_prebuilt: BehaviorSubject<boolean>;
  _showRightSideGrid_prebuilt: boolean = false;

  customizeSelectedIndex_prebuilt: BehaviorSubject<any>;
  _customizeSelectedIndex_prebuilt: any;

  startIndexClick_prebuilt: BehaviorSubject<boolean>;
  _startIndexClick_prebuilt: boolean = false;

  errorList_prebuilt: BehaviorSubject<any>;
  _errorList_prebuilt: any;

  NAAEquityIndexes: BehaviorSubject<any>
  _NAAEquityIndexes: any = [];

  getBetaIndex_prebuilt: BehaviorSubject<any>;
  _getBetaIndex_prebuilt: any = [];

  preBuiltLineChartData: BehaviorSubject<any>;
  _preBuiltLineChartData: any = [];

  naaIndexOrderList: BehaviorSubject<any>;
  _naaIndexOrderList: any = [];

  GetNAAIndex_dashboard: BehaviorSubject<any>;
  _GetNAAIndex_dashboard: any = [];

  NaaIndexData: BehaviorSubject<any>;
  _NaaIndexData: any = [];

  selNaaIndex: BehaviorSubject<any>;
  _selNaaIndex: any;

  exclusionCompData: BehaviorSubject<any>
  _exclusionCompData: any = [];

  getESGCatStocksData: BehaviorSubject<any>;
  _getESGCatStocksData: any = [];

  NAAHoldingData: BehaviorSubject<any>;
  _NAAHoldingData: any = [];

  GetNAAIndexStrategyPerf: BehaviorSubject<any>;
  _GetNAAIndexStrategyPerf: any = [];

  GetNAAIndexPerf: BehaviorSubject<any>;
  _GetNAAIndexPerf: any = [];

  naaIndexGridData: BehaviorSubject<any>;
  _naaIndexGridData: any = [];

  filterOptionNodata: BehaviorSubject<any>;
  _filterOptionNodata: any = [];

  selCompany: BehaviorSubject<any>;
  _selCompany: any;

  getIndexConstruction_prebuilt: BehaviorSubject<any>;
  _getIndexConstruction_prebuilt: any = [];

  getIndexConstruction_prebuiltFamily: BehaviorSubject<any>;
  _getIndexConstruction_prebuiltFamily: any = [];

  showViewReport: BehaviorSubject<boolean>;
  _showViewReport: boolean = false;

  viewReportData: BehaviorSubject<any>
  _viewReportData: any = [];

  constructor(private datepipe: DatePipe, public sharedData: SharedDataService, private dataService: DataService, public dialog: MatDialog, private logger: LoggerService, private toastr: ToastrService) {
    this.prebuiltIndexBrcmData = new BehaviorSubject<any>(this._prebuiltIndexBrcmData);
    this.prebuiltIndexBrcmData.subscribe(data => { this._prebuiltIndexBrcmData = data; });

    this.viewReportData = new BehaviorSubject<any>(this._viewReportData);
    this.viewReportData.subscribe(data => { this._viewReportData = data; });

    this.showViewReport = new BehaviorSubject<boolean>(this._showViewReport);
    this.showViewReport.subscribe(data => { this._showViewReport = data; });

    this.familyindexsectorData = new BehaviorSubject<any>(this._familyindexsectorData);
    this.familyindexsectorData.subscribe(data => { this._familyindexsectorData = data; });

    this.NAAEquityIndexes = new BehaviorSubject<any>(this._NAAEquityIndexes);
    this.NAAEquityIndexes.subscribe(data => { this._NAAEquityIndexes = data; });

    this.getBetaIndex_prebuilt = new BehaviorSubject<any>(this._getBetaIndex_prebuilt);
    this.getBetaIndex_prebuilt.subscribe(data => { this._getBetaIndex_prebuilt = data; });

    

    this.preBuiltLineChartData = new BehaviorSubject<any>(this._preBuiltLineChartData);
    this.preBuiltLineChartData.subscribe(data => { this._preBuiltLineChartData = data; });

    this.showReviewIndexLoaded = new BehaviorSubject<boolean>(this._showReviewIndexLoaded);
    this.showReviewIndexLoaded.subscribe(data => { this._showReviewIndexLoaded = data; });

    this.showBackButton_bcrumb = new BehaviorSubject<boolean>(this._showBackButton_bcrumb);
    this.showBackButton_bcrumb.subscribe(data => { this._showBackButton_bcrumb = data; });

    this.startIndexClick_prebuilt = new BehaviorSubject<boolean>(this._startIndexClick_prebuilt);
    this.startIndexClick_prebuilt.subscribe(data => { this._startIndexClick_prebuilt = data; });

    this.customizeSelectedIndex_prebuilt = new BehaviorSubject<any>(this._customizeSelectedIndex_prebuilt);
    this.customizeSelectedIndex_prebuilt.subscribe(data => { this._customizeSelectedIndex_prebuilt = data; });

    this.selNaaIndex = new BehaviorSubject<any>(this._selNaaIndex);
    this.selNaaIndex.subscribe(data => { this._selNaaIndex = data; });

    this.errorList_prebuilt = new BehaviorSubject<any>(this._errorList_prebuilt);
    this.errorList_prebuilt.subscribe(data => { this._errorList_prebuilt = data; });

    this.showRightSideGrid_prebuilt = new BehaviorSubject<boolean>(this._showRightSideGrid_prebuilt);
    this.showRightSideGrid_prebuilt.subscribe(data => { this._showRightSideGrid_prebuilt = data; });

    this.GetNAAIndex_dashboard = new BehaviorSubject<any>(this._GetNAAIndex_dashboard);
    this.GetNAAIndex_dashboard.subscribe(data => { this._GetNAAIndex_dashboard = data; });

    this.naaIndexOrderList = new BehaviorSubject<any>(this._naaIndexOrderList);
    this.naaIndexOrderList.subscribe(data => { this._naaIndexOrderList = data; });

    this.NaaIndexData = new BehaviorSubject<any>(this._NaaIndexData);
    this.NaaIndexData.subscribe(data => { this._NaaIndexData = data; });

    this.exclusionCompData = new BehaviorSubject<any>(this._exclusionCompData);
    this.exclusionCompData.subscribe(data => { this._exclusionCompData = data; });

    this.getESGCatStocksData = new BehaviorSubject<any>(this._getESGCatStocksData);
    this.getESGCatStocksData.subscribe(data => { this._getESGCatStocksData = data; });

    this.NAAHoldingData = new BehaviorSubject<any>(this._NAAHoldingData);
    this.NAAHoldingData.subscribe(data => { this._NAAHoldingData = data; });

    this.GetNAAIndexStrategyPerf = new BehaviorSubject<any>(this._GetNAAIndexStrategyPerf);
    this.GetNAAIndexStrategyPerf.subscribe(data => { this._GetNAAIndexStrategyPerf = data; });

    this.GetNAAIndexPerf = new BehaviorSubject<any>(this._GetNAAIndexPerf);
    this.GetNAAIndexPerf.subscribe(data => { this._GetNAAIndexPerf = data; });

    this.naaIndexGridData = new BehaviorSubject<any>(this._naaIndexGridData);
    this.naaIndexGridData.subscribe(data => { this._naaIndexGridData = data; });
    
    this.filterOptionNodata = new BehaviorSubject<any>(this._filterOptionNodata);
    this.filterOptionNodata.subscribe(data => { this._filterOptionNodata = data; });

    this.selCompany = new BehaviorSubject<any>(this._selCompany);
    this.selCompany.subscribe(data => { this._selCompany = data; });

    this.getIndexConstruction_prebuilt = new BehaviorSubject<any>(this._getIndexConstruction_prebuilt);
    this.getIndexConstruction_prebuilt.subscribe(data => { this._getIndexConstruction_prebuilt = data; });

    this.getIndexConstruction_prebuiltFamily = new BehaviorSubject<any>(this._getIndexConstruction_prebuiltFamily);
    this.getIndexConstruction_prebuiltFamily.subscribe(data => { this._getIndexConstruction_prebuiltFamily = data; });
  }
  getNAAMaster() {
    var that = this;
    this.dataService.getNAAMaster_1().pipe(first()).subscribe((naaIndex: any) => {
      //var naaEquityInd = naaIndex.filter((x: any) => x.indexId == that.EQGrowthValue['S&PGrowth'] || x.indexId == that.EQGrowthValue['S&PValue']);
      //that.NAAEquityIndexes.next(naaEquityInd);
      var naaInd = naaIndex.filter((x: any) => x.indexId != that.EQGrowthValue['S&PValue'] && x.indexId != that.EQGrowthValue['S&PGrowth']);
      //that.NAAIndexes.next(naaInd);
      that.NAAEquityIndexes.next(naaInd);
    }, error => { this.logger.logError(error, 'getNAAMaster'); that.NAAEquityIndexes.next([]);  });

  }
  getNaaIndexOrderList() {
    if (this.naaIndexOrderList.getValue().length == 0) {
      this.dataService.GetIndexOrder().pipe(first()).subscribe(res => { this.naaIndexOrderList.next(res); },
        error => { this.logger.logError(error, 'GetIndexOrder'); });
    }
  }
   /* Getting NaaDes toolTip Text*/
   onGetIndexPerformanceAll() {
    var that = this;
    if (that.GetNAAIndex_dashboard.getValue().length == 0) {
      that.dataService.GetIndexPerformanceAll().pipe(first()).subscribe((res:any) => {
        that.NaaTooltipDesText = res;
        that.GetNAAIndex_dashboard.next(res);
      }, (error: any) => { that.logger.logError(error, 'Indexes/GetIndexPerformanceAll'); });
    }
  }

  /*Getting NaaIndex toolTip Text*/
  getNAACountryGroup(naaIndexOrderList: any, selNaaIndex: any) {
    let matchData: any = [];
    var dta = [...naaIndexOrderList].filter(x => x.category.trim() == selNaaIndex.name);
    let list1 = [...new Set(dta.map((x: { country: any; }) => x.country))];
    list1.forEach((x: any) => {
      matchData.push({
        name: x,
        group: "Country",
        indexType: 'New Age Alpha Indexes',
        type: "NAA",
        Category: selNaaIndex.name
      });
    });
    return matchData;
  }
  getNAACategory(NAAIndexes: any) {
    let matchData: any = [];
    let distinctgroup = NAAIndexes.map((item: any) => item.category).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
    distinctgroup.forEach((value: any) => {
      let resultDt: any = [];
      NAAIndexes.forEach((v: any) => { if (value == v.category) { resultDt.push(v.medianCont); } });
      var meds: any = d3.median(resultDt.filter((x: any) => x > 0), (d: any) => { return d });
      matchData.push({
        name: value, med: d3.format(".1f")(meds),
        group: "Category"
      });
    });
    return matchData;
  }
  getNaaIndexLvlData(level: any) {
    var that = this;
    var naaIndexOrderList: any = [];
    /** Get themetic list ***/
    if (isNotNullOrUndefined(this.naaIndexOrderList.value) && this.naaIndexOrderList.value.length > 0) {
      naaIndexOrderList = this.naaIndexOrderList.value.map((a: any) => ({ ...a })).filter((x: any) => x.category != 'Thematic Strategies');
    }
    /** Get themetic list ***/
    if (level == null || level == undefined || level == "") { level = { group: 'Home', type: "" } };
    return new Promise((resolve, reject) => {
      var lvl = that.NAAlvl.indexOf(level.group) + 1;
      //if (level.type == "NAA") {
      switch (level.group) {
        case ("Live"): {
          let matchData = [];
          matchData = [...that.getNAACategory([...that._NAAEquityIndexes])];
          //matchData.forEach(x => { x.indexType = 'New Age Alpha Indexes'; x.type = "NAA"; });
          matchData.forEach(x => { x.indexType = 'New Age Alpha Indexes'; });
          resolve({ 'menuData': [...matchData], 'CompanyList': [] });
          break;
        }
        case ("Category"): {
          if (level.type == "NAA") {
            let matchData = [];
            matchData = [...that.getNAACountryGroup(naaIndexOrderList, that._selNaaIndex)];
            resolve({ 'menuData': [...matchData], 'CompanyList': [] });
            break;
          }
          else {
            if ([...naaIndexOrderList].filter(x => x.module.trim() == level.name.trim()).length > 0 && (level.name.trim() != "Thematic Indexes") && level.name.trim() != "Factor Indexes") {
              var d = [...naaIndexOrderList].filter(x => x.module.trim() == level.name.trim());
              let list1 = [...new Set(d.map((x: { category: any; }) => x.category.trim()))];
              let matchData: any = [];
              list1.forEach((x: any) => {
                matchData.push({ group: "Category", indexType: 'New Age Alpha Indexes', type: "exNAA", name: x });
              });
              resolve({ 'menuData': [...matchData], 'CompanyList': [] });
            } else {
              var d = [...naaIndexOrderList].filter(x => x.category.trim() == level.name.trim());
              d.forEach(x => {
                x.indexType = 'New Age Alpha Indexes';
                x.name = x.indexname;
                x.group = 'subCategory'; return d
              });
              resolve({ 'menuData': [...d], 'CompanyList': [] });
            }
            break;
          }
        }
        case ("all"): {
          let matchData: any = [];
          matchData = [...naaIndexOrderList].filter((x: any) => x.type == "NAA" || x.type == "NAAIndexes");
          matchData = matchData.sort(function (x: any, y: any) { return d3.ascending((x.sortno), (y.sortno)); });
          matchData.forEach((x: any) => {
            x.name = x.indexname;
            x.indexType = 'New Age Alpha Indexes';
            //x.type = "NAA";
            x.indexCode = x.CommonTicker;
            x.group = "Index";
            x.Category = x.category;
            x.countrygroup = x.country;
          });
          var da = [...naaIndexOrderList].filter(x => x.type.trim() == 'strategy' || x.type.trim() == 'exNAA');
          let list1 = [...new Set(da.map((x: { category: any; }) => x.category.trim()))];
          list1.forEach((x: any) => {
            var typ: any = naaIndexOrderList.filter((m: any) => m.category.trim() == x);
            if (typ.length > 0) { typ = (typ[0].type == "NAAIndexes" || typ[0].type == "NAA") ? "NAA" : "exNAA"; };
            matchData.push({
              group: "Category",
              indexType: 'New Age Alpha Indexes',
              type: typ,
              name: x
            })
          });
          resolve({ 'menuData': [...matchData], 'CompanyList': [...that.sharedData._selResData] });
          break;
        }
        case ("Country"): {
          let matchData = [];
          matchData = [...naaIndexOrderList].map(a => ({ ...a })).filter((x: any) => x.country == this.selNaaIndex.value.name && x.category.trim() == this.selNaaIndex.value.Category);
          matchData.forEach((x: any) => { x.name = x.indexname; });
          matchData.forEach((x: any) => {
            x.indexType = 'New Age Alpha Indexes';
            //x.type = "NAA";
            x.indexCode = x.CommonTicker;
            x.group = "Index";
            x.Category = that._selNaaIndex.Category;
            x.countrygroup = that._selNaaIndex.name;
          });
          matchData = matchData.sort(function (x, y) { return d3.ascending((x.sortno), (y.sortno)); });
          resolve({ 'menuData': [...matchData], 'CompanyList': [] });
          break;
        }
        case ("Index"): {
          that.getNAAHoldings(that._selNaaIndex.indexid).then(data => {
            let matchData: any = [];
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.NAAlvl[lvl])].map(a => ({ ...a }));
            matchData.forEach((x: any) => {
              x.med = that.sharedData.getMedvalue(data, x.code, 2);
              x.indexType = 'New Age Alpha Indexes';
              //x.type = "NAA";
              x.Category = that._selNaaIndex.Category;
              x.id = that._selNaaIndex.id;
              x.group = that.NAAlvl[lvl];
              x.countrygroup = that._selNaaIndex.countrygroup;
              x.naaIndex = that._selNaaIndex.name
            });
            resolve({ 'menuData': [...matchData], 'CompanyList': [...data] });
          });
          break;
        }
        case ("Sector"): {
          that.getNAAHoldings(that._selNaaIndex.id).then(data => {
            let matchData: any = [];
            var filtercomp = [...data].filter((x: any) => x.industry.substring(0, 2) == level.code);
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.NAAlvl[lvl] && x.code.toString().indexOf(level.code) == 0)].map(a => ({ ...a }));;
            matchData.forEach((x: any) => {
              x.med = that.sharedData.getMedvalue(filtercomp, x.code, 4);
              x.indexType = 'New Age Alpha Indexes';
              //x.type = 'NAA';
              x.Category = that._selNaaIndex.Category;
              x.group = that.NAAlvl[lvl];
              x.id = that._selNaaIndex.id;
              x.countrygroup = that._selNaaIndex.countrygroup;
              x.naaIndex = that._selNaaIndex.name;
            });
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Industrygroup"): {
          that.getNAAHoldings(that._selNaaIndex.id).then(data => {
            let matchData: any = [];
            var filtercomp = [...data].filter((x: any) => x.industry.substring(0, 4) == level.code);
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.NAAlvl[lvl] && x.code.toString().indexOf(level.code) == 0)].map(a => ({ ...a }));;
            matchData.forEach((x: any) => {
              x.med = that.sharedData.getMedvalue(filtercomp, x.code, 6);
              x.indexType = 'New Age Alpha Indexes';
              x.group = that.NAAlvl[lvl];
              //x.type = 'NAA';
              x.Category = that._selNaaIndex.Category;
              x.id = that._selNaaIndex.id;
              x.countrygroup = that._selNaaIndex.countrygroup;
              x.naaIndex = that._selNaaIndex.name;
            });
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Industry"): {
          that.getNAAHoldings(that._selNaaIndex.id).then(data => {
            let matchData: any = [];
            var filtercomp = [...data].filter((x: any) => x.industry.substring(0, 6) == level.code);
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.NAAlvl[lvl] && x.code.toString().indexOf(level.code) == 0)].map(a => ({ ...a }));;
            matchData.forEach((x: any) => {
              x.med = that.sharedData.getMedvalue(filtercomp, x.code, 8);
              x.indexType = 'New Age Alpha Indexes';
              //x.type = 'NAA';
              x.group = that.NAAlvl[lvl];
              x.Category = that._selNaaIndex.Category;
              x.id = that._selNaaIndex.id;
              x.countrygroup = that._selNaaIndex.countrygroup;
              x.naaIndex = that._selNaaIndex.name;
            });
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Sub Industry"): {
          that.getNAAHoldings(that._selNaaIndex.id).then(data => {
            var filtercomp = [...data].filter((x: any) => x.industry.substring(0, 8) == level.code);
            resolve({ 'menuData': [], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("subCategory"): {
          that.NAAIndexSHoldingID(that.selNaaIndex.value).then(res => {
            resolve({ 'menuData': [], 'CompanyList': res });
          });

          break;
        }
        default: {
          var dat: any = naaIndexOrderList.sort(function (x: any, y: any) { return d3.ascending((x.sortno), (y.sortno)); });
          let list1 = [...new Set(dat.map((x: { module: any; }) => x.module.trim()))];
          //let matchData:any = [];
          //let all = { group: "all", indexType: 'New Age Alpha Indexes', type: 'all', name: 'All Indexes' };
          //matchData.push(all);
          //list1.forEach((x: any) => {
          //  var typ: any = naaIndexOrderList.filter((m: any) => m.category.trim() == x);
          //  if (typ.length > 0) { typ = (typ[0].type == "NAAIndexes" || typ[0].type == "NAA") ? "NAA" : "exNAA"; }
          //  else { typ = "exNAA"; };
          //  matchData.push({
          //    group: "Category",
          //    indexType: 'New Age Alpha Indexes',
          //    type: typ,
          //    name: x
          //  })
          //});
          let matchData: any[] = [];

          // Use map to transform the list1 array into matchData array
          matchData = matchData.concat(list1.map((x: any) => {
            let typ: string | undefined = undefined;
            const filtered = naaIndexOrderList.filter((m: any) => m.category.trim() === x);
            if (filtered.length > 0) {
              typ = (filtered[0].type === "NAAIndexes" || filtered[0].type === "NAA") ? "NAA" : "exNAA";
            } else {
              typ = "exNAA";
            }
            return {
              group: "Category",
              indexType: 'New Age Alpha Indexes',
              type: typ,
              name: x
            };
          }));

          // Create the 'all' object
          if (matchData.length > 0) {
            const all = { group: "all", indexType: 'New Age Alpha Indexes', type: 'all', name: 'All Indexes' };
            matchData.push(all);
          }
          resolve({ 'menuData': [...matchData], 'CompanyList': [] });
          break;
        }
      }
    });

  }
  NAAIndexSHoldingIDSub: any;
  NAAIndexSHoldingID(selNaaIndex: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      if (selNaaIndex.indexid != null && selNaaIndex.indexid != undefined) {
        try { that.NAAIndexSHoldingIDSub.unsubscribe(); } catch (e) { }
        that.NAAIndexSHoldingIDSub=this.dataService.NAAIndexSHoldingID(selNaaIndex.indexid).pipe(first()).subscribe(res => {
          if (that.sharedData.checkServiceError(res)) {
            this.logger.logError(res, 'NAAIndexSHoldingID');
            this.errorOptions = { from: 'drillDownOpen', error: 'notifyError', destination: 'moveToHome' };
            this.openErrorComp();
            resolve([]);
          } else {
            var dta: any = [];
            res.forEach((x: any) => {
            //  if (x.StockKey != null && x.StockKey != undefined) {
            //    var ddta = [...that.sharedData._selResData].filter(y => y.stockKey == x.StockKey);
            //    if (ddta.length > 0) {
              var newObj = Object.assign({}, x);
              newObj.compname = x.companyName;
              newObj.indexWeight = x.indexweight;
                  newObj.Wt = x.indexweight * 100;
                  newObj.newSec = x.sector;
                  dta.push(newObj);
            //    }
            //  }
            });
            resolve(dta);
          }
        }, error => {
          this.logger.logError(error, 'NAAIndexSHoldingID');
          this.errorOptions = { from: 'drillDownOpen', error: 'notifyError', destination: 'moveToHome' };
          this.openErrorComp();
          resolve([]);
        });
      }
    });
  }

  getNAAHoldingSub: any;
  getNAAHoldings(id: any) {
    let that = this;
    return new Promise<any>((resolve, reject) => {
      if (that.checkGetNAAHoldCall(id)) {
        try { that.getNAAHoldingSub.unsubscribe(); } catch (e) { }
        that.getNAAHoldingSub=that.dataService.getNAAHoldings(id).pipe(first()).pipe(first()).subscribe((naaStocks: any) => {
          var indextemp: any = [];
          //var sKey: string = "stockkey";
          //var matchData = [...that.sharedData._dbGICS].filter(x => x.type == "Sector");
          //if (naaStocks.length > 0) { if (isNotNullOrUndefined(naaStocks[0]['Stockkey'])) { sKey = "Stockkey"; } }
          //var tempselResData = [...that.sharedData._selResData];
          if (naaStocks.length > 0) {
            naaStocks.forEach(function (d: any, i: any) {
              //  let val = tempselResData.filter((x: any) => d[sKey] == x.stockKey);
              //  if (val.length > 0) {
              var obj = Object.assign({}, d);
              //    var newSec = matchData.filter(z => obj.industry.indexOf(z.code) == 0);
              //    if (isNotNullOrUndefined(d['gicsCode']) && (id == 59 || id == 60 || id == 188)) { obj['industry'] = (d['gicsCode']).toString(); }
              //    //obj.NaaIndex = SelNAAIndexName;
              //    //obj.NaaIndexCat = Category;
              //    obj.NaaID = id;
              obj.newSec = d.industryName;
              indextemp.push(obj);
              //  }
            });
            that.NAAHoldingData.next(indextemp);
            resolve(indextemp);
          } else {
            /*** go to home prebuild ***/
            this.errorOptions = { from: 'drillDownOpen', error: 'notifyError', destination: 'moveToHome' };
            this.openErrorComp();
            /*** go to home prebuild ***/
          }
          //naaStocks.forEach(function (d:any, i:any) {
          //    var obj = Object.assign({}, d);
          //  obj.newSec = d.industryName;
          //  indextemp.push(obj);
          //});
          //that.NAAHoldingData.next(indextemp);
          //resolve(indextemp);
        }, error => {
          this.logger.logError(error, 'getNAAHoldings');
          this.errorOptions = { from: 'drillDownOpen', error: 'notifyError', destination: 'moveToHome' };
          this.openErrorComp();
          reject([])
        });
      } else { resolve(that._NAAHoldingData); }
    });
  }
  checkGetNAAHoldCall(id: any) {
    if (this._NAAHoldingData == null || this._NAAHoldingData == undefined || this._NAAHoldingData.length == 0) { return true }
    else { if (this._NAAHoldingData[0].NaaID == id) { return false } else { return true } }
  }

  GetESGCatStocksSub: any;
  GetESGCatStocks() {
    if (isNotNullOrUndefined(this._getESGCatStocksData) || [...this._getESGCatStocksData].length == 0) {
      try { this.GetESGCatStocksSub.unsubscribe(); } catch (e) { }
      this.GetESGCatStocksSub = this.dataService.GetESGCatStocks().pipe(first()).subscribe(data => { this.getESGCatStocksData.next(data) },
        error => { this.logger.logError(error, 'GetESGCatStocks'); });
    }
  }
  noDataFound: boolean = false;
  _filter(value: any, place: string) {
    var filterValue: any = undefined;
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase() }
    var compFilter: any = [...this._naaIndexOrderList]
      .filter((res: any) => (res['indexname'].toLowerCase().includes(filterValue) ||
        res['category'].toLowerCase().includes(filterValue) ||
        res['module'].toLowerCase().includes(filterValue) ||
        res['CommonTicker'].toLowerCase().includes(filterValue)));
    this.noDataFound = compFilter.length === 0;
    if (isNotNullOrUndefined(value)) { this.noDataFound = compFilter.length === 0; } else { this.noDataFound = false; }
    if (this.noDataFound) { d3.select(".DrilldownSearchBar").classed("no_DF", true); }
    else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
    this.filterOptionNodata.next([this.noDataFound, place]);
    return [...compFilter]
  }

  prebuildIndSearch(d: any) {
    var crum: any = [];
    if (isNotNullOrUndefined(d['type']) && d['type'] == 'NAAIndexes') {
      this.getNaaIndexLvlData(undefined).then((res: any) => {
        if (isNotNullOrUndefined(res['menuData']) && res['menuData'].length > 0) {
          var lvl1 = res['menuData'].filter((x: any) => x.name == d['category']);
          if (lvl1.length > 0) {
            crum.push(lvl1[0]);
            this.selNaaIndex.next(lvl1[0]);
            this.getNaaIndexLvlData(lvl1[0]).then((res1: any) => {
              if (isNotNullOrUndefined(res1['menuData']) && res1['menuData'].length > 0) {
                var lvl2 = res1['menuData'].filter((x: any) => x.name == d['country']);
                if (lvl2.length > 0) {
                  this.selNaaIndex.next(lvl2[0]);
                  crum.push(lvl2[0]);
                  this.getNaaIndexLvlData(lvl2[0]).then((res2: any) => {
                    if (isNotNullOrUndefined(res2['menuData']) && res2['menuData'].length > 0) {
                      var lvl3 = res2['menuData'].filter((x: any) => x.indexid == d['indexid']);
                      if (lvl3.length > 0) {
                        this.selNaaIndex.next(lvl3[0]);
                        this.customizeSelectedIndex_prebuilt.next(lvl3[0]);
                        crum.push(lvl3[0]);
                        this.prebuiltIndexBrcmData.next(crum);
                        this.startIndexClick_prebuilt.next(true);
                        this.GetFamilyindexsector(this.selNaaIndex.value);
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
    else if (isNotNullOrUndefined(d['type']) && d['type'] == 'strategy') {
      this.getNaaIndexLvlData(undefined).then((res: any) => {
        if (isNotNullOrUndefined(res['menuData']) && res['menuData'].length > 0) {
          var lvl1 = res['menuData'].filter((x: any) => x.name == d['module']);
          if (lvl1.length > 0) {
            crum.push(lvl1[0]);
            this.selNaaIndex.next(lvl1[0]);
            this.getNaaIndexLvlData(lvl1[0]).then((res1: any) => {
              if (isNotNullOrUndefined(res1['menuData']) && res1['menuData'].length > 0) {
                var lvl2 = res1['menuData'].filter((x: any) => x.name == d['category']);
                if (lvl2.length > 0) {
                  this.selNaaIndex.next(lvl2[0]);
                  crum.push(lvl2[0]);
                  this.getNaaIndexLvlData(lvl2[0]).then((res2: any) => {
                    if (isNotNullOrUndefined(res2['menuData']) && res2['menuData'].length > 0) {
                      var lvl3 = res2['menuData'].filter((x: any) => x.indexid == d['indexid']);
                      if (lvl3.length > 0) {
                        this.selNaaIndex.next(lvl3[0]);
                        crum.push(lvl3[0]);
                        this.customizeSelectedIndex_prebuilt.next(lvl3[0]);
                        this.prebuiltIndexBrcmData.next(crum);
                        this.startIndexClick_prebuilt.next(true);
                      }
                    }
                  });
                } else {
                  if (isNotNullOrUndefined(res1['menuData'][0]['group']) && res1['menuData'][0]['group'] == 'subCategory') {
                    var lvlFact = res1['menuData'].filter((x: any) => x.indexid == d['indexid']);
                    if (lvlFact.length > 0) {
                      this.selNaaIndex.next(lvlFact[0]);
                      crum.push(lvlFact[0]);
                      this.customizeSelectedIndex_prebuilt.next(lvlFact[0]);
                      this.prebuiltIndexBrcmData.next(crum);
                      this.startIndexClick_prebuilt.next(true);
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
    else { this.toastr.success('Please try again...', '', { timeOut: 5000 }); }
  }

  createSector(data: any) {
    var arr: any = [];
      var list1 = [...new Set(data.map((x: { newSec: any; }) => x.newSec))];
      list1.forEach((x) => {
        var list = data.filter((y: any) => y.newSec == x);
        let tot = d3.sum(list, function (d: any) { return d.indexWeight * 100; });
        arr.push({ "name": x, weight: d3.format(".2f")(tot) + "%", indexWeight: tot });
      });
    var dta = [...arr].map(a => ({ ...a })).sort(function (x, y) { return d3.descending((parseFloat(x.weight)), (parseFloat(y.weight))); });
    return [...dta];
  }

  dateforSector(date: any) {
    var d = new Date(date);
    return (d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear());
  }
  formatPercentage(value: any) { if (value == "" || isNullOrUndefined(value)) { return '-'; } else { return (value * 100).toFixed(2); } };
  GetYear(value: any, index: any) { return value.slice(6, 10) - index; };
  getBMIndexName(BMdata: any) { if (BMdata.IndexName.indexOf("(") > -1) { return BMdata.IndexName.split("(")[0] } else { return BMdata.IndexName } };
  openErrorComp() {
    /** Close Loader **/

    /** Close Loader **/

    var title = 'circleData';
    var options = this.errorOptions;
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent_Prebuilt, { disableClose: true, width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  }
  GetFamilyindexsectorSub: any;
  GetFamilyindexsector(data: any) {
    if (isNotNullOrUndefined(data) && isNotNullOrUndefined(data['indexid']) && isNotNullOrUndefined(data['category'])) {
      if (data['category'] == "Family Indexes") {
        var dt: any = { "indexId": data['indexid'] };
        try { this.GetFamilyindexsectorSub.unsubscribe(); } catch (e) { }
        this.GetFamilyindexsectorSub=this.dataService.GetFamilyindexsector(dt).pipe(first()).subscribe((res: any) => { this.familyindexsectorData.next(res) });
      } else { this.familyindexsectorData.next([]) }
    } else { this.familyindexsectorData.next([]) }
  }

  tradeDownload(filesName: any, resData: any, type: any) {
    var that = this;
    var daTe: any = (resData.length > 0 && isNotNullOrUndefined(resData[0]['EffectiveDate'])) ? new Date(resData[0]['EffectiveDate']) : new Date();
    var indate = formatDate(daTe, 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var rpdate = formatDate(new Date(), 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, item.StockKey, that.sharedData.formatWt_percentage(that.sharedData.showWt_Mc(item))]); });
    ws.addRow([filesName]).font = { bold: true };
    ws.addRow(['As of', indate]).font = { bold: true };
    ws.addRow(['Report Date', rpdate]).font = { bold: true };
    ws.addRow([]);
    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey' , 'Weight'])
    header.font = { bold: true };
    //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });

    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (that.sharedData.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosures I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.sharedData.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.sharedData.excelDisclosures.value) && that.sharedData.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosures II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.sharedData.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_Components_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  tradeDownload1(filesName: any,index:any, resData: any, type: any) {
    var that = this;
    var ticker: string = (isNotNullOrUndefined(index['indexCode'])) ? index['indexCode'] : (isNotNullOrUndefined(index['CommonTicker'])) ? index['CommonTicker'] : '';
    var daTe: any = (resData.length > 0 && isNotNullOrUndefined(resData[0]['effectiveDate'])) ? new Date(resData[0]['effectiveDate']) : new Date();
    var indate = formatDate(daTe, 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var rpdate = formatDate(new Date(), 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.compname, item.ticker, item.stockkey, that.sharedData.formatWt_percentage(that.sharedData.showWt_Mc(item))]); });
    ws.addRow([(filesName + '(' + ticker + ')')]).font = { bold: true };
    ws.addRow(['As of', indate]).font = { bold: true };
    ws.addRow(['Report Date', rpdate]).font = { bold: true };
    ws.addRow([]);
    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey' , 'Weight'])
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
    var fileName = this.sharedData.downloadTitleConvert(flName) + "_Components_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      this.sharedData.showCenterLoader.next(true);
      this.sharedData.showMatLoader.next(true);
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.prebuildIndSearch(value); }
    }
  }

  resetService() {
    this.selCompany.next(undefined);
    this.selNaaIndex.next(undefined);
    this.customizeSelectedIndex_prebuilt.next(undefined);
    this.errorList_prebuilt.next(undefined);
    this.familyindexsectorData.next([]);
    this.prebuiltIndexBrcmData.next([]);
    this.NAAEquityIndexes.next([]);
    this.getBetaIndex_prebuilt.next([]);
    this.preBuiltLineChartData.next([]);
    this.naaIndexOrderList.next([]);
    this.GetNAAIndex_dashboard.next([]);
    this.NaaIndexData.next([]);
    this.exclusionCompData.next([]);
    this.getESGCatStocksData.next([]);
    this.NAAHoldingData.next([]);
    this.GetNAAIndexStrategyPerf.next([]);
    this.GetNAAIndexPerf.next([]);
    this.naaIndexGridData.next([]);
    this.filterOptionNodata.next([]);
  }
}
