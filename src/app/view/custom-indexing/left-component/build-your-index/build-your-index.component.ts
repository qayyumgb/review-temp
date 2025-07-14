import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, first, map, startWith, switchMap } from 'rxjs';
import { AccountService } from '../../../../core/services/moduleService/account.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../../core/services/data/data.service';
import { CustomIndexService } from '../../../../core/services/moduleService/custom-index.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '../../../../core/services/logger/logger.service';
import { IndexConstructionPopupComponent } from '../../../index-construction-popup/index-construction-popup.component';
import { CommonErrorDialogComponent } from '../../error-dialogs/common-error-dialog/common-error-dialog.component';
import moment from 'moment'
// @ts-ignore
import * as d3 from 'd3';
declare var $: any;
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { IndexstepService } from '../../../../core/services/indexstep.service';
import { format } from 'd3';
const empty_DATA: any = [];
import { DecimalPipe, formatDate } from '@angular/common';

interface factor {
  "factorid": number,
  "slid": number,
  "userid": number,
  "assetid": number,
  "startval": number,
  "endval": number,
  "perorval": number,
  "status": string,
  "name": string,
  "displayname": string,
  "orgTopValue": number,
  "orgBottomValue": number,
  "orgTopPct": number,
  "orgBottomPct": number,
}

@Component({
  selector: 'app-build-your-index',
  templateUrl: './build-your-index.component.html',
  styleUrl: './build-your-index.component.scss',
})
export class BuildYourIndexComponent  implements OnInit, OnDestroy, AfterViewInit{
  /** Expand Weight **/
  expand_weight_show: boolean = false;
  /** Weight **/
  isTooltipDisabled: boolean = false;
  checkStgyAlreadyTraded: boolean = false;
  calWeightcheck: boolean = true;
  bldMyIndselNoCompWeight: any = 0;
  bldMyIndselNoCompWeightSlider: any = 0;
  bldMyIndselNoCompWeightTraded: any = 0;
  bldMyIndselNoWeightmax: number = 100;
  bldMyIndselNoWeightmin: number = 0;
  bldMyIndselWeightLimit: number = 0;
  openWeightLoader: boolean = false;
  accSearchText: string = '';
  openFactorLoader: boolean = false;
  isAccountAccor: boolean = false;
  FilterList: any = [
    { Name: 'Company Name', value: '1', ID: 'CN_asc' },
    { Name: 'Ticker', value: '2', ID: 'T_asc' },
  ];
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // Handle touch events if necessary
    //console.log(event, 'touch');
    var that = this;
    that.isTooltipDisabled = true;
  }
 
  /** Weight **/
  weightChangeShow(event: any) {
    var that = this;
    var check = event.checked;
    this.expand_weight_show = check;
    if (check == true) {
      that.cusIndexService.custToolWeightFlag.next('Y');
      var val: number = that.custToolNoOfComp;
      let num = (1 / val) * 100;
      that.bldMyIndselNoWeightmin = 0;
      that.bldMyIndselNoWeightmin = Math.ceil(num);
      that.selectionOptionsWeight = {
        floor: that.bldMyIndselNoWeightmin,
        ceil: 100,
        noSwitching: true,
        disabled: this.checkStgyAlreadyTraded,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            default:
              return value + '%';
          }
        },
      };
      let multipleValue = that.bldMyIndselNoWeightmin * 3;
      that.bldMyIndselNoCompWeight = multipleValue;
      that.bldMyIndselNoCompWeightSlider = multipleValue;
      this.weightLimitError = false;
    } else {
      that.cusIndexService.custToolWeightFlag.next('N');
    }
    //that.cusIndexService.saveBldsel();
  }
  selectionOptionsWeight: Options = {
    floor: 0,
    ceil: 100,
    noSwitching: true,
    disabled: this.checkStgyAlreadyTraded,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        default:
          return value + '%';
      }
    },
  };
  formatLabelWeightSlider(value: number) {
    return value + '%';
  }
  checksliderWeight() {
    var that = this;
    if (
      this.bldMyIndselNoWeightmin > this.bldMyIndselNoCompWeight ||
      this.bldMyIndselNoCompWeight > 100
    ) {
      this.weightLimitError = true;
      //if (this.bldMyIndselNoCompWeight > 100) {
      //  this.bldMyIndselNoCompWeight = 100;
      //  this.bldMyIndselNoCompWeightSlider = parseInt(this.bldMyIndselNoCompWeight.toString());
      //  this.weightLimitError = false;
      //}
    } else {
      this.weightLimitError = false;
      this.bldMyIndselNoCompWeightSlider = parseInt(
        this.bldMyIndselNoCompWeight.toString()
      ); /** Slider val **/
      this.cusIndexService.bldMyIndselWeightLimit.next(
        this.bldMyIndselNoCompWeight
      );
    }
  }
  changeBldSliderWeight(event: any) {
    if (
      this.bldMyIndselNoCompWeight > 100 ||
      this.bldMyIndselNoWeightmin > this.bldMyIndselNoCompWeight
    ) {
      this.weightLimitError = true;
    } else {
      this.weightLimitError = false;
      this.bldMyIndselNoCompWeight = parseInt(
        this.bldMyIndselNoCompWeight.toString()
      ); /** Input Box **/
      this.bldMyIndselNoCompWeightSlider = parseInt(
        this.bldMyIndselNoCompWeight.toString()
      ); /** Slider val **/
      this.cusIndexService.bldMyIndselWeightLimit.next(
        this.bldMyIndselNoCompWeight
      );
    }
  }
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
    this.searchText = '';
    this.toggleSearch = false;
  }
  selNoMatSliderInputWeight(e: any) {
    try {
      var val: number = parseInt(e.value);
      this.bldMyIndselNoCompWeightSlider = val; /** Slider val **/
      this.bldMyIndselNoCompWeight = val; /** Input Box **/
      this.weightLimitError = false;
    } catch (e) { }
    this.bldMyIndselWeightLimit =
      this.bldMyIndselNoCompWeight; /** Calculate API Pass variable **/
  }
  calculateWeight(noofcomp: any, type: string = '') {
    var that = this;
    that.weightLimitError = false;
    
    /*** noofcomp must be greater than Zero ***/
    if (noofcomp > 0 && that.expand_weight_show) {
      that.openWeightLoader = true; /* loader On **/
      var val: number = noofcomp;
      let num = (1 / val) * 100;
      that.bldMyIndselNoWeightmin = 0;
      that.bldMyIndselNoWeightmin = Math.ceil(num);
      this.calWeightcheck = false;
      /*** Check saved strategy Data ***/
      if (type == 'init') {
        that.bldMyIndselNoCompWeight =
          that.cusIndexService._bldMyIndselWeightLimit;
        that.bldMyIndselNoCompWeightSlider =
          that.cusIndexService._bldMyIndselWeightLimit;
      } else if (that.bldMyIndselNoCompWeight == 0 && that.cusIndexService._custToolWeightFlag == 'Y') {
        /** Get saved value after calculate **/
        that.bldMyIndselNoCompWeight =
          that.cusIndexService._bldMyIndselWeightLimit;
        that.bldMyIndselNoCompWeightSlider =
          that.cusIndexService._bldMyIndselWeightLimit;
      } else {
        /** Store temp value **/
        //if (this.calWeightcheck && that.cusIndexService._custToolWeightFlag == 'Y' && isNotNullOrUndefined(that.cusIndexService._bldMyIndselWeightLimit)) {
        //  that.bldMyIndselNoCompWeight =
        //    that.cusIndexService._bldMyIndselWeightLimit;
        //  that.bldMyIndselNoCompWeightSlider =
        //    that.cusIndexService._bldMyIndselWeightLimit;
        //} else {
          let multipleValue = that.bldMyIndselNoWeightmin * 3;
          that.bldMyIndselNoCompWeight = multipleValue;
          that.bldMyIndselNoCompWeightSlider = multipleValue;
      /*  }*/
   
      }

      /*** Not Extend to max value 100 ***/
      if (that.bldMyIndselNoCompWeight >= that.bldMyIndselNoWeightmax) {
        that.bldMyIndselNoCompWeight = 100;
        that.bldMyIndselNoCompWeightSlider = 100;
      } else {
        that.bldMyIndselWeightLimit = that.bldMyIndselNoCompWeight;
      }
      /** Traded strategy ***/
      if (
        (isNullOrUndefined(that.cusIndexService._bldMyIndselWeightLimit) ||
          that.cusIndexService._bldMyIndselWeightLimit == 100) &&
        !this.cusIndexService.checkTrade(this.cusIndexService._currentSList) &&
        !that.expand_weight_show
      ) {
        that.bldMyIndselNoCompWeightTraded = 100;
      } else {
        that.bldMyIndselNoCompWeightTraded =
          that.cusIndexService._bldMyIndselWeightLimit;
      }
      //console.log(that.bldMyIndselNoCompWeightSlider, that.bldMyIndselNoCompWeight);
      var slider: Options = {
        floor: that.bldMyIndselNoWeightmin,
        ceil: 100,
        noSwitching: true,
        disabled: this.checkStgyAlreadyTraded,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            default:
              return value + '%';
          }
        },
      };
      this.selectionOptionsWeight = slider;
      /** Traded strategy ***/
      /*** Not Extend to max value 100 ***/
      setTimeout(() => {
        that.openWeightLoader = false;
      }, 2000);
    }
  }

  displayedColumns: string[] = ['name', 'ticker'];
  displayedSecColumns: string[] = ['name', 'code'];
  selectedGics: any = { type: '' };
  selectedGicsPath: any = [];
  companydataSource = new MatTableDataSource<any>(empty_DATA);
  GicsdataSource = new MatTableDataSource<any>(empty_DATA);
  emptyData = new MatTableDataSource<any>(empty_DATA);
  @ViewChild(MatSort) sort: MatSort | undefined;
  sortedData: any;
  announceSortChange(sort: any) {
    const data = this.companydataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'name': {
          return this.compare(a.name, b.name, isAsc);
        }
        case 'ticker':
          return this.compare(a.ticker, b.ticker, isAsc);
        default:
          return 0;
      }
    });
    this.companydataSource.data = this.sortedData;
  }

  GicsSortChange(sort: any) {
    const data = this.GicsdataSource.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }
    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'name': {
          return this.compare(a.name, b.name, isAsc);
        }
        default:
          return 0;
      }
    });
    this.GicsdataSource.data = this.sortedData;
  }

  compare(a: any, b: any, isAsc: any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  dragvalue: number = 0;
  rebalancePeriod = this.sharedData.rebalancePeriod;
  dragoptions: Options = {
    floor: 0,
    ceil: 100,
    noSwitching: true,
    minRange: 2,
    disabled: this.checkStgyAlreadyTraded,
    translate: (value: number, label: LabelType): string => {
      return value + '%';
    },
  };
  /** factors Range ***/
  factorsMindragvalue: number = 30;
  factorsMaxdragvalue: number = 60;
  factorsDragOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    noSwitching: true,
    minRange: 2,
    disabled: this.checkStgyAlreadyTraded,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        default:
          return value + '%';
      }
    },
  };
  /** factors Range ***/

  selectionvalue: number = 100;
  selectionhighValue: number = 240;
  selectionOptions: Options = {
    floor: 0,
    noSwitching: true,
    ceil: 300,
    disabled: this.checkStgyAlreadyTraded,
  };

  showDefault_select: string = 'Alpha';
  showSpinnerAcc_settings: boolean = false;
  showAccountDetails_popup: boolean = false;
  showAccountTraded_popup: boolean = false;
  showAccountSaved_popup: boolean = false;
  checkDefaultAccountPopup: string = ''; //** Pass details_popup, traded_popup, saved_popup **//
  accMtData: any = [];
  InsufficientCashTarget: boolean = false;
  /*** Account Selection ***/
  accModalGroup: FormGroup;
  gainList = [
    { name: 'Gain', value: 'G' },
    { name: 'Loss', value: 'L' },
  ];
  accountForm: FormGroup;
  accountItem: FormArray<any> = new FormArray<any>([]);
  //accountItem: FormArray;
  myAcclistList: any = [];
  /*** Account Selection ***/
  GetAccountConfigSettings: any = [];
  defaultMarketCurrency: any = '';
  bufferTargetData: any = [];
  minDate = new Date();
  maxDate = new Date();
  alpharemovePercentage: any = [
    { name: 'remove 20', value: 20 },
    { name: 'remove 40', value: 40 },
    { name: 'remove 60', value: 60 },
  ];
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
  marketValue: any;
  updateBtn: boolean = false;
  maxTaxTarget: number = 0;
  rebalanceCount: number = 0;
  GetAccounts: any = [];
  findList: any = [];
  changeFormValue: any;
  strat_savedAccount: any = [];
  lockedDataInfo: any = [];
  pausedDataInfo: any = [];
  reviewIndextab: any = null;
  selectionSorting: any = [];

  cashTargetMiMx = { min: 2, max: 99 };

  subscriptions = new Subscription();

  alphaApplyBtn: boolean = false;

  //alpha Factor
  userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));

  alphaFactorData: factor = {
    factorid: 18,
    slid: 0,
    userid: parseInt(this.userid),
    assetid: 0,
    startval: 0,
    endval: 100,
    perorval: 0,
    status: 'A',
    name: '',
    displayname: '',
    orgTopValue: 0,
    orgBottomValue: 100,
    orgTopPct: 0,
    orgBottomPct: 100,
  };
  //alpha Factor

  //filter comp
  remCompData: any = [];
  checkApplyBtn: boolean = false;
  exclude_multiple_G: boolean = true;

  bldIndAccData: any = [];
  //filter Gics
  remGicsData: any = [];
  show_applyGics: boolean = false;

  /** Selection & Weighting **/
  custToolSelectByValue: number = 0;
  custToolWeightByValue: number = 0;
  custToolCashTarget: number = 0;
  custToolNoOfComp: number = 0;
  inbldMyIndselNoCompVal: number = 0;
  custToolWeightLimit: number = 0;
  custToolWeightFlag: string = '';
  custToolRebalanceType: string = 'q';
  custToolTaxEffAwareness: boolean = false;
  /** Selection & Weighting **/
  bldMyIndcheck: boolean = false;
  zeroAccMarketVal = 250000.0;
  companySearch = new FormControl('');
  constructor(
    public accountService: AccountService,
    public sharedData: SharedDataService,
    public dataService: DataService,
    public cusIndexService: CustomIndexService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private _liveAnnouncer: LiveAnnouncer,
    private indexStepSer: IndexstepService,
    private logger: LoggerService,
    private toastr: ToastrService
  ) {
    var that = this;
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
    if (
      isNotNullOrUndefined(
        this.sharedData.GetSchedularMaster.value[0]['DefMktValue']
      )
    ) {
      this.zeroAccMarketVal =
        this.sharedData.GetSchedularMaster.value[0]['DefMktValue'];
    }
    this.accTargetSettings();
    this.companySearch.valueChanges.subscribe((srcValue: any) => {
      this._filter(srcValue);
    });
  }

  private _filter(value: any) {
    var filterValue: any = undefined;
    if (value instanceof Object) {
      value = '';
    }
    if (isNotNullOrUndefined(value)) {
      filterValue = value.toLowerCase();
    }
    var res: any = this.cusIndexService.exclusionCompData.value;
    var compData = res.map(({ companyName, ticker, stockKey }: any) => ({
      name: companyName,
      ticker: ticker,
      stockKey: stockKey,
    }));
    var fData: any = [];
    if (isNotNullOrUndefined(filterValue)) {
      if (this.showRemComp) {
        var dt: any = [...compData].filter(
          this.remcomparer(this.cusIndexService.remCompData.value)
        );
        fData = [...dt];
      } else {
        fData = [...compData];
      }
      var rtnData: any = [...fData].filter(
        (res: any) =>
          res['name'].toLowerCase().includes(filterValue) ||
          res['ticker'].toLowerCase().includes(filterValue)
      );
      this.companydataSource = new MatTableDataSource<any>(rtnData);
    } else {
      var defaultData: any = compData.sort(function (x: any, y: any) {
        return d3.ascending(
          escape(x.name.toUpperCase()),
          escape(y.name.toUpperCase())
        );
      });
      //console.log('sortProductsAsc',defaultData)
      this.companydataSource = new MatTableDataSource<any>(defaultData);
    }
    this.onSort();
  }

  al(ev: any) { }

  ngOnInit() {
    var that = this;
    var getSortMasterData: any = this.sharedData.getSortMasterData
      .subscribe((res: any) => { this.FilterList = this.sharedData.getSortDropdownlist('L', 'ci'); });
    this.subscriptions.add(getSortMasterData);

    var getSortSettingData: any = this.sharedData.getSortSettingData.subscribe((res: any) => {
      var dt: any = this.sharedData.getSortDropdownlist('L', 'ci', true);
      this.SelFilter = (isNotNullOrUndefined(dt['SelFilter'])) ? dt['SelFilter'] : 1;
      this.ascending_val = (isNotNullOrUndefined(dt['ascending_val'])) ? dt['ascending_val'] : true;
      if (this.sharedData.resetDefalutSortTrig) {
        this.onSort();
        setTimeout(() => { that.sharedData.resetDefalutSortTrig = false; }, 100);
      }
    });
    this.subscriptions.add(getSortSettingData);

    var exclusionCompData = that.cusIndexService.exclusionCompData.subscribe(
      (res: any) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          var compData = res.map(({ companyName, ticker, stockKey }: any) => ({
            name: isNotNullOrUndefined(companyName) ? companyName : '',
            ticker: isNotNullOrUndefined(ticker) ? ticker : '',
            stockKey: isNotNullOrUndefined(stockKey) ? stockKey : '',
          }));
          this.loadSectorData(this.selectedGics);
          this.loadAlphaData();
          var defaultData: any = compData.sort(function (x: any, y: any) {
            return d3.ascending(
              escape(x.name.toUpperCase()),
              escape(y.name.toUpperCase())
            );
          });
          //console.log('sortProductsAsc',defaultData)
          this.companydataSource = new MatTableDataSource<any>(defaultData);
        } else {
          this.companydataSource = new MatTableDataSource<any>(empty_DATA);
          this.GicsdataSource = new MatTableDataSource<any>(empty_DATA);
        }
        this.getExclComp();
      }
    );
    this.subscriptions.add(exclusionCompData);
    this.sharedData.showMatLoader.subscribe((data) => {
      if (!data) {
        this.showSpinnerAcc_settings = false;
      }
    });
    var move_defaultAccount = that.cusIndexService.errorList_custom.subscribe(
      (res: any) => {
        if (isNotNullOrUndefined(res)) {
          that.checkErrorAction(res);
        }
      }
    );
    that.subscriptions.add(move_defaultAccount);

    var bldIndAccountData = that.cusIndexService.bldIndAccountData.subscribe(
      (res: any) => {
        this.bldIndAccData = res;
      }
    );
    that.subscriptions.add(bldIndAccountData);

    var updateBtnTrigger = that.cusIndexService.updateBtnTrigger.subscribe(
      (res: any) => {
        if (res) {
          that.cusIndexService.updateBtnTrigger.next(false);
          this.leftMenuClick('Alpha');
        }
      }
    );
    that.subscriptions.add(updateBtnTrigger);

    var checkStgyAlreadyTraded = that.cusIndexService.checkStgyAlreadyTraded.subscribe((res: any) => {
      this.checkStgyAlreadyTraded = res;
      if (res) {
        this.loadAlphaData();
        this.loadFactor(this.cusIndexService.factorMasterData.value);
      }
      });
    that.subscriptions.add(checkStgyAlreadyTraded);

    var applyTrigger = that.cusIndexService.applyTrigger.subscribe((res: any) => { if (res) { this.getExclComp(); } })
    that.subscriptions.add(applyTrigger);

    var alphaFactorChangeDetection = that.cusIndexService.alphaFactorChangeDetection.subscribe((res: any) => {
        if (
          isNotNullOrUndefined(res['flag']) &&
          isNotNullOrUndefined(res['type']) &&
          res['flag'] &&
          res['type'] == 'C'
        ) {
          this.cusIndexService.alphaFactorChangeDetection.next({
            type: '',
            flag: false,
          });
          if (isNotNullOrUndefined(res['reset']) && res['reset']) {
            this.alphaReset();
          } else {
            var fD: any =
              this.cusIndexService.PostStrategyFactorsData.value.filter(
                (x: any) => x.factorid == 18
              );
            if (fD.length > 0) {
              if (fD[0]['perorval'] == 1) {
                var dmax: any = d3.max([fD[0]['startval'], fD[0]['endval']]);
                var dmin: any = d3.min([fD[0]['startval'], fD[0]['endval']]);
                this.alphaFactorData.endval = dmax;
                this.alphaFactorData.startval = dmin;
              } else {
                this.alphaFactorData.startval = fD[0]['startval'];
                this.alphaFactorData.endval = 100;
              }
            }
          }
          //console.log(this.alphaFactorData)
          setTimeout(() => {
            that.alphaApplyBtn = false;
          }, 1000);
        }
      });
    that.subscriptions.add(alphaFactorChangeDetection);

    var factorChangeDetection = that.cusIndexService.factorChangeDetection.subscribe((res: any) => {
        var d: any = that.cusIndexService.custSelectFactor.value;
        var factorId: any = isNotNullOrUndefined(d['id']) ? d['id'] : 0;
        setTimeout(
          function () {
            that.openFactorLoader = false;
          }.bind(this),
          500
        );
        if (
          isNotNullOrUndefined(res['flag']) &&
          isNotNullOrUndefined(res['type']) &&
          res['flag'] &&
          res['type'] == 'C' &&
          factorId > 0
        ) {
          this.cusIndexService.factorChangeDetection.next({
            type: '',
            flag: false,
          });
          if (isNotNullOrUndefined(res['reset']) && res['reset']) {
            var mIndex: number = this.factorMenu.findIndex(
              (a: any) => a.menu == d['category']
            );
            var subIndex: number = -1;
            if (mIndex > -1) {
              subIndex = this.factorMenu[mIndex]['subMenu'].findIndex(
                (a: any) => a.id == factorId
              );
            }
            if (subIndex > -1) {
              this.factorReset(this.factorMenu[mIndex]['subMenu'][subIndex]);
            }
          } else {
            var fD: any =
              this.cusIndexService.PostStrategyFactorsData.value.filter(
                (x: any) => x.factorid == factorId
              );
            var mIndex: number = this.factorMenu.findIndex(
              (a: any) => a.menu == d['category']
            );
            var subIndex: number = -1;
            if (mIndex > -1) {
              subIndex = this.factorMenu[mIndex]['subMenu'].findIndex(
                (a: any) => a.id == factorId
              );
            }
            if (fD.length > 0 && subIndex > -1) {
              if (fD[0]['perorval'] == 1) {
                var dmax: any = d3.max([fD[0]['startval'], fD[0]['endval']]);
                var dmin: any = d3.min([fD[0]['startval'], fD[0]['endval']]);
                this.factorMenu[mIndex]['subMenu'][subIndex]['data'][
                  'startval'
                ] = dmin;
                this.factorMenu[mIndex]['subMenu'][subIndex]['data']['endval'] =
                  dmax;
              } else {
                this.factorMenu[mIndex]['subMenu'][subIndex]['data'][
                  'startval'
                ] = fD[0]['startval'];
                this.factorMenu[mIndex]['subMenu'][subIndex]['data']['endval'] =
                  fD[0]['endval'];
              }
              setTimeout(() => {
                that.factorMenu[mIndex]['subMenu'][subIndex]['data'][
                  'factErrorStart'
                ] = false;
                that.factorMenu[mIndex]['subMenu'][subIndex]['data'][
                  'factErrorEnd'
                ] = false;
                that.factorMenu[mIndex]['subMenu'][subIndex]['data'][
                  'showApplyBtn'
                ] = false;
              }, 50);
            }
          }
        }
      });
    that.subscriptions.add(factorChangeDetection);

    var calculateTrigger = that.cusIndexService.calculateTrigger.subscribe(
      (res: any) => {
        if (res) {
          this.cusIndexService.calculateTrigger.next(false);
          this.builIndexCalculate();
        }
      }
    );
    that.subscriptions.add(calculateTrigger);

    var remCompData = that.cusIndexService.remCompData.subscribe((res: any) => {
      this.remCompData = [...res];
    });
    that.subscriptions.add(remCompData);

    var remGicsData = that.cusIndexService.remGicsData.subscribe((res: any) => {
      this.remGicsData = [...res];
    });
    that.subscriptions.add(remGicsData);

    var custToolSelectByValue =
      that.cusIndexService.custToolSelectByValue.subscribe((res: number) => {
        this.custToolSelectByValue = res;
      });
    that.subscriptions.add(custToolSelectByValue);

    var custToolWeightByValue =
      that.cusIndexService.custToolWeightByValue.subscribe((res: number) => {
        this.custToolWeightByValue = res;
      });
    that.subscriptions.add(custToolWeightByValue);

    var custToolCashTarget = that.cusIndexService.custToolCashTarget.subscribe(
      (res: number) => {
        this.custToolCashTarget = that.checkCashTarget(res);
      }
    );
    that.subscriptions.add(custToolCashTarget);

    var custToolNoOfComp = that.cusIndexService.custToolNoOfComp.subscribe(
      (res: number) => {
        if (res < this.cusIndexService.minCustInd.count) {
          this.custToolNoOfComp = this.cusIndexService.minCustInd.count;
          this.inbldMyIndselNoCompVal = this.cusIndexService.minCustInd.count;
        } else {
          this.custToolNoOfComp = res;
          this.inbldMyIndselNoCompVal = res;
        }
        that.checkSliderValue();
      }
    );
    that.subscriptions.add(custToolNoOfComp);

    var notifyDiClick = that.cusIndexService.notifyDiClick.subscribe(
      (res: any) => {
        if (res) {
          this.sharedData.showCircleLoader.next(true);
          setTimeout(() => {
            that.showDefault_select = 'Factsheet';
            that.openFactsheet(
              that.cusIndexService.selectedCIIndFactsheet.value
            );
          }, 2000);
        }
      }
    );
    that.subscriptions.add(notifyDiClick);

    var custToolWeightLimit = that.cusIndexService.custToolWeightLimit.subscribe((res: number) => {
        this.custToolWeightLimit = res;
      });
    that.subscriptions.add(custToolWeightLimit);

    var custToolWeightFlag = that.cusIndexService.custToolWeightFlag.subscribe(
      (res: any) => {
        this.custToolWeightFlag = res;
        if (res == 'Y') {
          this.expand_weight_show = true;
        } else {
          this.expand_weight_show = false;
        }
      }
    );
    that.subscriptions.add(custToolWeightFlag);

    var custToolRebalanceType = that.cusIndexService.custToolRebalanceType.subscribe((res: string) => {
        this.custToolRebalanceType = res;
      });
    that.subscriptions.add(custToolRebalanceType);

    var custToolTaxEffAwareness = that.cusIndexService.custToolTaxEffAwareness.subscribe((res: string) => {
        if (res == 'Y') {
          this.custToolTaxEffAwareness = true;
          this.exclude_tax = true;
        } else {
          this.custToolTaxEffAwareness = false;
          this.exclude_tax = false;
        }
        this.isAccountAccor = this.exclude_tax;
      });
    that.subscriptions.add(custToolTaxEffAwareness);

    var unSubWeightLimit = this.cusIndexService.bldMyIndselWeightLimit.subscribe((weight) => {
      if (isNullOrUndefined(weight) || weight == 0) { that.bldMyIndselNoCompWeight = 0; };
      });
    that.subscriptions.add(unSubWeightLimit);

    var refreshAlreadytradedStrategy = that.sharedData.refreshAlreadytradedStrategy.subscribe((x) => {
      if (x) {
        var stgy: any = this.cusIndexService.currentSList.value;
        this.cusIndexService.GetStrategyAccount(stgy['id']).then((res) => { this.GetAccount(); });
      }
      });
    this.cusIndexService.BuildMyIndexOptions.sort((a: any, b: any) => {
      if (a.SortNo < b.SortNo) {
        return -1;
      } else if (a.SortNo > b.SortNo) {
        return 1;
      } else {
        return 0;
      }
    });
    this.selectionSorting = this.cusIndexService.BuildMyIndexOptions;
    this.subscriptions.add(refreshAlreadytradedStrategy);
    this.loadAlphaInit();
    this.GetAccount();
  }
  ngAfterViewInit() {
    $('.dropdown-menu-right').click(function (event: any) {
      event.stopPropagation();
    });
  }
  loadAlphaInit() {
    var stgy: any = this.cusIndexService.currentSList.value;
    if (isNotNullOrUndefined(stgy)) {
      if (isNotNullOrUndefined(stgy['assetId'])) {
        this.alphaFactorData.slid = stgy['id'];
      }
      if (isNotNullOrUndefined(stgy['id'])) {
        this.alphaFactorData.assetid = stgy['assetId'];
      }
    }
  }

  checkClearFact() {
    var value: boolean = false;
    var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
    var f_18 = factDt.findIndex((x: any) => x.factorid != 18);
    if (f_18 > -1) {
      value = true;
    }
    return value;
  }

  ClearERFFact() {
    this.alphaReset();
  }

  //filter alpha start
  subMenufactorData: any;
  storefactorData(d: any) {
    this.subMenufactorData = d;
  }
  openfactorswitch() {
    var that = this;
    if (
      isNotNullOrUndefined(this.subMenufactorData) &&
      isNotNullOrUndefined(this.subMenufactorData['factorid']) &&
      this.subMenufactorData['factorid'] == 18
    ) {
      var ALperorval: number = this.subMenufactorData['perorval'] == 0 ? 1 : 0;
      this.alphaFactorData['perorval'] = ALperorval;
      that.alphaTog({ value: ALperorval });
    } else if (
      isNotNullOrUndefined(this.subMenufactorData) &&
      isNotNullOrUndefined(this.subMenufactorData['id'])
    ) {
      var factDt: any = that.cusIndexService.PostStrategyFactorsData.value;
      var factIndex = factDt.filter(
        (x: any) => x.factorid == this.subMenufactorData['id']
      );
      if (factIndex.length > 0) {
        var fD: any = this.cusIndexService.factorMasterData.value.filter(
          (x: any) => x.id == this.subMenufactorData.id
        );
        var mIndex: number = this.factorMenu.findIndex(
          (a: any) => a.menu == fD[0]['category']
        );
        var subIndex: number = -1;
        if (mIndex > -1) {
          subIndex = this.factorMenu[mIndex]['subMenu'].findIndex(
            (a: any) => a.id == this.subMenufactorData.id
          );
          var perorval: number =
            this.subMenufactorData['data']['perorval'] == 0 ? 1 : 0;
          that.factorMenu[mIndex]['subMenu'][subIndex]['data']['perorval'] =
            perorval;
          that.factorTog(
            { value: perorval },
            that.factorMenu[mIndex]['subMenu'][subIndex]
          );
        }
      }
    } else {
    }
    this.subMenufactorData = undefined;
  }
  alphaTog(e: any) {
    var that = this;
    if (isNotNullOrUndefined(e.value) && e.value == 1) {
      this.cusIndexService.tempFactorSwitch = e.value;
      var data = that.cusIndexService.exclusionCompData.value;
      var dmin: any = d3.min(data.map((x: any) => x.scores));
      var dmax: any = d3.max(data.map((x: any) => x.scores));
      this.alphaFactorData.startval = dmin;
      this.alphaFactorData.endval = dmax;
      var stepsArray: any = data
        .filter((u: any) => isNotNullOrUndefined(u.scores))
        .map(({ scores }: any) => ({ value: scores }))
        .sort(function (x: any, y: any) {
          return d3.descending(x.value, y.value);
        });
      this.dragoptions = {
        stepsArray: stepsArray,
        floor: dmax,
        ceil: dmin,
        noSwitching: true,
        minRange: 0.1,
        disabled: this.checkStgyAlreadyTraded,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            default:
              return parseFloat(d3.format('.2f')(value * 100)) + '%';
          }
        },
      };
    } else {
      this.cusIndexService.tempFactorSwitch = e.value;
      this.dragoptions = {
        floor: 0,
        ceil: 100,
        noSwitching: true,
        minRange: 2,
        disabled: this.checkStgyAlreadyTraded,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            default:
              return value + '%';
          }
        },
      };
      this.alphaFactorData.startval = 0;
      this.alphaFactorData.endval = 100;
    }

    var factDt: any[] = that.cusIndexService.PostStrategyFactorsData.value;
    var f_18 = factDt.findIndex((x: any) => x.factorid == 18);
    if (f_18 > -1) {
      factDt.splice(f_18, 1);
      that.cusIndexService.PostStrategyFactorsData.next(factDt);
    } else {
    }
    this.cusIndexService.applyTrigger.next(true);
    this.cusIndexService.alphaFactorChangeDetection.next({
      type: 'P',
      flag: true,
    });
    var tab: string = e.value == 1 ? 'val' : 'percent';
    this.sharedData.userEventTrack(
      'Tool Customization',
      tab,
      tab,
      'Alpha Perorval Toggle Click'
    );
    setTimeout(() => {
      that.alphaApplyBtn = false;
    }, 50);
  }

  alphaReset() {
    var that = this;
    this.cusIndexService.tempFactorSwitch = 0;
    this.alphaFactorData.startval = 0;
    this.alphaFactorData.endval = 100;
    this.alphaFactorData.perorval = 0;
    this.dragoptions = {
      floor: 0,
      noSwitching: true,
      ceil: 100,
      minRange: 2,
      disabled: this.checkStgyAlreadyTraded,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          default:
            return value + '%';
        }
      },
    };
    var factDt: any[] = that.cusIndexService.PostStrategyFactorsData.value;
    var f_18 = factDt.findIndex((x: any) => x.factorid == 18);
    if (f_18 > -1) {
      factDt.splice(f_18, 1);
      that.cusIndexService.PostStrategyFactorsData.next(factDt);
      this.cusIndexService.applyTrigger.next(true);
      this.cusIndexService.alphaFactorChangeDetection.next({
        type: 'P',
        flag: true,
      });
    } else {
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Alpha Factor',
      'Reset',
      'Alpha Reset Click'
    );
    setTimeout(() => {
      that.alphaApplyBtn = false;
    }, 50);
  }

  loadAlphaData() {
    var that = this;
    var factor = this.cusIndexService.factorMasterData.value;
    var f_18 = factor.filter((x: any) => x.id == 18);
    if (f_18.length > 0) {
      this.alphaFactorData.name = f_18[0]['name'];
      this.alphaFactorData.displayname = f_18[0]['displayname'];
    }
    var data = that.cusIndexService.exclusionCompData.value;
    var dmin: any = d3.min(data.map((x: any) => x.scores));
    var dmax: any = d3.max(data.map((x: any) => x.scores));
    this.alphaFactorData.orgBottomValue = dmax;
    this.alphaFactorData.orgTopValue = dmin;

    var factData = this.cusIndexService.PostStrategyFactorsData.value;
    var factor = factData.filter((x: any) => x.factorid == 18);
    if (factor.length > 0) {
      this.alphaFactorData.perorval = factor[0]['perorval'];
      this.cusIndexService.tempFactorSwitch = factor[0]['perorval'];
      if (
        isNotNullOrUndefined(factor[0]['perorval']) &&
        factor[0]['perorval'] == 1
      ) {
        var ddmin: any = d3.min([factor[0]['startval'], factor[0]['endval']]);
        var ddmax: any = d3.max([factor[0]['startval'], factor[0]['endval']]);
        this.alphaFactorData.startval = ddmin;
        this.alphaFactorData.endval = ddmax;
        var stepsArray: any = data
          .filter((u: any) => isNotNullOrUndefined(u.scores))
          .map(({ scores }: any) => ({ value: scores }))
          .sort(function (x: any, y: any) {
            return d3.descending(x.value, y.value);
          });
        this.dragoptions = {
          stepsArray: stepsArray,
          floor: dmax,
          ceil: dmin,
          noSwitching: true,
          minRange: 0.1,
          disabled: this.checkStgyAlreadyTraded,
          translate: (value: number, label: LabelType): string => {
            switch (label) {
              default:
                return parseFloat(d3.format('.2f')(value * 100)) + '%';
            }
          },
        };
      } else {
        this.dragoptions = {
          floor: 0,
          ceil: 100,
          noSwitching: true,
          minRange: 2,
          disabled: this.checkStgyAlreadyTraded,
          translate: (value: number, label: LabelType): string => {
            return value + '%';
          },
        };
        this.alphaFactorData.startval = factor[0]['startval'];
        this.alphaFactorData.endval = 100;
      }
    }
    setTimeout(() => {
      that.alphaApplyBtn = false;
    }, 50);
  }

  //filter alpha end

  filterChange(ev: any) {
    this.companySearch.reset();
  }

  checkbildError(val: any, type: any) {
    if (type == 'slide' && this.bldMyIndcheck) {
      if (
        isNullOrUndefined(val) ||
        val < this.cusIndexService.minCustInd.count
      ) {
        return true;
      } else {
        return false;
      }
    } else if (
      this.bldMyIndcheck &&
      (isNullOrUndefined(val) || parseInt(val) == 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  changecashTarget() {
    this.cusIndexService.custToolCashTarget.next(this.custToolCashTarget);
  }
  // exclude_multiple_G: boolean = true;
  onToggleExclude(event: any) {
    var check = event.checked;
    if (this.checkApplyBtn) {
      this.applyFilter();
    }
    if (check == true) {
      this.exclude_multiple_G = true;
    } else {
      this.exclude_multiple_G = false;
    }
  }
  resetCircleScore() {
    if (
      this.cusIndexService.custToolSelectByValue.value == 1 ||
      this.cusIndexService.custToolWeightByValue.value == 1
    ) {
      return true;
    } else {
      return false;
    }
  }
  leaveGics() {
    var gs = d3.select('#excluCircle_main #exclugCompetitiveRect');
    gs.selectAll('.gfillCompMouseover').remove();
  }
  companyleave(val: any) {
    var gs = d3.select('#excluCircle_main #exclugCompetitiveRect');
    gs.selectAll('.gfillCompMouseover').remove();
  }
  //reSetSortData(data: any) {
  //  var that = this;
  //  data = data.map((a: any) => ({ ...a }));
  //  if (data.length > 0) {
  //    if (this._bldMyIndEnable) {
  //      if (this.bldMyIndSelByVal.value == 2) {
  //        let TotWt = d3.sum(data.map(function (d: any) { return (d.marketCap); }));
  //        data.forEach(function (d: any) { d.mWt = ((d.marketCap) / TotWt) * 100; return d; });
  //        data.sort(function (x: any, y: any) { return d3.descending((parseFloat(x.mWt)), (parseFloat(y.mWt))); });
  //      } else { data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); }); }
  //    } else { data = that.sharedData.CompFilterList([...data]); };
  //    if (this.bldMyIndselNoCompVal.value == null || this.bldMyIndselNoCompVal.value == undefined) {
  //      data = [...data];
  //    }
  //    else {
  //      if (this._bldMyIndEnable) { data = [...data].filter((x, i) => i < this.bldMyIndselNoCompVal.value); };
  //    };
  //    var len = data.length;
  //    data.forEach(function (d: any, i: any) { d.cx = ((i * 360 / len) - 90); return d; });
  //    return [...data];
  //  } else { return [...data]; };
  //}

  companyenter(val: any) {
    var that = this;

    var gs = d3.select('#excluCircle_main #exclugCompetitiveRect');
    var x = this.cusIndexService.getExclCompData().then((d) => {
      var data: any = this.cusIndexService.exclusionCompData.value;
      if (!that.resetCircleScore()) {
        data.sort(function (x: any, y: any) {
          return d3.descending(x.marketCap, y.marketCap);
        });
      } else {
        data.sort(function (x: any, y: any) {
          return d3.ascending(parseFloat(x.score), parseFloat(y.score));
        });
      }

      data.forEach(function (d: any, i: any) {
        d.cx = (i * 360) / data.length - 90;
        return d;
      });
      data = data.filter(this.comparer(d));
      var findIndex = [...data].filter((x) => x.stockKey == val.stockKey)[0];
      this.gfillCompMouseover_exclu(gs, findIndex, data, '');
    });
  }
  checkNewSort(dta: any) {
    var that = this;
    var data = dta.map((a: any) => ({ ...a }));
    if (this.resetCircleScore()) {
      data = data.filter(
        (x: any) => isNotNullOrUndefined(x.scores) && x.scores > 0
      );
      data = [...data].sort(function (x, y) {
        return d3.ascending(x.scores, y.scores);
      });
    } else {
      data = [...data].sort(function (x, y) {
        return d3.descending(x.marketCap, y.marketCap);
      });
    }
    data.forEach(function (d: any, i: any) {
      d.cx = (i * 360) / data.length - 90;
      return d;
    });
    return [...data];
  }
  gfillCompMouseover_exclu(gs: any, d: any, dta: any, ev: any) {
    var that = this;
    dta = this.checkNewSort([...dta]);
    dta.forEach(function (d: any, i: any) {
      d.cx = (i * 360) / dta.length - 90;
      return d;
    });
    gs.selectAll('.gfillCompMouseover').remove();
    var ggs = gs
      .append('g')
      .attr('class', 'gfillCompMouseover')
      .style('cursor', 'pointer')
      .style('font-size', '9px')
      .style('font-family', 'var(--ff-medium)')
      .attr('transform', function () {
        if (d.cx <= 90) {
          return 'rotate(' + (d.cx + 1.0) + ')';
        } else {
          return 'rotate(' + (d.cx - 1.0) + ')';
        }
      });
    //d3.select(ev).raise();
    ggs
      .append('text')
      .attr('x', that.cusIndexService.txtx1(d))
      .attr('id', 'gcStxt')
      .style('display', function () {
        return that.resetCircleScore() ? 'block' : 'none';
      })
      .style('visibility', function () {
        return that.resetCircleScore() ? 'visible' : 'hidden';
      })
      .style('fill', function () {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) {
          return 'var(--leftSideText)';
        } else {
          return 'var(--leftSideText)';
        }
      })
      .attr('transform', function (): any {
        if (d.cx > 90) {
          return 'rotate(180)';
        }
      })
      .style('text-anchor', that.cusIndexService.txtanch(d))
      .attr('class', function () {
        return that.cusIndexService.HFCompanyTxt(d) + ' avbold';
      })
      .text(function () {
        return d3.format(',.1f')(d.scores * 100) + '%';
      });

    ggs
      .append('text')
      .attr('x', that.cusIndexService.txtx(d))
      .style('fill', function () {
        if (dta.filter((x: any) => x.isin == d.isin).length == 0) {
          return '#1d397b';
        } else {
          return 'var(--leftSideText-B)';
        }
      })
      .attr('transform', function (): any {
        if (d.cx > 90) {
          return 'rotate(180)';
        }
      })
      .style('text-anchor', that.cusIndexService.txtanch(d))
      .attr('class', function () {
        return that.cusIndexService.HFCompanyTxt(d);
      })
      .text(function () {
        var cname: string = isNotNullOrUndefined(d.companyName)
          ? d.companyName
          : '';
        if (d.cx > 90) {
          let txt = '' + cname.trim() + '...';
          let resvtxt = '';
          var cnt = txt.length;
          var rsvcnt = resvtxt.length;
          var tolen = 15 - rsvcnt;
          var dottxt = '';
          if (txt.length > 15) {
            dottxt = '...';
          }
          return cname.slice(0, tolen < 0 ? 1 : tolen).trim() + dottxt;
        } else {
          let txt = cname.trim() + '...';
          let resvtxt1 = '';
          var cnt = txt.length;
          var rsvcnt1 = resvtxt1.length;
          var tolen = 15 - rsvcnt1;
          var dottxt = '';
          if (txt.length > 15) {
            dottxt = '...';
          }
          return cname.slice(0, tolen < 0 ? 1 : tolen).trim() + dottxt;
        }
      });
  }
  enterGics(val: any) {
    var that = this;
    var gs = d3.select('#excluCircle_main #exclugCompetitiveRect');
    this.cusIndexService.getExclCompData().then((da) => {
      var data: any = this.cusIndexService.exclusionCompData.value;
      if (!that.resetCircleScore()) {
        let TotWt = d3.sum(
          data.map(function (d: any) {
            return d.marketCap;
          })
        );
        data.forEach(function (d: any) {
          d.mWt = (d.marketCap / TotWt) * 100;
          return d;
        });
        data.sort(function (x: any, y: any) {
          return d3.descending(parseFloat(x.mWt), parseFloat(y.mWt));
        });
      } else {
        data.sort(function (x: any, y: any) {
          return d3.ascending(parseFloat(x.score), parseFloat(y.score));
        });
      }
      // data = that.cusIndexService.reSetSortData([...data]);
      data = data.map((a: any) => ({ ...a }));
      data.forEach(function (d: any, i: any) {
        d.cx = (i * 360) / [...data].length - 90;
        return d;
      });
      var matchedCompanies1 = data.filter((d: any) =>
        d.industry.toString().startsWith(val.code.toString())
      );

      //var matchedCompanies = [...data].filter(d => d.industry.indexOf(val.code) == 0);
      matchedCompanies1 = matchedCompanies1.filter(this.comparer(da));
      matchedCompanies1.forEach(function (value: any) {
        that.gfillCompMouseover_ex_gics(gs, value, matchedCompanies1);
      });
    });
  }
  gfillCompMouseover_ex_gics(gs: any, d: any, dta: any) {
    var that = this;
    /* gs.selectAll(".gfillCompMouseover").remove();*/
    var checkdata = dta.filter(
      (match: any) => match.companyName == d.companyName
    );
    if (checkdata.length > 0) {
      var ggs = gs
        .append('g')
        .attr('class', 'gfillCompMouseover')
        .style('cursor', 'pointer')
        .style('font-size', '9px')
        .style('font-family', 'var(--ff-medium)')
        .attr('transform', function () {
          if (d.cx <= 90) {
            return 'rotate(' + (d.cx + 1.0) + ')';
          } else {
            return 'rotate(' + (d.cx - 1.0) + ')';
          }
        });
      //d3.select(ev).raise();
      ggs
        .append('text')
        .attr('x', that.cusIndexService.txtx1(d))
        .attr('id', 'gcStxt')
        .style('display', function () {
          return that.resetCircleScore() ? 'block' : 'none';
        })
        .style('visibility', function () {
          return that.resetCircleScore() ? 'visible' : 'hidden';
        })
        .style('fill', function () {
          if (dta.filter((x: any) => x.isin == d.isin).length == 0) {
            return 'var(--leftSideText)';
          } else {
            return 'var(--leftSideText)';
          }
        })
        .attr('transform', function (): any {
          if (d.cx > 90) {
            return 'rotate(180)';
          }
        })
        .style('text-anchor', that.cusIndexService.txtanch(d))
        .attr('class', function () {
          return that.cusIndexService.HFCompanyTxt(d) + ' avbold';
        })
        .text(function () {
          return d3.format(',.1f')(d.scores * 100) + '%';
        });

      ggs
        .append('text')
        .attr('x', that.cusIndexService.txtx(d))
        .style('fill', function () {
          if (dta.filter((x: any) => x.isin == d.isin).length == 0) {
            return '#1d397b';
          } else {
            return 'var(--leftSideText-B)';
          }
        })
        .attr('transform', function (): any {
          if (d.cx > 90) {
            return 'rotate(180)';
          }
        })
        .style('text-anchor', that.cusIndexService.txtanch(d))
        .attr('class', function () {
          return that.cusIndexService.HFCompanyTxt(d);
        })
        .text(function () {
          var cname: string = isNotNullOrUndefined(d.companyName)
            ? d.companyName
            : '';
          if (d.cx > 90) {
            let txt = '' + cname.trim() + '...';
            let resvtxt = '';
            var cnt = txt.length;
            var rsvcnt = resvtxt.length;
            var tolen = 15 - rsvcnt;
            var dottxt = '';
            if (txt.length > 15) {
              dottxt = '...';
            }
            return cname.slice(0, tolen < 0 ? 1 : tolen).trim() + dottxt;
          } else {
            let txt = cname.trim() + '...';
            let resvtxt1 = '';
            var cnt = txt.length;
            var rsvcnt1 = resvtxt1.length;
            var tolen = 15 - rsvcnt1;
            var dottxt = '';
            if (txt.length > 15) {
              dottxt = '...';
            }
            return cname.slice(0, tolen < 0 ? 1 : tolen).trim() + dottxt;
          }
        });
    }
  }
  comparer(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return other.stockKey == current.stockKey;
        }).length > 0
      );
    };
  }

  @Output() selectedTab: EventEmitter<string> = new EventEmitter<any>();
  leftMenuClick(d: any) {
    var that = this;
    /*** Close center loader **/
    if (that.cusIndexService._showReviewIndexLoaded) { that.closeFactsheet(); };
    this.accSearchText = '';
    that.sharedData.showCenterLoader.next(true);
    that.companySearch.reset();
    if (
      that.sharedData.checkMenuPer(3, 93) == 'D' ||
      that.sharedData.checkMenuPer(3, 93) == 'N' ||
      that.sharedData.checkMenuPer(3, 177) == 'D' ||
      that.sharedData.checkMenuPer(3, 177) == 'N'
    ) {
      that.showDefault_select = d;
    }
    if (d != 'Alpha') {
      if (that.showDefault_select != 'Alpha') {
        that.sharedData.showCenterLoader.next(false);
      }
    } else {
      if (that.showDefault_select == 'Alpha') {
        that.sharedData.showCenterLoader.next(false);
      } else if (that.showDefault_select == '' && d=='Alpha') {
        that.sharedData.showCenterLoader.next(false);
      }
    }
    /*** Close center loader **/
    that.showDefault_select = d;
    that.selectedTab.emit(d);

    if (d != 'Factors') {
      that.factorInit = false;
    }
    if (d != 'Accounts') {
      that.accInit = false;
    }
    that.sharedData.userEventTrack(
      'Tool Customization',
      d,
      d,
      'Tool Customization Left Tab Click'
    );
  }

  //filter company start

  checkFactsheetOpen() {
    if (!this.checkfactDisable(0)) { this.openFactsheet(0) }
    else if (this.bldIndAccData.length > 0) {
      var dat: any = this.bldIndAccData.map((d: any) => !this.checkfactDisable(d.accountId)).findIndex((x: any) => x == true);
      if (isNotNullOrUndefined(dat) && dat > -1) {
        var acc: any = (isNotNullOrUndefined(this.bldIndAccData[dat]['accountId'])) ? this.bldIndAccData[dat]['accountId'] : null;
        if (isNotNullOrUndefined(acc)) { this.openFactsheet(acc) }
      }
    }
  }

  check_a_r_class(item: any) {
    var removeData = [...this.remCompData].filter((x) => x == item.stockKey);
    if (removeData.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  AddComp(d: any) {
    this.checkApplyBtn = true;
    var findIndex = [...this.remCompData].findIndex((x) => x == d.stockKey);
    if (findIndex < 0 || findIndex == -1) {
    } else {
      this.remCompData.splice(findIndex, 1);
      this.cusIndexService.remCompData.next([...this.remCompData]);
    }

    if (this.showRemComp) {
      if (this.remCompData.length > 0) {
        this.showRemComp = !this.showRemComp;
      }
      this.showRemovedComp();
    }
    if (this.exclude_multiple_G == false) {
      this.applyFilter();
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Company',
      d.stockKey,
      'Add company btn Click'
    );
  }

  remComp(d: any) {
    var dta: any = JSON.parse(JSON.stringify(this.remCompData));
    dta.push(d.stockKey);
    var con = this.cusIndexService.checkBelow100Comp(
      this.cusIndexService._exclusionCompData,
      dta,
      this.cusIndexService._remGicsData,
      this.cusIndexService.PostStrategyFactorsData.value
    );
    if (con) {
      this.checkApplyBtn = true;
      this.remCompData.push(d.stockKey);
      this.cusIndexService.remCompData.next([...this.remCompData]);
      if (this.exclude_multiple_G == false) {
        this.applyFilter();
      }
      //if (this.exclude_multiple_G == false) { this.getPerStatData(0); }
    } else {
      this.sharedData.showAlertMsg2(
        '',
        this.cusIndexService.minCustInd.message
      );
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Company',
      d.stockKey,
      'Remove company btn Click'
    );
  }

  clearFilerAll() {
    this.cusIndexService.remCompData.next([]);
    this.cusIndexService.remGicsData.next([]);
    this.checkApplyBtn = false;
    this.show_applyGics = false;
    this.showRemComp = true;
    this.showRemovedComp();
    this.cusIndexService.applyTrigger.next(true);
  }

  clearFilter() {
    this.cusIndexService.remCompData.next([]);
    this.companySearch.reset();
    if (
      this.cusIndexService._remCompData == 0 &&
      this.cusIndexService._remGicsData == 0 &&
      this.checkApplyBtn
    ) {
      this.checkApplyBtn = false;
    }
    this.showRemComp = true;
    this.showRemovedComp();
    this.cusIndexService.applyTrigger.next(true);
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Company',
      'Clear Stock',
      'Clear btn Click'
    );
  }

  applyFilter() {
    this.checkApplyBtn = false;
    this.cusIndexService.applyTrigger.next(true);
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Company',
      'Apply Stock',
      'Apply btn Click'
    );
  }

  //filter company end

  alphaval(val: any) {
    this.alphaFactorData['endval'] = parseFloat(val.target.value) / 100;
  }

  perKeyDown(e: any) {
    if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode >= 35 && e.keyCode <= 39) || (/^[0-9]*$/.test(e.key))) { }else { e.preventDefault(); }
  };

  valKeyDown(e: any) {
    var val = e.target?.value;
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) || (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) || (e.keyCode >= 35 && e.keyCode <= 39)) { }    
    else if (e.target?.maxLength <= val.length) { e.preventDefault(); }
  }

  alphaIN(event: any) {
    var regex = /[^0-9]/gi;
    var value = event.target?.value;
    if (isNullOrUndefined(value) || value.trim() == "") { value = 0 }
    value = parseInt(value.replace(regex, ""));
    if (isNullOrUndefined(value) || isNaN(value) || value >= 100) { value = 0 }
    this.alphaFactorData['startval'] = value;
  }

  checkAllError() {
    if (isNullOrUndefined(this.alphaFactorData['startval'])) {
      this.alphaApplyBtn = false;
      return true;
    } else if (this.alphaFactorData['perorval'] == 1) {
      if (
        this.alphaFactorData['startval'] <= this.alphaFactorData['endval'] &&
        this.alphaFactorData['endval'] <= this.alphaFactorData['orgBottomValue']
      ) {
        return false;
      } else {
        this.alphaApplyBtn = false;
        return true;
      }
    } else {
      if (
        this.alphaFactorData['endval'] <= this.alphaFactorData['startval'] ||
        this.alphaFactorData['startval'] < 0
      ) {
        this.alphaApplyBtn = false;
        return true;
      } else {
        return false;
      }
    }
  }

  alphaApply() {
    var that = this;
    var con: boolean = false;
    var applyReset: boolean = false;
    this.alphaApplyBtn = false;
    var switchTabName_P: string = 'percent';
    if (this.alphaFactorData.perorval == 1) {
      switchTabName_P = 'val';
    }
    try {
      con = that.cusIndexService.checkBelow100Comp(
        that.cusIndexService.exclusionCompData.value,
        that.cusIndexService.remCompData.value,
        that.cusIndexService.remGicsData.value,
        that.cusIndexService.getStrFacData(
          18,
          this.alphaFactorData.startval,
          this.alphaFactorData.endval,
          switchTabName_P,
          this.alphaFactorData.orgTopValue,
          this.alphaFactorData.orgBottomValue
        )
      );

      if (
        this.alphaFactorData.perorval == 1 &&
        this.alphaFactorData.startval == this.alphaFactorData.orgTopValue &&
        this.alphaFactorData.endval == this.alphaFactorData.orgBottomValue
      ) {
        applyReset = true;
      } else if (
        this.alphaFactorData.perorval == 0 &&
        this.alphaFactorData.startval == 0 &&
        this.alphaFactorData.endval == 100
      ) {
        applyReset = true;
      }
    } catch (e) {}
    if (applyReset) {
      this.alphaReset();
    } else {
      if (con) {
        var factDt: any[] = JSON.parse(
          JSON.stringify(
            [...that.cusIndexService.PostStrategyFactorsData.value].map(
              (a) => ({ ...a })
            )
          )
        );
        var factData: any = JSON.parse(JSON.stringify(that.alphaFactorData));
        var f_18 = factDt.findIndex((x: any) => x.factorid == 18);
        if (f_18 > -1) {
          factDt[f_18] = factData;
        } else {
          factDt.push(factData);
        }
        that.cusIndexService.PostStrategyFactorsData.next(factDt);
        this.cusIndexService.applyTrigger.next(true);
        this.cusIndexService.alphaFactorChangeDetection.next({
          type: 'P',
          flag: true,
        });
      } else {
        var fD: any = this.cusIndexService.PostStrategyFactorsData.value.filter(
          (x: any) => x.factorid == 18
        );
        if (fD.length > 0) {
          if (fD[0]['perorval'] == 1) {
            var dmax: any = d3.max([fD[0]['startval'], fD[0]['endval']]);
            this.alphaFactorData.startval = dmax;
          } else {
            this.alphaFactorData.startval = fD[0]['startval'];
          }
        } else {
          this.alphaReset();
        }
        that.sharedData.showAlertMsg2(
          '',
          this.cusIndexService.minCustInd.message
        );
      }
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Alpha Factor',
      'Apply',
      'Alpha Apply Click'
    );
  }

  factorMenu: any = [];
  loadFactor(data: any) {
    var that = this;
    this.factorMenu = [];
    var menuData: any = [];
    data = [...data]
      .filter((fu) => fu.id != 18)
      .sort((x, y) => x.sortno - y.sortno);
    var main = [...new Set([...data].map((item) => item.category))];
    main.forEach((res: any) => {
      var subMenu = [...data].filter((fu) => fu.category == res);
      var d = { menu: res, subMenu: subMenu };
      if (that.checkFactorPer(res) == 'Y' || that.checkFactorPer(res) == 'D') {
        menuData.push(d);
      }
    });

    this.cusIndexService.getExclFactorCompData().then((factRes: any) => {
      menuData.forEach((res: any) => {
        if (isNotNullOrUndefined(res['subMenu']) && res['subMenu'].length > 0) {
          var sMenu = [];
          res['subMenu'].forEach((resSubmenu: any, i: number) => {
            sMenu.push(this.buildfactGrp(resSubmenu, [...factRes]));
          });
        }
        var d = { menu: res['menu'], subMenu: sMenu };
        if (that.checkFactorPer(res['menu']) == 'D') {
          d.subMenu = [];
        }
        that.factorMenu.push(d);
      });
    });
  }

  checkFactorPer(d: any) {
    var dta = [...this.cusIndexService._factorMasterData].filter(
      (item) => item.category == d
    );
    if (dta.length > 0) {
      return this.sharedData.checkMenuPer(3, dta[0]['permissionmenuId']);
    } else {
      return 'N';
    }
  }

  factRange(ev: any, d: any, key: string) {
    //var value: any = ev.target.value;
    var regex = /[^0-9]/gi;
    var value = ev.target?.value;
    if (isNullOrUndefined(value) || value.trim() == "") { value = 0 }
    value = parseInt(value.replace(regex, ""));
    if (isNullOrUndefined(value) || isNaN(value) || value >= 100) { if (key == 'startval') { value = 0 } else { value = 100 } };    
    d['data'][key] = 50;
    setTimeout(() => { d['data'][key] = value; }, 5);
    try {
      if (
        (key == 'startval' && +value == d['data']['endval']) ||
        (key == 'endval' && +value == d['data']['startval'])
      ) {
        d['data']['factErrorEnd'] = true;
        d['data']['factErrorStart'] = true;
      } else if (
        (key == 'startval' && 0 <= +value && d['data']['endval'] > +value) ||
        (key == 'endval' && 100 >= +value && d['data']['startval'] < +value)
      ) {
        if (d['data']['startval'] < d['data']['endval']) {
          d['data']['factErrorStart'] = false;
          d['data']['factErrorEnd'] = false;
        } else if (key == 'startval') {
          d['data']['factErrorStart'] = false;
        } else {
          d['data']['factErrorEnd'] = false;
        }
      } else {
        if (d['data']['startval'] < d['data']['endval']) {
          d['data']['factErrorStart'] = false;
          d['data']['factErrorEnd'] = false;
        } else if (key == 'startval') {
          d['data']['factErrorStart'] = true;
        } else {
          d['data']['factErrorEnd'] = true;
        }
      }
    } catch (e) {}
    setTimeout(() => {
      if (
        isNotNullOrUndefined(d) &&
        isNotNullOrUndefined(d['data']) &&
        !d['data']['factErrorStart'] &&
        !d['data']['factErrorEnd']
      ) {
        d['data']['showApplyBtn'] = true;
      } else {
        d['data']['showApplyBtn'] = false;
      }
    }, 50);
  }

  factval(ev: any, d: any, key: string) {
    var that = this;
    var value: any =
      isNullOrUndefined(ev.target.value) || ev.target.value == ''
        ? null
        : ev.target.value;
    var data: any = d['data']['stepsArray']
      .map((x: any) => x.value)
      .sort(function (x: any, y: any) {
        return d3.descending(x, y);
      });
    var checkVal: any = Math.sign(value);
    if ((checkVal == -1 || checkVal == 0 || checkVal == 1) && isNotNullOrUndefined(value)) {
      try {
        if (
          (key == 'startval' &&
            that.factPval(d, data[data.length - 1]) <= +value &&
            that.factPval(d, d['data']['endval']) > +value) ||
          (key == 'endval' &&
            that.factPval(d, data[0]) >= +value &&
            that.factPval(d, d['data']['startval']) < +value)
        ) {
          var fDt: any = data.filter((x: any) => that.factPval(d, x) >= +value);

          if (fDt.length > 0) {
            d['data'][key] = 0;
            setTimeout(() => { d['data'][key] = fDt[fDt.length - 1]; },50)
            if (key == 'startval') {
              d['data']['factErrorStart'] = false;
            } else {
              d['data']['factErrorEnd'] = false;
            }
            if (
              (key == 'startval' &&
                that.factPval(d, d['data'][key]) ==
                  that.factPval(d, d['data']['endval'])) ||
              (key == 'endval' &&
                that.factPval(d, d['data'][key]) ==
                  that.factPval(d, d['data']['startval']))
            ) {
              d['data']['factErrorStart'] = true;
              d['data']['factErrorEnd'] = true;
            } else {
              d['data']['factErrorStart'] = false;
              d['data']['factErrorEnd'] = false;
            }
            try {
              if (key == 'startval') {
                var id: string = '#factED' + d['id'];
                var valu: any = $(id).val();
                if (isNullOrUndefined(valu) || valu == '') {
                  d['data']['factErrorEnd'] = true;
                }
              } else {
                var id: string = '#factST' + d['id'];
                var valu1: any = $(id).val();
                if (isNullOrUndefined(valu1) || valu1 == '') {
                  d['data']['factErrorStart'] = true;
                }
              }
            } catch (e) {}
          } else {
            if (key == 'startval') {
              d['data']['factErrorStart'] = true;
            } else {
              d['data']['factErrorEnd'] = true;
            }
          }
        } else {
          if (key == 'startval') {
            d['data']['factErrorStart'] = true;
          } else {
            d['data']['factErrorEnd'] = true;
          }
        }
      } catch (e) {}
    } else {
      if (key == 'startval') {
        d['data']['factErrorStart'] = true;
      } else {
        d['data']['factErrorEnd'] = true;
      }
    }
   
    setTimeout(() => {
      if (
        isNotNullOrUndefined(d) &&
        isNotNullOrUndefined(d['data']) &&
        !d['data']['factErrorStart'] &&
        !d['data']['factErrorEnd']
      ) {
        d['data']['showApplyBtn'] = true;
      } else {
        d['data']['showApplyBtn'] = false;
      }
    }, 50);
  }

  factPval(d: any, value: any) {
    if (
      d['id'] == 19 ||
      d['id'] == 10 ||
      d['id'] == 4 ||
      d['id'] == 9 ||
      d['id'] == 1
    ) {
      value = +value;
    } else if (d['id'] == 17) {
      return value * 1000000;
    } else if (
      d['id'] == 12 ||
      d['id'] == 2 ||
      d['id'] == 7 ||
      d['id'] == 5 ||
      d['id'] == 8 ||
      d['id'] == 15 ||
      d['id'] == 20 ||
      d['id'] == 14 ||
      d['id'] == 13 ||
      d['id'] == 6 ||
      d['id'] == 21
    ) {
      value = +value * 100;
    }
    return value;
  }

  factorClearAll() {
    var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
    var f_18 = factDt.filter((x: any) => x.factorid == 18);
    if (f_18.length > 0) {
      this.cusIndexService.PostStrategyFactorsData.next(f_18);
    } else {
      this.cusIndexService.PostStrategyFactorsData.next([]);
    }
    this.cusIndexService.custSelectFactor.next(undefined);
    this.loadFactor(this.cusIndexService.factorMasterData.value);
    this.cusIndexService.applyTrigger.next(true);
  }

  factSliderFormat(factorId: number, value: any) {
    if (isNotNullOrUndefined(value)) {
      var factorValue: any = +value;
      if (factorId == 12) {
        return format(',.2f')(factorValue * 100);
      } else if (
        factorId == 19 ||
        factorId == 10 ||
        factorId == 4 ||
        factorId == 9 ||
        factorId == 1
      ) {
        return this.sharedData.numberWithCommas(factorValue.toFixed(2));
      } else if (factorId == 17) {
        let ActVal = factorValue * 1000000;
        return this.CurrencyFormat(ActVal).toString();
      } else if (
        factorId == 18 ||
        factorId == 2 ||
        factorId == 7 ||
        factorId == 5 ||
        factorId == 8 ||
        factorId == 15 ||
        factorId == 20 ||
        factorId == 14 ||
        factorId == 13 ||
        factorId == 6 ||
        factorId == 21
      ) {
        return (
          this.sharedData.numberWithCommas((factorValue * 100).toFixed(2)) + '%'
        );
      }
    } else {
      return '';
    }
  }

  factorTog(e: any, subData: any) {
    var that = this;
    that.openFactorLoader = true;
    this.cusIndexService.tempFactorSwitch = e.value;
    if (isNotNullOrUndefined(e.value) && e.value == 1) {
      var value: any = subData['data']['stepsArray'].map((x: any) => x.value);
      var dmin: any = d3.min(value);
      var dmax: any = d3.max(value);
      var stepsArray: any = subData['data']['stepsArray'];
      var sliderOption: Options = {
        stepsArray: stepsArray,
        floor: dmax,
        ceil: dmin,
        noSwitching: true,
        minRange: 0.1,
        disabled: this.checkStgyAlreadyTraded,
        translate: (value: number, label: LabelType): string => {
          return that.factSliderFormat(subData['id'], value);
        },
      };
      subData['data'].startval = dmin;
      subData['data'].endval = dmax;
      subData['data'].sliderOption = sliderOption;
    } else {
      var sliderOption0: Options = {
        floor: 0,
        ceil: 100,
        minRange: 2,
        disabled: this.checkStgyAlreadyTraded,
        noSwitching: true,
        translate: (value: number, label: LabelType): string => {
          return value + '%';
        },
      };
      subData['data'].startval = 0;
      subData['data'].endval = 100;
      subData['data'].sliderOption = sliderOption0;
    }

    var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
    var fDt = factDt.findIndex((x: any) => x.factorid == subData['id']);
    if (fDt > -1) {
      factDt.splice(fDt, 1);
      this.cusIndexService.PostStrategyFactorsData.next(factDt);
      this.cusIndexService.applyTrigger.next(true);
    } else {
    }
    subData['data']['factErrorStart'] = false;
    subData['data']['factErrorEnd'] = false;
    setTimeout(() => {
      subData['data']['showApplyBtn'] = false;
    }, 50);
    this.cusIndexService.factorChangeDetection.next({
      type: 'P',
      flag: true,
      perorval: subData['data']['perorval'],
    });
    var tab: string = subData['data']['perorval'] == 1 ? 'val' : 'percent';
    this.sharedData.userEventTrack(
      'Tool Customization',
      subData.name,
      tab,
      'Factor toggle click'
    );
  }

  factorReset(subData: any) {
    var that = this;
    subData['data'].perorval = 1;
    var dmin: any = d3.min([
      subData['data']['orgTopValue'],
      subData['data']['orgBottomValue'],
    ]);
    var dmax: any = d3.max([
      subData['data']['orgTopValue'],
      subData['data']['orgBottomValue'],
    ]);
    var stepsArray: any = subData['data']['stepsArray'];

    var sliderOption: Options = {
      stepsArray: stepsArray,
      floor: dmax,
      ceil: dmin,
      disabled: this.checkStgyAlreadyTraded,
      noSwitching: true,
      minRange: 0.1,
      translate: (value: number): string => {
        return that.factSliderFormat(subData['id'], value);
      },
    };

    subData['data'].startval = dmin;
    subData['data'].endval = dmax;
    subData['data'].sliderOption = sliderOption;
    var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
    var fDt = factDt.findIndex((x: any) => x.factorid == subData['id']);
    if (fDt > -1) {
      factDt.splice(fDt, 1);
      this.cusIndexService.PostStrategyFactorsData.next(factDt);
      this.cusIndexService.applyTrigger.next(true);
    } else {
    }
    setTimeout(() => {
      subData['data']['showApplyBtn'] = false;
    }, 50);
    this.cusIndexService.factorChangeDetection.next({ type: 'P', flag: true });
    this.sharedData.userEventTrack(
      'Tool Customization',
      subData.name,
      'Reset Factor',
      'Factor Reset Btn click'
    );
  }

  factorResetWithoutSwitch(subData: any) {
    var that = this;
    var dmin: any = d3.min([
      subData['data']['orgTopValue'],
      subData['data']['orgBottomValue'],
    ]);
    var dmax: any = d3.max([
      subData['data']['orgTopValue'],
      subData['data']['orgBottomValue'],
    ]);
    var stepsArray: any = subData['data']['stepsArray'];

    var sliderOption: Options = {
      stepsArray: stepsArray,
      floor: dmax,
      ceil: dmin,
      disabled: this.checkStgyAlreadyTraded,
      noSwitching: true,
      minRange: 0.1,
      translate: (value: number): string => {
        return that.factSliderFormat(subData['id'], value);
      },
    };

    if (subData['data'].perorval == 0) {
      var sliderOptionPerval: Options = {
        floor: 0,
        ceil: 100,
        disabled: this.checkStgyAlreadyTraded,
        noSwitching: true,
        minRange: 2,
        translate: (value: number): string => {
          return value + '%';
        },
      };
      subData['data'].startval = 0;
      subData['data'].endval = 100;
      subData['data'].sliderOption = sliderOptionPerval;
    } else {
      subData['data'].startval = dmin;
      subData['data'].endval = dmax;
      subData['data'].sliderOption = sliderOption;
    }

    var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
    var fDt = factDt.findIndex((x: any) => x.factorid == subData['id']);
    if (fDt > -1) {
      factDt.splice(fDt, 1);
      this.cusIndexService.PostStrategyFactorsData.next(factDt);
      this.cusIndexService.applyTrigger.next(true);
    } else {
    }
    setTimeout(() => {
      subData['data']['showApplyBtn'] = false;
    }, 50);
    this.cusIndexService.factorChangeDetection.next({
      type: 'P',
      flag: true,
      perorval: subData['data']['perorval'],
    });
  }

  factorApply(subData: any) {
    var that = this;
    var con: boolean = false;
    var applyReset: boolean = false;
    try {
      var tab: string = subData['data'].perorval == 0 ? 'percent' : 'val';
      con = that.cusIndexService.checkBelow100Comp(
        that.cusIndexService.exclusionCompData.value,
        that.cusIndexService.remCompData.value,
        that.cusIndexService.remGicsData.value,
        that.cusIndexService.getStrFacData(
          subData['id'],
          subData['data'].startval,
          subData['data'].endval,
          tab,
          subData['data'].orgTopValue,
          subData['data'].orgBottomValue
        )
      );

      if (
        subData['data'].perorval == 1 &&
        subData['data'].startval == subData['data'].orgTopValue &&
        subData['data'].endval == subData['data'].orgBottomValue
      ) {
        applyReset = true;
      } else if (
        subData['data'].perorval == 0 &&
        subData['data'].startval == 0 &&
        subData['data'].endval == 100
      ) {
        applyReset = true;
      } else if (subData['data'].startval == subData['data'].endval) {
        applyReset = true;
      }
    } catch (e) {}
    if (applyReset) {
      this.factorResetWithoutSwitch(subData);
    } else {
      if (con) {
        var clist: any = this.cusIndexService.currentSList.value;
        var factorData: factor = {
          factorid: subData['id'],
          slid: clist['id'],
          userid: parseInt(this.userid),
          assetid: clist['assetId'],
          startval: subData['data'].startval,
          endval: subData['data'].endval,
          perorval: subData['data'].perorval,
          status: 'A',
          name: subData.name,
          displayname: subData.displayname,
          orgTopValue: subData['data'].orgTopValue,
          orgBottomValue: subData['data'].orgBottomValue,
          orgTopPct: 0,
          orgBottomPct: 100,
        };
        var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
        var fDt = factDt.findIndex((x: any) => x.factorid == subData['id']);
        if (fDt > -1) {
          factDt[fDt] = factorData;
        } else {
          factDt.push(factorData);
        }
        this.cusIndexService.PostStrategyFactorsData.next(factDt);
        this.cusIndexService.applyTrigger.next(true);
        this.cusIndexService.factorChangeDetection.next({
          type: 'P',
          flag: true,
        });
        subData['data']['factErrorStart'] = false;
        subData['data']['factErrorEnd'] = false;
      } else {
        var factDt: any[] = this.cusIndexService.PostStrategyFactorsData.value;
        var fDt = factDt.findIndex((x: any) => x.factorid == subData['id']);
        if (fDt > -1) {
          subData['data']['startval'] = factDt[fDt]['startval'];
          subData['data']['endval'] = factDt[fDt]['endval'];
        } else {
          subData['data']['startval'] =
            subData['data'].perorval == 0 ? 0 : subData['data'].orgTopValue;
          subData['data']['endval'] =
            subData['data'].perorval == 0
              ? 100
              : subData['data'].orgBottomValue;
        }
        subData['data']['factErrorStart'] = false;
        subData['data']['factErrorEnd'] = false;
        that.sharedData.showAlertMsg2(
          '',
          that.cusIndexService.minCustInd.message
        );
      }
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      subData.name,
      'Apply Factor',
      'Apply Factor Click'
    );
  }

  factorInit: boolean = false;
  loadFactInit() {
    if (!this.factorInit) {
      this.factorInit = true;
      this.loadFactor(this.cusIndexService.factorMasterData.value);
    }
  }

  buildfactGrp(subMenu: any, data: any) {
    var that = this;
    var Obj = Object.assign({}, subMenu);
    var factorValue: any = this.getFactArr(
      data,
      this.cusIndexService.checkFactorKey(Obj['id'])
    );
    var dmin: any = d3.min(factorValue);
    var dmax: any = d3.max(factorValue);
    var stepsArray: any = factorValue
      .sort(function (x: any, y: any) {
        return d3.ascending(x, y);
      })
      .map((x: any) => ({ value: x }));

    var sliderOption: Options = {
      stepsArray: stepsArray,
      floor: dmin,
      ceil: dmax,
      disabled: this.checkStgyAlreadyTraded,
      noSwitching: true,
      minRange: 0.1,
      translate: (value: number): string => {
        return that.factSliderFormat(Obj['id'], value);
      },
    };

    var init = {
      startval: dmin,
      endval: dmax,
      perorval: 1,
      showfactor: ((isNullOrUndefined(stepsArray) || stepsArray.length ==0)?false:true),
      orgTopValue: dmin,
      orgBottomValue: dmax,
      orgTopPct: 0,
      orgBottomPct: 100,
      sliderOption: sliderOption,
      stepsArray: stepsArray,
      showApplyBtn: false,
      factErrorStart: false,
      factErrorEnd: false,
    };
    var factData = this.cusIndexService.PostStrategyFactorsData.value;
    var factor = factData.filter((x: any) => x.factorid == Obj['id']);
    if (factor.length > 0) {
      init.perorval = factor[0]['perorval'];
      if (factor[0]['perorval'] == 1) {
        var ddmin: any = d3.min([factor[0]['startval'], factor[0]['endval']]);
        var ddmax: any = d3.max([factor[0]['startval'], factor[0]['endval']]);
        init.startval = ddmin;
        init.endval = ddmax;
        var sliderOptionVal: Options = {
          stepsArray: stepsArray,
          floor: dmax,
          ceil: dmin,
          disabled: this.checkStgyAlreadyTraded,
          minRange: 0.1,
          noSwitching: true,
          translate: (value: number): string => {
            return that.factSliderFormat(Obj['id'], value);
          },
        };
        init.sliderOption = sliderOptionVal;
      } else {
        var sliderOptionPer: Options = {
          floor: 0,
          ceil: 100,
          disabled: this.checkStgyAlreadyTraded,
          noSwitching: true,
          minRange: 2,
          translate: (value: number): string => {
            return value + '%';
          },
        };
        init.sliderOption = sliderOptionPer;
        init.startval = factor[0]['startval'];
        init.endval = factor[0]['endval'];
      }
    }
    Obj['data'] = init;
    return Obj;
  }

  getFactArr(data: any, factKey: string) {
    var factorData = [...this.cusIndexService.comFactorsData.value].filter(
      (x: any) => isNotNullOrUndefined(x[factKey])
    );
    var factComp: any = factorData
      .filter(this.getCompfact(data))
      .map((x: any) => x[factKey])
      .sort(function (x: any, y: any) {
        return d3.descending(x, y);
      });
    return factComp;
  }

  getCompfact(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return current.Stockkey == other.stockKey;
        }).length > 0
      );
    };
  }

  //filter Gics start
  clearGics() {
    this.cusIndexService.remGicsData.next([]);
    if (
      this.cusIndexService._remCompData == 0 &&
      this.cusIndexService._remGicsData == 0 &&
      this.checkApplyBtn
    ) {
      this.checkApplyBtn = false;
    }
    this.show_applyGics = false;
    this.cusIndexService.applyTrigger.next(true);
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Sector',
      'Clear Gics',
      'Remove Sector Click'
    );
  }

  check_Gics_class(d: any) {
    var removeData = [...this.remGicsData].filter((x) => x == d.code);
    if (removeData.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  addGicsClick(d: any) {
    var that = this;
    this.checkApplyBtn = true;
    var ind = this.remGicsData.findIndex((x: any) => x == d.code);
    if (ind > -1) {
      this.remGicsData.splice(ind, 1);
    }
    this.cusIndexService.remGicsData.next(this.remGicsData);
    that.show_applyGics = true;
    if (this.exclude_multiple_G == false) {
      this.applyFilter();
    }
    //if (this.exclude_multiple_G == false) { this.getPerStatData(0); };
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Sector',
      d.name,
      'Add Sector Click'
    );
  }

  remGicsClick(d: any) {
    var that = this;
    var dta: any = JSON.parse(JSON.stringify(this.remGicsData));
    dta.push(d.code);
    var con = this.cusIndexService.checkBelow100Comp(
      this.cusIndexService._exclusionCompData,
      this.cusIndexService._remCompData,
      dta,
      this.cusIndexService.PostStrategyFactorsData.value
    );
    if (con) {
      this.checkApplyBtn = true;
      this.remGicsData.push(parseInt(d.code));
      this.cusIndexService.remGicsData.next(this.remGicsData);
      that.show_applyGics = true;
      if (this.exclude_multiple_G == false) {
        this.applyFilter();
      }
      //if (this.exclude_multiple_G == false) { this.getPerStatData(0); };
    } else {
      that.sharedData.showAlertMsg2(
        '',
        this.cusIndexService.minCustInd.message
      );
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Sector',
      d.name,
      'Remove Sector Click'
    );
  }

  GicsClick(d: any) {
    this.selectedGics = d;
    this.selectedGicsPath.push(d);
    this.loadSectorData(d);
    this.sharedData.userEventTrack(
      'Tool Customization',
      'Filter Sector',
      d.name,
      'Sector Click'
    );
  }

  GicsMenuClick(type: string) {
    var that = this;
    that.selectedGics = { type: '' };
    if (type == 'home') {
      that.selectedGicsPath = [];
    } else {
      if (that.selectedGicsPath.length > 0) {
        that.selectedGicsPath.splice(that.selectedGicsPath.length - 1, 1);
        var d = that.selectedGicsPath[that.selectedGicsPath.length - 1];
        if (that.selectedGicsPath.length > 0) {
          that.selectedGics = d;
        }
      }
    }
    that.loadSectorData(that.selectedGics);
  }

  lefBrutExcluClick(d: any) {
    var that = this;
    that.selectedGics = d;
    var index = that.selectedGicsPath.findIndex((x: any) => x.type == d.type);
    that.selectedGicsPath = that.selectedGicsPath.slice(0, index + 1);
    that.loadSectorData(that.selectedGics);
  }

  modetxt(val: string) {
    let modtxt = val;
    switch (val) {
      case 'Industrygroup':
        modtxt = 'Industry Group';
        break;
    }
    return modtxt;
  }

  loadSectorData(data: any) {
    this.cusIndexService.getLvlGics(data).then((res: any) => {
      this.GicsdataSource = new MatTableDataSource<any>(res);
    });
  }

  //filter Gics end

  hrefpar1(i: any) {
    var trim = i; //.to.replace(/\s/g, "").toLowerCase();
    return '#collapseOne' + trim;
  }
  collapsepar1(i: any) {
    var trim = i; //.replace(/\s/g, "").toLowerCase();
    return 'collapseOne' + trim;
  }

  btnradioOne(i: any): any {
    return 'btnradio3' + i;
  }
  btnradioTwo(i: any): any {
    return 'btnradio4' + i;
  }
  btnradioThree(i: any): any {
    return 'btnradio5' + i;
  }
  btnradioFour(i: any): any {
    return 'btnradio6' + i;
  }
  btnradioFive(i: any): any {
    return 'btnradio7' + i;
  }
  btnradioSix(i: any): any {
    return 'btnradio8' + i;
  }
  btnradioSeven(i: any): any {
    return 'btnradio9' + i;
  }
  btnradioEight(i: any): any {
    return 'btnradio10' + i;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cusIndexService.exclusionCompData.next([]);
    this.cusIndexService.currentSList.next(undefined);
    this.reviewIndextab = null;
    this.cusIndexService.checkStgyAlreadyTraded.next(false);
    this.cusIndexService.CIcalculateBtnEnable = false;
    this.cusIndexService.custToolWeightFlag.next('');
    this.cusIndexService.bldMyIndselWeightLimit.next(null);
    try { this.cusIndexService.GPerETFRList1.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GPerETFRList.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.ETFStrategyPlainIndexApi.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetAllocScoresSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetCompanyExListSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetGicsExListSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetStrategyAccountSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetStrategyFactorSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetBuildMyIndexMnthlyHPSavedCIkubSub.unsubscribe(); } catch (e) { }
    try { this.cusIndexService.GetEquityScoresSub.unsubscribe(); } catch (e) { }
  }
  checkDisabled(d: any) {
    var rtn: boolean = false;
    if (
      isNotNullOrUndefined(
        this.cusIndexService._customizeSelectedIndex_custom
      ) &&
      isNotNullOrUndefined(
        this.cusIndexService._customizeSelectedIndex_custom.assetId
      )
    ) {
      var etfInd = [...this.sharedData._ETFIndex].filter(
        (x) =>
          x.assetId ==
          this.cusIndexService._customizeSelectedIndex_custom.assetId
      );
      if (d.Name == 'ETFW' && etfInd.length == 0) {
        rtn = true;
      }
    }
    return rtn;
  }
  accTargetSettings() {
    this.dataService
      .GetAccountConfigSettings()
      .pipe(first())
      .subscribe(
        (data: any[]) => {
          this.GetAccountConfigSettings = data;
          if (data.length > 0) {
            this.defaultMarketCurrency =
              this.GetAccountConfigSettings[0].dMarketCurrency;
            this.bufferTargetData = Array.from(
              { length: this.GetAccountConfigSettings[0].dtaxbufferEnd + 1 },
              (_, i) => i + this.GetAccountConfigSettings[0].dtaxbufferStart
            );
            this.cashTarget = Array.from(
              { length: this.GetAccountConfigSettings[0].dcashTargetEnd },
              (_, i) => i + this.GetAccountConfigSettings[0].dcashTargetStart
            );
            this.minDate = new Date(data[0]['dtransfromDate']);
            this.maxDate = new Date(data[0]['dtranstoDate']);
            this.cashTargetMiMx.min = data[0]['dcashTargetStart'];
            this.cashTargetMiMx.max = data[0]['dcashTargetEnd'];
          }
        },
        (error) => {
          this.GetAccountConfigSettings = [];
          this.defaultMarketCurrency = '';
        }
      );
  }

  remove_p_alpha(d: any) {
    this.dragvalue = d.value;
    //if (val == 'remove 20') { this.dragvalue = 20 }
    //else if (val == 'remove 40') { this.dragvalue = 40 }
    //else if (val == 'remove 60') { this.dragvalue = 60 }
  }
  openIndexConstruction() {
    var that = this;
    //apperance_ModalOpen() {
    var title = 'Index Construction';
    var const_company = that.indexrulesCmpy;
    var indexrulesGICS = that.indexrulesGICS;
    var clickeddata = this.factorsGrp;
    this.dialog.open(IndexConstructionPopupComponent, {
      width: '50%',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '90vh',
      data: {
        dialogTitle: title,
        dialogData: clickeddata,
        selecetedComapny: const_company,
        selecetedGics: indexrulesGICS,
        selectedIndex: this.cusIndexService._currentSList,
        selectedIndexName: this.cusIndexService._customizeSelectedIndex_custom,
      },
    });
    //}
    //$('#myAppearanceModal').modal('show');
  }

  checkEnableStepsFactSheet(stepCheck: boolean=false) {
    var that = this;
    var val: boolean = false;
    var all_list = that.sharedData.getNotificationQueue.value;
    var currentList = that.cusIndexService.currentSList.value;
    var fd = all_list.filter((x: any) => x.slid == currentList.id && x.assetId == currentList.assetId && x.rowno == currentList.rowno && x.notifyStatus == 'E');
    if (stepCheck) {
      fd = all_list.filter((y: any) => y.accountId==0 && y.slid == currentList.id && y.assetId == currentList.assetId && y.rowno == currentList.rowno && y.notifyStatus == 'E');
    }
    if (fd.length > 0) { val = false; } else { val = true; };
    return val;
  }
  openQueueModal() {
    var title = 'notifyQueue';
    var options = {
      from: 'buildYourIndex',
      error: 'notifyQueue',
      destination: 'openNotificationQueue',
    };
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, {
      width: '30%',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '90vh',
      data: {
        dialogTitle: title,
        dialogData: clickeddata,
        dialogSource: options,
      },
    });
  }
  checkAccEnable(d: any) {
    var data = [...this.cusIndexService.bldMyIndAccountData.value];
    if (data.filter((x) => x == d).length > 0) {
      return true;
    } else {
      return false;
    }
  }
  get getFormAccount(): any {
    return this.accountForm.controls['accountItem'] as FormArray;
    //return this.accountForm.get("accountItem");
  }
  calculateTotalHeight(): string {
    const totalHeight = this.myAcclistList.length * 25; // Assuming each item has a height of 20px
    return totalHeight + 'px';
  }

  // Function to get the style for the scroll container
  getScrollContainerStyle(): any {
    return this.calculateTotalHeight();
  }
  checkCashTarget(value: any) {
    if (
      this.GetAccountConfigSettings.length == 0 ||
      isNullOrUndefined(value) ||
      value == ''
    ) {
      return 2;
    } else if (
      value < this.GetAccountConfigSettings[0].dcashTargetStart ||
      value > this.GetAccountConfigSettings[0].dcashTargetEnd
    ) {
      return this.GetAccountConfigSettings[0].dcashTargetStart;
    } else {
      return value;
    }
  }

  accInit: boolean = false;
  GetAccount() {
    var that = this;
    if (!this.accInit) {
      this.accInit = true;
      this.showSpinnerAcc_settings = true;
      this.cusIndexService.getAccountDt().then((accRes: any) => {
        that.GetAccounts = accRes;
        this.loadAccData(accRes);
      });
    }
  }

  PostRemoveAccLinks() {
    var that = this;
    var currentList = that.cusIndexService.currentSList.value;
    var slid = parseInt(currentList.id);
    let userid = atob(
      atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
    );
    var statdata = { accountId: 0, userid: userid, slid: slid };
    if (isNotNullOrUndefined(that.findList) && that.findList.length > 0) {
      statdata.accountId = that.findList[0].accountId;
    } else {
      statdata.accountId = that.findList.accountId;
    }
    this.dataService
      .PostRemoveAccLinks(statdata)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data[0] != 'Failed') {
            that.sharedData.getNotificationDataReload();
            that.accountInit(that.changeFormValue);
          }
        },
        (error) => {}
      );
  }
  removeAccount() {
    var that = this;
    try {
      var form: any = this.accountForm.get('accountItem');
      form.controls.forEach((x: any) => {
        if (x.value.data.accountVan == that.accountAlertInfo.account) {
          x.controls.account.setValue(false);
        }
      });
    } catch (e) {}
  }
  checkpershingfunds(resPershing: any) {
    if (
      isNotNullOrUndefined(resPershing['summary']) &&
      resPershing['summary'].length > 0 &&
      isNotNullOrUndefined(resPershing['summary'][0].availablefunds) &&
      isNotNullOrUndefined(resPershing['summary'][0].availablefunds.amount) &&
      resPershing['summary'][0].availablefunds.amount != 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkCashTargetVal(cash: any, marketValue: any) {
    var info = this.sharedData.GetSchedularMaster.value;
    var noComp = this.cusIndexService._custToolNoOfComp;
    var value = noComp * info[0]['StrategyValPerComp'];
    value = value - value * (info[0]['StrategyValCBuffPercent'] / 100);
    var nValue = marketValue - marketValue * (cash / 100);
    if (nValue >= value) {
      return true;
    } else {
      return false;
    }
  }

  exclude_tax: boolean = false;

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

  updateAccModal() {
    var that = this;
    var value = this.accModalGroup['value'];
    var accID = this.accModalGroup['value']['data']['id'];
    var form: any = this.accountForm.get('accountItem');
    var formInd = form['controls'].findIndex(
      (x: any) => x.controls.data.value.id == accID
    );
    var marketValue = parseFloat(
      d3.format('.2f')(value['data']['marketValue'])
    );
    var CT: boolean = this.checkCashTargetVal(value['cashTarget'], marketValue);
    that.InsufficientCashTarget = false;
    if (formInd > -1 && !CT) {
      $('#cashTargetIn').focus();
      that.InsufficientCashTarget = true;
      that.toastr.success(this.sharedData.checkMyAppMessage(12, 93), '', {
        timeOut: 5000,
        progressBar: false,
        positionClass: 'toast-top-center',
      });
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
      this.checkDefaultAccountPopup = '';
      $('#AccSelectModal').modal('hide');
      if (that.exclude_tax) {
        $('#taxOptDisclosure').modal('show');
      }
    } else {
    }
    this.sharedData.userEventTrack(
      'Tool Customization',
      accID,
      accID,
      'Account data update'
    );
  }
  loadAccData(data: any) {
    var that = this;
    this.showSpinnerAcc_settings = true;
    var dt: any = data;
    var accList: any = [];
    if (isNotNullOrUndefined(dt)) {
      if (isNotNullOrUndefined(dt['accounts']) && dt['accounts'].length > 0) {
        dt['accounts'].forEach((d: any, i: any) => {
          var newAccD = this.cusIndexService.bldMyIndAccountData.value.filter(
            (factsheet: any) => factsheet.accountId == parseInt(d.id)
          );
          var curData: any =
            this.cusIndexService.bldMyIndAccountData.value.filter(
              (factsheet: any) => factsheet.accountId == parseInt(d.id)
            );
          if (curData.length > 0) {
            newAccD = [...curData];
          }
          var obj = {
            id: parseInt(d.id),
            cashTarget:
              newAccD.length > 0
                ? that.checkCashTarget(newAccD[0]['cashTarget'])
                : that.checkCashTarget(d.cashTarget),
            taxBufferGain:
              newAccD.length > 0
                ? newAccD[0]['taxBufferGainTarget']
                : d.taxBufferGainTarget,
            taxTarget:
              newAccD.length > 0 ? newAccD[0]['taxTarget'] : d.taxTarget,
            accountVan: d.accountVan,
            'accountTitle': d.accountTitle,
            taxType: newAccD.length > 0 ? newAccD[0]['taxType'] : d.taxType,
            account:
              newAccD.length > 0 ? true : that.checkAccEnable(parseInt(d.id)),
            marketValue: dt['summary'][i].availablefunds.amount,
            longterm: newAccD.length > 0 ? newAccD[0]['longterm'] : d.longTerm,
            shortterm:
              newAccD.length > 0 ? newAccD[0]['shortterm'] : d.shortTerm,
            transitionDate:
              newAccD.length > 0 ? newAccD[0]['transitionDate'] : null,
            transitionGainTgt:
              newAccD.length > 0 ? newAccD[0]['transitionGainTgt'] : null,
          };
          if (isNotNullOrUndefined(d.funded) && d.funded == 'Y') {
            accList.push(obj);
          }
        });
      }
    }
    this.myAcclistList = [...accList].sort(function (x: any, y: any) {
      return d3.ascending(parseInt(x.id), parseInt(y.id));
    });
    this.showSpinnerAcc_settings = false;
    this.buildForm();
  }
  buildForm() {
    var that = this;
    this.accountForm = new FormGroup({ accountItem: new FormArray([]) });
    this.accountItem = this.accountForm.get('accountItem') as FormArray;
    this.myAcclistList.forEach((x: any) => {
      var accDisabled = that.checkAccDisable(x);
      var CTtype = 'L';
      if (x['taxType'] == 'G' || x['taxType'] == 'L') {
        CTtype = x['taxType'];
      }
      var taxbuf: any = x['taxBufferGain'];
      if (isNullOrUndefined(taxbuf)) {
        taxbuf = 0;
      } else if (
        this.GetAccountConfigSettings.length > 0 &&
        (parseInt(taxbuf) < this.GetAccountConfigSettings[0].dtaxbufferStart ||
          parseInt(taxbuf) > this.GetAccountConfigSettings[0].dtaxbufferEnd)
      ) {
        taxbuf = 0;
      }

      var maxTaxTarget = parseFloat(x['marketValue']);
      if (CTtype == 'L') {
        var per1 = d3.scaleLinear().domain([0, maxTaxTarget]).range([0, 100]);
        if (this.GetAccountConfigSettings.length > 0) {
          maxTaxTarget = per1.invert(
            this.GetAccountConfigSettings[0].dcashTargetEnd
          );
        } else {
          maxTaxTarget = per1.invert(20);
        }
      }

      var taxTarget = x['taxTarget'];
      if (maxTaxTarget < taxTarget || isNullOrUndefined(taxTarget)) {
        taxTarget = 0;
      }

      var cashTarget = x['cashTarget'];
      if (isNullOrUndefined(cashTarget)) {
        cashTarget = this.custToolCashTarget;
      }

      //var transition = x['transition'];
      //if (isNullOrUndefined(transition)) { transition = 1; }

      var shortTermtaxRate = x['shortterm'];
      if (isNullOrUndefined(shortTermtaxRate)) {
        shortTermtaxRate = 35;
      }
      var longTermtaxRate = x['longterm'];
      if (isNullOrUndefined(longTermtaxRate)) {
        longTermtaxRate = 20;
      }
      var transitionDate = x['transitionDate'];
      if (isNullOrUndefined(transitionDate)) {
        if (this.GetAccountConfigSettings.length > 0) {
          transitionDate = new Date(
            this.GetAccountConfigSettings[0]['dtransfromDate']
          );
        }
      }
      var transitionGainTgt = x['transitionGainTgt'];
      if (isNullOrUndefined(transitionGainTgt)) {
        transitionGainTgt = 0;
      }
      var d = this.formBuilder.group({
        data: x,
        account: [
          { value: x.account, disabled: accDisabled },
          Validators.required,
        ],
        cashTarget: [
          { value: cashTarget, disabled: accDisabled },
          Validators.required,
        ],
        //transition: [{ value: transition, disabled: accDisabled }, Validators.required],
        cashTargetType: [
          { value: CTtype, disabled: accDisabled },
          Validators.required,
        ],
        taxTarget: [
          { value: taxTarget, disabled: accDisabled },
          Validators.required,
        ],
        bufferTarget: [
          { value: taxbuf, disabled: accDisabled },
          Validators.required,
        ],
        longTermtaxRate: [
          { value: longTermtaxRate, disabled: accDisabled },
          Validators.required,
        ],
        shortTermtaxRate: [
          { value: shortTermtaxRate, disabled: accDisabled },
          Validators.required,
        ],
        transitionDate: [
          { value: transitionDate, disabled: accDisabled },
          [Validators.required],
        ],
        transitionGainTgt: [
          { value: transitionGainTgt, disabled: accDisabled },
          [Validators.required, Validators.min(0)],
        ],
      });
      this.accountItem.push(d);
    });
  }
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
        if (
          isNotNullOrUndefined(resPershing['accounts']) &&
          resPershing['accounts'].length > 0 &&
          that.checkpershingfunds(resPershing)
        ) {
          that.dataService
            .GetAccountData(val)
            .pipe(
              first(),
              switchMap((res: any) => {
                // Handle GetStrategyfindList call
                return that.dataService.GetStrategyfindList(val).pipe(
                  first(),
                  switchMap((findList: any) => {
                    that.findList = findList;
                    if (findList.length > 0) {
                      that.strat_savedAccount.push(
                        findList[that.findList.length - 1]
                      );
                    }

                    if (
                      res.length > 0 &&
                      isNotNullOrUndefined(res[0]['lockstatus']) &&
                      res[0]['lockstatus'] == 'Y'
                    ) {
                      that.removeAccount();
                      that.lockedDataInfo = res;
                      this.showSpinnerAcc_settings = false;
                      //console.log('lock Acc', res);
                      // $('#lockTradeModal').modal('show');
                      that.checkDefaultAccountPopup = 'locked_popup_single';
                    } else if (
                      res.length > 0 &&
                      isNotNullOrUndefined(res[0]['pauseStatus']) &&
                      res[0]['pauseStatus'] == 'Y'
                    ) {
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
                              data = data.sort((x: any, y: any) =>
                                d3.ascending(x.tradedate, y.tradedate)
                              );
                              const d: any = data[data.length - 1];
                              that.accountAlertInfo.username = d.username;
                              that.accountAlertInfo.stgyname =
                                d.name + ' (' + d.shortname + ')';
                              that.accountAlertInfo.tradedate = new Date(
                                d.tradedate
                              );
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
            )
            .subscribe();
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
  accountInit(d: any) {
    var that = this;
    try {
      this.sharedData.showMatLoader.next(true);
      var accID = 0;
      if (
        isNotNullOrUndefined(d['value']['data']) &&
        isNotNullOrUndefined(d['value']['data']['id'])
      ) {
        accID = d['value']['data']['id'];
      }
      this.GetDBPershing(accID).then((rT) => {
        this.sharedData.showMatLoader.next(false);
        if (this.checkAccActive(d)) {
          this.checkDefaultAccountPopup = 'details_popup';
          //$('#AccSelectModal').modal('show');
          this.accModalGroup.reset();
          var x = d['value'];
          var accDisabled = that.checkAccDisable(x['data']);
          this.updateBtn = accDisabled;
          var CTtype = 'L';
          if (
            d['controls']['cashTargetType']['value'] == 'G' ||
            d['controls']['cashTargetType']['value'] == 'L'
          ) {
            CTtype = d['controls']['cashTargetType']['value'];
          }

          //Buffer target default is 20%
          var taxbuf = d['controls']['bufferTarget']['value'];
          if (
            parseInt(taxbuf) <
              this.GetAccountConfigSettings[0].dtaxbufferStart ||
            parseInt(taxbuf) > this.GetAccountConfigSettings[0].dtaxbufferEnd ||
            isNullOrUndefined(taxbuf)
          ) {
            taxbuf = 20;
          }

          var cashTarget = d['controls']['cashTarget']['value'];
          //if (isNullOrUndefined(cashTarget)) { cashTarget = this.bldMyIndCashTarget; }

          //var transition = d['controls']['transition']['value'];
          //if (isNullOrUndefined(transition)) { transition = 1; }
          this.marketValue = that.checkAccMarketValue(x['data']['id']);
          x['data']['marketValue'] = this.marketValue;
          this.maxTaxTarget = this.marketValue;
          if (CTtype == 'L') {
            var per1 = d3
              .scaleLinear()
              .domain([0, this.marketValue])
              .range([0, 100]);
            this.maxTaxTarget = per1.invert(
              this.GetAccountConfigSettings[0].dcashTargetEnd
            );
          }

          var taxTarget = d['controls']['taxTarget']['value'];
          if (taxTarget > this.maxTaxTarget || isNullOrUndefined(taxTarget)) {
            taxTarget = 0;
          }

          var shortTermtaxRate = d['controls']['shortTermtaxRate']['value'];
          if (isNullOrUndefined(shortTermtaxRate)) {
            shortTermtaxRate = 35;
          }
          var longTermtaxRate = d['controls']['longTermtaxRate']['value'];
          if (isNullOrUndefined(longTermtaxRate)) {
            longTermtaxRate = 20;
          }
          var transitionDate = d['controls']['transitionDate']['value'];
          if (isNullOrUndefined(transitionDate)) {
            if (this.GetAccountConfigSettings.length > 0) {
              transitionDate = new Date(
                this.GetAccountConfigSettings[0]['dtransfromDate']
              );
            } else {
              transitionDate = new Date();
            }
          } else if (this.GetAccountConfigSettings.length > 0) {
            var c_d = new Date(
              this.GetAccountConfigSettings[0]['dtransfromDate']
            );
            var C_date = moment(transitionDate).diff(moment(c_d), 'days');
            if (C_date < 0) {
              transitionDate = new Date(this.minDate);
            }
          }

          var transitionGainTgt = d['controls']['transitionGainTgt']['value'];
          if (isNullOrUndefined(transitionGainTgt)) {
            transitionGainTgt = 0;
          }
          var ct: any =
            moment(transitionDate).diff(moment(new Date()), 'months', true) / 3;
          that.rebalanceCount = parseInt(ct);
          if (
            isNaN(that.rebalanceCount) ||
            isNullOrUndefined(that.rebalanceCount)
          ) {
            that.rebalanceCount = 0;
          }
          this.accModalGroup = this.formBuilder.group({
            data: x['data'],
            cashTarget: [
              { value: cashTarget, disabled: accDisabled },
              [
                Validators.required,
                Validators.min(
                  that.GetAccountConfigSettings[0].dcashTargetStart
                ),
                Validators.max(that.GetAccountConfigSettings[0].dcashTargetEnd),
              ],
            ],
            cashTargetType: [
              { value: CTtype, disabled: accDisabled },
              Validators.required,
            ],
            taxTarget: [
              { value: taxTarget, disabled: accDisabled },
              [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxTaxTarget),
              ],
            ],
            bufferTarget: [
              { value: taxbuf, disabled: accDisabled },
              [
                Validators.required,
                Validators.min(
                  this.GetAccountConfigSettings[0].dtaxbufferStart
                ),
                Validators.max(this.GetAccountConfigSettings[0].dtaxbufferEnd),
              ],
            ],
            shortTermtaxRate: [
              { value: shortTermtaxRate, disabled: accDisabled },
              [Validators.required, Validators.min(0.0), Validators.max(100.0)],
            ],
            longTermtaxRate: [
              { value: longTermtaxRate, disabled: accDisabled },
              [Validators.required, Validators.min(0.0), Validators.max(100.0)],
            ],
            transitionDate: [
              { value: transitionDate, disabled: accDisabled },
              [Validators.required],
            ],
            transitionGainTgt: [
              { value: transitionGainTgt, disabled: accDisabled },
              [Validators.required, Validators.min(0)],
            ],
          });
          //console.log(this.accModalGroup);
          this.showSpinnerAcc_settings = false;
        } else {
        }
      });
    } catch (e) {}
  }
  GetDBPershing(accID: any) {
    var that = this;
    return new Promise((resolve, reject) => {
      var GetSubAccounts_DBPer= this.dataService.GetSubAccounts_DBPershing(accID).pipe(first()).subscribe((res: any) => {
          if (this.sharedData.checkServiceError(res)) {
            resolve([]);
          } else {
            if (
              isNotNullOrUndefined(res['accounts']) &&
              res['accounts'].length > 0
            ) {
              var data = that.GetAccounts;
              var indexF = data['accounts'].findIndex(
                (x: any) => x.accountId == res['accounts'][0]['accountId']
              );
              if (indexF > -1) {
                data['accounts'][indexF] = res['accounts'][0];
                data['ledger'][indexF] = res['ledger'][0];
                data['summary'][indexF] = res['summary'][0];

                // that.GetAccounts.next(data);
              }
            }
          }
          resolve(res);
        },
        (error) => {
          resolve([]);
        }
      );
      this.subscriptions.add(GetSubAccounts_DBPer);
    });
  }
  checkErrorAction(errorList: any) {
    var checkError = errorList;
    /** move to default Account **/
    if (checkError.destination == 'loadDefaultAccount') {
      this.openFactsheet(0);
      this.cusIndexService.errorList_custom.next(undefined);
    } else if (checkError.destination == 'loadDefaultAlpha') {
      this.leftMenuClick('Alpha');
    }
  }
  taxChange(val: any) {
    this.maxTaxTarget = this.marketValue;
    if (val == 'L') {
      var per1 = d3.scaleLinear().domain([0, this.marketValue]).range([0, 100]);
      this.maxTaxTarget = per1.invert(
        this.GetAccountConfigSettings[0].dcashTargetEnd
      );
    }
    this.accModalGroup.controls['taxTarget'].setValidators([
      Validators.required,
      Validators.min(0),
      Validators.max(this.maxTaxTarget),
    ]);
  }
  checkAccDisable(d: any) {
    var data = this.cusIndexService.bldMyIndAccountData.value;
    if (isNullOrUndefined(data)) {
      data = [];
    }
    var filD = data.filter(
      (x: any) => x.accountId == parseInt(d.id) && x.tradedStatus == 'Y'
    );
    if (filD.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  checkAcctradedDisable(d: any) {
    var data = this.cusIndexService.bldMyIndAccountData.value;
    if (isNullOrUndefined(data)) {
      data = [];
    }
    var filD = data.filter(
      (x: any) =>
        x.accountId == parseInt(d.value.data.id) && x.tradedStatus == 'Y'
    );
    if (filD.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  //postNotification() {
  //  var that = this;
  //  var clist = this.dirIndexService._selectedDirIndStry[0];
  //  let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
  //  var etfInd = [...this.sharedData._ETFIndex].filter(x => x.assetId == clist.assetId);
  //  var d = new Date(this.sharedData.equityHoldDate);
  //  if (etfInd.length > 0) { d = new Date(etfInd[0]['holdingsdate']); }
  //  var date = d.getFullYear() + '-' + that.sharedData.formatedates(d.getMonth() + 1) + '-' + that.sharedData.formatedates(d.getDate());
  //  var factDt: any = [];
  //  that.diFactAccountData.forEach((acc: any) => {
  //    var oldData = that.diIndAccountData.filter((d: any) => parseInt(acc.accountId) == parseInt(d.accountId))
  //    if (oldData.length > 0 && isNotNullOrUndefined(oldData[0]['tradedStatus']) && oldData[0]['tradedStatus'] == 'Y') { } else {
  //      factDt.push({ "accountId": acc['accountId'], "userid": parseInt(userid), "slid": clist.id })
  //    }
  //  });

  //  if (factDt.length > 0) {
  //    this.dirIndexService.checkFactsheetInit(factDt).then((res: any) => {
  //      if (res.status && res.data.length > 0) {
  //        var postData: any = [];
  //        res.data.forEach((acc: any) => {
  //          if (acc['factsheetAvail'] == 'Y' || (acc['factsheetAvail'] == 'N' && acc['notifyId'] == 0)) {
  //            postData.push({
  //              "accountId": acc['accountId'],
  //              "slid": clist.id,
  //              "userid": parseInt(userid),
  //              "status": "A",
  //              "enddate": date,
  //              "freqflag": that.sharedData.defaultRebalanceType,
  //              "tenYrFlag": 1,
  //              "erfflag": that.checkErfflag(clist)
  //            });
  //          }
  //        });
  //        if (postData.length > 0) {
  //          that.dataService.PostStrategyNotificationQueue(postData).pipe(first()).subscribe((data: any) => {
  //            if (data[0] != "Failed") {
  //              if (data[0].toLowerCase().indexOf('locked') > -1) {
  //                that.cusIndexService.checkReloadpostNotification(that.diStrFactsheetAccData);
  //              }
  //              else {
  //                this.sharedData.showMatLoader.next(false);
  //                that.toastr.success('Added to queue successfully', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
  //                that.sharedData.getNotificationDataReload();
  //              }
  //            }
  //          }, (error: any) => {
  //            this.logger.logError(error, 'PostStrategyNotificationQueue');
  //            this.sharedData.showMatLoader.next(false);
  //          });
  //        } else {
  //          this.sharedData.showMatLoader.next(false);
  //          that.toastr.success('No changes are made in strategy to calculate', '', { timeOut: 5000, progressBar: false, positionClass: "toast-top-center" });
  //        }
  //      } else { this.sharedData.showMatLoader.next(false); }
  //    })
  //  } else { this.sharedData.showMatLoader.next(false); }
  //}
  checkfactDisable(accId: any) {
    var currentList = this.cusIndexService._currentSList;
    //console.log(currentList)
    if (isNotNullOrUndefined(currentList)) {
      var xx = [...this.sharedData.getNotificationQueue.value].filter(
        (x) =>
          x.slid == currentList.id &&
          x.accountId == accId &&
          x.notifyStatus == 'E'
      );
      if (xx.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  closeFactsheet() {
    this.reviewIndextab = null;
    this.cusIndexService.showReviewIndexLoaded.next(false);
  }
  openFactsheet(d: number) {
    if (!this.checkfactDisable(d)) {
      var that = this;
      this.reviewIndextab = d;
      this.cusIndexService.selectedCIIndFactsheet.next(d);
      this.cusIndexService.reviewIndexClickedData.next(
        that.checkSelectedAccVal(d)
      );
      this.cusIndexService.showReviewIndexLoaded.next(true);
      this.viewRemovestrategy();
      this.sharedData.userEventTrack(
        'Tool Customization',
        'Account id:' + d,
        'Account id:' + d,
        'open factsheet click'
      );
    }
  }
  checkSelectedAccVal(d: any) {
    var fillD = this.myAcclistList.filter(
      (x: any) => parseInt(x.id) == parseInt(d)
    );
    if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) {
      return fillD[0];
    } else {
      return undefined;
    }
  }
  checkAccValName(d: any) {
    var fillD = this.myAcclistList.filter(
      (x: any) => parseInt(x.id) == parseInt(d)
    );
    if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) {
      return fillD[0]['accountVan'];
    } else {
      return '';
    }
  }
  viewRemovestrategy() {
    let userid = atob(
      atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
    );
    var xx = [...this.sharedData.getNotificationQueue.value].filter(
      (x) =>
        x.slid == this.cusIndexService._currentSList.id &&
        x.rowno == this.cusIndexService._currentSNo &&
        x.displayQueue == 'Y' &&
        x.accountId == this.reviewIndextab &&
        x.notifyStatus == 'E'
    );
    if (xx.length > 0) {
      var item = xx[0];
      var stat = 'N';
      var statdata = [
        { notifyid: item.notifyId, status: stat, userid: parseInt(userid) },
      ];
      var PostUpdateStrategyDisplayQueu=this.dataService.PostUpdateStrategyDisplayQueue(statdata).pipe(first()).subscribe((data) => {
            if (data[0] != 'Failed') {
              this.sharedData.getNotificationDataReload();
            }
          },
          (error) => {
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 11), '', {
              timeOut: 5000,
            });
          }
      );
      this.subscriptions.add(PostUpdateStrategyDisplayQueu);
    }
  }

  checkFormInvalid(d: string) {
    return this.accModalGroup.get(d)?.invalid;
  }
  checkFormValue(d: string) {
    return this.accModalGroup.get(d)?.value;
  }
  checkTax(d: any) {
    var val = this.gainList.filter((x) => x.value == d);
    if (val.length > 0) {
      return val[0].name;
    } else {
      return '';
    }
  }
  checkMV(d: any) {
    if (isNotNullOrUndefined(d['value']['data'])) {
      return this.sharedData.numberWithCommas(
        d['value']['data']['marketValue'].toFixed(2)
      );
    } else {
      return '';
    }
  }

  factorTooltip(factorName: string, val: number) { return "This " + factorName + " data is based on " + ((val == 0) ? 'percentage' : 'Value'); };

  accountTooltip(d: any) {
    if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d['value'] && window.innerWidth >= 1250)
      && isNotNullOrUndefined(d['value']['data']) && isNotNullOrUndefined(d['value']['data']['accountTitle'])) { return d['value']['data']['accountTitle']; }
    else { return ''; };
  }

  checkRemainingCashTarget(cashTargetValue: string, type: string) {
    var marketVal: any = this.checkMV(this.accModalGroup);
    var cash: any = this.accModalGroup.get(cashTargetValue)?.value;
    var marketValue = parseFloat(marketVal.replace(/\,/g, ''));
    if (
      type == 'updatedCash' &&
      isNotNullOrUndefined(marketValue) &&
      isNotNullOrUndefined(cash)
    ) {
      var val = marketValue - marketValue * (cash / 100);
      return d3.format(',.2f')(val);
    } else if (
      type == 'remainingCash' &&
      isNotNullOrUndefined(marketValue) &&
      isNotNullOrUndefined(cash)
    ) {
      var val = marketValue * (cash / 100);
      return d3.format(',.2f')(val);
    } else {
      return '-';
    }
  }

  checkAccMarketValue(accountId: any) {
    var data = this.GetAccounts;
    var indexF = data['accounts'].findIndex(
      (x: any) => parseInt(x.accountId) == parseInt(accountId)
    );
    if (indexF > -1) {
      return data['summary'][indexF].availablefunds.amount;
    } else {
      return 0;
    }
  }
  checkAccName(d: any) {
    if (isNotNullOrUndefined(d['value']['data'])) {
      return d['value']['data']['accountVan'];
    } else {
      return '';
    }
  }
  checkAccActive(d: any) {
    return d.controls.account.value;
  }
  transitionDateCange(e: any) {
    if (isNotNullOrUndefined(e['value'])) {
      var ct: any =
        moment(e['value']).diff(moment(new Date()), 'months', true) / 3;
      this.rebalanceCount = parseInt(ct);
    }
  }

  accountEvTrack(e: any, acc: any) {
    var aEv =
      this.checkAccName(acc) + ' is ' + (e.checked ? 'selected' : 'unselected');
    this.sharedData.userEventTrack(
      'Tool Customization',
      aEv,
      aEv,
      'Account select checkbox'
    );
  }

  accountmore(acc: any) {
    var aEv = this.checkAccName(acc) + ' is more option clicked';
    this.sharedData.userEventTrack(
      'Tool Customization',
      aEv,
      aEv,
      'Account select checkbox'
    );
  }

  eventTrace(acc: any, txt: string) {
    var aEv = this.checkAccName(acc) + ' is ' + txt;
    this.sharedData.userEventTrack(
      'Tool Customization',
      aEv,
      aEv,
      'Account select checkbox'
    );
  }

  unPauseAcc() {
    if (this.pausedDataInfo.length > 0) {
      this.pausedDataInfo.forEach((d: any) => {
        this.sharedData
          .PauseAccUpdate(JSON.stringify(d['accid']), 'N')
          .then((res) => {});
      });
    }
  }
  checkDisabled1(d: any, type: any) {
    var da = [...this.cusIndexService.BuildMyIndexOptions].filter(
      (x) => x.Id == d && x.Type == type
    );
    if (
      isNotNullOrUndefined(
        this.cusIndexService._customizeSelectedIndex_custom
      ) &&
      isNotNullOrUndefined(
        this.cusIndexService._customizeSelectedIndex_custom.assetId
      )
    ) {
      var etfInd = [...this.sharedData._ETFIndex].filter(
        (x) =>
          x.assetId ==
          this.cusIndexService._customizeSelectedIndex_custom.assetId
      );
      if (etfInd.length > 0 && d.Name == 'ETFW') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  selectedByChange(d: any) {
    if (!this.checkDisabled1(d, 'S')) {
      this.cusIndexService.custToolSelectByValue.next(d);
      this.cusIndexService.selCompany.next(undefined);
      this.cusIndexService.applyTrigger.next(true);
    }
  }

  replaceSelection(input: any, key: any) {
    const inputValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd || input.selectionStart;
    return inputValue.substring(0, start) + key + inputValue.substring(end + 1);
  }

  applySelection() {
    this.cusIndexService.applyTrigger.next(true);
  }

  keyPressNumbers(e: any, input: any) {
    var exclusionCompData: any = this.cusIndexService.exclusionCompData.value;
    const functionalKeys = ['Backspace', 'ArrowRight', 'ArrowLeft'];
    //if (functionalKeys.indexOf(e.key) !== -1) {
    //  return;
    //}
    const keyValue = +e.key;
    //if (isNaN(keyValue)) {
    //  e.preventDefault();
    //  return;
    //}
    const hasSelection =
      input.selectionStart !== input.selectionEnd &&
      input.selectionStart !== null;
    let newValue;
    if (hasSelection) {
      newValue = this.replaceSelection(input, e.key);
    } else {
      newValue = input.value + keyValue.toString();
    }
    let rem5Pec = Math.round((exclusionCompData.length / 100) * 10);
    var sliVal = exclusionCompData.length - rem5Pec;
    if (+newValue > sliVal || +newValue > this.bldMyIndselNoCompmax) {
      e.preventDefault();
    }
  }

  noOfCompError: boolean = false;
  weightLimitError: boolean = false;
  checkslider() {
    var that = this;
    if (+that.inbldMyIndselNoCompVal < this.cusIndexService.minCustInd.count) {
      this.noOfCompError = true;
    } else {
      this.noOfCompError = false;
    }
    if (
      +that.inbldMyIndselNoCompVal >
        this.cusIndexService.minCustInd.count - 1 &&
      +that.inbldMyIndselNoCompVal <= this.bldMyIndselNoCompmax
    ) {
      that.custToolNoOfComp = +that.inbldMyIndselNoCompVal;
      this.reangePerCal();
      this.calWeightcheck = true;
      this.calculateWeight(this.inbldMyIndselNoCompVal);
      
    }
  }
  nxtrebalance(d: any) {
    var data: any = this.sharedData.rebalanceDates.value;
    var fD = data.filter(
      (x: any) => x.rebfreq.toLowerCase() == d.toLowerCase()
    );
    if (fD.length > 0) {
      return formatDate(fD[0]['rebdate'], 'MM/dd/YYYY', 'en-US');
    } else {
      return '-';
    }
  }
  showSliderIcon: boolean = false;
  bldMyIndselNoCompmax: number = 0;
  getExclCompData: any = [];
  getExclComp() {
    this.cusIndexService.getExclCompData().then((res: any) => {
      this.getExclCompData = [...res];
      this.checkSliderValue();
    });
  }

  reangePerCal() {
    this.selectionOptions = {
      floor: this.cusIndexService.minCustInd.count,
      ceil: this.bldMyIndselNoCompmax,
      disabled: this.checkStgyAlreadyTraded,
    };
  }
  checkSliderValue() {
    this.showSliderIcon = false;
    var exclusionCompData: any = this.cusIndexService.exclusionCompData.value;
    var sliVal: any = this.cusIndexService.custToolNoOfComp.value;
    this.bldMyIndselNoCompmax = this.getExclCompData.length;
    if (
      this.getExclCompData.length <=
        this.cusIndexService.minCustInd.count - 1 ||
      this.cusIndexService.custToolNoOfComp.value <=
        this.cusIndexService.minCustInd.count - 1
    ) {
      sliVal = this.getExclCompData.length;
    }
    if (
      this.getExclCompData.length <= this.cusIndexService.custToolNoOfComp.value
    ) {
      sliVal = this.getExclCompData.length;
    }
    let rem5Pec = Math.round((exclusionCompData.length / 100) * 10);
    if (this.getExclCompData.length < exclusionCompData.length - rem5Pec) {
    } else if (sliVal < exclusionCompData.length - rem5Pec) {
    } else {
      sliVal = exclusionCompData.length - rem5Pec;
      this.bldMyIndselNoCompmax = sliVal;
      this.showSliderIcon = true;
    }
    sliVal = parseInt(sliVal);
    if (
      sliVal == null ||
      sliVal == undefined ||
      sliVal == '' ||
      isNaN(sliVal)
    ) {
      sliVal = this.getExclCompData.length;
    }
    this.custToolNoOfComp = sliVal;
    this.inbldMyIndselNoCompVal = sliVal;
    if (this.calWeightcheck) {
      this.calculateWeight(sliVal);
    }
    this.reangePerCal();
  }

  changeBldSlider(event: any) {
    this.inbldMyIndselNoCompVal = this.custToolNoOfComp;
    this.calculateWeight(this.inbldMyIndselNoCompVal);
    this.cusIndexService.custToolNoOfComp.next(this.custToolNoOfComp);
    if (this.custToolNoOfComp < this.cusIndexService.minCustInd.count) {
      this.noOfCompError = true;
    } else {
      this.noOfCompError = false;
    }
  }
  cat_clkd_id: any;
  weightByChange(d: any) {
    if (!this.checkDisabled1(d, 'W')) {
      this.cat_clkd_id = d;
      this.cusIndexService.custToolWeightByValue.next(d);
      this.cusIndexService.selCompany.next(undefined);
      this.cusIndexService.applyTrigger.next(true);
    }
  }

  rebalanceChange(d: any) {
    this.cusIndexService.custToolRebalanceType.next(d);
    this.cusIndexService.selCompany.next(undefined);
  }

  taxEffChange(d: any) {
    var Rt: string = 'N';
    this.exclude_tax = d['checked'];
    if (isNotNullOrUndefined(d['checked']) && d['checked']) {
      Rt = 'Y';
      $('#taxOptDisclosure').modal('show');
    }
    this.cusIndexService.custToolTaxEffAwareness.next(Rt);
    this.cusIndexService.selCompany.next(undefined);
    this.isAccountAccor = this.exclude_tax;
  }

  loadAccChange() {
    var accList: any = [];
    var data = this.accountForm.value['accountItem'].filter(
      (x: any) => x.account == true
    );
    data.forEach((x: any) => {
      var obj = {
        accountId: parseInt(x.data.id),
        cashTarget: x['cashTarget'],
        taxType: x['cashTargetType'],
        taxTarget: x['taxTarget'],
        taxBufferGainTarget: x['bufferTarget'],
        transitionno: x['transition'],
        marketValue: x.data['marketValue'],
        shortterm: x['shortTermtaxRate'],
        longterm: x['longTermtaxRate'],
        transitionDate: x['transitionDate'],
        transitionGainTgt: x['transitionGainTgt'],
      };
      accList.push(obj);
    });
    this.cusIndexService.bldMyIndAccountData.next(accList);
  }

  checkAccountMtvalcheck() {
    return new Promise((resolve, reject) => {
      var data: any = [];
      var info = this.sharedData.GetSchedularMaster.value;
      var noComp = this.custToolNoOfComp;
      var value = noComp * info[0]['StrategyValPerComp'];
      value = value - value * (info[0]['StrategyValCBuffPercent'] / 100);
      this.cusIndexService.bldMyIndAccountData.getValue().forEach((d: any) => {
        if (
          isNotNullOrUndefined(d['marketValue']) &&
          d['marketValue'] <= value
        ) {
          var Obj = Object.assign({}, d);
          Obj['marketValue'] = d3.format('.2f')(Obj['marketValue']);
          Obj['acValue'] = d3.format('.2f')(value);
          data.push(Obj);
        }
      });
      resolve(data);
    });
  }
  scrollToBottom(scroll: any) {
    $(scroll).scrollTop(1000000);
  }
  removeAccountAll(data: any) {
    var that = this;
    try {
      var form: any = this.accountForm.get('accountItem');
      if (data.length > 0) {
        data.forEach((d: any) => {
          form.controls.forEach((x: any) => {
            if (x.value.data.id == parseInt(d['accid'])) {
              x.controls.account.setValue(false);
            }
          });
        });
      }
    } catch (e) { }
  }
  MarketValueModalCheck: boolean = false;
  checkLockedAcc() {
    var that = this;
    this.loadAccChange();
    var CTData: any = [];
    that.MarketValueModalCheck = false;
    var accData = this.cusIndexService.bldMyIndAccountData.value;
    accData.forEach((d: any) => {
      if (!that.checkCashTargetVal(d['cashTarget'], d['marketValue'])) {
        CTData.push({
          account: that.checkAccValName(d.accountId),
          marketValue: d['marketValue'],
          cashTarget: d['cashTarget'],
        });
      }
    });
    this.accMtData = CTData;
    that.InsufficientCashTarget = false;
    if (
      !this.checkCashTargetVal(
        this.custToolCashTarget,
        this.zeroAccMarketVal
      ) ||
      this.cashTargetMiMx.min > this.custToolCashTarget ||
      this.custToolCashTarget > this.cashTargetMiMx.max
    ) {
      that.InsufficientCashTarget = true;
      that.toastr.success(
        this.sharedData.checkMyAppMessage(3, 69),
        '',

        { timeOut: 5000, progressBar: false, positionClass: 'toast-top-center' }
      );
      that.leftMenuClick('Selection');
    } else if (CTData.length > 0) {
      that.MarketValueModalCheck = false;
      $('#accCashTargetModal').modal('show');
    } else {
      this.accMtData = [];
      this.checkAccountMtvalcheck().then((res: any) => {
        this.accMtData = [...res];
        if (res.length == 0) {
          var data: any = [];
          this.lockedDataInfo = [];
          this.pausedDataInfo = [];
          if (that.showSpinnerAcc_settings) {
            this.toastr.info('Please wait account data initializing...', '', {
              timeOut: 5000,
            });
          } else {
            let userid = atob(
              atob(atob(JSON.parse(sessionStorage['currentUser']).userId))
            );
            this.cusIndexService.bldMyIndAccountData
              .getValue()
              .forEach((d: any) => {
                var obj = { accid: d['accountId'], userid: userid };
                data.push(obj);
              });
            if (data.length > 0 && !that.cusIndexService._forcepopupStrategy) {
              var GetlockPauseAc= this.dataService.GetlockPauseAccs(data).pipe(first()).subscribe((res: any) => {
                    var lockInfo = res.filter(
                      (ld: any) => ld.lockstatus == 'Y'
                    );
                    var pauseInfo = res.filter(
                      (ld: any) => ld.pausestatus == 'Y'
                    );
                    if (lockInfo.length > 0 || pauseInfo.length > 0) {
                      $('#lockInfoTradeModal').modal('show');
                      that.removeAccountAll(lockInfo);
                      this.lockedDataInfo = lockInfo;
                      this.pausedDataInfo = pauseInfo;
                    } else {
                      this.builIndexCalculate();
                    }
                  },
                  (error) => {}
              );
              this.subscriptions.add(GetlockPauseAc);
            } else {
              this.builIndexCalculate();
            }
          }
        } else {
          that.MarketValueModalCheck = true;
          $('#accMtCalModal').modal('show');
        }
      });
    }
  }

  remAccCalculate() {
    var data = this.accMtData;
    try {
      var form: any = this.accountForm.get('accountItem');
      if (data.length > 0) {
        data.forEach((dt: any) => {
          form.controls.forEach((x: any) => {
            if (x.value.data.id == parseInt(dt['accountId'])) {
              x.controls.account.setValue(false);
            }
          });
        });
      }
    } catch (e) {}
    this.checkLockedAcc();
  }

  checkforcepopup_modal() {
    var that = this;
    if (isNotNullOrUndefined(that.cusIndexService.currentSList.value)) {
      if (
        (that.cusIndexService.currentSList.value['name'] == null ||
          that.cusIndexService.currentSList.value['name'] == '') &&
        (that.cusIndexService.currentSList.value['shortname'] == '' ||
          that.cusIndexService.currentSList.value['shortname'] == null)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  openforceModal() {
    $('#strategyForce_Modal').modal('show');
  }
  indexRulesData: any = [];
  factorsGrp: any = [];
  indexrulesCmpy: any = [];
  indexrulesGICS: any = [];
  index_const_select: string = '-';
  index_const_weight: string = '-';
  index_const_tax: string = '-';
  index_const_calcu: number = 0;
  checkfactorName(id: any) {
    var fac_3 = [...this.cusIndexService._factorMasterData].filter(
      (fu) => fu.id == id
    );
    return fac_3[0].displayname;
  }
  MK: boolean = false;
  convert2digits(val: any, id: any) {
    if (id == 17) {
      this.MK = true;
      return this.billionconverter(val);
    } else {
      this.MK = false;
      return parseFloat(val).toFixed(1);
    }
  }
  billionconverter(d: any) {
    let ActVal = d * 100000;
    return this.CurrencyFormat(ActVal).toString();
  }
  formatLargeNumber(value: number, decimals: number = 2): any {
    if (value === null || value === undefined) return null;

    let abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    let formattedNumber: string;

    if (abs >= 1.0e12) {
      formattedNumber = (abs / 1.0e12).toFixed(decimals) + 'T';
    } else if (abs >= 1.0e9) {
      formattedNumber = (abs / 1.0e9).toFixed(decimals) + 'B';
    } else if (abs >= 1.0e6) {
      formattedNumber = (abs / 1.0e6).toFixed(decimals) + 'M';
    } else if (abs >= 1.0e3) {
      formattedNumber = (abs / 1.0e3).toFixed(decimals) + 'K';
    } else {
      formattedNumber = abs.toFixed(decimals);
    }

    return sign + formattedNumber;
  }

  CurrencyFormat(val: any) {
    return Math.abs(Number(val)) >= 1.0e12
      ? (Math.abs(Number(val)) / 1.0e12).toFixed(2) + ' T'
      : Math.abs(Number(val)) >= 1.0e9
      ? (Math.abs(Number(val)) / 1.0e9).toFixed(1) + ' B'
      : Math.abs(Number(val)) >= 1.0e6
      ? (Math.abs(Number(val)) / 1.0e6).toFixed(1) + ' M'
      : Math.abs(Number(val)) >= 1.0e3
      ? (Math.abs(Number(val)) / 1.0e3).toFixed(1) + ' K'
      : Math.abs(Number(val));
  }
  functionPercentage(x: any) {
    if (x.toFixed(0) != 98) {
      return false;
    } else {
      return true;
    }
  }
  checkFac_per(p: any) {
    if (
      p == 19 ||
      p == 17 ||
      p == 9 ||
      p == 1 ||
      p == 10 ||
      p == 4 ||
      p == 12
    ) {
      return false;
    } else {
      return true;
    }
  }
  convert2width(start: any, end: any) {
    var st: any = start;
    var en: any = end;
    var wid = parseInt(st) - parseInt(en);
    return wid;
  }
  function(x: any) {
    if (x.toFixed(0) != 98) {
      return true;
    } else {
      return false;
    }
  }
  showIndexRulesLoader: boolean = false;
  openIndexRules() {
    var that = this;
    that.indexRulesData = [];
    var currentList = that.cusIndexService.currentSList.value;
    var notifyId = [...that.sharedData.getNotificationQueue.value].filter(
      (x) => x.slid == currentList.id && x.accountId == 0
    );
    if (notifyId.length == 0) {
      notifyId = [...that.sharedData.getNotificationQueue.value].filter(
        (x) => x.slid == currentList.id
      );
    }
    if (notifyId.length > 0) {
      that.showIndexRulesLoader = true;
      that.indexStepSer.GetUserSteps(notifyId[0]['notifyId'], 'CI').then(
        (response: any) => {
          that.indexRulesData = response['res'];
          that.factorsGrp = response['factIndexStepGrp'];
          that.cusIndexService.indexStepsGridData.next(response['res'][0]);
          that.indexrulesCmpy = that.indexRulesData[0].strStockkey;
          that.indexrulesGICS = that.indexRulesData[0].strSector;
          if (that.indexRulesData[0].weightBy.length > 0) {
            that.index_const_weight = that.indexRulesData[0].weightBy[0].Name;
          }
          if (that.indexRulesData[0].selectBy.length > 0) {
            that.index_const_select = that.indexRulesData[0].selectBy[0].Name;
          }
          if (that.indexRulesData[0].taxEffAwareness == 'Y') {
            that.index_const_tax = 'Yes';
          } else if (that.indexRulesData[0].taxEffAwareness == 'N') {
            that.index_const_tax = 'No';
          } else {
            that.index_const_tax = '-';
          }
          /** Index construction **/
          var y = that.cusIndexService._exclusionCompData.length;
          that.index_const_calcu = y - that.indexRulesData[0]['noofComp'];
          /** Index construction **/
          that.showIndexRulesLoader = false;
        },
        (reject) => {
          //// Error handler index steps
          that.toastr.success(that.sharedData.checkMyAppMessage(3, 68), '', {
            timeOut: 5000,
            progressBar: false,
            positionClass: 'toast-top-center',
          });
          /** Open Alpha **/
          that.showDefault_select = 'Alpha';
          /** Open Alpha **/
          setTimeout(
            function () {
              that.sharedData.showMatLoader.next(false);
              that.sharedData.showCenterLoader.next(false);
              that.showIndexRulesLoader = false;
            }.bind(this),
            1000
          );
        }
      );
    }
  }
  checkSelectionWeight_Steps() {
    if (
      this.indexRulesData[0].selectBy.length > 0 ||
      this.indexRulesData[0].noofComp != null ||
      this.indexRulesData[0].weightBy.length > 0 ||
      this.indexRulesData[0].taxEffAwareness != null
    ) {
      return true;
    } else {
      return false;
    }
  }
  builIndexCalculate() {
    var that = this;
    this.loadAccChange();
    this.bldMyIndcheck = true;
    $('#lockInfoTradeModal').modal('hide');
    //that.sharedData.tempTaxharvestEnable.next(false);
    that.cusIndexService.calculate_active.next(true);
    this.bldMyIndcheck = true;
    //that.sharedData.showSpinner_buy.next(false);
    //that.sharedData.showSpinnerPercentage_buy.next(100);
    //that.cusIndexService.showReviewIndex.next(false);
    //that.sharedData.showReviewIndexLoaded.next(false);
    if (
      this.bldMyIndselNoCompWeight <= 0 &&
      this.cusIndexService.custToolWeightFlag.value == 'N'
    ) {
      this.bldMyIndselNoCompWeight = 100;
    }
    if (isNullOrUndefined(this.custToolTaxEffAwareness)) {
      this.cusIndexService.custToolTaxEffAwareness.next('N');
    }
    if (isNullOrUndefined(this.custToolWeightFlag)) {
      this.cusIndexService.custToolWeightFlag.next('N');
    }
    if (
      this.getExclCompData.length < this.cusIndexService.minCustInd.count ||
      isNullOrUndefined(this.custToolNoOfComp)
    ) {
      this.custToolNoOfComp = this.getExclCompData.length;
    }
    if (
      isNotNullOrUndefined(this.custToolSelectByValue) &&
      isNotNullOrUndefined(this.custToolNoOfComp) &&
      isNotNullOrUndefined(this.custToolWeightByValue) &&
      this.getExclCompData.length > this.cusIndexService.minCustInd.count - 1 &&
      this.custToolSelectByValue > 0 &&
      this.custToolNoOfComp > 0 &&
      this.custToolWeightByValue > 0 &&
      this.bldMyIndselNoCompWeight > 0
    ) {
      if (that.checkforcepopup_modal()) {
        that.cusIndexService.forcepopupStrategy.next(true);
        that.openforceModal();
      } else {
        that.cusIndexService.forcepopupStrategy.next(false);
        this.cusIndexService.CIcalculateBtnEnable = true;
        this.sharedData.showMatLoader.next(true);
        this.showSpinnerAcc_settings = true;
        this.bldMyIndcheck = false;
        if (this.expand_weight_show) {
          this.cusIndexService.bldMyIndselWeightLimit.next(
            this.bldMyIndselNoCompWeight
          );
        } else {
          this.cusIndexService.bldMyIndselWeightLimit.next(100);
        }
        this.cusIndexService.custToolNoOfComp.next(this.custToolNoOfComp);
        this.sharedData.userEventTrack(
          'Tool Customization',
          this.cusIndexService.customizeSelectedIndex_custom.value.name,
          this.cusIndexService.customizeSelectedIndex_custom.value.name,
          'Custom Indexing Calculate'
        );
        that.cusIndexService.calculate_active.next(true);
        that.cusIndexService.saveCustomIndexFilter();
        this.cusIndexService.saveBldsel(true);
      }
    } else {
      if (
        this.cusIndexService._custToolSelectByValue == 0 ||
        this.cusIndexService._custToolWeightByValue == 0
      ) {
      } else {
        that.toastr.success(this.sharedData.checkMyAppMessage(3, 69), '', {
          timeOut: 5000,
          progressBar: false,
          positionClass: 'toast-top-center',
        });
      }
      that.leftMenuClick('Selection');
    }
  }
  accotdionHighlight: string = '';
  FactorClick(d: any) {
    var that = this;
    var con: boolean = false;
    var tab: string = d['data']['perorval'] == 0 ? 'percent' : 'val';
    try {
      con = that.cusIndexService.checkBelow100Comp(
        that.cusIndexService.exclusionCompData.value,
        that.cusIndexService.remCompData.value,
        that.cusIndexService.remGicsData.value,
        that.cusIndexService.getStrFacData(d['id'], d['data']['startval'], d['data']['endval'], tab, d['data']['orgTopValue'], d['data']['orgBottomValue'])
      );
    } catch (e) { }
    if (!con) {
      this.accotdionHighlight = '';
      this.cusIndexService.custSelectFactor.next(undefined);
      var msgTxt: string = 'Insufficient components to proceed with the current selection. Please adjust your previous selection for the required components for ' + d.displayname +' factor';
      that.sharedData.showAlertMsg2("", msgTxt);
      setTimeout(() => {
        var cl: string = '#accordH' + d['id'];
        d3.selectAll(cl).classed('collapsed', true).attr('aria-expanded',false);
        d3.selectAll('#accordionFactors').selectAll('.collapse').classed('show', false);
      }, 500);
    } else {
      this.cusIndexService.custSelectFactor.next(d);
      this.accotdionHighlight = d.displayname;
      this.getSelecedFactorData();
      if (d.id == 12) {
        var className = '.factors_accordion .scrollbox';
        this.scrollToBottom(className);
      }
    }
    this.sharedData.userEventTrack('Tool Customization', 'Filter Factor', d.name, 'Factor select');
  }

  getSelecedFactorData() {
    var data: any = [];
    var selFact: any = this.cusIndexService.custSelectFactor.value;
    var factKey: string = this.cusIndexService.checkFactorKey(selFact['id']);
    this.cusIndexService.getExclFactorCompData().then((res: any) => {
      var ndata: any = [...res];
      var factorData = [...this.cusIndexService.comFactorsData.value].filter(
        (x: any) => isNotNullOrUndefined(x[factKey])
      );
      var newComp = factorData.filter(this.addcomparerfact(ndata));
      //var dmin = d3.min(newComp.map(x => x[factKey]));
      //var dmax = d3.max(newComp.map(x => x[factKey]));
      //var per = d3.scaleLinear().domain([dmin, dmax]).range([0, 100]);
      [...ndata].forEach(function (d: any, i: number) {
        var nda = factorData.filter((dd) => dd.Stockkey == d.stockKey);
        if (nda.length > 0) {
          var cDt = Object.assign({}, d);
          cDt['factorValue'] = nda[0][factKey];
          data.push(cDt);
        } else {
        }
      });
      data.sort(function (x: any, y: any) {
        return d3.descending(
          parseFloat(x.factorValue),
          parseFloat(y.factorValue)
        );
      });
      this.cusIndexService.custSelectFactorData.next(data);
    });
  }

  remcomparer(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return other == current.stockKey;
        }).length > 0
      );
    };
  }
  addcomparerfact(otherArray: any) {
    return function (current: any) {
      return (
        otherArray.filter(function (other: any) {
          return other.Stockkey == current.stockKey;
        }).length > 0
      );
    };
  }

  showRemComp: boolean = false;
  showRemovedComp() {
    this.companySearch.reset();
    this.showRemComp = !this.showRemComp;
    var res: any = this.cusIndexService.exclusionCompData.value;
    var compData = res.map(({ companyName, ticker, stockKey }: any) => ({
      name: companyName,
      ticker: ticker,
      stockKey: stockKey,
    }));
    if (this.showRemComp) {
      var dt: any = [...compData].filter(
        this.remcomparer(this.cusIndexService.remCompData.value)
      );
      this.companydataSource = new MatTableDataSource<any>(dt);
    } else {
      this.companydataSource = new MatTableDataSource<any>(compData);
      this.onSort();
    }
  }
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
  }
  SelFilter: string = 'CN_asc';
  FilterChanged(val: any) {
    this.SelFilter = val.value;
    this.companySearch.reset();
    this.onSort();
    $('.dropdown-menu-right').removeClass('show');
    this.sharedData.checkPostSortSetting('L', val, this.ascending_val, 'ci');
  }

  ascending_val: boolean = true;
  onToggleAscending() {
    let that = this;
    this.ascending_val = !this.ascending_val;
    this.companySearch.reset();
    this.onSort();
    let selFilterData = this.FilterList.filter((x: any) => x.value == this.SelFilter);
    if (selFilterData.length > 0) { this.sharedData.checkPostSortSetting('L', selFilterData[0], this.ascending_val, 'ci'); }
  }
  onSort() {
    let that = this;
    let selFilterData = this.FilterList.filter((x: any) => x.value == that.SelFilter)[0];
    var dat = that.RangeFilterGrid(selFilterData.value, that.companydataSource.data);
    this.companydataSource = new MatTableDataSource<any>(dat);
  }
  RangeFilterGrid(IndexN: any, data: any) {
    var that = this;    
    if (IndexN == 3 && that.ascending_val == true) {
      data = data.sort(function (x: any, y: any) { return d3.ascending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); });    }
    if (IndexN == 3 && that.ascending_val == false) {
      data = data.sort(function (x: any, y: any) { return d3.descending(escape(x.name.toUpperCase()), escape(y.name.toUpperCase())); });
    }
    if (IndexN == 4 && that.ascending_val == true) {
      data = data.sort(function (x: any, y: any) { return d3.ascending(x.ticker, y.ticker); });
    }
    if (IndexN == 4 && that.ascending_val == false) {
      data = data.sort(function (x: any, y: any) { return d3.descending(x.ticker, y.ticker); });
    }
    var rowi = 0;
    var rowj = 0;
    data.forEach(function (nextState: any, i: any) {
      if (nextState.isin != '') { rowi++; rowj++; }
      nextState.index = rowi;
      nextState.sort = rowj;
      nextState.rank = rowi;
    });
    return data;
  }

  factorChange(d: any) { }

  checkFactorValid(val1: any, val2: any) {
    return +val1 < +val2;
  }
}
