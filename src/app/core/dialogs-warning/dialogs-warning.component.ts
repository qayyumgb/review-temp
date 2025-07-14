import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SharedDataService } from '../services/sharedData/shared-data.service';

@Component({
  selector: 'app-dialogs-warning',
  templateUrl: './dialogs-warning.component.html',
  styleUrl: './dialogs-warning.component.css'
})
export class DialogsWarningComponent implements OnInit, OnDestroy {
  dialogTitle: string = '';
  // _globaldialog: Observable<string>;
  dialogData: any;
  globalDialogObj: any = [];
  subscriptions = new Subscription();
  constructor(private dialogref: MatDialogRef<DialogsWarningComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any,public sharedData: SharedDataService) {
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  ngOnInit() {
    var that = this;
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    var unSub = that.sharedData.globalDialog.subscribe(res => { that.globalDialogObj = res; });
    this.subscriptions.add(unSub);
  }
  closeModal() {
    this.dialogref.close(false);
    this.subscriptions.unsubscribe()
  }
  confirm(){
    var action = this.globalDialogObj;
    if (action == 'deleteAll') {}
    else {}
    this.subscriptions.unsubscribe()
  }
}
