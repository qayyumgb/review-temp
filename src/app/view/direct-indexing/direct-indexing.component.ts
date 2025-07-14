import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { DataService } from '../../core/services/data/data.service';
import { Subscription, first } from 'rxjs';

@Component({
  selector: 'app-direct-index',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './direct-indexing.component.html',
  styleUrl: './direct-indexing.component.scss'
})
export class DirectIndexComponent implements OnInit, OnDestroy {
  showStartIndex: boolean = false;
  showReviewIndexLoaded: boolean = false;
  currentSList: any;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dataService: DataService, public cusIndexService: CustomIndexService, public dirIndexService: DirectIndexService) {
    this.sharedData.showCircleLoader.next(true)
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.dirIndexService.directIndexBrcmData.next([]);
    this.dirIndexService.startIndexClick_direct.next(false);
    this.dirIndexService.showReviewIndexLoaded.next(false);
    this.sharedData.showMatLoader.next(false);
    this.sharedData.showCenterLoader.next(false);
  }
  ngOnInit() {
    var that = this;
    var MenuPermission = this.sharedData.UserMenuRolePermission.subscribe(res => {
      if (res.length > 0) {
        that.getBetaIndex();
      }
    });
    var unSub_leftMenu = this.dirIndexService.startIndexClick_direct.subscribe((res: boolean) => {
      that.showStartIndex = res;
    });
    var reviewIndexloaded = this.dirIndexService.showReviewIndexLoaded.subscribe(res => {
      that.showReviewIndexLoaded = res;
    })
    var selectedIndex = this.dirIndexService.currentSList.subscribe(res => {
      that.currentSList = res;
      //console.log(res);
    })
    this.subscriptions.add(unSub_leftMenu);
    this.subscriptions.add(reviewIndexloaded);
    this.subscriptions.add(selectedIndex);
    this.subscriptions.add(MenuPermission);

    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(12); };
    });
    that.subscriptions.add(unSubUTRPData);
  }
  getBetaIndex() {
    var that = this;
    if (isNullOrUndefined(that.dirIndexService._getBetaIndex_Direct) || that.dirIndexService._getBetaIndex_Direct.length == 0) {
      that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {

        if (data1[0] != "Failed") {
          var dtabeta: any;
          dtabeta = data1;
          dtabeta.forEach((x: any) => {
            x.srName = x.name;
            x.basedOn = (isNotNullOrUndefined(x['basedon'])) ? x['basedon'] : '';
            return x
          });

          if (that.sharedData.checkMenuPer(12, 169) != 'Y') { that.dirIndexService.getBetaIndex_Direct.next([]); }
          else {
            that.dirIndexService.getBetaIndex_Direct.next(dtabeta);
          }
        }
      }, (error: any) => { console.log(error), that.sharedData.showCircleLoader.next(false); });
    }
  }
}
