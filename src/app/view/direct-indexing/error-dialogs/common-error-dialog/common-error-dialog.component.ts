import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';

@Component({
  selector: 'app-common-error-dialog',
  templateUrl: './common-error-dialog.component.html',
  styleUrl: './common-error-dialog.component.scss',
  encapsulation: ViewEncapsulation.None // Disable view encapsulation
})
export class CommonErrorDialogComponent implements OnInit, OnDestroy {
  dialogTitle: string = '';
  dialogData: any;
  dialogOptions: any;
  constructor(public sharedData: SharedDataService, private dirIndexService: DirectIndexService, private dialogref: MatDialogRef<CommonErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any, private cdr: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    this.dialogOptions = this.modalData.dialogSource;
  }
  ngOnDestroy() { this.sharedData.showErrorDialogBox.next(false); }
  forceClosereviewind() {
    this.dirIndexService.errorList_Direct.next(this.dialogOptions);
    this.closeModal();
  }
  closeModal() {
    this.dialogref.close();
    this.sharedData.showMatLoader.next(false);
  }
}
