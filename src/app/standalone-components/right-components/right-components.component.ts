import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { FormControl } from '@angular/forms';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';

@Component({
  selector: 'app-right-components',
  standalone: true,
  imports: [],
  templateUrl: './right-components.component.html',
  styleUrl: './right-components.component.scss'
})
export class RightComponentsComponent {
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  universe: any = new FormControl();
  @Output() ClickedSelcomp = new EventEmitter<string>();
  /** receive/send data **/
  factorId: number = 0;
  sortedCustomerIndexGridData: any = [];
  cusIndexGridSearchData: any[] = [];
  toggleSearch: boolean = false;
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  searchText = '';
  SelFilter: any = 'erf_Score';
  ascending_val: boolean = true;
  FilterList: any = [];
  highlightList = '';

  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService) {

  }
  onkeysDown(event: any) {
    if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.endsWith(' ') && event.key == " ") { event.preventDefault(); }
    else if (isNotNullOrUndefined(event.key) && isNotNullOrUndefined(event.target.value) && event.target.value.length == 0 && event.key == " ") { event.preventDefault(); }
    else if (/^[/a-zA-Z0-9,'\s&.-]+$/.test(event.key)) { }
    else { event.preventDefault(); }
  };
  openSearch() {
    this.toggleSearch = true;
    setTimeout(() => {
      this.searchBox.nativeElement.focus();
    }, 100);
  }
  searchClose() {
    this.searchText = '';
    this.toggleSearch = false;
    this.filterItems();
  }
  filterItems() {
    this.searchText = this.sharedData.removeSpecialCharacters(this.searchText);
    this.sortedCustomerIndexGridData = this.cusIndexGridSearchData.filter(item => item.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || item.ticker.toLowerCase().includes(this.searchText.toLowerCase()));
    this.onSort();
    // console.log(this.cusIndexGridSearchData, this.sortedCustomerIndexGridData);
  }
  onSort() {
    let that = this;
    var dat: any = [];
    if (this.SelFilter == 'FV_asc') {
      dat = that.RangeFilterGrid(that.SelFilter, that.sortedCustomerIndexGridData);
    } else if (this.SelFilter == 'erf_Score') {
      dat = that.RangeFilterGrid(that.SelFilter, that.sortedCustomerIndexGridData);
    } else {
      let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
      dat = that.RangeFilterGrid(selFilterData.value, that.sortedCustomerIndexGridData);
    }
    try {
      this.sortedCustomerIndexGridData = [...dat];
      if (that.highlightList != undefined) {
        setTimeout(() => {
          that.vir_ScrollGrids('', that.sortedCustomerIndexGridData, that.highlightList);
        }, 200);
      }
    } catch (e) { }
    var selind: any = that.sortedCustomerIndexGridData.filter((x: any) => x.isin == that.highlightList);
    if (selind.length < 1) { selind = undefined; }
    else { selind = selind[0]; }
  }
  RangeFilterGrid(IndexN: any, data: any) {
    var that = this;
    if (IndexN == 1) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'companyName'))]; }
    else if (IndexN == 4) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'marketCap'))]; }
    else if (IndexN == 3) { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'ticker'))]; }
    else if (IndexN == "FV_asc") { data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'factorValue'))]; }
    else if (IndexN == "erf_Score") {
      data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'scores'))];
     /* data = this.findMyHandleIndex_H(data);*/
      data = [...data.sort(this.sortwithNullScore(that.ascending_val, 'scores'))];
    }

    var rowi = 0; var rowj = 0;
    data.forEach(function (nextState: any, i: any) {
      if (nextState.isin != "") { rowi++; rowj++; };
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }

  sortwithNullScore(ascending: any, key: any) {
    return function (a: any, b: any) {
      if (a[key] === b[key]) { return 0; }
      if (isNullOrUndefined(a[key]) || a[key] == 0) { return 1; }
      if (isNullOrUndefined(b[key]) || b[key] == 0) { return -1; }
      if (ascending) { return a[key] < b[key] ? -1 : 1; }
      return a[key] < b[key] ? 1 : -1;
    }
  }
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.onSort();
    $('.dropdown-menu-right').removeClass('show');
    this.sortTrack();
    if (this.SelFilter == 'FV_asc' || this.SelFilter == 'erf_Score') {
      let selFilterData = this.FilterList.filter((x: any) => x.value == 5);
      if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'ci'); }
    } else { this.sharedData.checkPostSortSetting('R', val, this.ascending_val, 'ci'); };
  }
  sortTrack() {
    try {
      if (this.SelFilter == 'FV_asc') {
        this.sharedData.userEventTrack('Custom Index', 'Factor Grid', 'Factor Grid', 'right grid sort click');
      } else if (this.SelFilter == 'erf_Score') {
        this.sharedData.userEventTrack('Custom Index', "ERF SCORE", "ERF SCORE", 'right grid sort click');
      } else {
        let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
        if (selFilterData.length > 0) {
          this.sharedData.userEventTrack('Custom Index', selFilterData.Name, selFilterData.Name, 'right grid sort click');
        }
      }
    } catch (e) { }
  }
  onToggleAscending() {
    let that = this;
    // if (isNotNullOrUndefined(event.checked)) { this.ascending_val = event.checked; }
    this.ascending_val = !this.ascending_val;
    this.onSort();
    this.sortTrack();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (this.SelFilter == 'FV_asc' || this.SelFilter == 'erf_Score') { selFilterData = this.FilterList.filter((x: any) => x.value == 5); };
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('R', selFilterData[0], this.ascending_val, 'ci'); }
  }
  vir_ScrollGrids(svgid: string, data: any, selind: any) {
    var that = this;
    const dontMove = 7;
    const viewportSize = this.viewPort.elementRef.nativeElement.offsetHeight;
    const itemsVisible = Math.floor(viewportSize / 40);
    const totalItems = this.cusIndexGridSearchData.length - itemsVisible;
    data.forEach(function (nextState: any, i: any) { return nextState.index = i; });

    if (selind == undefined || selind == "" || selind == null) {
      that.highlightList = "";
      setTimeout(() => { that.viewPort.scrollToIndex(0); }, 10);
    }
    else {
      var selIsins = [...data].filter(x => x.stockKey == selind);
      if (selIsins[0].index >= totalItems) {
        // console.log(selIsins[0].index)
        that.viewPort.scrollToIndex(selIsins[0].index + dontMove);
        setTimeout(() => { that.viewPort.scrollToIndex(selIsins[0].index + dontMove); }, 10);
      } else {
        setTimeout(() => {
          if (selIsins[0].index < dontMove) {
            this.viewPort.scrollToIndex(0);
          } else {
            that.viewPort.scrollToIndex(selIsins[0].index);
          }
        }, 100);
      }
    }
  }
  checkFactName() {
    var that = this;
    var factorName = "";
    var factorMD = this.cusIndexService.factorMasterData.value;
    var d = factorMD.filter((x: any) => x.id == that.factorId);
    if (d.length > 0) { factorName = d[0].displayname; }
    else { factorName = ""; }
    return factorName;
  }
  //findMyHandleIndex_H(data: any) {
  //  var dt = [...this.cusIndexService._exclusionCompData].map(a => ({ ...a })).filter((x: any) => x.scores > 0);
  //  dt = dt.sort(function (x, y) { return d3.ascending(parseFloat(escape(x.scores)), parseFloat(escape(y.scores))); });
  //  var per = d3.scaleLinear().domain([0, dt.length]).range([0, 100]);
  //  data.forEach((d: any) => {
  //    var selIndex = dt.findIndex(x => x.stockKey == d.stockKey);
  //    d['colorVal'] = per(selIndex);
  //    return d
  //  });
  //  return data
  //}
}
