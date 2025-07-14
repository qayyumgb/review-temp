import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { isNotNullOrUndefined, isNullOrUndefined, SharedDataService } from '../../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../../core/services/data/data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { DirectIndexService } from '../../../../core/services/moduleService/direct-index.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, first, switchMap } from 'rxjs';
import moment from 'moment'
// @ts-ignore
import * as d3 from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { IndexConstructionPopupComponent } from '../../../index-construction-popup/index-construction-popup.component';
import { formatDate } from '@angular/common';
import { AccountService } from '../../../../core/services/moduleService/account.service';
import { ToastrService } from 'ngx-toastr';
import { CommonErrorDialogComponent } from '../../error-dialogs/common-error-dialog/common-error-dialog.component';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { Router } from '@angular/router';
import { existingPopupComponent } from '../../../charts-popup/existing-popup/existing-popup.component';
declare var $: any;
@Component({
  selector: 'app-build-your-index',
  templateUrl: './build-your-index.component.html',
  styleUrl: './build-your-index.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class BuildYourIndexComponent implements OnInit, OnDestroy {
  showDefault_select: string = 'Steps';
  isTooltipDisabled: boolean = false;
  isAccountAccor: boolean = false;
  showCutomTool: boolean = false;
  showSpinnerAcc_settings: boolean = false;
  showAccountDetails_popup: boolean = false;
  showAccountTraded_popup: boolean = false;
  showAccountSaved_popup: boolean = false;
  checkDefaultAccountPopup: string = ''; //** Pass details_popup, traded_popup, saved_popup **//
  //exclude_tax: boolean = false;
  InsufficientCashTarget: boolean = false;
  /*** Account Selection ***/
  accModalGroup: FormGroup;
  gainList = [{ name: 'Gain', value: 'G' }, { name: 'Loss', value: 'L' }];
  accountForm: FormGroup;
  accountItem: FormArray<any> = new FormArray<any>([]);
  //accountItem: FormArray;
  bldMyIndCashTarget: number = 2;
  accSearchText: string = '';
  myAcclistList: any = [];
  /*** Account Selection ***/
  GetAccountConfigSettings: any = [];
  defaultMarketCurrency: any = '';
  bufferTargetData: any = [];
  minDate = new Date();
  maxDate = new Date();
  cashTarget: any = [
    { value: 2, viewValue: 2 },
    { value: 3, viewValue: 3 },
    { value: 4, viewValue: 4 },
    { value: 5, viewValue: 5 },
    { value: 6, viewValue: 6 },
    { value: 7, viewValue: 7 },
    { value: 8, viewValue: 8 },
    { value: 9, viewValue: 9 },
    { value: 10, viewValue: 10 },
    { value: 11, viewValue: 11 },
    { value: 12, viewValue: 12 },
    { value: 13, viewValue: 13 },
    { value: 14, viewValue: 14 },
    { value: 15, viewValue: 15 },
    { value: 16, viewValue: 16 },
    { value: 17, viewValue: 17 },
    { value: 18, viewValue: 18 },
    { value: 19, viewValue: 19 },
    { value: 20, viewValue: 20 },
  ];
  accountAlertInfo = {
    username: '',
    stgyname: '',
    tradedate: new Date(),
    account: '',
  };
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    var that = this;
    that.isTooltipDisabled = true;
  }
  findList: any = [];
  strat_savedAccount: any = [];
  lockedDataInfo: any = [];
  pausedDataInfo: any = [];

  selectedDirectIndex: selectedDirIndex = {
    "selectBy": 0,
    "selectedByName": '',
    "weightBy": 0,
    "weightedByName": '',
    "rebalanceType": "",
    "rebalanceByName": '',
    "noofComp": 0,
    "taxEffAwareness": 'N',
    "cashTarget": 2,
  };

  reviewIndextab: any = null;

  subscriptions = new Subscription();
  constructor(public accountService: AccountService, public sharedData: SharedDataService,
    public dataService: DataService, public cusIndexService: CustomIndexService, public dialog: MatDialog,
    public dirIndexService: DirectIndexService, private formBuilder: FormBuilder, private router: Router,
    private logger: LoggerService, private toastr: ToastrService) {
    this.accountForm = new FormGroup({ accountItem: new FormArray([]) });
    this.accModalGroup = this.formBuilder.group({
      cashTarget: ['', Validators.required],
      cashTargetType: ['', Validators.required],
      taxTarget: ['', Validators.required],
      bufferTarget: ['', Validators.required],
      longTermtaxRate: ['', Validators.required],
      shortTermtaxRate: ['', Validators.required],
      transitionDate: ['', Validators.required],
      transitionGainTgt: ['', Validators.required],
    });
    this.accTargetSettings();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.dirIndexService.currentSList.next(undefined);
    this.reviewIndextab = null;
    try { this.dirIndexService.GetPerformanceETFRListSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetStrategyAccountSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetlockPauseAccsSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetFactSheetGConditionsSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetEquityScoresSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetDIEnabletradinglistSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetBuildMyIndexMnthlyHPortfolioDirectSub.unsubscribe(); } catch (e) { }
    try { this.dirIndexService.GetTaxharvestDataDirectSub.unsubscribe(); } catch (e) { }
  }

  diIndAccountData: any = [];
  diFactAccountData: any = [];
  @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  toggleSearch: boolean = false;
  searchText = '';
  openSearch() {
    this.toggleSearch = true;
    setTimeout(() => {
      this.searchBox.nativeElement.focus();
    }, 100);
  }
  searchClose() {
    this.toggleSearch = false;
  }
  openIndexConstruction() {
    //apperance_ModalOpen() {
    var title = 'Index Construction';
    var clickeddata: any = [];
    this.dialog.open(IndexConstructionPopupComponent, { width: "50%", height: "auto", maxWidth: "100%", maxHeight: "90vh", panelClass: 'indexcustommodalbox', data: { dialogTitle: title, dialogData: [], selectedIndex: this.dirIndexService._currentSList } });
    //}
    //$('#myAppearanceModal').modal('show');
  }
  openDirectErrorComp(title_D: string, from_D: string, error_D: string, destination_D: string) {
    var title = title_D;
    var options = { from: from_D, error: error_D, destination: destination_D };
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
  }
  ngOnInit() {
    var that = this;
    //var notifyDiClick = that.dirIndexService.notifyDiClick.subscribe(res => {
      //if (res) {
      //  that.dirIndexService.notifyDiClick.next(false);
      //  setTimeout(() => {
      //    that.showDefault_select = 'Factsheet';
      //    that.openFactsheet(that.dirIndexService._selectedDirIndFactsheet);
      //  }, 1000);
      //}
    //});
    //that.subscriptions.add(notifyDiClick)
    var customizeSelectedIndex_Direct_sub = that.dirIndexService.customizeSelectedIndex_Direct.subscribe(res => {
      that.loadSelDI(res);
      if (isNotNullOrUndefined(res)) { that.GetStrategyAssetList(res); };
    });
    var move_defaultAccount = that.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) {
        that.checkErrorAction(res);
      }
    });
    that.subscriptions.add(customizeSelectedIndex_Direct_sub)
    that.subscriptions.add(move_defaultAccount);

    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe(x => {
      if (x) {
        this.GetStrategyAccount(that.dirIndexService._selectedDirIndStry[0]['id']);
      };
    });
    this.subscriptions.add(refreshAlreadytradedStrategy);
    var updateBtnTrigger = that.cusIndexService.updateBtnTrigger.subscribe(x => {
      if (x) {
        that.cusIndexService.updateBtnTrigger.next(false);
        that.showDefault_select = 'Accounts';
        that.closeFactsheet();
      };
    });
    this.subscriptions.add(updateBtnTrigger);
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'loadDefaultAccount') {
      this.openFactsheet(0);
      this.dirIndexService.errorList_Direct.next(undefined);
    }else if (checkError.destination == 'loadIndexSteps') {
      this.showDefault_select = "Steps";
      this.dirIndexService.errorList_Direct.next(undefined);
    } 
  }
  taxChange(val: any) {
    this.maxTaxTarget = this.marketValue;
    if (val == 'L') {
      var per1 = d3.scaleLinear().domain([0, this.marketValue]).range([0, 100]);
      this.maxTaxTarget = per1.invert(this.GetAccountConfigSettings[0].dcashTargetEnd);
    }
    this.accModalGroup.controls['taxTarget'].setValidators([Validators.required, Validators.min(0), Validators.max(this.maxTaxTarget)]);
    this.accModalGroup.controls['taxTarget'].setValue(0);
  }

  GetStrategyAssetList(x: any) {
    var that = this;
    /*** Get Index Steps ***/
    //that.dataService.GetStrategyAssetList(x.assetId, x.mode).pipe(first()).subscribe((slist: any) => {
    //  this.dirIndexService.selectedDirIndStry.next(slist);
    //  if (isNotNullOrUndefined(slist) && slist.length > 0) { this.GetStrategyAccount(slist[0]['id']); }
    //  else { this.loadAccData(); };
    //}, (error: any) => {
    //  this.dirIndexService.selectedDirIndStry.next([]);
    //  that.openDirectErrorComp('Error', 'GetStrategyAssetList', 'strategyOpenError', 'moveToHome');
    //});
    this.dirIndexService.checkPostStrategyData().then((slist: any) => {
      this.dirIndexService.selectedDirIndStry.next(slist);
      if (isNotNullOrUndefined(slist) && slist.length > 0) { this.GetStrategyAccount(slist[0]['id']); }
      else { this.loadAccData(); };
    }).catch(() => {
      this.dirIndexService.selectedDirIndStry.next([]);
      that.openDirectErrorComp('Error', 'GetStrategyAssetList', 'strategyOpenError', 'moveToHome');
    });
  }

  diStrFactsheetAccData: any = [];
  GetStrategyAccount(slid: any, post: boolean = false) {
    var that = this;
    this.diStrFactsheetAccData = [];
    /*** Get Accounts ***/
    var GetStrategyAccount=that.dataService.GetStrategyAccount(slid).pipe(first()).subscribe((accList: any) => {
      this.diStrFactsheetAccData = accList;
      this.dirIndexService.diStrFactsheetAccData.next(accList);
      if (accList.length > 0) {
        var val = accList.map((a: any) => ({ ...a }));
        that.diFactAccountData = val;
        that.diIndAccountData = val;
      } else {
        that.diFactAccountData = [];
        that.diIndAccountData = [];
      }
      this.loadAccData();
      if (post) { this.postNotification(); }
    }, (error: any) => { this.diStrFactsheetAccData = []; that.openDirectErrorComp('Error', 'GetStrategyAccount', 'accountsError', 'moveToHome'); });
    this.subscriptions.add(GetStrategyAccount);
  }

  postNotification() {
    var that = this;
    var clist = this.dirIndexService._selectedDirIndStry[0];
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == clist.assetId);
    var d = new Date(this.sharedData.equityHoldDate);
    if (etfInd.length > 0) { d = new Date(etfInd[0]['holdingsdate']); }
    var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
    var factDt: any = [];
    that.diFactAccountData.forEach((acc: any) => {
      var oldData = that.diIndAccountData.filter((d: any) => parseInt(acc.accountId) == parseInt(d.accountId))
      if (oldData.length > 0 && isNotNullOrUndefined(oldData[0]['tradedStatus']) && oldData[0]['tradedStatus'] == 'Y') { } else {
        factDt.push({ "accountId": acc['accountId'], "userid": parseInt(userid), "slid": clist.id })
      }
    });

    if (factDt.length > 0) {
      this.dirIndexService.checkFactsheetInit(factDt).then((res: any) => {
        if (res.status && res.data.length > 0) {
          var postData: any = [];
          res.data.forEach((acc: any) => {
            if (acc['factsheetAvail'] == 'Y' || (acc['factsheetAvail'] == 'N' && acc['notifyId'] == 0)) {
              postData.push({
                "accountId": acc['accountId'],
                "slid": clist.id,
                "userid": parseInt(userid),
                "status": "A",
                "enddate": date,
                "freqflag": that.sharedData.defaultRebalanceType,
                "tenYrFlag": 1,
                "erfflag": that.checkErfflag(clist)
              });
            }
          });
          if (postData.length > 0) {
            /*** After Calculate ***/
            var PostStrategyNotificationQueue=that.dataService.PostStrategyNotificationQueue(postData).pipe(first()).subscribe((data: any) => {
              if (data[0] != "Failed") {
                if (data[0].toLowerCase().indexOf('locked') > -1) {
                  that.dirIndexService.checkReloadpostNotification(that.diStrFactsheetAccData);
                }
                else {
                  this.sharedData.showMatLoader.next(false);
                  that.toastr.success('Added to queue successfully', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
                  that.sharedData.getNotificationDataReload();
                }
              }
            }, (error: any) => {
              this.logger.logError(error, 'PostStrategyNotificationQueue');
              that.openDirectErrorComp('Error', 'PostNotificationAccount', 'PostStrategyNotificationQueueError', 'loadIndexSteps');
             // that.toastr.success('Try again later', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
              /*** Show calculate failed Error ***/
              this.sharedData.showMatLoader.next(false);
            });
            this.subscriptions.add(PostStrategyNotificationQueue);
          } else {
            this.sharedData.showMatLoader.next(false);
            that.toastr.success('No changes are made in strategy to calculate', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
          }
        } else { this.sharedData.showMatLoader.next(false); }
      })
    } else { this.sharedData.showMatLoader.next(false); }
  }


  loadSelDI(res: any) {
    if (isNotNullOrUndefined(res)) {
      var selectBy: number = 0;
      if (isNotNullOrUndefined(res['selectBy'])) { selectBy = res['selectBy']; }
      this.selectedDirectIndex.selectBy = selectBy;

      var selectedByName: string = "";
      if (isNotNullOrUndefined(res['selectedByName'])) { selectedByName = res['selectedByName']; }
      this.selectedDirectIndex.selectedByName = selectedByName;

      var weightBy: number = 0;
      if (isNotNullOrUndefined(res['weightBy'])) { weightBy = res['weightBy']; }
      this.selectedDirectIndex.weightBy = weightBy;

      var weightedByName: string = "";
      if (isNotNullOrUndefined(res['weightedByName'])) { weightedByName = res['weightedByName']; }
      this.selectedDirectIndex.weightedByName = weightedByName;

      var noofComp: number = 0;
      if (isNotNullOrUndefined(res['noofComp'])) { noofComp = res['noofComp']; }
      this.selectedDirectIndex.noofComp = noofComp;

      var rebalanceByName: string = "";
      if (isNotNullOrUndefined(res['rebalanceByName'])) { rebalanceByName = res['rebalanceByName']; }
      this.selectedDirectIndex.rebalanceByName = rebalanceByName;

      var rebalanceType: string = "";
      if (isNotNullOrUndefined(res['rebalanceType'])) { rebalanceType = res['rebalanceType']; }
      this.selectedDirectIndex.rebalanceType = rebalanceType;

      var taxEffAwareness: string = "N";
      if (isNotNullOrUndefined(res['taxEffAwareness'])) { taxEffAwareness = res['taxEffAwareness']; }
      this.selectedDirectIndex.taxEffAwareness = taxEffAwareness;
      if (taxEffAwareness == 'Y') { this.isAccountAccor = true; } else { this.isAccountAccor = false; }
      var cashTarget: number = 2;
      if (isNotNullOrUndefined(res['cashTarget'])) { noofComp = res['cashTarget']; }
      this.selectedDirectIndex.cashTarget = cashTarget;
    } else {
      this.selectedDirectIndex.selectedByName = "";
      this.selectedDirectIndex.selectBy = 0;
      this.selectedDirectIndex.weightBy = 0;
      this.selectedDirectIndex.weightedByName = "";
      this.selectedDirectIndex.rebalanceType = "";
      this.selectedDirectIndex.rebalanceByName = "";
      this.selectedDirectIndex.noofComp = 0;
      this.selectedDirectIndex.taxEffAwareness = "N";
      this.selectedDirectIndex.cashTarget = 2;
    }

    //check show tool Customization Btn
    this.showCutomTool = true;
    if (isNotNullOrUndefined(res) && isNotNullOrUndefined(res['assetId'])) {
      var eqData: any = this.cusIndexService.equityIndexeMasData.value;
      var ind: any = [...eqData].filter((x: any) => x['assetId'] == res['assetId']);
      if (ind.length > 0 && isNotNullOrUndefined(ind[0]['cIFlag']) && ind[0]['cIFlag'] == 'N') { this.showCutomTool = false; }
    }
  }

  accTargetSettings() {
    /** Accounts popup long/short default values Get***/
    var GetAccountConfigSettings=this.dataService.GetAccountConfigSettings().pipe(first()).subscribe((data: any[]) => {
      this.GetAccountConfigSettings = data;
      if (data.length > 0) {
        this.defaultMarketCurrency = this.GetAccountConfigSettings[0].dMarketCurrency;
        this.bufferTargetData = Array.from({ length: this.GetAccountConfigSettings[0].dtaxbufferEnd + 1 },
          (_, i) => i + this.GetAccountConfigSettings[0].dtaxbufferStart);
        this.cashTarget = Array.from({ length: this.GetAccountConfigSettings[0].dcashTargetEnd },
          (_, i) => i + this.GetAccountConfigSettings[0].dcashTargetStart);
        this.minDate = new Date(data[0]['dtransfromDate']);
        this.maxDate = new Date(data[0]['dtranstoDate']);
      }
    }, error => {
      this.GetAccountConfigSettings = [];
      this.defaultMarketCurrency = '';
    });
    this.subscriptions.add(GetAccountConfigSettings);
  }
  GetAccounts: any = [];
  loadAccData() {
    var that = this;
    this.showSpinnerAcc_settings = true;
    /*** Build All accounts ***/
    var GetSubAccounts=this.dataService.GetSubAccounts().pipe(first()).subscribe((data: any) => {
      that.GetAccounts = data;
      that.accountService.GetAccounts.next(data);
      var dt: any = data;
      var accList: any = [];
      if (isNotNullOrUndefined(dt)) {
        if (isNotNullOrUndefined(dt['accounts']) && dt['accounts'].length > 0) {
          dt['accounts'].forEach((d: any, i: any) => {
            var newAccD = that.diFactAccountData.filter((factsheet: any) => factsheet.accountId == parseInt(d.id));
            var obj = {
              'id': parseInt(d.id),
              'cashTarget': (newAccD.length > 0) ? that.checkCashTarget(newAccD[0]['cashTarget']) : that.checkCashTarget(d.cashTarget),
              'taxBufferGain': (newAccD.length > 0) ? newAccD[0]['taxBufferGainTarget'] : d.taxBufferGainTarget,
              'taxTarget': (newAccD.length > 0) ? newAccD[0]['taxTarget'] : d.taxTarget,
              'accountVan': d.accountVan,
              'accountTitle': d.accountTitle,
              'taxType': (newAccD.length > 0) ? newAccD[0]['taxType'] : d.taxType,
              'account': (newAccD.length > 0) ? true : that.checkAccEnable(parseInt(d.id)),
              'marketValue': dt['summary'][i].availablefunds.amount,
              'longterm': (newAccD.length > 0) ? newAccD[0]['longterm'] : d.longTerm,
              'shortterm': (newAccD.length > 0) ? newAccD[0]['shortterm'] : d.shortTerm,
              transitionDate: (newAccD.length > 0) ? newAccD[0]['transitionDate'] : null,
              transitionGainTgt: (newAccD.length > 0) ? newAccD[0]['transitionGainTgt'] : null,
            };
            if (isNotNullOrUndefined(d.funded) && d.funded == "Y") { accList.push(obj); }
          });
        }
      }
      this.myAcclistList = [...accList].sort(function (x: any, y: any) { return d3.ascending(parseInt(x.id), parseInt(y.id)); });
      this.showSpinnerAcc_settings = false;
      this.buildForm();
      this.loadeFactview();
    }, error => { this.loadeFactview(); });
    this.subscriptions.add(GetSubAccounts);
  }

  loadeFactview() {
    var that = this;
    if (that.dirIndexService.notifyDiClick.value) {
      //that.dirIndexService.notifyDiClick.next(false);
      this.sharedData.showCircleLoader.next(true);
      setTimeout(() => {
        that.showDefault_select = 'Factsheet';
        that.openFactsheet(that.dirIndexService._selectedDirIndFactsheet);
      }, 2000);
    }
  }

  checkAccEnable(d: any) {
    var data = [...this.diIndAccountData];
    if (data.filter(x => x == d).length > 0) { return true } else { return false }
  }
  checkCashTarget(value: any) {
    if (this.GetAccountConfigSettings.length == 0 || isNullOrUndefined(value) || value == '') { return 2; }
    else if (value < this.GetAccountConfigSettings[0].dcashTargetStart || value > this.GetAccountConfigSettings[0].dcashTargetEnd) { return this.GetAccountConfigSettings[0].dcashTargetStart; } else { return value; }
  }
  get getFormAccount(): any {
    return this.accountForm.controls["accountItem"] as FormArray;
    //return this.accountForm.get("accountItem");
  }
  calculateTotalHeight(): string {
    const totalHeight = this.myAcclistList.length * 25; // Assuming each item has a height of 20px
    return totalHeight + 'px';
  }

  // Function to get the style for the scroll container
  getScrollContainerStyle(): any { return this.calculateTotalHeight(); }

  buildForm() {
    var that = this;
    this.accountForm = new FormGroup({ accountItem: new FormArray([]) });
    this.accountItem = this.accountForm.get('accountItem') as FormArray;
    this.myAcclistList.forEach((x: any) => {
      var accDisabled = that.checkAccDisable(x)
      var CTtype = 'L';
      if (x['taxType'] == 'G' || x['taxType'] == "L") { CTtype = x['taxType'] }
      var taxbuf: any = x['taxBufferGain'];
      if (isNullOrUndefined(taxbuf)) { taxbuf = 0 }
      else if (this.GetAccountConfigSettings.length > 0 &&
        (parseInt(taxbuf) < this.GetAccountConfigSettings[0].dtaxbufferStart ||
          parseInt(taxbuf) > this.GetAccountConfigSettings[0].dtaxbufferEnd)) { taxbuf = 0 }

      var maxTaxTarget = parseFloat(x['marketValue']);
      if (CTtype == 'L') {
        var per1 = d3.scaleLinear().domain([0, maxTaxTarget]).range([0, 100]);
        if (this.GetAccountConfigSettings.length > 0) { maxTaxTarget = per1.invert(this.GetAccountConfigSettings[0].dcashTargetEnd); }
        else { maxTaxTarget = per1.invert(20); }
      }

      var taxTarget = x['taxTarget'];
      if (maxTaxTarget < taxTarget || isNullOrUndefined(taxTarget)) { taxTarget = 0 }

      var cashTarget = x['cashTarget'];
      if (isNullOrUndefined(cashTarget)) { cashTarget = this.bldMyIndCashTarget; }

      //var transition = x['transition'];
      //if (isNullOrUndefined(transition)) { transition = 1; }

      var shortTermtaxRate = x['shortterm'];
      if (isNullOrUndefined(shortTermtaxRate)) { shortTermtaxRate = 35; }
      var longTermtaxRate = x['longterm'];
      if (isNullOrUndefined(longTermtaxRate)) { longTermtaxRate = 20; }
      var transitionDate = x['transitionDate'];
      if (isNullOrUndefined(transitionDate)) {
        if (this.GetAccountConfigSettings.length > 0) { transitionDate = new Date(this.GetAccountConfigSettings[0]['dtransfromDate']) }
      }
      var transitionGainTgt = x['transitionGainTgt'];
      if (isNullOrUndefined(transitionGainTgt)) { transitionGainTgt = 0 }
      var d = this.formBuilder.group({
        data: x,
        account: [{ value: x.account, disabled: accDisabled }, Validators.required],
        cashTarget: [{ value: cashTarget, disabled: accDisabled }, Validators.required],
        //transition: [{ value: transition, disabled: accDisabled }, Validators.required],
        cashTargetType: [{ value: CTtype, disabled: accDisabled }, Validators.required],
        taxTarget: [{ value: taxTarget, disabled: accDisabled }, Validators.required],
        bufferTarget: [{ value: taxbuf, disabled: accDisabled }, Validators.required],
        longTermtaxRate: [{ value: longTermtaxRate, disabled: accDisabled }, Validators.required],
        shortTermtaxRate: [{ value: shortTermtaxRate, disabled: accDisabled }, Validators.required],
        transitionDate: [{ value: transitionDate, disabled: accDisabled }, [Validators.required]],
        transitionGainTgt: [{ value: transitionGainTgt, disabled: accDisabled }, [Validators.required, Validators.min(0)]],
      });
      this.accountItem.push(d);
    });
  }
  checkAccDisable(d: any) {
    var data = this.diFactAccountData;
    if (isNullOrUndefined(data)) { data = []; }
    var filD = data.filter((x: any) => x.accountId == parseInt(d.id) && x.tradedStatus == 'Y');
    if (filD.length > 0) { return true } else { return false }
  }
  checkAcctradedDisable(d: any) {
    var data = this.diFactAccountData;
    if (isNullOrUndefined(data)) { data = []; }
    var filD = data.filter((x: any) => x.accountId == parseInt(d.value.data.id) && x.tradedStatus == 'Y');
    if (filD.length > 0) { return true } else { return false }
  }
  changeFormValue: any;
  acccountChange(e: any, value: any) {
    var that = this;
    that.changeFormValue = value;
    that.lockedDataInfo = [];
    that.pausedDataInfo = [];
    that.findList = [];
    that.strat_savedAccount = []; /** Check account is saved by user **/
    var val = parseInt(value.value.data.id);
    //that.postRemoveAccId = val;
    that.accountAlertInfo.account = value.value.data.accountVan;
    if (e.checked) {
      this.showSpinnerAcc_settings = true; // Show spinner

      that.GetDBPershing(val).then((resPershing: any) => {
        if (isNotNullOrUndefined(resPershing['accounts']) && resPershing['accounts'].length > 0 && that.checkpershingfunds(resPershing)) {
          var GetAccountData=that.dataService.GetAccountData(val).pipe(
            first(),
            switchMap((res: any) => {
              // Handle GetStrategyfindList call
              return that.dataService.GetStrategyfindList(val).pipe(first(),
                switchMap((findList: any) => {
                  that.findList = findList;
                  if (findList.length > 0) {
                    that.strat_savedAccount.push(findList[that.findList.length - 1]);
                  }

                  if (res.length > 0 && isNotNullOrUndefined(res[0]['lockstatus']) && res[0]['lockstatus'] == 'Y') {
                    that.removeAccount();
                    that.lockedDataInfo = res;
                    this.showSpinnerAcc_settings = false;
                    //console.log('lock Acc', res);
                    // $('#lockTradeModal').modal('show');
                    that.checkDefaultAccountPopup ='locked_popup_single';
                  }
                  else if (res.length > 0 && isNotNullOrUndefined(res[0]['pauseStatus']) && res[0]['pauseStatus'] == 'Y') {
                    // $('#pauseTradeModal').modal('show');
                    //console.log('pause Acc', res);
                    that.checkDefaultAccountPopup = 'paused_popup_single';
                    that.pausedDataInfo = res;
                    this.showSpinnerAcc_settings = false;
                  } else {
                    if (that.strat_savedAccount.length > 0) {
                      that.checkPostInit(value);
                    } else {
                      return that.dataService.GetTradedList(val).pipe(
                        first(),
                        switchMap((data: any) => {
                          /** Check traded list ***/
                          if (data.length > 0) {
                            data = data.sort((x: any, y: any) => d3.ascending(x.tradedate, y.tradedate));
                            const d: any = data[data.length - 1];
                            that.accountAlertInfo.username = d.username;
                            that.accountAlertInfo.stgyname = d.name + " (" + d.shortname + ")";
                            that.accountAlertInfo.tradedate = new Date(d.tradedate);
                            that.checkDefaultAccountPopup = 'traded_popup';
                            //console.log(that.accountAlertInfo);
                            // $('#accTempAlert').modal('show');
                          } else {
                            /** Open account details ***/
                            that.accountInit(value);
                          }
                          /* Hide spinner*/
                          this.showSpinnerAcc_settings = false;
                          return [];
                        })
                      );
                    }
                  }
                  return [];
                })
              );
            })
          ).subscribe();
          this.subscriptions.add(GetAccountData);
        } else {
          // $('#PershingAccountError').modal('show');
          this.removeAccount();
          /* Hide spinner*/
          this.showSpinnerAcc_settings = false;
        }
      });
    }
  }
  checkPostInit(d: any) {
    var that = this;
    //console.log(d, that.checkDefaultAccountPopup, that.findList.length);
    if (that.findList.length > 0) {
      /*** Show saved popup ***/
      that.checkDefaultAccountPopup = 'saved_popup';
      this.showSpinnerAcc_settings = false;
      //$('#PostRemoveAccLinks').modal('show');
    } else {
      this.accountInit(d);
    }
    //console.log(that.checkDefaultAccountPopup);
  }
  PostRemoveAccLinks() {
    var that = this;
    var currentList = that.dirIndexService.currentSList.value;
    var slid = parseInt(currentList.id);
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var statdata = { "accountId": 0, "userid": userid, "slid": slid };
    if (isNotNullOrUndefined(that.findList) && that.findList.length > 0) {
      statdata.accountId = that.findList[0].accountId
    } else { statdata.accountId = that.findList.accountId }
    var PRAL=this.dataService.PostRemoveAccLinks(statdata).pipe(first()).subscribe(data => {
      if (data[0] != "Failed") {
        that.sharedData.getNotificationDataReload();
        that.accountInit(that.changeFormValue);
      }
    }, error => { });
    this.subscriptions.add(PRAL);
  }
  removeAccount() {
    var that = this;
    try {
      var form: any = this.accountForm.get('accountItem');
      form.controls.forEach((x: any) => {
        if (x.value.data.accountVan == that.accountAlertInfo.account) { x.controls.account.setValue(false); };
      })
    } catch (e) { console.log(e) }
  }
  checkpershingfunds(resPershing: any) {
    if (isNotNullOrUndefined(resPershing['summary']) && resPershing['summary'].length > 0 && isNotNullOrUndefined(resPershing['summary'][0].availablefunds) &&
      isNotNullOrUndefined(resPershing['summary'][0].availablefunds.amount) &&
      resPershing['summary'][0].availablefunds.amount != 0) {
      return true;
    } else { return false; }
  }
  cloneDirectIndexStrategy() {
    this.cusIndexService.customizeSelectedIndex_custom.next(this.dirIndexService._customizeSelectedIndex_Direct);
    this.cusIndexService.selCompany.next(this.dirIndexService._selCompany);
    this.cusIndexService.currentSList.next(undefined);
    this.cusIndexService.currentSNo.next(-1);
    this.sharedData.showMatLoader.next(false);
    this.router.navigate(["/customIndexing"]);
  }
  openCustomExistingPopup(existing_List:any) {
    var title = 'Index Strategies';
    var options = { from: 'directCustomTool', error: 'existingPopup', destination: 'openCustomIndex', currentList: this.dirIndexService._currentSList, customIndex: this.dirIndexService._customizeSelectedIndex_Direct, selCompany: this.dirIndexService._selCompany }
    var clickeddata: any = existing_List;
    this.dialog.open(existingPopupComponent, {
      width: "37%", height: "auto", maxWidth: "100%", maxHeight: "90vh",
      panelClass: 'custom-modalbox',
      data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options }
    });
    this.sharedData.showMatLoader.next(false);
  }
  openToolCustom() {
    var that = this;
    /*** Check Existing Popup ***/
    that.sharedData.showMatLoader.next(true);
    var GetStgyListDashboard=that.dataService.GetStgyListDashboard('A').pipe(first()).subscribe((res: any) => {
      var cssl = [...res].filter(v => v.assetId == that.dirIndexService._currentSList.assetId && v.shortName != '' && v.name != '');
      //cssl.sort(function (x: any, y: any) { return d3.ascending(x.rowno, y.rowno); });
      cssl = cssl.sort((a: any, b: any) => { return <any>new Date(b.modifieddate) - <any>new Date(a.modifieddate); });
      var existing_stat_list = cssl;
      if (existing_stat_list.length > 0) {
        that.openCustomExistingPopup(existing_stat_list);
      } else {
        /*** Clone Strategy ***/
        that.cloneDirectIndexStrategy();
        /*** Clone Strategy ***/
      }
      //this.cusIndexService.customSavedStrategyLoad.next(false);
      //console.log('currentSList---', that.dirIndexService._currentSList);
      //console.log('_customizeSelectedIndex_Direct---', this.dirIndexService._customizeSelectedIndex_Direct);
      //console.log('_selCompany---', this.dirIndexService._selCompany);
    }, error => {
      that.openDirectErrorComp('Error', 'PostNotificationAccount', 'PostStrategyNotificationQueueError', 'loadIndexSteps');
      this.sharedData.showMatLoader.next(false);
    });
    this.subscriptions.add(GetStgyListDashboard);
    /*** Check Existing Popup ***/
    //this.cusIndexService.customizeSelectedIndex_custom.next(this.dirIndexService._customizeSelectedIndex_Direct);
    //this.cusIndexService.selCompany.next(this.dirIndexService._selCompany);
    //this.cusIndexService.currentSList.next(undefined);
    //this.cusIndexService.currentSNo.next(-1);
    //this.router.navigate(["/customIndexing"]);
  }
  GetDBPershing(accID: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var GSABP=this.dataService.GetSubAccounts_DBPershing(accID).pipe(first()).subscribe((res: any) => {
        if (this.sharedData.checkServiceError(res)) { resolve([]); } else {
          if (isNotNullOrUndefined(res['accounts']) && res['accounts'].length > 0) {
            var data = that.GetAccounts;
            var indexF = data['accounts'].findIndex((x: any) => x.accountId == res['accounts'][0]['accountId']);
            if (indexF > -1) {
              data['accounts'][indexF] = res['accounts'][0];
              data['ledger'][indexF] = res['ledger'][0];
              data['summary'][indexF] = res['summary'][0];

              // that.GetAccounts.next(data);
            }
          }
        }
        resolve(res);
      }, error => { resolve([]); });
      this.subscriptions.add(GSABP);
    });
  }
  marketValue: any;
  updateBtn: boolean = false;
  maxTaxTarget: number = 0;
  rebalanceCount: number = 0;
  accountInit(d: any) {
    var that = this;
    try {
      this.sharedData.showMatLoader.next(true);
      var accID = 0;
      if (isNotNullOrUndefined(d['value']['data']) && isNotNullOrUndefined(d['value']['data']['id'])) { accID = d['value']['data']['id'] }
      this.GetDBPershing(accID).then(rT => {
        this.sharedData.showMatLoader.next(false);
        if (this.checkAccActive(d)) {
          this.checkDefaultAccountPopup = 'details_popup';
          //$('#AccSelectModal').modal('show');
          this.accModalGroup.reset();
          var x = d['value'];
          var accDisabled = that.checkAccDisable(x['data']);
          this.updateBtn = accDisabled;
          var CTtype = 'L';
          if (d['controls']['cashTargetType']['value'] == 'G' || d['controls']['cashTargetType']['value'] == "L") { CTtype = d['controls']['cashTargetType']['value'] }

          //Buffer target default is 20%
          var taxbuf = d['controls']['bufferTarget']['value'];
          if (parseInt(taxbuf) < this.GetAccountConfigSettings[0].dtaxbufferStart ||
            parseInt(taxbuf) > this.GetAccountConfigSettings[0].dtaxbufferEnd || isNullOrUndefined(taxbuf)) { taxbuf = 20 }

          var cashTarget = d['controls']['cashTarget']['value'];
          //if (isNullOrUndefined(cashTarget)) { cashTarget = this.bldMyIndCashTarget; }

          //var transition = d['controls']['transition']['value'];
          //if (isNullOrUndefined(transition)) { transition = 1; }
          this.marketValue = that.checkAccMarketValue(x['data']['id']);
          x['data']['marketValue'] = this.marketValue;
          this.maxTaxTarget = this.marketValue;
          if (CTtype == 'L') {
            var per1 = d3.scaleLinear().domain([0, this.marketValue]).range([0, 100]);
            this.maxTaxTarget = per1.invert(this.GetAccountConfigSettings[0].dcashTargetEnd);
          }

          var taxTarget = d['controls']['taxTarget']['value'];
          if (taxTarget > this.maxTaxTarget || isNullOrUndefined(taxTarget)) { taxTarget = 0 }

          var shortTermtaxRate = d['controls']['shortTermtaxRate']['value'];
          if (isNullOrUndefined(shortTermtaxRate)) { shortTermtaxRate = 35; }
          var longTermtaxRate = d['controls']['longTermtaxRate']['value'];
          if (isNullOrUndefined(longTermtaxRate)) { longTermtaxRate = 20; }
          var transitionDate = d['controls']['transitionDate']['value'];
          if (isNullOrUndefined(transitionDate)) {
            if (this.GetAccountConfigSettings.length > 0) { transitionDate = new Date(this.GetAccountConfigSettings[0]['dtransfromDate']) }
            else { transitionDate = new Date(); }
          } else if (this.GetAccountConfigSettings.length > 0) {
            var c_d = new Date(this.GetAccountConfigSettings[0]['dtransfromDate']);
            var C_date = moment(transitionDate).diff(moment(c_d), 'days');
            if (C_date < 0) { transitionDate = new Date(this.minDate) }
          }

          var transitionGainTgt = d['controls']['transitionGainTgt']['value'];
          if (isNullOrUndefined(transitionGainTgt)) { transitionGainTgt = 0 }
          var ct: any = moment(transitionDate).diff(moment(new Date()), 'months', true) / 3;
          that.rebalanceCount = parseInt(ct)
          if (isNaN(that.rebalanceCount) || isNullOrUndefined(that.rebalanceCount)) { that.rebalanceCount = 0; }
          this.accModalGroup = this.formBuilder.group({
            data: x['data'],
            cashTarget: [{ value: cashTarget, disabled: accDisabled }, [Validators.required, Validators.min(that.GetAccountConfigSettings[0].dcashTargetStart), Validators.max(that.GetAccountConfigSettings[0].dcashTargetEnd)]],
            cashTargetType: [{ value: CTtype, disabled: accDisabled }, Validators.required],
            taxTarget: [{ value: taxTarget, disabled: accDisabled }, [Validators.required, Validators.min(0), Validators.max(this.maxTaxTarget)]],
            bufferTarget: [{ value: taxbuf, disabled: accDisabled }, [Validators.required, Validators.min(this.GetAccountConfigSettings[0].dtaxbufferStart), Validators.max(this.GetAccountConfigSettings[0].dtaxbufferEnd)]],
            shortTermtaxRate: [{ value: shortTermtaxRate, disabled: accDisabled }, [Validators.required, Validators.min(0.00), Validators.max(100.00)]],
            longTermtaxRate: [{ value: longTermtaxRate, disabled: accDisabled }, [Validators.required, Validators.min(0.00), Validators.max(100.00)]],
            transitionDate: [{ value: transitionDate, disabled: accDisabled }, [Validators.required]],
            transitionGainTgt: [{ value: transitionGainTgt, disabled: accDisabled }, [Validators.required, Validators.min(0)]],
          });
          //console.log(this.accModalGroup);
          this.showSpinnerAcc_settings = false;
        } else { }
      });
    } catch (e) { console.log(e) }
  }

  checkTax(d: any) {
    var val = this.gainList.filter(x => x.value == d);
    if (val.length > 0) { return val[0].name; } else { return ''; }
  }

  checkAccMarketValue(accountId: any) {
    var data = this.GetAccounts;
    var indexF = data['accounts'].findIndex((x: any) => parseInt(x.accountId) == parseInt(accountId));
    if (indexF > -1) { return data['summary'][indexF].availablefunds.amount } else { return 0 }
  }
  checkAccName(d: any) {
    if (isNotNullOrUndefined(d['value']['data'])) {
      return d['value']['data']['accountVan'];
    } else { return ''; }
  }
  checkAccActive(d: any) { return d.controls.account.value };
  checkEnableFactSheet() {
    var that = this;
    var val: boolean = false;
    var all_list = that.sharedData.getNotificationQueue.value;
    var currentList = that.dirIndexService.currentSList.value;
    var x = all_list.filter((x: any) => x.dIRefId == currentList.id);
    if (x.length > 0) {
      if (x[0].notifyStatus == 'A' || x[0].notifyStatus == 'I') { val = false; } else { val = true; }
    } else { val = true; };
    return val;
  }

  loadAccChange() {
    var that = this;
    var accList: any = [];
    var data = this.accountForm.value['accountItem'].filter((x: any) => x.account == true);
    data.forEach((x: any) => {
      var obj = {
        "accountId": parseInt(x.data.id),
        "cashTarget": x['cashTarget'],
        "taxType": x['cashTargetType'],
        "taxTarget": x['taxTarget'],
        "taxBufferGainTarget": x['bufferTarget'],
        "transitionno": x['transition'],
        "marketValue": x.data['marketValue'],
        "shortterm": x['shortTermtaxRate'],
        "longterm": x['longTermtaxRate'],
        "transitionDate": x['transitionDate'],
        "transitionGainTgt": x['transitionGainTgt'],
      };
      accList.push(obj);
    });
    this.diIndAccountData = accList;
  }

  removeAccountAll(data: any) {
    var that = this;
    try {
      var form: any = this.accountForm.get('accountItem');
      if (data.length > 0) {
        data.forEach((d: any) => {
          form.controls.forEach((x: any) => { if (x.value.data.id == parseInt(d['accid'])) { x.controls.account.setValue(false); }; })
        });
      }
    } catch (e) { console.log(e) }
  }

  checkAccValName(d: any) {
    var fillD = this.myAcclistList.filter((x: any) => parseInt(x.id) == parseInt(d));
    if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) { return fillD[0]['accountVan'] } else { return "" }
  }

  checkCashTargetVal(cash: any, marketValue: any) {
    var info = this.sharedData.GetSchedularMaster.value;
    var noComp = this.dirIndexService._customizeSelectedIndex_Direct['noofComp'];
    var value = noComp * info[0]['StrategyValPerComp'];
    value = (value - (value * (info[0]['StrategyValCBuffPercent'] / 100)));
    var nValue = marketValue - (marketValue * (cash / 100));
    if (nValue >= value) { return true } else { return false }
  }

  checkAccountMtvalcheck() {
    return new Promise((resolve, reject) => {
      var data: any = [];
      var info = this.sharedData.GetSchedularMaster.value;
      var noComp = this.dirIndexService._customizeSelectedIndex_Direct['noofComp'];
      var value = noComp * info[0]['StrategyValPerComp'];
      value = (value - (value * (info[0]['StrategyValCBuffPercent'] / 100)));
      this.diIndAccountData.forEach((d: any) => {
        if (isNotNullOrUndefined(d['marketValue']) && d['marketValue'] <= value) {
          var Obj = Object.assign({}, d);
          Obj['marketValue'] = d3.format(".2f")(Obj['marketValue']);
          Obj['acValue'] = d3.format(".2f")(value);
          data.push(Obj)
        }
      });
      resolve(data);
    });
  }

  updateAccModal() {
    var that = this;
    var value = this.accModalGroup['value'];
    var accID = this.accModalGroup['value']['data']['id'];
    var form: any = this.accountForm.get('accountItem');
    var formInd = form['controls'].findIndex((x: any) => x.controls.data.value.id == accID);
    var marketValue = parseFloat(d3.format(".2f")(value['data']['marketValue']));
    var CT: boolean = this.checkCashTargetVal(value['cashTarget'], marketValue);
    that.InsufficientCashTarget = false;
    if (formInd > -1 && !CT) {
      $('#cashTargetIn').focus();
      that.InsufficientCashTarget = true;
      //that.toastr.success(this.sharedData.checkMyAppMessage(12, 93), '',
      // { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
    } else if (formInd > -1 && this.accModalGroup.valid && CT) {
      form['controls'][formInd].setValue({
        data: form['controls'][formInd].value.data,
        account: true,
        cashTarget: value['cashTarget'],
        cashTargetType: value['cashTargetType'],
        taxTarget: value['taxTarget'],
        bufferTarget: value['bufferTarget'],
        longTermtaxRate: value['longTermtaxRate'],
        shortTermtaxRate: value['shortTermtaxRate'],
        transitionDate: value['transitionDate'],
        transitionGainTgt: value['transitionGainTgt'],
      });
      this.checkDefaultAccountPopup = ''
      //$('#AccSelectModal').modal('hide');
      if (this.selectedDirectIndex.taxEffAwareness == 'Y') { $('#taxOptDisclosure').modal('show'); }
    } else { }
    this.sharedData.userEventTrack('Direct Indexing', accID, accID, 'Account data update');
  }

  accMtData: any = [];
  checkLockedAcc() {
    var that = this;
    this.loadAccChange();
    var CTData: any = [];
    var accData = this.diIndAccountData;
    accData.forEach((d: any) => {
      if (!that.checkCashTargetVal(d['cashTarget'], d['marketValue'])) {
        CTData.push({ account: that.checkAccValName(d.accountId), marketValue: d['marketValue'], cashTarget: d['cashTarget'] });
      }
    });
    this.accMtData = CTData;
    if (CTData.length > 0) { $('#accCashTargetModal').modal('show'); } else {
      this.accMtData = [];
      this.checkAccountMtvalcheck().then((res: any) => {
        this.accMtData = res;
        if (res.length == 0) {
          var data: any = [];
          this.lockedDataInfo = [];
          this.pausedDataInfo = [];
          if (that.showSpinnerAcc_settings) {
            this.toastr.info('Please wait account data initializing...', '', { timeOut: 5000 });
          } else {
            let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
            this.diIndAccountData.forEach((d: any) => {
              var obj = { "accid": d['accountId'], "userid": userid };
              data.push(obj);
            });
            if (data.length > 0) {
              var GetlockPauseAccs=this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
                var lockInfo = res.filter((ld: any) => ld.lockstatus == 'Y');
                var pauseInfo = res.filter((ld: any) => ld.pausestatus == 'Y');
                if (lockInfo.length > 0 || pauseInfo.length > 0) {
                  that.checkDefaultAccountPopup = 'lockAccounts_popup';
                  //$('#lockInfoTradeModal').modal('show');
                  that.removeAccountAll(lockInfo);
                  that.lockedDataInfo = lockInfo;
                  that.pausedDataInfo = pauseInfo;
                } else { this.builIndexCalculate(); }
              }, (error: any) => { });
              this.subscriptions.add(GetlockPauseAccs);
            } else { this.builIndexCalculate(); }
          }
        } else {
          //$('#accMtCalModal').modal('show');
        };
      });
    }
  }

  DIcalculate() {
    var that = this;
    this.sharedData.showMatLoader.next(true);
    var accountData: any = [];
    this.loadAccChange();
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var clist = this.dirIndexService._selectedDirIndStry;
    if (this.diStrFactsheetAccData.length > 0) {
      [...this.diStrFactsheetAccData].forEach(d => {
        if (that.diIndAccountData.filter((x: any) => parseInt(x.accountId) == parseInt(d.accountId)).length == 0) {
          var CTtype = 'G';
          if (d['taxType'] == 'G' || d['taxType'] == "L") { CTtype = d['taxType'] }
          var accData: PostStgyAccDt = {
            "id": d.id,
            "accountId": parseInt(d.accountId),
            "userid": parseInt(userid),
            "slid": clist[0].id,
            "status": "D",
            "cashTarget": d['cashTarget'],
            "taxType": CTtype,
            "taxTarget": d['taxTarget'],
            "taxBufferGainTarget": d['taxBufferGainTarget'],
            "marketvalue": d['marketvalue'],
            "shortterm": d['shortterm'],
            "longterm": d['longterm'],
            "transitionDate": formatDate(d['transitionDate'], 'yyyy/MM/dd', 'en-US'),
            "transitionGainTgt": d['transitionGainTgt'],
          }
          if (d['tradedStatus'] != 'Y') { accountData.push(accData); }
        }
      });
    }
    if (that.diIndAccountData.length > 0) {
      [...that.diIndAccountData].forEach(x => {
        var oldData = that.diStrFactsheetAccData.filter((d: any) => parseInt(x.accountId) == parseInt(d.accountId));
        var CTtype = 'L';
        if (x['taxType'] == 'G' || x['taxType'] == "L") { CTtype = x['taxType'] }
        var accData: PostStgyAccDt = {
          "id": (oldData.length > 0) ? oldData[0]['id'] : 0,
          "accountId": parseInt(x.accountId),
          "userid": parseInt(userid),
          "slid": clist[0].id,
          "status": "A",
          "cashTarget": x['cashTarget'],
          "taxType": CTtype,
          "taxTarget": x['taxTarget'],
          "taxBufferGainTarget": x['taxBufferGainTarget'],
          "marketvalue": x['marketValue'],
          "shortterm": x['shortterm'],
          "longterm": x['longterm'],
          "transitionDate": formatDate(x['transitionDate'], 'yyyy/MM/dd', 'en-US'),
          "transitionGainTgt": x['transitionGainTgt'],
        }
        if (oldData.length > 0 && isNotNullOrUndefined(oldData[0]['tradedStatus']) && oldData[0]['tradedStatus'] == 'Y') { }
        else { accountData.push(accData); }
      });
    }
    var filAccDt = that.checkAccountFilter(accountData, [...that.diFactAccountData], clist[0].id);
    if (filAccDt.length > 0) { this.createAccountList(filAccDt, clist[0].id); }
    else {
      this.toastr.success(this.sharedData.checkMyAppMessage(5, 35), '', { timeOut: 8000 });
      this.sharedData.showMatLoader.next(false);
    }
    this.sharedData.checkHoldingQueue(clist[0].id, accountData);
    if (isNotNullOrUndefined(clist[0]['enableTrading']) && clist[0]['enableTrading'] != 'Y') {
      //that.cusIndexService.enableTrading_factsheet.next("Y");
      this.sharedData.showMatLoader.next(false);
    }
    var sel = that.dirIndexService._customizeSelectedIndex_Direct
    this.sharedData.userEventTrack('Direct Indexing', sel['name'], sel['id'], 'calculate btn click');    
  }

  createAccountList(data: any, slid: any) {
    var that = this;
    var PostStrategyAccount=that.dataService.PostStrategyAccount(data).pipe(first()).subscribe((data: any) => {
      if (data[0] != "Failed") {
        this.GetStrategyAccount(slid, true);
      }
    }, (error: any) => {
      this.sharedData.showMatLoader.next(false);
      that.openDirectErrorComp('Error', 'PostNotificationAccount', 'PostStrategyNotificationQueueError', 'loadIndexSteps');
      this.logger.logError(error, 'PostGicsExData');
    });
    this.subscriptions.add(PostStrategyAccount);
  }


  checkAccountFilter(ar1: any, ar2: any, slid: any) {
    var postAccData: any = [];
    ar1.forEach((item: any) => {
      var filDt = ar2.filter((x: any) => x.accountId == item.accountId);
      if (item['status'] == 'A') {
        var notifyId = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == slid && x.accountId == item.accountId);
        var dashAccs = [...this.dirIndexService.stgyListDashAccsData.value].filter(x => x.id == slid && x.accountId == item.accountId);
        if (notifyId.length > 0 && notifyId[0]['notifyStatus'] == 'F') { postAccData.push(item) }
        else if (dashAccs.length > 0 && dashAccs[0]['factsheetStatus'] == 'N') { postAccData.push(item) }
        else if (filDt.length > 0) {
          try {
            if (filDt[0]["cashTarget"] == item["cashTarget"] &&
              //filDt[0]["transitionno"] == item["transitionno"] &&
              filDt[0]["taxType"] == item["taxType"] &&
              filDt[0]["taxTarget"] == item["taxTarget"] &&
              filDt[0]["taxBufferGainTarget"] == item["taxBufferGainTarget"] &&
              filDt[0]["transitionGainTgt"] == item["transitionGainTgt"] &&
              formatDate(filDt[0]["transitionDate"], 'yyyy/MM/dd', 'en-US') == item["transitionDate"] &&
              filDt[0]["shortterm"] == item["shortterm"] &&
              filDt[0]["longterm"] == item["longterm"]) { } else { postAccData.push(item) }
          } catch (e) { postAccData.push(item) }
        } else { postAccData.push(item) }
      } else { postAccData.push(item) }
    });
    return postAccData;
  }

  builIndexCalculate() {
    if (isNullOrUndefined(this.dirIndexService._selectedDirIndStry) || this.dirIndexService._selectedDirIndStry.length == 0) { this.PostStrategyData(); }
    else { this.DIcalculate(); }
  }

  checkErfflag(data: any) { if (data['selectBy'] == 1 || data['weightBy'] == 1) { return "Y" } else { return "N" } };

  PostStrategyData() {
    var that = this;
    var clist = that.dirIndexService._customizeSelectedIndex_Direct;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (isNotNullOrUndefined(clist)) {
      var Obj = Object.assign({}, clist);
      Obj['id'] = (that.dirIndexService._selectedDirIndStry.length > 0) ? that.dirIndexService._selectedDirIndStry[0]['id'] : 0;
      Obj['dIRefId'] = clist['id'];
      Obj['userid'] = userid;
      Obj['name'] = Obj['name'].replaceAll('-', ' ');
      Obj['shortname'] = Obj['shortname'].replaceAll('_', ' ');
      Obj['basedOn'] = '';
      Obj['basedon'] = '';
      Obj['tenYrFlag'] = 1;
      Obj['freqflag'] = that.sharedData.defaultRebalanceType;
      Obj['erfflag'] = that.checkErfflag(clist);
      Obj['description'] = '';
      Obj['indextotalcount'] = 0;
      Obj['removedcount'] = 0;
      var statdata = [];
      statdata.push(Obj);
      var PostStrategyData=that.dataService.PostStrategyData(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            var GetStrategyAssetList=that.dataService.GetStrategyAssetList(clist.assetId, clist.mode).pipe(first()).subscribe((slist: any) => {
              this.dirIndexService.selectedDirIndStry.next([...slist]);
              this.DIcalculate();
            }, (error: any) => {
              this.logger.logError(error, 'GetStrategyAssetList');
            });
            this.subscriptions.add(GetStrategyAssetList);
          };
        }, (error: any) => {
          this.logger.logError(error, 'PostStrategyData');
          that.openDirectErrorComp('Error', 'PostNotificationAccount', 'PostStrategyNotificationQueueError', 'loadIndexSteps');
      });
      this.subscriptions.add(PostStrategyData);
    }
  }
  openQueueModal() {
    var title = 'notifyQueue';
    var options = { from: 'buildYourIndex', error: 'notifyQueue', destination: 'openNotificationQueue' }
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "30%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });

  }
  checkfactDisable(accId: any) {
    var currentList = this.dirIndexService._selectedDirIndStry;
    //console.log(currentList)
    if (isNotNullOrUndefined(currentList) && currentList.length > 0 && this.myAcclistList.length>0) {
      var xx = [...this.sharedData.getNotificationQueue.value].filter(x => x.slid == currentList[0].id &&
        x.accountId == accId && x.notifyStatus == 'E');
      if (xx.length > 0) { return false } else { return true }
    } else { return true }
  }
  openFactsheet(d: number) {
    if (!this.checkfactDisable(d) || d == 0) {
      var that =this;
      this.reviewIndextab = d;
      //console.log(d,'d')
      this.dirIndexService.selectedDirIndFactsheet.next(d);
      this.dirIndexService.reviewIndexClickedData.next(that.checkSelectedAccVal(d));
      this.dirIndexService.showReviewIndexLoaded.next(true);
      this.sharedData.userEventTrack('Direct Indexing', ("Account id:" + d), ("Account id:" + d), 'open factsheet click');
      this.viewRemovestrategy()
    }

  }
  checkSelectedAccVal(d:any) {
    var fillD = this.myAcclistList.filter((x:any) => parseInt(x.id) == parseInt(d));
    if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) { return fillD[0] } else { return undefined; }
  }
  closeFactsheet() {
    this.reviewIndextab = null;
    this.dirIndexService.showReviewIndexLoaded.next(false);
    this.accSearchText = '';
  }

  accountTooltip(d: any) {
    if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d['value'])
      && isNotNullOrUndefined(d['value']['data']) && isNotNullOrUndefined(d['value']['data']['accountTitle'])) { return d['value']['data']['accountTitle']; }
    else { return ''; };
  }

  viewRemovestrategy() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var xx = [...this.sharedData.getNotificationQueue.value].filter(x => x.dIRefId == this.dirIndexService._customizeSelectedIndex_Direct.id &&
      x.displayQueue == 'Y' && x.accountId == this.reviewIndextab && x.notifyStatus == 'E');
    if (xx.length > 0) {
      var item = xx[0];
      var stat = 'N';
      var statdata = [{ "notifyid": item.notifyId, "status": stat, "userid": parseInt(userid) }];
      var PUSDQ=this.dataService.PostUpdateStrategyDisplayQueue(statdata).pipe(first()).subscribe(
        data => {
          if (data[0] != "Failed") { this.sharedData.getNotificationDataReload(); };
        }, error => { this.toastr.success(this.sharedData.checkMyAppMessage(0, 11), '', { timeOut: 5000 }); });
      this.subscriptions.add(PUSDQ);
    }
  }

  checkMV(d: any) {
    if (isNotNullOrUndefined(d['value']['data'])) {
      return this.sharedData.numberWithCommas(d['value']['data']['marketValue'].toFixed(2));
    } else { return ''; }
  }


  checkRemainingCashTarget(cashTargetValue: string, type: string) {
    var marketVal: any = this.checkMV(this.accModalGroup);
    var cash: any = this.accModalGroup.get(cashTargetValue)?.value;
    var marketValue = parseFloat(marketVal.replace(/\,/g, ''));
    if (type == 'updatedCash' && isNotNullOrUndefined(marketValue) && isNotNullOrUndefined(cash)) {
      var val = marketValue - (marketValue * (cash / 100));
      return d3.format(',.2f')(val);
    }
    else if (type == 'remainingCash' && isNotNullOrUndefined(marketValue) && isNotNullOrUndefined(cash)) {
      var val = marketValue * (cash / 100);
      return d3.format(',.2f')(val);
    }
    else {
      return '-';
    }
  }

  checkFormInvalid(d: string) { return this.accModalGroup.get(d)?.invalid; }
  checkFormValue(d: string) { return this.accModalGroup.get(d)?.value; }

  transitionDateCange(e: any) {
    if (isNotNullOrUndefined(e['value'])) {
      var ct: any = moment(e['value']).diff(moment(new Date()), 'months', true) / 3;
      this.rebalanceCount = parseInt(ct)
    }
  }

  accountEvTrack(e: any, acc: any) {
    var aEv = this.checkAccName(acc) + " is " + (e.checked ? 'selected' : 'unselected');
    this.sharedData.userEventTrack('Direct Indexing', aEv, aEv, 'Account select checkbox');
  }

  accountmore(acc: any) {
    var aEv = this.checkAccName(acc) + " is more option clicked";
    this.sharedData.userEventTrack('Direct Indexing', aEv, aEv, 'Account select checkbox');
  }

  eventTrace(acc: any, txt: string) {
    var aEv = this.checkAccName(acc) + " is " + txt;
    this.sharedData.userEventTrack('Direct Indexing', aEv, aEv, 'Account select checkbox');
  }

  unPauseAcc() {
    if (this.pausedDataInfo.length > 0) {
      this.pausedDataInfo.forEach((d: any) => { this.sharedData.PauseAccUpdate(JSON.stringify(d['accid']), 'N').then((res) => { }); });
    }
  }

  checkMyaccID() {
    var accID = 0;
    if (
      isNotNullOrUndefined(this.accModalGroup['value']['data']) &&
      isNotNullOrUndefined(this.accModalGroup['value']['data']['id'])
    ) {
      accID = this.accModalGroup['value']['data']['id'];
    }
    return accID;
  }
}

interface selectedDirIndex {
  "selectBy": number,
  "selectedByName": string,
  "weightBy": number,
  "weightedByName": string,
  "rebalanceType": string,
  "rebalanceByName": string,
  "noofComp": number,
  "taxEffAwareness": string,
  "cashTarget": number,
}
export class PostStgyAccDt {
  "id": number;
  "accountId": number;
  "userid": number;
  "slid": number;
  "status": string;
  "cashTarget": number;
  "taxType": string;
  "taxTarget": number;
  "taxBufferGainTarget": number;
  //"transitionno": number;
  "marketvalue": number;
  "shortterm": number;
  "longterm": number;
  "transitionDate": any;
  "transitionGainTgt": any;
}
