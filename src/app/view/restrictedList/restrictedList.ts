import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Workbook } from 'exceljs';
// @ts-ignore
import { saveAs } from "file-saver";
declare var $: any;
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { map, startWith, first } from 'rxjs/operators';

import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '../../core/services/data/data.service';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../core/services/sharedData/shared-data.service';
//import { dragDropComponent } from '../account/drag-drop-file/drag-file';
import { AccountService } from '../../core/services/moduleService/account.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'restrictedList',
  templateUrl: './restrictedList.html',
  styleUrls: ['./restrictedList.scss'],
})
export class restrictedListComponent implements OnInit, OnDestroy, AfterViewInit{
  subscriptions = new Subscription();
  @HostListener('matSortChange', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    var that = this;
    var innerW = event.target.innerWidth;
    if (innerW <= 1600) {
      that.classFlag = true;
    } else if (innerW <= 2400 && innerW >= 1600) {
      that.classFlag = false;
      that.classFlagLarge = true;
    } else {
      that.classFlag = false;
      that.classFlagLarge = false;
    }
  }
  matloader_RS: boolean = true;
  hand_p_toggle: boolean = false;
  hand_p_left: boolean = false;
  hand_p_right: boolean = false;
  classFlag: boolean = false;
  classFlagLarge = false;
  @ViewChild('importFiles') importFiles: ElementRef | any;
  jsonlength: any = 0;
  tabledata: any = [];
  displayedColumns: string[] = ['action'];
  dropdownvalues: string[] | any;
  sortedData: any;
  tableDataSource: MatTableDataSource<any> | any;
  emptyData = new MatTableDataSource([{ empty: 'row' }]);
  @ViewChild(MatSort) sort: MatSort | any;
  displayedColumn = ['checkBox', 'Company', 'Ticker', 'Country'];
  selection = new SelectionModel(true);
  listName = '';
  selectedAccount: number = 0;
  searchFormCtrl = new FormControl();
  tabFormCtrl = new FormControl();
  tabFilteredCompanies: any = [];
  filteredCompanies: any = [];
  deleteRow: any;

  constructor(
    private accountService: AccountService,
    private dataservice: DataService,
    private dialogref: MatDialogRef<restrictedListComponent>,
    public sharedData: SharedDataService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private datepipe: DatePipe
  ) {
    var that = this;
    this.filteredCompanies = this.searchFormCtrl.valueChanges.pipe(
      startWith(''),
      map((state: any) => that._filterStates(state))
    );
    //console.log(this.filteredCompanies);
    this.tabFilteredCompanies = this.tabFormCtrl.valueChanges.pipe(
      startWith(''),
      map((state: any) => that._filterStates(state))
    );
  }

  onChangeAcc(e: any) {
    this.selectedAccount = e;
  }

  accIdformat(d: any) {
    return parseInt(d);
  }

  closeModal() {
    this.dialogref.close();
  }

  //open_ddFile() {
  //  //// Drag and Drop Files
  //  var that = this;
  //  //this.sharedData.selEestrictedList = { type: "update", data: that.myAcclist['accounts'].filter(x => { return parseInt(x.accountId) == parseInt(this.individual_selectedAcc) })[0] };
  //  //console.log(this.individual_selectedAcc, 'individual_selectedAcc')
  //  this.dialog.open(dragDropComponent, { width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" });
  //}

  confirmationDialog() {
    var mastemp = this.accountService.restrictedListAllData.value;
    var localtemp = this.tableDataSource.data;
    var results = this.stockCompare(mastemp, localtemp);
    if (results.length > 0) {
      $('#resStockConfirmPopup').modal('show');
    } else {
      this.closeModal();
    }
  }
  stockCompare(mastemp: any, localtemp: any) {
    return localtemp.filter((object1: any) => {
      return !mastemp.some((object2: any) => {
        return object1.stockKey === object2.StockKey;
      });
    });
  }
  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }

  checkListNameValid() {
    if (isNullOrUndefined(this.listName) || this.listName.length == 0) {
      return true;
    } else {
      return false;
    }
  }

  invalidCount: number = 0;
  saveList() {
    this.checkSaveTrigger = true;
    this.invalidCount = 0;
    if (
      isNotNullOrUndefined(this.tableDataSource.data) &&
      this.checkinvalidRow(this.tableDataSource.data) &&
      this.tableDataSource.data.length > 0
    ) {
      $('#resStocksaveCheckModal').modal('show');
    } else if (isNullOrUndefined(this.tableDataSource.data) || this.tableDataSource.data.length == 0) {
      this.toastr.info('Please add minimum one stock', '', { timeOut: 5000 });
    } else if (!this.checkinvalidRow(this.tableDataSource.data)) {
      this.invalidCount = this.tableDataSource.data.filter((x: any) => isNotNullOrUndefined(x['misStock'])).length;
      $('#resStockCheckModal').modal('show');
    }
  }

  saveCheck() {
    var dt = this.tableDataSource.data.filter((xu: any) => isNullOrUndefined(xu['misStock']));
    this.tableDataSource = new MatTableDataSource(dt);
    this.uploadDataCount = dt.length;
    this.PostRestrictedList();
  }

  checkinvalidRow(data: any) {
    if (data.filter((x: any) => isNotNullOrUndefined(x['misStock'])).length > 0) { return false; } else { return true; }
  }

  checkSaveTrigger: boolean = false;
  checkAccountValid() {
    if (isNotNullOrUndefined(this.selectedAccount) && this.selectedAccount > 0) { return false; } else { return true; }
  };

  checknameValid() {
    var d = this.accountService.restrictedListData.value.filter((x: any) => x.Name == this.listName.trim());
    if (d.length > 0 && this.sharedData.selEestrictedList.type == 'update' && d[0].Id == this.sharedData.selEestrictedList.data.Id) { return false; }
    if (d.length > 0) { return true; } else { return false; }
  }

  PostRestrictedList() {
    var that = this;
    var data: any[] = [];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var nDat = this.tableDataSource.data.filter((xu: any) => isNullOrUndefined(xu['misStock']));
    nDat.forEach((x: any) => {
      var d = {
        id: 0,
        rlid: 0,
        accid: that.selectedAccount,
        stockkey: x.stockKey,
        isin: x.isin,
        ticker: x.ticker,
        status: 'A',
        userid: parseInt(userid),
      };
      data.push(d);
    });
    var postRest=this.dataservice.PostRestrictedList(data).pipe(first())
      .subscribe((res) => {
        this.toastr.success('Stocks have been updated successfully', '', {
          timeOut: 4000,
        });
        this.dialogref.close();
        // $('#showMatLoaderAccounts').hide();
      });
    this.subscriptions.add(postRest);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.tableDataSource.data);
  }

  remcomparer(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          //return (other.stockKey == current.stockKey || other.companyName == current.companyName
          //  || other.ticker == current.ticker || other['1'] == current['1'] || other['2'] == current['2']);
          return JSON.stringify(current) == JSON.stringify(other)
        }).length == 0
      );
    };
  }

  checkShowHeadIcon() {
    if (
      isNotNullOrUndefined(this.selection) &&
      isNotNullOrUndefined(this.selection.selected) &&
      this.selection.selected.length > 0
    ) {
      return true;
    } else {
      return true;
    }
  }

  deleteConfTxt: string = '';
  conforClearAll() {
    this.deleteConfTxt = this.sharedData.checkMyAppMessage(5, 24);
    const data = this.tableDataSource.data.slice().map((a: any) => ({ ...a }));
    const remComp = this.selection.selected.map((a: any) => ({ ...a }));
    if (remComp.length > 0 && data.length > remComp.length) {
      $('#resStockdeleteallModal').modal('show');
    } else if (remComp.length == data.length) {
      $('#clearAllModal').modal('show');
    } else {
      this.toastr.info(
        'You are about to confirm without a selection. Please select minimum of one stock',
        '',
        { timeOut: 4000 }
      );
    }
  }

  clearAll() {
    let userid = atob(
      atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
    );
    var data = { accid: this.selectedAccount, userid: parseInt(userid) };
    this.dataservice
      .PostDARList(data)
      .pipe(first())
      .subscribe((res: any) => {
        this.GetRestrictedList();
        this.toastr.info('Selected stock(s) have been removed', '', {
          timeOut: 4000,
        });
      });
  }

  remSelAll() {
    var that = this;
    if (this.checkShowHeadIcon()) {
      const data = this.tableDataSource.data.slice().map((a: any) => ({ ...a }));
      const remComp = this.selection.selected.map((a: any) => ({ ...a }));
      try {
        var dd:any = data.filter(that.remcomparer(remComp)).map((a: any) => ({ ...a }));
        that.tableDataSource = new MatTableDataSource(dd);
        that.uploadDataCount = dd.length;
      } catch (e) {}
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var remData: any[] = [];
      remComp.forEach((x) => {
        var data = this.accountService._restrictedListAllData.filter((xu: any) => xu.StockKey == x.stockKey);
        if (data.length > 0) {
          var dx = { id: data[0].id, userid: parseInt(userid) };
          remData.push(dx);
        }
      });
      if (remData.length > 0) { this.remStockAPI(remData); };
      this.toastr.info('Selected stock(s) have been removed', '', { timeOut: 4000, });
    }
    this.selection.clear();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  private _filterStates(value: string): any {
    var that = this;
    if (isNullOrUndefined(value)) {
      value = '';
    }
    const filterValue: string = value.toString().toLowerCase();
    let FilCompanies = [...this.sharedData._GetlatestBMCompData];
    FilCompanies = FilCompanies.filter(
      (d) =>
        isNotNullOrUndefined(d.ticker) && isNotNullOrUndefined(d.companyName)
    );
    if (value == '') {
      return [];
    } else {
      return FilCompanies.filter(
        (state) =>
          state.ticker.toLowerCase().indexOf(filterValue) === 0 ||
          state.companyName.toLowerCase().indexOf(filterValue) === 0
      );
    }
  }

  checkGroup(d: any) {
    if (isNotNullOrUndefined(d.country)) {
      return d.country;
    }
    return '';
  }

  ngAfterViewInit() {
    var that = this;
    that.tableDataSource = new MatTableDataSource(this.tabledata);
    that.tableDataSource.sort = that.sort;
    $('.searchIco').click(function () {
      $('.searchIn').val('');
    });
  }

  toCamelCase = function (str: any) {
    return str
      .replace(/\s(.)/g, function ($1: any) {
        return $1.toLowerCase();
      })
      .replace(/\s/g, '')
      .replace(/^(.)/, function ($1: any) {
        return $1.toUpperCase();
      });
  };

  toUpper(o: any) {
    var that = this;
    var newO: any, origKey: any, newKey: any, value: any;
    if (o instanceof Array) {
      return o.map(function (ev: any, value: any) {
        if (typeof value === 'object') {
          value = ev.toCamel(value);
        }
        return value;
      });
    } else {
      newO = {};
      for (origKey in o) {
        if (o.hasOwnProperty(origKey)) {
          newKey = (
            origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey
          ).toString();
          value = o[origKey];
          if (
            value instanceof Array ||
            (value !== null && value.constructor === Object)
          ) {
            value = this.toUpper(value);
          }
          newO[newKey] = value;
        }
      }
    }
    return newO;
  }
  account = [];
  ngOnInit(): void {
    this.selectedAccount = parseInt(
      this.sharedData.selEestrictedList.data.accountId
    );
    this.accountService.restrictedListAllData.next([]);
    this.GetRestrictedList();
    //var getRebalancesPopupData = this.sharedData.dragDropData.subscribe(data => {
    //  if (data.length > 0) {
    //    var tableHeaders = Object.keys(data[0]);
    //    this.loadTableData(data, tableHeaders);
    //  }
    //});
    //if (this.sharedData.selEestrictedList.type != 'new') { this.loadData(this.sharedData.selEestrictedList.data); }
    $('.modal--custom').on('show.bs.modal', function (e: any) {
      setTimeout(function () {
        $('.modal-backdrop').addClass('modal-backdrop--custom');
      });
    });
  }
  savedRecords: number = 0;
  GetRestrictedList() {
    this.dataservice
      .GetRestrictedList(this.selectedAccount)
      .pipe(first())
      .subscribe((res) => {
        this.savedRecords = parseInt(res.length);
        this.accountService.restrictedListAllData.next(res);
        this.loadData();
      });
  }

  checkDownloadBtnshow() {
    if (isNotNullOrUndefined(this.accountService.restrictedListAllData.value) &&
      this.accountService.restrictedListAllData.value.length > 0 && this.tabledata.length > 0)
    { return true; } else { return false; }
  }

  downloadFile() {
    var that = this;
    var resData = that.tableDataSource.data.map((a: any) => ({ ...a })).filter((x: any) => isNullOrUndefined(x['misStock']));
    if (resData.length > 0) {
      var flName = this.sharedData.selEestrictedList.data.displayName
        .replace(' ', '_')
        .replace(',', '_')
        .replace('__', '_');
      let new_workbook = new Workbook();
      var ws = new_workbook.addWorksheet('Restricted List');
      var name: any;
      var date: any;
      name = this.sharedData.selEestrictedList.data.displayName;
      date = this.sharedData.dateFormate(new Date());
      ws.addRow(['Account Name', name]);
      ws.addRow(['Account', this.sharedData.selEestrictedList.data.accountVan]);
      ws.addRow(['Created date', date]);
      ws.addRow([]);
      var tabBody: any = [];
      resData.forEach((item: any) => {
        tabBody.push([item.companyName, item.ticker, item.country]);
      });
      var header = ws.addRow(['Company Name', 'Ticker', 'Country']);
      header.font = { bold: true };
      tabBody.forEach((d: any, i: any) => {
        ws.addRow(d);
      });
      ws.addRow([]);
      ws.addRow(['For Internal Use Only']).font = { bold: true };
      //Disclosures 1
      if (that.sharedData.compDis.length > 0) {
        var ds = new_workbook.addWorksheet('Disclosure I');
        ds.addRow(['Disclosure I']).font = { bold: true };
        ds.mergeCells(ds.rowCount, 1, ds.rowCount, 10);
        that.sharedData.compDis.forEach((du) => {
          ds.addRow(du).alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true,
          };
          ds.mergeCells(ds.rowCount, 1, ds.rowCount + 3, 10);
        });
        ds.addRow([]);
        ds.addRow(['For Internal Use Only']).font = { bold: true };
      }

      //Disclosures 2
      if (
        isNotNullOrUndefined(that.sharedData.excelDisclosures.value) &&
        that.sharedData.excelDisclosures.value.length > 0
      ) {
        var ds1 = new_workbook.addWorksheet('Disclosure II');
        ds1.addRow(['Disclosure II']).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, ds1.rowCount, 10);
        var Disclosures: any = [];
        that.sharedData.excelDisclosures.value.forEach((item: any) => {
          Disclosures.push([item.disclosure]);
        });
        Disclosures.forEach((du: any) => {
          ds1.addRow(du).alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true,
          };
          ds1.mergeCells(ds1.rowCount, 1, ds1.rowCount + 3, 10);
        });
        ds1.addRow([]);
        ds1.addRow(['For Internal Use Only']).font = { bold: true };
      }
      let d = new Date();
      var dates =
        this.sharedData.formatedates(d.getMonth() + 1) +
        '_' +
        this.sharedData.formatedates(d.getDate()) +
        '_' +
        d.getFullYear();
      var fileName = this.sharedData.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, fileName + '.xlsx');
      });
    }
  }

  loadData() {
    var that = this;
    var data: any = this.accountService._restrictedListAllData.map(
      (a: any) => ({ ...a })
    );
    var tabData: any[] = [];
    if (data.length > 0) {
      data.forEach((x: any) => {
        var nD = this.sharedData._GetlatestBMCompData.filter(
          (xu: any) => xu.stockKey == x.StockKey
        );
        if (nD.length > 0) {
          tabData.push(nD[0]);
        }
      });
    }
    that.tabledata = tabData;
    that.matloader_RS = false;
    that.tableDataSource = new MatTableDataSource(that.tabledata);
    that.uploadDataCount = that.tabledata.length;
    that.tableDataSource.sort = that.sort;
    this.selection.clear();
  }

  onSortData(sort: Sort) {
    const data = this.tableDataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Company': {
          return this.compare(a.companyName, b.companyName, isAsc);
        }
        case 'Ticker':
          return this.compare(a.ticker, b.ticker, isAsc);
        case 'Country':
          return this.compare(a.country, b.country, isAsc);
        case 'ISIN':
          return this.compare(a.isin, b.isin, isAsc);
        default:
          return 0;
      }
    });
    this.tableDataSource.data = this.sortedData;
  }

  remStockLoval() {
    const data = this.tableDataSource.data.slice();
    var index = [...data].findIndex(
      (x) => x.stockKey == this.deleteRow.stockKey
    );
    if (index > -1) {
      data.splice(index, 1);
      this.tableDataSource.data = data;
      var msg =
        this.deleteRow.companyName +
        ' (' +
        this.deleteRow.ticker +
        ') is removed.';

      this.toastr.success(msg, '', { timeOut: 4000 });
    }
  }

  remStockAPI(data: any) {
    this.dataservice
      .PostDRList(data)
      .pipe(first())
      .subscribe((res) => {
        this.selection.clear();
        this.GetRestrictedList();
      });
  }

  filterchanged(val: any) { }

  compare(a: any, b: any, isAsc: any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  importData(evt: any) {
    var that = this;
    var data = [];
    this.displayedColumns = [];
    this.dropdownvalues = [];
    var imFile: any = document.getElementById('importFile');
    var fileType = imFile['files'].item(0)['name'].split('.').pop();
    if (evt.target.files.length != 0) {
      if (fileType === 'xlsx' || fileType === 'xls') {
        var selectedFile = evt.target.files[0];
        var reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = function (event) {
          var dataa: any = reader.result;
          try {
            var fileToJson: any = [];
            var wb = new Workbook();
            wb.xlsx.load(dataa).then((workbook) => {
              workbook.eachSheet((sheet, id) => {
                sheet.eachRow((row, rowIndex) => {
                  fileToJson.push({ ...row.values });
                });
              });
              try {
                that.loadTableData(fileToJson, null);
              } catch (e) {}
            });
          } catch (e) {}
        };
      } else if (fileType === 'csv' || fileType === 'txt') {
        var selectedFile = evt.target.files[0];
        var reader = new FileReader();
        reader.readAsText(selectedFile);
        reader.onload = function (event) {
          var fileToJson: any = [];
          var dataa: any = reader.result;
          try {
            dataa.split('\n').forEach((d: any, i: any) => {
              if (isNotNullOrUndefined(d) && d != '') {
                var fDt = d.replace('\r', '').split(',');
                fileToJson.push({ ...fDt });
              }
            });
            that.loadTableData(fileToJson, null);
          } catch (e) {}
        };
      } else {
        that.toastr.success('File not Supported', '', { timeOut: 4000 });
      }
    }
    this.importFiles.nativeElement.value = null;
  }
  uploadDataCount: any;
  ischeckbutton: boolean = true;
  loadTableData(fileToJson: any, head: any) {
    var that = this;
    var misStock: any = [];
    var checkUpload: boolean = false;
    if (fileToJson.length > 1) {
      var compKey: any = null;
      var tickerKey: any = null;
      if (isNotNullOrUndefined(head) && head.length > 0) {
        checkUpload = true;
        for (const [key, value] of Object.entries(head)) {
          if (value?.toString().toLowerCase().indexOf('company') == 0) {
            compKey = key;
          } else if (
            value?.toString().toLowerCase().indexOf('ticker') == 0 ||
            value?.toString().toLowerCase().indexOf('symbol') == 0
          ) {
            tickerKey = key;
          }
        }
      } else {
        checkUpload = false;
        for (const [key, value] of Object.entries(fileToJson[0])) {
          if (value?.toString().toLowerCase().indexOf('company') == 0) {
            compKey = key;
          } else if (
            value?.toString().toLowerCase().indexOf('ticker') == 0 ||
            value?.toString().toLowerCase().indexOf('symbol') == 0
          ) {
            tickerKey = key;
          }
        }
      }

      if (isNullOrUndefined(compKey)) { compKey = ''; };
      if (isNullOrUndefined(tickerKey)) { tickerKey = ''; };
      if (compKey != '' || tickerKey != '') {
        fileToJson.forEach((d: any, i: any) => {
          if (i > 0 && !checkUpload) {
            var fT: any = [];
            if (isNotNullOrUndefined(tickerKey) && tickerKey != '') {
              fT = [...that.sharedData._GetlatestBMCompData].filter((x) => x.ticker == d[tickerKey]);
              if (fT.length == 0) { fT = [...that.sharedData._selResData].filter((x) => x.ticker == d[tickerKey]); }
            }
            var fc: any = [];
            if (isNotNullOrUndefined(compKey) && compKey != '') {
              fc = [...that.sharedData._GetlatestBMCompData].filter((x) => x.companyName.toLowerCase() == d[compKey].toLowerCase());
              if (fc.length == 0) { fc = [...that.sharedData._selResData].filter((x) => x.companyName.toLowerCase() == d[compKey].toLowerCase()); }
            }

            if (fT.length > 0) {
              if (that.tabledata.filter((x: any) => x.stockKey == fT[0].stockKey).length == 0) { that.tabledata.push(fT[0]); };
            } else if (fc.length > 0) {
              if (that.tabledata.filter((x: any) => x.stockKey == fc[0].stockKey).length == 0) { that.tabledata.push(fc[0]); };
            } else {
              misStock.push(d);
              d['ticker'] = d[tickerKey];
              d['companyName'] = d[compKey];
              d['misStock'] = true;
              that.tabledata.push(d);
            }
          }
          /////*** Customize Your Data ***//////
          if (checkUpload) {
            try {
              var fT: any = [...that.sharedData._GetlatestBMCompData]
                .filter((x) => that.convertToLowerCase(x.ticker) == that.convertToLowerCase(d[head[tickerKey]]));

              if (fT.length == 0) {
                fT = [...that.sharedData._selResData].filter((x) => that.convertToLowerCase(x.ticker) == that.convertToLowerCase(d[head[tickerKey]]));
              }
              var fc: any = [...that.sharedData._GetlatestBMCompData]
                .filter((x) => that.convertToLowerCase(x.companyName) == that.convertToLowerCase(d[head[compKey]]));

              if (fc.length == 0) {
                fc = [...that.sharedData._selResData].filter((x) => that.convertToLowerCase(x.companyName) == that.convertToLowerCase(d[head[compKey]]));
              }
              if (fT.length > 0) {
                if (that.tabledata.filter((x: any) => x.stockKey == fT[0].stockKey).length == 0) { that.tabledata.push(fT[0]); }
              } else if (fc.length > 0) {
                if (that.tabledata.filter((x: any) => x.stockKey == fc[0].stockKey).length == 0) { that.tabledata.push(fc[0]); }
              } else {
                misStock.push(d);
                d['ticker'] = d[head[tickerKey]];
                d['companyName'] = that.checkNull(d[head[compKey]]);
                d['misStock'] = true;
                that.tabledata.push(d);
              }
            } catch (error) {}
          }
        });
        this.toastr.success(this.sharedData.checkMyAppMessage(5, 25), '', {
          timeOut: 4000,
        });
      } else {
        this.toastr.success(this.sharedData.checkMyAppMessage(5, 26), '', {
          timeOut: 4000,
        });
      }
    } else {
      var compKey: any = null;
      var tickerKey: any = null;
      for (const [key, value] of Object.entries(fileToJson[0])) {
        if (value?.toString().toLowerCase().indexOf('company') == 0) {
          compKey = key;
        } else if (value?.toString().toLowerCase().indexOf('ticker') == 0) {
          tickerKey = key;
        }
      }
      if (isNullOrUndefined(compKey) || isNullOrUndefined(tickerKey)) {
        this.toastr.success(this.sharedData.checkMyAppMessage(5, 26), '', {
          timeOut: 4000,
        });
      } else {
        this.toastr.success(this.sharedData.checkMyAppMessage(5, 27), '', {
          timeOut: 4000,
        });
      }
    }
    that.tableDataSource = new MatTableDataSource(that.tabledata);
    that.uploadDataCount = that.tabledata.length;
    this.selection.clear();
    that.matloader_RS = false;
  }
  convertToLowerCase(data: any) {
    if (isNotNullOrUndefined(data)) {
      return data.toLowerCase();
    } else {
      return data;
    }
  }
  checkNull(data: any) {
    if (isNotNullOrUndefined(data)) {
      return data;
    } else {
      return '';
    }
  }
  checkBr(d: any) {
    if (isNotNullOrUndefined(d['misStock']) && d['misStock']) {
      return 'nobg';
    } else {
      return '';
    }
  }

  addSearchComp(d: any) {
    const data = this.tableDataSource.data.slice();
    if ([...data].filter((x) => x.stockKey == d.stockKey).length == 0) {
      data.push(d);
      this.tableDataSource = new MatTableDataSource(data);
      var msg = d.companyName + ' (' + d.ticker + ') is added.';
      this.toastr.success(msg, '', { timeOut: 4000 });
    } else {
      var msg = d.companyName + ' (' + d.ticker + ') is already added.';
      this.toastr.info(msg, '', { timeOut: 4000 });
    }
    this.tabledata = data;
    this.uploadDataCount = data.length;
    this.selection.clear();
  }

  onCompanyClick(val: any) {
    var that = this;
    if (isNotNullOrUndefined(val)) { this.addSearchComp(val); };
    this.searchFormCtrl.reset();
  }
  onTabCompanyClick(val: any, rowVal: any) {
    var that = this;
    var d: any = val.option.value;
    const data = this.tableDataSource.data.slice();
    var ind = [...data].findIndex(
      (x) => x.companyName == rowVal.companyName && x.ticker == rowVal.ticker
    );
    if (
      [...data].filter((x) => x.stockKey == d.stockKey).length == 0 &&
      ind > -1
    ) {
      data[ind] = d;
      this.tabledata = data;
      this.tableDataSource.data = data;
      var msg = d.companyName + ' (' + d.ticker + ') is added.';
      this.toastr.success(msg, '', { timeOut: 4000 });
    } else {
      var msg = d.companyName + ' (' + d.ticker + ') is already added.';
      this.toastr.info(msg, '', { timeOut: 4000 });
    }
    that.tabFormCtrl.reset();
  }

  //inputFocused(eV, type) {}

  //onKeydownEnter(e) {
  //  if (e.target.value != "") {
  //    let FilCompanies = [...this.sharedData._GetlatestBMCompData];
  //    FilCompanies = FilCompanies.filter(d => isNotNullOrUndefined(d.ticker) && isNotNullOrUndefined(d.companyName));
  //    let Comps = FilCompanies.filter(state => (state.ticker != null && state.ticker.toLowerCase().indexOf(e.target.value) === 0) || state.companyName.toLowerCase().indexOf(e.target.value) === 0);
  //    if (Comps.length > 0) { this.addSearchComp(Comps[0]); };
  //  }
  //  this.searchFormCtrl.reset();
  //  this.filteredCompanies = this.searchFormCtrl.valueChanges.pipe(startWith(''), map((state: any) => state.length >= 1 ? this._filterStates(state) : []));
  //  console.log(this.filteredCompanies);
  //}

  checkShowTab() {
    if (
      isNotNullOrUndefined(this.tableDataSource) &&
      isNotNullOrUndefined(this.tableDataSource.data) &&
      this.tableDataSource.data.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  inputValue: string = '';
  inputValue2: string = '';
  clearInput() {
    this.inputValue = '';
  }
  clearInput2() {
    this.inputValue2 = '';
  }
}
