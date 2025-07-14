import { Component, OnDestroy, OnInit } from '@angular/core';
import { EtfsUniverseService } from '../../core/services/moduleService/etfs-universe.service';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-etf-universe',
  templateUrl: './etf-universe.component.html',
  styleUrl: './etf-universe.component.scss'
})
export class EtfUniverseComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  constructor(public etfService: EtfsUniverseService, public sharedData: SharedDataService,) { }
  ngOnInit() {
    var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.sharedData.checkRoutePer(2028); };
    });
    this.subscriptions.add(unSubUTRPData);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.etfService.breadcrumbdata.next([]);
    this.etfService.selGICS.next(undefined);
    this.etfService.selComp.next(undefined);
    try { this.etfService.getAlloc1.unsubscribe(); } catch (e) { }
    try { this.etfService.getAlloc2.unsubscribe(); } catch (e) { }
    try { this.etfService.GetIndexPreRunsCustomBP1.unsubscribe(); } catch (e) { }
    try { this.etfService.GetIndRunsPerfDate.unsubscribe(); } catch (e) { }
  }
}
