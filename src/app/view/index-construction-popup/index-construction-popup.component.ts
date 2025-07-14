import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { UserService } from '../../core/services/user/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';

@Component({
  selector: 'app-index-construction-popup',
  templateUrl: './index-construction-popup.component.html',
  styleUrl: './index-construction-popup.component.scss'
})
export class IndexConstructionPopupComponent implements OnInit {
  dialogTitle: string = '';
  dialogData: any;
  selectedCompany: any;
  selectedGics: any;
  selectedDirectIndex: any;
  IndexName:any;
  index_const_select: string = "-";
  index_const_weight: string = "-";
  index_const_tax: string = "-";
  index_const_calcu: number = 0;
  bldMyIndselNoCompVal: any;
  cuselindName = "";
  cuselindTicker = "";
  constructor(public sharedData: SharedDataService,public cusIndexService: CustomIndexService, private userService: UserService, private dialogref: MatDialogRef<IndexConstructionPopupComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.selectedDirectIndex = this.modalData.selectedIndex;
    this.selectedCompany = this.modalData.selecetedComapny;
    this.selectedGics = this.modalData.selecetedGics;
   // console.log(this.cusIndexService.currentSList, this.dialogData, this.selectedCompany, this.selectedGics,  '_customizeSelectedIndex_custom');
    var ETFIndex:any = [...this.sharedData._ETFIndex].filter(x => x.assetId == this.selectedDirectIndex['assetId']);
    if (ETFIndex.length > 0) {
      this.cuselindName = ETFIndex[0].etfName;
      this.cuselindTicker = ETFIndex[0].ticker;
      }
      else{
        var value = this.cusIndexService.equityIndexeMasData.getValue();
        var flData = value.filter((x: any) => x.assetId == this.selectedDirectIndex['assetId']);
        ///console.log(flData[0]);
          if (flData.length > 0) {
            this.cuselindName = flData[0].name;
            this.cuselindTicker = "";
          }
      }
    this.load(this.selectedDirectIndex)
  }
  checkfactorName(id:any) {
    var fac_3 = [...this.cusIndexService._factorMasterData].filter(fu => fu.id == id);
    return fac_3[0].displayname;
  }
  closeModal() {
    this.dialogref.close();
  }

  load(data: any) {
    //if (isNotNullOrUndefined(data['name'])) { this.cuselindName = data['name']; }
    //if (isNotNullOrUndefined(data['shortname'])) { this.cuselindTicker = data['shortname']; }
    if (isNotNullOrUndefined(data['taxEffAwareness'])) { this.index_const_tax = data['taxEffAwareness']; }
    if (isNotNullOrUndefined(data['noofComp'])) {
      this.bldMyIndselNoCompVal = data['noofComp'];
      if (isNotNullOrUndefined(data['indextotalcount'])) { this.index_const_calcu = (data['indextotalcount'] - data['noofComp']); }
    }
    if (isNotNullOrUndefined(data['weightedByName'])) { this.index_const_weight = data['weightedByName']; }
    if (isNotNullOrUndefined(data['selectedByName'])) { this.index_const_select = data['selectedByName']; }

  }

}
