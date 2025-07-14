import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
import { Router } from '@angular/router';
@Component({
  selector: 'the-breadcrumb-list',
  templateUrl: './breadcrumb-list.component.html',
  styleUrl: './breadcrumb-list.component.scss'
})
export class BreadcrumbListComponent_Thematic implements OnInit, OnDestroy {
  selectedPath: any = [];
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService, public theIndexService: ThematicIndexService, private router: Router) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  
  ngOnInit() {
    var that = this;
    var unSub = this.theIndexService.thematicIndexBrcmData.subscribe((res: any) => {
      that.selectedPath = [...res];
      if (res.length > 0) { that.showBackBtn = true } else { that.showBackBtn = false }
    });
    var move_defaultAccount = this.theIndexService.errorList_thematic.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        this.checkErrorAction(res);
      }
    });
    this.subscriptions.add(move_defaultAccount);
    this.subscriptions.add(unSub);
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'moveToHome') {
      this.gotoHome();
      this.theIndexService.errorList_thematic.next(undefined);
    }
    else if (checkError.destination == 'moveToDashboard') {
      this.gotoUniverse();
      this.theIndexService.errorList_thematic.next(undefined);
    }
  }
  gotoHome() {
    //this.preIndexService.naaIndBrcmClick(0)
    this.theIndexService.thematicIndexBrcmData.next([]);
    this.theIndexService.startIndexClick_thematic.next(false);
    this.sharedData.userEventTrack('Thematic Strategies', 'Thematic Strategies', 'Thematic Strategies', 'Home btn clicked');
    //this.preIndexService.selNaaIndex.next(this.preIndexService._prebuiltIndexBrcmData[(this.preIndexService._prebuiltIndexBrcmData.length - 1)]);
  }
  gotoUniverse() {
    this.router.navigate(['/home']);
    this.sharedData.openUniverseMenu.next(true);
    this.theIndexService.thematicIndexBrcmData.next([]);
    this.theIndexService.startIndexClick_thematic.next(false);
    this.sharedData.userEventTrack('Thematic Strategies', 'Thematic Strategies', 'Thematic Strategies', 'Home btn clicked');
  }
  onPreviousGrp() {
    if (this.selectedPath.length > 0) { this.selectedPath.splice(this.selectedPath.length - 1, 1); };
    this.theIndexService.thematicIndexBrcmData.next(this.selectedPath);
    this.theIndexService.startIndexClick_thematic.next(false);
    this.sharedData.userEventTrack('Thematic Strategies', 'Thematic Strategies', 'Thematic Strategies', 'Back btn clicked');
    //if (this.selectedPath.length > 0) { this.selectedValue = this.selectedPath[this.selectedPath.length - 1]; }
  }
  closeFactsheet() {
    this.theIndexService.showReviewIndexLoaded.next(false);
  }
}
