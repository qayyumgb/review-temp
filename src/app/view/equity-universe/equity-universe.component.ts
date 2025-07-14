import { Component, OnDestroy, OnInit } from '@angular/core';
import { EquityUniverseService } from '../../core/services/moduleService/equity-universe.service';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equity-universe',
  templateUrl: './equity-universe.component.html',
  styleUrl: './equity-universe.component.scss'
})
export class EquityUniverseComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  showRevertPPT: boolean = false;
  constructor(public equityService: EquityUniverseService, public sharedData: SharedDataService,) {  }
  ngOnInit() {
    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(2027); };
    });
    this.subscriptions.add(unSubUTRPData);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.equityService.breadcrumbdata.next([]);
    this.equityService.selGICS.next(undefined);
    this.equityService.selComp.next(undefined);
    try { this.equityService.GetBMIndStkKeySub.unsubscribe(); } catch (e) { }
    try { this.equityService.GetAllocScores1.unsubscribe(); } catch (e) { }
    try { this.equityService.GetIndRunsPerfDate.unsubscribe(); } catch (e) { }
    try { this.equityService.GetIndexPreRunsCustomBP1.unsubscribe(); } catch (e) { }
    try { this.equityService.GetIndPerf.unsubscribe(); } catch (e) { }
    try { this.equityService.GetIndRunsPerf.unsubscribe(); } catch (e) { }
  }
  resetPPTSlidesTicker() {
    this.sharedData.showNavPPT_CenterCircle.next(false);
    this.sharedData.showNavPPT_Ticker.next('');
    this.showRevertPPT = false;
  }

  
}
