import { Component,HostListener, ViewChild } from '@angular/core';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../services/sharedData/shared-data.service';
import { ascending, descending } from 'd3';
import * as d3 from 'd3';
import { CustomIndexService } from '../../services/moduleService/custom-index.service';
import { EquityUniverseService } from '../../services/moduleService/equity-universe.service';
import { EtfsUniverseService } from '../../services/moduleService/etfs-universe.service';
import { Router } from '@angular/router';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss'
})
export class WatchlistComponent {
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  openWatchlist:boolean = false;
  inputValue: string = '';
  ascending_val: boolean = true;
  ascending_val_ind: boolean = true;
  ascending_val_etf: boolean = true;
  rightGridData: any = [];
  highlightList: any = '';
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  equityData: any = [];
  equitySearchData:any=[];
  indexesSearchData:any=[]
  etfSearchData:any=[]
  indexesData: any = [];
  etfData: any = [];
  FilterList: any = [];
  FilterIndexList: any = [];
  FilterETFList: any = [];
  constructor(public sharedData: SharedDataService, private cusIndexService: CustomIndexService, private router: Router,
    private equityService: EquityUniverseService, private etfService: EtfsUniverseService) { }
  ngOnInit() {
    var that = this;    
    this.sharedData.getSortMasterData.subscribe((res: any) => {
      this.FilterList = this.sharedData.getSortDropdownlist('W', 'equity');
      this.FilterIndexList = this.sharedData.getSortDropdownlist('W', 'prebuild');
      this.FilterETFList = this.sharedData.getSortDropdownlist('W', 'etf');
    });

    this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('W', 'equity', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;

      var dtindex: any = this.sharedData.getSortDropdownlist('W', 'prebuild', true);
      this.SelIndexFilter = (isNotNullOrUndefined(dtindex['SelFilter'])) ? dtindex['SelFilter'] : 3;
      this.ascending_val_ind = (isNotNullOrUndefined(dtindex['ascending_val'])) ? dtindex['ascending_val'] : true;

      var dtetf: any = this.sharedData.getSortDropdownlist('W', 'etf', true);
      this.SelETFFilter = (isNotNullOrUndefined(dtetf['SelFilter'])) ? dtetf['SelFilter'] : 5;
      this.ascending_val_etf = (isNotNullOrUndefined(dtetf['ascending_val'])) ? dtetf['ascending_val'] : true;
     
      if (this.sharedData.resetDefalutSortTrig) {
       
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
      this.onSort();
    });
    this.loadData(true);
  }

  getEquity(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.stockkey == current.stockKey }).length > 0; } }
  getETF(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.assets == current.assetId }).length > 0; } }
  getIndexes(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.assets == current.assetId || other.indexname == current.name }).length > 0; } }
  findMyHandleIndex_H(data: any) {
    var dt = [...data].map(a => ({ ...a }));
    dt.sort(function (x, y) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
    var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
    //if (this.equityService._SRValue > 0 && this.equityService._SRValue < 100 && isNotNullOrUndefined(this.equityService.avoidLoserData.value)) {
    //  if (isNotNullOrUndefined(this.equityService.avoidLoserData.value['resData'])) {
    //    per = d3.scaleLinear().domain([0, [...this.equityService.avoidLoserData.value['resData']].length]).range([0, 100]);
    //  }

    //}
    //let TotWt: any = d3.sum(data.map(function (d: any) { return (1 - d.scores); }));
    data.forEach((d: any) => {
      var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
      d['colorVal'] = per(selIndex);
      return d
    });
    return data
  }

  selectedInd: number = 0;
  defaultKey: string = 'Default'
  selListGrp: string = '';
  listGrpData: any[] = [];
  loadData(init: boolean = false) {
    var data: any = this.sharedData.WatchListData.value;
    var list = [...data].map((x: any) => x.hdrName).filter((x: any) => isNotNullOrUndefined(x));
    list = [...new Set(list)];
    if (list.length > 0) {
      this.listGrpData = [...list];
      if (init) { this.selListGrp = list[0]; }
    } else {
      this.listGrpData = [this.defaultKey];
      if (init) { this.selListGrp = this.defaultKey; }
    }
    data = [...data].filter((x: any) => x.hdrName == this.selListGrp);
    var equity: any = [...data].filter((x: any) => isNotNullOrUndefined(x['stockkey']));
    var index: any = [...data].filter((x: any) => (x['category'] == "Equity" || x['category'] == "Equity Indexes" || x['category'] == "Equity Universe") && isNullOrUndefined(x['stockkey']));
    var etfIndex: any = [...data].filter((x: any) => (x['category'] == "ETF" || x['category'] == "Exchange Traded Funds") && isNullOrUndefined(x['stockkey']));
    var filIndex: any = [...this.cusIndexService._equityIndexeMasData].filter(this.getIndexes(index));
    var filequity: any = [...this.sharedData._selResData].filter(this.getEquity(equity));
    var filETF: any = [...this.sharedData._ETFIndex].filter(this.getETF(etfIndex));
    this.equityData = [...filequity].sort((a, b) => a.companyName.localeCompare(b.companyName));
    var filterScore = [...filequity];
    this.equitySearchData = filterScore;
    this.indexesData = [...filIndex].sort((a, b) => a.name.localeCompare(b.name));
    this.indexesSearchData = [...filIndex];
    this.etfData = [...filETF].sort((a, b) => a.etfName.localeCompare(b.etfName));
    this.etfSearchData = [...filETF];
    this.defaultSortAsc = true;
    this.sortProductsAsc();
    this.onIndexSort();
    this.onSort();
    this.onETFSort();
    if (this.sharedData.checkShowLeftTab(2027) == 'A' && (this.sharedData.checkMenuPer(2027, 2234) == "Y")) { this.selectedInd = 0; } else { this.selectedInd = 2; }
    if (this.sharedData.checkShowLeftTab(2028) == 'A' && (this.sharedData.checkMenuPer(2028, 2250) == 'Y')) { } else { this.selectedInd = 0; }
  }

  etfGlobalIndexSrc(data: any) {
    this.etfService.globalEtfIndexSrc(data);
    this.router.navigate(["/etfUniverse"]);
    this.closeNotify()
  }
  onTabChange(index: number) {
    //console.log("Selected Tab Index:", index);
    if (index == 0) {
     
      setTimeout(() => { this.viewPort.scrollToIndex(100); this.viewPort.scrollToIndex(0); }, 10);
    }
  }
  defScrollBox() {
    alert();
    setTimeout(() => { this.viewPort.scrollToIndex(0); }, 10);
  }
  equityGlobalIndCompSrc(data: any, type: string) {
    if (type == "Index") { this.equityService.globalIndCompSrc(data); }
    else { this.equityService.globalIndCompSrc(data); }
    this.router.navigate(["/equityUniverse"]);
    this.closeNotify()
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    //console.log(target);
    // Check if the click occurred outside of the specific div
    if (this.sharedData._openWatchlist == true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
        if (this.sharedData._openWatchlist == true) { this.sharedData.openWatchlist.next(false); };
      } else { }
    }
  }
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.notify-l') !== null || element.closest('.list-n') !== null || element.closest('.f-right-l') !== null ||
      element.closest('button') !== null || element.closest('.sortingArrow') !== null || element.closest('.mat-mdc-option') !== null;
  }
  clearInput(e:any) {
    // e.preventDefault();
    $('#myInput').val('');
    $(".Icons").removeClass('Icons')
    this.loadData(true)
  }
  closeNotify() { this.sharedData.openWatchlist.next(false); };
  searchText = '';
  searchTextIndexes=''
  searchTextETF='';
  clicked:string = '';
  SelFilter: string = 'CN_asc';
  SelIndexFilter: string = 'IN_asc';
  SelETFFilter: string = 'ETF_asc';
  
  FilterETFChanged(val:any){    
    this.SelETFFilter = val.value;
    this.onETFSort();
    let selFilterData = this.FilterETFList.filter((x: any) => x.value == this.SelETFFilter);
    if (selFilterData.length > 0) {
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }
    this.sharedData.checkPostSortSetting('W', val, this.ascending_val, 'etf');
  }
  FilterIndexChanged(val:any){    
    this.SelIndexFilter = val.value;
    this.onIndexSort();
    let selFilterData = this.FilterIndexList.filter((x: any) => x.value == this.SelIndexFilter);
    if (selFilterData.length > 0) {
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }
    this.sharedData.checkPostSortSetting('W', val, this.ascending_val_ind, 'prebuild');
  }
  FilterChanged(val:any){    
    this.SelFilter = val.value;
    this.onSort();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) {
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }
    this.sharedData.checkPostSortSetting('W', val, this.ascending_val, 'equity');
  }
  filterETFItems() {
    this.searchTextETF = this.sharedData.removeSpecialCharacters(this.searchTextETF);
    if (this.searchTextETF != '') {
      var allData = this.etfData;
      this.etfSearchData = allData.filter((item: any) => item.etfName.toLowerCase().includes(this.searchTextETF.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchTextETF.toLowerCase()));
      } else {
        this.etfSearchData = this.etfData;
      }
  }
  filterIndexItems() {
    this.searchTextIndexes = this.sharedData.removeSpecialCharacters(this.searchTextIndexes);
    if (this.searchTextIndexes != '') {
      var allData = this.indexesData;
      this.indexesSearchData = allData.filter((item: any) => item.name.toLowerCase().includes(this.searchTextIndexes.toLowerCase()) || item.country.toLowerCase().includes(this.searchTextIndexes.toLowerCase()));
      } else {
        this.indexesSearchData = this.indexesData;
      }
  }
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    if (this.searchText != '') {
      var allData = this.equityData;
      this.equitySearchData = allData.filter((item: any) => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
      } else {
        this.equitySearchData = this.equityData;
      }
 

  }
  onToggleAscending() {  
    let that = this;
    this.ascending_val = !this.ascending_val;
    this.onSort();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) {
      this.sharedData.checkPostSortSetting('W', selFilterData[0], this.ascending_val, 'equity');
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }
  }

  onToggleIndexAscending() {  
    let that = this;
    this.ascending_val_ind = !this.ascending_val_ind;
    this.onIndexSort();
    let selFilterData = this.FilterIndexList.filter((x: any) => x.value == this.SelIndexFilter);
    if (selFilterData.length > 0) {
      this.sharedData.checkPostSortSetting('W', selFilterData[0], this.ascending_val_ind, 'prebuild');
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }   
  }
  onToggleETFAscending() {  
    let that = this;
    this.ascending_val_etf = !this.ascending_val_etf;
    this.onETFSort();
    let selFilterData = this.FilterETFList.filter((x: any) => x.value == this.SelETFFilter);
    if (selFilterData.length > 0) {
      this.sharedData.checkPostSortSetting('W', selFilterData[0], this.ascending_val_etf, 'etf');
      try {
        this.sharedData.userEventTrack('Equity Universe', selFilterData.Name, selFilterData.Name, 'right grid sort click');
      } catch (e) { }
    }
  }
  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.equitySearchData);
      var selind = that.equitySearchData.filter((x: any) => x.isin == that.highlightList);   
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.equitySearchData = [...dat]; } catch (e) { }
  }
  onIndexSort() {
    let that = this;
    let selFilterData = this.FilterIndexList.filter((x: any) => x.value == that.SelIndexFilter)[0];
    var dat = that.RangeIndexFilterGrid(selFilterData.value, that.indexesSearchData);
      var selind = that.indexesSearchData.filter((x: any) => x.isin == that.highlightList);   
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.indexesSearchData = [...dat]; } catch (e) { }
    
  }
  onETFSort() {
    let that = this;
    let selFilterData = this.FilterETFList.filter((x: any) => x.value == that.SelETFFilter)[0];
    var dat = that.RangeETFFilterGrid(selFilterData.value, that.etfSearchData);
      var selind = that.etfSearchData.filter((x: any) => x.isin == that.highlightList);
   
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
    try { this.etfSearchData = [...dat]; } catch (e) { }
  }


  RangeFilterGrid(IndexN:any, data:any) {
    var that = this;
    if (IndexN == 1 && (that.ascending_val == true)) { data = data.sort(function (x:any, y:any) { return ascending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); }); };
    if (IndexN == 1 && (that.ascending_val == false)) { data = data.sort(function (x:any, y:any) { return descending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); }); };

    if (IndexN == 2 && (that.ascending_val == true)) { data = data.sort(function (x:any, y:any) { return ascending(x.ticker, y.ticker); }); };
    if (IndexN == 2 && (that.ascending_val == false)) { data = data.sort(function (x: any, y: any) { return descending(x.ticker, y.ticker); }); };
    if (IndexN == 6 && (that.ascending_val == true)) { data = data.sort(function (x: any, y: any) { return ascending(x.score, y.score); }); };
    if (IndexN == 6 && (that.ascending_val == false)) { data = data.sort(function (x: any, y: any) { return descending(x.score, y.score); }); };
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  RangeIndexFilterGrid(IndexN:any, data:any) {
    var that = this;
    if (IndexN == 3 && (that.ascending_val_ind == true)) { data = data.sort(function (x:any, y:any) { return ascending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); }); };
    if (IndexN == 3 && (that.ascending_val_ind == false)) { data = data.sort(function (x:any, y:any) { return descending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); }); };

    if (IndexN == 4 && (that.ascending_val_ind == true)) { data = data.sort(function (x:any, y:any) { return ascending(x.country, y.country); }); };
    if (IndexN == 4 && (that.ascending_val_ind == false)) { data = data.sort(function (x:any, y:any) { return descending(x.country, y.country); }); };
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  RangeETFFilterGrid(IndexN:any, data:any) {
    var that = this;
    if (IndexN == 5 && (that.ascending_val_etf == true)) {
       data = data.sort(function (x:any, y:any) { return ascending(escape(x.etfName.toUpperCase()), escape(y.etfName.toUpperCase())); });
   
       };
    if (IndexN == 5 && (that.ascending_val_etf == false)) { data = data.sort(function (x:any, y:any) { return descending(escape(x.etfName.toUpperCase()), escape(y.etfName.toUpperCase())); }); };

    if (IndexN == 2 && (that.ascending_val_etf == true)) { data = data.sort(function (x:any, y:any) { return ascending(x.ticker, y.ticker); }); };
    if (IndexN == 2 && (that.ascending_val_etf == false)) { data = data.sort(function (x:any, y:any) { return descending(x.ticker, y.ticker); }); };
    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState:any, i:any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }
  defaultSortAsc: boolean = true;
  sortProductsAsc() {
    var that = this;
    that.defaultSortAsc = !that.defaultSortAsc;
    if (!this.defaultSortAsc) {
      // Sort in ascending order
      that.equitySearchData = [...that.equitySearchData].sort(function (x:any, y:any) { return ascending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); });
      that.indexesSearchData = [...that.indexesSearchData].sort(function (x:any, y:any) { return ascending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); });
      that.etfSearchData = [...that.etfSearchData].sort(function (x:any, y:any) { return ascending(escape(x.etfName.toUpperCase()), escape(y.etfName.toUpperCase())); });
   
    } else {
      // Sort in descending order
      that.equitySearchData = [...that.equitySearchData].sort(function (x:any, y:any) { return descending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); });
      that.indexesSearchData = [...that.indexesSearchData].sort(function (x:any, y:any) { return descending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); });
      that.etfSearchData = [...that.etfSearchData].sort(function (x:any, y:any) { return descending(escape(x.etfName.toUpperCase()), escape(y.etfName.toUpperCase())); });
     // console.log('Sorted in descending order:', this.sortedDirectIndexGridData);
    }
    
  }
}
