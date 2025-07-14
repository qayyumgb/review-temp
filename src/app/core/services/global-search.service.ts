import { Injectable } from '@angular/core';
import { EtfsUniverseService } from './moduleService/etfs-universe.service';
import { EquityUniverseService } from './moduleService/equity-universe.service';
import { PrebuildIndexService } from './moduleService/prebuild-index.service';
import { ThematicIndexService } from './moduleService/thematic-index.service';
import { DirectIndexService } from './moduleService/direct-index.service';
import { CustomIndexService } from './moduleService/custom-index.service';
import { Router } from '@angular/router';
import { DataService } from './data/data.service';
import { SharedDataService, isNotNullOrUndefined } from './sharedData/shared-data.service';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  constructor(public sharedData: SharedDataService, private dataService: DataService, private router: Router,
    private cusIndexService: CustomIndexService, private dirIndexService: DirectIndexService,
    private preBuiltService: PrebuildIndexService, private theBuiltService: ThematicIndexService,
    private equityService: EquityUniverseService, private etfService: EtfsUniverseService) {
  }

  etfGlobalIndexSrc(data: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    var index: any = this.sharedData._ETFIndex.filter((x: any) => x.assetId == data['assetId']);
    var currentLoc: boolean = (window.location.pathname.indexOf('etfUniverse') > 0) ? true : false;
    var brmIndex = [...that.etfService.breadcrumbdata.value].filter((x: any) => x.group == 'ETFIndex');
    if (currentLoc && brmIndex.length > 0 && isNotNullOrUndefined(brmIndex[0]['assetId']) && data['assetId'] == brmIndex[0]['assetId']) {
      that.sharedData.showMatLoader.next(false);
      that.sharedData.frmGlobalSearchClick.next(false);
      that.sharedData.showCircleLoader.next(false);
    } else if (index.length > 0) {
      that.sharedData.frmGlobalSearchClick.next(true);
      that.sharedData.showCircleLoader.next(true);
      this.etfService.globalEtfIndexSrc(index[0]);
      this.router.navigate(["/etfUniverse"]);
    } else { that.sharedData.showMatLoader.next(false); }
  }

  equityGlobalIndCompSrc(data: any) {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    that.sharedData.frmGlobalSearchClick.next(true);
    that.sharedData.showCircleLoader.next(true);
    var currentLoc: boolean = (window.location.pathname.indexOf('equityUniverse') > 0) ? true : false;
    var brmIndex = [...that.equityService.breadcrumbdata.value].filter((x: any) => x.group == 'Index');
    if (isNotNullOrUndefined(data['indexName']) && isNotNullOrUndefined(data['category']) && data['category'] == "Index") {
      var index: any = this.cusIndexService._equityIndexeMasData.filter((x: any) => x.name == data['indexName']);
      if (currentLoc && brmIndex.length > 0 && brmIndex[0]['name'] == data['indexName']) {
        that.sharedData.showMatLoader.next(false);
        that.sharedData.frmGlobalSearchClick.next(false);
        that.sharedData.showCircleLoader.next(false);
      } else if (index.length > 0) {
        that.equityService.globalIndCompSrc(index[0]);
        that.router.navigate(["/equityUniverse"]);
      }
    } else if (isNotNullOrUndefined(data['stockKey'])) {
      var comp: any = that.sharedData._selResData.filter((x: any) => x.stockKey == data['stockKey']);
      var compLoc: any = that.equityService._rightGridData.filter((x: any) => x.stockKey == data['stockKey']);
      if (currentLoc && brmIndex.length > 0 && compLoc.length > 0) {
        that.sharedData.showMatLoader.next(false);
        that.sharedData.frmGlobalSearchClick.next(false);
        that.sharedData.showCircleLoader.next(false);
        that.equityService.selComp.next(compLoc[0]);
      } else if (comp.length > 0) {
        that.equityService.globalIndCompSrc(comp[0]);
        that.router.navigate(["/equityUniverse"]);
      }
    }   
  }

  DirectIndexingSrc(d: any) {
    var that = this;
    this.dirIndexService.selCompany.next(undefined);
    this.dirIndexService.notifyDiClick.next(false);    
    if (this.dirIndexService._getBetaIndex_Direct.length > 0) {
      var fObj = this.dirIndexService._getBetaIndex_Direct.filter((du: any) => du.assetId == d.assetId);
      if (fObj.length > 0) { that.directLoad(fObj[0]) } else { console.log(d) };
    } else {
      that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
        if (data1[0] != "Failed") {
          var dtabeta: any;
          dtabeta = data1;
          dtabeta.forEach((x: any) => {
            x.srName = x.name;
            x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
            return x
          });
          that.dirIndexService.getBetaIndex_Direct.next(dtabeta);
          var fObj = [...dtabeta].filter((du: any) => du.assetId == d.assetId);
          if (fObj.length > 0) { that.directLoad(fObj[0]) } else { console.log(d) };
        }
      });
    }
  }

  directLoad(fObj:any) {
    var that = this;
    var currentLoc: boolean = (window.location.pathname.indexOf('directIndexing') > 0) ? true : false;
    if (this.sharedData.checkMyUserType()) { currentLoc = (window.location.pathname.indexOf('approvedStrategies') > 0) ? true : false; }
    var brmIndex = [...that.dirIndexService.directIndexBrcmData.value].filter((x: any) => x.pbGroupType == 'Index' || x.pbGroupType == 'ETFIndex');
    if (currentLoc && brmIndex.length > 0 && brmIndex[0].assetId == fObj.assetId) {
      that.sharedData.showMatLoader.next(false);
      that.sharedData.frmGlobalSearchClick.next(false);
      that.sharedData.showCircleLoader.next(false);
    } else {
      if (this.dirIndexService.startIndexClick_direct.value) { that.dirIndexService.startIndexClick_direct.next(false); }
      this.sharedData.showCenterLoader.next(true);
      if (!currentLoc) { this.sharedData.showMatLoader.next(true); }
      var Obj = Object.assign({}, fObj);
      that.dirIndexService.dirIndSearch(Obj);      
      setTimeout(() => {
        if (that.sharedData.checkMyUserType()) { that.router.navigate(['approvedStrategies']); } else { that.router.navigate(["directIndexing"]); }
      }, 1000);
    }
  }

  PreBuiltGlobalIndSrc(d: any) {
    var that = this;
    this.checkprebuid().then(xy => {
      this.preBuiltService.selCompany.next(undefined);
      that.preBuiltService.showReviewIndexLoaded.next(false);
      that.sharedData.showMatLoader.next(true);
      that.sharedData.showCenterLoader.next(true);
      if (isNotNullOrUndefined(d['indexid']) && this.preBuiltService._naaIndexOrderList.length > 0) {
        that.prebuildCheck(d);
      } else {
        this.dataService.GetIndexOrder().pipe(first()).subscribe((data1: any) => {
          if (data1[0] != "Failed") {
            that.sharedData.showMatLoader.next(true);
            that.sharedData.showCenterLoader.next(true);
            that.preBuiltService.naaIndexOrderList.next(data1);
            that.prebuildCheck(d);
          }
        });
      }
    });
  }

  prebuildCheck(d: any) {
    var that = this;
    var indexid = (isNotNullOrUndefined(d.indexid)) ? d.indexid : null;
    var category = (isNotNullOrUndefined(d.category)) ? d.category : null;
    var fObj = this.preBuiltService._naaIndexOrderList.filter((du: any) => du.indexid == indexid && du.category == category);
    var currentLoc: boolean = (window.location.pathname.indexOf('prebuilt') > 0) ? true : false;
    var brmIndex = [...that.preBuiltService.prebuiltIndexBrcmData.value].filter((x: any) => x.group == 'subCategory' || x.group == 'Index');
    if (currentLoc && brmIndex.length > 0 && isNotNullOrUndefined(brmIndex[0].indexid) && brmIndex[0].indexid == indexid && isNotNullOrUndefined(brmIndex[0].category) && brmIndex[0].category == category) {
      that.sharedData.showMatLoader.next(false);
      that.sharedData.showCenterLoader.next(false);
    } else if (fObj.length > 0) {
      that.router.navigate(["prebuilt"]);
      setTimeout(() => {
        var Obj = Object.assign({}, fObj[0]);
        that.preBuiltService.prebuildIndSearch(Obj);
      }, 1000);
    }
  }

  ThematicGlobalIndSrc(d: any) {
    var that = this;
    if (isNotNullOrUndefined(d['indexid']) && this.theBuiltService._thematicIndexList.length > 0) {
      that.thematicCheck(d);
    } else {
      this.dataService.GetThematicIndexes().pipe(first()).subscribe((data1: any) => {
        if (data1[0] != "Failed") {
          this.theBuiltService.thematicIndexList.next(data1);
          that.thematicCheck(d);
        }
      });
    }
  }

  thematicCheck(d:any) {
    var that = this;
    var fObj = this.theBuiltService._thematicIndexList.filter((du: any) => du.indexid == d.indexid);
    var currentLoc: boolean = (window.location.pathname.indexOf('thematicStrategies') > 0) ? true : false;
    var brmIndex = [...that.theBuiltService.thematicIndexBrcmData.value].filter((x: any) => x.group == 'strategy');
    if (currentLoc && brmIndex.length > 0 && brmIndex[0]['indexid'] == d.indexid) {
    } else if (fObj.length > 0) {
      that.router.navigate(["thematicStrategies"]);
      setTimeout(() => {
        var Obj = Object.assign({}, fObj[0]);
        that.theBuiltService.thematicIndexClick(Obj);
      }, 500);
    }
  }

  getNAAMaster() {
    var that = this;
    return new Promise((resolve, reject) => {
      if (that.preBuiltService._NAAEquityIndexes.length > 0) { resolve([]) } else {
        this.dataService.getNAAMaster_1().pipe(first()).subscribe((res: any) => {
          if (res[0] != "Failed") {
            var naaInd = res.filter((x: any) => x.indexId != that.preBuiltService.EQGrowthValue['S&PValue'] && x.indexId != that.preBuiltService.EQGrowthValue['S&PGrowth']);
            that.preBuiltService.NAAEquityIndexes.next(res);
            resolve([])
          }
        });
      }
    });
  }

  checkprebuid() {
    return new Promise((resolve, reject) => {
      this.getIndexConstruction([]).then(res => {
        this.getNAAMaster().then(res => {
          resolve([]);
        });
      });
    });
  }

  getIndexConstruction(data: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      if (that.preBuiltService._getIndexConstruction_prebuilt.length > 0) { resolve([]) } else {
        that.dataService.GetPrebuildIndexConstruction(data).pipe(first()).subscribe((res: any) => {
          if (res[0] != "Failed") {
            that.preBuiltService.getIndexConstruction_prebuilt.next(res);
            resolve([])
          }
        });
      }
    });
  }

  gloSrcEnter(value: any) {
    if (isNotNullOrUndefined(value['type']) && (value instanceof Object)) {
      var type: string = value['type'];
      if (type == "Equity Universe") { this.equityGlobalIndCompSrc(value); }
      else if (type == "ETF") { this.etfGlobalIndexSrc(value); }
      else if (type == "PreBuilt") { this.PreBuiltGlobalIndSrc(value); }
      else if (type == "Thematic") { this.ThematicGlobalIndSrc(value); }
      else if (type == "DirectIndexing") { this.DirectIndexingSrc(value); }
    } else { }
  }

  GlobalSearch: any;
  keySearch(value: string) {
  try { this.GlobalSearch.unsubscribe(); } catch (e) { }
    this.GlobalSearch = this.dataService.GlobalSearch(value).pipe(first())
      .subscribe((res: any) => {
        const order = ['Equity Universe', 'ETF', 'DirectIndexing', 'PreBuilt', 'Thematic'];
     
        //console.log('groupedData', res);
        var filterData: any = [...res].filter((x: any) => x.ticker.toLowerCase() == value.toLowerCase());
        if (filterData.length > 0) {
          this.gloSrcEnter(filterData[0]);
        } else if (isNotNullOrUndefined(res) && res.length>0) {
          this.gloSrcEnter(res[0]);
        } else {
          /*Add toastr*/
        }
       
      });
  }
}
