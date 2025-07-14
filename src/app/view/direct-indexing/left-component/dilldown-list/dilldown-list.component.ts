import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { isNotNullOrUndefined,SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { FormControl } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { scaleLinear, select } from 'd3';

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
  selector: 'app-dilldown-list',
  templateUrl: './dilldown-list.component.html',
  styleUrl: './dilldown-list.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class DilldownListComponent implements OnInit, OnDestroy {
  clr = scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  drilldown_List: any = [];
  drilldown_List_Dup: any = [];
  subscriptions = new Subscription();
  breadcrumbdata: any = [];
  showEtfMenu: boolean = false;
  showBackBtn: boolean = false;
  showSearchGrid: boolean = false;
  selectedPath: any = [];
  selectedValue: any;
  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;
  FilterList: any = [];
  SelFilter: number = 1;
  ascending_val: boolean = true;
  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public dirIndexService: DirectIndexService) {
    var that = this;
    if (that.sharedData.checkMenuPer(12, 169) != 'Y') { this.filteredOptions = undefined; }
    else {
      this.filteredOptions = that.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that._filter(res || undefined)));
    }
  }
  fromDIDashboard: boolean = false;
  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'di'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'di', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var directIndexBrcmData_unSub = this.dirIndexService.directIndexBrcmData.subscribe((res: any) => {
      if (res.length > 0) { that.fromDIDashboard = true; } else { that.fromDIDashboard = false; }
      that.selectedPath = [...res];
      that.loadData();
      this.glbSearch.reset();
      this.noDataFound = false;
    });
    this.subscriptions.add(directIndexBrcmData_unSub);
    var MenuPermission = this.sharedData.UserMenuRolePermission.subscribe(res => {
      if (res.length > 0 && !that.fromDIDashboard) {
        that.loadData();
      }
    });
    this.subscriptions.add(MenuPermission);
    this.dirIndexService.checkViewpage();

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
  pinnedCompLeft: boolean = false;
  showDefault_select: string = '';
  defaultPushPin() {
    var that = this;
    that.pinnedCompLeft = !that.pinnedCompLeft;
    if (that.pinnedCompLeft) {
      that.sharedData.openPinnedLeftSide.next(true);
    } else { that.sharedData.openPinnedLeftSide.next(false); }
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

  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Direct Indexing');
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'di');
  }

  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Direct Indexing');
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'di'); }
  }

  private _filter(value: any) {
    var filterValue: any = undefined;
    if (value instanceof Object) { value = '' };
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase(); }
    var compFilter: any = [...this.dirIndexService._getBetaIndex_Direct]
      .filter((res: any) => (res['name'].toLowerCase().includes(filterValue) || res['pbName'].toLowerCase().includes(filterValue)));
    if (isNotNullOrUndefined(value)) { this.noDataFound = compFilter.length === 0; } else { this.noDataFound = false; }
    if (this.noDataFound) {
      select(".DrilldownSearchBar").classed("no_DF", true);
    } else { select(".DrilldownSearchBar").classed("no_DF", false); }
    return [...compFilter];
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  loadData() {
    var that = this;
    if (that.sharedData.checkMenuPer(12, 169) != 'Y') { this.filteredOptions = undefined; }
    else {
      this.filteredOptions = that.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that._filter(res || undefined)));

    }
    if (this.selectedPath.length == 0) {
      this.selectedValue = { 'group': "" };
      //this.selectedValue = this.sharedData.PrebuiltMainTab[0];
      this.dirIndexService.showBackButton_bcrumb.next(false);
      //this.showBackBtn = false;
      this.dirIndexService.getDirectlvlData(this.selectedValue).then((data: any) => {
        var dta: any = data['menuData'];
        this.drilldown_List = [...dta];
        this.drilldown_List_Dup = [...dta];
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
      });
    } else {
      //this.showBackBtn = true;
      this.dirIndexService.showBackButton_bcrumb.next(true);
      this.selectedValue = this.selectedPath[this.selectedPath.length - 1];

      if (isNotNullOrUndefined(this.selectedValue.pbGroupType) && (this.selectedValue.pbGroupType == "Index" || this.selectedValue.group == "ETF" || this.selectedValue.pbGroupType == "ETFName")) {

        that.sharedData.showCircleLoader.next(true);
        that.sharedData.showCenterLoader.next(true);
        setTimeout(() => {
          that.dirIndexService.startIndexClick_direct.next(true);
          that.builIndexCalculate(this.selectedValue);
          that.dirIndexService.getDirectlvlData(this.selectedValue).then((data: any) => { });
        }, 100)
      } else {
        that.dirIndexService.startIndexClick_direct.next(false);
        that.dirIndexService.getDirectlvlData(this.selectedValue).then((data: any) => {
          var dta: any = data['menuData'];
          that.drilldown_List = [...dta];
          that.drilldown_List_Dup = [...dta];
          this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        });
      }
    }
    setTimeout(() => { that.fromDIDashboard = false; }, 2000)
  }

  left_Grid_Click(d: any) {
    this.selectedPath.push(d);
    this.dirIndexService.directIndexBrcmData.next(this.selectedPath);
    this.dirIndexService.customizeSelectedIndex_Direct.next(d);
    this.selectedValue = d;
    if (d.group == 'Beta') {
      this.dirIndexService.showBackButton_bcrumb.next(true);
      this.dirIndexService.getDirectlvlData(d).then((data: any) => {
        var dta: any = [...data['menuData']].map(a => ({ ...a }));
        dta = dta.sort(function (x: any, y: any) {
          const xValue = x?.medianCont || '';
          const yValue = y?.medianCont || '';
          return xValue.localeCompare(yValue, undefined, { sensitivity: 'base' });
        });
        this.drilldown_List = [...dta];
        this.drilldown_List_Dup = [...dta];
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        setTimeout(function () { select('#showMatLoader').style('display', 'none'); }, 500)
      });
      this.sharedData.userEventTrack('Direct Indexing', d.assetId, d.name, 'Left Grid Index click');
    }
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
      return name + ' (' + (d.ticker) + ')';

    } else {
      return name = d.name;
    }
  }
  formatNamehover(d: any) {
    var name = '';
    if (isNotNullOrUndefined(d.etfName)) {
      name = d.etfName.replaceAll('ETF', '');
      return name + ' (' + (d.ticker) + ')';
    } else { return name = d.name; }


  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }
  builIndexCalculate(d: any) {
    var that = this;

    that.dirIndexService.currentSList.next(d);
    /*///////////// prebuilt Filters*/
    //if (d.taxEffAwareness == "Y") { that.dirIndexService.bldMyIndTaxEffVal.next(1); }
    //else { that.dirIndexService.bldMyIndTaxEffVal.next(2); }
    //that.dirIndexService.bldMyIndSelByVal.next(d.selectBy);
    //that.dirIndexService.enableTrading_factsheet.next('N');
    //that.dirIndexService.bldMyIndselNoCompVal.next(d.noofComp);
    //that.dirIndexService.bldMyIndweightByVal.next(d.weightBy);
    //that.dirIndexService.bldMyIndCashTarget.next(d.cashTarget);
    //that.dirIndexService.bldMyIndRebalanceType.next(d.rebalanceType);

    /* ///////////// prebuilt Filters*/

    //that.dirIndexService.remAlphaCheck.next(0); 
    //that.dirIndexService.companyExList.next([]); 
    //that.dirIndexService.gicsExList.next([]);
    //that.dirIndexService.remGicsData.next([]);
    //this.dirIndexService.remHFScoreEnable.next(true);

    //that.dirIndexService.remGicsData.next(that.dirIndexService._remGicsData);
    //that.dirIndexService.remCompData.next(that.dirIndexService._remCompData);

    that.dirIndexService.customizeSelectedIndex_Direct.next(d);
    //that.dirIndexService.getStrategyData_rebuilt('0', 'A')
    //that.sharedData.showMatLoader.next(false);
    that.dirIndexService.showRightSideGrid_direct.next(true);
    //that.sharedData.showCenterLoader.next(true);
  }

}

