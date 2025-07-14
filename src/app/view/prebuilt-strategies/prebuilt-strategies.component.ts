import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { DataService } from '../../core/services/data/data.service';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { PrebuildIndexService } from '../../core/services/moduleService/prebuild-index.service';

@Component({
  selector: 'app-prebuilt-strategies',
  templateUrl: './prebuilt-strategies.component.html',
  styleUrl: './prebuilt-strategies.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PrebuiltStrategiesComponent implements OnInit, OnDestroy {
  showStartIndex: boolean = false;
  /** Index Strategy **/
  showStgy: boolean = false;
  showFamylyIndex: boolean = false;
  /** Index Strategy **/
  showReviewIndexLoaded: boolean = false;
  currentSList: any;
  showViewReport: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dataService: DataService, public dirIndexService: DirectIndexService, public preBuiltService: PrebuildIndexService) {
    this.sharedData.showCircleLoader.next(true);
  }

  viewReport() { this.preBuiltService.showViewReport.next(true); }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.preBuiltService.prebuiltIndexBrcmData.next([]);
    this.preBuiltService.startIndexClick_prebuilt.next(false);
    this.preBuiltService.showReviewIndexLoaded.next(false);
    this.sharedData.showCenterLoader.next(false);
    this.preBuiltService.showViewReport.next(false);
  }

  ngOnInit() {
    var that = this;
    try {
      that.preBuiltService.getNAAMaster();
      //that.getBetaIndex();
      that.getIndexConstruction([])
      that.preBuiltService.getNaaIndexOrderList();
    } catch (e) { console.log(e) }
    
    var unSub_leftMenu = this.preBuiltService.startIndexClick_prebuilt.subscribe((res: boolean) => {
      that.showStartIndex = res;
    });
    var reviewIndexloaded = this.preBuiltService.showReviewIndexLoaded.subscribe((res: any) => {
      that.showReviewIndexLoaded = res;
    });    
    this.subscriptions.add(unSub_leftMenu);
    this.subscriptions.add(reviewIndexloaded);

    var showVR = this.preBuiltService.showViewReport.subscribe(res => { this.showViewReport = res });
    that.subscriptions.add(showVR);

    var prebuiltIndexBrcmData = that.preBuiltService.prebuiltIndexBrcmData.subscribe((res: any) => {
      this.showFamylyIndex = false;
      this.preBuiltService.showViewReport.next(false);
      if (isNotNullOrUndefined(res) && res.length > 0) {
        var dt: any = res[res.length - 1]
        if (isNotNullOrUndefined(dt['type']) && (dt['type'] == "strategy" || dt['type'] == "exNAA")) { this.showStgy = true; }
        else { this.showStgy = false; }
        if (isNotNullOrUndefined(dt['category']) && dt['category'] == "Family Indexes") { this.showFamylyIndex = true; }
      } else { this.showStgy = false; }
    });
    that.subscriptions.add(prebuiltIndexBrcmData);

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(4); };      
    });
    that.subscriptions.add(unSubUTRPData);
  }
  getBetaIndex() {
    var that = this;
    //that.sharedData.showCircleLoader.next(false);
    var GSALP=that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        var dtabeta: any;
        dtabeta = data1;
        dtabeta.forEach((x: any) => {
          x.srName = x.name;
          x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
          return x
        });
        that.preBuiltService.getBetaIndex_prebuilt.next(dtabeta);
      }
    }, (error: any) => { console.log(error), that.preBuiltService.getBetaIndex_prebuilt.next([]); that.sharedData.showCircleLoader.next(false); });
    this.subscriptions.add(GSALP);
  }
  chartData:any=[];
  getIndexConstruction(data:any){
    var that = this;
    var GPIC= that.dataService.GetPrebuildIndexConstruction(data).pipe(first()).subscribe((res: any) => {
      // console.log(res,'getIndexConstruction')
      if (res[0] != "Failed") {
        that.preBuiltService.getIndexConstruction_prebuilt.next(res);
      }
   
     }, (error: any) => { console.log(error), that.preBuiltService.getIndexConstruction_prebuilt.next([]); that.sharedData.showCircleLoader.next(false); })
    this.subscriptions.add(GPIC);
  }
}
