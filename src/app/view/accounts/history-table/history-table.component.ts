import { Component, OnInit, OnChanges, SimpleChanges,  ChangeDetectionStrategy, ViewChild, Input, } from '@angular/core';
import { isNullOrUndefined, SharedDataService } from '../../../core/services/sharedData/shared-data.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as d3 from 'd3';

@Component({
  selector: 'HistoryTable',
  templateUrl: './history-table.component.html',
  styleUrl: './history-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTableComponent implements OnInit, OnChanges{
  @Input() accountDataSourceHeader: any = [];
  @Input() accountDataSourceData: any = [];
  @Input() accountAllocationDataSourceData: any = [];
  @ViewChild(MatSort) sort: MatSort | undefined;
  accountAllocHeader: any = ['Ticker','Price ($)', 'buyOrSell', 'Quantity', 'tradedStatus'];
  accountDataSource = new MatTableDataSource([]);
  showDelay = new FormControl(100);
  hideDelay = new FormControl(100);
  sortedData: any = [];
  constructor(public sharedData: SharedDataService, public dialog: MatDialog) { }
  ngOnInit(): void { }
  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes['accountDataSourceData'].currentValue);
  }
  checkValPrice(val:any) { if (isNullOrUndefined(val)) { return "-" } else { return d3.format("$,.2f")(val); } };
  numberWithCommas(x:any) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  onSortHistory(sort:any) {
    const data = this.accountDataSourceData.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Date of trade': { return this.compare(a.dateofTrade, b.dateofTrade, isAsc); }
        case 'Ticker': { return this.compare(a.ticker, b.ticker, isAsc); }
        case 'Price ($)': return this.compare(a.price, b.price, isAsc);
        case 'Quantity': return this.compare(a.noofShares, b.noofShares, isAsc);
        default: return 0;
      }
    });
    this.accountDataSourceData.data = this.sortedData;
  }

  onSortHistoryAll(sort: any) {
    const data = this.accountAllocationDataSourceData.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Ticker': { return this.compare(a.ticker, b.ticker, isAsc); }
        case 'Price ($)': return this.compare(a.price, b.price, isAsc);
        case 'buyOrSell': return this.compare(a.buyOrSell, b.buyOrSell, isAsc);
        case 'Quantity': return this.compare(a.noofShares, b.noofShares, isAsc);
        default: return 0;
      }
    });
    this.accountAllocationDataSourceData.data = this.sortedData;
  }
  compare(a:any, b:any, isAsc:any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
