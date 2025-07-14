import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';

@Component({
  selector: 'pre-common-error-dialog',
  templateUrl: './common-error-dialog.component.html',
  styleUrl: './common-error-dialog.component.scss'
})
export class CommonErrorDialogComponent_Prebuilt {
  dialogTitle: string = '';
  dialogData: any;
  dialogOptions: any;
  constructor(public sharedData: SharedDataService, private preBuiltService: PrebuildIndexService, private dialogref: MatDialogRef<CommonErrorDialogComponent_Prebuilt>, @Inject(MAT_DIALOG_DATA) public modalData: any, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.dialogOptions = this.modalData.dialogSource;
  }
  ngOnDestroy() { }
  forceClosereviewind() {
    this.sharedData.showCenterLoader.next(false);
    this.sharedData.showMatLoader.next(false);
    this.preBuiltService.errorList_prebuilt.next(this.dialogOptions);
    this.dialogref.close();
  }
  closeModal() {
    this.sharedData.showCenterLoader.next(false);
    this.sharedData.showMatLoader.next(false);
    this.dialogref.close();
  }
}
