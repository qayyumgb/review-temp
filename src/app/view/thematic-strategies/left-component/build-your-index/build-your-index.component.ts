import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data/data.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'the-build-your-index',
  templateUrl: './build-your-index.component.html',
  styleUrl: './build-your-index.component.scss'
})
export class BuildYourIndexComponent_Thematic implements OnInit, OnDestroy {
  viewFactsheet: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dataService: DataService,
    private logger: LoggerService, public theBuiltService: ThematicIndexService) { }

  ngOnInit() {
    var that = this;
    this.loadData();
  }

  loadData() {
    var index = this.theBuiltService.customizeSelectedIndex_thematic.value;
    if (isNotNullOrUndefined(index)) {
      this.theBuiltService.NAAThematicHoldings(index)
        .then((res: any) => { this.theBuiltService.exclusionCompData.next(res); this.sharedData.showCenterLoader.next(false); });
    }
  }

  leftTabClick(d: boolean) { this.viewFactsheet = d; };

  ngOnDestroy() {
    this.theBuiltService.startIndexClick_thematic.next(false);
    this.theBuiltService.customizeSelectedIndex_thematic.next(undefined);
    this.theBuiltService.thematicIndexBrcmData.next([]);
    this.theBuiltService.exclusionCompData.next([]);
    this.theBuiltService.selCompany.next(undefined);
    this.subscriptions.unsubscribe();
    try { this.theBuiltService.getNAAThematicHoldingSub.unsubscribe(); } catch (e) { }
  }

}
