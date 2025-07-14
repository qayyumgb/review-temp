import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription, first } from 'rxjs';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { Workbook } from 'exceljs';
import {
  DropzoneComponent, DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import { Papa } from 'ngx-papaparse';
import xml2js from 'xml2js';
import * as XLSX from 'xlsx';
import CSV from 'csvtojson';
declare var $: any;
// @ts-ignore
import { saveAs } from "file-saver";
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '../../../../core/services/data/data.service';
import { TradeDirectComponent } from '../../../trade-direct/trade-direct.component';
import { DialogControllerService } from '../../../../core/services/dialogContoller/dialog-controller.service';
import { FormControl } from '@angular/forms';
import { noDoubleSpaceValidator } from '../../../../core/layout/nav-menu/nav-menu.component';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'drag-drop-file',
  templateUrl: './drag-drop.component.html',
  styleUrl: './drag-drop.component.scss'
})
export class DragDropComponent {
  classFlag: boolean = false;
  showCenterLoader: boolean = false;
  subscriptions = new Subscription();
  uploadHeader_C: any = [];
  uploadHeader_T: any = [];
  selectedHead_C: string = '';
  selectedHead_S: string = '';
  selectedHead_T: string = '';
  selectedHead_BS: string = '';
  selectedHead_shares: string = '';
  selectedOptionRadio: string = '';
  commonErrorJsonValue: string = '';
  selectedOptions: any = { ticker: '', symbol: '', quantity: '', shares: '', action:'' };
  displayedColumns = ['companyName', 'ticker', 'quantity', 'action','Status'];
  findSelectedOptions: any = [];
  SavedDirectTradeData: any = [];
  showSpinner_loaded: boolean = false;
  saveMatLoader: boolean = false;
  showTradeBtn: boolean = false;
  errorMsgFileUploadStatus: any;
  iserrorMsgFileStatus: boolean = false;
  inputValue: string = '';
  glbSearch = new FormControl('');
  constructor(private datepipe: DatePipe, private dialogController: DialogControllerService, private papa: Papa, @Inject(MAT_DIALOG_DATA) public modalData: any, public sharedData: SharedDataService, private dataservice: DataService, private dialogref: MatDialogRef<DragDropComponent>, private toastr: ToastrService, public dialog: MatDialog) {
    this.showSpinner_loaded = true;
    this.glbSearch.setValidators([noDoubleSpaceValidator()]);
    this.glbSearch.valueChanges.subscribe((srcValue: any) => { this._filter(srcValue) });
  }
  close() { this.dialogref.close(); }
  ngOnDestroy() {
    this.isResetBtn = true;
    this.subscriptions.unsubscribe();
    this.commonErrorJsonValue = '';
    this.sharedData.userEventTrack('Direct Trade', 'close module', 'close module', 'close module click');
    try { $('#errorsuggestedTickers').modal('hide'); } catch (e) { }
    try { $('#commonErrorJsonConvert').modal('hide'); } catch (e) { }
    try { $('#errorTradeVerifyPopup').modal('hide'); } catch (e) { }
    try { $('#deleteConf').modal('hide'); } catch (e) { }
    try { $('#resetDataModal').modal('hide'); } catch (e) { }
    try { $('#uploadWar').modal('hide'); } catch (e) { }
    try { $('#convertHeader').modal('hide'); } catch (e) { }
    try { $('#resStockVerifyPopup').modal('hide'); } catch (e) { }
  }
  ngAfterViewInit() {}

  toCamelCase = function (str: any) {
    return str
      .replace(/\s(.)/g, function ($1: any) { return $1.toLowerCase(); })
      .replace(/\s/g, '')
      .replace(/^(.)/, function ($1: any) { return $1.toUpperCase(); });
  }
  jsonConvertErrorPopup(value: string) {
    var that = this;
    that.commonErrorJsonValue = value;
    //console.log(value);
    $('#commonErrorJsonConvert').modal('show');
    //this.toggleAutoReset();
  }

  account = [];
  currentAccount: any;
  loadDraggedData: any = [];
  ngOnInit(): void {
    var that = this;
    
    that.showSpinner_loaded = true;
    //console.log('modalData', this.modalData)
    this.currentAccount = this.modalData.currentAccount;
    this.sharedData.dragDropData.next([]);
    this.sharedData.userPortfolioDragDrop.next([]);
    this.sharedData.showCircleLoader.next(false);
    that.getDirectTradeData();
    //var dragDropData = this.sharedData.dragDropData.subscribe(res => {
   
    //  if (res.length > 0) {
    //    that.loadDraggedData = res;
    //    that.loadMainTable(res);
    //  } else {
    //    that.loadDraggedData = res;
    //  }
    //})
    //this.subscriptions.add(dragDropData);
    //this.sharedData.viewPortFolio.subscribe(res => {
    
    //  this.fromUserPortfolio = res;
    //})
    //this.dropZoneFile();
  }
  dataSource_DD: MatTableDataSource<any> | any;
  selection = new SelectionModel<any>(true, []);
  data_dup: any;
  uniqueTickers: any[] = [];
  
loadMainTable(dta: any) {
  //console.log(dta, 'loadMainTable')
  if (dta.filter((x: any) => x['dbFlag'] == 'Y' || x['dnsFlag'] == 'Y' || x['rlFlag'] == 'Y' || x['tickerValidFlag']=='N').length==0) { this.showTradeBtn = true; }
  this.dataSource_DD = new MatTableDataSource<any>(dta);
  this.data_dup = this.dataSource_DD.data;
}

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource_DD.data.length;
    return numSelected === numRows;
  }

  removeSelectedRows() {
    //this.selection.selected.forEach(item => {
    //  let index: number = this.data_dup.findIndex((d: any) => d === item);
    //  this.dataSource_DD.data.splice(index, 1);
    //  this.dataSource_DD = new MatTableDataSource<Element>(this.dataSource_DD.data);
    //  var removedData = this.dataSource_DD.data;
    //});
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data:any = [...this.selection.selected];
    if (data.length > 0) {
      var da: any = [];
      data.forEach((x: any) => { da.push({ "rowId": parseInt(x['rowId']), "accountId": parseInt(this.currentAccount.accountId), "userid": parseInt(userid) }) });
      this.dataservice.PostRemoveDtl(da).pipe(first()).subscribe((res: any) => {
        if (this.dataSource_DD.data.length == da.length) {
          this.SavedDirectTradeData = [];
          this.toggleAutoReset();
        }
        this.getDirectTradeData();
        this.selection = new SelectionModel<Element>(true, []);
      }, (error: any) => { this.toastr.info('Please try again...', '', { timeOut: 4000 }); });      
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource_DD.data.forEach((row: any) => this.selection.select(row));
  }
  sortedData: any = [];
  onSortTrd(sort: any) {
    //displayedColumns = ['companyName', 'ticker', 'quantity', 'action','Status'];
    const data = this.dataSource_DD.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a: any, b: any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'ticker': { return this.compare(a.ticker, b.ticker, isAsc); }
        case 'companyName': return this.compare(a.company, b.company, isAsc);
        case 'action': return this.compare(a.buySell, b.buySell, isAsc);
        case 'quantity': return this.compare(a.shares, b.shares, isAsc);
        default: return 0;
      }
    });
    this.dataSource_DD.data = this.sortedData;
  }
  compare(a: any, b: any, isAsc: any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openDirectUpload() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var hdrId:any =(isNotNullOrUndefined(this.loadDraggedData) && this.loadDraggedData.length > 0 && isNotNullOrUndefined(this.loadDraggedData[0]['hdrId'])) ? this.loadDraggedData[0]['hdrId'] : 0;
    var data = { "hdrId": parseInt(hdrId), "accountId": parseInt(this.currentAccount.accountId), "userid": parseInt(userid) };
    this.dataservice.PostRemoveHdrDtl(data).pipe(first()).subscribe((res: any) => {
      this.SavedDirectTradeData = [];
      this.toggleAutoReset();
      this.getDirectTradeData();
    }, (error: any) => { this.toastr.info('Please try again...', '', { timeOut: 4000 }); });
    this.sharedData.userEventTrack('Direct Trade', 'upload file reset', 'upload file reset', 'upload file click');
  }

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    acceptedFiles: '.xls, .csv, .json, .xml, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    uploadMultiple: false,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    addRemoveLinks: true,
    maxFilesize: 50,
  };

  @ViewChild(DropzoneComponent, { static: false }) componentRef?: DropzoneComponent;
  @ViewChild(DropzoneDirective, { static: false }) directiveRef?: DropzoneDirective;
  public onUploadInit(args: any): void { }
  isResetBtn: boolean = false;
  public toggleAutoReset(): void {
    this.isResetBtn = true;
    this.config.autoReset = this.config.autoReset ? null : 2000;
    this.config.errorReset = this.config.errorReset ? null : 2000;
    this.config.cancelReset = this.config.cancelReset ? null : 2000;
    this.xlsContent = '';
    if (this.dataTextarea) {
      this.dataTextarea.nativeElement.value = '';
    }
    this.tableData = [];
    this.tableHeaders = [];
    this.findSelectedOptions = [];
    setTimeout(() => { this.isResetBtn = false; },500)
    this.sharedData.userEventTrack('Direct Trade', 'Reset Table', 'Reset Table', 'Reset Table Btn Click');
  }
 
  resetTextarea() {
    this.xlsContent = '';
    if (this.dataTextarea) {
      this.dataTextarea.nativeElement.value = '';
    }
    this.tableData = [];
    this.tableHeaders = [];
    this.findSelectedOptions = [];
    setTimeout(() => { this.isResetBtn = false; }, 500)
  }
  @ViewChild('dataTextarea') dataTextarea: ElementRef | undefined;
  //const { parse } = require('json2csv');
  //jsonData: any;
  tableHeaders: string[] = [];
  tableHeadersCustom: string[] = [];
  customHeaders: any = [];
  tableData: any[] = [];
  xlsContent: string = '';
  jsonOutput: any = null;
  clickedHeader: any;
  mapHeaderChange(eve: any, type: any) {
    var that = this;
    that.selectedOptionRadio = type;
    //that.selectedOptions[type] = that.clickedHeader;
    //if (type == 'ticker') {

    //}
  }
  loadMapHeader() {
    var that = this;
    const filtersameHeader = this.findSelectedOptions.filter((x: any) => x.headerName === this.clickedHeader);
    if (filtersameHeader.length > 0) { } else {
      // Get all radio buttons in the group
      const radioButtons: NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[name="group1"]`);
      // Loop through each radio button
      radioButtons.forEach((radioButton: HTMLInputElement) => {
        // If the radio button is not the one that was clicked, uncheck it
        radioButton.checked = false;
      });
      this.selectedOptionRadio = '';
    }
  }
  clearMapHeader() {
    const headerName = this.clickedHeader;
    const filteredOptions = this.findSelectedOptions.filter((option: any) => option.headerName !== headerName);
    this.findSelectedOptions = filteredOptions;
    this.selectedOptionRadio = '';
    this.selectedHead_T = '';
    this.selectedHead_BS = '';
    this.selectedHead_S = '';
  }
  saveMapHeaderChange() {
    var that = this;
    var headerName = that.clickedHeader;
    if (that.selectedOptionRadio !== '') {
      var option: any = that.selectedOptionRadio;
      that.selectedOptions[option] = headerName;
      var pushSelectedHeader = { headerName: headerName, selectedOption: that.selectedOptionRadio };
      var filtersameHeader = that.findSelectedOptions.filter((x: any) => x.headerName == headerName);
      if (filtersameHeader.length > 0) {
        that.findSelectedOptions = that.findSelectedOptions.map((x: any) => (x.headerName === headerName) ? pushSelectedHeader : x)
        that.updateRestrictTable();
      } else {
        that.findSelectedOptions.push(pushSelectedHeader);
        that.updateRestrictTable();
      }
    }
    this.sharedData.userEventTrack('Direct Trade', 'map table header', 'map table header', 'map table header');
  }
  resetData() { }
  mapHeaderCheckbox(value: any) {
    var that = this;
    if (isNotNullOrUndefined(this.findSelectedOptions) && this.findSelectedOptions.length > 0) {
      const filtersameHeader = this.findSelectedOptions.filter((x: any) => x.headerName === this.clickedHeader && x.selectedOption === value);
      return filtersameHeader.length > 0;
    } else { return false; }

  }
  disableMapHeaderCheckbox(value: any) {
    var that = this;
    if (isNotNullOrUndefined(this.findSelectedOptions) && this.findSelectedOptions.length > 0) {
      var headerName = that.clickedHeader;
      const filtersameHeader = this.findSelectedOptions.filter((x: any) => x.headerName.toLowerCase() !== headerName.toLowerCase() && x.selectedOption.toLowerCase() === value.toLowerCase());

      return filtersameHeader.length > 0;
    } else { return false }
  }
  updateTableHeaders() {
    var csvInput = this.customHeaders.toLowerCase();

    try {
      const jsonData = [];
      var str = csvInput;
      var str_array = str.split(',');
      for (var i = 0; i < str_array.length; i++) {
        // Trim the excess whitespace.
        str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
        // Add additional code here, such as:
        jsonData.push(str_array[i]);
      }
      this.tableHeadersCustom = jsonData;
    } catch (error) {

    }
  }
  convertData() {
    this.tableData = [];
    this.tableHeaders = [];
    this.findSelectedOptions = [];
    this.loadMapHeader();
    if (this.dataTextarea?.nativeElement?.value) {
      const data = this.dataTextarea.nativeElement.value;
      //console.log('convertData', data);
      if (data) {
        if (this.isJSON(data)) { ///////// JSON
          var jsonData = JSON.parse(data);
          var convert = jsonData;
          this.convertJsonToTable(convert);
        } else if (this.isXML(data)) { ///////// XML
          this.convertXMLtoJSON(data);
        } else { ///////// CSV or XLS
          this.papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              this.parseCsvToJson(data);

              //this.jsonData = result.data;
            },
            error: (error) => {
              console.error('Error converting data to JSON:', error);
            }
          });
        }
      }
      else {
        this.toggleAutoReset();
        this.toastr.info('Please upload a file in one of the supported formats: Excel (XLS, XLSX), JSON, XML, or CSV.', '', { timeOut: 4000 });
        
      }
    } else {
      this.toggleAutoReset();
      this.toastr.info('Please upload a file in one of the supported formats: Excel (XLS, XLSX), JSON, XML, or CSV.', '', { timeOut: 4000 });
     
    }
    this.sharedData.userEventTrack('Direct Trade', 'View Table', 'View Table', 'View Table Btn Click');
  }
  convertJsonToTable(jsonData: any) {
    var that = this;
    let index = 1; // Initialize index for generating headers
    try {
      const replaceArrayKeys = (dataArray: any) => {
        const headers = Object.keys(dataArray[0]);
        return dataArray.map((obj: any) => {
          const newObj: any = {};
          for (const key in obj) {
            const numericKey = parseInt(key);
            const newKey = isNaN(numericKey) ? key : 'header' + (numericKey + 1);
            newObj[newKey] = obj[key];
          }
          // If headers are available, use them
          //if (headers.length > 0) {
          //  headers.forEach((header, idx) => {
          //    newObj[header] = obj[idx];
          //  });
          //} else {
          //  for (const key in obj) {
          //    newObj[`header${key}`] = obj[key];
          //  }
          //}
          return newObj;
        });
      };
      const replaceSpacesWithUnderscores = (obj: any) => {
        const newObj: any = {};
        for (const key in obj) {
          var takeshare = key.replace(/\s/g, "");
          if (takeshare == 'noofshares') {
            var remove = takeshare.substring(4, 10)
            newObj[remove] = obj[key];
          }
          else {
            newObj[takeshare] = obj[key];
          }
        }
        return newObj;
      };
      const dataWithUnderscores = jsonData.map(replaceSpacesWithUnderscores);
      var parsedData = replaceArrayKeys(dataWithUnderscores);
      //console.log('parsedData', parsedData)
      //// Get Header names using first row
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const allKeys = parsedData.reduce((keys, obj) => {
          Object.keys(obj).forEach(key => {
            if (!keys.includes(key)) {
              keys.push(key);
            }
          });
          return keys;
        }, []);
        this.tableHeaders = allKeys;
        //// Get Header names using first row
        //this.tableHeaders = Object.keys(parsedData[0]);
        if (this.tableHeadersCustom.length > 0 && this.tableHeadersCustom[0] != '') {
          this.tableHeaders = this.tableHeadersCustom;
        }
        const hasInvalidValues = parsedData.some((item: any) =>
          Object.values(item).some((value: any) =>
            typeof value === 'string' ? !value.trim() : !value
          )
        );
        /*Check action buy or sell condition*/
        const hasInvalidActionValues = parsedData.some((item: any) => { 
          //Object.entries(item).some(([key, value]) => {
          //  if (key.toLowerCase() === 'action' || key.toLowerCase() === 'actions') {
          //    return (
          //      typeof value !== 'string' || (value.toLowerCase() !== 'buy' && value.toLowerCase() !== 'sell')
          //    );
          //  }
          //  return typeof value === 'string' ? !value.trim() : !value;
          //})
          if (typeof item !== 'object' || item === null || !item.hasOwnProperty('action')) {
          return true; // Invalid if 'action' key is missing
          }
          // Validate the 'action' key value
          const actionValue = item.action;
          if (typeof actionValue !== 'string' || (actionValue.toLowerCase() !== 'buy' && actionValue.toLowerCase() !== 'sell')) {
            return true;
          }
          return Object.values(item).some((value) =>
            typeof value === 'string' ? !value.trim() : value === undefined || value === null
          );
        });
        /*Check action buy or sell*/
        if (hasInvalidValues) {
          this.jsonConvertErrorPopup('The uploaded file contains empty fields or invalid data. Please ensure all cells are filled correctly and try again.');
         
        } else {
          if (hasInvalidActionValues) {
            this.jsonConvertErrorPopup('Invalid value in "action" field. Only "buy" or "sell" are allowed.');
          } else {
            this.tableData = parsedData;
          }
        }
        //this.tableData = parsedData;
        //console.log(this.tableData, 'tableData');
        var tabheadTicker = [...that.tableHeaders].filter(x => (x == 'symbol' || x == 'ticker' || x == 'Ticker' || x == 'Tickers' || x == 'tickers' || x == 'Symbol'));
        var tabheadShares = [...that.tableHeaders].filter(x => (x == 'shares' || x == 'Shares' || x == 'shares' || x == 'share' || x == 'quantity' || x == 'Quantity' || x =='noofShares'));
        var tabheadBuySell = [...that.tableHeaders].filter(x => (x == 'buyorsell' || x == 'BuyorSell' || x == 'action' || x == 'Action'));
        if (tabheadTicker.length > 0) {
          that.selectedHead_T = tabheadTicker[0];
          that.selectedOptionRadio = that.selectedHead_T;
          that.clickedHeader = that.selectedHead_T;
          that.saveMapHeaderChange();
        } else { that.selectedHead_T = "" }
        if (tabheadShares.length > 0) {
          that.selectedHead_S = tabheadShares[0];
          that.selectedOptionRadio = that.selectedHead_S;
          that.clickedHeader = that.selectedHead_S;
          that.saveMapHeaderChange();
        } else { that.selectedHead_S = "" }
        if (tabheadBuySell.length > 0) {
          that.selectedHead_BS = tabheadBuySell[0];
          that.selectedOptionRadio = that.selectedHead_BS;
          that.clickedHeader = that.selectedHead_BS;
          that.saveMapHeaderChange();
        } else { that.selectedHead_BS = "" }
      }
    } catch (error) {
      this.jsonConvertErrorPopup('We encountered an issue while processing your data. Please double-check the format and try again.');
      //console.error('Error converting JSON to table:', error);
    }
  }
  /** XML TO JSON **/
  convertXMLToTable(data: any) {
    try {
      const parsedData = this.convertToLowerCase(data);
      if (parsedData.length > 0) {
        this.tableHeaders = Object.keys(parsedData[0]);

        if (this.tableHeadersCustom.length > 0 && this.tableHeadersCustom[0] != '') {
          this.tableHeaders = this.tableHeadersCustom;
        }
       
        const hasInvalidValues = parsedData.some((item: any) =>
          Object.values(item).some((value: any) =>
            typeof value === 'string' ? !value.trim() : !value
          )
        );
        if (hasInvalidValues) {
          this.jsonConvertErrorPopup('The uploaded file contains empty fields or invalid data. Please ensure all cells are filled correctly and try again.');
         
        } else {
          this.tableData = this.convertToLowerCase(parsedData);
        }
      }
    } catch (error) {
      this.jsonConvertErrorPopup('We encountered an issue while processing your data. Please double-check the format and try again.');
      console.error('Error converting JSON to table:', error);
    }
  }
  private isXML(text: string) {
    // You can add your own logic to detect XML here
    // For simplicity, this example checks if it starts with '<' and ends with '>'
    return text.trim().startsWith('<') && text.trim().endsWith('>');
  }
  private convertXMLtoJSON(xmlData: string) {
    var that = this;

    const parser = new xml2js.Parser({
      explicitArray: false,
      attrkey: '', // Set attributes to an empty string to exclude them
      ignoreAttrs: true, mergeAttrs: false
    });
    parser.parseString(xmlData, (error: any, r: any) => {
      if (error) { } else {
        const times = 5;
        var tempData = r;
        for (let i = 0; i < times; i++) {
          if (Array.isArray(tempData)) {
            tempData = tempData;
            //that.findArrayinXML(tempData);
            break;
          } else {
            for (const [key, value] of Object.entries(tempData)) {
              tempData = this.convertToLowerCase(value);
            };
          }
        }
        //that.jsonData = tempData;
        that.convertXMLToTable(tempData);
      }
    });
  }
  removeSpacesInKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Base case: not an object
    }

    if (Array.isArray(obj)) {
      return obj.map(this.removeSpacesInKeys); // Recursively process arrays
    }

    return Object.keys(obj).reduce((acc, key) => {
      const sanitizedKey = key.replace(/\s+/g, ''); // Remove spaces from keys
      acc[sanitizedKey] = this.removeSpacesInKeys(obj[key]); // Recursively process nested objects
      return acc;
    }, {} as any);
  }
  private isJSON(text: string) {
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }
  private convertToLowerCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertToLowerCase(item));
    } else if (typeof obj === 'object') {
      const result: { [key: string]: any } = {};

      for (const key in obj) {
        const newKey = key.toLowerCase();
        result[newKey] = this.convertToLowerCase(obj[key]);
      }

      return result;
    } else {
      return obj.toLowerCase();
    }
    //if (typeof obj === 'string') {
    //  return obj.toLowerCase();
    //}

    //if (Array.isArray(obj)) {
    //  return obj.map((item) => this.convertToLowerCase(item));
    //}

    //if (typeof obj === 'object') {
    //  for (const key in obj) {
    //    if (obj.hasOwnProperty(key)) {
    //      obj[key] = this.convertToLowerCase(obj[key]);
    //    }
    //  }
    //}

    //return obj;
  }
  onUploadError($event: any) {
    //console.log($event, 'something melt wrong!!');
    if (this.SavedDirectTradeData.length == 0 && !this.isResetBtn) {
      this.jsonConvertErrorPopup('An error occured in the upload. Please try again.');
      this.toggleAutoReset();
    }
  }
  onFileAdded(file: File) {
  
    // Simulate progress manually if needed
    let progress = 0;
    this.resetTextarea();
    $('#dropzoneMatSpinner').show();
    const interval = setInterval(() => {
      progress += 10;
      
      $('.dz-progress .dz-upload').css('width', `${progress}%`)
      if (progress >= 100) {
        clearInterval(interval);
        $('.dz-progress .dz-upload').css('width', '100%')
        $('#dropzoneMatSpinner').hide();
      }
    }, 100);

    // Read the file locally using FileReader
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.readFile(file)
      // Process file content here (e.g., parse JSON or CSV)
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsText(file); // Read file as text or adjust as needed
  }
  onUploadSuccess(event: any) {
    //alert('Media uploaded successful!!');
    const file = event[0];
    this.readFile(file);
    //const allowedExtensions = ['xls', 'csv', 'json', 'xml', 'xlsx'];
    //const fileExtension = file.name.split('.').pop()?.toLowerCase();

    this.sharedData.userEventTrack('Direct Trade', 'drag or upload file', 'drag or upload file', 'drag or upload click');
  }
  filterDataByHeaders(data: any, selectedHeaders: any) {
    return data.map((item: any) => {
      const filteredItem: any = {};
      selectedHeaders.forEach((header: any) => {
        if (item.hasOwnProperty(header)) {
          filteredItem[header] = item[header];
        }
      });
      return filteredItem;
    });
  }
  //downloadAsJson() {
  //  // Selected headers to filter by
  //  const selectedHeaders = ['name', 'age'];

  //  // Filter the JSON data
  //  const filteredData = this.filterDataByHeaders(this.tableData, this.tableHeaders);

  //  const jsonDataAsString = JSON.stringify(filteredData, null, 2);
  //  const blob = new Blob([jsonDataAsString], { type: 'application/json' });
  //  FileSaver.saveAs(blob, 'data.json');
  //}

  //downloadAsXml() {
  //  // Generate XML content (replace with your own XML generation logic)
  //  const xmlData = `<root><name>John Doe</name><age>30</age><city>New York</city></root>`;
  //  const blob = new Blob([xmlData], { type: 'application/xml' });
  //  FileSaver.saveAs(blob, 'data.xml');
  //}

  downloadAsCsv() {
    // Convert JSON to CSV
    const csvData = this.convertDownloadJsonToCsv(this.tableData);

    // Download the CSV file
    this.downloadCsv(csvData, 'data.csv');
  }
  downloadCsv(csvData: any, filename: any) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  convertDownloadJsonToCsv(jsonData: any) {
    // Function to escape a cell value with double quotes if it contains a comma
    const escapeCell = (value: any) => {
      if (value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Extract headers from the first object in the JSON data
    const headers = Object.keys(jsonData[0]);

    // Create the CSV content
    const csv = [
      headers.map(escapeCell).join(','),
      ...jsonData.map((row: any) => headers.map((header) => escapeCell(row[header])).join(',')),
    ];

    return csv.join('\n');
  }

  ConvertToCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }

  //downloadAsCsv() {
  //  const options = {
  //    fields: this.tableHeaders
  //  };

  //  try {
  //    const csv = json2csv(this.tableData, options);
  //    this.downloadFile(csv, 'data.csv', 'text/csv');
  //  } catch (error) {
  //    console.error('Error converting JSON to CSV:', error);
  //  }
  //}

  //downloadFile(data: string, filename: string, mimeType: string) {
  //  const blob = new Blob([data], { type: mimeType });
  //  const url = window.URL.createObjectURL(blob);
  //  const anchor = document.createElement('a');
  //  anchor.href = url;
  //  anchor.download = filename;
  //  anchor.click();
  //  window.URL.revokeObjectURL(url);
  //}

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content: any = reader.result;
      //const contentCheck = e.target?.result as string;
      //if (!contentCheck || contentCheck.trim() === '') {
      //  alert('Empty files are not allowed.');
      //  //file.previewElement.remove(); // Removes the file from Dropzone UI
      //  return;
      //}
      const extension = file.name.split('.').pop();
      if (extension === 'csv') {
        //this.xlsContent = content;
        //this.parseCsvToJson(content);
        this.convertfileCsvToJson(file);
      }
      else if (extension === 'xls' || extension === 'xlsx') {
        this.convertfileXLSToJson(file);
      }
      else if (extension === 'xml') {
        this.convertfileXMLToJson(file);
      }
      else if (extension === 'json') {
        var obj = JSON.parse(content);
        var filterArray;
        if (obj.length > 0) {
          filterArray = obj;
        } else {
          filterArray = this.findArrayInObject(obj);
        }
        if (filterArray.length > 0) {
          var jsonData = JSON.stringify(filterArray, undefined, 4);
          this.xlsContent = this.convertToLowerCase(jsonData);
        } else {
          this.jsonConvertErrorPopup('File cannot be empty.');
          this.toggleAutoReset();
        }
       
      }
      else {
        this.toastr.success('Unsupported file format', '', { timeOut: 4000 });
      }
    };

    reader.readAsText(file);
    //reader.readAsBinaryString(file);
  }
  convertfileXLSToJson(event: any) {
    const file = event;
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result); // Read as binary data
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length > 0) {
          const dataString: any = JSON.stringify(jsonData);
          this.xlsContent = this.convertToLowerCase(dataString);
        } else {
          this.jsonConvertErrorPopup('File cannot be empty.');
          this.toggleAutoReset();
        }
       
      };

      reader.readAsArrayBuffer(file); // Important: Read as ArrayBuffer
    }
  }
  findArrayInObject(obj: any) {
    let result: any = [];

    function searchObject(currentObj: any) {
      for (const key in currentObj) {
        if (Array.isArray(currentObj[key])) {
          result = currentObj[key];
          return;
        } else if (typeof currentObj[key] === 'object') {
          searchObject(currentObj[key]);
        }
      }
    }

    searchObject(obj);
    return result;
  }
  convertJsonToCsv(jsonData: any[]): string {
    const header = Object.keys(jsonData[0]);
    const csv = [header.join(',')];

    for (const item of jsonData) {
      const row = header.map((field) => {
        const value = item[field];
        return `"${value}"`;
      });
      csv.push(row.join(','));
    }

    return csv.join('\n');
  }
  //parseCsvToJson1(csvData: string) {
  //  const preprocessedCsvData = this.convertToLowerCase(this.preprocessCsvData(csvData));
  //  this.papa.parse(preprocessedCsvData, {
  //    header: true,
  //    skipEmptyLines: true,
  //    dynamicTyping: true,
  //    complete: (result) => {
  //      const firstRow = result.data[0];
  //      const hasHeaders = Object.keys(firstRow).some(key => isNaN(parseFloat(firstRow[key])));

  //      this.jsonOutput = result.data;
  //      this.convertJsonToTable(this.jsonOutput);
  //    },
  //    error: (error) => {
  //      console.error('Error converting CSV to JSON:', error);
  //    }
  //  });
  //}
  parseCsvToJson(csvData: string) {
    // Preprocess CSV data
    const preprocessedCsvData = this.convertToLowerCase(this.preprocessCsvData(csvData));

    // Check if headers are present
    const hasHeaders = this.csvDataHasHeaders(preprocessedCsvData);
    // Parse CSV data with appropriate options
    this.papa.parse(preprocessedCsvData, {
      header: hasHeaders,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        this.jsonOutput = result.data;
        this.convertJsonToTable(this.jsonOutput);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  }
  addDummyHeaderIfMissing(data: any) {
    const numColumns = data[0].length;
    const hasHeader = numColumns !== data[1].length;

    // If headers are missing, add a dummy header row with default column names
    if (!hasHeader) {
      const dummyHeaderRow = Array.from({ length: numColumns }, (_, i) => `Column${i + 1}`);
      data.unshift(dummyHeaderRow);
    }

    return data;
  }
  csvDataHasHeaders(csvData: string): boolean {
    // Split CSV data into lines
    const lines = csvData.split('\n');

    // Check if the first row contains headers
    //const firstRow = lines[0].split(',');
    //const hasNumericCell = firstRow.some(cell => !isNaN(Number(cell.trim())));
    const firstRow = lines[0].split(/\s+/); // Split by spaces
    const hasHeaders = firstRow.some(cell => !isNaN(Number(cell.trim())));
    return !hasHeaders;
  }
  convertfileCsvToJson(csvData: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result as string;
      CSV()
        .fromString(data)
        .then((jsonArray: any) => {
          if (jsonArray.length > 0) {
            const dataString: any = JSON.stringify(jsonArray, null, 2);
            this.xlsContent = this.convertToLowerCase(dataString);
          } else {
            this.jsonConvertErrorPopup('File cannot be empty.');
            this.toggleAutoReset();
          }
          
        });
    };
    reader.readAsText(csvData);
  }

  preprocessCsvData(csvData: string): string {
    const lines = csvData.split('\n');
    const processedLines = lines.map((line) => {
      const cells = line.split(',');
      const processedCells = cells.map((cell) => cell.trim()); // Remove leading and trailing spaces
      return processedCells.join(',');
    });
    return processedLines.join('\n');
  }


  convertfileXMLToJson(xmlData: any) {
    const reader = new FileReader();

    reader.onload = () => {
      const xmlData = reader.result as string;
      const parser = new xml2js.Parser({
        explicitArray: false,
        attrkey: '', // Set attributes to an empty string to exclude them
        ignoreAttrs: true, mergeAttrs: false
      });
      //const parser = new xml2js.Parser();
      parser.parseString(xmlData, (error, result) => {
        if (!error) {
          var jsonData = result;
          var filterArray = this.findArrayInObject(jsonData);
          if (filterArray.length > 0) {
            var jsonData1 = JSON.stringify(filterArray, undefined, 4);
            this.xlsContent = this.convertToLowerCase(jsonData1);
          } else {
            this.jsonConvertErrorPopup('File cannot be empty.');
            this.toggleAutoReset();
          }
        
        }
      });
    };

    reader.readAsText(xmlData);

  }
  matchangeHeader(event: any, type: any) { this.selectedHead_T = event.value; }

  matchangeHeaderShares(event: any, type: any) {
    this.selectedHead_S = event.value;
  }
  matchangeHeaderAction(event: any, type: any) {
    this.selectedHead_BS = event.value;
  }
  checkalt_HeaderList: string[] = [];
  checkalt_Header(eve: any, header: any) {
    var chk = eve.target.value;
    var items = [];
    if (this.checkalt_HeaderList.length > 0) {
      items = [...this.checkalt_HeaderList];
    } else {
      items = [...this.tableHeaders];
    }
    if (chk == 'company') {
      let replacedItem = items.splice(items.indexOf(header), 1, 'company name');
      //var array = [{ oldkey: 'oldkeyvalue', oldkey2: 'oldkey2' }]
      //var result = array.map(({ oldkey: newkey, ...rest }) => ({ newkey, ...rest }));
      //console.log(result)
    }
    else if (chk == 'ticker') { let replacedItem = items.splice(items.indexOf(header), 1, 'ticker') }
    /*else { let replacedItem = items.splice(items.indexOf(header), 1, 'country')}*/
    this.checkalt_HeaderList = items;
  }
  finalData_DD: any = [];
  updateRestrictTable() {
    var that = this;
    var items = [];
    var tabData_modify = [];
    that.finalData_DD = [];
    items = [... this.tableHeaders];
    var checkTicker = this.findSelectedOptions.filter((x: any) => x.selectedOption === 'ticker' );
    if (isNotNullOrUndefined(checkTicker) && checkTicker.length > 0) { this.selectedHead_T = checkTicker[0].headerName; } else { }
    var checkShares = this.findSelectedOptions.filter((x: any) => x.selectedOption === 'shares');
    if (isNotNullOrUndefined(checkShares) && checkShares.length > 0) { this.selectedHead_S = checkShares[0].headerName; } else { }
    var checkAction = this.findSelectedOptions.filter((x: any) => x.selectedOption === 'action');
    if (isNotNullOrUndefined(checkAction) && checkAction.length > 0) { this.selectedHead_BS = checkAction[0].headerName; } else { }
    if (this.selectedHead_T != '' || this.selectedHead_S != '' || this.selectedHead_BS != '') {
      
      tabData_modify = this.tableData.map(({
        [this.selectedHead_T]: ticker, [this.selectedHead_S]: shares, [this.selectedHead_BS]: action, ...rest
      }) => {
        const newItem = { ...rest }; // Include original ticker data
        if (ticker) {
          newItem[this.selectedHead_T] = ticker;
          newItem.mapticker = ticker; // Duplicate ticker into mapticker
        }
        if (shares) {
          newItem[this.selectedHead_S] = shares;
          newItem.mapshares = shares; // Duplicate ticker into mapticker
        }
        if (action) {
          newItem[this.selectedHead_BS] = action;
          newItem.mapaction = action; // Duplicate ticker into mapticker
        }
        return newItem;
      });
      that.finalData_DD = [tabData_modify];
      //console.log('updateRestrictTable', that.finalData_DD);
    }
  }
  checksubHeader(header: any) {
    var that = this;
    var findselectedOption = that.findSelectedOptions.filter((x: any) => x.headerName == header);
    if (findselectedOption.length > 0) {
      return findselectedOption[0].selectedOption;
    }
    else if (header == this.selectedHead_T) { return 'ticker' }
    else if (header == this.selectedHead_S) { return 'shares' }
    else if (header == this.selectedHead_BS) { return 'action' }
    else { return '' }
  }

  DisableDropdownBtn(value: any) {
    var that = this;
    var tickerKey: any = "";
    var shares: any = "";
    if (value.toString().toLowerCase().indexOf('ticker') == 0 || value.toString().toLowerCase().indexOf('symbol') == 0) { return "ticker"; }
    else if (value.toString().toLowerCase().indexOf('shares') == 0 || value.toString().toLowerCase().indexOf('quantity') == 0) { return "shares"; }
    else { return value; }
  }
  shouldHighlight(row: any): boolean { return row.rlFlag === 'Y' || row.dbFlag === 'Y' || row.dnsFlag === 'Y' || row.tickerValidFlag == 'N'; }
  //fromUserPortfolio: boolean = false;
  shares: string = "";
  actionBuy: string = "";
  tickerKey: string = "";
  UploadToRes() {
    var that = this;
    this.sharedData.userEventTrack('Direct Trade', 'Save & Preview', 'Save & Preview', 'Save & Preview click');
    var checkComp_tick = [...this.tableHeaders];
    var verify: boolean = false;
    var compKey: any = "";
    var tickerKey: any = "";
    var shares: any = "";
    var actionBuy: any = "";
    if ((isNotNullOrUndefined(this.selectedHead_S) && this.selectedHead_S != "") && (isNotNullOrUndefined(this.selectedHead_T) && this.selectedHead_T != "") && (isNotNullOrUndefined(this.selectedHead_BS) && this.selectedHead_BS != "")) {

      if (isNotNullOrUndefined(that.finalData_DD[0]) && that.finalData_DD[0].length > 0) {
        var tableHeaders = Object.keys(that.finalData_DD[0][0]);
        for (const [key, value] of Object.entries(tableHeaders)) {
          // console.log(value,'value 1');
          if (value.toString().toLowerCase().indexOf('mapticker') == 0 || value.toString().toLowerCase().indexOf('symbol') == 0) { tickerKey = "ticker"; this.tickerKey = "ticker" }
          if (value.toString().toLowerCase().indexOf('mapshares') == 0 || value.toString().toLowerCase().indexOf('quantity') == 0) { shares = "shares"; this.shares = "shares" }
          if (value.toString().toLowerCase().indexOf('mapaction') == 0 || value.toString().toLowerCase().indexOf('buyorsell') == 0) { actionBuy = "action"; this.actionBuy = "action" }
        };
      } else {
        for (const [key, value] of Object.entries(checkComp_tick)) {
          if (value.toString().toLowerCase().indexOf('ticker') == 0 || value.toString().toLowerCase().indexOf('symbol') == 0) { tickerKey = "ticker"; this.tickerKey = "ticker" }
          if (value.toString().toLowerCase().indexOf('shares') == 0 || value.toString().toLowerCase().indexOf('quantity') == 0) { shares = "shares"; this.shares = "shares" }
          if (value.toString().toLowerCase().indexOf('action') == 0 || value.toString().toLowerCase().indexOf('buyorsell') == 0) { actionBuy = "action"; this.actionBuy = "action" }
        };
      }

    } else {
      // console.log(checkComp_tick,'checkComp_tick')
      for (const [key, value] of Object.entries(checkComp_tick)) {
        if (value.toString().toLowerCase().indexOf('ticker') == 0 || value.toString().toLowerCase().indexOf('symbol') == 0) { tickerKey = "ticker"; this.tickerKey = "ticker" }
        if (value.toString().toLowerCase().indexOf('shares') == 0 || value.toString().toLowerCase().indexOf('quantity') == 0) { shares = "shares"; this.shares = "shares" }
        if (value.toString().toLowerCase().indexOf('action') == 0 || value.toString().toLowerCase().indexOf('buyorsell') == 0) { actionBuy = "action"; this.actionBuy = "action" }
      };
    }
  

    if (isNullOrUndefined(compKey)) { compKey = ""; }
    if (isNullOrUndefined(tickerKey)) { tickerKey = ""; }
    if (isNullOrUndefined(shares)) { shares = ""; }
    if (isNullOrUndefined(actionBuy)) { actionBuy = ""; }

    if (tickerKey == "ticker" && shares == "shares" && actionBuy == "action") {
      if (that.finalData_DD.length > 0) {
        //console.log('UploadToRes', that.finalData_DD[0]);
        that.postSavedData(that.finalData_DD[0]);
      }
      else {  }
    } else { $('#resStockVerifyPopup').modal('show'); }

    ////if (this.fromUserPortfolio) {
    ////  if (tickerKey == "ticker" && shares == "shares" && actionBuy == 'action') {
    ////    if (that.finalData_DD.length > 0) {
    ////      var removeEmptyrow = that.finalData_DD[0].filter((x: any) =>
    ////        x.shares != '' && x.ticker != '' && x.action != ''
    ////      );
    ////      that.sharedData.userPortfolioDragDrop.next(that.finalData_DD[0]);
        
    ////    } else {
    ////      var removeEmptyrow1 = that.tableData.filter(x =>
    ////        x.shares != '' && x.ticker != '' && x.action != ''
    ////      );
    ////      that.sharedData.userPortfolioDragDrop.next(that.tableData);
       
    ////    }


    ////  } else {
    ////    $('#resStockVerifyPopup').modal('show');
    ////  }
    ////}
    ////else {
    ////  $('#resStockVerifyPopup').modal('show');
    ////  ////if (tickerKey == "ticker") {
    ////  ////  if (that.finalData_DD.length > 0) {
    ////  ////    that.sharedData.dragDropData.next(that.finalData_DD[0]);
        
    ////  ////  } else {
    ////  ////    that.sharedData.dragDropData.next(that.tableData);
       
    ////  ////  }

    ////  ////} else {
    ////  ////  $('#resStockVerifyPopup').modal('show');
    ////  ////}
    ////}



  }
  formatTableValue(value: any): string {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value).toLocaleString();
    }
    else if (typeof value === 'number') {
      return value.toLocaleString();
    }else if (typeof value === 'string') {
      return value;
    }
    return '';
  }
  getUppercaseTicker(item:any) {
  if (item.maptickers) return item.maptickers.toUpperCase();
  if (item.mapticker) return item.mapticker.toUpperCase();
  if (item.mapsymbol) return item.mapsymbol.toUpperCase();
  return null; // Default case if none are available
  }
  postSavedData(res: any) {
    var that = this;

    const filteredData = res.filter((item:any) => {
      const alphanumericRegex = /^[a-zA-Z0-9\s/.]+$/; /*// Regex to allow only letters and numbers*/
      const numericRegex = /^[0-9]+$/; /*// Regex to allow only numbers*/
      //const allowedActions = ["buy", "sell"];
      //allowedActions.includes(item.action.toLowerCase())
      return (
        alphanumericRegex.test(item.mapticker) && numericRegex.test(item.mapshares) 
      );
    });
    //console.log(filteredData, res.length == filteredData.length);
    if (res.length == filteredData.length) {
      that.saveMatLoader = true;
      let actuserid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var accountId: number = 0
      if (isNotNullOrUndefined(this.modalData.currentAccount)) {
        accountId = parseInt(this.modalData.currentAccount.accountId);
      }

      var postData = res.map((item: any) => ({
        rowId: 0,
        accountId: accountId,
        ticker: this.getUppercaseTicker(item),
        userid: parseInt(actuserid),
        company: "",
        noofShares: item.mapshare || item.mapshares || item.mapquantity || item.mapnoofshares,
        bsFlag: item.action.toLowerCase() === "buy" ? "B" : item.action.toLowerCase() === "sell" ? "S" : item.action// Convert "action" to "B" or "S"
      }));
      if (isNotNullOrUndefined(postData) && postData.length > 0) {
        if (postData.length <= 200) {
          var ViewDirectTradeData = this.dataservice.PostDirectTradeData(postData).pipe(first())
            .subscribe((response: any) => {
              this.getDirectTradeData();
            }, error => {
              if (isNotNullOrUndefined(error)) {
                that.errorMsgFileUploadStatus = error;
              }
              this.iserrorMsgFileStatus = true
              $('#errorTradeVerifyPopup').modal('show');
              that.showSpinner_loaded = false;
              that.saveMatLoader = false;
              that.saveMatLoader = false;
            });
          that.subscriptions.add(ViewDirectTradeData);
        } else {
          that.errorMsgFileUploadStatus = 'Limit exceeded. Include up to 200 components only.';
          this.iserrorMsgFileStatus = true
          $('#errorTradeVerifyPopup').modal('show');
          that.showSpinner_loaded = false;
          that.saveMatLoader = false;
        }
      }
    } else {
      /** Show error **/
      this.jsonConvertErrorPopup('Ticker/Quantity field must contain only letters and numbers. No special characters are allowed.');
      /** Show error **/
    }
  }
  getDirectTradeData() {
    var that = this;
    this.showTradeBtn = false;
    this.iserrorMsgFileStatus = false;
    let actuserid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var accountId: number = 0
    if (isNotNullOrUndefined(this.modalData.currentAccount)) {
      accountId = parseInt(this.modalData.currentAccount.accountId);
    }
    var postData = {
      "userid": actuserid,
      "accountId": accountId
    }
    if (isNotNullOrUndefined(postData)) {
   
      var ViewDirectTradeData = this.dataservice.GetDirectTradeData(postData).pipe(first()).subscribe((response: any) => {
        
        if (isNotNullOrUndefined(response) && response.length > 0 && isNotNullOrUndefined(response[0]['dTradeInfo'])) {
          that.SavedDirectTradeData = response;
          that.loadDraggedData = response[0]['dTradeInfo'];
          that.loadMainTable(that.loadDraggedData);
          // this.showSpinner_loaded = false;
        }
        if (isNotNullOrUndefined(response) && response.length > 0 && isNotNullOrUndefined(response[0]['fileUploadStatus'])) {
          that.errorMsgFileUploadStatus = response[0]['fileUploadStatus'].errorMsg;
          //console.log('errorMsgFileUploadStatus', this.errorMsgFileUploadStatus);
          if (that.errorMsgFileUploadStatus.toLowerCase() != 'success') {
            // Open errorTradeVerifyPopup  Modal
            this.iserrorMsgFileStatus = true
            $('#errorTradeVerifyPopup').modal('show');
          }
          // this.showSpinner_loaded = false;
        }
        that.saveMatLoader = false;
        that.showSpinner_loaded = false;
        //console.log('GetDirectTradeData-->', response)
      }, error => {
        that.showSpinner_loaded = false;
        that.saveMatLoader = false;
        that.SavedDirectTradeData = [];
      });
      that.subscriptions.add(ViewDirectTradeData);
    }
  }

  tradeInit() {
    var da = Object.assign(this.currentAccount, {});
    this.sharedData.selTradeData.data = [da];
    this.sharedData.selTradeData.type = "DT";
    this.sharedData.selTradeData.accountInfo = [da];
    this.dialogController.openTrade(TradeDirectComponent);
    this.close();
    this.sharedData.userEventTrack('Direct Trade', 'Trade Now', 'Trade Now', 'Trade Now Init Click');
  }

  checkAcc() {
    this.sharedData.showMatLoader.next(true);
    this.saveMatLoader = true;
    if (isNotNullOrUndefined(this.currentAccount['accountId'])) {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var data = [{ "accid": this.currentAccount['accountId'], "userid": userid }];
      this.dataservice.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
        this.sharedData.showMatLoader.next(false);
        this.saveMatLoader = false;
        var lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
        var pauseInfo = res.filter((ld: any) => ld.pausestatus == 'Y');
        if (res.length == 0 || (lockInfo.length == 0 && pauseInfo.length == 0)) {
          this.tradeInit();
        } else {
          var txt: string = this.sharedData.checkMyAppMessage(13, 118);
          this.toastr.success(txt, '', { timeOut: 4000 });
        }
      }, error => { this.showSpinner_loaded = false; this.sharedData.showMatLoader.next(false); this.saveMatLoader = false; });
    } else { this.sharedData.showMatLoader.next(false); this.saveMatLoader = false; }
    this.sharedData.userEventTrack('Direct Trade', 'Trade Now', 'Trade Now', 'Trade Now Btn Click');
  }

  templateFile(fileType: string) {
    if (fileType == 'csv' || fileType == 'xlsx') {
      let new_workbook = new Workbook();
      var ws = new_workbook.addWorksheet('Template portfolio');
      var header = ws.addRow(['Ticker', 'Shares', 'Action'])
      header.font = { bold: true };
      ws.addRow(['xxxx', '1', 'Buy'])
      ws.addRow(['yyyy', '1', 'Sell'])
      if (fileType == 'csv') {
        new_workbook.csv.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
          saveAs(blob, 'DirectTradeTemplate.csv');
        });
      } else if (fileType == 'xlsx') {
        new_workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
          saveAs(blob, 'DirectTradeTemplate.xlsx');
        });
      }
    } else if (fileType == 'json') {
      var json: any = [
        { 'Ticker': 'xxxx', 'Shares': '1', 'Action': 'Buy' },
        { 'Ticker': 'yyyy', 'Shares': '1', 'Action': 'Sell' }
      ];
      const jsonBlob = new Blob([JSON.stringify(json)]);
      saveAs(jsonBlob,'DirectTradeTemplate.json')
    } else if (fileType == 'xml') {
      var xml:any = `<?xml version="1.0" encoding="UTF-8"?><Stocklist><Stock><Ticker>xxxx</Ticker><Shares>1</Shares><Action>Buy</Action></Stock><Stock><Ticker>yyyy</Ticker><Shares>1</Shares><Action>Sell</Action></Stock></Stocklist>`
      var blob = new Blob([xml], { type: 'text/xml' });
      saveAs(blob, 'DirectTradeTemplate.xml')
    }
    this.sharedData.userEventTrack('Direct Trade', 'Template file', ('Template file ' + fileType), 'Direct Trade Template file Click');
  }

  downloadUploadStockFile() {
    var that = this;
    let d = new Date();
    var fname: string = this.currentAccount.accountVan + '_Uploaded_Tickers_' + this.datepipe.transform(d, 'yyyyMMdd') +'.xlsx'
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet('Direct Trade');
    var header = ws.addRow(['Company Name', 'Ticker', 'Quantity', 'Action', 'Status'])
    header.font = { bold: true };
    var tabBody: any = [];
    var resData = [...this.dataSource_DD.data];
    resData.forEach((item: any) => {
      tabBody.push([item.company, item.ticker, item.shares, item.buySell, that.checkFlagTxt(item)]);
    });
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fname);
    });

    this.sharedData.userEventTrack('Direct Trade', 'uploaded status file', 'download status file', 'Download Click');
  }

  checkFlagTxt(element: any) {
    if (element.rlFlag == 'Y' && element.dbFlag == 'Y') {
      return "This ticker is in Restricted List and Don't Buy";
    } else if (element.rlFlag == 'Y') {
      return "This ticker is in Restricted List";
    }else if (element.dbFlag == 'Y') {
      return "This ticker is in Don't Buy";
    } else if (element.dnsFlag == 'Y') {
      return "This ticker is in Don't Sell";
    } else if (element.tickerValidFlag == 'N') {
      return "This ticker is unavailable";
    } else { return '-' }
  }

  invalidtickerData: any = [];
  invalidTickr: string = '';
  suggestedTickers(d: any) {
    this.invalidtickerData = [];
    this.invalidTickr = '';
    this.glbSearch.reset();
    this.noDataFound = false;
    var response: any = this.SavedDirectTradeData;
    if (isNotNullOrUndefined(response) && response.length > 0 && isNotNullOrUndefined(response[0]['fileUploadStatus']) && isNotNullOrUndefined(response[0]['fileUploadStatus']['suggestedTickers'])) {
      var suggestedTickers: any = [...response[0]['fileUploadStatus']['suggestedTickers']];
      this.invalidTickr = d['ticker'];
      this.invalidtickerData = suggestedTickers.filter((x: any) => x['errorTicker'] == d['ticker']);
      $('#errorsuggestedTickers').modal('show');
      }
  }

  noDataFound: boolean = false;
  searchEnter: boolean = false;
  filteredOptions: any = [];
  filtering(ev: any) { this.searchEnter = true; };
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };
  restrictDoubleSpace(event: KeyboardEvent): void {
    const input = this.inputValue;
    const char = event.key;
    if ((char === ' ' && (input.endsWith(' '))) || (char === ' ' && input.trim().length == 0)) { event.preventDefault(); }
  }

  private _filter(value: any) {
    this.filteredOptions = [];
    this.searchEnter = false;
    var doubleSpace: boolean = this.glbSearch?.hasError('doubleSpace');
    var max: boolean = this.glbSearch?.hasError('max');
    if (doubleSpace) { this.glbSearch.setValue(value.replaceAll('  ', ' ')); }
    if (isNotNullOrUndefined(value) && value != "" && value.trim() != "" && !doubleSpace && !max && this.glbSearch.valid) {
      try {
        this.invalidtickerData = [...this.sharedData._selResData].filter((x: any) => x.country?.toLowerCase() == 'usa' && ((x.company?.toLowerCase().indexOf(value.toLowerCase()) > -1) || (x.ticker?.toLowerCase().indexOf(value.toLowerCase()) >-1)))?.slice(0, 30);
      } catch (e) { }
      if (this.invalidtickerData.length > 0) { this.noDataFound = false } else { this.noDataFound = true }
    } else {
      this.noDataFound = !this.glbSearch.valid;
      if (this.noDataFound) {} else { }
      this.filteredOptions = [];
      if (isNotNullOrUndefined(this.SavedDirectTradeData) && this.SavedDirectTradeData.length > 0 && isNotNullOrUndefined(this.SavedDirectTradeData[0]['fileUploadStatus']) && isNotNullOrUndefined(this.SavedDirectTradeData[0]['fileUploadStatus']['suggestedTickers'])) {
        var suggestedTickers: any = [...this.SavedDirectTradeData[0]['fileUploadStatus']['suggestedTickers']];
        this.invalidtickerData = suggestedTickers.filter((x: any) => x['errorTicker'] == this.invalidTickr);
      }
    }
  }

  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      var alIn: any = [...this.invalidtickerData].filter((x: any) => (x.companyName == value.company) || (x.ticker == value.ticker));
      if (alIn.length == 0) { this.invalidtickerData = [value].concat(this.invalidtickerData); }
      else { this.toastr.info(value?.ticker+' is already in list', '', { timeOut: 4000 }); }
      this.glbSearch.reset();
      this.noDataFound = false;
    } else { }
  }
}
