import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedDataService } from '../../../core/services/sharedData/shared-data.service';
import { Pipe, PipeTransform } from '@angular/core';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';

@Component({
  selector: 'etfBreadcrumbList',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent implements OnInit, OnDestroy {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public etfService: EtfsUniverseService,) { }
  ngOnInit() {
    var that = this;
    var unSub = this.etfService.breadcrumbdata.subscribe((res: any) => {
      that.selectedPath = [...res];
     // console.log(res)
      if (res.length > 0) { that.showBackBtn = true; that.closeGlobalLoader() } else { that.showBackBtn = false }
    });
    this.subscriptions.add(unSub);
  }
  checkFontLength() {
    if (this.selectedPath.length >= 2 && this.selectedPath[this.selectedPath.length - 1].name.length > 40) {
      return '0.8rem';
    } else { return '1rem'; }
  }
  ngOnDestroy() { }
  closeGlobalLoader() {
    var that = this;
    /*** Global search Close ***/
    setTimeout(function () {
      if (that.sharedData._frmGlobalSearchClick) {
        that.sharedData.showCircleLoader.next(false);
        that.sharedData.frmGlobalSearchClick.next(false);
      }
    }.bind(this), 3000);
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
    this.etfService.selGICS.next(undefined);
    this.etfService.breadcrumbdata.next([]);
  }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    if (this.selectedPath.length > 0) {
      var path: any = this.selectedPath[this.selectedPath.length - 1];
      this.etfService.selGICS.next(path);
    }
    else { this.etfService.selGICS.next(undefined); }
    this.etfService.breadcrumbdata.next(this.selectedPath);
  }
}

//customPipies

@Pipe({
  name: 'firstAndLast'
})
export class FirstAndLastPipe implements PipeTransform {
  transform(value: any[]): any[] {
    if (!Array.isArray(value) || value.length === 0) {
      return [];
    } else if (value.length === 1) {
      return [value[0]];
    } else {
      return [value[0], value[1]];
    }
  }
}
