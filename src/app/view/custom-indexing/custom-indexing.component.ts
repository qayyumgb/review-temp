import { Component, ViewEncapsulation,HostListener } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../core/services/sharedData/shared-data.service';
import { DataService } from '../../core/services/data/data.service';
import { Subscription, first } from 'rxjs';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { Router } from '@angular/router';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { CommonErrorDialogComponent } from './error-dialogs/common-error-dialog/common-error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { existingPopupComponent } from '../charts-popup/existing-popup/existing-popup.component';
@Component({
  selector: 'app-custom-indexing',
  templateUrl: './custom-indexing.component.html',
  styleUrl: './custom-indexing.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CustomIndexingComponent {
  isOpen = false;
  showStartIndex: boolean = false;
  showReviewIndexLoaded: boolean = false;
  custSelectFactorShow: boolean = false;
  currentSList: any;
  currentSIndex: any;
  subscriptions = new Subscription();
  tradeTogCheck: boolean = false;
  custStrName: string = '';
  custStrShortName: string = '';
  custStrDis: string = '';
  strategyListData: any = [];
  strategyListNoData: any = [];
  custName: string = '';
  custShortName: string = '';
  basdeOn: string = '';
  basdeOnTicker: string = '';
  curSNo: number = -1;
  //getPinnedMenuItems: any = [];
  constructor(public sharedData: SharedDataService, public dataService: DataService, private router: Router,
    public dialog: MatDialog, private toastr: ToastrService, public cusIndexService: CustomIndexService) {
    this.sharedData.showCenterLoader.next(true);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cusIndexService.customIndexBrcmData.next([]);
    this.cusIndexService.startIndexClick_custom.next(false);
    this.cusIndexService.notifyDiClick.next(false);
    this.cusIndexService.showReviewIndexLoaded.next(false);
    this.sharedData.showMatLoader.next(false);
    this.sharedData.showCenterLoader.next(false);
    this.cusIndexService.forcepopupStrategy.next(false);
    this.cusIndexService.currentSNo.next(-1);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    //console.log(target);
    // Check if the click occurred outside of the specific div
    if (this.isOpen ==true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
       // console.log('InnerDiv');
        if (this.isOpen == true) { 
          this.isOpen =false; 
        };
      } else {
        //console.log('InnerDiv1');
        // this.isOpen =false; 
      }
    }
  }
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.dropdowns') !== null  || element.closest('.basdeOn_top') !== null;
  }
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  selLeftMenu: any = "Alpha";
  changeLeftTab(e: any) {
   // this.sharedData.showCenterLoader.next(true);
    this.selLeftMenu = e;
    this.cusIndexService.selTabLeftMenu.next(e);
  };

  ngOnInit() {
    var that = this;
    this.sharedData.showCircleLoader.next(true);
    this.sharedData.showCenterLoader.next(true);
    
    var unSub_leftMenu = this.cusIndexService.startIndexClick_custom
      .subscribe((res: boolean) => { that.showStartIndex = res;  });
    this.subscriptions.add(unSub_leftMenu);

    var reviewIndexloaded = this.cusIndexService.showReviewIndexLoaded
      .subscribe(res => { that.showReviewIndexLoaded = res; });
    this.subscriptions.add(reviewIndexloaded);

    var custSelectFactor = this.cusIndexService.custSelectFactor.subscribe(res => {
      if (isNotNullOrUndefined(res)) { that.custSelectFactorShow = true } else { that.custSelectFactorShow = false }
    });
    this.subscriptions.add(custSelectFactor);

    var selectedIndex = this.cusIndexService.customizeSelectedIndex_custom.subscribe(res => { });
    this.subscriptions.add(selectedIndex);

    var curSNo = this.cusIndexService.currentSNo.subscribe(res => {
      if (isNotNullOrUndefined(res) && res > -1) { this.curSNo = res; } else { this.curSNo = -1; };
    });
    this.subscriptions.add(curSNo);

    var strategyList = this.cusIndexService.strategyList.subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) { this.GetExistingStrategyList(); }
      else { this.strategyListData = []; };      
    });
    this.subscriptions.add(strategyList);

    var notifyDiClick = this.cusIndexService.notifyDiClick.subscribe(res => { if (res) { this.loadData(); } });
    this.subscriptions.add(notifyDiClick);

    var cID: any = this.cusIndexService.customizeSelectedIndex_custom.value;
    if (isNullOrUndefined(cID) || cID == "") { that.router.navigate(["/home"]); }
    else if (!this.cusIndexService.notifyDiClick.value) { this.loadData(); }

    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe((x) => {
      if (x) {
        this.cusIndexService.GetStrListDashAccs1().then((res: any) => {
          this.GetExistingStrategyList();
          this.checkTradeStatus();
        });
      }
    });
    this.subscriptions.add(refreshAlreadytradedStrategy);
    var custStrName = this.cusIndexService.custToolName.subscribe(res => { this.custStrName = res; });
    this.subscriptions.add(custStrName);
    var custStrShortName = this.cusIndexService.custToolShortname.subscribe(res => { this.custStrShortName = res; });
    this.subscriptions.add(custStrShortName);
    var custStrDis = this.cusIndexService.custToolDescription.subscribe(res => { this.custStrDis = res; });
    this.subscriptions.add(custStrDis);

    var GetSchedularMaster = this.sharedData.GetSchedularMaster.subscribe(GetSchedularMaster => {
      var d: any = GetSchedularMaster;
      if (d.length > 0) {
        if (isNotNullOrUndefined(d[0]['StrategyLimit'])) { this.cusIndexService.minCustInd.count = d[0]['StrategyLimit']; }
        if (isNotNullOrUndefined(d[0]['StrategyLimit'])) { this.cusIndexService.minCustInd.message = this.sharedData.checkMyAppMessage(0, 3) + " " + d[0]['StrategyLimit']; }
      }
    });
    this.subscriptions.add(GetSchedularMaster);
  }

  loadStrategyList() {
    var data: any = this.existingStrategyList_EnableTrade;
    if (isNotNullOrUndefined(data) && data.length > 0) {
      this.strategyListData = [...data].filter((x: any) => isNotNullOrUndefined(x.name) && isNotNullOrUndefined(x.shortname) && x.name != "" && x.shortname != "");
      this.strategyListNoData = [...data].filter((x: any) => isNotNullOrUndefined(x.name) && isNotNullOrUndefined(x.shortname) && x.name != "" && x.shortname != "");
      if (this.tradeTogCheck) {
        this.strategyListData = [...data].filter((x: any) => x['enableTrading'] == 'Y' && !this.cusIndexService.checkTrade(x));
      }
    } else { this.strategyListData = []; this.strategyListNoData = []; };
  }

 existingStrategyList_EnableTrade:any = []
  GetExistingStrategyList() {
    var that = this;
    var GetStgyListDashboard=that.dataService.GetStgyListDashboard('A').pipe(first()).subscribe((res: any) => {
      var cssl = [...res].filter(v => v.assetId == that.cusIndexService._currentSList.assetId && isNotNullOrUndefined(v.name) && isNotNullOrUndefined(v.shortname) && v.shortName != '' && v.name != '');
      //cssl.sort(function (x: any, y: any) { return d3.ascending(x.rowno, y.rowno); });
      cssl = cssl.sort((a: any, b: any) => { return <any>new Date(b.modifieddate) - <any>new Date(a.modifieddate); });
      var existing_stat_list = cssl;
      that.existingStrategyList_EnableTrade = [...existing_stat_list];
      //console.log(existing_stat_list,'GetExistingStrategyList');
      this.loadStrategyList();
    }, error => { });
    this.subscriptions.add(GetStgyListDashboard);
  }
  checkTrade(d: any) {
    if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d['enableTrading']) && d['enableTrading'] == 'Y') { return true; }
    else { return false; }
  }
  indexType: string = 'Index';
  checkModeMsg(msg: any) { return msg.replaceAll('(MODE)', this.indexType); }
  statDisc_hide() {
    //this.sharedData.showStatDisclosure.next(false);
    //this.sharedData.showFactorsLoader.next(false);
  }

  onToggleExpand(e: any) {
    if (isNotNullOrUndefined(e) && isNotNullOrUndefined(e['checked'])) {
      this.tradeTogCheck = e['checked'];
    } else { this.tradeTogCheck = false; }
    this.loadStrategyList();
  }
  selectedDropdownList: any;
  selectStratList(d: any, event: Event, clickType: string) {
    this.selectedDropdownList = d;
    var checkStgy: boolean = (isNotNullOrUndefined(d['rowno'])) ? (d['rowno'] == this.cusIndexService._currentSNo) : true;
    var checkQueue: boolean = this.cusIndexService.checkEnFact(d['id'], d['assetId'],d['rowno']);
    if (clickType == 'delete' && !checkQueue) {
      var title = 'notifyQueue';
      var options = { from: 'buildYourIndex', error: 'notifyQueue', destination: 'openNotificationQueue' }
      var clickeddata: any = [];
      this.dialog.open(CommonErrorDialogComponent, { width: "30%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

    } else if (clickType == 'delete' && !checkStgy) { $('#deleteModal').modal('show'); }
    else if (this.cusIndexService.checkStrModify()) {
      $('#saveTempAlert').modal('show');
      if (clickType == 'delete') { this.sharedData.saveChangePlace = 'deleteModal'; }
      else if (clickType == 'clone') { this.sharedData.saveChangePlace = 'mycloneDataModal'; }
    } else {
      if (clickType == 'delete') { $('#deleteModal').modal('show'); }
      else if (clickType == 'clone') { $('#mycloneDataModal').modal('show'); }
    }
    event.stopPropagation();
  }

  deleteStrategyDashboard() {
    var checkStgy: boolean = (isNotNullOrUndefined(this.selectedDropdownList['rowno'])) ? (this.selectedDropdownList['rowno'] == this.cusIndexService._currentSNo) : true;
    this.cusIndexService.DeleteStrategyList(this.selectedDropdownList).then((res: any) => {
      if (isNotNullOrUndefined(res)) {
        if (checkStgy) {
          this.selLeftMenu = 'Alpha';
          this.cusIndexService.selTabLeftMenu.next(this.selLeftMenu);
          this.openToolCustom();
        } else { this.GetExistingStrategyList(); };        
      } else { };
      this.toastr.success('Strategy removed successfully', '', { timeOut: 3000, progressBar: false, positionClass: "toast-top-center" });
    });
  }

  openToolCustom() {
    var that = this;
    that.sharedData.showMatLoader.next(true);
    var GetStgyListDashboard=that.dataService.GetStgyListDashboard('A').pipe(first()).subscribe((res: any) => {      
      var cssl = [...res].filter(v => v.assetId == this.selectedDropdownList.assetId && isNotNullOrUndefined(v['name']) && v['name'] != "");
      //cssl.sort(function (x: any, y: any) { return ascending(x.rowno, y.rowno); });
      cssl = cssl.sort((a: any, b: any) => { return <any>new Date(b.modifieddate) - <any>new Date(a.modifieddate); });
        var existing_stat_list = [...cssl];
        if (existing_stat_list.length > 0) {
          that.openCustomExistingPopup(existing_stat_list, this.selectedDropdownList);
        } else {
          var stgy: any = Object.assign({}, this.cusIndexService.customizeSelectedIndex_custom.value);
          this.cusIndexService.startIndexClick_custom.next(false);
          this.sharedData.showMatLoader.next(true);
          this.sharedData.showCircleLoader.next(true);
          this.cusIndexService.currentSNo.next(-1);
          this.cusIndexService.customizeSelectedIndex_custom.next(stgy);
          this.isOpen = false
          this.loadData();
        }
    }, (error: any) => { console.log(error); this.sharedData.showMatLoader.next(false); });
    this.subscriptions.add(GetStgyListDashboard);
  }

  openCustomExistingPopup(existing_List: any, currentList: any) {
    var title = 'Index Strategies';
    var options = { from: 'equityCustomTool', error: 'existingPopup', destination: 'openCustomIndex', currentList: currentList, customIndex: currentList, selCompany: "",routePlace:'toolCustDelete' }
    var clickeddata: any = existing_List;
    this.dialog.open(existingPopupComponent, {
      width: "37%", height: "auto", maxWidth: "100%", maxHeight: "90vh",
      panelClass: 'custom-modalbox',
      data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options }
    }).afterClosed().subscribe(response => { this.loadData(); });
  }

  cloneConfirm() {
    var newRow: number = 0;
    var d: any = this.selectedDropdownList;
    this.cusIndexService.GetStrategyAssetList(d['assetId']).then((res: any) => {
      if (res.length > 0) {
        res = res.sort((a: any, b: any) => a.rowno - b.rowno);
        var rowD: any = res.slice(-1)[0];
        newRow = rowD.rowno + 1;
      } else { newRow = 1; };
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var statdata = [{ "id": d['id'], "userid": userid, "slid": 0, "rowno": newRow, "mode": d['mode'] }];
      this.cusIndexService.PostCloneSData(statdata).then((res) => {
        if (isNotNullOrUndefined(res)) {
          this.cusIndexService.GetStrategyAssetList(d['assetId']).then((filterData: any) => {
            this.selLeftMenu = 'Alpha';
            this.cusIndexService.notifyDiClick.next(false);
            this.cusIndexService.selTabLeftMenu.next(this.selLeftMenu);
            var latestClonedSdata = filterData.filter((u: any) => u.assetId == d.assetId && u.rowno == newRow);
            if (latestClonedSdata.length > 0) {
              if (isNotNullOrUndefined(latestClonedSdata[0]['rowno'])) {               
                var stgy: any = Object.assign({}, this.cusIndexService.customizeSelectedIndex_custom.value);
                this.cusIndexService.startIndexClick_custom.next(false);
                this.sharedData.showMatLoader.next(true);
                this.sharedData.showCircleLoader.next(true);
                this.isOpen = false;
                this.cusIndexService.currentSNo.next(latestClonedSdata[0]['rowno']);
                this.cusIndexService.currentSList.next(latestClonedSdata[0]);
                this.cusIndexService.customizeSelectedIndex_custom.next(stgy);
                this.cusIndexService.selectedCIIndFactsheet.next(undefined);
                this.loadData();
                this.isOpen = false;
              }
            }
          })
        }
        this.toastr.success('Strategy cloned successfully', '', { timeOut: 3000, progressBar: false, positionClass: "toast-top-center" });
      }).catch((res) => { this.toastr.info('Strategy clonning error, please try again...', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" }); });
    });
  };


  creNewStgy() {
    if (this.cusIndexService.checkStrModify()) {
      $('#saveTempAlert').modal('show');
      this.sharedData.saveChangePlace = 'creNewStgy';
    } else { this.createNewStgy() };
  }

  createNewStgy() {
    this.selLeftMenu = 'Alpha';
    this.cusIndexService.selectedCIIndFactsheet.next(undefined);
    this.cusIndexService.selTabLeftMenu.next(this.selLeftMenu);
    this.cusIndexService.notifyDiClick.next(false);
    var stgy: any = Object.assign({}, this.cusIndexService.customizeSelectedIndex_custom.value);
    if (isNotNullOrUndefined(stgy['mode']) && stgy['mode'] == "B") { stgy['mode'] = null; }
    this.cusIndexService.custToolSelectByValue.next(0);
    this.cusIndexService.custToolWeightByValue.next(0);
    this.cusIndexService.custToolNoOfComp.next(0);
    this.cusIndexService.custToolWeightLimit.next(0);
    this.cusIndexService.custToolCashTarget.next(0);
    this.cusIndexService.custToolRebalanceType.next('');
    this.cusIndexService.custToolTaxEffAwareness.next('');
    this.cusIndexService.custToolWeightFlag.next('');
    this.cusIndexService.custToolName.next('');
    this.cusIndexService.custToolShortname.next('');
    this.cusIndexService.custToolDescription.next('');
    this.cusIndexService.startIndexClick_custom.next(false);
    this.sharedData.showMatLoader.next(true);
    this.sharedData.showCircleLoader.next(true);
    this.cusIndexService.currentSNo.next(-1);
    this.cusIndexService.customizeSelectedIndex_custom.next(stgy);
    this.isOpen = false
    this.loadData();
  }

  selStgy: any;
  srgyClick(d: any) {
    this.selStgy = d;
    if (this.cusIndexService.checkStrModify()) {
      $('#saveTempAlert').modal('show');
      this.sharedData.saveChangePlace = 'srgyClick';
    } else { this.srgyRowClick() };
  }

  srgyRowClick() {
    if (isNotNullOrUndefined(this.selStgy) && isNotNullOrUndefined(this.selStgy['rowno'])) {
      this.selLeftMenu = 'Alpha';
      this.cusIndexService.selTabLeftMenu.next(this.selLeftMenu);
      var stgy: any = Object.assign({}, this.cusIndexService.customizeSelectedIndex_custom.value);
      this.cusIndexService.startIndexClick_custom.next(false);
      this.sharedData.showMatLoader.next(true);
      this.sharedData.showCircleLoader.next(true);
      this.isOpen = false;
      this.cusIndexService.selectedCIIndFactsheet.next(undefined);
      this.cusIndexService.notifyDiClick.next(false);
      this.cusIndexService.currentSNo.next(this.selStgy['rowno']);
      this.cusIndexService.currentSList.next(this.selStgy);
      this.cusIndexService.customizeSelectedIndex_custom.next(this.selStgy);
      this.loadData();
      this.isOpen = false;
    }
  }

  loadData() {
    ///// get starategy list
    this.cusIndexService.getStgyList().then((stgy:any) => {
      this.loadStgyInfo(stgy);
      this.cusIndexService.currentSList.next(stgy);
      var data = this.cusIndexService.customizeSelectedIndex_custom.value;
      this.currentSList = stgy;
      this.currentSIndex = data;
      this.loadTitle();
      this.checkTradeStatus();
      this.cusIndexService.getLevelExclusionDataMC(data).then((res: any) => {
          this.cusIndexService.exclusionCompData.next(res);
          this.cusIndexService.CombinedFactorsData().then((cobRes: any) => {
            this.cusIndexService.comFactorsData.next(cobRes);
            if (isNotNullOrUndefined(stgy['id']) && isNotNullOrUndefined(stgy['assetId'])) {
              this.cusIndexService.getStrategyData(stgy['id'], stgy['assetId']).then((stgyRes: any) => {
                this.cusIndexService.startIndexClick_custom.next(true);
                this.cusIndexService.applyTrigger.next(true);
                if (!this.cusIndexService.notifyDiClick.value) {
                  setTimeout(() => { $('#createNewDisclosure').modal('show'); }, 1000);
                }
              });
            } else {
              this.cusIndexService.startIndexClick_custom.next(true);
              this.cusIndexService.applyTrigger.next(true);
              if (!this.cusIndexService.notifyDiClick.value) {
                setTimeout(() => { $('#createNewDisclosure').modal('show'); }, 1000);
              }
            }
          }).catch((error: any) => {
           // console.log('CombinedFactorsData---', error);
            if (!this.sharedData._showErrorDialogBox) {
              this.cusIndexService.openErrorComp_MoveDashboard();
            }
          });         
      }).catch((error: any) => {
        //console.log('getLevelExclusionDataMC---', error);
        if (!this.sharedData._showErrorDialogBox) {
          this.cusIndexService.openErrorComp_MoveDashboard();
        }
      });
    }).catch((error: any) => {
     // console.log('getStgyList---', error);
      if (!this.sharedData._showErrorDialogBox) {
        this.cusIndexService.openErrorComp_MoveDashboard();
      }
    });
  }

  checkTradeStatus() {
    var stgy: any = this.cusIndexService.currentSList.value;
    var tradeData: any = this.cusIndexService.stgyListDashAccsData.value;
    var filDt: any = tradeData.filter((x: any) => x.id == stgy['id'] && x.rowno == stgy['rowno'] && x.assetId == stgy['assetId'] && x.tradeStatus == 'Y');
    if (filDt.length > 0) { this.cusIndexService.checkStgyAlreadyTraded.next(true); } else { this.cusIndexService.checkStgyAlreadyTraded.next(false); }
  }

  loadStgyInfo(stgy: any) {
    if (isNotNullOrUndefined(stgy['selectBy'])) { this.cusIndexService.custToolSelectByValue.next(stgy['selectBy']); }
    else { this.cusIndexService.custToolSelectByValue.next(0); }

    if (isNotNullOrUndefined(stgy['weightBy'])) { this.cusIndexService.custToolWeightByValue.next(stgy['weightBy']); }
    else { this.cusIndexService.custToolWeightByValue.next(0); }

    if (isNotNullOrUndefined(stgy['noofComp'])) { this.cusIndexService.custToolNoOfComp.next(stgy['noofComp']); }
    else { this.cusIndexService.custToolNoOfComp.next(0); }

    if (isNotNullOrUndefined(stgy['weightLimit'])) { this.cusIndexService.bldMyIndselWeightLimit.next(stgy['weightLimit']); }
    else { this.cusIndexService.custToolNoOfComp.next(0); }

    if (isNotNullOrUndefined(stgy['weightFlag'])) { this.cusIndexService.custToolWeightFlag.next(stgy['weightFlag']); }
    else { this.cusIndexService.custToolWeightFlag.next('N'); }

    if (isNotNullOrUndefined(stgy['cashTarget'])) { this.cusIndexService.custToolCashTarget.next(stgy['cashTarget']); }
    else { this.cusIndexService.custToolCashTarget.next(0); }

    if (isNotNullOrUndefined(stgy['rebalanceType'])) { this.cusIndexService.custToolRebalanceType.next(stgy['rebalanceType']); }
    else { this.cusIndexService.custToolRebalanceType.next('q'); }

    if (isNotNullOrUndefined(stgy['taxEffAwareness'])) { this.cusIndexService.custToolTaxEffAwareness.next(stgy['taxEffAwareness']); }
    else { this.cusIndexService.custToolTaxEffAwareness.next('N'); }

    if (isNotNullOrUndefined(stgy['name'])) { this.cusIndexService.custToolName.next(stgy['name']); }
    else { this.cusIndexService.custToolName.next(''); }

    if (isNotNullOrUndefined(stgy['shortname'])) { this.cusIndexService.custToolShortname.next(stgy['shortname']); }
    else { this.cusIndexService.custToolShortname.next(''); }

    if (isNotNullOrUndefined(stgy['description'])) { this.cusIndexService.custToolDescription.next(stgy['description']); }
    else { this.cusIndexService.custToolDescription.next(''); }
  }

  checkforcepopup_modal() {
    var that = this;
    if (isNotNullOrUndefined(that.cusIndexService.currentSList)) {
      if ((that.cusIndexService.currentSList.value['name'] == null || that.cusIndexService.currentSList.value['name'] == "") && (that.cusIndexService.currentSList.value['shortname'] == "" || that.cusIndexService.currentSList.value['shortname'] == null)) {
        return true;
      } else { return false; };
    } else { return false; };
  }

  onKeyPressForceModal() {
    var shortname = this.custStrName.trim().replace(/ /g, "");
    if (this.custStrShortName.length < 6) {
      if (shortname.length >= 0) {
        this.custStrShortName = shortname.substring(0, 7);
      }
    }
  }

  desError() {
    this.isValidPattern_ds();
    this.isValidPattern_shortname();
    this.isValidPattern_name();
  }
  isValidPattern_ds(): boolean {
    const pattern = /^[A-Za-z0-9 ,?.!"']*$/;
    return pattern.test(this.custStrDis);
  }
  isValidPattern_shortname(): boolean {
    const pattern = /^[A-Za-z0-9_]*$/;
    return pattern.test(this.custStrShortName);
  }
  isValidPattern_name(): boolean {
    const pattern = /^[A-Za-z0-9 _]*$/;
    return pattern.test(this.custStrName);
  }

  saveStrategy() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var stgy: any = this.cusIndexService.currentSList.value;
    var slid: number = 0;
    if (this.isValidPattern_ds() && this.isValidPattern_shortname() && this.isValidPattern_name()) {
      if ((isNotNullOrUndefined(this.custStrShortName) && isNotNullOrUndefined(this.custStrName)) && this.custStrShortName.trim().length > 0 && this.custStrName.trim().length > 0) {
        this.sharedData.showMatLoader.next(true);
        this.cusIndexService.custToolName.next(this.custStrName.trim());
        this.cusIndexService.custToolShortname.next(this.custStrShortName);
        this.cusIndexService.custToolDescription.next(this.custStrDis);
        if (isNotNullOrUndefined(stgy['id'])) { slid = stgy['id']; }
        //new stgy save name
        var data: any = {
          "slid": slid,
          "userid": userid,
          "name": this.cusIndexService.custToolName.value,
          "description": this.cusIndexService.custToolDescription.value,
          "shortname": this.cusIndexService.custToolShortname.value
        }
        var PostStgyName=this.dataService.PostStgyName(data).pipe(first()).subscribe(res => {
          this.cusIndexService.GetStrategyAssetList(stgy['assetId']).then(slist => {
            $('#SpinLoader_Exclu_left').css('display', 'none');
            $('#strategyForce_Modal').modal('hide');
            that.cusIndexService.strategyList.next(slist);
            var currentval = that.cusIndexService.strategyList.value.filter((x: any) => x.rowno == that.cusIndexService.currentSNo.value);
            that.cusIndexService.currentSList.next(currentval[0]);
           
            if (that.cusIndexService._forcepopupStrategy) {
              if ((isNotNullOrUndefined(this.cusIndexService._custToolShortname) && isNotNullOrUndefined(this.cusIndexService._custToolName)) && this.cusIndexService._custToolShortname.trim().length > 0 && this.cusIndexService._custToolName.trim().length > 0) {
                setTimeout((x: any) => { that.cusIndexService.calculateTrigger.next(true); }, 2000);
              }
            }
            this.loadTitle();
          });
        });
        this.subscriptions.add(PostStgyName);
        ////full stgy save name
        //this.cusIndexService.saveStrategy(this.cusIndexService._currentSNo, 'A');
      }
    }
  }

  openFactorDefault() {
    //this.sharedData.showFactorsLoader.next(true);
    if ($('#Exclusions_Alpha_btn').hasClass('collapsed')) { $('#Exclusions_Alpha_btn').trigger('click'); };
  }

  loadTitle() {
    var basedata = this.cusIndexService.customizeSelectedIndex_custom.value;
    if (isNotNullOrUndefined(basedata) && basedata['Ticker'] != "" && basedata['Ticker'] != null) {
      this.basdeOnTicker = basedata['Ticker'];
    } else { this.basdeOnTicker = ''; }
   
    if (isNotNullOrUndefined(basedata['Indexname'])) { this.basdeOn = basedata['Indexname']; }
    else if (isNotNullOrUndefined(basedata.basedon) && basedata.basedon != "") { this.basdeOn = basedata.basedon; }
    else if (isNullOrUndefined(this.basdeOn) || this.basdeOn == "") {
      var ETFIndex: any = [...this.sharedData._ETFIndex].filter(x => x.assetId == basedata.assetId);
      var equtiyIndex: any = [...this.cusIndexService.equityIndexeMasData.value].filter(x => x.assetId == basedata.assetId);
      if (ETFIndex.length > 0) { this.basdeOn = ETFIndex[0]['etfName']; }
      else if (equtiyIndex.length > 0) { this.basdeOn = equtiyIndex[0]['name']; }
    }
    setTimeout(() => { this.sharedData.showMatLoader.next(false); }, 500)
    var SList = this.cusIndexService.currentSList.value;
    if (isNullOrUndefined(SList['name']) || SList['name'] == "") { this.custName = "My Index"; }
    else { this.custName = SList['name']; }

    if (isNullOrUndefined(SList['shortname']) || SList['shortname'] == "") { this.custShortName = "My Index"; }
    else { this.custShortName = SList['shortname']; }
  }

  leaceAlert() {
    if (this.sharedData.saveChangePlace == 'openUniverseMenu') {
      this.router.navigate(['/home']);
      this.sharedData.openUniverseMenu.next(true);
    } else if (this.sharedData.saveChangePlace == 'openUniverseMenu') {
      this.router.navigate(['/home']);
      this.sharedData.openUniverseMenu.next(false);
    } else if (this.sharedData.saveChangePlace == 'deleteModal') {
      $('#deleteModal').modal('show');
    } else if (this.sharedData.saveChangePlace == 'mycloneDataModal') {
      $('#mycloneDataModal').modal('show');
    } else if (this.sharedData.saveChangePlace == 'creNewStgy') {
      this.createNewStgy();
    } else if (this.sharedData.saveChangePlace == 'srgyClick') {
      this.srgyRowClick();
    }
  }

  saveAlert() {
    setTimeout(() => {
      $('#CIaccountSelect').trigger('click');
      setTimeout(() => { $('.calBtn__abs button').trigger('click'); }, 100);
    }, 100);
  }
}
