import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../sharedData/shared-data.service';
// @ts-ignore
import * as d3 from 'd3';
import { DataService } from '../data/data.service';
import { LoggerService } from '../logger/logger.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PrebuildIndexService } from './prebuild-index.service';
import { CommonErrorDialogComponent } from '../../../view/direct-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { CommonErrorDialogComponent_Thematic } from '../../../view/thematic-strategies/error-dialogs/common-error-dialog/common-error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ThematicIndexService {

  errorOptions: any;
  thematicGlobalData: BehaviorSubject<any>;
  _thematicGlobalData: any = [];

  thematicIndexBrcmData: BehaviorSubject<any>;
  _thematicIndexBrcmData: any = [];

  showReviewIndexLoaded: BehaviorSubject<boolean>;
  _showReviewIndexLoaded: boolean = false;

  showBackButton_bcrumb: BehaviorSubject<boolean>;
  _showBackButton_bcrumb: boolean = false;

  showRightSideGrid_thematic: BehaviorSubject<boolean>;
  _showRightSideGrid_thematic: boolean = false;

  customizeSelectedIndex_thematic: BehaviorSubject<any>;
  _customizeSelectedIndex_thematic: any;

  startIndexClick_thematic: BehaviorSubject<boolean>;
  _startIndexClick_thematic: boolean = false;

  errorList_thematic: BehaviorSubject<any>;
  _errorList_thematic: any;

  selCompany: BehaviorSubject<any>;
  _selCompany: any;

  selNaaIndex: BehaviorSubject<any>;
  _selNaaIndex: any;

  filterOptionNodata: BehaviorSubject<any>;
  _filterOptionNodata: any = [];

  exclusionCompData: BehaviorSubject<any>
  _exclusionCompData: any = [];

  thematicIndexList: BehaviorSubject<any>;
  _thematicIndexList: any = [];

  constructor(public preBuiltService: PrebuildIndexService, public sharedData: SharedDataService, private dataService: DataService, public dialog: MatDialog, private logger: LoggerService, private toastr: ToastrService) {
    this.thematicGlobalData = new BehaviorSubject<any>(this._thematicGlobalData);
    this.thematicGlobalData.subscribe(data => { this._thematicGlobalData = data; });

    this.thematicIndexBrcmData = new BehaviorSubject<any>(this._thematicIndexBrcmData);
    this.thematicIndexBrcmData.subscribe(data => { this._thematicIndexBrcmData = data; });

    this.showReviewIndexLoaded = new BehaviorSubject<boolean>(this._showReviewIndexLoaded);
    this.showReviewIndexLoaded.subscribe(data => { this._showReviewIndexLoaded = data; });

    this.showBackButton_bcrumb = new BehaviorSubject<boolean>(this._showBackButton_bcrumb);
    this.showBackButton_bcrumb.subscribe(data => { this._showBackButton_bcrumb = data; });

    this.startIndexClick_thematic = new BehaviorSubject<boolean>(this._startIndexClick_thematic);
    this.startIndexClick_thematic.subscribe(data => { this._startIndexClick_thematic = data; });

    this.customizeSelectedIndex_thematic = new BehaviorSubject<any>(this._customizeSelectedIndex_thematic);
    this.customizeSelectedIndex_thematic.subscribe(data => { this._customizeSelectedIndex_thematic = data; });

    this.selNaaIndex = new BehaviorSubject<any>(this._selNaaIndex);
    this.selNaaIndex.subscribe(data => { this._selNaaIndex = data; });

    this.filterOptionNodata = new BehaviorSubject<any>(this._filterOptionNodata);
    this.filterOptionNodata.subscribe(data => { this._filterOptionNodata = data; });

    this.errorList_thematic = new BehaviorSubject<any>(this._errorList_thematic);
    this.errorList_thematic.subscribe(data => { this._errorList_thematic = data; });

    this.showRightSideGrid_thematic = new BehaviorSubject<boolean>(this._showRightSideGrid_thematic);
    this.showRightSideGrid_thematic.subscribe(data => { this._showRightSideGrid_thematic = data; });

    this.exclusionCompData = new BehaviorSubject<any>(this._exclusionCompData);
    this.exclusionCompData.subscribe(data => { this._exclusionCompData = data; });

    this.thematicIndexList = new BehaviorSubject<any>(this._thematicIndexList);
    this.thematicIndexList.subscribe(data => { this._thematicIndexList = data; });

    this.selCompany = new BehaviorSubject<any>(this._selCompany);
    this.selCompany.subscribe(data => { this._selCompany = data; });
  }

  getNaaIndexLvlData_v1(level: any) {
    var that = this;
    //var naaIndexOrderList: any = [];
    //if (isNotNullOrUndefined(this.naaIndexOrderList.value) && this.naaIndexOrderList.value.length > 0) {
    //  naaIndexOrderList = this.naaIndexOrderList.value.map((a: any) => ({ ...a })).filter((x: any) => x.category == 'Thematic Strategies');
    //}
    if (level == null || level == undefined || level == "") { level = { group: 'Home', type: "" } };
    return new Promise((resolve, reject) => {
      //if (level.type == "NAA") {
      switch (level.group) {
        case ("subCategory"): {
          that.NAAThematicHoldings(that.selNaaIndex.value).then(res => {
            resolve({ 'menuData': [], 'CompanyList': res });
          });

          break;
        }
      }
    });

  }
  noDataFound = false;
  _filter(value: any, place: string) {
    var filterValue: any = undefined;
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase() }
    var compFilter: any  = [...this._thematicIndexList].filter((res: any) => (res['indexname'].toLowerCase().includes(filterValue) ||
    res['category'].toLowerCase().includes(filterValue) ||
    res['module'].toLowerCase().includes(filterValue)));
    this.noDataFound = compFilter.length === 0;
    if (isNotNullOrUndefined(value)) { this.noDataFound = compFilter.length === 0; } else { this.noDataFound = false; }
    if (this.noDataFound) {
      d3.select(".DrilldownSearchBar").classed("no_DF", true);
    } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
    this.filterOptionNodata.next([this.noDataFound, place]);
    return [...compFilter]
  }

  GetThematicIndexes() {
    if (this.thematicIndexList.getValue().length == 0) {
      this.dataService.GetThematicIndexes().pipe(first()).subscribe(res => {
        if (this.sharedData._selResData.length > 0) {
          setTimeout(() => { this.sharedData.showCircleLoader.next(false);}, 300)
        }
        this.thematicIndexList.next(res);
      },
        error => {
          this.logger.logError(error, 'GetThematicIndexes');
          this.errorOptions = { from: 'drillDownLoad', error: 'notifyError', destination: 'moveToDashboard' };
          this.openErrorComp();
          this.sharedData.showCircleLoader.next(false);
        });
    }
  }

  thematicIndexClick(dd: any) {
    var that = this;
    that.sharedData.showCenterLoader.next(true);
    var d = Object.assign({}, dd);
    d.name = d.indexname.trim();
    d.indexCode = d.CommonTicker;
    that.sharedData.userEventTrack("Thematic Strategies", "index click", d.name, 'Center Table Index click');
    d.group = "strategy";
    d.indexType = 'New Age Alpha Indexes';
    d.type = "exNAA"
    d.group = "subCategory";
    d.Category = d.category;
    this.customizeSelectedIndex_thematic.next(d);
    this.thematicIndexBrcmData.next([d]);
    this.startIndexClick_thematic.next(true);
    //console.log(d, 'the')
  }

  getNAAThematicHoldingSub: any;
  NAAThematicHoldings(selNaaIndex: any) {
    return new Promise((resolve, reject) => {
      if (selNaaIndex.indexid != null && selNaaIndex.indexid != undefined) {
        try { this.getNAAThematicHoldingSub.unsubscribe(); } catch (e) { }
        this.getNAAThematicHoldingSub=this.dataService.getNAAThematicHoldings(selNaaIndex.indexid).pipe(first()).subscribe((res: any) => {
          var dta: any = [];
          res.forEach((x: any) => {
            var newObj = Object.assign({}, x);
            newObj.Wt = 0;
            newObj.score = 0;
            newObj.scores = 0;
            newObj.stockKey = newObj.tStockkey;
            newObj.isin = 'a' + newObj.tStockkey;
            newObj.compname = newObj.tCompany;
            newObj.company = newObj.tCompany;
            dta.push(newObj);
          });
          resolve(dta);
        }, (error: any) => {
          this.logger.logError(error, 'getNAAThematicHoldings');
          this.errorOptions = { from: 'drillDownOpen', error: 'notifyError', destination: 'moveToHome' };
          this.openErrorComp();
          resolve([]);
        });
      }
    });
  }
  openErrorComp() {
    var title = 'Error';
    var options = this.errorOptions;
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent_Thematic, { disableClose: true , width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
  }

  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.thematicIndexClick(value); }
    }
  }

  resetService() {
    this.selCompany.next(undefined);
    this.customizeSelectedIndex_thematic.next(undefined);
    this.errorList_thematic.next(undefined);
    this.selNaaIndex.next(undefined);
    this.thematicGlobalData.next([]);
    this.thematicIndexBrcmData.next([]);
    this.filterOptionNodata.next([]);
    this.exclusionCompData.next([]);
    this.thematicIndexList.next([]);
  }
}
