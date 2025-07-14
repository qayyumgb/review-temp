import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { FormControl } from '@angular/forms';
import { ThematicIndexService } from '../../../../core/services/moduleService/thematic-index.service';
import { PrebuildIndexService } from '../../../../core/services/moduleService/prebuild-index.service';

import { ToastrService } from 'ngx-toastr';
import { ascending, descending } from 'd3';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data/data.service';
declare var $: any;

@Component({
  selector: 'the-dilldown-list',
  templateUrl: './dilldown-list.component.html',
  styleUrl: './dilldown-list.component.scss',
})
export class DilldownListComponent_Thematic implements OnInit, OnDestroy {

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
  FilterList: any = [];
  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;
  SelFilter: number = 1;
  ascending_val: boolean = true;
  constructor(private router: Router, public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public preBuiltService: PrebuildIndexService, public theBuiltService: ThematicIndexService, public dataService: DataService, private toastr: ToastrService) {
    var that = this;
    this.filteredOptions = this.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that.theBuiltService._filter(res || undefined,'L')));
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, "Thematic Strategies");
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'thematic');
  }
  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, "Thematic Strategies");
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'thematic'); }
  }

  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'thematic'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'thematic', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var naaIndex_bcum = this.theBuiltService.thematicIndexBrcmData.subscribe(res => {
      this.naabreadcrumbdata = [...res];
    })
    var loadData = this.theBuiltService.thematicIndexList.subscribe((res: any) => {
      var PerfData = [...res].map((a: any) => ({ name: a.indexname, ...a })); 
        this.drilldown_List = PerfData;
      this.drilldown_List_Dup = PerfData;
      this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        this.theBuiltService.thematicGlobalData.next(PerfData);
    });
    this.subscriptions.add(naaIndex_bcum);
    this.subscriptions.add(loadData);
    var noDataFound = this.theBuiltService.filterOptionNodata.subscribe(res =>{
      if (isNotNullOrUndefined(res) && res.length > 1 && res[1] == 'L') { this.noDataFound = res[0]; };
      //if (isNotNullOrUndefined(res) && res) {
      //  d3.select(".DrilldownSearchBar").classed("no_DF", true);
      //} else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
    })
    this.subscriptions.add(noDataFound);

    if (this.theBuiltService.thematicIndexList.getValue().length == 0) {
      var GetThematicInd= this.dataService.GetThematicIndexes().pipe(first()).subscribe((res:any) => {
        if (res.length == 0) { setTimeout(() => { that.router.navigate(["/home"]); }, 1000); };
      });
      this.subscriptions.add(GetThematicInd);
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
  pinnedCompLeft: boolean = false;
  showDefault_select: string = '';
  defaultPushPin() {
    var that = this;
    that.pinnedCompLeft = !that.pinnedCompLeft;
    if (that.pinnedCompLeft) {
      that.sharedData.openPinnedLeftSide.next(true);
    } else { that.sharedData.openPinnedLeftSide.next(false); }
  }
  noDataFound: boolean = false;
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };

  ngAfterViewInit() {
    var that = this;
    setTimeout(() => { that.noDataFound = false; }, 500)
  }
  closeEmitValue() { this.hoverEmitter.emit(undefined); };

  @Output() hoverEmitter: EventEmitter<Date> = new EventEmitter<any>();

  sendHoverDate(d: any) {
    const currentData: any = d;
    this.hoverEmitter.emit(currentData); // Emit the current data
  }

  leaveHoverDate(d: any) {
    this.hoverEmitter.emit(undefined); // Emit the current data
  }

  loadData(data: any) {
    this.drilldown_List = [...data.filter((x: any) => x.category == "Thematic Strategies")];
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
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
      return name = d.indexname;
    }
  }
  formatNamehover(d: any) {
    var name = '';
    if (isNotNullOrUndefined(d.etfName)) {
      name = d.etfName.replaceAll('ETF', '');
      return name + ' (' + (d.ticker) + ')';
    } else { return name = d.indexname; }
  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }
}
