import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, first } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { DataService } from '../../core/services/data/data.service';
import { ThematicIndexService } from '../../core/services/moduleService/thematic-index.service';
import { PrebuildIndexService } from '../../core/services/moduleService/prebuild-index.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-thematic-strategies',
  templateUrl: './thematic-strategies.component.html',
  styleUrl: './thematic-strategies.component.scss'
})
export class ThematicStrategiesComponent {
  showStartIndex: boolean = false;
  /** Index Strategy **/
  showStgy: boolean = false;
  /** Index Strategy **/
  showReviewIndexLoaded: boolean = false;
  currentSList: any;
  hoverData__Right: any;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dataService: DataService,
    public theBuiltService: ThematicIndexService, private toastr: ToastrService) {
    this.sharedData.showCircleLoader.next(true);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.theBuiltService.thematicIndexBrcmData.next([]);
    this.theBuiltService.startIndexClick_thematic.next(false);
    this.theBuiltService.showReviewIndexLoaded.next(false);
  }

  hoverTData = { ytd: 0, year: '', yearReturns:0};
  receiveHoverData(data: any) {
    var hoverData = data;
    if (isNotNullOrUndefined(hoverData)) {
      this.hoverData__Right = hoverData;
      if (isNotNullOrUndefined(hoverData['stockAuditAP']['ytdReturn'])) {
        this.hoverTData.ytd = hoverData['stockAuditAP']['ytdReturn'];
      }
      if (isNotNullOrUndefined(hoverData['stockAuditAP']['etfPerformanceYears']) && hoverData['stockAuditAP']['etfPerformanceYears'].length>0) {
        this.hoverTData.year = hoverData['stockAuditAP']['etfPerformanceYears'][0]['year'];
        this.hoverTData.yearReturns = hoverData['stockAuditAP']['etfPerformanceYears'][0]['yearReturns'];
      }
    }
    else { this.hoverData__Right = undefined }
  }
  ngOnInit() {
    var that = this;
    that.theBuiltService.GetThematicIndexes();

    var unSub_leftMenu = this.theBuiltService.startIndexClick_thematic.subscribe((res: boolean) => {
      that.showStartIndex = res;
    });
    var reviewIndexloaded = this.theBuiltService.showReviewIndexLoaded.subscribe((res: any) => {
      that.showReviewIndexLoaded = res;
    })

    var prebuiltIndexBrcmData = that.theBuiltService.thematicIndexBrcmData.subscribe((res: any) => {
   
    });
    that.subscriptions.add(prebuiltIndexBrcmData);
    that.subscriptions.add(unSub_leftMenu);
    that.subscriptions.add(reviewIndexloaded);

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(25); };
    });
    that.subscriptions.add(unSubUTRPData);
  }
}
