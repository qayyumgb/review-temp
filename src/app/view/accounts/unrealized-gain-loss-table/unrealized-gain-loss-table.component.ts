import { Component, SimpleChanges, ChangeDetectionStrategy, ViewChild, Input, } from '@angular/core';
import { isNotNullOrUndefined, SharedDataService } from '../../../core/services/sharedData/shared-data.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
// import { taxLotComponent } from '../taxlot-modal/taxlot-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'unrealizedGainLossTable',
  templateUrl: './unrealized-gain-loss-table.component.html',
  styleUrl: './unrealized-gain-loss-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnrealizedGainLossTableComponent {
    ////// Get data from parent to use Funded and non Funded data
    @Input() accountDataSourceHeader: any = [];
    @Input() selectedType: string = ''; //// Pershing account or NAA
    @Input() accountDataSourceData: any = [];
    @Input() marketdata: any = [];
    @Input() savedDontSell_List: any = [];
    @ViewChild(MatSort) sort: MatSort | undefined;
    accountDataSource = new MatTableDataSource([]);
    //dynamicColumns: any = [];
    showDelay = new FormControl(100);
    hideDelay = new FormControl(100);
    sortedData: any = [];
    constructor(public sharedData: SharedDataService, public dialog: MatDialog) { }
    ngOnInit(): void {
      // this.accountDataSourceData = this.accountDataSourceData.filteredData
      // console.log(this.accountDataSourceData,'un')
      // console.log(this.accountDataSourceHeader,'accountDataSourceHeader')
    }
    checkDont_Info(val:any) {

      var dup = this.savedDontSell_List.filter((res:any) => res.StockKey == val.stockkey);
      // console.log(val, dup);
      if (dup.length > 0) { return true } else { return false; }
    }
    ngOnChanges(changes: SimpleChanges) {
      if (changes['selectedType'].currentValue != '') {
        var type = changes['selectedType'].currentValue;
        this.selectedType = type;
      } else { this.selectedType = ''; }
    }
    numberWithCommas(x:any) {
      var parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    getmarketdata(conid:any, column:any) {
      if (isNotNullOrUndefined(conid)) {
        var mktdata:any = this.marketdata.filter((x:any) => x.conid == parseInt(conid));
        if (mktdata.length > 0) {
          if (column == 'change' && mktdata[0]['change'] != null) return mktdata[0]['change'] + ' %';
          if (column == 'last' && mktdata[0]['last'] != null) return mktdata[0]['last'];
          if (column == 'costbasis' && mktdata[0]['costbasis'] != null) {
            return this.numberWithCommas(mktdata[0]['costbasis']);
          }
          if (column == 'marketvalue' && mktdata[0]['marketvalue'] != null) {
            var marketvalue = '';
            if (mktdata[0]['marketvalue'].includes('K')) {
              marketvalue = mktdata[0]['marketvalue'];
              marketvalue = (parseFloat(marketvalue.replace("K", "")) * 1000).toString();
              return this.numberWithCommas(marketvalue);
            } else { return this.numberWithCommas(mktdata[0]['marketvalue']); }
          }
          if (column == 'avgprice' && mktdata[0]['avgprice'] != null) return this.numberWithCommas(mktdata[0]['avgprice']);
          if (column == 'dailyprofitloss' && mktdata[0]['dailyprofitloss'] != null) return this.numberWithCommas(mktdata[0]['dailyprofitloss']);
          if (column == 'unrealizedprofitloss' && mktdata[0]['unrealizedprofitloss'] != null) return this.numberWithCommas(mktdata[0]['unrealizedprofitloss']);
        }
        return '';
      } else { return "-"; }
    }
    onSortData(sort:any) {
      const data = this.accountDataSourceData.data.slice();
      if (!sort.active || sort.direction == '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a:any, b:any) => {
        let isAsc = sort.direction == 'asc';
        switch (sort.active) {
          case 'Instrument': { return this.compare(a.contractDesc, b.contractDesc, isAsc); }
          case 'Position': return this.compare(a.position, b.position, isAsc);
          default: return 0;
        }
      });
      this.accountDataSourceData.data = this.sortedData;
    }
    onSortPData(sort:any) {
      const data = this.accountDataSourceData.data.slice();
      if (!sort.active || sort.direction == '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a:any, b:any) => {
        let isAsc = sort.direction == 'asc';
        switch (sort.active) {
          case 'Instrument': { return this.compare(a.Instrument, b.Instrument, isAsc); }
          case 'Position': return this.compare(a.Position, b.Position, isAsc);
          default: return 0;
        }
      });
      this.accountDataSourceData.data = this.sortedData;
    }
    taxlotModalData: any = [];
    taxlotModalDataTicker: string = '';
    taxLotModalLastPrice: string = '';
    taxLot_ModalOpen(port:any) {
      var data = [];
      this.taxlotModalDataTicker = '';
      if (isNotNullOrUndefined(port['cusipIdentifier'])) {
        data = [...this.sharedData.taxLotData.value].filter(x => x.cusipIdentifier == port['cusipIdentifier']);
      } else if (isNotNullOrUndefined(port['stockkey'])) {
        data = [...this.sharedData.taxLotData.value].filter(x => x.stockKey == port['stockkey']);
      }
      this.taxlotModalData = [...data];
      this.taxlotModalDataTicker = (this.taxlotModalData[0].ticker).toString()
      this.taxLotModalLastPrice = (this.taxlotModalData[0].price).toString()
    }
    compare(a:any, b:any, isAsc:any) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
    isPershingLossorGain(value:any) {

      if (value < 0) {
        return false;
      }
      else {
        return true;
      }
    }

}
