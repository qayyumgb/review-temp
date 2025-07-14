import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first, interval, retry, switchMap, window } from 'rxjs';
import { DataService } from '../data/data.service';
import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { Workbook } from 'exceljs';
// @ts-ignore
import * as FileSaver from 'file-saver';
// @ts-ignore
import { saveAs } from "file-saver";
// @ts-ignore
import * as d3 from 'd3';
declare var $: any;
import { UserSettings } from '../user/user';
import moment from 'moment-timezone';
import { UserService } from '../user/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Angulartics2 } from 'angulartics2';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { CommonErrorDialogComponent } from '../../../view/custom-indexing/error-dialogs/common-error-dialog/common-error-dialog.component';
import { Router, RoutesRecognized } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsertrackService } from '../usertrack.service';
import { ascending, descending } from 'd3';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  GetAllocDate: any;
  ciMinCircleShowCount: number = 200;
  cirArcGrdClr = ["#7e7e85", "#7e7e85"];
  tradeTiming = { tradeCount: '', tradeTimes: '', showCount: false, showTradeTime: false, showTradeBtn: false, tradeStart: false, tradeEnd: false };
  compDis = [
    ['This document is provided for informational purposes only and should not be construed as investment advice or an offer or solicitation to buy or sell securities.  The discussion of any companies mentioned is this document is not an endorsement of any company or a recommendation to buy, sell or hold any security.Investors are urged to consult with their financial advisors before buying or selling any securities.Any forecasts or predictions are subject to high levels of uncertainty that may affect actual performance.Accordingly, all such predictions should be viewed as merely representative of a broad range of possible outcomes'],
    ['This information has been prepared for informational purposes only and does not replace information you receive directly from your custodian.  This report has been prepared from data believed to be reliable, but no representation is being made as to its accuracy or completeness.  This information is current as of the date it is dowloaded from the system. It may change without notice.'],
    ['Please be advised that: New Age Alpha is not a CPA and this is not tax advice;  Tax laws and rates change periodically; and For specific, personalized tax-related advice, consult with a CPA or other tax professional'],
    [`All New Age Alpha trademarks are owned by New Age Alpha LLC. S&P® is a registered trademark of Standard & Poor's Financial Services LLC(SPFS).All other company or product names mentioned herein are the property of their respective owners and should not be deemed to be an endorsement of any New Age Alpha product or fund.`],
    ['Information contained herein has been obtained from sources believed to be reliable, but not guaranteed. It has been prepared solely for informational purposes on an “as is” basis and New Age Alpha does not make any warranty or representation regarding the information. Investors should be aware of the risks associated with data sources and quantitative processes used in our investment management process. Errors may exist in data acquired from third party vendors'],
    ['CC:NAA10389 | SKU:10244']
  ];

  PSasOfDate: string = "-";

  saveChangePlace: string = "";

  excelDisclosures: BehaviorSubject<any>;
  _excelDisclosures: any = [];

  tradingHoursData: BehaviorSubject<any>;
  _tradingHoursData: any = [];

  getSortSettingData: BehaviorSubject<any>;
  _getSortSettingData: any = [];

  getSortMasterData: BehaviorSubject<any>;
  _getSortMasterData: any = [];

  circleRangeData: BehaviorSubject<any>;
  _circleRangeData: any = [];

  circletitle: BehaviorSubject<any>;
  _circletitle: any = [];

  refreshAlreadytradedStrategy: BehaviorSubject<boolean>;
  _refreshAlreadytradedStrategy: boolean = false;

  tradeCashType: string = '';
  selTradeData: any = { type: "", data: [], accountInfo: [], tradeType: 0, dontSellflag: false, routeflag: '' };

  rebalanceDates: BehaviorSubject<any>;
  _rebalanceDates: any = [];

  equityHoldDate = "";
  popMessages: any = [];
  defaultRebalanceType: string = 'q';
  userPrefData: BehaviorSubject<UserSettings>;
  _userPrefData: UserSettings = new UserSettings;

  ETFIndex: BehaviorSubject<any>
  _ETFIndex: any = [];

  showMatLoader: BehaviorSubject<boolean>;
  _showMatLoader: boolean = false;

  showRebalanceTrigger: BehaviorSubject<boolean>;
  _showRebalanceTrigger: boolean = false;

  openUniverseMenu: BehaviorSubject<boolean>;
  _openUniverseMenu: boolean = false;

  uname: BehaviorSubject<string>;
  _uname: string = '';

  showSideNavBar: BehaviorSubject<boolean>;
  _showSideNavBar: boolean = false;

  showCircleLoader: BehaviorSubject<boolean>;
  _showCircleLoader: boolean = false;

  showCenterLoader: BehaviorSubject<boolean>;
  _showCenterLoader: boolean = false;

  authenticateList: BehaviorSubject<any>;
  _authenticateList: any = [];

  UserTabsRolePermissionData: BehaviorSubject<any>;
  _UserTabsRolePermissionData: any = [];

  GetAllPresentationdata: BehaviorSubject<any>;
  _GetAllPresentationdata: any = [];

  GetAllPresentationtickers: BehaviorSubject<any>;
  _GetAllPresentationtickers: any = [];

  GetDefaultPresentationdata: BehaviorSubject<any>;
  _GetDefaultPresentationdata: any = [];

  licenceAgreement: BehaviorSubject<any>;
  _licenceAgreement: any = [];

  UserMenuRolePermission: BehaviorSubject<any>;
  _UserMenuRolePermission: any = [];

  showMaintanenceDate: BehaviorSubject<any>;
  _showMaintanenceDate: any = [];

  getPinnedMenuItems: BehaviorSubject<any>;
  _getPinnedMenuItems: any = [];

  openClickedLeftSide: BehaviorSubject<boolean>;
  _openClickedLeftSide: boolean = true;

  openClickedRightSide: BehaviorSubject<boolean>;
  _openClickedRightSide: boolean = true;

  getSelectedLeftSide: BehaviorSubject<string>;
  _getSelectedLeftSide: string = 'Y';

  getSelectedRightSide: BehaviorSubject<string>;
  _getSelectedRightSide: string = 'Y';

  openPinnedLeftSide: BehaviorSubject<boolean>;
  _openPinnedLeftSide: boolean = true;

  openPinnedRightSide: BehaviorSubject<boolean>;
  _openPinnedRightSide: boolean = true;

 

  getPresentationMode: BehaviorSubject<string>;
  _getPresentationMode: string = 'N';

  getThemeColorMode: BehaviorSubject<string>;
  _getThemeColorMode: string = 'layout1';

  getFontSettings: BehaviorSubject<number>;
  _getFontSettings: number = 0;

  getSwapTileData: BehaviorSubject<any>;
  _getSwapTileData: any = [];

  selResData: BehaviorSubject<any>;
  _selResData: any = [];

  GetESGScoreData: BehaviorSubject<any>;
  _GetESGScoreData: any = [];

  GetSchedularMaster: BehaviorSubject<any>;
  _GetSchedularMaster: any = [];

  getNotificationQueue: BehaviorSubject<any>
  _getNotificationQueue: any = [];

  getTradeNotificationQueue: BehaviorSubject<any>
  _getTradeNotificationQueue: any = [];

  globalDialog: BehaviorSubject<any>
  _globaldialog: string = '';

  showNavPPT_Ticker: BehaviorSubject<string>;
  _showNavPPT_Ticker: string = '';


  showNavPPT_CenterCircle: BehaviorSubject<boolean>;
  _showNavPPT_CenterCircle: boolean = false;

  show_funded: BehaviorSubject<boolean>;
  _show_funded: boolean = false;

  getNotificationQueueCount: BehaviorSubject<number>
  _getNotificationQueueCount: number = 0;

  getTradeNotificationQueueCount: BehaviorSubject<number>
  _getTradeNotificationQueueCount: number = 0;

  openNotification: BehaviorSubject<boolean>;
  _openNotification: boolean = false;

  openWatchlist: BehaviorSubject<boolean>;
  _openWatchlist: boolean = false;

  openTradeNotification: BehaviorSubject<boolean>;
  _openTradeNotification: boolean = false;

  sendSignal_LDMode: BehaviorSubject<boolean>;
  _sendSignal_LDMode: boolean = false;

  immediateLiquidate: BehaviorSubject<boolean>;
  _immediateLiquidate: boolean = false;

  triggerDontSell: BehaviorSubject<boolean>;
  _triggerDontSell: boolean = false;

  viewPortFolio: BehaviorSubject<boolean>;
  _viewPortFolio: boolean = false;

  triAccTrade: BehaviorSubject<boolean>;
  _triAccTrade: boolean = false;

  frmGlobalSearchClick: BehaviorSubject<boolean>;
  _frmGlobalSearchClick: boolean = false;

  GetlatestBMCompData: BehaviorSubject<any>;
  _GetlatestBMCompData: any = [];

  openAccOverviewId: BehaviorSubject<string>;
  _openAccOverviewId: string = "";

  taxLotData: BehaviorSubject<any>;
  _taxLotData: any = [];

  getRebalancesPopupData: BehaviorSubject<any>
  _getRebalancesPopupData: any = [];

  openTradedStrategiesTab: BehaviorSubject<any>;
  _openTradedStrategiesTab: boolean = false;

  openAccOverviewActiveId: BehaviorSubject<string>;
  _openAccOverviewActiveId: string = "";

  showSpinner: BehaviorSubject<boolean>;
  _showSpinner: boolean = false;

  showErrorDialogBox: BehaviorSubject<boolean>;
  _showErrorDialogBox: boolean = false;

  notifyIndexClick: BehaviorSubject<boolean>;
  _notifyIndexClick: boolean = false;

  rouletCircleHomeClick: BehaviorSubject<boolean>;
  _rouletCircleHomeClick: boolean = true;

  rouletCircleHomeRotate: BehaviorSubject<boolean>;
  _rouletCircleHomeRotate: boolean = true;

  showDefaultSideGrids: BehaviorSubject<boolean>;
  _showDefaultSideGrids: boolean = true;

  EqGrowthData: BehaviorSubject<any>;
  _EqGrowthData: any = [];

  EqValueData: BehaviorSubject<any>;
  _EqValueData: any = [];

  selResETFData: BehaviorSubject<any>;
  _selResETFData: any = [];

  dbGICS: BehaviorSubject<any>;
  _dbGICS: any = [];
  GetESGScoress: any = [];
  selEestrictedList: any = { type: "", data: "" };
  IndexOrder = [
    { "index": "S&P 500", "order": 1 },
    { "index": "S&P 400", "order": 2 },
    { "index": "S&P 600", "order": 3 },
    { "index": "S&P USA Extra", "order": 4 },
    { "index": "S&P USA Ex S&P 1500", "order": 4 },
    { "index": "S&P Europe Ex UK", "order": 5 },
    { "index": "S&P United Kingdom Index", "order": 6 },
    { "index": "S&P United Kingdom", "order": 6 },
    { "index": "S&P Japan Index", "order": 7 },
    { "index": "S&P Japan", "order": 7 },
    { "index": "South Africa", "order": 8 },
    { "index": "S&P South Africa", "order": 8 },
    { "index": "Australia", "order": 9 },
    { "index": "S&P Australia BMI", "order": 9 },
    { "index": "Canada", "order": 10 },
    { "index": "S&P Canada BMI", "order": 10 },
    { "index": "Korea", "order": 11 },
    { "index": "S&P Korea BMI", "order": 11 },
    { "index": "New Age Alpha U.S. Large-Cap Leading Index", "order": 11 },
    { "index": "New Age Alpha U.S. Large-Cap Low Volatility Index", "order": 12 },
    { "index": "New Age Alpha U.S. Small-Cap Leading Index", "order": 13 },
    { "index": "New Age Alpha U.S. Small-Cap Low Volatility Index", "order": 14 },
    { "index": "New Age Alpha Europe ex UK Leading Index", "order": 15 },
    { "index": "New Age Alpha Europe ex UK Low Volatility Index", "order": 16 },
    { "index": "New Age Alpha UK Leading Index", "order": 17 },
    { "index": "New Age Alpha UK Low Volatility Index", "order": 18 },
    { "index": "New Age Alpha Japan Leading Index", "order": 19 },
    { "index": "New Age Alpha Japan Low Volatility Index", "order": 20 }
  ];
  rebalancePeriod: rPeriod[] = [
    { "rebalancefreq": "q", "rebalancefreqName": "Quarterly" },
    { "rebalancefreq": "h", "rebalancefreqName": "Semi-annually" },
    { "rebalancefreq": "a", "rebalancefreqName": "Annually" }
  ];
  selectedAccountCompanyList: BehaviorSubject<any>;
  _selectedAccountCompanyList: any = [];

  stgyListDashAccsData: BehaviorSubject<any>;
  _stgyListDashAccsData: any = [];

  WatchListData: BehaviorSubject<any>;
  _WatchListData: any = [];

  AllocListData: BehaviorSubject<any>
  _AllocListData: any = [];

  getHNotificationQueue: BehaviorSubject<any>
  _getHNotificationQueue: any = [];

  dragDropData: BehaviorSubject<any>;
  _dragDropData: any = [];

  userPortfolioDragDrop: BehaviorSubject<any>;
  _userPortfolioDragDrop: any = [];
  constructor(private userTrack: UsertrackService, private toastr: ToastrService, private router: Router, public dialog: MatDialog, private angulartics2: Angulartics2, private dataService: DataService, private logger: LoggerService, private datepipe: DatePipe) {
    var that = this;
    try {
      this.router['events'].pipe(filter((event: any) => event instanceof RoutesRecognized))
        .subscribe((event: any) => { that.getPermission(); });
    } catch (e) { }

    this.dragDropData = new BehaviorSubject<any>(this._dragDropData);
    this.dragDropData.subscribe(data => { this._dragDropData = data; });

    this.userPortfolioDragDrop = new BehaviorSubject<any>(this._userPortfolioDragDrop);
    this.userPortfolioDragDrop.subscribe(data => { this._userPortfolioDragDrop = data; });

    this.AllocListData = new BehaviorSubject<any>(this._AllocListData);
    this.AllocListData.subscribe(data => { this._AllocListData = data; });

    this.WatchListData = new BehaviorSubject<any>(this._WatchListData);
    this.WatchListData.subscribe(data => { this._WatchListData = data; });

    this.getRebalancesPopupData = new BehaviorSubject<any>(this._getRebalancesPopupData);
    this.getRebalancesPopupData.subscribe(data => { this._getRebalancesPopupData = data; });

    this.openTradedStrategiesTab = new BehaviorSubject<any>(this._openTradedStrategiesTab);
    this.openTradedStrategiesTab.subscribe(data => { this._openTradedStrategiesTab = data; });

    this.refreshAlreadytradedStrategy = new BehaviorSubject<boolean>(this._refreshAlreadytradedStrategy);
    this.refreshAlreadytradedStrategy.subscribe(data => { this._refreshAlreadytradedStrategy = data; });

    this.rebalanceDates = new BehaviorSubject<any>(this._rebalanceDates);
    this.rebalanceDates.subscribe(data => { this._rebalanceDates = data });

    this.tradingHoursData = new BehaviorSubject<any>(this._tradingHoursData);
    this.tradingHoursData.subscribe(data => { this._tradingHoursData = data; });

    this.getSortSettingData = new BehaviorSubject<any>(this._getSortSettingData);
    this.getSortSettingData.subscribe(data => { this._getSortSettingData = data; });

    this.getSortMasterData = new BehaviorSubject<any>(this._getSortMasterData);
    this.getSortMasterData.subscribe(data => { this._getSortMasterData = data; });


    this.circleRangeData = new BehaviorSubject<any>(this._circleRangeData);
    this.circleRangeData.subscribe(data => { this._circleRangeData = data; });
    
    this.circletitle = new BehaviorSubject<any>(this._circletitle);
    this.circletitle.subscribe(data => { this._circletitle= data; });
    
    this.stgyListDashAccsData = new BehaviorSubject<any>(this._stgyListDashAccsData);
    this.stgyListDashAccsData.subscribe(data => { this._stgyListDashAccsData = data; });

    this.selectedAccountCompanyList = new BehaviorSubject<any>(this._selectedAccountCompanyList);
    this.selectedAccountCompanyList.subscribe(data => { this._selectedAccountCompanyList = data; });

    this.immediateLiquidate = new BehaviorSubject<boolean>(this._immediateLiquidate);
    this.immediateLiquidate.subscribe(data => { this._immediateLiquidate = data; });

    this.triggerDontSell = new BehaviorSubject<boolean>(this._triggerDontSell);
    this.triggerDontSell.subscribe(data => { this._triggerDontSell = data; });

    this.GetlatestBMCompData = new BehaviorSubject<any>(this._GetlatestBMCompData);
    this.GetlatestBMCompData.subscribe(data => { this._GetlatestBMCompData = data; });

    this.openAccOverviewActiveId = new BehaviorSubject<any>(this._openAccOverviewActiveId);
    this.openAccOverviewActiveId.subscribe(data => { this._openAccOverviewActiveId = data; });

    this.taxLotData = new BehaviorSubject<any>(this._taxLotData);
    this.taxLotData.subscribe(data => { this._taxLotData = data; });

    this.excelDisclosures = new BehaviorSubject<any>(this._excelDisclosures);
    this.excelDisclosures.subscribe(data => { this._excelDisclosures = data; });

    this.userPrefData = new BehaviorSubject<UserSettings>(this._userPrefData);
    this.userPrefData.subscribe(data => { this._userPrefData = data; });

    this.showMatLoader = new BehaviorSubject<boolean>(this._showMatLoader);
    this.showMatLoader.subscribe(data => { this._showMatLoader = data; });

    this.frmGlobalSearchClick = new BehaviorSubject<boolean>(this._frmGlobalSearchClick);
    this.frmGlobalSearchClick.subscribe(data => { this._frmGlobalSearchClick = data; });

    this.showRebalanceTrigger = new BehaviorSubject<boolean>(this._showRebalanceTrigger);
    this.showRebalanceTrigger.subscribe(data => { this._showRebalanceTrigger = data; });

    this.openUniverseMenu = new BehaviorSubject<boolean>(this._openUniverseMenu);
    this.openUniverseMenu.subscribe(data => { this._openUniverseMenu = data; });

    this.uname = new BehaviorSubject<string>(this._uname);
    this.uname.subscribe(data => { this._uname = data; });

    this.showSideNavBar = new BehaviorSubject<boolean>(this._showSideNavBar);
    this.showSideNavBar.subscribe(data => { this._showSideNavBar = data; });

    this.showCircleLoader = new BehaviorSubject<boolean>(this._showCircleLoader);
    this.showCircleLoader.subscribe(data => { this._showCircleLoader = data; });

    this.showCenterLoader = new BehaviorSubject<boolean>(this._showCenterLoader);
    this.showCenterLoader.subscribe(data => { this._showCenterLoader = data; });

    this.authenticateList = new BehaviorSubject<any>(this._authenticateList);
    this.authenticateList.subscribe(data => { this._authenticateList = data; });

    this.UserTabsRolePermissionData = new BehaviorSubject<any>(this._UserTabsRolePermissionData);
    this.UserTabsRolePermissionData.subscribe(data => { this._UserTabsRolePermissionData = data; });

    this.GetDefaultPresentationdata = new BehaviorSubject<any>(this._GetDefaultPresentationdata);
    this.GetDefaultPresentationdata.subscribe(data => { this._GetDefaultPresentationdata = data; });

    this.GetAllPresentationdata = new BehaviorSubject<any>(this._GetAllPresentationdata);
    this.GetAllPresentationdata.subscribe(data => { this._GetAllPresentationdata = data; });

    this.GetAllPresentationtickers = new BehaviorSubject<any>(this._GetAllPresentationtickers);
    this.GetAllPresentationtickers.subscribe(data => { this._GetAllPresentationtickers = data; });

    this.licenceAgreement = new BehaviorSubject<any>(this._licenceAgreement);
    this.licenceAgreement.subscribe(data => { this._licenceAgreement = data; });

    this.UserMenuRolePermission = new BehaviorSubject<any>(this._UserMenuRolePermission);
    this.UserMenuRolePermission.subscribe(data => { this._UserMenuRolePermission = data; });

    this.showMaintanenceDate = new BehaviorSubject<any>(this._showMaintanenceDate);
    this.showMaintanenceDate.subscribe(data => { this._showMaintanenceDate = data; });

    this.getPinnedMenuItems = new BehaviorSubject<any>(this._getPinnedMenuItems);
    this.getPinnedMenuItems.subscribe(data => { this._getPinnedMenuItems = data; });

    this.getSelectedLeftSide = new BehaviorSubject<any>(this._getSelectedLeftSide);
    this.getSelectedLeftSide.subscribe(data => { this._getSelectedLeftSide = data; });

    this.getSelectedRightSide = new BehaviorSubject<any>(this._getSelectedRightSide);
    this.getSelectedRightSide.subscribe(data => { this._getSelectedRightSide = data; });

    this.openPinnedLeftSide = new BehaviorSubject<any>(this._openPinnedLeftSide);
    this.openPinnedLeftSide.subscribe(data => { this._openPinnedLeftSide = data; });

    this.openClickedLeftSide = new BehaviorSubject<any>(this._openClickedLeftSide);
    this.openClickedLeftSide.subscribe(data => { this._openClickedLeftSide = data; });

    this.openClickedRightSide = new BehaviorSubject<any>(this._openClickedRightSide);
    this.openClickedRightSide.subscribe(data => { this._openClickedRightSide = data; });

    this.openPinnedRightSide = new BehaviorSubject<any>(this._openPinnedRightSide);
    this.openPinnedRightSide.subscribe(data => { this._openPinnedRightSide = data; });


    this.getFontSettings = new BehaviorSubject<number>(this._getFontSettings);
    this.getFontSettings.subscribe(data => { this._getFontSettings = data; });

    this.getPresentationMode = new BehaviorSubject<string>(this._getPresentationMode);
    this.getPresentationMode.subscribe(data => { this._getPresentationMode = data; });

    this.getThemeColorMode = new BehaviorSubject<string>(this._getThemeColorMode);
    this.getThemeColorMode.subscribe(data => { this._getThemeColorMode = data; });

    this.showNavPPT_Ticker = new BehaviorSubject<string>(this._showNavPPT_Ticker);
    this.showNavPPT_Ticker.subscribe(data => { this._showNavPPT_Ticker = data; });

    this.getSwapTileData = new BehaviorSubject<any>(this._getSwapTileData);
    this.getSwapTileData.subscribe(data => { this._getSwapTileData = data; });


    this.selResData = new BehaviorSubject<any>(this._selResData);
    this.selResData.subscribe(data => { this._selResData = data; });

    this.GetESGScoreData = new BehaviorSubject<any>(this._GetESGScoreData);
    this.GetESGScoreData.subscribe(data => { this._GetESGScoreData = data; });

    this.GetSchedularMaster = new BehaviorSubject<any>(this._GetSchedularMaster);
    this.GetSchedularMaster.subscribe(data => { this._GetSchedularMaster = data; });

    this.openAccOverviewId = new BehaviorSubject<string>(this._openAccOverviewId);
    this.openAccOverviewId.subscribe(data => { this._openAccOverviewId = data; });

    this.dbGICS = new BehaviorSubject<any>(this._dbGICS);
    this.dbGICS.subscribe(data => { this._dbGICS = data; });

    this.getTradeNotificationQueue = new BehaviorSubject<any>(this._getTradeNotificationQueue);
    this.getTradeNotificationQueue.subscribe(data => { this._getTradeNotificationQueue = data; });

    this.getNotificationQueue = new BehaviorSubject<any>(this._getNotificationQueue);
    this.getNotificationQueue.subscribe(data => { this._getNotificationQueue = data; });

    this.globalDialog = new BehaviorSubject<any>(this._globaldialog);
    this.globalDialog.subscribe(data => {
      this._globaldialog = data;
    });

    this.show_funded = new BehaviorSubject<boolean>(this._show_funded);
    this.show_funded.subscribe(data => { this._show_funded = data; });

    this.showNavPPT_CenterCircle = new BehaviorSubject<boolean>(this._showNavPPT_CenterCircle);
    this.showNavPPT_CenterCircle.subscribe(data => { this._showNavPPT_CenterCircle = data; });

    this.getNotificationQueueCount = new BehaviorSubject<number>(this._getNotificationQueueCount);
    this.getNotificationQueueCount.subscribe(data => { this._getNotificationQueueCount = data; });

    this.getTradeNotificationQueueCount = new BehaviorSubject<number>(this._getTradeNotificationQueueCount);
    this.getTradeNotificationQueueCount.subscribe(data => { this._getTradeNotificationQueueCount = data; });

    this.openNotification = new BehaviorSubject<boolean>(this._openNotification);
    this.openNotification.subscribe(data => { this._openNotification = data; });

    this.openWatchlist = new BehaviorSubject<boolean>(this._openWatchlist);
    this.openWatchlist.subscribe(data => { this._openWatchlist = data; });

    this.openTradeNotification = new BehaviorSubject<boolean>(this._openTradeNotification);
    this.openTradeNotification.subscribe(data => { this._openTradeNotification = data; });

    this.sendSignal_LDMode = new BehaviorSubject<boolean>(this._sendSignal_LDMode);
    this.sendSignal_LDMode.subscribe(data => { this._sendSignal_LDMode = data; });

    this.ETFIndex = new BehaviorSubject<any>(this._ETFIndex);
    this.ETFIndex.subscribe(data => { this._ETFIndex = data; });

    // viewPortfolio
    this.viewPortFolio = new BehaviorSubject<boolean>(this._viewPortFolio);
    this.viewPortFolio.subscribe(data => { this._viewPortFolio = data; });

    this.triAccTrade = new BehaviorSubject<boolean>(this._triAccTrade);
    this.triAccTrade.subscribe(data => { this._triAccTrade = data; });

    this.showSpinner = new BehaviorSubject<boolean>(this._showSpinner);
    this.showSpinner.subscribe(data => { this._showSpinner = data; });

    this.showErrorDialogBox = new BehaviorSubject<boolean>(this._showErrorDialogBox);
    this.showErrorDialogBox.subscribe(data => { this._showErrorDialogBox = data; });

    this.notifyIndexClick = new BehaviorSubject<boolean>(this._notifyIndexClick);
    this.notifyIndexClick.subscribe(data => { this._notifyIndexClick = data; });

    this.rouletCircleHomeClick = new BehaviorSubject<boolean>(this._rouletCircleHomeClick);
    this.rouletCircleHomeClick.subscribe(data => { this._rouletCircleHomeClick = data; });

    this.rouletCircleHomeRotate = new BehaviorSubject<boolean>(this._rouletCircleHomeRotate);
    this.rouletCircleHomeRotate.subscribe(data => { this._rouletCircleHomeRotate = data; });

    this.showDefaultSideGrids = new BehaviorSubject<boolean>(this._showDefaultSideGrids);
    this.showDefaultSideGrids.subscribe(data => { this._showDefaultSideGrids = data; });

    this.EqGrowthData = new BehaviorSubject<any>(this._EqGrowthData);
    this.EqGrowthData.subscribe(data => { this._EqGrowthData = data; });

    this.EqValueData = new BehaviorSubject<any>(this._EqValueData);
    this.EqValueData.subscribe(data => { this._EqValueData = data; });

    this.selResETFData = new BehaviorSubject<any>(this._selResETFData);
    this.selResETFData.subscribe(data => { this._selResETFData = data; });

    this.getHNotificationQueue = new BehaviorSubject<any>(this._getHNotificationQueue);
    this.getHNotificationQueue.subscribe(data => { this._getHNotificationQueue = data; });
  }

  GetUserTabsRolePermissionSub: any;
  GetUserMenuRolePermissionSub: any;
  getPermission() {
    var that = this;
    if (isNotNullOrUndefined(sessionStorage['currentUser'])) {
      var rolId = JSON.parse(sessionStorage['currentUser']).roleId;
      try { that.GetUserTabsRolePermissionSub.unsubscribe(); } catch (e) { }
      this.GetUserTabsRolePermissionSub= this.dataService.GetUserTabsRolePermission(rolId).pipe(first()).subscribe((res: any) => {
        this.UserTabsRolePermissionData.next(res);
        try { that.GetUserMenuRolePermissionSub.unsubscribe(); } catch (e) { }
        this.GetUserMenuRolePermissionSub= this.dataService.GetUserMenuRolePermission(rolId).pipe(first()).subscribe((res: any) => {
          this.UserMenuRolePermission.next(res);
        }, (error: any) => { });
      }, (error: any) => { });
    }
  }

  userEventTrack(category: any, type: any, label: any, action: any) {
    var that = this;
    try {
      var ty = type + " : " + label;
      that.userTrack.ProcInsertEvent(category, ty, label, action);
      that.angulartics2.eventTrack.next({ action: action, properties: { category: category, label: label } });
    } catch (e) { }
  }

  checkShowLeftTab(CatId: any) {
    var tabData = this.UserTabsRolePermissionData.value;
    if (tabData.length > 0) {
      var d = tabData.filter((x: any) => x.CatId == CatId);
      if (d.length > 0) { return d[0].Status; } else { return 'N'; }
    } else { return 'N'; }
  }
  GetlatestBMComp() {
    if (this.GetlatestBMCompData.value.length == 0) {
      this.dataService.GetlatestBMCompanies().pipe(first()).subscribe((data: any) => { this.GetlatestBMCompData.next(data); }, error => { });
    }
  }
  checkMyUserType() {
    var userType: any = null;
    try { userType = JSON.parse(sessionStorage['currentUser']).userType; } catch (e) { };
    if (isNullOrUndefined(userType)) { return false }
    if (userType == "M") { return true } else { return false }
  }
  numFormatWithComma(d: any) {
    if (isNotNullOrUndefined(d)) { return d3.format(",.2f")(d); } else { return '-' }
  }
  dateFormatMMDDYYYY(d: any) {
    if (isNotNullOrUndefined(d)) { return moment(d).format('MM/DD/YYYY'); } else { return '-' }
  }
  checkMyAppMessage(MenuId: number, Id: number) {
    var msg = "";
    var d = this.popMessages.filter((xu: any) => xu['MenuId'] == MenuId && xu['Id'] == Id);
    if (d.length > 0) { msg = d[0]['Message']; }
    return msg
  }
  checkESGScore(d: any) {
    var dta = [...this.GetESGScoreData.value].map(a => ({ ...a })).filter(x => x.stockkey == d.stockKey);
    if (dta.length > 0) { return dta[0].score } else { return d.score }
  }

  getMedScore(data: any): any { return d3.median(data, (d: any) => d.score); }
  checksideGridsVisible() {
    var that = this;
    if (that.checkShowLeftTab(2034) == 'A') {
      return false;
    } else { return false; }
  }
  showCompSideGrids() {
    var currentRoute = this.router.url; 
    this.showDefaultSideGrids.next(!this._showDefaultSideGrids);
    this.userEventTrack('Center circle', currentRoute, 'showDefaultSideGrids', this._showDefaultSideGrids)
  }
  findIndName(dta: any, code: any) {
    var industry = code;
    var filDt = [...dta].filter((x: any) => x.code == code);
    if (filDt.length > 0) { industry = (isNotNullOrUndefined(filDt[0].name) ? filDt[0].name : code); }
    return industry;
  }

  transformToTitleCase(word: any) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  onDialogCapture(action: any) {
    var that = this;
    this.globalDialog.next(action);
    this.globalDialog.pipe(first()).subscribe(res => {})
  }
  onGetETFData() {
    var that = this;
    this.dataService.getETFData().pipe(first()).subscribe((stockIndex: any) => {
      that.ETFIndex.next(stockIndex);
      that.onGetGlobalData();
      //// Added permission based lipper date.
      this.equityHoldDate = '';
      //// Added permission based lipper date.
      var lipperDate = formatDate(this.GetSchedularMaster.value[0]['LipperHoldingDt'], 'yyyy/MM/dd', 'en-US');
      if (isNotNullOrUndefined(stockIndex) && stockIndex.length > 0) {
        this.equityHoldDate = [...stockIndex].filter(x => x.assetId == 35000229)[0]['holdingsdate'];
      }
      else { this.equityHoldDate = lipperDate; }
    }, error => {
      that.onGetGlobalData();
    });
  }
  checkServiceError(val: any) {
    if (val == null || val == undefined ||
      JSON.stringify(val).indexOf("The required column 'ISIN' was not present in the results of a 'FromSql' operation.") > -1 ||
      JSON.stringify(val).indexOf("Object reference not set to an instance of an object") > -1 ||
      JSON.stringify(val).indexOf("object not set to an instance") > -1 ||
      JSON.stringify(val).indexOf("started access of dll") > -1 ||
      JSON.stringify(val).indexOf("Request timed out") > -1 ||
      JSON.stringify(val).indexOf("Unauthorized Access") > -1 ||
      //JSON.stringify(val).indexOf('error') > -1 ||
      JSON.stringify(val).indexOf('Arithmetic operation resulted in an overflow') > -1) { return true } else { return false };
  }

  getMedvalue(comp: any, code: any, ind: any) {
    var that = this;
    var med = '0.0';
    if (comp == null || comp == undefined || comp.length == 0) { med = '0.0'; } else {
      var filtercomp = comp.filter((x: any) => x.industry.toString().substring(0, ind) == code);
      if (filtercomp.length > 0) { med = d3.format(".1f")(that.getMedScore(filtercomp)); }
      else { med = '0.0' }
    }
    return med;
  }
  onGetGlobalData() {
    var that = this;
    this.dataService.getGlobalData("").pipe(first()).subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        let dbScore = res.sort(function (x: any, y: any) { return d3.ascending(x.scores, y.scores); });
        that._selResData = [...dbScore];
        var selResData_map = [...dbScore];
        
        selResData_map = that._selResData.map((d: any, i: number) => {
          d.countrygroup = d.indexName.indexOf('Europe') > -1 ? 'Europe' : d.country;
          d.US = (d.country == 'USA') ? 'USA' : '';
          d.score = d.scores * 100;
          d.deg = d.score;
          d.indname = that.findIndName(that._dbGICS, d.industry);
          d.industry = d.industry + "";
          d.companyName = d.companyName != null ? that.transformToTitleCase(d.companyName.trim()) : "";
          d.company = d.companyName != null ? d.companyName : null;
          d.ticker = d.ticker;
          d.stockKey = d.stockKey;
          d.aisin = d.isin;
          d.isin = "a" + d.stockKey;
          d.Fixeds = "";
          d.cx = ((i * 360 / that._selResData.length) - 90);
          d.cy = d.cx;
          return d;
        });

        that.selResData.next(selResData_map);
        try {
          var dta: any = [...selResData_map];
          if (dta.length > 0) {
            if (isNotNullOrUndefined(dta[0]['tradeDate'])) {
              var date_t = dta[0]['tradeDate'];
              this.PSasOfDate = date_t.slice(4, 6) + "/" + date_t.slice(6, 8) + "/" + date_t.slice(0, 4);
            } else { this.PSasOfDate = "-" }
          } else { this.PSasOfDate = "-" }
        } catch (e) { }
      } else { that.selResData.next([]); }
    }, error => { that.selResData.next([]); });

  }
  checkMenuPer(CatId: any, MenuId: any) {
    var tabData = [...this.UserTabsRolePermissionData.value];
    if (tabData.filter(x => x.CatId == CatId).length > 0 && this.checkShowLeftTab(CatId) == "A") {
      var dta = [...this.UserMenuRolePermission.value].filter(x => x.CatId == CatId && x.MenuId == MenuId);
      if (dta.length > 0 && dta[0].PermissionCode == 1) { return 'Y'; }
      else if (dta.length > 0 && dta[0].PermissionCode == 3) { return 'D'; }
      else { return 'N'; }
    } else { return 'N'; }
  }

  formatedates(value: any) { if (value < 10) { return '0' + value; } else { return value; } }

  getWithoutDup_Array(arr: any, filterValue: any) {
    var opt: any = [];
    var indexArr: any = [];
    arr.map((item: any) => {
      let key = indexArr.indexOf(item[filterValue]);
      if (key == -1) {
        indexArr.push(item[filterValue]);
        opt.push(item);
      } else if (opt[key].seq < item.seq) {
        opt[key] = item;
      }
    })
    return opt;
  }

  txtx(d: any) { return ((d.cx) > 90) ? "-222" : "222"; }
  txtx1(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx1d(d: any) { return ((d.rx) > 90) ? "-190" : "188"; }
  txtx2(d: any) { return ((d.cx) > 90) ? "-190" : "188"; }
  txtx3(d: any) { return ((d.cx) > 90) ? "-192" : "192"; }
  txttrans(d: any) { return ((d.cx) > 90) ? "rotate(180)" : null; }
  txtanch(d: any) { return ((d.cx) > 90) ? "end" : null; }

  notificationservices: any;
  getNotifiData() {
    try { this.notificationservices.unsubscribe(); } catch (e) { };
    this.notificationservices = interval(10000).pipe(switchMap(() => this.dataService.GetStrategyTopNotification()))
      .subscribe((dt: any) => {
        if (this.checkServiceError(dt)) {
          //this.logger.logError(dt, 'getNotifiData');
          this.getNotificationQueue.next([]);
        } else {
          this.getNotificationQueue.next(dt);
          var x = dt.filter((fil: any) => fil.notifyStatus == 'E');
          var fail = dt.filter((fil: any) => fil.notifyStatus == 'F');
          if (x.length == dt.length || dt.length == 0 || (x.length + fail.length) == dt.length) { this.notificationservices.unsubscribe(); }
        }
      }, (error: any) => {
        //this.logger.logError(error, 'getNotifiData');
        this.getNotificationQueue.next([]);
      });
  }

  getNotificationDataReload() {
    var that = this;
    that.dataService.GetStrategyTopNotification().pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        this.getNotificationQueue.next(data1);
        this.getNotifiData();
        setTimeout(function () { $('#showNotifyLoader').hide(); }, 500)
      }
    }, (error: any) => { that.getNotificationQueue.next([]); $('#showNotifyLoader').hide(); });
  }
  showWt_Mc(d: any) {
    if (isNotNullOrUndefined(d['indexWeight'])) { return parseFloat(d['indexWeight']) * 100; } else { return d.Wt; };
  }
  formatWt_percentage(d: any) {
    if (isNotNullOrUndefined(d)) { return this.numberWithCommas((d).toFixed(2)) + "%" }
    else { return '0.00%' }
  }

  formatWt_percentage1(d: any) {
    if (isNotNullOrUndefined(d)) { return this.numberWithCommas((d).toFixed(3)) + "%" }
    else { return '0.00%' }
  }
  tradeDownload(filesName: any, resData: any, type: any) {
    var that = this;
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.company, item.ticker, item.stockKey, item.aisin, that.formatWt_percentage(that.showWt_Mc(item))]); });

    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey', 'ISIN', 'Weight'])
    header.font = { bold: true };
    //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });

    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (that.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosures I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.excelDisclosures.value) && that.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosures II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }
  tradeDownload1(filesName: any, resData: any, type: any) {
    var that = this;
    var daTe: any = (resData.length > 0 && isNotNullOrUndefined(resData[0]['hdate'])) ? new Date(resData[0]['hdate']) : new Date();
    var indate = formatDate(daTe, 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var rpdate = formatDate(new Date(), 'MM/dd/YYYY', 'en-US') + " (MM/DD/YYYY)";
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.compname, item.ticker, item.stockKey, item.isin, that.formatWt_percentage(item.Wt)]); });

    ws.addRow([filesName]).font = { bold: true };
    ws.addRow(['As of', indate]).font = { bold: true };
    ws.addRow(['Report Date', rpdate]).font = { bold: true };
    ws.addRow([]);

    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey', 'ISIN', 'Weight'])
    header.font = { bold: true };
    //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (this.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      this.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.excelDisclosures.value) && this.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosure II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      this.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }
  tradeDownload1_new(filesName: any, resData: any, type: any) {
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet(flName);
    var tabBody: any = [];
    resData.forEach((item: any) => { tabBody.push([item.compname, item.ticker, item.stockKey, item.isin, item.weight]); });

    var header = ws.addRow(['Company Name', 'Ticker', 'StockKey', 'ISIN', 'Weight'])
    header.font = { bold: true };
    //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
    tabBody.forEach((d: any) => { ws.addRow(d) });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (this.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      this.compDis.forEach((du: any) => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(this.excelDisclosures.value) && this.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosure II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      this.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.downloadTitleConvert(flName) + "_" + this.datepipe.transform(d, 'yyyyMMdd');
    new_workbook.xlsx.writeBuffer().then((data: any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  GetExcelDisclosures() {
    this.dataService.MCaptialDisclosures().pipe(first())
      .subscribe((data: any[]) => { this.excelDisclosures.next(data); }, (error: any) => { });
  }

  checkTradingHour() {
    return new Promise((resolve, reject) => {
      this.dataService.CheckTradingHours().pipe(first()).subscribe((res: any) => { resolve(res) }, error => { resolve([]) });
    });
  }

  checkRangeTxt(score: any) {
    if (score == 0) { return ""; }
    if (0 < score && score <= 8) { return "A+" }
    else if (8 < score && score <= 16) { return "A" }
    else if (16 < score && score <= 25) { return "A-" }
    else if (25 < score && score <= 33) { return "B+" }
    else if (33 < score && score <= 41) { return "B" }
    else if (41 < score && score <= 50) { return "B-" }
    else if (50 < score && score <= 58) { return "C+" }
    else if (58 < score && score <= 66) { return "C" }
    else if (66 < score && score <= 75) { return "C-" }
    else if (75 < score && score <= 83) { return "D+" }
    else if (83 < score && score <= 91) { return "D" }
    else if (91 < score && score <= 100) { return "D-" }
    else { return '' }
  }

  getRatingSSRval(rating: any) {
    if (rating == undefined || rating == null || rating == 'NaN' || rating == "") { return 0; }
    else if (rating == "A+") { return 0.08; }
    else if (rating == "A") { return 0.16; }
    else if (rating == "A-") { return 0.25; }
    else if (rating == "B+") { return 0.33; }
    else if (rating == "B") { return 0.41; }
    else if (rating == "B-") { return 0.50; }
    else if (rating == "C+") { return 0.58; }
    else if (rating == "C") { return 0.66; }
    else if (rating == "C-") { return 0.75; }
    else if (rating == "D+") { return 0.83; }
    else if (rating == "D") { return 0.91; }
    else if (rating == "D-") { return 1.00; }
    else { return 0 }
  }

  momentTF(d: any) { return moment.utc(d).tz("America/New_York").format('HH:mm z'); };
  momentCount() {
    try {
      var tradeTime = this._tradingHoursData;
      if (tradeTime.length > 0 && isNotNullOrUndefined(tradeTime[0]['actualCloseTimeInUTC']) &&
        isNotNullOrUndefined(tradeTime[0]['closeTimeInUTC']) && isNotNullOrUndefined(tradeTime[0]['countryCode']) &&
        isNotNullOrUndefined(tradeTime[0]['openTimeInUTC'])) {
        this.tradeTiming['tradeStart'] = false;
        this.tradeTiming['tradeEnd'] = false;
        this.tradeTiming['showTradeTime'] = true;
        this.tradeTiming['tradeTimes'] = this.momentTF(tradeTime[0]['openTimeInUTC']) + " to " + this.momentTF(tradeTime[0]['closeTimeInUTC'])// + " (" + (moment.utc(tradeTime[0]['closeTimeInUTC']).tz("America/New_York").format('MM-DD-YYYY'))+")";
        var currentT = moment(new Date()).tz("America/New_York");
        var endT = moment.utc(tradeTime[0]['closeTimeInUTC']).tz("America/New_York");
        var startT = moment.utc(tradeTime[0]['openTimeInUTC']).tz("America/New_York");
        var beforTrade = moment.duration(currentT.diff(startT)).asSeconds();
        var dir = moment.duration(endT.diff(currentT)).asSeconds();
        var hours = Math.floor(dir / 60 / 60);
        var minutes = Math.floor(dir / 60) - (hours * 60);
        var seconds = dir % 60;
        var stDir = moment.duration(startT.diff(currentT)).asSeconds();
        var sthours = Math.floor(stDir / 60 / 60);
        var stminutes = Math.floor(stDir / 60) - (sthours * 60);
        var stseconds = stDir % 60;
        if (sthours == 0 && stminutes == 0 && stseconds > -1) {
          this.tradeTiming['tradeStart'] = true;
          this.tradeTiming['showCount'] = true
          this.tradeTiming['showTradeBtn'] = false;
          this.tradeTiming['tradeCount'] = parseInt(d3.format('.0f')(stminutes)).toString().padStart(2, '0') + ':' + parseInt(d3.format('.0f')(stseconds)).toString().padStart(2, '0');
        } else if (sthours == 0 && stminutes < 15) {
          this.tradeTiming['tradeStart'] = true;
          this.tradeTiming['showTradeBtn'] = false;
          this.tradeTiming['showCount'] = true;
          this.tradeTiming['tradeCount'] = parseInt(d3.format('.0f')(stminutes)).toString().padStart(2, '0') + ':' + parseInt(d3.format('.0f')(stseconds)).toString().padStart(2, '0');
        } else if (hours == 0 && minutes == 0 && seconds > -1) {
          this.tradeTiming['tradeEnd'] = true;
          this.tradeTiming['tradeCount'] = parseInt(d3.format('.0f')(minutes)).toString().padStart(2, '0') + ':' + parseInt(d3.format('.0f')(seconds)).toString().padStart(2, '0');
          this.tradeTiming['showCount'] = true
          this.tradeTiming['showTradeBtn'] = true;
        } else if (hours == 0 && minutes < 15) {
          this.tradeTiming['tradeEnd'] = true;
          this.tradeTiming['showTradeBtn'] = true;
          this.tradeTiming['showCount'] = true
          this.tradeTiming['tradeCount'] = parseInt(d3.format('.0f')(minutes)).toString().padStart(2, '0') + ':' + parseInt(d3.format('.0f')(seconds)).toString().padStart(2, '0');
        } else if (beforTrade < 0) {
          this.tradeTiming['showTradeBtn'] = false;
          this.tradeTiming['showCount'] = false
        } else if (hours > 0) {
          this.tradeTiming['showCount'] = false
          this.tradeTiming['showTradeBtn'] = true;
        } else {
          this.tradeTiming['showTradeBtn'] = false;
          this.tradeTiming['showCount'] = false
        };
      } else {
        this.tradeTiming['tradeTimes'] = "";
        this.tradeTiming['tradeCount'] = '';
        this.tradeTiming['showTradeBtn'] = false;
        this.tradeTiming['showCount'] = false;
        this.tradeTiming['showTradeTime'] = false;
      }
    } catch (e) { }
  }

  tHData: any;
  getTradingHours() {
    var that = this;
    this.tHData = setInterval(function () { that.momentCount() }, 500);
    this.tradingHoursData.next([]);
    var date = (new Date()).toUTCString();
    var data = { "countryCode": "US", "date": date };
    this.dataService.GetTradingHours(data).pipe(first()).subscribe((data: any[]) => {
      this.tradingHoursData.next(data);
      this.checkTradingHour().then((resData: any) => {
        if (isNotNullOrUndefined(resData) && resData.length > 0
          && isNotNullOrUndefined(resData[0]['allowTrading']) && resData[0]['allowTrading'] == 'H') {
          clearInterval(that.tHData);
          this.tradeTiming['tradeTimes'] = resData[0]['errorMessage'];
        }
      });
    }, (error: any) => {
      this.tradingHoursData.next([]);
      clearInterval(that.tHData);
    });
  }
  getIndexId(val: any) {
    var IndexId = 0;
    if (val.name == "Equity Universe" && val.group == 'Home') { IndexId = 137; }
    else if (val.indexType == "Equity Universe" || val.indexType == "Exchange Traded Funds" || val.indexType == "ESG Universe") {
      if (val.group == "Country") {
        if (val.name == "USA") {
          IndexId = 122;
        } else if (val.name == "Canada") {
          IndexId = 126;
        }
        else if (val.name == "United Kingdom") {
          IndexId = 56;
        }
        else if (val.name == "Japan") {
          IndexId = 57;
        }
        else if (val.name == "Europe") {
          IndexId = 58;
        }
        else if (val.name == "Australia") {
          IndexId = 125;
        }
        else if (val.name == "South Africa") {
          IndexId = 127;
        }
        else if (val.name == "South Korea" || val.name == "Korea") {
          IndexId = 128;
        }
      }
      if (val.name == "S&P 500" || val.indexName == "S&P 500" || val.assetId == '55555555') {
        IndexId = 28;
      }
      else if (val.name == "S&P 600" || val.indexName == "S&P 600" || val.assetId == '66666666') {
        IndexId = 27;
      }
      else if (val.name == "S&P 400" || val.indexName == "S&P 400" || val.assetId == '44444444') {
        IndexId = 121;
      }
      else if (val.name == "S&P 1500" || val.indexName == "S&P 1500" || val.assetId == '77777777') {
        IndexId = 53;
      }
      else if (val.name == "S&P United Kingdom BMI Index" || val.indexName == "S&P United Kingdom BMI Index" || val.assetId == '99999999') {
        IndexId = 56;
      }
      else if (val.name == "S&P Japan BMI Index" || val.indexName == "S&P Japan BMI Index" || val.assetId == '11111111') {
        IndexId = 57;
      }
      else if (val.name == "S&P Europe Ex-UK BMI Index" || val.indexName == "S&P Europe Ex-UK BMI Index" || val.assetId == '10101010') {
        IndexId = 58;
      }
      else if (val.name == "S&P USA Ex S&P 1500" || val.indexName == "S&P USA Ex S&P 1500" || val.assetId == '23232323') {
        IndexId = 124;
      }
      else if (val.name == "ETFs" || val.name == "Exchange Traded Funds" || val.indexType == "ETFs" || val.indexType == "Exchange Traded Funds") {
        IndexId = 123;
      }
      else if (val.name == "S&P Canada BMI Index" || val.indexName == "S&P Canada BMI Index") {
        IndexId = 126;
      }
      else if (val.name == "S&P Australia BMI Index" || val.indexName == "S&P Australia BMI Index") {
        IndexId = 125;
      }
      else if (val.name == "S&P South Africa BMI Index" || val.indexName == "S&P South Africa BMI Index") {
        IndexId = 127;
      }
      else if (val.name == "S&P South Korea BMI Index" || val.indexName == "S&P South Korea BMI Index") {
        IndexId = 128;
      }
      else if (val.name == "U.S. Large-Cap ESG" || val.name == "ESG Universe" || val.indexName == "U.S. Large-Cap ESG" || val.indexName == "ESG Universe") {
        IndexId = 147;
      }
      else if (val.name == "S&P 500 Growth" || val.indexName == "S&P 500 Growth" || val.assetId == '55551111') {
        IndexId = 208
      }
      else if (val.name == "S&P 500 Value" || val.indexName == "S&P 500 Value" || val.assetId == '55553333') {
        IndexId = 209
      }
    } else if (val.name == "Global Universe" || val.indexType == "Global Universe") { IndexId = 137 }
    return IndexId;

  }
  dateFormate(d: any) {
    const format = d3.timeFormat("%m/%d/%Y %H:%M");
    const date = new Date(d);
    const formattedDate = format(date);
    return formattedDate;
  }

  checkPriceDate(d: any) {
    if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d.hdate)) {
      return moment.utc(d.hdate).tz("America/New_York").format('MM/DD/YYYY HH:mm:ss z');
    } else { return "" }
  }

  checkDate(d: any) {
    if (isNotNullOrUndefined(d.transitionDate)) {
      var date = formatDate(d['transitionDate'], 'MM/dd/YYYY', 'en-US');
      return date;
    } else { return "-" }
  }

  tradeBuyDownload(filesName: any, resData: any, allocData: any) {
    var that = this;
    if (allocData.length > 0 || resData.length > 0) {
      var flName = filesName.replace(" ", "_");
      let new_workbook = new Workbook();

      if (allocData.length > 0) {
        var ws1 = new_workbook.addWorksheet("Allocation");
        var tabBody: any = [];
        allocData.forEach((item: any) => { tabBody.push([item.accountNo, item.ticker, that.numberWithCommas(item.noofShares), item.buyOrSell]); });
        var header = ws1.addRow(['Account', 'Ticker', 'Quantity', 'Buy/Sell'])
        header.font = { bold: true };
        //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
        tabBody.forEach((d: any) => { ws1.addRow(d) });
        ws1.addRow([]);
        ws1.addRow(["For Internal Use Only"]).font = { bold: true }
      }

      if (resData.length > 0) {
        var ws = new_workbook.addWorksheet("Trades");
        var tabBody1: any = [];
        resData.forEach((item: any) => { tabBody1.push([item.accountNo, item.ticker, that.numberWithCommas(item.noofShares), item.buyOrSell]); });
        var header = ws.addRow(['Account', 'Ticker', 'Quantity', 'Buy/Sell'])
        header.font = { bold: true };
        tabBody1.forEach((d: any) => { ws.addRow(d) });
        ws.addRow([]);
        ws.addRow(["For Internal Use Only"]).font = { bold: true }
      }
      //Disclosures 1
      if (that.compDis.length > 0) {
        var ds = new_workbook.addWorksheet("Disclosure I");
        ds.addRow(["Disclosure I"]).font = { bold: true };
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
        that.compDis.forEach(du => {
          ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
        });
        ds.addRow([]);
        ds.addRow(["For Internal Use Only"]).font = { bold: true }
      }

      //Disclosures 2
      if (isNotNullOrUndefined(that.excelDisclosures.value) && that.excelDisclosures.value.length > 0) {
        var ds1 = new_workbook.addWorksheet("Disclosure II");
        ds1.addRow(["Disclosure II"]).font = { bold: true };
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
        var Disclosures: any = [];
        that.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
        Disclosures.forEach((du: any) => {
          ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
        });
        ds1.addRow([]);
        ds1.addRow(["For Internal Use Only"]).font = { bold: true }
      }

      let d = new Date();
      var fileName = this.downloadTitleConvert(flName) + "_Trade_Confirm_" + this.datepipe.transform(d, 'yyyyMMdd')+'_'+ this.datepipe.transform(d, 'hhmmss');
      new_workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
        saveAs(blob, fileName + '.xlsx');
      });
    }
  }
  checkLiquidateType(d: any) {
    if (isNotNullOrUndefined(d)) {
      var fData = this.rebalancePeriod.filter(x => x.rebalancefreq == d);
      if (fData.length > 0) { return fData[0].rebalancefreqName; }
      else { return 'Quarterly' }
    } else { return 'Quarterly' }
  }


  checkRebalanceType(d: any) { if (isNotNullOrUndefined(d.rebalanceByName)) { return d.rebalanceByName; } else { return 'Quarterly' } }

  checkPriceAsof(d: any) { if (isNotNullOrUndefined(d) && d.length > 0 && isNotNullOrUndefined(d[0]['hdate'])) { return true } else { return false } };

  numberWithCommas(number: any) { if (number == null || number == undefined || number == "" || number == "NaN" || isNaN(number)) { return '-'; } else { var parts = number.toString().split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return parts.join("."); } }

  numberWithCommasToFixed(number: any) {
    if (number == null || number == undefined || number == "" || number == "NaN" || isNaN(number)) { return '-'; }
    else {
      var num = parseFloat(number).toFixed(2);
      var parts = num.toString().split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
  }

  tradeNotificationservices: any;
  getTradeNotifiData() {
    try { this.tradeNotificationservices.unsubscribe(); } catch (e) { };
    this.tradeNotificationservices = interval(10000).pipe(switchMap(() => this.dataService.GetTradeNotification()))
      .subscribe((dt: any) => {
        if (this.checkServiceError(dt)) {
          //this.logger.logError(dt, 'GetTradeNotification');
          this.getTradeNotificationQueue.next([]);
        } else {
          this.getTradeNotificationQueue.next(dt);
          if (dt.length == 0) { this.tradeNotificationservices.unsubscribe(); }
        }
        this.tradeNotificationservices.unsubscribe();
      }, (error: any) => {
        //this.logger.logError(error, 'GetTradeNotification');
        this.getTradeNotificationQueue.next([]);
      });
  }

  getTradeNotificationDataReload() {
    var that = this;
    that.dataService.GetTradeNotification().pipe(first())
      .subscribe((data1: any) => {
        if (data1[0] != "Failed") {
          this.getTradeNotificationQueue.next(data1);
          this.getTradeNotifiData();
          setTimeout(function () { $('#showNotifyLoader').hide(); }, 500)
        }
      }, (error: any) => { that.getTradeNotificationQueue.next([]); $('#showNotifyLoader').hide(); });
  }

  PauseAccUpdate(accountId: any, status: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data = { "accountId": accountId, "userid": userid, "status": status, "slid": 0 };
    return new Promise((resolve, reject) => {
      this.dataService.PostPauseAcc(data).pipe(first()).subscribe((res: any) => { resolve(res) }, (error: any) => { resolve(undefined) });
    });
  }

  dateformats(date: any) {
    if (date === undefined || date === null) { return "-"; }
    else {
      var d = new Date(date);
      var month = d.toLocaleString('default', { month: 'long' });
      return (month + ' ' + d.getDate() + ', ' + d.getFullYear());
    }
  }
  formatGScore(d: any) { return d3.format(",.1f")(d); }
  formatGScoreMultiple(d: any) { return d3.format(",.1f")(d); }

  showAlertMsg2(title: any, Message: any) {
    var that = this;
    //const dialogRef = that.dialog.open(ConfirmationDialog,
    //  {
    //    width: '40%', height: 'auto', panelClass: 'custom-dialogbox',
    //    data: { Title: 'ConfirmationDialog', Message: Message }
    //});
    //dialogRef.afterClosed().subscribe((result:any) => { });
    //setTimeout(() => { dialogRef.close(); }, 5000);
    var title1 = 'ConfirmationDialog';
    var options = { from: 'factorsDrag', error: Message, destination: 'closePopup' }
    var clickeddata: any = [];
    this.dialog.open(CommonErrorDialogComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title1, dialogData: clickeddata, dialogSource: options } });

    //alert(Message);
  }
  Crlwrapping(text: any, width: any, p: any) {
    text.each((datum: any, index: any, nodes: any) => {
      var text: any = d3.select(nodes[index]),
        words: any = text.text().split(/\s+/).reverse(),
        word: any,
        line: any = [],
        lineNumber: any = 0, //<-- 0!
        lineHeight: any = 1.2, // ems
        x: any = text.attr("x"), //<-- include the x!
        y: any = text.attr("y"),
        dy: any = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      var tspan: any = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
  checkSelResETFDataCall(id: any) {
    if (this._selResETFData == null || this._selResETFData == undefined || this._selResETFData.length == 0) { return true }
    else { if (this._selResETFData[0].Assets == id) { return false } else { return true } }
  }
  getETFAllocScores(da: any, range: any, indexType: any) {
    var that = this;
    var top: any = 1;
    var GetAllocDate = [...this._ETFIndex].filter(x => x.assetId == da.assetId)[0].holdingsdate;
    var d: any = new Date(GetAllocDate);
    d.setDate(d.getDate() + 1);
    that.GetAllocDate = d.getFullYear().toString() + this.formatedates(d.getMonth() + 1).toString() + this.formatedates(d.getDate()).toString();
    return new Promise<any>((resolve, reject) => {
      if (that.checkSelResETFDataCall(da.assetId)) {
        that.dataService.GetAllocScores(that.GetAllocDate, da.assetId, range, 123, top, indexType).pipe(first()).subscribe((res: any) => {
          if (res.length == 0 || res[0].toString().indexOf('error') > -1) {
            this.logger.logError(res, 'GetAllocScores');
            resolve([]);
          }
          else {
            var resData: any = [...res];
            //res.forEach(function (d: any) {
            //  d.aisin = d.isin;
            //  d.isin = "a" + d.stockKey;
            //  //if ([...that._selResData].filter(x => x.isin == d.isin).length > 0) { resData.push(d); }
            //  return d;
            //});
            var selreslen = resData.length;
            let TotWt = d3.sum(resData.map(function (d: any) { return (1 - d.scores); }));
            resData.forEach(function (d: any, i: any) {
              d.countrygroup = d.indexName.indexOf('Europe') > -1 ? 'Europe' : d.country;
              d.US = (d.country == 'USA') ? 'USA' : '';
              d.score = d.scores * 100;
              d.deg = d.score;
              d.Assets = da.assetId;
              d.indname = that.findIndName(that._dbGICS, d.industry);
              d.industry = d.industry + "";
              d.companyName = d.companyName != null ? that.transformToTitleCase(d.companyName.trim()) : "";
              d.company = d.companyName != null ? d.companyName : null;
              d.ticker = d.ticker;
              var imp = [...that._selResData].filter(ix => ix.stockKey == d.stockKey);
              d.impRev = (imp.length > 0) ? imp[0]['impRev'] : 0;
              d.stockKey = d.stockKey;
              d.Wt = ((1 - d.scores) / TotWt) * 100;
              d.Fixeds = "";
              d.aisin = d.isin;
              d.isin = "a" + d.stockKey;
              d.cx = ((i * 360 / selreslen) - 90);
              d.cy = d.cx;
              d.esgScore = that.checkESGScore(d);
              let flt = [...that.IndexOrder].filter(function (x) { return x.index == d.indexName })
              d.sortOrder = flt.length > 0 ? flt[0].order : null;
              return d
            });
            resData = resData.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
            that.selResETFData.next(resData);
            resolve(resData);
          }
        }, error => {
          this.logger.logError(error, 'GetAllocScores');
          reject([])
        });
      } else { resolve([...that._selResETFData]); }
    });
  }

  wrappingtxt(text: any, width: any, p: any, X: any) {
    text.each((datum: any, index: any, nodes: any) => {
      var text: any = d3.select(nodes[index]),
        words: any = text.text().split(/\s+/).reverse(),
        word: any,
        line: any = [],
        lineNumber = 0, //<-- 0!
        lineHeight = 1.2, // ems
        x = text.attr("x"), //<-- include the x!
        y = text.attr("y"),
        dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      var tspan: any = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  wrapping(text: any, width: any, lineH: any) {
    text.each((datum: any, index: any, nodes: any) => {
      var text: any = d3.select(nodes[index]),
        words: any = text.text().split(/\s+/).reverse(),
        word: any,
        line: any = [],
        lineNumber: any = 0, //<-- 0!
        lineHeight: any = lineH, // ems
        x: any = text.attr("x"), //<-- include the x!
        y: any = text.attr("y"),
        dy: any = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  measureText(string: any, fontSize: any = 9) {
    const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
    const avg = 0.5279276315789471
    return string
      .split('')
      .map((c: any) => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur: any, acc: any) => acc + cur) * fontSize
  }

  checkDivYield(d: any) { if (isNotNullOrUndefined(d['divYield'])) { return true; } else { return false; } }

  formatDates(data: any) {
    var date: string;
    if (data == null || data == undefined || data == "") { date = "-" } else {
      var d = new Date(data);
      var month = d.toLocaleString('default', { month: 'long' });
      date = (month + ' ' + d.getDate() + ', ' + d.getFullYear());
    }
    return date
  }

  tradeViewDownload1(loc: any, dte: any, filesName: any, resData: any, prevResData: any, type: any) {
    var that = this;
    var flName = filesName.replace(" ", "_");
    let new_workbook = new Workbook();
    if (resData.length > 0) {
      var ws = new_workbook.addWorksheet("Current portfolio");
      var name: any;
      var date: any;
      //ws.addRow([]);
      if (loc == 'trade' && this._immediateLiquidate) {
        name = dte[0]['accountVan'];
        ws.addRow(['Name', name]);
        ws.addRow(['Account', name]);
        ws.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(resData, (d: any) => (d.price * d.noofShares)))]);
      }
      else if (loc == 'trade') {
        name = dte['name'] + " (" + dte['shortname'] + ")";
        date = this.dateFormate(dte['acccreateddate']);
        if (isNotNullOrUndefined(dte['accmodifieddate'])) { date = this.dateFormate(dte['accmodifieddate']); };
        var basedOn = dte['basedon'];
        if ((isNullOrUndefined(dte['basedon']) || basedOn == " " || basedOn == "") && isNotNullOrUndefined(dte['Indexname'])) { basedOn = dte['Indexname'] }
        ws.addRow(['Name', name]);
        ws.addRow(['Based On', basedOn]);
        ws.addRow(['Created date', date]);
        ws.addRow(['Account', (dte['accountNo'])]);
        ws.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(resData, (d: any) => (d.price * d.noofShares)))]);
      } else {
        name = dte['Name'] + " (" + dte['shortName'] + ")";
        date = this.dateFormate(dte['createddate']);
        ws.addRow(['Name', name]);
        ws.addRow(['Based On', dte['BasedOn']]);
        ws.addRow(['Created date', date]);
        ws.addRow(['Account', (resData[0]['account'])]);
        ws.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(resData, (d: any) => (d.price * d.noofShares)))]);
      }
      ws.addRow([]);

      var tabBody: any = [];
      resData.forEach((item: any) => { tabBody.push([item.companyName, item.ticker, that.formatWt_percentage(item.weight*100), that.numberWithCommas(item.price), that.numberWithCommas(item.noofShares)]); });

      var header = ws.addRow(['Company Name', 'Ticker', 'Weight', 'Price ($)', 'Quantity'])
      header.font = { bold: true };
      //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
      tabBody.forEach((d: any, i: any) => { ws.addRow(d) });
      ws.addRow([]);
      ws.addRow(["For Internal Use Only"]).font = { bold: true }
    }
    if (prevResData.length > 0) {
      var name1: any;
      var date1: any;
      var ws1 = new_workbook.addWorksheet("Previous portfolio");
      if (loc == 'trade' && this._immediateLiquidate) {
        name1 = dte[0]['accountVan'];
        date1 = this.dateFormate(prevResData[0]['dateofTrade']);
        ws1.addRow(['Name', name1]);
        ws1.addRow(['Date of Traded', date1]);
        ws1.addRow(['Account', name1]);
        ws1.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(prevResData, (d: any) => (d.price * d.noofShares)))]);
      } else if (loc == 'trade') {
        name1 = dte['name'] + " (" + dte['shortname'] + ")";
        date1 = this.dateFormate(prevResData[0]['dateofTrade']);
        var basedOn = dte['basedon'];
        if ((isNullOrUndefined(dte['basedon']) || basedOn == " " || basedOn == "") && isNotNullOrUndefined(dte['Indexname'])) { basedOn = dte['Indexname'] }
        ws1.addRow(['Name', name1]);
        ws1.addRow(['Based On', basedOn]);
        ws1.addRow(['Date of Traded', date1]);
        ws1.addRow(['Account', (dte['accountNo'])]);
        ws1.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(prevResData, (d: any) => (d.price * d.noofShares)))]);
      } else {
        name1 = dte['Name'] + " (" + dte['shortName'] + ")";
        date1 = this.dateFormate(dte['createddate']);
        ws1.addRow(['Name', name1]);
        ws1.addRow(['Based On', dte['BasedOn']]);
        ws1.addRow(['Created date', date1]);
        ws1.addRow(['Account', (dte['accountNo'])]);
        ws1.addRow(['Market Value ($)', d3.format(",.2f")(d3.sum(prevResData, (d: any) => (d.price * d.noofShares)))]);
      }
      ws1.addRow([]);
      var tabBody1:any = [];
      prevResData.forEach((item: any) => { tabBody1.push([item.companyName, item.ticker, that.formatWt_percentage(item.weight*100), that.numberWithCommas(item.price), that.numberWithCommas(item.noofShares)]); });

      var header = ws1.addRow(['Company Name', 'Ticker', 'Weight', 'Price ($)', 'Quantity'])
      header.font = { bold: true };
      //header.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, };
      tabBody1.forEach((d: any, i: any) => { ws1.addRow(d) });
      ws1.addRow([]);
      ws1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 1
    if (that.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosure I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.excelDisclosures.value) && that.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosure II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    let d = new Date();
    var fileName = this.downloadTitleConvert(flName) + "_Trade_Holdings_" + this.datepipe.transform(d, 'yyyyMMdd') + '_' + this.datepipe.transform(d, 'hhmmss');
    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', });
      saveAs(blob, fileName + '.xlsx');
    });
  }

  AddToWatchList(indexAdd: boolean, companyAdd: boolean, Type: string, category: string, selComp: any, breadcrumbdata: any, alreadyAdded: boolean) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var assetId: any = '';
    var countrygroup: any = null;
    var stockkey: any = null;
    var isin: any = null;
    var companyname: any = null;
    var fixeds: any = null;
    var naaIndex: any = null;
    var scores: any = null;
    var indexname: any = null;
    var industry: any = null;

    var watchlistdtls: any;
    //{
    //  userid: userid,
    //  category: category,
    //  assets: assetId,
    //  stockkey: stockkey,
    //  isin: isin,
    //  fixeds: fixeds,
    //  naaIndex: naaIndex,
    //  scores: scores,
    //  countrygroup: countrygroup,
    //  indexname: indexname,
    //  industry: industry,
    //  indexAdd: indexAdd,
    //  companyAdd: companyAdd,
    //  type: Type
    //};
    var watchListData: any = this.WatchListData.value;
    var index: any = breadcrumbdata.filter((x: any) => x['group'] == "Index" || x['group'] == "ETFIndex");
    var initWatchList: boolean = true;
    if (indexAdd && index.length > 0) {
      indexname = (isNotNullOrUndefined(index[0]['name'])) ? index[0]['name'] : '';
      countrygroup = (isNotNullOrUndefined(index[0]['country'])) ? index[0]['country'] : '';
      assetId = (isNotNullOrUndefined(index[0]['assetId']) && index[0]['assetId'] > 0) ? index[0]['assetId'] : '';
      if (alreadyAdded) {
        indexAdd = false;
        var filInd: any = watchListData.filter((x: any) => (x['indexname'] == index[0]['name'] || x['assets'] == index[0]['assetId']) && isNullOrUndefined(x['stockkey']));
        if (filInd.length > 0) {
          indexname = (isNotNullOrUndefined(filInd[0]['indexname'])) ? filInd[0]['indexname'] : indexname;
          category = (isNotNullOrUndefined(filInd[0]['category'])) ? filInd[0]['category'] : category;
          countrygroup = (isNotNullOrUndefined(filInd[0]['countrygroup'])) ? filInd[0]['countrygroup'] : countrygroup;
          Type = (isNotNullOrUndefined(filInd[0]['type'])) ? filInd[0]['type'] : Type;
        }
      }
      watchlistdtls = {
        "userid": userid,
        "category": category,
        "assets": assetId,
        "countrygroup": countrygroup,
        "indexname": indexname,
        "indexAdd": indexAdd,
        "companyAdd": companyAdd,
        "type": Type
      };
    } else if (companyAdd && isNotNullOrUndefined(selComp)) {
      companyname = (isNotNullOrUndefined(selComp['companyName'])) ? (selComp['companyName'] +" ("+ selComp['ticker'])+")" : null;
      stockkey = (isNotNullOrUndefined(selComp['stockKey'])) ? selComp['stockKey'] : null;
      scores = (isNotNullOrUndefined(selComp['scores'])) ? selComp['scores'] : null;
      isin = (isNotNullOrUndefined(selComp['aisin'])) ? selComp['aisin'] : null;
      if (alreadyAdded) {
        companyAdd = false;
        var filInd: any = watchListData.filter((x: any) => x['stockkey'] == stockkey);
        if (filInd.length > 0) {
          category = (isNotNullOrUndefined(filInd[0]['category'])) ? filInd[0]['category'] : category;
          assetId = (isNotNullOrUndefined(filInd[0]['assets'])) ? filInd[0]['assets'] : assetId;
          isin = (isNotNullOrUndefined(filInd[0]['isin'])) ? filInd[0]['isin'] : isin;
          fixeds = (isNotNullOrUndefined(filInd[0]['fixeds'])) ? filInd[0]['fixeds'] : "";
          scores = (isNotNullOrUndefined(filInd[0]['scores'])) ? filInd[0]['scores'] : scores;
          countrygroup = (isNotNullOrUndefined(filInd[0]['countrygroup'])) ? filInd[0]['countrygroup'] : '';
          indexname = (isNotNullOrUndefined(filInd[0]['indexname'])) ? filInd[0]['indexname'] : '';
          Type = (isNotNullOrUndefined(filInd[0]['type'])) ? filInd[0]['type'] : Type;
        } else { indexname = ''; fixeds = ''; countrygroup = ''; };
      } else { indexname = ''; fixeds = ''; countrygroup = ''; };
      watchlistdtls = {
        "userid": userid,
        "category": category,
        "assets": assetId,
        "stockkey": stockkey,
        "isin": isin,
        "fixeds": fixeds,
        "scores": scores,
        "countrygroup": countrygroup,
        "indexname": indexname,
        "indexAdd": indexAdd,
        "companyAdd": companyAdd,
        "type": Type
      };
    } else { initWatchList = false; }

    if (initWatchList) {
      that.dataService.UpdateWatchList(watchlistdtls).pipe(first()).subscribe((data: any) => {
        if (data[0] != "Failed") {
          that.getWatchListData();
          var Title = "";
          var Message = "";
          if (data[0] == "Success") {
            if (Type == "Index") {
              Title = watchlistdtls.indexname;
              Message = "Added to Watchlist"
            }
            else {
              Title = companyname;
              Message = "Added to Watchlist"
            }
          }
          else {
            if (Type == "Index") {
              Title = watchlistdtls.indexname;
              Message = "Removed from Watchlist"
            }
            else {
              Title = companyname;
              Message = "Removed from Watchlist"
            }
          }          
          that.toastr.success((Title + " : " + Message), '', { timeOut: 4000, positionClass: "toast-top-center" });
        }
      }, (error: any) => {
        //that.toastr.success('server issues', '', { timeOut: 4000, positionClass: "toast-top-center" });
        this.logger.logError(error, 'UpdateWatchList');
      });
    } else {
      //that.toastr.success('server issues', '', { timeOut: 4000, positionClass: "toast-top-center" });
    }
  }

  getWatchListData() {
    var that = this;
    this.dataService.getWatchListData().pipe(first()).subscribe((Data: any) => {
      //Data.forEach(function (d: any) {
      //  if (d.category == 'Equity Indexes') { d.category = 'Equity Universe'; }
      //  if (d.category == 'Fixed Income Indexes') { d.category = 'Fixed Income Universe'; }
      //  if (d.category == 'ESG Indexes') { d.category = 'ESG Universe'; }
      //  return d;
      //});
      that.WatchListData.next(Data);
      //that.calcMedWatchList();
    }, (error:any) => { that.logger.logError(error, 'Scores/GetWatchList'); });
  }

  FillAlloclist() {
    let that = this;
    this.dataService.getAlloAlertListData().pipe(first())
      .subscribe((Data: any) => { that.AllocListData.next(Data); },
        (error: any) => { that.logger.logError(error, 'Scores/GetAllocationAlert'); });
  }
  GetRebalanceDates() {
    this.dataService.GetRebalanceDates().pipe(first()).pipe(first())
      .subscribe((res: any) => { this.rebalanceDates.next(res); },
        error => { this.rebalanceDates.next([]); });
  }
  enableAllocAlertlist() {
    $('.AVLalert_a').css('display', 'none');
    $('.AVLalert_c').css('display', 'block');
  }

  disableAllocAlertlist() {
    $('.AVLalert_a').css('display', 'block');
    $('.AVLalert_c').css('display', 'none');
  }

  checkSectorWeigth(data: any) {
    return new Promise((resolve, reject) => {
      this.dataService.CustomIndexSectorDataAPI(data).pipe(first()).subscribe((res: any) => { resolve(res) }, (error: any) => { reject(error) });
    });
  }

  checkBarChartType(assetId:any) {
    var etfInd = [...this._ETFIndex].filter(x => x.assetId == assetId);
    if (etfInd.length > 0) { return 'ETF' } else if (assetId == 55551111) { return "S&P 500 Growth" } else if (assetId == 55553333) { return "S&P 500 Value" } else { return "MC" };
  }

  checkRoutePer(CatId: any) {
    var tabData = this.UserTabsRolePermissionData.value;
    var isPolicyAccepted = sessionStorage['isPolicyAccepted'];
    if (tabData.length > 0) {
      var d = tabData.filter((x: any) => x.CatId == CatId);
      if (isPolicyAccepted == undefined || isPolicyAccepted == null || isPolicyAccepted == "null" || isPolicyAccepted == 'N') { this.router.navigate(["/login"]) }
      else if (d.length > 0 && d[0].Status == 'A') { }
      else { this.router.navigate(["/nopermission"]) }
    }
  }
  checkPPTCenterCircle() {
    var that = this;
    /*if (that.checkShowLeftTab(2032) == 'A' && that.checkMenuPer(2032, 2264) == 'Y' && that._showNavPPT_CenterCircle) { }*/
    if (that.checkShowLeftTab(2032) == 'A' && that.checkMenuPer(2032, 2264) == 'Y') {
      return false;
    } else { return true; }
  }
  UpdatePostNotification(slid: any, erfflag: any, date: any, freqflag: string) {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var postData:any = [];
    postData.push({
      "accountId": 0,
      "slid": slid,
      "userid": parseInt(userid),
      "status": "A",
      "enddate": date,
      "freqflag": freqflag,
      "tenYrFlag": 1,
      "erfflag": erfflag
    });

    that.dataService.GetStrategyAccount(slid).pipe(first())
      .subscribe((accList: any) => {
        accList.forEach((d:any) => {
          if (isNotNullOrUndefined(d['tradedStatus']) && d['tradedStatus'] == 'Y') { } else {
            postData.push({
              "accountId": d['accountId'],
              "slid": slid,
              "userid": parseInt(userid),
              "status": "A",
              "enddate": date,
              "freqflag": freqflag,
              "tenYrFlag": 1,
              "erfflag": erfflag
            });
          }
        });
        that.dataService.PostStrategyNotificationQueue(postData).pipe(first()).subscribe(data => {
              if (data[0] != "Failed") {
                that.getNotificationDataReload();
                that.toastr.success('Added to queue successfully', '', {
                  timeOut: 5000,
                  positionClass: "toast-top-center"
                });
                this.showMatLoader.next(false);
              }
            }, error => { this.logger.logError(error, 'PostStrategyNotificationQueue'); });
      }, error => { });
  }

  notificationHservices: any;
  getHNotifiData() {
    try { this.notificationHservices.unsubscribe(); } catch (e) { };
    this.notificationHservices = interval(10000).pipe(switchMap(() => this.dataService.GetHoldingsTopNotification()))
      .subscribe((dt: any) => {
        if (this.checkServiceError(dt)) {
          this.getHNotificationQueue.next([]);
        } else {
          this.getHNotificationQueue.next(dt);
          var x = dt.filter((fil: any) => fil.notifyStatus == 'E');
          var fail = dt.filter((fil: any) => fil.notifyStatus == 'F');
          if (x.length == dt.length || dt.length == 0 || (x.length + fail.length) == dt.length) { this.notificationHservices.unsubscribe(); }
        }
      }, (error: any) => {
        this.getHNotificationQueue.next([]);
      });
  }

  getHNotificationDataReload() {
    var that = this;
    that.dataService.GetHoldingsTopNotification().pipe(first()).subscribe((data1: any) => {
      if (data1[0] != "Failed") {
        this.getHNotificationQueue.next(data1);
        this.getHNotifiData();
        setTimeout(function () { $('#showNotifyLoader').hide(); }, 500)
      }
    }, (error: any) => { that.getHNotificationQueue.next([]); $('#showNotifyLoader').hide(); });
  }

  checkHisPostNotify(data:any) {
    return new Promise((resolve, reject) => {
      this.dataService.GetHoldingsFSConditions(data).pipe(first()).subscribe((res: any) => { resolve(res) }, error => { resolve(undefined) });
    });
  }

  PostStrategyHNotification(postData: any) {
    var that = this;
    that.dataService.PostStrategyHNotification(postData).pipe(first())
      .subscribe(data => {
        if (data[0] != "Failed") {
          that.toastr.success('Added to queue successfully', '', { timeOut: 5000, positionClass: "toast-top-center" });
          that.getHNotificationDataReload();
        }
      }, error => { this.logger.logError(error, 'PostStrategyNotificationQueue'); });
  }

  downloadHisExcel(d: any, item: any,account:any) {
    var that = this;
    that.dataService.GetHoldingsSavedkub(d).pipe(first()).subscribe(res => {
      if (isNotNullOrUndefined(res) && res.length > 0) {
        this.hisHoldExcel([...res], item, account);
      } else {
        that.toastr.success('Data currently unavailable...', '', { timeOut: 3000, positionClass: "toast-top-center" });
      }      
      if (isNotNullOrUndefined(item['notifyStatus']) && isNotNullOrUndefined(item['displayQueue']) && item['notifyStatus'] == 'E' && item['displayQueue'] != 'N') {
        var statdata = [{ "notifyid": d.notifyid, "userid": d.userid, "status": 'N' }];
        this.dataService.PostUpdateHShowNotifyQueue(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            this.getHNotificationDataReload();
            this.getHNotifiData();
          }
        }, (error: any) => { });
      }
    }, error => { this.logger.logError(error, 'GetHoldingsSavedkub'); });
  };

  checkHoldingQueue(slid: any, account: any,type:string='') {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var acct: any = [];
    if (type == 'CI') {
      var Hnotify = [...that.getHNotificationQueue.value].filter((y: any) => y.slid == slid && y.accountId == 0 && y.displayQueue == 'Y');
      if (Hnotify.length > 0) { acct.push({ "notifyid": Hnotify[0].notifyId, "status": 'D', "userid": parseInt(userid) }); }
    }

    [...account].forEach((x: any) => {
      var Hnotify = [...that.getHNotificationQueue.value].filter((y: any) => y.slid == slid && y.accountId == x.accountId && y.displayQueue == 'Y');
      if (Hnotify.length > 0) { acct.push({ "notifyid": Hnotify[0].notifyId, "status": 'D', "userid": parseInt(userid) }); }
    });
    if (acct.length > 0) {
      this.dataService.PostUpdateHNotification(acct).pipe(first()).subscribe(data => {
        if (data[0] != "Failed") { this.getHNotificationDataReload(); }
      }, error => { });
    }
  }

  hisHoldExcel(hisHoldingData: any, notifyDt: any, account:any) {
    var that = this;
    let new_workbook = new Workbook();
    var tabBody2: any = [];
    let d = new Date();
    var name: string = notifyDt.Name + '_' + notifyDt.shortName;
    var date = this.formatedates(d.getMonth() + 1) + '/' + this.formatedates(d.getDate()) + '/' + d.getFullYear();
    hisHoldingData.forEach((item1: any) => {
      tabBody2.push([item1.date, item1.isin, item1.ticker, item1.compname, that.formatWt_percentage(item1.weight * 100)]);
    });
    var ds = new_workbook.addWorksheet("Holdings Hsitory");
    var str2: any;
    str2 = "Holdings History";
    ds.addRow([str2]).font = { bold: true };
    str2 = notifyDt.Name + ' (' + notifyDt.shortName + ')';
    ds.addRow([str2]).font = { bold: true };
    if (isNotNullOrUndefined(account) && account !='') {
      ds.addRow([('Account :' + account)]).font = { bold: true };
    }
    str2 = "Report Date: " + date + " (MM/DD/YYYY)";
    ds.addRow([str2]).font = { bold: true };

    ds.addRow("");
    var header2 = ds.addRow(['Date', 'ISIN', 'Ticker', 'Company', 'Weight'])
    header2.font = { bold: true };
    tabBody2.forEach((d: any, i: any) => { ds.addRow(d) });
    ds.columns.forEach(column => {
      if (column.number == 5) {
        column.alignment = { horizontal: 'right' };
      }
    })
    ds.addRow("");

    ds.addRow([]);
    ds.addRow(["For Internal Use Only"]).font = { bold: true }

    //Disclosures 1
    if (that.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosures I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.excelDisclosures.value) && that.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosures II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    var fileName = this.downloadTitleConvert(name) + "_Historical_Holdings_" + this.datepipe.transform(d, 'yyyyMMdd');

    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, fileName + '.xlsx');
    }, err => {
      this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
        timeOut: 10000,
        positionClass: 'toast-top-center'
      });
    });
  }

  hisReturnExcel(monthlyreturns: any, acc: any) {
    var that = this;
    let new_workbook = new Workbook();
    var ws = new_workbook.addWorksheet('Returns History');
    var tabBody: any = [];
    monthlyreturns.forEach((item: any) => { tabBody.push([item.date, item.returns]); });
    let d = new Date();
    var date = this.formatedates(d.getMonth() + 1) + '/' + this.formatedates(d.getDate()) + '/' + d.getFullYear();

    var str: any;
    str = "Returns History";
    ws.addRow([str]).font = { bold: true };
    str = ((isNotNullOrUndefined(monthlyreturns[0]['strategyName'])) ? monthlyreturns[0]['strategyName'] : '') + ((isNotNullOrUndefined(monthlyreturns[0]['strategyShortName'])) ? ("(" +monthlyreturns[0]['strategyShortName'] + ")") : '') ;
    ws.addRow([str]).font = { bold: true };
    if (isNotNullOrUndefined(acc) && acc != "") { ws.addRow([('Account :' + acc)]).font = { bold: true }; }
    str = "Report Date: " + date + " (MM/DD/YYYY)";
    ws.addRow([str]).font = { bold: true };

    ws.addRow("");
    var header = ws.addRow(['Date', 'Returns'])
    header.font = { bold: true };
    tabBody.forEach((d: any, i: any) => { ws.addRow(d) });

    ws.columns.forEach(column => { if (column.number == 2) { column.alignment = { horizontal: 'right' }; } });
    ws.addRow([]);
    ws.addRow(["For Internal Use Only"]).font = { bold: true }


    //Disclosures 1
    if (that.compDis.length > 0) {
      var ds = new_workbook.addWorksheet("Disclosure I");
      ds.addRow(["Disclosures I"]).font = { bold: true };
      ds.mergeCells(ds.rowCount, 1, (ds.rowCount), 10);
      that.compDis.forEach(du => {
        ds.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds.mergeCells(ds.rowCount, 1, (ds.rowCount + 3), 10);
      });
      ds.addRow([]);
      ds.addRow(["For Internal Use Only"]).font = { bold: true }
    }

    //Disclosures 2
    if (isNotNullOrUndefined(that.excelDisclosures.value) && that.excelDisclosures.value.length > 0) {
      var ds1 = new_workbook.addWorksheet("Disclosure II");
      ds1.addRow(["Disclosures II"]).font = { bold: true };
      ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount), 10);
      var Disclosures: any = [];
      that.excelDisclosures.value.forEach((item: any) => { Disclosures.push([item.disclosure]); });
      Disclosures.forEach((du: any) => {
        ds1.addRow(du).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        ds1.mergeCells(ds1.rowCount, 1, (ds1.rowCount + 3), 10);
      });
      ds1.addRow([]);
      ds1.addRow(["For Internal Use Only"]).font = { bold: true }
    }
    var title: string = (((isNotNullOrUndefined(monthlyreturns[0]['strategyName'])) ? monthlyreturns[0]['strategyName'] : '') + "_" + ((isNotNullOrUndefined(monthlyreturns[0]['strategyShortName'])) ? monthlyreturns[0]['strategyShortName'] : ''));
    var fileName = this.downloadTitleConvert(title) + '_Historical_Returns_' + this.datepipe.transform(d,'yyyyMMdd');

    new_workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, fileName + '.xlsx');
    }, err => {
      this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
        timeOut: 10000,
        positionClass: 'toast-top-center'
      });
    });
  }

  nullCheck(d: any, key: string, lengthCheck: boolean = false) {
    if (lengthCheck) {
      if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d[key])) { return d[key] } else { return '' }
    } else {
      if (isNotNullOrUndefined(d) && isNotNullOrUndefined(d[key])) { return true } else { return false }
    }
  }

  downloadAccZeroHisReturn(data: any, acc: any) {
    var that = this;
    this.dataService.DirectIndexMonthlyReturnsDownload(data).pipe(first()).subscribe((monthlyreturns: any) => {
      if (isNotNullOrUndefined(monthlyreturns) && monthlyreturns.length > 0) {
        this.hisReturnExcel(monthlyreturns, acc);
      } else {
        that.toastr.success('Data currently unavailable...', '', { timeOut: 3000, positionClass: "toast-top-center" });
      }
    }, (error: any) => { });
  }

  downloadHisReturn(data: any, acc: any) {
    var that = this;
    this.dataService.GetCustomIndexMonthlyReturnsDownload(data).pipe(first()).subscribe((monthlyreturns: any) => {
      if (isNotNullOrUndefined(monthlyreturns) && monthlyreturns.length > 0) {
        this.hisReturnExcel(monthlyreturns, acc);
      } else {
        that.toastr.success('Data currently unavailable...', '', { timeOut: 3000, positionClass: "toast-top-center" });
      }
    }, (error: any) => { });
  }

  GetSortSetting() {
    var that = this;
    this.dataService.GetSortSettings().pipe(first()).subscribe((res: any) => {
      this.getSortSettingData.next(res);
    }, (error: any) => { this.getSortSettingData.next([]); });
  }

  onLeftGridSort(drilldown_List: any, SelFilter: number, ascending_val: boolean) {
    var dt: any = [...drilldown_List];
    if (SelFilter == 1 && ascending_val) { dt = [...drilldown_List].sort(function (x: any, y: any) { return ascending((x.name), (y.name)); }); }
    else if (SelFilter == 1 && !ascending_val) { dt = [...drilldown_List].sort(function (x: any, y: any) { return descending((x.name), (y.name)); }); }
    else if (SelFilter == 2 && ascending_val) { dt = [...drilldown_List].sort(function (x: any, y: any) { return ascending(parseFloat(x.med), parseFloat(y.med)); }); }
    else if (SelFilter == 2 && !ascending_val) { dt = [...drilldown_List].sort(function (x: any, y: any) { return descending(parseFloat(x.med), parseFloat(y.med)); }); }
    else if (SelFilter == 5) { dt = [...drilldown_List]; }
    return dt;
  }

  onRightGridSort(cdata: any, SelFilter: number, ascending_val: boolean) {
    var data: any = [...cdata];
    if (SelFilter == 1 && (ascending_val == true)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['companyName'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['compname'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(escape(x.compname.toUpperCase()), escape(y.compname.toUpperCase())); });
      } else { }      
    }
    else if (SelFilter == 1 && (ascending_val == false)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['companyName'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(escape(x.companyName.toUpperCase()), escape(y.companyName.toUpperCase())); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['compname'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(escape(x.compname.toUpperCase()), escape(y.compname.toUpperCase())); });
      } else { }      
    }
    else if (SelFilter == 2 && (ascending_val == true)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['score'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.score), parseFloat(y.score)); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['scores'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(parseFloat(x.scores), parseFloat(y.scores)); });
      } else { }    
    } else if (SelFilter == 2 && (ascending_val == false)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['score'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(parseFloat(x.score), parseFloat(y.score)); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['scores'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(parseFloat(x.scores), parseFloat(y.scores)); });
      } else { } 
    } else if (SelFilter == 3 && (ascending_val == true)) { data = data.sort(function (x: any, y: any) { return d3.ascending(x.ticker, y.ticker); }); }
    else if (SelFilter == 3 && (ascending_val == false)) { data = data.sort(function (x: any, y: any) { return d3.descending(x.ticker, y.ticker); }); }
    else if (SelFilter == 4 && (ascending_val == true)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['marketcap'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(x.marketcap, y.marketcap); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['marketCap'])) {
        data = data.sort(function (x: any, y: any) { return d3.ascending(x.marketCap, y.marketCap); });
      } else { }
    } else if (SelFilter == 4 && (ascending_val == false)) {
      if (data.length > 0 && isNotNullOrUndefined(data[0]['marketcap'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(x.marketcap, y.marketcap); });
      } else if (data.length > 0 && isNotNullOrUndefined(data[0]['marketCap'])) {
        data = data.sort(function (x: any, y: any) { return d3.descending(x.marketCap, y.marketCap); });
      } else { }       
    }
    return [...data];
  }
  

  onLeftGridsortTrack(data: any, SelFilter:number,placeTrack:string) {
    try {
      let selFilterData = [...data].filter((x: any) => x.value == SelFilter);
      if (selFilterData.length > 0) { this.userEventTrack(placeTrack, selFilterData[0].Name, selFilterData[0].Name, 'left grid sort click'); }
    } catch (e) { }
  }

  checkPostSortSetting(type: string, selectOption: any, ascending: boolean, place: string) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    return new Promise((resolve, reject) => {
      var name: string = (isNotNullOrUndefined(selectOption['name'])) ? selectOption['name'] : '';     
      var value: number = (isNotNullOrUndefined(selectOption['value'])) ? selectOption['value'] : 0;
      var sortby: string = (ascending) ? 'asc' : 'desc';
      var data: any = [...  this.getSortSettingData.value];
      var defsort: any = {
        "rowno": 0,
        "name": name,
        "value": value,
        "sortby": sortby,
        "etf": false,
        "equity": false,
        "prebuild": false,
        "thematic": false,
        "di": false,
        "ci": false,
        "vs": false,
        "timeline": false,
        "hisTimeline": false,
        "compare": false,
        "userid": parseInt(userid),
        "type": type
      };

      if (isNotNullOrUndefined(selectOption['value'])) {
        var findSort: number = [...data].findIndex((x: any) => parseInt(x.userid) == parseInt(userid) && x.value == selectOption['value'] && x.type == type && x.sortby == sortby);
        if (findSort > -1) {
          data.forEach((d: any) => {
            if (d.type == type && parseInt(d.userid) == parseInt(userid)) { if (d.value == selectOption['value'] && d.sortby == sortby) { d[place] = true; } else { d[place] = false; } }
            return d
          });
        } else {
          data.forEach((d: any) => {
            if (d.type == type && parseInt(d.userid) == parseInt(userid)) { d[place] = false; };
            return d
          });
          defsort[place] = true;
          data.push(defsort);
        }
      }
      data = [...data].filter((x: any) => parseInt(x.userid) == parseInt(userid));
      this.PostSortSetting(data).then((res: any) => { this.GetSortSetting(); }).catch((res: any) => { });
    });
  }

  sortResetDefault(type: string,place: string) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data: any = [...  this.getSortSettingData.value];
    var postApi: boolean = false;
    data.forEach((d: any) => {
      if (d.type == type && parseInt(d.userid) == parseInt(userid) && d[place]) {
        postApi = true;
        d[place] = false;
      }
      return d
    });
    data = [...data].filter((x: any) => parseInt(x.userid) == parseInt(userid));
    if (postApi) {
      this.resetDefalutSortTrig = true;
      this.PostSortSetting(data).then((res: any) => { this.GetSortSetting(); }).catch((res: any) => { });
      var gridType: string = (type == 'W') ? 'Watchlist' :((type == 'L') ? 'left grid' : 'right grid');
      this.userEventTrack(place, gridType, gridType, (gridType+' sort reset click'));
    }    
  }

  PostSortSetting(data:any) {
    var that = this;
    return new Promise((resolve, reject) => {
      this.dataService.PostSortSettings(data).pipe(first()).subscribe((res: any) => {
        resolve(res)
      }, (error: any) => {      
        reject(error)
      });
    });
  }

  GetSortMaster() {
    this.dataService.GetSortMaster({}).pipe(first()).subscribe((res: any) => { this.getSortMasterData.next(res); }, (error: any) => { this.getSortMasterData.next([]); });
  }

  getSortDropdownlist(type: string, placeKey: string, sel: boolean = false) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var data: any = [...this.getSortMasterData.value].filter((x: any) => x.type == type && isNotNullOrUndefined(x[placeKey]) && x[placeKey] == true);
    if (sel) {
      var SelFilter: number = 1;
      var ascending_val: boolean = true;
      var select: any = [...this.getSortSettingData.value].filter((x: any) => parseInt(x.userid) == parseInt(userid) && x.type == type && isNotNullOrUndefined(x[placeKey]) && x[placeKey] == true);
      var defSel: any = [...this.getSortSettingData.value].filter((x: any) => parseInt(x.userid) == 0 && x.type == type && isNotNullOrUndefined(x[placeKey]) && x[placeKey] == true);
      if (defSel.length > 0) {
        SelFilter = (isNotNullOrUndefined(defSel[0]['value'])) ? defSel[0]['value'] : 1;
        ascending_val = (isNotNullOrUndefined(defSel[0]['sortby'])) ? (defSel[0]['sortby'] == 'asc') ? true : false : true;
      }
      if (select.length > 0) {
        SelFilter = (isNotNullOrUndefined(select[0]['value'])) ? select[0]['value'] : SelFilter;
        ascending_val = (isNotNullOrUndefined(select[0]['sortby'])) ? (select[0]['sortby'] == 'asc') ? true : false : ascending_val;
      }
      return { SelFilter: SelFilter, ascending_val: ascending_val };
    } else { return [...data]; }
  }

  resetDefalutSortTrig: boolean = false;
  resetDefalutSort() {
    this.dataService.ResetSortSettings().pipe(first()).subscribe((res: any) => {
      if (isNotNullOrUndefined(res) && res.length > 0 && res[0] == "Success") {
        this.resetDefalutSortTrig = true;
        this.toastr.success('All sorting has been reset successfully', '', { timeOut: 4000, positionClass: "toast-top-center" });
      };
      this.GetSortSetting();
    });
  }

  GetScoresInd: any;
  GetScoresIndexData: any = [];
  GetScoresIndex() {
    var that=this;
    return new Promise((resolve, reject) => {
      if (isNotNullOrUndefined(this.GetScoresIndexData) && this.GetScoresIndexData.length > 0) { resolve([...this.GetScoresIndexData]) } else { 
      that.GetScoresInd = this.dataService.GetScoresIndex().pipe(first()).subscribe((res: any) => {
        if (isNotNullOrUndefined(res) && res.length > 0) {
          let dbScore = res.sort(function (x: any, y: any) { return d3.ascending(x.scores, y.scores); });
          res = [...dbScore];
          res = res.map((d: any, i: number) => {
            d.countrygroup = d.indexName.indexOf('Europe') > -1 ? 'Europe' : d.country;
            d.US = (d.country == 'USA') ? 'USA' : '';
            d.score = d.scores * 100;
            d.deg = d.score;
            d.industry = d.industry + "";
            d.companyName = d.companyName != null ? that.transformToTitleCase(d.companyName.trim()) : "";
            d.company = d.companyName != null ? d.companyName : null;
            d.ticker = d.ticker;
            d.stockKey = d.stockKey;
            d.aisin = d.isin;
            d.isin = "a" + d.stockKey;
            d.Fixeds = "";
            d.cx = ((i * 360 / res.length) - 90);
            d.cy = d.cx;
            return d;
          });
          this.GetScoresIndexData = [...res];
          if (res.length > 0) { resolve([...res]) } else { reject() }
        } else { reject() }
      }, (error: any) => { reject() });
    }
    });
  }

  removeSpecialCharacters(text: string) {
    var cleanValue = text.replace(/[^/a-zA-Z0-9,'\s&.-]/g, '').trimStart();
    cleanValue = cleanValue.replace(/\t/g, '');
    cleanValue = cleanValue.replaceAll(/\s+/g, ' ');
    if (cleanValue.trim().length == 0) { cleanValue = cleanValue.trim(); }
    return cleanValue;
  }

  loadNotifyData() {
    var that = this;
    var getNotificationQueue = [...that.getNotificationQueue.value.filter((x: any) => x.displayQueue != 'N')].map((item: any) => ({ notifyViewType: 'Queue', sortByDate: (isNotNullOrUndefined(item['modifieddate']) ? item['modifieddate'] : item['createddate']), ...item }));
    var getHNotificationQueue = [...that.getHNotificationQueue.value.filter((x: any) => x.displayQueue != 'N')].map((item: any) => ({ notifyViewType: 'Holding', sortByDate: (isNotNullOrUndefined(item['modifieddate']) ? item['modifieddate'] : item['createddate']), ...item }));
    var getTradeNotificationQueue = [...that.getTradeNotificationQueue.value.filter((x: any) => x.displayQueue != 'N')].map((item: any) => ({ notifyViewType: 'Trade', sortByDate: (isNotNullOrUndefined(item['modifieddate']) ? item['modifieddate'] : item['createddate']), ...item }));
    var data = [...getNotificationQueue, ...getHNotificationQueue, ...getTradeNotificationQueue].sort((a: any, b: any) => { return <any>new Date(b.sortByDate) - <any>new Date(a.sortByDate); });    
    var notificationCount = [...data].filter((x: any) => x.notifyStatus == 'E');
    that.getNotificationQueueCount.next(notificationCount.length);
    return [...data];
  }
  openLeftSideGrid() {
    var leftSidebarPinned = this._openPinnedLeftSide;
    if (!leftSidebarPinned) {
      this.openClickedLeftSide.next(true);
      this.getSelectedLeftSide.next('Y');
    }
    
  }
  openRightSideGrid() {
    var rightSidebarPinned = this._openPinnedRightSide;
    if (!rightSidebarPinned) {
      this.openClickedRightSide.next(true);
      this.getSelectedRightSide.next('Y');
    }
  }
  private isSidebarHovered = false;
  onSidebarEnter() {
    this.isSidebarHovered = true;
  }

  onSidebarLeave() {
    this.isSidebarHovered = false;
    this.closeSidebarIfNeeded();
  }

  closeSidebarIfNeeded() {
    var leftSidebarPinned = this._openPinnedLeftSide;
    var leftSidebarOpen = this._getSelectedLeftSide;
    if (leftSidebarOpen == 'Y' && leftSidebarPinned) {
      this.getSelectedLeftSide.next('Y');
    }
    else {
      this.getSelectedLeftSide.next('N');
    }
  }
  onSidebarRightEnter() {
    this.isSidebarHovered = true;
  }

  onSidebarRightLeave() {
    this.isSidebarHovered = false;
    this.closeSidebarRightIfNeeded();
  }

  closeSidebarRightIfNeeded() {
    var rightSidebarPinned = this._openPinnedRightSide;
    var rightSidebarOpen = this._getSelectedRightSide;
    if (rightSidebarOpen == 'Y' && rightSidebarPinned) {
      this.getSelectedRightSide.next('Y');
    }
    else {
      this.getSelectedRightSide.next('N');
    }
  }
 
  downloadTitleConvert(text: string) {
    var title: string = (isNotNullOrUndefined(text)) ? text : '';
    title = title.toLowerCase();
    const strToArr = title.replaceAll('.', '').replaceAll(/([^a-zA-Z0-9])/g, '_').split('_').filter(Boolean);
    const mutateArr = strToArr.map((word, index) => {
      word = word.trim().toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    title = mutateArr.join('_')
    title = title.replaceAll('Naa_', 'NAA_').replaceAll('Us_', 'US_');
    return title;
  }

  resetService() {
    this.excelDisclosures.next([]);
    this.tradingHoursData.next([]);
    this.rebalanceDates.next([]);
    this.ETFIndex.next([]);
    this.authenticateList.next([]);
    this.UserTabsRolePermissionData.next([]);
    this.licenceAgreement.next([]);
    this.UserMenuRolePermission.next([]);
    this.getPinnedMenuItems.next([]);
    this.selResData.next([]);
    this.GetESGScoreData.next([]);
    this.GetSchedularMaster.next([]);
    this.getNotificationQueue.next([]);
    this.getTradeNotificationQueue.next([]);
    this.GetlatestBMCompData.next([]);
    this.taxLotData.next([]);
    this.getRebalancesPopupData.next([]);
    this.EqGrowthData.next([]);
    this.EqValueData.next([]);
    this.selResETFData.next([]);
    this.dbGICS.next([]);
    this.selectedAccountCompanyList.next([]);
    this.stgyListDashAccsData.next([]);
    this.WatchListData.next([]);
    this.AllocListData.next([]);    
    this.getSortSettingData.next([]);    
    this.getSortMasterData.next([]);    
    this.circleRangeData.next([]);
    this.resetDefalutSortTrig = false;
  }
}

export function isNullOrUndefined(value: any) { return value === null || value === undefined; }

export function isNotNullOrUndefined(value: any) { if (value === null || value === undefined) { return false } else { return true }; }
interface rPeriod {
  rebalancefreq: string;
  rebalancefreqName: string;
}
