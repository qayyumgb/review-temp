import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../core/services/data/data.service';
import { HisTimelineComponent } from '../../universeDialogsModule/his-timeline/his-timeline.component';
import { existingPopupComponent } from '../../charts-popup/existing-popup/existing-popup.component';
import { ascending, descending } from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import { EtfsUniverseService } from '../../../core/services/moduleService/etfs-universe.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { CompareComponent } from '../../universeDialogsModule/compare/compare.component';
import { VscompareComponent } from '../../universeDialogsModule/vscompare/vscompare.component';
import * as d3 from 'd3';
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
  selector: 'etfLeftGrid',
  templateUrl: './left-grid.component.html',
  styleUrl: './left-grid.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class LeftGridComponent implements OnInit, OnDestroy {
  drilldown_List: any = [];
  subscriptions = new Subscription();
  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;
  showTimelineBtn: boolean = false;
  showCompareBtn: boolean = false;
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterList: any = [];
  constructor(private cusIndexService: CustomIndexService, public dataService: DataService,
    public dialog: MatDialog, private router: Router,
    public etfService: EtfsUniverseService, public sharedData: SharedDataService) {
    var that = this;
    this.filteredOptions = that.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that._filter(res || undefined)));
  }
  noDataFound: boolean = false;

  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'ETF Universe');
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'etf');
  }
  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'ETF Universe');
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'etf'); }
  }

  ngAfterViewInit() {
    var that = this;
    setTimeout(() => { that.noDataFound = false; }, 500)
  }

  private _filter(value: any) {
    var filterValue: any = undefined;
    if (value instanceof Object) { value = '' };
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase() }
    var etfIndex: any = [...this.sharedData.ETFIndex.value]
      .filter((res: any) => (res['etfName'].toLowerCase().includes(filterValue) || res['ticker'].toLowerCase().includes(filterValue)));
    etfIndex = etfIndex.map((item: any) => ({ name: item.etfName, group: 'ETFIndex', med: (item.medianCont * 100), indexType: 'Exchange Traded Funds', ...item }));
    this.noDataFound = etfIndex.length === 0;
    if (this.noDataFound) {
      d3.select(".DrilldownSearchBar").classed("no_DF", true);
    } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
    return [...etfIndex];
  }

  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };
  breadcrumbdata: any = [];
  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'etf'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'etf', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var crumbdata: any = this.etfService.breadcrumbdata.subscribe((res: any) => {
      this.breadcrumbdata = res;
      this.loadEtfData();
      this.checkWatchList();
      this.checkToolCustBtn(res);
      if (isNotNullOrUndefined(this.glbSearch.value) && (this.glbSearch.value != "" && this.glbSearch.value?.length != 0)) {
        this.glbSearch.reset();
        setTimeout(() => { this.noDataFound = false; }, 50);
      } else { this.noDataFound = false; }
    });
    this.subscriptions.add(crumbdata);

    var WatchListData: any = this.sharedData.WatchListData.subscribe((res: any) => { this.checkWatchList(); });
    this.subscriptions.add(WatchListData);

    var selComp: any = this.etfService.selComp.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) { this.showTimelineBtn = true }
      else { this.showTimelineBtn = false }
      this.checkWatchList();
    });
    this.subscriptions.add(selComp);

    var selResData: any = this.sharedData.selResData.subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.loadEtfData();
        if (!this.sharedData._frmGlobalSearchClick) {
          this.sharedData.showCircleLoader.next(false);
        }
      }
    });
    this.subscriptions.add(selResData);

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
  industryName(d: any) {
    if (d == 'Industrygroup') { return 'Industry Group' }
    else if (d == 'ETFIndex') { return 'Exchange Traded Funds' }
    else { return d }
  }

  showToolCustomBtn: boolean = false;
  checkToolCustBtn(data: any) {
    this.showToolCustomBtn = false;
    if (isNotNullOrUndefined(data) && data.length > 0) {
      var ind: any = data.filter((x: any) => x['group'] == "ETFIndex");
      if (ind.length > 0 && isNotNullOrUndefined(ind[0]['recommendedETF'])) {
        this.showToolCustomBtn = (ind[0]['recommendedETF'] == 'Y') ? true : false;
      }
    }
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  openAvoidLosers() {
    this.etfService.triggerCumulativeLinechart.next(true);
  }
  loadEtfData() {
    var that = this;    
    this.showCompareBtn = false;
    this.drilldown_List = [];
    this.sharedData.showMatLoader.next(true);
    var index: any = that.etfService._breadcrumbdata.filter((x: any) => x['group'] == "ETFIndex");
    if (index.length > 0) { this.sharedData.showCircleLoader.next(true); }
    that.etfService.getETFsLevelData().then((res: any) => {
      if (isNotNullOrUndefined(res['menuData'])) {
        if (this.etfService._breadcrumbdata.length > 0) {
          this.drilldown_List = [...res['menuData']].sort(function (x: any, y: any) { return ascending((x.name), (y.name)); });         
        } else { this.drilldown_List = [...res['menuData']]; }
      } else { this.drilldown_List = []; }
      if (this.drilldown_List.length ==0 &&this.etfService.breadcrumbdata.value.length == 0) { this.router.navigate(["/home"]); }
      this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);      
      if (isNotNullOrUndefined(res['CompanyList'])) {
        this.etfService.rightGridData.next(res['CompanyList']);
        var selcomp: any = this.etfService.selComp.value
        if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['stockKey'])) {
          var selDt = res['CompanyList'].filter((x: any) => x.stockKey == selcomp['stockKey']);
          if (selDt.length > 0) {
            that.etfService.selComp.next(selDt[0])
          } else { that.etfService.selComp.next(undefined) }
        } else { that.etfService.selComp.next(undefined) }
      } else { this.etfService.rightGridData.next([]) };      
      this.sharedData.showMatLoader.next(false);
      if (index.length > 0) { this.sharedData.showCircleLoader.next(false); } 
    })
    var sector: any = that.etfService._breadcrumbdata.filter((x: any) => x['group'] == "Sector" || x['group'] == "ETFIndex");
    if (sector.length > 0) { this.showCompareBtn = true; }    
  }
  formatNamehover(d: any) {
    var name = '';
    // console.log(d ,'else')
    if (isNotNullOrUndefined(d.etfName)) {
      name = d.etfName.replaceAll('ETF', '');
      if (isNotNullOrUndefined(d.ticker) && d.ticker != "") {
        return name + ' (' + (d.ticker) + ')';
      }
      else {
        return name;
      }
     
    } 
    else
     { 
      // console.log(d.name + ' (' + (d.CommonTicker) + ')' ,'else')
      if(isNotNullOrUndefined(d.ticker) && d.ticker != ""){
        return d.name + ' (' + (d.ticker) + ')';
        
      }
      else{
        return name = d.name; 
      }
   
    }
  }
  leftGridClick(d: any) {
    this.sharedData.showMatLoader.next(true);
    this.etfService.selGICS.next(d);
    var crumbdata: any = this.etfService.breadcrumbdata.value;
    crumbdata.push(d);
    this.etfService.breadcrumbdata.next(crumbdata);
    try {
      this.sharedData.userEventTrack('ETF Universe', d.name, d.name, 'left grid Click');
    } catch (e) { }
  }
  sortScore(resData: any) {
    var med = [];
    if (isNotNullOrUndefined(resData[0].med)) {
      return resData.sort(function (x: any, y: any) { return descending(parseFloat(x.med), parseFloat(y.med)); })
    } else { return resData; }

  }
  checkGridClass(data: any) {
    var rtrn: boolean = false;
    try { 
    if (isNotNullOrUndefined(this.etfService._selComp) && isNotNullOrUndefined(data.code) && isNotNullOrUndefined(this.etfService._selComp['industry'])) {
      if ((this.etfService._selComp['industry']).toString().indexOf(data.code) == 0) { return true; }
      }
    } catch (e) { }
    return rtrn;
  }
  digitFormat(d: any) { return d3.format(",.1f")(d) }
  openToolCustom() {
    var that = this;
    /*** Check Existing Popup ***/
    that.sharedData.showMatLoader.next(true);
    that.dataService.GetStgyListDashboard('A').pipe(first()).subscribe((res: any) => {
      var bcrum: any = this.etfService.breadcrumbdata.value;
      var ind: any = bcrum.filter((x: any) => x['group'] == "ETFIndex");
      if (ind.length > 0) {
        var cssl = [...res].filter(v => v.assetId == ind[0].assetId && isNotNullOrUndefined(v['name']) && v['name'] !="");
        //cssl.sort(function (x: any, y: any) { return ascending(x.rowno, y.rowno); });
        cssl = cssl.sort((a: any, b: any) => { return <any>new Date(b.modifieddate) - <any>new Date(a.modifieddate); });
        var existing_stat_list = [...cssl];
        if (existing_stat_list.length > 0) {
          that.openCustomExistingPopup(existing_stat_list, ind[0]);
        } else {
          this.cusIndexService.customizeSelectedIndex_custom.next(ind[0]);
          this.cusIndexService.selCompany.next(undefined);
          this.cusIndexService.currentSList.next(undefined);
          this.cusIndexService.currentSNo.next(-1);
          this.sharedData.showMatLoader.next(false);
          this.router.navigate(["/customIndexing"]);
        }
      }
    }, (error: any) => { this.sharedData.showMatLoader.next(false); });
    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService.selGICS.value.name, this.etfService.selGICS.value.name, 'Custom tool btn Click');
    } catch (e) { }
  }

  openCustomExistingPopup(existing_List: any, currentList: any) {
    var title = 'ETF Index Strategies';
    var options = { from: 'etfCustomTool', error: 'existingPopup', destination: 'openCustomIndex', currentList: currentList, customIndex: currentList, selCompany: "" }
    var clickeddata: any = existing_List;
    this.dialog.open(existingPopupComponent, {
      width: "37%", height: "auto", maxWidth: "100%", maxHeight: "90vh",
      panelClass: 'custom-modalbox',
      data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options }
    });
    this.sharedData.showMatLoader.next(false);
    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService.selGICS.value.name, this.etfService.selGICS.value.name, 'Custom tool popup Click');
    } catch (e) { }
  }

  openHisTimeline() {
    var title = 'ETF Index History Timeline';
    var ind: any = this.etfService._breadcrumbdata.filter((x: any) => x['group'] == "ETFIndex");
    var options = {
      from: 'etfUniverse',
      error: 'hisTimline',
      destination: 'HistimelinePopup',
      selGICS: this.etfService.selGICS.value,
      index: (ind.length > 0) ? ind[0] : undefined,
      rightGridData: this.etfService._rightGridData,
      avoidLoserData: this.etfService._avoidLoserData,
      breadcrumb: this.etfService._breadcrumbdata,
      SRValue: this.etfService._SRValue,
      CType: 'ETF'
    }

    this.dialog.open(HisTimelineComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title,  dialogSource: options }
    });

    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService.selGICS.value.name, this.etfService.selGICS.value.name, 'History Timeline popup Click');
    } catch (e) { }
  }

  openCompare() {
    var title = 'Sector Compare';
    var options = {
      from: 'etfUniverse',
      error: 'Compare',
      destination: 'comparePopup',
      selComp: this.etfService.selComp.value,
      selGICS: this.etfService.selGICS.value,
      circleData: this.etfService.rightGridData.value,
      holdingDate: this.etfService.breadcrumbdata.value,
      breadcrumb: this.etfService.breadcrumbdata.value
    }

    var dilog = this.dialog.open(CompareComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    }).afterClosed().subscribe(response => {
      if (isNotNullOrUndefined(response) && isNotNullOrUndefined(response['selComp'])) {
        this.etfService.selComp.next(response['selComp']);
      }
    });
    this.subscriptions.add(dilog);
    try {
      this.sharedData.userEventTrack('ETF Universe', this.etfService.selComp.value.name, this.etfService.selGICS.value.name, 'Compare popup Click');
    } catch (e) { }
  }

  openVsCompare() {
    var title = 'Sector VsCompare';
    var ind: any = this.etfService._breadcrumbdata.filter((x: any) => x['group'] == "ETFIndex");
    var options = {
      from: 'etfUniverse',
      error: 'VsCompare',
      destination: 'VscomparePopup',
      selComp: this.etfService.selComp.value,
      selGICS: this.etfService.selGICS.value,
      index: (ind.length > 0) ? ind[0] : undefined,
      rightGridData: this.etfService.rightGridData.value,
      holdingDate:this.etfService.breadcrumbdata.value
    }

    this.dialog.open(VscompareComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    });
    try {
        this.sharedData.userEventTrack('ETF Universe', ((ind.length > 0) ? ind[0]['name'] : "") , this.etfService.selGICS.value.name, 'VS Compare popup Click');
    } catch (e) { }
  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }

  showWatchListIcon: boolean = false;
  watchListIconClicked: boolean = false;
  checkWatchList() {
    this.showWatchListIcon = false;
    this.watchListIconClicked = false;
    var selComp: any = this.etfService._selComp;
    var index: any = this.etfService._breadcrumbdata.filter((x: any) => x['group'] == "ETFIndex");

    var watchListData: any = this.sharedData.WatchListData.value;
    if (isNotNullOrUndefined(selComp)) {
      this.showWatchListIcon = true;
      var filComp: any = watchListData.filter((x: any) => x['stockkey'] == selComp['stockKey']);
      if (filComp.length > 0) { this.watchListIconClicked = true; }
    } else if (index.length > 0) {
      this.showWatchListIcon = true;
      var filInd: any = watchListData.filter((x: any) => (x['indexname'] == index[0]['name'] || x['assets'] == index[0]['assetId']) && isNullOrUndefined(x['stockkey']));
      if (filInd.length > 0) { this.watchListIconClicked = true; }
    }
  }

  addWatchList() {
    var indexAdd: boolean = false;
    var companyAdd: boolean = false;
    var Type: string = '';

    if (isNotNullOrUndefined(this.etfService._selComp)) {
      companyAdd = true;
      Type = "Company";
    } else {
      indexAdd = true;
      Type = "Index";
    }

    this.sharedData.AddToWatchList(indexAdd, companyAdd, Type, 'ETF', this.etfService._selComp, this.etfService._breadcrumbdata, this.watchListIconClicked);
  }

  resetSrc() {
    this.glbSearch.reset();
    this.clearInput();
  }
}
