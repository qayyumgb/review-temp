import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
import * as d3 from 'd3';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '../../../core/services/data/data.service';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../../core/services/sharedData/shared-data.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dontSell',
  templateUrl: './dont-sell.html',
  styleUrls: ['./dont-sell.scss'] 
})
export class dontSellComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostListener('matSortChange', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    var that = this;
    var innerW = event.target.innerWidth;
    if (innerW <= 1600) {
      that.classFlag = true;
    } else if (innerW <= 2400 && innerW >= 1600) {
      that.classFlag = false;
      that.classFlagLarge = true;
    }
    else {
      that.classFlag = false;
      that.classFlagLarge = false;
    }

  }
 
  matloader_DS: boolean = true;
  hand_p_toggle: boolean = false;
  hand_p_left: boolean = false;
  hand_p_right: boolean = false;
  classFlag: boolean = false;
  classFlagLarge = false;
  @ViewChild('importFiles') importFiles: ElementRef | any;
  jsonlength: any = 0;
  tabledata: any = [];
  savedDontSell_List: any = [];
  displayedColumns: string[] = ['action'];
  dropdownvalues: string[] | any;
  sortedData:any;
  tableDataSource: MatTableDataSource<any> | any;
  emptyData = new MatTableDataSource([{ empty: "row" }]);
  @ViewChild(MatSort) sort: MatSort | any;  
  displayedColumn = ['checkBox', 'Ticker', 'Company','Position' ];
  selection = new SelectionModel(true);
  listName = '';
  selectedAccount: number=0;
  searchFormCtrl = new FormControl();
  tabFormCtrl = new FormControl();
  tabFilteredCompanies: any = [];
  filteredCompanies: any = [];
  deleteRow: any;
  sortDir = 1;
  constructor(private dataservice: DataService,
    private logger: LoggerService,
    private dialogref: MatDialogRef<dontSellComponent>,
    public sharedData: SharedDataService, private toastr: ToastrService,
    public dialog: MatDialog) { }
  subscriptions = new Subscription();
  closeModal() {this.dialogref.close();  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.sharedData.triggerDontSell.next(true);
  };

  //isAllSelected() {
  //  const numSelected = this.selection.selected.length;
  //  const numRows = this.tableDataSource.data.length;
  //  return numSelected === numRows;
  //}

  changeTaxlotB(element:any) {
    if (isNotNullOrUndefined(element.grpTaxlot) && element.grpTaxlot.length > 0) {
      var dt = element.grpTaxlot.filter((x:any) => x.checkB == true);
      if (dt.length > 0) { element['checkH'] = true } else { element['checkH'] = false }
    }
  }

  changeTaxlotH(element:any) {
    if (isNotNullOrUndefined(element.grpTaxlot) && element.grpTaxlot.length > 0) {
      if (element['checkH']) { element.grpTaxlot.forEach((d:any) => d['checkB'] = true); }
      else { element.grpTaxlot.forEach((d:any) => d['checkB'] = false); }
    }
  }
  dontSellLoad_Btn: boolean = false;
  conforStopAll() {
    var that = this;
    var accid = this.selectedCompanyList['accID'];
    that.dontSellLoad_Btn = true;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    //var selectedData = that.selection.selected;
    var selectedData = this.tabledata.map((x:any) => x.grpTaxlot).flat().filter((xt:any) => xt.checkB==true);
    var addData:any = [];
    //check remStock
    that.savedDontSell_List.forEach((xu:any) => {
      if (selectedData.filter((yu:any) => xu.StockKey == yu.stockkey && xu.taxlotid == yu.taxLotIdentifier).length == 0) {
        var post_dd = {
          "accid": accid,
          "stockkey": xu.StockKey,
          "userid": parseInt(userid),
          "taxlotId": xu.taxlotid,
          "noofshares": xu.noofshares,
          "status": "D"
        }
        addData.push(post_dd);
      }
    });

    //check addStock
    selectedData.forEach((xu:any) => {
      if (that.savedDontSell_List.filter((yu:any) => yu.StockKey == xu.stockkey && yu.taxlotid == xu.lotId).length == 0) {
        var post_dd = {
          "accid": accid,
          "stockkey": xu.stockKey,
          "userid": parseInt(userid),
          "taxlotId": xu.taxLotIdentifier,
          "noofshares": xu.noofShares,
          "status": "A"
        }
        addData.push(post_dd);
      }
    });

    if (addData.length > 0) {
      this.dataservice.PostDNSList(addData).pipe(first()).subscribe((res:any) => {
        this.checkSaved_list();
        this.resetFilter();
        this.toastr.success(this.sharedData.checkMyAppMessage(0, 16), '', { timeOut: 4000 });
        that.dontSellLoad_Btn = false;
        this.dialogref.close();
      }, error => { this.logger.logError(error, 'PostDNSList'); that.dontSellLoad_Btn = false; });
    } else {
      that.dontSellLoad_Btn = false;
      this.toastr.info('Please select new stock', '', { timeOut: 5000 });
    }
  }

  ngAfterViewInit() {
    var that = this;
    that.tableDataSource = new MatTableDataSource(this.tabledata);
    that.tableDataSource.sort = that.sort;
  }

  selectedCompanyList: any;
  account = [];

  checkCompName(d:any) {
    if (isNotNullOrUndefined(d['companyName']) && d['companyName'] != '') { return d['companyName'] }
    else if (isNotNullOrUndefined(d['securityDescription']) && d['securityDescription'] != '') { return d['securityDescription'] }
    else { return '-' }
  }

  ngOnInit(): void {
    var getED = this.sharedData.selectedAccountCompanyList.subscribe((data: any[]) => {
      this.selectedCompanyList = data;
      this.checkSaved_list();
    }, error => { this.loadData(); });
    this.subscriptions.add(getED)
  };


  loadData() {
    var that = this;
    var data = this.selectedCompanyList['acclist'];
    var arrData:any[] = [];
    var tabData = data['portfolioPositions'];
    if (isNullOrUndefined(tabData) && isNotNullOrUndefined(data['FilteredHoldings'])) { tabData = data['FilteredHoldings']; }
    if (isNullOrUndefined(tabData) || tabData == '') { tabData = []; }
    if (tabData.length > 0) {
      tabData.forEach(function (value: any, index:any) {
        if (isNotNullOrUndefined(data['FilteredHoldings'])) {
          var val = [...that.sharedData._GetlatestBMCompData].filter(x => x.isin == value.isin);
          var cDt = Object.assign({}, value);
          if (val.length > 0) {
            cDt['companyName'] = val[0].companyName;
            cDt['stockkey'] = val[0].stockKey;
          } else { cDt['companyName'] = ''; }
          cDt['grpTaxlot'] = that.groupTaxlot(value);
          cDt['contractDesc'] = cDt.Instrument;
          cDt['checkH'] = (cDt['grpTaxlot'].filter((dy:any) => dy['checkB']== true).length>0)?true:false;
          cDt['position'] = cDt.Position;
          arrData.push(cDt);
        } else {
          var val = [...that.sharedData._GetlatestBMCompData].filter(x => x.stockKey == value.stockkey);
          var cDt = Object.assign({}, value);
          if (val.length > 0) {
            cDt['companyName'] = val[0].companyName;
            //cDt['country'] = val[0].country;
            //cDt['countryGroup'] = val[0].countrygroup;
          }
          cDt['grpTaxlot'] = that.groupTaxlot(value);
          cDt['checkH']  = (cDt['grpTaxlot'].filter((dy:any) => dy['checkB'] == true).length > 0) ? true : false;
          arrData.push(cDt);
        }
      });
      var addComp = arrData.filter(this.checkSelected(this.savedDontSell_List));
      that.selection = new SelectionModel(true, addComp);
      that.tabledata = arrData;
      that.tableDataSource = new MatTableDataSource(that.tabledata);
      that.tableDataSource.sort = that.sort;
      that.matloader_DS = false;
    } else {
      that.tableDataSource = new MatTableDataSource([]);
      that.matloader_DS = false;
    }
  }
  isIconVisible: boolean = false;
  onSortClickIcon(event:any,name:any){
    let target = event.target,
    classList = target.classList;
    this.isIconVisible = !this.isIconVisible;
    if (classList.contains('fa-angle-up')) {
      classList.remove('fa-angle-up');
      classList.add('fa-angle-down');
      this.sortDir=-1;
    } else {
      classList.add('fa-angle-up');
      classList.remove('fa-angle-down');
      this.sortDir=1;
    }
    this.sortArr(name);
  }
   click = 0

  onSortClick(event:any,name:any){
    let target = event.target.children[0],
    classList = target.classList;
    this.isIconVisible = !this.isIconVisible;

    if (classList.contains('fa-angle-up')) {
     
      classList.remove('fa-angle-up');
      classList.add('fa-angle-down');
      this.sortDir=1;
    } else {
      classList.add('fa-angle-up');
      classList.remove('fa-angle-down');
      this.sortDir=-1;
    }
    this.click++;
    if(this.click == 1){
      this.sortDir=-1;
      classList.add('fa-angle-up');
      classList.remove('fa-angle-down');
    }
    this.sortArr(name);
 
 
  }
  sortArr(colName:any){
    if(this.sortDir == -1)
    {
      this.tabledata.sort((a:any,b:any)=>{
        return d3.ascending(a[colName],b[colName])
      });
    }
    else if(this.sortDir == 1){
      this.tabledata.sort((a:any,b:any)=>{
        return d3.descending(a[colName],b[colName])
      });
    }
    // if(colName != 'position'){
    //   this.tabledata.sort((a,b)=>{
    //     a= a[colName].toLowerCase();
    //     b= b[colName].toLowerCase();
    //     return a.localeCompare(b) * this.sortDir;
    //   });
    // }
    // else{
    //   if(this.sortDir == -1)
    //   {
    //     this.tabledata.sort((a,b)=>{
    //       console.log(a[colName],b[colName],'if')
    //       return d3.ascending(a[colName],b[colName])
    //     });
    //   }
    //   else if(this.sortDir == 1){
    //     this.tabledata.sort((a,b)=>{
    //       console.log(a[colName],b[colName],'else')
    //       return d3.descending(a[colName],b[colName])
    //     });
    //   }
    // }
   
  }
  groupTaxlot(d:any) {
    var that = this;
    var data:any[] = [];
    if (isNotNullOrUndefined(d['isin'])) {
      data = [...this.sharedData.taxLotData.value].filter(x => x.isin == d['isin']);
      data.forEach(d => d['checkB'] = (that.savedDontSell_List.filter((du:any) => du.taxlotid == d.taxLotIdentifier).length>0)?true:false);
    } else if (isNotNullOrUndefined(d['stockkey'])) {
      data = [...this.sharedData.taxLotData.value].filter(x => x.stockKey == d['stockkey']);
      data.forEach(d => d['checkB'] = (that.savedDontSell_List.filter((du:any) => du.taxlotid == d.taxLotIdentifier).length > 0) ? true : false);
    }
    return [...data];
  }

  checkSelected(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.StockKey == current.stockkey && other.taxlotid == current.lotId }).length > 0; } }

  checkSaved_list() {
    var that = this;
    var assetId = this.selectedCompanyList['accID'];
    that.dataservice.GetDNSList(assetId).pipe(first()).subscribe((data: any) => {
      if (isNullOrUndefined(data) || data == "") { data = []; }
        this.savedDontSell_List = data;
        this.loadData();
    })
  }
 
  applyFilter(event: Event) {
    const filterValue1 = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue1.trim().toLowerCase();
  }

  filter: any;
  resetFilter() { this.tableDataSource.filter = ''; $('#globalSearch').val(''); }

  onSortData(sort: Sort) {
    const data = this.tableDataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a:any, b:any) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'Company': { return this.compare(a.companyName, b.companyName, isAsc); }
        case 'Ticker': return this.compare(a.ticker, b.ticker, isAsc);
        case 'Country': return this.compare(a.country, b.country, isAsc);
        case 'Position': return this.compare(a.position, b.position, isAsc);
        case 'ISIN': return this.compare(a.isin, b.isin, isAsc);
        default: return 0;
      }
    });
    this.tableDataSource.data = this.sortedData;
  }
  isPershingLossorGain(value:any){

    if(value < 0){
      return false;
    }
    else{
      return true;
    }
  }

  compare(a:any, b:any, isAsc:any) { return (a < b ? -1 : 1) * (isAsc ? 1 : -1); }

  i: number | any;
  datapar1(i: any): any { return '#accordion-strategies' + i; }
  datapar2(i: any, ind: any): any { return '#child' + i + '' + ind; }
  datapar3(i: any): any { return '#accordion-strategiest' + i; }
  Childpar1(i: any): any { return 'child' + i; }
  cardpar1(i: any): any { return 'card' + i; }
  collapsepar1(i: any): any { return 'collapseOne' + i; }
  collapsepar2(i: any, ind: any): any { return 'collapseOneC' + i + '' + ind; }
  collapsepar3(i: any): any { return 'collapseT' + i; }
  hrefpar1(i: any): any { return '#collapseOne' + i; }
  hrefpar2(i: any, ind: any): any { return '#collapseOneC' + i + '' + ind; }
  hrefpar3(i: any): any { return '#collapseT' + i; }
  tabpar1(i: any): any { return 'tableone' + i; }
  tabpar2(i: any): any { return 'tableonet' + i; }
  /*Traded Strategies*/
  ChildparTS(i: any): any { return 'childT' + i; }
  ChildparTSI(i: any, ind: any): any { return '#childT' + i + '' + ind; }
  dataparTS(i: any): any { return '#accordion-strategiestrade' + i; }
  hrefparTS(i: any): any { return '#collapseOneT' + i; }
  collapseparTS(i: any): any { return 'collapseOneT' + i; }
  collapsepar4(i: any, ind: any): any { return 'collapseOneTC' + i + '' + ind; }
  hrefpar4(i: any, ind: any): any { return '#collapseOneTC' + i + '' + ind; }
}

