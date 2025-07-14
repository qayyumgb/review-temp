import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedDataService } from '../../services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-rebalance-nav',
  templateUrl: './rebalance.component.html',
  styleUrl: './rebalance.component.scss',
})
export class RebalanceNavComponent implements OnInit, AfterViewInit{
  dialogTitle: string = '';
  dialogData: any;
  subscriptions = new Subscription();
  getRebalancesData: any = [];
  addAnimate: boolean = false;
  constructor(public sharedData: SharedDataService, private router: Router, private dialogref: MatDialogRef<RebalanceNavComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any) {}
  ngOnInit() {
    var that = this;
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.getRebalancesData = this.dialogData;
   
  }
  ngAfterViewInit() {
    this.addAnimate = true;
  }
  formatName(d:any) {
    var name = d
    if (name.length > 20) {
      name = name.slice(0, 18).trim() + "...";
    }
    else {
      name = name;
    }
    return name;
  }
  rebalClass(d:any) {
    var that = this;
    var checkReb = d;
    if (checkReb != undefined) {
      if (checkReb['flag'] == "N") { return 'upcomingRebalnce_span'; }
      else if (checkReb['flag'] == "C") { return 'currentRebalnce_span'; }
      else if (checkReb['flag'] == "P") { return 'prevRebalnce_span'; }
      else { return 'active' }
    } else { return 'active' }
  }
  closeModal() {
    this.dialogref.close();
  }
  showTradedStrategy() {
    this.closeModal();
    this.sharedData.showRebalanceTrigger.next(false);
    //this.sharedData.openTradedStrategiesTab.next(true);
    this.router.navigate(['/myStrategies']);
  }
}
