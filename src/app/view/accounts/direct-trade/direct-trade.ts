import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../../core/services/sharedData/shared-data.service';


import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { DragDropComponent } from './drag-drop/drag-drop.component';

interface Options {
  ticker: string, // Define the type for `selectedOptions`
  symbol: string,
  quantity: string,
  shares: string,
}
export interface Element {
  account: string;
  ticker: string;
  quantity: number;
  action: string;
}

const ELEMENT_DATA: Element[] = [
  { "account": "newacc0014", "ticker": "msft", "quantity": 1, "action": "buy" },
  { "account": "newacc0014", "ticker": "aapl", "quantity": 1, "action": "sell" },
  { "account": "newacc0014", "ticker": "amzn", "quantity": 1, "action": "buy" },
  { "account": "newacc0014", "ticker": "nvda", "quantity": 3, "action": "sell" },
  { "account": "newacc0013", "ticker": "aapl", "quantity": 1, "action": "sell" },
  { "account": "newacc0013", "ticker": "amzn", "quantity": 1, "action": "buy" },
  { "account": "newacc0013", "ticker": "nvda", "quantity": 4, "action": "sell" }
];
@Component({
  selector: 'account-direct-trade',
  templateUrl: './direct-trade.html',
  styleUrl: './direct-trade.scss'
})
export class AccountDirectTradeComponent implements OnInit, OnDestroy{
  loadSavedData: any = [];
  loadDraggedData: any = [];
  subscriptions = new Subscription();
  displayedColumns = ['select', 'ticker', 'quantity', 'action'];
  data = Object.assign(ELEMENT_DATA);
  //dataSource = new MatTableDataSource<Element>(this.data);
  dataSource: MatTableDataSource<any> | any;
  selection = new SelectionModel<any>(true, []);
  constructor(public sharedData: SharedDataService, @Inject(MAT_DIALOG_DATA) public modalData: any, private dialogref: MatDialogRef<AccountDirectTradeComponent>, private toastr: ToastrService, public dialog: MatDialog) {

  }
  ngOnDestroy() { this.subscriptions.unsubscribe(); this.sharedData.dragDropData.next([]); };
  close() { this.dialogref.close(); }
  currentAccount: any;
  ngOnInit(): void {
    var that = this;
    //console.log('modalDataMain', this.modalData)
    this.currentAccount = this.modalData.currentAccount;
    this.sharedData.showCircleLoader.next(false);
    var dragDropData = this.sharedData.dragDropData.subscribe(res => {
      //console.log(res, 'res')
      if (res.length > 0) {
        this.loadDraggedData = res;
        that.loadMainTable(res);
      }

    })
    this.subscriptions.add(dragDropData);
  }
  loadMainTable(dta: any) {
    this.dataSource = new MatTableDataSource<any>(dta);
  }
  ngAfterViewInit() {
    var that = this;
  }
  openDirectUpload() {
    var that = this;
    try {
      var title = 'Index Implied Revenue';
      var options = {
        from: 'DirectTrade',
        error: 'DirectTrade',
        destination: 'Direct Trade Popup',
      }
      //console.log('title', title);
      that.dialog.open(DragDropComponent, {
        width: "80%", height: "95%", maxWidth: "100%", maxHeight: "95vh",
        data: { dialogTitle: title, dialogSource: options }
      })
    } catch (e) { console.log(e) }
  }




  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  removeSelectedRows() {
    this.selection.selected.forEach(item => {
      let index: number = this.data.findIndex((d: any) => d === item);
      //console.log(this.data.findIndex((d: any) => d === item));
      this.dataSource.data.splice(index, 1);
      this.dataSource = new MatTableDataSource<Element>(this.dataSource.data);
      var removedData = this.dataSource.data;
      //console.log(removedData);
    });
    this.selection = new SelectionModel<Element>(true, []);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

}
