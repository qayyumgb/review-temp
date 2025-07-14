import { Component } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';

@Component({
  selector: 'app-breadcrumb-list',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  ngOnInit() {
    var that = this;
    var unSub = this.cusIndexService.customIndexBrcmData.subscribe((res: any) => {
      that.selectedPath = [...res];
      if (res.length > 0) { that.showBackBtn = true } else { that.showBackBtn = false }
    });
    this.subscriptions.add(unSub);
    var move_defaultAccount = this.cusIndexService.errorList_custom.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(move_defaultAccount);
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'moveToHome') {
      this.gotoHome();
      this.cusIndexService.errorList_custom.next(undefined);
    }
  }
  gotoHome() { this.cusIndexService.customIndexBrcmData.next([]); this.cusIndexService.startIndexClick_custom.next(false); }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    this.cusIndexService.customIndexBrcmData.next(this.selectedPath);
    this.cusIndexService.startIndexClick_custom.next(false);
    //if (this.selectedPath.length > 0) { this.selectedValue = this.selectedPath[this.selectedPath.length - 1]; }
  }
  closeFactsheet() {
    this.cusIndexService.showReviewIndexLoaded.next(false);
  }
}
