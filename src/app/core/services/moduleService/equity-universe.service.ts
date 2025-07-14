import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../sharedData/shared-data.service';
import { CustomIndexService } from './custom-index.service';
import { ascending, format, median, scaleLinear, sum } from 'd3';
import { LoggerService } from '../logger/logger.service';
import { DataService } from '../data/data.service';
import { CommonErrorDialogComponent } from '../../../view/direct-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router, RoutesRecognized } from '@angular/router';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class EquityUniverseService {

  showHFCompanyRanges: any = { selectedPin: false, UOpricestockPin: false, range0_25: false, range25_50: false, range50_75: false, range75_100: false };

  selGICS: BehaviorSubject<any>;
  _selGICS: any;

  selComp: BehaviorSubject<any>;
  _selComp: any;

  breadcrumbdata: BehaviorSubject<any>;
  _breadcrumbdata: any = [];

  rightGridData: BehaviorSubject<any>;
  _rightGridData: any = [];

  SRValue: BehaviorSubject<number>;
  _SRValue: number = 0;

  avoidLoserData: BehaviorSubject<any>;
  _avoidLoserData: any = [];

  CurrentAllocComps: BehaviorSubject<any>;
  _CurrentAllocComps: any = [];

  performanceUIndexList: BehaviorSubject<any>
  _performanceUIndexList: any = [];

  getCumulativeAnnData: BehaviorSubject<any>
  _getCumulativeAnnData: any = [];

  triggerCumulativeLinechart: BehaviorSubject<boolean>
  _triggerCumulativeLinechart: boolean = false;

  Equitylvl = ["Home", "Country", "Index", "Sector", "Industrygroup", "Industry", "Sub Industry"];
  Globallvl = ["Home", "Country", "Sector", "Industrygroup", "Industry", "Sub Industry"];

  indexPreRunCustomData: BehaviorSubject<any>;
  _indexPreRunCustomData: any = [];

  constructor(private router: Router, private cusIndexService: CustomIndexService, private sharedData: SharedDataService, public dialog: MatDialog, private toastr: ToastrService,
    private logger: LoggerService, public dataService: DataService) {

    try {
      this.router['events'].pipe(filter((event: any) => event instanceof RoutesRecognized))
        .subscribe((event: any) => {
          if (isNotNullOrUndefined(event) && isNotNullOrUndefined(event['url']) && event['url'] === '/logout') { this.resetService(); }
        });
    } catch (e) { }

    this.selGICS = new BehaviorSubject<any>(this._selGICS);
    this.selGICS.subscribe(data => { this._selGICS = data; });

    this.indexPreRunCustomData = new BehaviorSubject<any>(this._indexPreRunCustomData);
    this.indexPreRunCustomData.subscribe(data => { this._indexPreRunCustomData = data; });

    this.selComp = new BehaviorSubject<any>(this._selComp);
    this.selComp.subscribe(data => { this._selComp = data; });

    this.SRValue = new BehaviorSubject<number>(this._SRValue);
    this.SRValue.subscribe(data => { this._SRValue = data; });

    this.breadcrumbdata = new BehaviorSubject<any>(this._breadcrumbdata);
    this.breadcrumbdata.subscribe(data => { this._breadcrumbdata = data; });

    this.rightGridData = new BehaviorSubject<any>(this._rightGridData);
    this.rightGridData.subscribe(data => { this._rightGridData = data; });

    this.avoidLoserData = new BehaviorSubject<any>(this._avoidLoserData);
    this.avoidLoserData.subscribe(data => { this._avoidLoserData = data; });

    this.CurrentAllocComps = new BehaviorSubject<any>(this._CurrentAllocComps);
    this.CurrentAllocComps.subscribe(data => { this._CurrentAllocComps = data; });

    this.performanceUIndexList = new BehaviorSubject<any>(this._performanceUIndexList);
    this.performanceUIndexList.subscribe(data => { this._performanceUIndexList = data; });

    this.getCumulativeAnnData = new BehaviorSubject<any>(this._getCumulativeAnnData);
    this.getCumulativeAnnData.subscribe(data => { this._getCumulativeAnnData = data; });

    this.triggerCumulativeLinechart = new BehaviorSubject<any>(this._triggerCumulativeLinechart);
    this.triggerCumulativeLinechart.subscribe(data => { this._triggerCumulativeLinechart = data; });
  }

  equityBrcmClick(i: any) {
    if (this._breadcrumbdata.length > 0 && i > -1) {
      var brData = [...this._breadcrumbdata].map(a => ({ ...a }));
      let data = brData.splice(0, i + 1);
      this.selGICS.next(this._breadcrumbdata[i]);
      this.breadcrumbdata.next(data);
    } else {
      this.selGICS.next(undefined);
      this.breadcrumbdata.next([]);
    }
  }

  GetBMIndStkKeySub: any;
  getEqGrowthValueData(indexId: number) {
    var that = this;
    return new Promise((resolve, reject) => {
      try { that.GetBMIndStkKeySub.unsubscribe(); } catch (e) { }
      that.GetBMIndStkKeySub=that.dataService.GetBMIndexStkKeys(indexId).pipe(first()).subscribe((naaStocks: any) => {
          resolve(naaStocks)
        }, (error: any) => {
        reject();
        that.openDirectErrorComp('Error', 'EquityLevelData', 'performanceError', 'moveToHome');
          this.logger.logError(error, 'GetBMIndexStkKeys');
        });
    });
  }

  getMed(key: string, name: any) {
    var data: any = [...this.sharedData._selResData];
    var fil: any = [];
    if (key == 'indexName') { fil = [...data].filter((x: any) => x[key] == name); }
    else { fil = [...data].filter((x: any) => x[key] == name || x['indexName'].indexOf(name) > -1); }
    var medm: any = [...fil].map((x: any) => x.scores);
    var med: any = median(medm);
    return format(".1f")(med * 100) ;
  }

  keyComparer(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.stockkey == current.stockKey }).length > 0; } }

  sMIDUniverseData: any[] = [];
  GetSMIDUniverseSub: any;
  gGetSMIDUniverseData(indexId: number) {
    var that = this;
    return new Promise((resolve, reject) => {
      try { that.GetSMIDUniverseSub.unsubscribe(); } catch (e) { }
      if (this.sMIDUniverseData.length == 0) {
        that.GetSMIDUniverseSub = that.dataService.GetSMIDUniverse({}).pipe(first()).subscribe((res: any) => {
          res = res.map((item: any) => ({
            score: (isNotNullOrUndefined(item['scores'])) ? (item['scores'] * 100) : 0,
            aisin: item['isin'],
            ...item,
            isin: ("a" + item['stockKey']),
          }));
          this.sMIDUniverseData = [...res];
          resolve(res)
        }, (error: any) => {
          reject();
          that.openDirectErrorComp('Error', 'EquityLevelData', 'performanceError', 'moveToHome');
          this.logger.logError(error, 'GetBMIndexStkKeys');
        });
      } else { resolve([...this.sMIDUniverseData]) }
    });
  }

  getEquityLevelData() {
    var that = this;
    var level = this.selGICS.value;
    var equityIndexeMasData: any = this.cusIndexService.equityIndexeMasData.value;
    equityIndexeMasData = equityIndexeMasData.sort(function (x: any, y: any) { return ascending(x.sort, y.sort); });
    if (isNullOrUndefined(level) || isNullOrUndefined(level['group']) || level == "") { level = { group: 'Home', indexType: "Equity Universe" } };
    return new Promise((resolve, reject) => {
      var lvl: number = that.Equitylvl.indexOf(level.group) + 1;
      if (isNotNullOrUndefined(level['indexType']) && level['indexType'] == 'Global Universe') {
        lvl = that.Globallvl.indexOf(level.group) + 1;
        switch (level.group) {
          case ("Home"): {
            var country: any = [...new Set(equityIndexeMasData.filter((x: any) => x.erfFlag == 'Y').map((item: any) => item.country))];

            let matchData: any = country.map((item: any) => ({
              name: item,
              group: 'Country',
              med: that.getMed('country', item),
              indexType: "Equity Universe"
            }));

            var fGolIn = matchData.findIndex((x: any) => x.name == "Global");
            if (fGolIn > -1) {
              var medm: any = [...that.sharedData._selResData].map((x: any) => x.scores);
              var med: any = median(medm);
              matchData[fGolIn]['med'] = format(".1f")(med * 100);
              matchData[fGolIn]['indexType'] = 'Global Universe';
            }
            resolve({ 'menuData': [...matchData], 'CompanyList': [...this.sharedData._selResData] })
            break;
          }
          case ("Country"): {
            var filtercomp: any = [...that.sharedData._selResData];
            let matchData: any = [];
            matchData = [...that.sharedData._dbGICS].filter(x => x.type == that.Globallvl[lvl]);
            matchData = matchData.map((item: any) => ({
              group: that.Globallvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 2),
              indexType: 'Global Universe',
              indexName: that._selGICS.name,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            break;
          } case ("Sector"): {
            let matchData = [];
            var filtercomp: any = [...that.sharedData._selResData].filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 2) == that._selGICS.code);
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Globallvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
            matchData = matchData.map((item: any) => ({
              group: that.Globallvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 4),
              indexType: 'Global Universe',
              indexName: that._selGICS.indexName,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            break;
          }
          case ("Industrygroup"): {
            let matchData = [];
            var filtercomp: any = [...that.sharedData._selResData].filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 4) == that._selGICS.code);
            matchData = [...that.sharedData._dbGICS].filter((x: any) => x.type == that.Globallvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0);
            matchData = matchData.map((item: any) => ({
              group: that.Globallvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 6),
              indexType: 'Global Universe',
              indexName: that._selGICS.indexName,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            break;
          }
          case ("Industry"): {
            let matchData = [];
            var filtercomp: any = [...that.sharedData._selResData].filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 6) == that._selGICS.code);
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Globallvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
            matchData = matchData.map((item: any) => ({
              group: that.Globallvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 8),
              indexType: 'Global Universe',
              indexName: that._selGICS.indexName,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            break;
          }
          case ("Sub Industry"): {
            var filtercomp: any = [...that.sharedData._selResData].filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 8) == JSON.stringify(that._selGICS.code));
            resolve({ 'menuData': [], 'CompanyList': [...filtercomp] });
            break;
          }
          default: {
            resolve(undefined)
            break;
          }
        }
      } else {
        switch (level.group) {
          case ("Home"): {
            var country: any = [...new Set(equityIndexeMasData.filter((x: any) => x.erfFlag == 'Y').map((item: any) => item.country))];

            let matchData: any = country.map((item: any) => ({
              name: item,
              group: 'Country',
              med: that.getMed('country', item),
              indexType: "Equity Universe"
            }));

            var fGolIn = matchData.findIndex((x: any) => x.name == "Global");
            if (fGolIn > -1) {
              var medm: any = [...that.sharedData._selResData].map((x: any) => x.scores);
              var med: any = median(medm);
              matchData[fGolIn]['med'] = format(".1f")(med * 100);
              matchData[fGolIn]['indexType'] = 'Global Universe';
            }
            resolve({ 'menuData': [...matchData], 'CompanyList': [...this.sharedData._selResData] })
            break;
          }
          case ("Country"): {
            var index: any = equityIndexeMasData.filter((x: any) => x.erfFlag == 'Y' && x.country == level.name);
            let matchData = [...index];
            var filtercomp: any = [...that.sharedData._selResData].filter(function (d) { return d.country == level.name; })
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            break;
          }
          case ("Index"): {
            let matchData: any = [];
            matchData = [...that.sharedData._dbGICS].filter(x => x.type == that.Equitylvl[lvl]);
            var filtercomp: any = [];
            if (isNotNullOrUndefined(that._selGICS) && isNotNullOrUndefined(that._selGICS['indexId']) && that._selGICS['indexId'] == 290) {
              that.gGetSMIDUniverseData(that._selGICS.indexId).then((res: any) => {
                //console.log('getEqGrowthValueData', res);
                //filtercomp = [...that.sharedData._selResData].filter(that.keyComparer(res));
                filtercomp = [...res];
                matchData = matchData.map((item: any) => ({
                  group: that.Equitylvl[lvl],
                  med: that.getMedvalue(filtercomp, item.code, 2),
                  indexType: 'Equity Universe',
                  indexName: that._selGICS.name,
                  ...item
                }));
                matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
                resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
              }).catch(res => {

              });
            } else if (that._selGICS.indexId == 208 || that._selGICS.indexId == 209) {
              that.getEqGrowthValueData(that._selGICS.indexId).then(res => {
                //console.log('getEqGrowthValueData', res);
                filtercomp = [...that.sharedData._selResData].filter(that.keyComparer(res));
                matchData = matchData.map((item: any) => ({
                  group: that.Equitylvl[lvl],
                  med: that.getMedvalue(filtercomp, item.code, 2),
                  indexType: 'Equity Universe',
                  indexName: that._selGICS.name,
                  ...item
                }));
                matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
                if (that._selGICS.indexId == 208) { that.sharedData.EqGrowthData.next(filtercomp); }
                else if (that._selGICS.indexId == 209) { that.sharedData.EqValueData.next(filtercomp); }
                resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
              }).catch(res => {

              });
            } else {
              if (that._selGICS.indexId == 53) {
                filtercomp = [...that.sharedData._selResData].filter(function (d) { return d.indexName == "S&P 500" || d.indexName == "S&P 600" || d.indexName == "S&P 400" });
              } else {
                filtercomp = [...that.sharedData._selResData].filter(function (d) { return d.indexName == that._selGICS.name; });
              }
              matchData = matchData.map((item: any) => ({
                group: that.Equitylvl[lvl],
                med: that.getMedvalue(filtercomp, item.code, 2),
                indexType: 'Equity Universe',
                indexName: that._selGICS.name,
                ...item
              }));
              matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
              resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            }
            break;
          }
          case ("Sector"): {
            that.getIndList().then((res: any) => {
              let matchData = [];
              var filtercomp: any = res.filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 2) == that._selGICS.code);
              matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
              matchData = matchData.map((item: any) => ({
                group: that.Equitylvl[lvl],
                med: that.getMedvalue(filtercomp, item.code, 4),
                indexType: 'Equity Universe',
                indexName: that._selGICS.indexName,
                ...item
              }));
              matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
              resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            });
            break;
          }
          case ("Industrygroup"): {
            that.getIndList().then((res: any) => {
              let matchData = [];
              var filtercomp = res.filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 4) == that._selGICS.code);
              matchData = [...that.sharedData._dbGICS].filter((x: any) => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0);
              matchData = matchData.map((item: any) => ({
                group: that.Equitylvl[lvl],
                med: that.getMedvalue(filtercomp, item.code, 6),
                indexType: 'Equity Universe',
                indexName: that._selGICS.indexName,
                ...item
              }));
              matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
              resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            });
            break;
          }
          case ("Industry"): {
            that.getIndList().then((res: any) => {
              let matchData = [];
              var filtercomp = res.filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 6) == that._selGICS.code);
              matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.Equitylvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
              matchData = matchData.map((item: any) => ({
                group: that.Equitylvl[lvl],
                med: that.getMedvalue(filtercomp, item.code, 8),
                indexType: 'Equity Universe',
                indexName: that._selGICS.indexName,
                ...item
              }));
              matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
              resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
            });
            break;
          }
          case ("Sub Industry"): {
            that.getIndList().then((res: any) => {
              var filtercomp = res.filter((x: any) => isNotNullOrUndefined(x.industry) && x.industry.toString().substring(0, 8) == JSON.stringify(that._selGICS.code));
              resolve({ 'menuData': [], 'CompanyList': [...filtercomp] });
            });
            break;
          }
          default: {
            resolve(undefined)
            break;
          }
        }
      }
    });
  }

  getIndList() {
    return new Promise<any>((resolve, reject) => {
      var indList: any;
      var tempsub: any;
      var indexId: number = 0;
      var fIndex = [...this.breadcrumbdata.value].filter((x: any) => x.group == 'Index');
      if (fIndex.length > 0 && isNotNullOrUndefined(fIndex[0]['indexId'])) { indexId = fIndex[0]['indexId'] };
      if (indexId == 290) { resolve(this.sMIDUniverseData); } else if (indexId == 208) {
        tempsub = this.sharedData.EqGrowthData.pipe(first()).subscribe(res => {
          if (res.length > 0) {
            indList = [...res];
            if (tempsub)
              tempsub.unsubscribe;
            return resolve(indList);
          }
        })
      } else if (indexId == 209) {
        tempsub = this.sharedData.EqValueData.pipe(first()).subscribe(res => {
          if (res.length > 0) {
            indList = [...res];
            if (tempsub)
              tempsub.unsubscribe;
            return resolve(indList);
          }
        })
      } else if (this._selGICS.indexName == "S&P 1500") {
        indList = [...this.sharedData._selResData].filter(function (d) { return d.indexName == "S&P 500" || d.indexName == "S&P 600" || d.indexName == "S&P 400" });
        return resolve(indList);
      } else {
        indList = this.groupBy(this.sharedData._selResData, 'indexName')[this._selGICS.indexName];
        return resolve(indList);
      }
    });
  }

  groupBy(xs: any, key: any) {
    return xs.reduce(function (rv: any, x: any) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  getMedvalue(comp: any, code: any, ind: any) {
    var that = this;
    var med = '0.0';
    if (comp == null || comp == undefined || comp.length == 0) { med = '0.0'; } else {
      var filtercomp = comp.filter((x: any) => x.industry.toString().substring(0, ind) == code);
      if (filtercomp.length > 0) { med = format(".1f")(that.getMedScore(filtercomp)); }
      else { med = '0.0' }
    }
    return med;
  }

  getMedScore(data: any): any { return median(data, (d: any) => d.score); }

  HFCompanyTxt(data: any, showHFCompanyRanges: any) {
    var that = this;
    var scores = (data.score / 100);

    if (scores >= 0 && scores <= 0.25) {
      if (showHFCompanyRanges.range0_25 == true) { return 'HFCompRange0_25 HF_active' }
      else { return 'HFCompRange0_25' }
    }
    else if (scores >= 0.25 && scores <= 0.50) {
      if (showHFCompanyRanges.range25_50 == true) { return 'HFCompRange25_50 HF_active' }
      else { return 'HFCompRange25_50' }
    }
    else if (scores >= 0.50 && scores <= 0.75) {
      if (showHFCompanyRanges.range50_75 == true) { return 'HFCompRange50_75 HF_active' }
      else { return 'HFCompRange50_75' }
    }
    else if (scores >= 0.75 && scores <= 1) {
      if (showHFCompanyRanges.range75_100 == true) { return 'HFCompRange75_100 HF_active' }
      else { return 'HFCompRange75_100' }
    } else { return '' }
  }

  txtx(d: any) { return ((d.cx) > 90) ? "-222" : "222"; }
  txtx1(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx1d(d: any) { return ((d.rx) > 90) ? "-190" : "188"; }
  txtx2(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx3(d: any) { return ((d.cx) > 90) ? "-192" : "192"; }
  txttrans(d: any) { return ((d.cx) > 90) ? "rotate(180)" : null; }
  txtanch(d: any) { return ((d.cx) > 90) ? "end" : null; }

  measureText(string: any, fontSize = 9) {
    const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
    const avg = 0.5279276315789471
    return string
      .split('')
      .map((c: any) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur: any, acc: any) => acc + cur) * fontSize
  }

  checkFillCompCreation() {
    var that = this;
    if (that._breadcrumbdata.length < 2) { return false }
    else { return true }
  }

  CurrentAllocId: any;
  GetAllocScores1: any;
  GetAlloc() {
    var that = this;
    return new Promise((resolve, reject) => {
      var indexType: string = "Equity";
      var GICSId: number = 0;
      var top = 1;
      var range: any = ((100 - that._SRValue) / 100);
      var IndexId = that.getMyIndexId(this._selGICS);
      if (that._SRValue > 0 && that._SRValue < 100) {
        let SelIndId = that.checkSelIndId(that._breadcrumbdata);
        if (that._breadcrumbdata.length > 0) {
          if (SelIndId == 0) { GICSId = 0 }
          //else { GICSId = that._breadcrumbdata[that._breadcrumbdata.length - 1].code; }
        }
        let LoadFromSer = true;
        if (that.CurrentAllocId != "") { if (that.CurrentAllocId == IndexId) { LoadFromSer = false; } };
        if (LoadFromSer) {
          var d = new Date(that.sharedData.equityHoldDate);
          var GetAllocDate = d.getFullYear().toString() + that.sharedData.formatedates(d.getMonth() + 1).toString() + that.sharedData.formatedates(d.getDate()).toString();
          try { that.GetAllocScores1.unsubscribe(); } catch (e) { }
          that.GetAllocScores1 = that.dataService.GetAllocScores(GetAllocDate, GICSId, range, IndexId, top, indexType).pipe(first()).subscribe((res: any) => {
            if (res.length == 0 || res[0].toString().indexOf('error') > -1) {
              //that.snackBar.open('Data not available', '', { duration: 3000 });
              //d3.selectAll("#resetAL").dispatch("click");
              that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'resetDrag'); 
              this.logger.logError(res, 'GetAllocScores');
            }
            else {
              let resData: any = [];
              that.CurrentAllocId = IndexId;
              res.forEach(function (d: any) {
                //d.countrygroup = d.indexName.indexOf('Europe') > -1 ? 'Europe' : d.country;
                //d.US = (d.country == 'USA') ? 'USA' : '';
                d.score = d.scores * 100;
                //d.deg = d.score;
                //d.indname = that.findIndName(that._dbGICS, d.industry);
                //d.industry = d.industry + "";
                //d.companyName = d.companyName != null ? that.transformToTitleCase(d.companyName.trim()) : "";
                //d.company = d.companyName != null ? d.companyName : null;
                //d.ticker = d.ticker;
                //d.stockKey = d.stockKey;
                //d.aisin = d.isin;
                //d['ALNaaIndex'] = 0;
                //d.isin = "a" + d.stockKey;
                //d.Fixeds = "";
                resData.push(d);
              });
              //resData = resData.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
              this.CurrentAllocComps.next(resData);
              resolve(resData);
            }
          }, (error: any) => {
            this.logger.logError(error, 'GetAllocScores');
            that.openDirectErrorComp('Error', 'etfPerformance', 'performanceError', 'resetDrag'); 
            resolve([]);
          });
        } else { resolve(this._CurrentAllocComps); };
      }
    });
  }

  getMyIndexId(d: any) {
    var indexId: number = 137;
    if (isNullOrUndefined(d) || d['group'] == "Home") { indexId = 137; }
    else {
      var equityDt: any = this.cusIndexService.equityIndexeMasData.value;
      if (d['group'] == "Country") {
        var conFil: any = equityDt.filter((x: any) => x.country == d.name);
        if (conFil.length > 0) { indexId = conFil[0]['countryId']; }
      } else {
        var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "Index");
        if (ind > -1) {
          var indFil: any = equityDt.filter((x: any) => x.name == this._breadcrumbdata[ind].name);
          if (indFil.length > 0) { indexId = indFil[0]['indexId']; }
        }
      }
    }
    return indexId;
  }

  currentAllocation(res: any) {
    let that = this;
    let result: any = [];
    let group: any = null;
    var val = 100 - that._SRValue;
    return new Promise((resolve, reject) => {
      if (that._breadcrumbdata.length > 0) group = that._selGICS;
      if (isNotNullOrUndefined(group) && isNotNullOrUndefined(group['code'])) {
        if (group['type'] == "Sector") {
          result = res.filter(function (d: any) { return d.industry.toString().substring(0, 2) == group['code']; });
        }
        else if (group['type'] == "Industrygroup") {
          result = res.filter(function (d: any) { return d.industry.toString().substring(0, 4) == group['code']; });
        }
        else if (group['type'] == "Industry") {
          result = res.filter(function (d: any) { return d.industry.toString().substring(0, 6) == group['code']; });
        }
        else if (group['type'] == "Sub Industry") {
          result = res.filter(function (d: any) { return d.industry.toString() == group['code']; });
        }
        res = result;
      }
      var resData = []
      resData = res.sort(function (x: any, y: any) { return ascending(parseFloat(x.score), parseFloat(y.score)); });
      let TotWt = sum(resData.map(function (d: any) { return (1 - d.scores); }));
      resData.forEach(function (d: any, i: any) {
        d.Wt = ((1 - d.scores) / TotWt) * 100;
        d.cx = ((i * 360 / resData.length) - 90);
        return d;
      });

      let GridDtLength = (resData.length * val) / 100;
      var addedCompanies = [...resData].slice(0, GridDtLength);
      var removedCompanies = [...resData].slice(GridDtLength, [...resData].length);
      resolve({ addedCompanies: addedCompanies, removedCompanies: removedCompanies, resData: resData })
    });
  }

  GetIndId(TabId: any, GICS: any) {
    if (TabId == 0 || GICS == 0) { GICS = 0; return GICS; }
    else if (TabId > 0) { return GICS.substring(0, TabId * 2); }
  }
  clkdRgeText: string = "top";
  AVCheckPerfBefore: any;
  AVcheckPerfAfter: any;
  AVcheckPerfData: any;
  GetIndRunsPerfDate: any;
  getPerformanceData(assgUserDrpVal: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var CType: string = 'MC';
      var GICSId: number = 0;
      var IndexId = this.getMyIndexId(this._selGICS);
      if (IndexId > 0) {
        var naa = 100 - assgUserDrpVal;
        let SelIndId = that.checkSelIndId(that._breadcrumbdata);
        if (that._breadcrumbdata.length > 0) {
          if (SelIndId == 0) { GICSId = 0 }
          else { GICSId = that._breadcrumbdata[that._breadcrumbdata.length - 1].code; }
        }

        if (isNaN(GICSId)) { GICSId = 10; }
        var srVal: any = that.SRValue.value;
        if (srVal != 100) { srVal = 100 - srVal; }
        var d = new Date(that.sharedData.equityHoldDate);
        var GetAllocDate = d.getFullYear().toString() + "-" + that.sharedData.formatedates(d.getMonth() + 1).toString() + "-" + that.sharedData.formatedates(d.getDate()).toString();
        that.AVCheckPerfBefore = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': GetAllocDate };
        if (that.AVcheckPerformanceload() && isNotNullOrUndefined(GetAllocDate)) {
          that.AVcheckPerfAfter = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': GetAllocDate };
          try { that.GetIndRunsPerfDate.unsubscribe(); } catch (e) { }
          that.GetIndRunsPerfDate=that.dataService.GetIndexRunsPerformanceDate(IndexId, GICSId, CType, (that.clkdRgeText + parseInt(srVal)), naa, assgUserDrpVal, GetAllocDate).pipe(first()).subscribe((PortfolioData: any) => {
            that.AVcheckPerfData = PortfolioData;
            this.performanceUIndexList.next(PortfolioData);
            //console.log('PortfolioData', PortfolioData);
            resolve(PortfolioData)
            //try { that.performanceLoad(PortfolioData); } catch (e) { }
            this.logger.log('success', 'GetIndexRunsPerformanceDate');
          }, (error: any) => { reject(); this.logger.logError(error, 'GetIndexRunsPerformanceDate'); that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'resetDrag'); });
        } else {
          if (isNotNullOrUndefined(that.AVcheckPerfData) && that.AVcheckPerfData.length > 0) {
            this.performanceUIndexList.next(that.AVcheckPerfData);
            resolve(that.AVcheckPerfData)
          } else { reject() }
        }
      } else { reject() }
    });
  }

  checkSelIndId(breadcrumbdata: any) {
    var SelIndId = 0;
    let indGroup = breadcrumbdata.length > 0 ? breadcrumbdata[breadcrumbdata.length - 1].group : "0";
    if (indGroup == "Sector") { SelIndId = 1; }
    else if (indGroup == "Industrygroup") { SelIndId = 2; }
    else if (indGroup == "Industry") { SelIndId = 3; }
    else if (indGroup == "Sub Industry") { SelIndId = 4; }
    return SelIndId;
  }

  AVcheckPerformanceload() {
    if (isNullOrUndefined(this.AVCheckPerfBefore) || isNullOrUndefined(this.AVcheckPerfAfter)) { return true }
    else if (this.AVCheckPerfBefore.indexid == this.AVcheckPerfAfter.indexid
      && this.AVCheckPerfBefore.GICSid == this.AVcheckPerfAfter.GICSid
      && this.AVCheckPerfBefore.Ctype == this.AVcheckPerfAfter.Ctype
      && this.AVCheckPerfBefore.Range == this.AVcheckPerfAfter.Range
      && this.AVCheckPerfBefore.naa == this.AVcheckPerfAfter.naa
      && this.AVCheckPerfBefore.assgUserDrpVal == this.AVcheckPerfAfter.assgUserDrpVal
      && this.AVCheckPerfBefore.date == this.AVcheckPerfAfter.date) { return false } else { return true }
  }

  index: any = [[55555555,7], [66666666,2], [11111111,157], [99999999,159], [10101010,155]];
  AVcheckIndexPerfData: any = {};
  GetIndPerf: any;
  GetIndRunsPerf: any;
  getPerformanceDataIndex(assgUserDrpVal: any) {
    var that = this;
    var CType: string = 'MC';
    var GICSId: number = 0;
    var IndexId = this.getMyIndexId(this._selGICS);
    var selIndex = 0;
    var Gi: any = this.index.filter((x: any) => x[0] == this._selGICS['assetId']); 
    if (Gi.length > 0) { selIndex = Gi[0][1]; }
    return new Promise((resolve, reject) => {
      if (IndexId > 0) {
        var naa = 100 - assgUserDrpVal;
        let SelIndId = that.checkSelIndId(that._breadcrumbdata);
        if (that._breadcrumbdata.length > 0) {
          if (SelIndId == 0) { GICSId = 0 }
          else { GICSId = that._breadcrumbdata[that._breadcrumbdata.length - 1].code; }
        }
        if (isNaN(GICSId)) { GICSId = 10; }
        var srVal: any = that.SRValue.value;
        if (srVal != 100) { srVal = 100 - srVal; }
        that.AVCheckPerfBefore = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': IndexId };
        if (that.AVcheckPerformanceload()) {
          that.AVcheckPerfAfter = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': IndexId };
          try { that.GetIndPerf.unsubscribe(); } catch (e) { }
          that.dataService.GetIndexPerformance(selIndex).subscribe((portIndexData: any) => {
            that.AVcheckIndexPerfData.portIndexData = portIndexData;
            try { that.GetIndRunsPerf.unsubscribe(); } catch (e) { }
            that.dataService.GetIndexRunsPerformance(IndexId, GICSId, CType, (that.clkdRgeText + parseInt(srVal)), naa, assgUserDrpVal).pipe(first()).subscribe((PortfolioData: any) => {
              that.AVcheckIndexPerfData.PortfolioData = PortfolioData;
              this.performanceUIndexList.next(PortfolioData);
              resolve([portIndexData, PortfolioData])
            }, (error: any) => {
              reject()
              this.logger.logError(error, 'GetIndexRunsPerformance');
              this.performanceUIndexList.next([]);
              that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'resetDrag'); 
            });
          }, (error: any) => {
            this.performanceUIndexList.next([]);
            that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'resetDrag'); 
            this.logger.logError(error, 'GetIndexPerformance');

            reject()
          });
        } else {
          if (isNotNullOrUndefined(that.AVcheckIndexPerfData.portIndexData) &&
            isNotNullOrUndefined(that.AVcheckIndexPerfData.PortfolioData) &&
            that.AVcheckIndexPerfData.PortfolioData.length > 0
          ) { resolve([this.AVcheckIndexPerfData.portIndexData, this.AVcheckIndexPerfData.PortfolioData]) }
        }
      }
    });
  }

  globalIndCompSrc(d:any) {
    this.SRValue.next(0);
    var grp: any = this.buildEquityBridcrum(d);
    this.selGICS.next(grp[1]);
    this.breadcrumbdata.next(grp[0]);
    this.selComp.next(grp[2]);
    try {
      if (isNotNullOrUndefined(grp[2])) {
        this.sharedData.userEventTrack('Equity Universe', grp[2].ticker, grp[2].ticker, 'Global Search Click');
      } else {
        this.sharedData.userEventTrack('Equity Universe', grp[1].name, grp[1].name, 'Global Search Click');
      }
    } catch (e) { }
  }


  buildEquityBridcrum(item:any) {
    var bCrum: any = [];
    var selGic: any;
    var company: any;
    var index: any=[];    
    if (isNotNullOrUndefined(item['indexName'])) {
      index = this.cusIndexService._equityIndexeMasData.filter((x: any) => x.name == item['indexName']);
      company = item;
    } else { index = this.cusIndexService._equityIndexeMasData.filter((x: any) => x.name == item.name); }
    if (index.length > 0) {
      selGic = index[0];
      bCrum.push({ name: selGic['country'], group: 'Country', indexType: "Equity Universe" })
      bCrum.push(selGic);
    }
    return [bCrum, selGic, company];
  }

  checkMedColor(data: any, med: any) {
    var medVal = parseFloat(med);
    data = data.sort(function (x: any, y: any) { return ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = scaleLinear().domain([0, data.length]).range([0, 100]);
    var index = data.filter((x: any) => x.score <= medVal);
    var perVal = per(index.length);
    if (data.length <= 1) { perVal = 0; }
    return perVal;
  }

  PostAllocAlertList(indexAdd: boolean, countryAdd: boolean, sectorAdd: boolean, Type: string) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var indexname: string = "";
    var industry: string = "";
    var countrygroup: string = "";
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "Index");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }
    var group: string = '';
    if (isNotNullOrUndefined(this._selGICS) && isNotNullOrUndefined(this._selGICS['group'])) { group = this._selGICS['group']; }

    if (group == "Sector" || group == "Industrygroup" || group == "Industry" || group == "Sub Industry") {
      industry = (isNotNullOrUndefined(this._selGICS['code'])) ? this._selGICS['code']:'';
    }
    if (group == "Country") { countrygroup = this._selGICS['name'] }
    
    if (that._SRValue != 0) {
      var Alloclistdtls = {
        userid: userid,
        category: "Equity Universe",
        assets: "",
        stockkey: "",
        isin: "",
        countrygroup: countrygroup,
        indexname: indexname,
        industry: industry,
        range: that._SRValue,
        indexAdd: indexAdd,
        countryAdd: countryAdd,
        sectorAdd: sectorAdd,
        type: Type
      }
      if (that._breadcrumbdata[that._breadcrumbdata.length - 1]['group'] == "Index") {
        Alloclistdtls.indexname = that._breadcrumbdata[that._breadcrumbdata.length - 1]['name'];
        Alloclistdtls.countrygroup = that._breadcrumbdata[that._breadcrumbdata.length - 1]['country'];
      }

     that.dataService.UpdateAllocAlertList(Alloclistdtls).pipe(first()).subscribe(
          (data: any) => {
         if (data[0] != "Failed") {
           that.sharedData.FillAlloclist();
              var Title = "";
              var Message = "";
              if (data[0] == "Success") {
                that.sharedData.enableAllocAlertlist();
                if (Type == "Index") {
                  Title = Alloclistdtls.indexname;
                  Message = "Added to Alertlist"
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else if (Type == "Country") {
                  Title = countrygroup;
                  Message = "Added to Alertlist"
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else {
                  Title = that._breadcrumbdata[that._breadcrumbdata.length - 1]['name'];
                  Message = "Added to Alertlist"
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
              }

              if (data[0] == "Updated") {
                that.sharedData.enableAllocAlertlist();
                if (Type == "Index") {
                  Title = Alloclistdtls.indexname;
                  Message = "Updated to Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else if (Type == "Country") {
                  Title = countrygroup;
                  Message = "Updated to Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else {
                  Title = that._breadcrumbdata[that._breadcrumbdata.length - 1]['name'];
                  Message = "Updated to Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
              }

              if (data[0] == "Removed") {
                that.sharedData.disableAllocAlertlist();
                if (Type == "Index") {
                  Title = Alloclistdtls.indexname;
                  Message = "Removed from Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else if (Type == "Country") {
                  Title = countrygroup;
                  Message = "Removed from Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
                else {
                  Title = that._breadcrumbdata[that._breadcrumbdata.length - 1]['name'];
                  Message = "Removed from Alertlist";
                  that.toastr.info(Title + ' ' + Message, '', { timeOut: 4000, progressBar: false, positionClass: "toast-top-center" });
                }
              }            
            }
       }, (error: any) => { this.logger.logError(error, 'UpdateAllocAlertList'); that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'resetDrag'); });
    }
  }

  openAllocDialog() {
    var that = this;
    let indexname: string = "";
    let countryname: string = "";
    let countryAdded: boolean = false;
    let sectorAdded: boolean = false;
    let IndexAdded: boolean = false;

    var selGICS: any = this._selGICS;
    var group: string = "";

    if (isNotNullOrUndefined(selGICS) && isNotNullOrUndefined(selGICS['group'])) {
      group = selGICS['group'];
      if (selGICS['group'] == "Country") {
        countryname = selGICS.name;
        countryAdded = true;
      }else if (selGICS['group'] == "Index") {
        indexname = selGICS['name'];
        IndexAdded = true;
      }
    }
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "Index");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }

    var lastrootpath: any = this._selGICS;
    if (countryAdded) {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
        countryAdded = false;
      } else { countryAdded = true; }
      that.PostAllocAlertList(false, countryAdded, false, 'Country');
    }else if (group == "Index") {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "Equity Universe" && x.industry == null).length > 0) {
        IndexAdded = false;
      } else { IndexAdded = true; }
      that.PostAllocAlertList(IndexAdded, false, false, 'Index');
    }else if (that._breadcrumbdata.length > 0) {
      if (group == "Sector" || group == "Industrygroup" || group == "Industry" || group == "Sub Industry") {
        if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.industry == lastrootpath['code']).length > 0) {
          sectorAdded = false;
        } else { sectorAdded = true; }
        that.PostAllocAlertList(false, false, sectorAdded,'Sector');
      }
    }
  }

  checkAllocAlertlist() {
    var that = this;
    let indexname = "";
    let country = "";
    let countryname = "";
    var selGICS: any = this._selGICS;
    var group: string = "";
    if (isNotNullOrUndefined(selGICS) && isNotNullOrUndefined(selGICS['group'])) {
      group = selGICS['group'];
      if (selGICS['group'] == "Country") {
        country = "Y";
        countryname = selGICS.name;
      } else if (selGICS['group'] == "Index") {
        indexname = selGICS['name'];
      }
    }

    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "Index");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }
    return new Promise((resolve, reject) => {
      if (that.sharedData._AllocListData.length > 0 && that._SRValue > 0 && that._SRValue < 100) {
        var lastrootpath: any = "";
        if (country == "Y") {
          if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
            that.sharedData.enableAllocAlertlist();
            resolve(true);
          } else { resolve(false); }
        } else if (group == "Index") {
          if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "Equity Universe" && x.industry == null).length > 0) {
            that.sharedData.enableAllocAlertlist();
            resolve(true);
          } else { resolve(false); }
        } else if (that._breadcrumbdata.length > 0) {
          lastrootpath = that._breadcrumbdata[that._breadcrumbdata.length - 1];
          if (group == "Sector" || group == "Industrygroup" || group == "Industry" || group == "Sub Industry") {
            if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.industry == lastrootpath['code']).length > 0) {
              that.sharedData.enableAllocAlertlist();
              resolve(true);
            } else { resolve(false); }
          } else { resolve(false); }
        }
      }
    });
  }

  UpdateAllocDialog(): void {
    var that = this;
    let indexname: string = "";
    let countryname: string = "";
    let countryAdded: boolean = false;
    let sectorAdded: boolean = false;
    let IndexAdded: boolean = false;

    var selGICS: any = this._selGICS;
    var group: string = "";

    if (isNotNullOrUndefined(selGICS) && isNotNullOrUndefined(selGICS['group'])) {
      group = selGICS['group'];
      if (selGICS['group'] == "Country") {
        countryname = selGICS.name;
        countryAdded = true;
      } else if (selGICS['group'] == "Index") {
        indexname = selGICS['name'];
        IndexAdded = true;
      }
    }
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "Index");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }

    var lastrootpath: any = this._selGICS;
    if (countryAdded) {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
        countryAdded = false;
      } else { countryAdded = true; }
      that.PostAllocAlertList(false, countryAdded, false, 'Country');
    } else if (group == "Index") {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "Equity Universe" && x.industry == null).length > 0) {
        IndexAdded = false;
      } else { IndexAdded = true; }
      that.PostAllocAlertList(IndexAdded, false, false, 'Index');
    } else if (that._breadcrumbdata.length > 0) {
      if (group == "Sector" || group == "Industrygroup" || group == "Industry" || group == "Sub Industry") {
        if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.industry == lastrootpath['code']).length > 0) {
          sectorAdded = false;
        } else { sectorAdded = true; }
        that.PostAllocAlertList(false, false, sectorAdded, 'Sector');
      }
    }
  }

  openDirectErrorComp(title_D:string, from_D:string, error_D:string, destination_D:string  ) {
    var title = title_D;
    var options = { from: from_D, error: error_D, destination: destination_D };
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
  }

  countryCheckClick(d: any) {
    return new Promise((resolve, reject) => {
      if (isNotNullOrUndefined(d) && d['group'] == 'Country') {
        this.getEquityLevelData().then((res: any) => {
          if (isNotNullOrUndefined(res['menuData']) && res['menuData'].length == 1) {
            resolve([true, res['menuData'][0]])
          } else { resolve([false, d]) }
        })
      } else { resolve([false, d]) }
    });
  }

  GetIndexPreRunsCustomBP1: any;
  getAnnumValue() {
    var that = this;
    var CType = 'MC';
    var GICSId: any;
    let SelIndId = that.checkSelIndId(that._breadcrumbdata);
    if (SelIndId == 0) GICSId = 0;
    else GICSId = that._breadcrumbdata[that._breadcrumbdata.length - 1].code;
    if (isNaN(GICSId)) { GICSId = 10; }
    var IndexId = that.getMyIndexId(this._selGICS);
    return new Promise((resolve, reject) => {
      if (this._indexPreRunCustomData.length > 0 && this._indexPreRunCustomData[0]['GICSId'] == GICSId && this._indexPreRunCustomData[0]['IndexId'] == IndexId) {
        resolve(this._indexPreRunCustomData)
      } else {
        try { this.GetIndexPreRunsCustomBP1.unsubscribe(); } catch (e) { }
        this.GetIndexPreRunsCustomBP1 = this.dataService.GetIndexPreRunsCustomBP(IndexId, GICSId, CType).pipe(first())
          .subscribe((data: any) => { this.indexPreRunCustomData.next(data); resolve(data) }, (error: any) => { this.logger.logError(error, 'GetIndexPreRunsCustomBP'); resolve([]); });
      };
    });
  }

  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.globalIndCompSrc(value); }
    }
  }

  resetService() {
    this.selGICS.next(undefined);
    this.selComp.next(undefined);
    this.SRValue.next(0);
    this.breadcrumbdata.next([]);
    this.rightGridData.next([]);
    this.avoidLoserData.next([]);
    this.CurrentAllocComps.next([]);
    this.performanceUIndexList.next([]);
    this.indexPreRunCustomData.next([]);
    this.showHFCompanyRanges = { selectedPin: false, UOpricestockPin: false, range0_25: false, range25_50: false, range50_75: false, range75_100: false };
    this.CurrentAllocId = undefined;
    this.AVCheckPerfBefore = undefined;
    this.AVcheckPerfAfter = undefined;
    this.AVcheckPerfData = undefined;
    this.GetIndexPreRunsCustomBP1 = undefined;
  }
}
