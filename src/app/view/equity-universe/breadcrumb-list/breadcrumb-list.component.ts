import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { DirectIndexService } from '../../../core/services/moduleService/direct-index.service';

@Component({
  selector: 'app-breadcrumb-list',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent implements OnInit, OnDestroy {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  viewListSection: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public equityService: EquityUniverseService, public dirIndexService: DirectIndexService,) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  ngOnInit() {
    var that = this;
    var unSub = this.equityService.breadcrumbdata.subscribe((res: any) => {
      that.selectedPath = [...res];
      //console.log(res);
      if (res.length > 0) { that.showBackBtn = true; that.closeGlobalLoader(); } else { that.showBackBtn = false }
    });
    this.subscriptions.add(unSub);
    var move_defaultAccount = this.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(move_defaultAccount);

  
  }
  checkFontLength() {
    if (this.selectedPath.length >= 2 && this.selectedPath[this.selectedPath.length - 1].name.length > 40) {
      return '0.8rem';
    } else { return '1rem'; }
  }

  closeGlobalLoader() {
    var that = this;
    /*** Global search Close ***/
    setTimeout(function () {
      if (that.sharedData._frmGlobalSearchClick) {
        that.sharedData.showCircleLoader.next(false);
        that.sharedData.frmGlobalSearchClick.next(false);
      }
    }.bind(this), 2000);
    /*** Global search Close ***/
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'moveToHome') {
      this.gotoHome();
     // this.dirIndexService.errorList_Direct.next(undefined);
    }
  }
  gotoHome() {
    this.equityService.selGICS.next(undefined);
    this.equityService.breadcrumbdata.next([]);
  }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    if (this.selectedPath.length > 0) {
      var path: any = this.selectedPath[this.selectedPath.length - 1];
      this.equityService.selGICS.next(path);
      this.equityService.countryCheckClick(path).then((res: any) => {
        if (isNotNullOrUndefined(res) && res[0]) {
          this.equityService.selGICS.next(undefined);
          this.selectedPath = [];
        };
        this.equityService.breadcrumbdata.next(this.selectedPath);
      });
    } else {
      this.equityService.selGICS.next(undefined);
      this.equityService.breadcrumbdata.next(this.selectedPath);
    }
  }

}
