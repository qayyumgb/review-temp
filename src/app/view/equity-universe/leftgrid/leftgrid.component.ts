import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EquityUniverseService } from '../../../core/services/moduleService/equity-universe.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { Observable, Subscription, first, map, startWith } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormControl } from '@angular/forms';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import d3, { ascending, descending } from 'd3';
import { DataService } from '../../../core/services/data/data.service';
import { existingPopupComponent } from '../../charts-popup/existing-popup/existing-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HisTimelineComponent } from '../../universeDialogsModule/his-timeline/his-timeline.component';
import { TimelineComponent } from '../../universeDialogsModule/timeline/timeline.component';
import { CompareComponent } from '../../universeDialogsModule/compare/compare.component';
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
  selector: 'equityDefaultLeftgrid',
  templateUrl: './leftgrid.component.html',
  styleUrl: './leftgrid.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class LeftgridComponent implements OnInit, OnDestroy, AfterViewInit {
  drilldown_List: any = [];
  breadcrumbdata: any = [];
  subscriptions = new Subscription();
  glbSearch = new FormControl('');
  filteredOptions: Observable<any[]> | undefined;
  showCutomTool: boolean = false;
  showTimelineBtn: boolean = false;
  showCompareBtn: boolean = false;
  FilterList: any = [];

  constructor(private cusIndexService: CustomIndexService, public dataService: DataService,
    public dialog: MatDialog, private router: Router,
    public equityService: EquityUniverseService, public sharedData: SharedDataService) {
    var that = this;
    this.filteredOptions = that.glbSearch.valueChanges.pipe(startWith(''), map((res: any) => that._filter(res || undefined)));   
  }
  //@HostListener('document:click', ['$event'])
  //onDocumentClick(event: MouseEvent) {
  //  setTimeout(() => {
  //  const target = event.target as HTMLElement;
  //  if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
  //    if (this.pinnedCompLeft && this.showDefault_select == 'showList') {
  //      this.showDefault_select = this.showDefault_select;
  //    }
  //    else { this.showDefault_select = ''; this.sharedData.openPinnedLeftSide.next(false) }
  //    }
  //  }, 10); // let Angular update the DOM first
  //}
  //private isInsideDiv(element: HTMLElement): boolean {
  //  const containerSelectors = [
  //    '.left-l',
  //    '.inside-panel',
  //    '.bcum-list-l-n',
  //    '.pinnedSec',
  //  ];
  //  console.log('Clicked element:', element);
  //  console.log('Outer HTML:', element.outerHTML);
  //  console.log('Inside any container:', containerSelectors.some(sel => document.querySelector(sel)?.contains(element)));
  //  for (const selector of containerSelectors) {
  //    const container = document.querySelector(selector);
  //    if (container) {
  //      if (container.contains(element) || element.closest(selector)) {
  //        return true;
  //      }
  //    }
  //  }
  //  return false;
   
  //}
 
  industryName(d: any) {
    if (d == 'Industrygroup') { return 'Industry Group' }
    else if (d == 'ETFIndex') { return 'Exchange Traded Funds' }
    else { return d }
  }
 
  getCustomData() {
    return new Promise((resolve, reject) => {
      if (this.SelFilter == 5) {
        this.equityService.getEquityLevelData().then((res: any) => {
          if (isNotNullOrUndefined(res['menuData'])) { resolve([...res['menuData']]); }
          else { resolve([...this.drilldown_List]); }
        });
      } else { resolve([...this.drilldown_List]); }
    });
  }
 
  SelFilter: number = 1;
  ascending_val: boolean = true;
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.getCustomData().then((res: any) => {
      this.drilldown_List = this.sharedData.onLeftGridSort([...res], this.SelFilter, this.ascending_val);
    });
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Equity Universe');
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val,'equity');
  }
  onToggleAscending() {
    let that = this;
    that.ascending_val = !that.ascending_val
    this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
    this.sharedData.onLeftGridsortTrack(this.FilterList, this.SelFilter, 'Equity Universe');
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val,'equity'); }
  }

  compaPer(otherArray: any) { return function (current: any) { return otherArray.filter(function (other: any) { return other.name == current.indexName && other.erfFlag=='Y' }).length > 0; } }

  noDataFound: boolean = false;
  private _filter(value: any) {
    var filterValue: any = undefined;
    if (value instanceof Object) { value = '' };
    if (isNotNullOrUndefined(value)) { filterValue = value.toLowerCase(); };
      var compFilter: any = [...this.sharedData._selResData]
        .filter((res: any) => (res['companyName'].toLowerCase().includes(filterValue) || res['ticker'].toLowerCase().includes(filterValue)));
    compFilter = compFilter.map((e: any) => ({ filIndex: false, ...e })).slice(0, 25);
    compFilter = compFilter.filter(this.compaPer([...this.cusIndexService.equityIndexeMasData.value]));
      var indexFilter: any = [...this.cusIndexService.equityIndexeMasData.value]
        .filter((res: any) => (res['name'].toLowerCase().includes(filterValue) || res['country'].toLowerCase().includes(filterValue)));
      indexFilter = indexFilter.map((e: any) => ({ filIndex: true, ...e }));
      if (compFilter.length === 0 && indexFilter.length === 0) { this.noDataFound = true; } else { this.noDataFound = false; }
      return [...indexFilter, ...compFilter];
  }

  ngAfterViewInit() {
    var that = this;
    setTimeout(() => { that.noDataFound = false; }, 500)
  }
  
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };

  checkSortMenu(v: any) { if (isNotNullOrUndefined(v) && v == 2 && isNotNullOrUndefined(this.drilldown_List) && this.drilldown_List.length > 0 && isNullOrUndefined(this.drilldown_List[0]['med'])) { return false } else { return true } };

  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'equity'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'equity', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
      });
    this.subscriptions.add(getSortSettingData);

     var crumbdata: any = this.equityService.breadcrumbdata
      .subscribe((res: any) => {
        this.breadcrumbdata = res;
        this.loadEquityData();
        this.checkWatchList();
        if (isNotNullOrUndefined(this.glbSearch.value) && (this.glbSearch.value != "" && this.glbSearch.value?.length != 0)) {
          this.glbSearch.reset();
          setTimeout(() => { this.noDataFound = false; }, 50);
        } else { this.noDataFound = false; }
      });
    this.subscriptions.add(crumbdata);

    var selComp: any = this.equityService.selComp.subscribe((res: any) => {      
        if (isNotNullOrUndefined(res)) { this.showTimelineBtn = true }
        else { this.showTimelineBtn = false }
        this.GetCaseStudyKey();
        this.checkWatchList();
      });
    this.subscriptions.add(selComp);

    var selResData: any = this.sharedData.selResData.subscribe((res: any) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          this.loadEquityData();
          if (!this.sharedData._frmGlobalSearchClick) {
            this.sharedData.showCircleLoader.next(false);
          }
      }
    });
    this.subscriptions.add(selResData);
    var WatchListData: any = this.sharedData.WatchListData.subscribe((res: any) => { this.checkWatchList(); });
    this.subscriptions.add(WatchListData);

    var getSelectedLeftSide: any = this.sharedData.getSelectedLeftSide.subscribe((res: any) => {

      if (res == 'Y') {this.showDefault_select = 'showList' }
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
  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  caseKey: any;
  CaseStudy: any;
  CaseStudyKey: any;
  GetCaseStudyKey() {
    if (this.sharedData.checkMenuPer(2027, 2246) != 'N' && isNotNullOrUndefined(this.equityService._selComp) && isNotNullOrUndefined(this.equityService._selComp['stockKey'])) {
      if (this.CaseStudyKey != this.equityService._selComp['stockKey']) {
        this.CaseStudyKey = this.equityService._selComp['stockKey'];
        try { this.caseKey.unsubscribe(); } catch (e) { }
        this.caseKey = this.dataService.getCaseStudyData(this.equityService._selComp['stockKey']).pipe(first())
          .subscribe((caseStudy: any) => { this.CaseStudy = caseStudy; }, (error: any) => { this.CaseStudy = undefined; });
        this.subscriptions.add(this.caseKey);
      } else { }
    } else {
      this.CaseStudy = undefined;
      this.CaseStudyKey = undefined;
    };      
  }

  checkGridClass(data: any) {
    var rtrn: boolean = false;
    try {
      if (isNotNullOrUndefined(this.equityService._selComp) && isNotNullOrUndefined(data.code) && isNotNullOrUndefined(this.equityService._selComp['industry'])) {
        if ((this.equityService._selComp['industry']).toString().indexOf(data.code) == 0) { return true; }
      }
    } catch (e) { }
    return rtrn;
  }
  sortScore(resData:any) {
    var med = [];
    if (isNotNullOrUndefined(resData[0].med)) {
      return resData.sort(function (x: any, y: any) { return descending(parseFloat(x.med), parseFloat(y.med)); })
    } else { return resData; }
    
  }
  loadEquityData() {
    var that = this;
    this.showCutomTool = false;
    this.showCompareBtn = false;
    that.equityService.getEquityLevelData().then((res: any) => {
      if (isNotNullOrUndefined(res['menuData'])) {
        //this.drilldown_List = [...res['menuData']].sort(function (x: any, y: any) { return descending(parseFloat(x.med), parseFloat(y.med)); });
        this.drilldown_List = [...res['menuData']]//.sort(function (x: any, y: any) { return ascending((x.name), (y.name)); });        
      } else { this.drilldown_List = []; }
      if (this.drilldown_List.length == 0 && this.equityService.breadcrumbdata.value.length == 0) { this.router.navigate(["/home"]); }
      this.drilldown_List = this.sharedData.onLeftGridSort([...this.drilldown_List], this.SelFilter, this.ascending_val);
      //console.log('drilldown_List---', this.drilldown_List);
      this.sharedData.showMatLoader.next(false);
      if (isNotNullOrUndefined(res['CompanyList'])) {
        this.equityService.rightGridData.next(res['CompanyList']);
        var selcomp: any = this.equityService.selComp.value
        if (isNotNullOrUndefined(selcomp) && isNotNullOrUndefined(selcomp['stockKey'])) {
          var selDt = res['CompanyList'].filter((x: any) => x.stockKey == selcomp['stockKey']);
          if (selDt.length > 0) {
            that.equityService.selComp.next(selDt[0])
          } else { that.equityService.selComp.next(undefined) }
        } else { that.equityService.selComp.next(undefined) }
      } else { this.equityService.rightGridData.next([]) };
      var ind: any = that.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Index");
      if (this.equityService.checkFillCompCreation() && ind.length > 0 && isNotNullOrUndefined(ind[0]['cIFlag']) && ind[0]['cIFlag'] == "Y") { this.showCutomTool = true; }
    })
    var sector: any = that.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Sector");
    if (sector.length > 0){ this.showCompareBtn = true; }
  }

  leftGridClick(d: any) {
    this.sharedData.showMatLoader.next(true);
    this.equityService.selGICS.next(d);
    var crumbdata: any = this.equityService.breadcrumbdata.value;
    this.equityService.countryCheckClick(d).then((res: any) => {
      if (isNotNullOrUndefined(res) && res[0]) {
        crumbdata.push(d);
        crumbdata.push(res[1]);
        this.equityService.selGICS.next(res[1]);
      } else { crumbdata.push(d); }
      this.equityService.breadcrumbdata.next(crumbdata);
    });
    try { this.sharedData.userEventTrack('Equity Universe', d.name, d.name, 'left grid Click'); } catch (e) { }
  }

  openToolCustom() {
    var that = this;
    /*** Check Existing Popup ***/
    that.sharedData.showMatLoader.next(true);
    that.dataService.GetStgyListDashboard('A').pipe(first()).subscribe((res: any) => {
      var bcrum: any = this.equityService.breadcrumbdata.value;
      var ind: any = bcrum.filter((x: any) => x['group'] == "Index");
      if (ind.length > 0) {
        var cssl = [...res].filter(v => v.assetId == ind[0].assetId && isNotNullOrUndefined(v['name']) && v['name'] != "");
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
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selGICS.value.name, this.equityService.selGICS.value.name, 'Custom tool btn Click');
    } catch (e) { }
  }

  openCustomExistingPopup(existing_List: any, currentList:any) {
    var title = 'Index Strategies';
    var options = { from: 'equityCustomTool', error: 'existingPopup', destination: 'openCustomIndex', currentList: currentList, customIndex: currentList, selCompany: "" }
    var clickeddata: any = existing_List;
    this.dialog.open(existingPopupComponent, {
      width: "37%", height: "auto", maxWidth: "100%", maxHeight: "90vh",
      panelClass: 'custom-modalbox',
      data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options }
    });
    this.sharedData.showMatLoader.next(false);
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selGICS.value.name, this.equityService.selGICS.value.name, 'Custom tool popup Click');
    } catch (e) { }
  }

  openHisTimeline() {
    var title = 'Index History Timeline';
    var ind: any = this.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Index");
    var options = {
      from: 'equityUniverse',
      error: 'hisTimline',
      destination: 'HistimelinePopup',
      selGICS: this.equityService.selGICS.value,
      index: (ind.length > 0) ? ind[0]:undefined,
      rightGridData: this.equityService._rightGridData,
      avoidLoserData: this.equityService._avoidLoserData,
      SRValue: this.equityService._SRValue,
      CType: 'MC',
      breadcrumb: this.equityService.breadcrumbdata.value
    }
    
    this.dialog.open(HisTimelineComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    });
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selGICS.value.name, this.equityService.selGICS.value.name, 'History Timeline popup Click');
    } catch (e) { }
  }

  openTimeline() {
    var title = 'Index Timeline';
    var options = { from: 'equityUniverse', error: 'Timline', destination: 'timelinePopup', selComp: this.equityService.selComp.value, breadcrumb: this.equityService.breadcrumbdata.value }

    this.dialog.open(TimelineComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    });
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selComp.value.name, this.equityService.selGICS.value.name, 'Timeline popup Click');
    } catch (e) { }
  }
  openAvoidLosers() {
    this.equityService.triggerCumulativeLinechart.next(true);
  }
  openCompare() {
    var title = 'Sector Compare';
    var options = {
      from: 'equityUniverse',
      error: 'Compare',
      destination: 'comparePopup',
      selComp: this.equityService.selComp.value,
      selGICS: this.equityService.selGICS.value,
      circleData: this.equityService.rightGridData.value,
      breadcrumb: this.equityService.breadcrumbdata.value
    }

    var dilog = this.dialog.open(CompareComponent, {
      width: "95%", height: "90%", maxWidth: "100%", maxHeight: "90vh",
      data: { dialogTitle: title, dialogSource: options }
    }).afterClosed().subscribe(response => {
      if (isNotNullOrUndefined(response) && isNotNullOrUndefined(response['selComp'])) {
        this.equityService.selComp.next(response['selComp']);
      }
    });
    this.subscriptions.add(dilog);
    try {
      this.sharedData.userEventTrack('Equity Universe', this.equityService.selComp.value.name, this.equityService.selGICS.value.name, 'Compare popup Click');
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
    var selComp: any = this.equityService._selComp;
    var index: any = this.equityService._breadcrumbdata.filter((x: any) => x['group'] == "Index");

    var watchListData: any = this.sharedData.WatchListData.value;
    if (isNotNullOrUndefined(selComp)) {
      this.showWatchListIcon = true;
      var filComp: any = watchListData.filter((x: any) => x['stockkey'] == selComp['stockKey']);
      if (filComp.length > 0) { this.watchListIconClicked = true; }
    } else if (index.length > 0) {
      this.showWatchListIcon = true;
      var filInd: any = watchListData.filter((x: any) => x['indexname'] == index[0]['name'] && isNullOrUndefined(x['stockkey']));
      if (filInd.length>0) { this.watchListIconClicked = true; }
    }
  }

  addWatchList() {
    var indexAdd: boolean = false;
    var companyAdd: boolean = false;
    var Type: string = '';

    if (isNotNullOrUndefined(this.equityService._selComp)) {
      companyAdd = true;
      Type = "Company";
    } else {
      indexAdd = true;
      Type = "Index";
    }
    this.sharedData.AddToWatchList(indexAdd, companyAdd, Type, 'Equity', this.equityService._selComp, this.equityService._breadcrumbdata, this.watchListIconClicked);
  }

  resetSrc() { this.glbSearch.reset(); }

}
