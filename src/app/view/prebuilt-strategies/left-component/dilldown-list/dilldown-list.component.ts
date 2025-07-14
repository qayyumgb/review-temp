import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormControl } from '@angular/forms';
import * as d3 from 'd3';
import { ascending, descending } from 'd3';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data/data.service';
export const slideLeftAnimation = trigger('slideLeft', [
  transition(':enter', [
    style({ transform: 'translateX(50%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
]);
export const newListAnimation = trigger('newList', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);

declare var $: any;
@Component({
  selector: 'pre-dilldown-list',
  templateUrl: './dilldown-list.component.html',
  styleUrl: './dilldown-list.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class DilldownListComponent_Prebuilt implements OnInit, OnDestroy {
  FilterList: any = [{ "Name": 'Name', "value": "1", "ID": "CN_asc" }];
  gridData_Def: any = [];
  gridData_Def_Dup: any = [];
  drilldown_List: any = [];
  drilldown_List_Dup: any = [];
  subscriptions = new Subscription();
  breadcrumbdata: any = [];
  naabreadcrumbdata: any = [];
  bcum_etf: any = [];
  showBackBtn: boolean = false;
  showInvestFactsheet: boolean = false;
  showReviewBtn: boolean = false;
  clkdID: string = 'NAA Index';

  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;

  SelFilter: number = 1;
  ascending_val: boolean = true;
  constructor(private router: Router, public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public preBuiltService: PrebuildIndexService, private logger: LoggerService, public dataService: DataService,) {
    var that = this;
    this.filteredOptions = this.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that.preBuiltService._filter(res || undefined,'L')));
  }

  industryName(group: string) { if (group == 'all' || this.preBuiltService.prebuiltIndexBrcmData.value.length == 0) { return 'Module' } else if (group == 'subCategory') { return 'Sub Category' } else { return group } }

  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.getCustomData().then((res: any) => { this.drilldown_List = this.sharedData.onLeftGridSort([...res], this.SelFilter, this.ascending_val); });
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, "Prebuilt Strategies");
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'prebuild');
  }
  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.getCustomData().then((res: any) => { this.drilldown_List = this.sharedData.onLeftGridSort([...res], this.SelFilter, this.ascending_val); });   
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, "Prebuilt Strategies");
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'prebuild'); }
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); this.preBuiltService.showViewReport.next(false); }
  pinnedCompLeft: boolean = false;
  showDefault_select: string = '';
  showViewReport: boolean = false;
  defaultPushPin() {
    var that = this;
    that.pinnedCompLeft = !that.pinnedCompLeft;
    if (that.pinnedCompLeft) {
      that.sharedData.openPinnedLeftSide.next(true);
    } else { that.sharedData.openPinnedLeftSide.next(false); }
  }
  viewReport() { this.preBuiltService.showViewReport.next(true); }
  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'prebuild'); });
    this.subscriptions.add(getSortMasterData);

    var showVR = this.preBuiltService.showViewReport.subscribe(res => { this.showViewReport = res });
    that.subscriptions.add(showVR);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'prebuild', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.getCustomData().then((res: any) => {
          this.drilldown_List = this.sharedData.onLeftGridSort([...res], this.SelFilter, this.ascending_val);
          setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
        });
      }
    });
    this.subscriptions.add(getSortSettingData);

    var naaIndex_bcum = this.preBuiltService.prebuiltIndexBrcmData.subscribe(res => {
      this.naabreadcrumbdata = [...res];
      if (res.length <= 0) { that.clkdID = 'NAA Index'; }
      else {
        this.showBackBtn = true;
        var bcum = res[res.length - 1];
        that.clkdID = bcum.name;
        if (isNullOrUndefined(that.clkdID)) { that.clkdID = 'NAA Index' }
        this.glbSearch.reset();        
        this.noDataFound = false;
      };
      if (res.length > 0 && (this.naabreadcrumbdata[this.naabreadcrumbdata.length - 1].group == "subCategory" || this.naabreadcrumbdata[this.naabreadcrumbdata.length - 1].group == "Index")) { }
      else if (res.length > 0) {
        /*** Go Back ***/
        this.preBuiltService.selNaaIndex.next(this.naabreadcrumbdata[this.naabreadcrumbdata.length - 1]);
        this.loadData();
        /*** Go Back ***/
      } else {
        /*** Home ***/
        this.preBuiltService.showRightSideGrid_prebuilt.next(false);
        this.preBuiltService.selNaaIndex.next(undefined);
        this.loadData();
        /*** Home ***/
      }
    })
    this.subscriptions.add(naaIndex_bcum);
    var selResData = this.sharedData.selResData.subscribe(res => {
      if (res.length > 0) {
       this.sharedData.showCircleLoader.next(false);
      }
    });
    var naaorderlist = this.preBuiltService.naaIndexOrderList.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.loadData(); }
    });
    this.subscriptions.add(selResData);
    this.subscriptions.add(naaorderlist);
    var noDataFound = this.preBuiltService.filterOptionNodata.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 1 && res[1] == 'L') { this.noDataFound = res[0]; };
      if (this.noDataFound) {
        d3.select(".DrilldownSearchBar").classed("no_DF", true);
      } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
    })
    this.subscriptions.add(noDataFound);

    if (this.preBuiltService.naaIndexOrderList.getValue().length == 0) {
      var GetIndexOrder = this.dataService.GetIndexOrder().pipe(first()).subscribe((res: any) => {
        if (isNullOrUndefined(res) || res.length == 0) { that.router.navigate(["/home"]); }        
      });
      this.subscriptions.add(GetIndexOrder);
    }
    var getSelectedLeftSide: any = this.sharedData.getSelectedLeftSide.subscribe((res: any) => {

      if (res == 'Y') { this.showDefault_select = 'showList' }
      else {
        that.pinnedCompLeft = this.sharedData._openPinnedLeftSide;
        this.showDefault_select = ''
      }

    });
    this.subscriptions.add(getSelectedLeftSide);
    var openPinnedLeftSide: any = this.sharedData.openPinnedLeftSide.subscribe((res: any) => {
      that.pinnedCompLeft = res;
    });
    this.subscriptions.add(openPinnedLeftSide);
  }
  showDefault_select_hover(select: string) {
    if (!this.sharedData._openPinnedLeftSide) {
      this.showDefault_select = select;
    }
  }
  toggleIconSelect(select: string) {
    if (this.sharedData._getSelectedLeftSide == 'Y' && this.showDefault_select == select) { this.showDefault_select = ''; this.sharedData.getSelectedLeftSide.next('N'); }
    else { this.showDefault_select = select; this.sharedData.getSelectedLeftSide.next('Y'); this.pinnedCompLeft = this.sharedData._openPinnedLeftSide; }
  }
  noDataFound: boolean = false;
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };

  ngAfterViewInit() {
    var that = this;
    setTimeout(() => { that.noDataFound = false; }, 500)
  }

  getCustomData() {
    return new Promise((resolve, reject) => {
      if (this.SelFilter == 5) {
        this.preBuiltService.getNaaIndexLvlData(this.preBuiltService.selNaaIndex.value)
          .then((res: any) => { resolve([...res['menuData']]); });
      } else { resolve([...this.drilldown_List]); }
    });
  }

  loadData() {
    this.preBuiltService.getNaaIndexLvlData(this.preBuiltService.selNaaIndex.value).then((res:any) => {
      var dta = [...res['menuData']]//.filter(x=>x.med != "0.0");
      this.drilldown_List = [...dta];  
      // console.log(this.drilldown_List,'drilldown_List')    
      this.drilldown_List_Dup = [...dta];
      //console.log('naaIndexGridData', [...dta]);
      this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
      this.preBuiltService.naaIndexGridData.next([...res['CompanyList']]);
      if (this.sharedData._selResData.length > 0) {
        setTimeout(() => { d3.select('#showMatLoader').style('display', 'none'); this.sharedData.showCircleLoader.next(false); }, 500)
      }
      //this.sharedData.showMatLoader.next(false);
    });
  }

  left_Grid_Click(d: any) {
    var that = this;
    if ((d.group == "subCategory" || d.group == "Index") && isNotNullOrUndefined(d['indexid'])) {
      that.sharedData.showCenterLoader.next(true);
      that.sharedData.showMatLoader.next(true);
      that.preBuiltService.showRightSideGrid_prebuilt.next(true);
      that.preBuiltService.startIndexClick_prebuilt.next(true);
      that.preBuiltService.selNaaIndex.next(d);
      that.preBuiltService.customizeSelectedIndex_prebuilt.next(d);
      that.preBuiltService._prebuiltIndexBrcmData.push(d);
      that.preBuiltService.prebuiltIndexBrcmData.next(that.preBuiltService._prebuiltIndexBrcmData);
      this.preBuiltService.GetFamilyindexsector(this.preBuiltService.selNaaIndex.value);
      this.sharedData.userEventTrack("Prebuilt Strategies", "left grid", d.name, 'Index strategy Click');
    }
    //else if (d.group == "Index") {
    //  that.sharedData.showCenterLoader.next(true);
    //  that.preBuiltService.selNaaIndex.next(d);
    //  that.preBuiltService.showRightSideGrid_prebuilt.next(false);
    //  that.sharedData.userEventTrack('Prebuilt Strategies', "left grid", d.name, 'index click');
    //  that.preBuiltService._prebuiltIndexBrcmData.push(d);
    //  that.preBuiltService.prebuiltIndexBrcmData.next(that.preBuiltService._prebuiltIndexBrcmData);
    //  that.preBuiltService.getNaaIndexLvlData(that.preBuiltService.selNaaIndex.value).then((res:any) => {
    //    if ([...res['CompanyList']].length == 0 || that.sharedData.checkServiceError([...res['CompanyList']])) {
    //      that.sharedData.showCenterLoader.next(false);
    //      //that.toastr.info('Data not available', '', { timeOut: 5000 });
    //      //setTimeout(() => { that.onPreviousGrp(); }, 100);
    //    } else {
    //      d.group = "Index";
    //      //that.sharedData.naaIndexEnable.next(false)
    //      that.preBuiltService.customizeSelectedIndex_prebuilt.next(d);
    //      that.preBuiltService.startIndexClick_prebuilt.next(true); // Show Index factsheet 
    //      //that.preBuiltService.startCustomIndexClick.next(true);
    //      //that.preBuiltService.esgRatingValue.next(0);
    //      that.preBuiltService.GetESGCatStocks();
    //      that.preBuiltService.exclusionCompData.next([...res['CompanyList']]);
    //      setTimeout(function () {
    //        that.preBuiltService.showRightSideGrid_prebuilt.next(true);
    //        that.sharedData.showMatLoader.next(false);
    //        that.sharedData.showCenterLoader.next(false);
    //      }, 500)
    //    }
    //  });
    //}
    else {
     // that.preBuiltService.selNaaIndex.next(d);
      that.preBuiltService.showRightSideGrid_prebuilt.next(false);
      that.preBuiltService.selNaaIndex.next(d);
      that.preBuiltService._prebuiltIndexBrcmData.push(d);
      that.preBuiltService.prebuiltIndexBrcmData.next(that.preBuiltService._prebuiltIndexBrcmData);
     // that.preBuiltService.naaIndex_bcum_length.next(calc_l + 1);
      //that.loadData();
    }
    
    //this.selectedPath.push(d);
    //this.dirIndexService.directIndexBrcmData.next(this.selectedPath);
    //this.dirIndexService.customizeSelectedIndex_Direct.next(d);
    //this.selectedValue = d;
    //if (d.group == 'Beta') {
    //  this.dirIndexService.showBackButton_bcrumb.next(true);
    //  this.dirIndexService.getDirectlvlData(d).then((data: any) => {
    //    var dta: any = [...data['menuData']].map(a => ({ ...a }));
    //    dta = dta.sort(function (x: any, y: any) {
    //      const xValue = x?.medianCont || '';
    //      const yValue = y?.medianCont || '';
    //      return xValue.localeCompare(yValue, undefined, { sensitivity: 'base' });
    //    });
    //    this.drilldown_List = [...dta];
    //    this.drilldown_List_Dup = [...dta];
    //    setTimeout(function () { d3.select('#showMatLoader').style('display', 'none'); }, 500)
    //  });
    //  this.sharedData.userEventTrack('Direct Indexing', d.assetId, d.name, 'Left Grid Index click');
    //}
  }
  formatName(d: any) {
   
    if (isNotNullOrUndefined(d.etfName)) {
      var name = d.etfName.replaceAll('ETF', '');
      if (name.length > 28) {
        name = name.slice(0, 26).trim() + "...";
      }
      else {
        name = name;
      }
      return name + ' (' + (d.CommonTicker) + ')';

    } else {
      return name = d.name;
    }
  }
  formatNameTrim(d: any) {
    if (isNotNullOrUndefined(d.etfName)) {
      var name = d.etfName.replaceAll('ETF', '');
      if (name.length > 28) {
        name = name.slice(0, 26).trim() + "...";
      }
      else {
        name = name;
      }
      return name + ' (' + (d.CommonTicker) + ')';

    } else {
      var name = d.name.replaceAll('New Age Alpha', 'NAA');
      return name = name;
    }
  }
  formatNamehover(d: any) {
    var name = '';
    // console.log(d ,'else')
    if (isNotNullOrUndefined(d.etfName)) {
      name = d.etfName.replaceAll('ETF', '');
      // console.log(name + ' (' + (d.CommonTicker) + ')' ,'ticker')
      return name + ' (' + (d.CommonTicker) + ')';
    } 
    else
     { 
      // console.log(d.name + ' (' + (d.CommonTicker) + ')' ,'else')
      if(isNotNullOrUndefined(d.CommonTicker) && d.CommonTicker === ""){
       
        return name = d.name; 
      }
      else{
        return d.name + ' (' + (d.CommonTicker) + ')';
      }
   
    }
  }
  openLoader() {
    var that = this;
    that.sharedData.showCenterLoader.next(true);
    that.sharedData.showMatLoader.next(true);
  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }
}
