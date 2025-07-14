import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
@Component({
  selector: 'thematic-common-error-dialog',
  templateUrl: './common-error-dialog.component.html',
  styleUrl: './common-error-dialog.component.scss'
})
export class CommonErrorDialogComponent_Thematic {
  dialogTitle: string = '';
  dialogData: any;
  dialogOptions: any;
  constructor(public sharedData: SharedDataService, private theIndexService: ThematicIndexService, private dialogref: MatDialogRef<CommonErrorDialogComponent_Thematic>, @Inject(MAT_DIALOG_DATA) public modalData: any, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.dialogOptions = this.modalData.dialogSource;
  }
  ngOnDestroy() { }
  forceClosereviewind() {
    //this.theIndexService.errorList_thematic.next(this.dialogOptions);
    this.closeModal();
  }
  closeModal() {
    this.theIndexService.errorList_thematic.next(this.dialogOptions);
    this.dialogref.close();
  }
}
