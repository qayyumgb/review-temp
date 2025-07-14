import { Component } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';

@Component({
  selector: 'approved-breadcrumb-list',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  subscriptions = new Subscription();
  responsiveFont:boolean = false;
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public dirIndexService: DirectIndexService) { }

  ngOnDestroy() { this.subscriptions.unsubscribe();}
  ngOnInit() {
    var that = this;
    var unSub = this.dirIndexService.directIndexBrcmData.subscribe((res: any) => {
      that.selectedPath = [...res];
      if (res.length > 0) { that.showBackBtn = true } else { that.showBackBtn = false }
    });
    var move_defaultAccount = this.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(unSub);
    this.subscriptions.add(move_defaultAccount);
    var query = window.matchMedia("(max-width: 1260px)")
    if(query.matches){
      this.responsiveFont = true;
    }
    else{
      this.responsiveFont = false;
    }
    window.addEventListener('resize', () => {
      var query = window.matchMedia("(max-width: 1260px)")
      if(query.matches){
        this.responsiveFont = true;
      }
      else{
        this.responsiveFont = false;
      }
    });
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'moveToHome') {
      this.gotoHome();
      this.dirIndexService.errorList_Direct.next(undefined);
    }
  }
  gotoHome() { this.dirIndexService.directIndexBrcmData.next([]); this.dirIndexService.startIndexClick_direct.next(false); }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    this.dirIndexService.directIndexBrcmData.next(this.selectedPath);
    this.dirIndexService.startIndexClick_direct.next(false);
    //if (this.selectedPath.length > 0) { this.selectedValue = this.selectedPath[this.selectedPath.length - 1]; }
  }
  closeFactsheet() {
    this.dirIndexService.showReviewIndexLoaded.next(false);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

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
