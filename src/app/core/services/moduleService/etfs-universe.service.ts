import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../sharedData/shared-data.service';
import { DataService } from '../data/data.service';
import { LoggerService } from '../logger/logger.service';
import { ascending, format, median, sum, scaleLinear } from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from '../../../view/direct-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Router, RoutesRecognized } from '@angular/router';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class EtfsUniverseService {
  selGICS: BehaviorSubject<any>;
  _selGICS: any;

  showHFCompanyRanges: any = { selectedPin: false, UOpricestockPin: false, range0_25: false, range25_50: false, range50_75: false, range75_100: false };

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

  selResETFData: BehaviorSubject<any>;
  _selResETFData: any = [];

  getCumulativeAnnData: BehaviorSubject<any>
  _getCumulativeAnnData: any = [];

  triggerCumulativeLinechart: BehaviorSubject<boolean>
  _triggerCumulativeLinechart: boolean = false;

  ETFlvl = ["Home", "Category", "ETFIndex", "Sector", "Industrygroup", "Industry", "Sub Industry"];

  performanceUIndexList: BehaviorSubject<any>
  _performanceUIndexList: any = [];

  indexPreRunCustomData: BehaviorSubject<any>;
  _indexPreRunCustomData: any = [];

  constructor(private router: Router, private toastr: ToastrService, private sharedData: SharedDataService, private logger: LoggerService, public dataService: DataService, public dialog: MatDialog,) {

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

    this.selResETFData = new BehaviorSubject<any>(this._selResETFData);
    this.selResETFData.subscribe(data => { this._selResETFData = data; });

    this.performanceUIndexList = new BehaviorSubject<any>(this._performanceUIndexList);
    this.performanceUIndexList.subscribe(data => { this._performanceUIndexList = data; });

    this.getCumulativeAnnData = new BehaviorSubject<any>(this._getCumulativeAnnData);
    this.getCumulativeAnnData.subscribe(data => { this._getCumulativeAnnData = data; });

    this.triggerCumulativeLinechart = new BehaviorSubject<any>(this._triggerCumulativeLinechart);
    this.triggerCumulativeLinechart.subscribe(data => { this._triggerCumulativeLinechart = data; });
  }

  checkFillCompCreation() {
    var that = this;
    if (that._breadcrumbdata.length < 2) { return false }
    else { return true }
  }

  GetETFMed(ctname: string) {
    var equityIndexeMasData: any = this.sharedData.ETFIndex.value;
    var medianCont: any = equityIndexeMasData.filter((x: any) => x.category == ctname).map((x: any) => (x.medianCont * 100))
    return median(medianCont);
  }

  getETFsLevelData() {
    var that = this;
    var level = this.selGICS.value;
    var equityIndexeMasData: any = this.sharedData.ETFIndex.value;
    equityIndexeMasData = equityIndexeMasData.sort(function (x: any, y: any) { return ascending(x.sort, y.sort); });
    if (isNullOrUndefined(level) || isNullOrUndefined(level['group']) || level == "") { level = { group: 'Home', indexType: "Exchange Traded Funds" } };
    return new Promise((resolve, reject) => {
      var lvl: number = that.ETFlvl.indexOf(level.group) + 1;
      switch (level.group) {
        case ("Home"): {
          try { that.getAlloc2.unsubscribe(); } catch (e) { }
          try { that.getAlloc1.unsubscribe(); } catch (e) { }
          var category: any = [...new Set(equityIndexeMasData.map((x: any) => x.category))];
          var matchData: any = [];
          var medianCont: any = median(equityIndexeMasData.map((x: any) => (x.medianCont * 100)))
          if (category.length > 0) {
            matchData.push({ name: 'All', group: "Category", med: medianCont, indexType: 'Exchange Traded Funds' });
            category.forEach((item: any) => {
              matchData.push({ name: item, group: "Category", med: that.GetETFMed(item), indexType: 'Exchange Traded Funds' })
            });
          }
          this.sharedData.GetScoresIndex().then((res: any) => {
            resolve({ 'menuData': [...matchData], 'CompanyList': [...res] }); 
          }).catch(() => {
            resolve({ 'menuData': [...matchData], 'CompanyList': [...that.sharedData._selResData] }); 
          }); 
          break;
        }
        case ("Category"): {
          try { that.getAlloc2.unsubscribe(); } catch (e) { }
          try { that.getAlloc1.unsubscribe(); } catch (e) { }
          var index: any = equityIndexeMasData.filter((x: any) => x.category == that._selGICS.name);
          var matchData: any = index.map((item: any) => ({
            name: item.etfName,
            group: 'ETFIndex',
            med: (format(".1f")(item.medianCont * 100)),
            indexType: 'Exchange Traded Funds',
            ...item
          }));
          if (that._selGICS.name == 'All') {
            matchData = equityIndexeMasData.map((item: any) => ({
              name: item.etfName,
              group: 'ETFIndex',
              med: (format(".1f")(item.medianCont * 100)),
              indexType: 'Exchange Traded Funds',
              ...item
            }));
          }
          this.sharedData.GetScoresIndex().then((res: any) => {
            resolve({ 'menuData': [...matchData], 'CompanyList': [...res] });
          }).catch(() => {
            resolve({ 'menuData': [...matchData], 'CompanyList': [...that.sharedData._selResData] });
          });
          break;
        }
        case ("ETFIndex"): {
          this.rightGridData.next(undefined);
          that.getETFAllocScores(this._selGICS, 0, 'ETF').then(res => {
            var matchData: any = [];
            matchData = [...that.sharedData._dbGICS].filter((x: any) => x.type == that.ETFlvl[lvl]);
            matchData = matchData.map((item: any) => ({
              assetId: that._selGICS.assetId,
              group: that.ETFlvl[lvl],
              med: that.getMedvalue(res, item.code, 2),
              Category: that._selGICS.category,
              indexType: 'Exchange Traded Funds',
              ETFIndex: that._selGICS.etfName,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...res] });
          });
          break;
        }
        case ("Sector"): {
          that.getETFAllocScores(this._selGICS, 0, 'ETF').then((res:any) => {
            var matchData: any = [];
            var filtercomp: any = [...res].filter((x) => JSON.stringify(x.industry).substring(0, 2) == JSON.stringify(that._selGICS.code));
             matchData = [...that.sharedData._dbGICS].filter((x: any) => x.type == that.ETFlvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0);
            matchData = matchData.map((item: any) => ({
              assetId: that._selGICS.assetId,
              group: that.ETFlvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 4),
              Category: that._selGICS.Category,
              indexType: 'Exchange Traded Funds',
              ETFIndex: that._selGICS.ETFIndex,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Industrygroup"): {
          that.getETFAllocScores(this._selGICS, 0, 'ETF').then(res => {
            var matchData = [];
            var filtercomp = [...res].filter((x) => JSON.stringify(x.industry).substring(0, 4) == JSON.stringify(that._selGICS.code));
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.ETFlvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
            matchData = matchData.map((item: any) => ({
              assetId: that._selGICS.assetId,
              group: that.ETFlvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 6),
              Category: that._selGICS.Category,
              indexType: 'Exchange Traded Funds',
              ETFIndex: that._selGICS.ETFIndex,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Industry"): {
          that.getETFAllocScores(this._selGICS, 0, 'ETF').then(res => {
            var matchData: any = [];
            var filtercomp = [...res].filter((x) => JSON.stringify(x.industry).substring(0, 6) == JSON.stringify(that._selGICS.code));
            matchData = [...that.sharedData._dbGICS.filter((x: any) => x.type == that.ETFlvl[lvl] && x.code.toString().indexOf(that._selGICS.code) == 0)];
            matchData = matchData.map((item: any) => ({
              assetId: that._selGICS.assetId,
              group: that.ETFlvl[lvl],
              med: that.getMedvalue(filtercomp, item.code, 8),
              Category: that._selGICS.Category,
              indexType: 'Exchange Traded Funds',
              ETFIndex: that._selGICS.ETFIndex,
              ...item
            }));
            matchData = matchData.filter((x: any) => parseFloat(x.med) > 0);
            resolve({ 'menuData': [...matchData], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        case ("Sub Industry"): {
          that.getETFAllocScores(this._selGICS, 0, 'ETF').then(res => {
            var filtercomp = [...res].filter((x) => JSON.stringify(x.industry).substring(0, 8) == JSON.stringify(that._selGICS.code));
            resolve({ 'menuData': [], 'CompanyList': [...filtercomp] });
          });
          break;
        }
        default: {
          try { that.getAlloc2.unsubscribe(); } catch (e) { }
          try { that.getAlloc1.unsubscribe(); } catch (e) { }
          resolve(undefined)
          break;
        }
      }
    });
  }

  getMedScore(data: any): any { return median(data, (d: any) => d.scores *100); }

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

  getAlloc1: any;
  getETFAllocScores(da: any, range: any, indexType: any) {
    var that = this;    
    return new Promise<any>((resolve, reject) => {
      if (that.checkSelResETFDataCall(da.assetId)) {
        var top: any = 1;
        var daTe = [...this.sharedData._ETFIndex].filter(x => x.assetId == da.assetId)[0].holdingsdate;
        var d: any = new Date(daTe);
        d.setDate(d.getDate() + 1);
        var GetAllocDate = d.getFullYear().toString() + this.sharedData.formatedates(d.getMonth() + 1).toString() + this.sharedData.formatedates(d.getDate()).toString();
        try { that.getAlloc1.unsubscribe(); } catch (e) { }
        that.getAlloc1 = that.dataService.GetAllocScores(GetAllocDate, da.assetId, range, 123, top, indexType).pipe(first()).subscribe((res: any) => {
          if (res.length == 0 || res[0].toString().indexOf('error') > -1) {
            that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'moveToHome');
            this.logger.logError(res, 'GetAllocScores');
            resolve([]);
          }
          else {
            var resData: any = [...res];
            resData.forEach((item: any) => {
              item['scores']= item.hfScores;
              item['score']=item.hfScores * 100;
              item['assetId']=da.assetId;
              return item
            });
            that.selResETFData.next(resData);
            resolve(resData);
          }
        }, error => {
          that.openDirectErrorComp('Error', 'equityPerformance', 'performanceError', 'moveToHome');
          this.logger.logError(error, 'GetAllocScores');
          reject([])
        });
      } else { resolve([...that._selResETFData]); }
    });
  }

  checkSelResETFDataCall(assetId: any) {
    if (this._selResETFData == null || this._selResETFData == undefined || this._selResETFData.length == 0) { return true }
    else { if (isNotNullOrUndefined(assetId) && this._selResETFData[0].assetId == assetId) { return false } else { return true } }
  }

  globalEtfIndexSrc(d: any) {
    this.SRValue.next(0);
    var grp: any = this.buildETFBridcrum(d);
    this.selGICS.next(grp[1]);
    this.breadcrumbdata.next(grp[0]);
    this.selComp.next(grp[2]);
    //if (this.sharedData._frmGlobalSearchClick) {
      //this.sharedData.showCircleLoader.next(false);
     // this.sharedData.frmGlobalSearchClick.next(false);
    //}
  }

  buildETFBridcrum(item: any) {
    var bCrum: any = [];
    var selGic: any;
    var company: any;
    var index: any = [];
    bCrum.push({ name: item['category'], group: "Category", med: this.GetETFMed(item['category']), indexType: 'Exchange Traded Funds' })
    index = this.sharedData._ETFIndex.filter((x: any) => x.assetId == item.assetId);
    if (index.length > 0) {
      selGic = index[0];
      selGic['name'] = selGic.etfName;
      selGic['group'] = 'ETFIndex';
      selGic['med'] = (selGic.medianCont * 100);
      selGic['indexType'] = 'Exchange Traded Funds';
      bCrum.push(selGic);
    }
    return [bCrum, selGic, company];
  }

  clkdRgeText: string = "top";
  AVCheckPerfBefore: any;
  AVcheckPerfAfter: any;
  AVcheckPerfData: any;
  GetIndRunsPerfDate:any
  getPerformanceData(assgUserDrpVal: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var CType: string = 'ETF';
      var GICSId: number = this._selGICS['assetId'];
      var IndexId = 123;
      var naa = 100 - assgUserDrpVal;
      var srVal: any = that.SRValue.value;
      if (srVal != 100) { srVal = 100 - srVal; }

      var d = new Date(this._selGICS.holdingsdate);
        var GetAllocDate = d.getFullYear().toString() + "-" + that.sharedData.formatedates(d.getMonth() + 1).toString() + "-" + that.sharedData.formatedates(d.getDate()).toString();
        that.AVCheckPerfBefore = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': GetAllocDate };
        if (that.AVcheckPerformanceload() && isNotNullOrUndefined(GetAllocDate)) {
          that.AVcheckPerfAfter = { 'indexid': IndexId, 'GICSid': GICSId, 'Ctype': CType, 'Range': (that.clkdRgeText + parseInt(srVal)), 'naa': naa, 'assgUserDrpVal': assgUserDrpVal, 'date': GetAllocDate };
          try { that.GetIndRunsPerfDate.unsubscribe(); } catch (e) { }
          that.GetIndRunsPerfDate=that.dataService.GetIndexRunsPerformanceDate(IndexId, GICSId, CType, (that.clkdRgeText + parseInt(srVal)), naa, assgUserDrpVal, GetAllocDate).pipe(first()).subscribe((PortfolioData: any) => {
            that.AVcheckPerfData = PortfolioData;
            this.performanceUIndexList.next(PortfolioData);
            resolve(PortfolioData)
            //try { that.performanceLoad(PortfolioData); } catch (e) { }
            this.logger.log('success', 'GetIndexRunsPerformanceDate');
          }, (error: any) => {
            reject();
            this.logger.logError(error, 'GetIndexRunsPerformanceDate');
            that.openDirectErrorComp('Error', 'etfPerformance', 'performanceError', 'resetDrag');
          });
        } else {
          if (isNotNullOrUndefined(that.AVcheckPerfData) && that.AVcheckPerfData.length > 0) {
            this.performanceUIndexList.next(that.AVcheckPerfData);
            resolve(that.AVcheckPerfData)
          } else { reject() }
      }
    });
  }
  openDirectErrorComp(title_D: string, from_D: string, error_D: string, destination_D: string) {
    var title = title_D;
    var options = { from: from_D, error: error_D, destination: destination_D };
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
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
  getAlloc2: any;
  CurrentAllocId: any;
  GetAlloc() {
    var that = this;
    return new Promise((resolve, reject) => {
      var indexType: string = "ETF";
      var GICSId: number = this._selGICS['assetId'];
      var top = 1;
      var range: any = ((100 - that._SRValue) / 100);
      var IndexId = 123;

      if (that._SRValue > 0 && that._SRValue < 100) {       
        let LoadFromSer = true;
        if (that.CurrentAllocId != "") { if (that.CurrentAllocId == GICSId) { LoadFromSer = false; } };
        if (LoadFromSer) {
          var d = new Date(this._selGICS.holdingsdate);
          var GetAllocDate = d.getFullYear().toString() + that.sharedData.formatedates(d.getMonth() + 1).toString() + that.sharedData.formatedates(d.getDate()).toString();
          try { that.getAlloc2.unsubscribe(); } catch (e) { }
          that.getAlloc2 = that.dataService.GetAllocScores(GetAllocDate, GICSId, range, IndexId, top, indexType).pipe(first()).subscribe((res: any) => {
            if (res.length == 0 || res[0].toString().indexOf('error') > -1) {
              //that.snackBar.open('Data not available', '', { duration: 3000 });
              //d3.selectAll("#resetAL").dispatch("click");
              that.openDirectErrorComp('Error', 'etfPerformance', 'performanceError', 'resetDrag'); 
              this.logger.logError(res, 'GetAllocScores');
            }
            else {
              let resData: any = [];
              that.CurrentAllocId = GICSId;
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
  checkMedColor(data: any, med: any) {
    var medVal = parseFloat(med);
    data = data.sort(function (x: any, y: any) { return ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = scaleLinear().domain([0, data.length]).range([0, 100]);
    var index = data.filter((x: any) => x.score <= medVal);
    var perVal = per(index.length);
    if (data.length <= 1) { perVal = 0; }
    return perVal;
  }
  currentAllocation(res: any) {
    let that = this;
    var val = 100 - that._SRValue;
    return new Promise((resolve, reject) => {     
      var resData = [...res];
      resData = res.sort(function (x: any, y: any) { return ascending(parseFloat(x.scores), parseFloat(y.scores)); });
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

  GetIndexPreRunsCustomBP1: any;
  getAnnumValue() {
    var that = this;
    var CType = 'ETF';
    var IndexId = 123;
    var GICSId: number=0;
    var bIn: any = this._breadcrumbdata.filter((x: any) => x.group == 'ETFIndex');
    if (bIn.length > 0) { GICSId = bIn[0]['assetId']; }
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

  PostAllocAlertList(indexAdd: boolean, countryAdd: boolean, sectorAdd: boolean, Type: string) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var indexname: string = "";
    var industry: string = "";
    var countrygroup: string = "";
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "ETFIndex");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }
    var group: string = '';
    if (isNotNullOrUndefined(this._selGICS) && isNotNullOrUndefined(this._selGICS['group'])) { group = this._selGICS['group']; }

    if (group == "Sector" || group == "Industrygroup" || group == "Industry" || group == "Sub Industry") {
      industry = (isNotNullOrUndefined(this._selGICS['code'])) ? this._selGICS['code'] : '';
    }
    if (group == "Country") { countrygroup = this._selGICS['name'] }

    if (that._SRValue != 0) {
      var Alloclistdtls = {
        userid: userid,
        category: "ETF",
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
      if (that._breadcrumbdata[that._breadcrumbdata.length - 1]['group'] == "ETFIndex") {
        Alloclistdtls.indexname = that._breadcrumbdata[that._breadcrumbdata.length - 1]['name'];
        Alloclistdtls.countrygroup = that._breadcrumbdata[that._breadcrumbdata.length - 1]['country'];
      }

      that.dataService.UpdateAllocAlertList(Alloclistdtls).pipe(first()).subscribe((data: any) => {
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
      } else if (selGICS['group'] == "ETFIndex") {
        indexname = selGICS['name'];
        IndexAdded = true;
      }
    }
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "ETFIndex");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }

    var lastrootpath: any = this._selGICS;
    if (countryAdded) {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
        countryAdded = false;
      } else { countryAdded = true; }
      that.PostAllocAlertList(false, countryAdded, false, 'Country');
    } else if (group == "ETFIndex") {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "ETF" && x.industry == null).length > 0) {
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
      } else if (selGICS['group'] == "ETFIndex") {
        indexname = selGICS['name'];
      }
    }

    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "ETFIndex");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }
    return new Promise((resolve, reject) => {
      if (that.sharedData._AllocListData.length > 0 && that._SRValue > 0 && that._SRValue < 100) {
        var lastrootpath: any = "";
        if (country == "Y") {
          if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
            that.sharedData.enableAllocAlertlist();
            resolve(true);
          } else { resolve(false); }
        } else if (group == "ETFIndex") {
          if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "ETF" && x.industry == null).length > 0) {
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
      } else if (selGICS['group'] == "ETFIndex") {
        indexname = selGICS['name'];
        IndexAdded = true;
      }
    }
    var ind = this._breadcrumbdata.findIndex((x: any) => x.group == "ETFIndex");
    if (ind > -1) { indexname = this._breadcrumbdata[ind].name; }

    var lastrootpath: any = this._selGICS;
    if (countryAdded) {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == null && x.countrygroup == countryname).length > 0) {
        countryAdded = false;
      } else { countryAdded = true; }
      that.PostAllocAlertList(false, countryAdded, false, 'Country');
    } else if (group == "ETFIndex") {
      if ([...that.sharedData._AllocListData].filter(x => x.indexname == indexname && x.category == "ETF" && x.industry == null).length > 0) {
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

  
  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value) && value instanceof Object) { this.globalEtfIndexSrc(value); }
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
    this.selResETFData.next([]);
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
