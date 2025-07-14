import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import { DataService } from '../../../../core/services/data/data.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Subscription, first } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent_Prebuilt } from '../../error-dialogs/common-error-dialog/common-error-dialog.component';

@Component({
  selector: 'pre-build-your-index',
  templateUrl: './build-your-index.component.html',
  styleUrl: './build-your-index.component.scss'
})
export class BuildYourIndexComponent_Prebuilt implements OnInit, OnDestroy {
  viewFactsheet: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public dataService: DataService, public dialog: MatDialog,
    private logger: LoggerService, public preBuiltService: PrebuildIndexService) { }

  ngOnInit() {
    var that = this;
    var customizeSelectedIndex_prebuilt = that.preBuiltService.customizeSelectedIndex_prebuilt.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        if (isNotNullOrUndefined(res['type']) && res['type'] == "NAAIndexes") { this.onloadIndexData() }
        else if (isNotNullOrUndefined(res['type']) && res['type'] == "strategy") { this.onloadStgyData() }
        else { }
      }
    });
    that.subscriptions.add(customizeSelectedIndex_prebuilt);

    var showReviewIndexLoaded = that.preBuiltService.showReviewIndexLoaded.subscribe((res: any) => { this.viewFactsheet = res; });
    that.subscriptions.add(showReviewIndexLoaded);
  }

  onloadIndexData() {
    var selectedIndex = this.preBuiltService.customizeSelectedIndex_prebuilt.value;
    this.preBuiltService.getNAAHoldings(selectedIndex['indexid']).then((res: any) => {
      this.preBuiltService.exclusionCompData.next([...res]);
    });
    this.GetIndexDetails();
  }

  onloadStgyData() {
    var selectedIndex = this.preBuiltService.customizeSelectedIndex_prebuilt.value;
    this.LineChart(selectedIndex['indexid']);
    this.preBuiltService.NAAIndexSHoldingID(selectedIndex).then((res: any) => {
      this.preBuiltService.exclusionCompData.next([...res]);
    });
    this.getStgyPerStatData();
  }

  LineChart(id:any) {
   var GNIV= this.dataService.GetNAAIndexSValues(id).pipe(first()).subscribe((res: any) => {
      this.preBuiltService.preBuiltLineChartData.next(res);
    }, (error: any) => {
      this.preBuiltService.preBuiltLineChartData.next([]);
      this.logger.logError(error, 'GetNAAIndexSValues');
    });
    this.subscriptions.add(GNIV);
  }

  GetIndexReturnsCalc(indexID: any, BMIndID:any) {
   var HLCD= this.dataService.getLineChartData(indexID, BMIndID).pipe(first()).subscribe((res: any) => {
      this.preBuiltService.preBuiltLineChartData.next(res);
    }, (error: any) => {
      this.preBuiltService.preBuiltLineChartData.next([]);
      this.logger.logError(error, 'getLineChartData');
    });
    this.subscriptions.add(HLCD);
  }

  leftTabClick(d: boolean) {
    this.preBuiltService.showReviewIndexLoaded.next(d);
    this.sharedData.userEventTrack("Prebuilt Strategies", "left grid tab", ((d)? 'Factsheet' :'Strategies'), 'tab Click');
  }

  ngOnDestroy() {
    this.preBuiltService.showReviewIndexLoaded.next(false);
    this.preBuiltService.customizeSelectedIndex_prebuilt.next(undefined);
    this.preBuiltService.exclusionCompData.next([]);
    this.preBuiltService.GetNAAIndexStrategyPerf.next([]);
    this.preBuiltService.GetNAAIndexPerf.next([]);
    this.preBuiltService.preBuiltLineChartData.next([]);
    this.preBuiltService.selCompany.next(undefined);
    this.preBuiltService.selNaaIndex.next(undefined);
    this.subscriptions.unsubscribe();
    try { this.preBuiltService.NAAIndexSHoldingIDSub.unsubscribe(); } catch (e) { }
    try { this.preBuiltService.getNAAHoldingSub.unsubscribe(); } catch (e) { }
    try { this.preBuiltService.GetESGCatStocksSub.unsubscribe(); } catch (e) { }
    try { this.preBuiltService.GetFamilyindexsectorSub.unsubscribe(); } catch (e) { }
  }

  getStgyPerStatData() {
    var that = this;
    var id: number = this.preBuiltService.customizeSelectedIndex_prebuilt.value['indexid'];
    var GNGP=this.dataService.GetNAAIndexStrategyPerf(id).pipe(first()).subscribe((res: any) => {
      that.preBuiltService.GetNAAIndexStrategyPerf.next(res);     
    }, (error: any) => {
      that.preBuiltService.GetNAAIndexStrategyPerf.next([]);
      this.logger.logError(error, 'GetNAAIndexStrategyPerf');
    });
    this.subscriptions.add(GNGP);
  }

  GetIndexDetails() {
    var that = this;
    var selectedIndex = this.preBuiltService.customizeSelectedIndex_prebuilt.value;
    var data = { "indexcode": selectedIndex['CommonTicker'] };
    var GIDs=this.dataService.GetIndexDetails(data).pipe(first()).subscribe((res: any) => {
      that.preBuiltService.GetNAAIndexPerf.next(res);
      var BenchMarkId: number = (isNotNullOrUndefined(res["indexperformanceAll"][0]['BenchMarkId'])) ? res["indexperformanceAll"][0]['BenchMarkId'] : 0;
      var indexid: number = (isNotNullOrUndefined(res["indexMaster"][0]['indexId'])) ? res["indexMaster"][0]['indexId'] : selectedIndex['indexid'];
      this.GetIndexReturnsCalc(indexid, BenchMarkId);
    }, (error: any) => {
      that.preBuiltService.GetNAAIndexPerf.next(undefined);
      that.openErrorComp();
      that.logger.logError(error, 'GetIndexDetails');
    });
    this.subscriptions.add(GIDs);
  }
  checkDisableIcon() {
    if (this.preBuiltService._GetNAAIndexPerf == undefined) {
      return true;
    } else { return false; }
  }
  openErrorComp() {
    var title = 'Error';
    var options = { from: 'prebuiltFactsheet', error: 'notifyError', destination: 'moveToHome' }
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent_Prebuilt, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  }
}
