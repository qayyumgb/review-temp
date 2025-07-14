import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
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
  selector: 'approved-dilldown-list',
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

  ngOnInit() {
    var that = this;
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

    var MenuPermission = this.sharedData.UserMenuRolePermission.subscribe(res => {
      if (res.length > 0) {
        that.loadData();
      }
    });
    var directIndexBrcmData_unSub = this.dirIndexService.directIndexBrcmData.subscribe((res: any) => {
      that.selectedPath = [...res];
      that.loadData();
      this.glbSearch.reset();
      this.noDataFound = false;
    });
    this.subscriptions.add(directIndexBrcmData_unSub);
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
  noDataFound = false;
  private _filter(value: any) {
    var filterValue: any = undefined;
    if (value instanceof Object) { value = '' };
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase() }
    var compFilter:any= [...this.dirIndexService._getBetaIndex_Direct]
      .filter((res: any) => (res['name'].toLowerCase().includes(filterValue) || res['pbName'].toLowerCase().includes(filterValue)));;
    if (isNotNullOrUndefined(value)) { this.noDataFound = compFilter.length === 0; } else { this.noDataFound = false; }
    if (this.noDataFound) {
      select(".DrilldownSearchBar").classed("no_DF", true);
    } else { select(".DrilldownSearchBar").classed("no_DF", false); }
      return [...compFilter]
  }
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };

  ngAfterViewInit() {
    var that = this;
    setTimeout(() => { that.noDataFound = false; }, 500)
  }

  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Approved Strategies');
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'di');
  }
  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Approved Strategies');
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'di'); }
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
        if (that.sharedData.checkMenuPer(12, 169) != 'Y') {
          this.drilldown_List = [];
          this.drilldown_List_Dup = [];
        }
        else {
          this.drilldown_List = [...dta];
          this.drilldown_List_Dup = [...dta];
        }
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
          this.dirIndexService.startIndexClick_direct.next(true);
          this.builIndexCalculate(this.selectedValue);
          this.dirIndexService.getDirectlvlData(this.selectedValue).then((data: any) => { });
        }, 100)
       
      } else {
        this.dirIndexService.startIndexClick_direct.next(false);
        this.dirIndexService.getDirectlvlData(this.selectedValue).then((data: any) => {
          var dta: any = data['menuData'];
          this.drilldown_List = [...dta];
          this.drilldown_List_Dup = [...dta];
          this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        });
      }
    }
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
      this.sharedData.userEventTrack('Approved Strategies', d.assetId, d.name, 'Left Grid Index click');
    }
  }

  formatName(d: any) {
    if (isNotNullOrUndefined(d.etfName)) {
      var name = d.etfName.replaceAll('ETF', '');
      if (name.length > 28) { name = name.slice(0, 26).trim() + "..."; }
      else { name = name; }
      return name + ' (' + (d.ticker) + ')';
    } else { return name = d.name; }
  }

  formatNamehover(d: any) {
    var name = '';
    if (isNotNullOrUndefined(d.etfName)) {
      name = d.etfName.replaceAll('ETF', '');
      return name + ' (' + (d.ticker) + ')';
    } else { return name = d.name; }
  }

  builIndexCalculate(d: any) {
    var that = this;

    that.dirIndexService.currentSList.next(d);
    that.dirIndexService.customizeSelectedIndex_Direct.next(d);
    that.dirIndexService.showRightSideGrid_direct.next(true);
  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }
}
