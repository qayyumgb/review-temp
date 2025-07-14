import { Component, Inject } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../core/services/moduleService/direct-index.service';
import { Router } from '@angular/router';

@Component({
  selector: 'existing-popup',
  templateUrl: './existing-popup.component.html',
  styleUrl: './existing-popup.component.scss'
})
export class existingPopupComponent {
  dialogTitle: string = '';
  dialogData: any;
  selectedIndex: any;
  currentList: any;
  LineChartData: any = [];
  selectedIndexNo = 0;
  existing_stat_list: any = [];
  existing_stat_list_AllRecords: any = [];
  dialogOptions: any;
  constructor(public sharedData: SharedDataService, private dialogref: MatDialogRef<existingPopupComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any,
    public cusIndexService: CustomIndexService, public dirIndexService: DirectIndexService,private router: Router,) {
  }
  ngOnInit() {
    var that = this;
    that.dialogTitle = this.modalData.dialogTitle;
    that.dialogData = this.modalData.dialogData;
    that.selectedIndex = this.modalData.selectedIndex;
    that.currentList = this.modalData.currentList;
    that.existing_stat_list = this.dialogData;
    that.dialogOptions = this.modalData.dialogSource;
    var x = this.currentList.assetId;
    that.existing_stat_list_AllRecords = [...this.existing_stat_list].filter(v => v.assetId == x);
    that.sharedData.showMatLoader.next(false);
  }
  closeModal(btnClick: boolean = false) {
    var checkRoute: boolean = false;
    if (isNotNullOrUndefined(this.dialogOptions['routePlace'])) { checkRoute = (this.dialogOptions['routePlace'] == 'toolCustDelete') ? true : false; };
    if (btnClick && checkRoute && this.existing_stat_list.length > 0) {
      var d: any = this.existing_stat_list[0];
      this.startLoadIndex((isNotNullOrUndefined(d['rowno']) ? d['rowno'] : -1), (isNotNullOrUndefined(d['assetId']) ? d['assetId'] : 0), d);
    } else { this.dialogref.close(); }
  }
  createNewStrategy() {
    var that = this;
    if (this.dialogOptions.from == 'directCustomTool') {
      that.cloneDirectIndexStrategy();
    } else if (this.dialogOptions.from == 'equityCustomTool') {
      that.cloneDirectIndexStrategy();
    } else if (this.dialogOptions.from == 'etfCustomTool') {
      that.cloneDirectIndexStrategy();
    }
  }

  cloneDirectIndexStrategy() {
    this.cusIndexService.customizeSelectedIndex_custom.next(this.dialogOptions.customIndex);
    this.cusIndexService.selCompany.next(undefined);
    this.cusIndexService.currentSList.next(undefined);
    this.cusIndexService.currentSNo.next(-1);
    this.closeModal();
    this.router.navigate(["/customIndexing"]);
  }

  startLoadIndex(rowno:any,assetID:any, clkd:any) {
    var that = this;
    this.cusIndexService.customizeSelectedIndex_custom.next(clkd);
    this.cusIndexService.currentSNo.next(rowno);
    this.closeModal();
    this.router.navigate(["customIndexing"]);
  }

  checkStrName(item:any) {
    var name = item.name;
    if (isNotNullOrUndefined(name) && name.length > 0) {
      if (name.length > 30) { name = name.slice(0, 18) + "..."; }
      return name;
    } else { return "Index" + (item.rowno + 1); }
  }

  checkStrNameNew(item:any) {
    var chk1 = this.existing_stat_list;
    var xx = chk1.filter((x:any) => x.rowno == item);
    if (xx.length > 0) {
      var name = xx[0].name;
      if (isNotNullOrUndefined(name) && name.length > 0) {
        if (name.length > 10) { name = name.slice(0, 10) + "..."; }
        return name;
      }
    }
    else { return "Index " + (item + 1); }
  }
}
