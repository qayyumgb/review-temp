import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import { Router } from '@angular/router';

@Component({
  selector: 'pre-breadcrumb-list',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent_Prebuilt {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  subscriptions = new Subscription();
  responsiveFont:boolean = false;
  constructor(public sharedData: SharedDataService, public preIndexService: PrebuildIndexService, private router: Router, public preBuiltService: PrebuildIndexService) { }
  ngOnInit() {
    var that = this;
    var unSub = this.preIndexService.prebuiltIndexBrcmData.subscribe((res: any) => {
      that.selectedPath = [...res];
      if (res.length > 0) { that.showBackBtn = true } else { that.showBackBtn = false }
    });
    var move_defaultAccount = this.preIndexService.errorList_prebuilt.subscribe((res: any) => {
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

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  checkFontLength() {
    if (this.selectedPath.length >= 2 && this.selectedPath[this.selectedPath.length - 1].name.length > 40) {
      return '0.8rem';
    } else { return '1rem'; }
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'moveToHome') {
      this.gotoHome();
      this.preIndexService.errorList_prebuilt.next(undefined);
    }
    else if (checkError.destination == 'moveToDashboard') {
      this.gotoUniverse();
      this.preIndexService.errorList_prebuilt.next(undefined);
    }
  }
  gotoHome() {
    //this.preIndexService.naaIndBrcmClick(0)
    this.preIndexService.prebuiltIndexBrcmData.next([]);
    this.preIndexService.startIndexClick_prebuilt.next(false);
    //this.preIndexService.selNaaIndex.next(this.preIndexService._prebuiltIndexBrcmData[(this.preIndexService._prebuiltIndexBrcmData.length - 1)]);
  }
  gotoUniverse() {
    this.router.navigate(['/home']);
    this.sharedData.openUniverseMenu.next(true);
    this.preIndexService.prebuiltIndexBrcmData.next([]);
    this.preIndexService.startIndexClick_prebuilt.next(false);
    this.sharedData.userEventTrack('Prebuilt Strategies', 'Prebuilt Strategies', 'Prebuilt Strategies', 'Home btn clicked');
  }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    if (this.selectedPath.length > 0) { this.preIndexService.selNaaIndex.next(this.selectedPath[this.selectedPath.length - 1]) }    
    this.preIndexService.prebuiltIndexBrcmData.next(this.selectedPath);
    this.preIndexService.startIndexClick_prebuilt.next(false);
    //if (this.selectedPath.length > 0) { this.selectedValue = this.selectedPath[this.selectedPath.length - 1]; }
  }
  closeFactsheet() {
    this.preIndexService.showReviewIndexLoaded.next(false);
  }
}
