import { Component, HostListener } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { CustomIndexService } from '../../services/moduleService/custom-index.service';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../services/sharedData/shared-data.service';
import { Router } from '@angular/router';
import { DirectIndexService } from '../../services/moduleService/direct-index.service';
import { AccountService } from '../../services/moduleService/account.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription, first } from 'rxjs';
// @ts-ignore
declare var $;
@Component({
  selector: 'app-multi-notifications',
  templateUrl: './multi-notifications.component.html',
  styleUrl: './multi-notifications.component.scss'
})
export class MultiNotificationsComponent {
  subscriptions = new Subscription();
  constructor(private dataService: DataService, public cusIndexService: CustomIndexService,
    public sharedData: SharedDataService, private toastr: ToastrService,
    public dialog: MatDialog, public accountService: AccountService,
    public dirIndexService: DirectIndexService, private router: Router) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.sharedData._openNotification == true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
        if (this.sharedData._openNotification == true) { this.sharedData.openNotification.next(false); };
      } else { }
    }
  }

  private isInsideDiv(element: HTMLElement): boolean {
    return element.closest('.notify-l') !== null || element.closest('.list-n') !== null || element.closest('.f-right-l') !== null || element.closest('button') !== null;
  }

  checkErrorType(d: string) {
    var Er = 'Insufficient Count';
    if (isNotNullOrUndefined(d) && d.toLowerCase().indexOf(Er.toLowerCase()) > -1) { return true } else { return false }
  }

  closeNotify() { this.sharedData.openNotification.next(false); };

  deleteAll_row(title: any, remove: any) {
    $("#deleteAllModalRow").modal({ backdrop: false });
    $('#deleteAllModalRow').modal('show');
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  getNotificationData: any = [];

  myAcclist: any = [];
  ngOnInit() {
    var that = this;
    this.dataService.GetSubAccounts().pipe(first()).subscribe((data: any) => { that.accountService.GetAccounts.next(data); });
    var GetAccounts= that.accountService.GetAccounts.subscribe(res => { that.myAcclist = res; });
    var getNotificationQueue = that.sharedData.getNotificationQueue.subscribe(res => { this.getNotificationData = [...this.sharedData.loadNotifyData()]; });
    var getHNotificationQueue = that.sharedData.getHNotificationQueue.subscribe(res => { this.getNotificationData = [...this.sharedData.loadNotifyData()]; });
    var getTradeNotificationQueue = that.sharedData.getTradeNotificationQueue.subscribe(res => { this.getNotificationData = [...this.sharedData.loadNotifyData()]; });
    this.subscriptions.add(GetAccounts);
    this.subscriptions.add(getNotificationQueue);
    this.subscriptions.add(getHNotificationQueue);
    this.subscriptions.add(getTradeNotificationQueue);
  }

  checkTicker(d: any) { if (isNotNullOrUndefined(d.ticker)) { return d.ticker } else { return 'Equity Universe' } }

  clickedrow_Remove: any;
  notifyAdminError(item: any) {
    this.clickedrow_Remove = item;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var statdata = { "notifyid": item.notifyId, "userid": userid };
    this.dataService.PostNotificationError(statdata).pipe(first()).subscribe(data => {
      if (data[0] != "Failed") {
        this.toastr.info(this.sharedData.checkMyAppMessage(0, 6), '', { timeOut: 5000 });
        var statdata = [{ "notifyid": item.notifyId, "userid": userid, "status": 'D' }];
        this.dataService.PostUpdateStrategyNotification(statdata).pipe(first())
          .subscribe(data => {
            if (data[0] != "Failed") {
              this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
              this.sharedData.getNotificationDataReload();
            }
          }, error => { });
      }
    }, error => { });
  }

  modifiedDate(dat: any) {
    if (isNullOrUndefined(dat)) { return ""; } else {
      var iso = dat;
      var date = iso.split('T')[0];
      var datesp = date.substr(5, 2) + '/' + date.substr(8, 2) + '/' + date.substr(0, 4);
      var time = iso.split('T')[1].split('.')[0];
      return datesp + ' ' + time;
    }
  }

  closeNotify_row(item: any) {
    this.clickedrow_Remove = item;
    $("#deleteModalRow").modal({ backdrop: false });
    $('#deleteModalRow').modal('show');
  }

  closeNotify_rowTrade(item: any) {
    this.clickedrow_Remove = item;
    $("#deletetradeModalRow").modal({ backdrop: false });
    $('#deletetradeModalRow').modal('show');
    $('.modal-backdrop').remove()
  }

  removestrategyRecordQueue() {
    var item = this.clickedrow_Remove;
    var checkStatus = item.notifyStatus;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    if (checkStatus == 'E') { /// E is status completed
      var statdata = [
        {
          "notifyid": item.notifyId,
          "userid": userid,
          "status": 'N'
        }
      ];

      if (isNotNullOrUndefined(item['category']) && item['category'] == 'H') {
        this.dataService.PostUpdateHShowNotifyQueue(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            this.sharedData.getHNotificationDataReload();
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
            this.sharedData.getHNotifiData();
          }
        }, (error: any) => { });
      } else {
        this.dataService.PostUpdateStrategyDisplayQueue(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            this.sharedData.getNotificationDataReload();
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
            this.sharedData.getNotifiData();
          }
        }, (error: any) => { });
      }
    } else {
      var statdata = [{
        "notifyid": item.notifyId,
        "userid": userid,
        "status": 'D'
      }];

      if (isNotNullOrUndefined(item['category']) && item['category'] == 'H') {
        this.dataService.PostUpdateHNotification(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            this.sharedData.getHNotificationDataReload();
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 8), '', { timeOut: 5000 });
            this.sharedData.getHNotifiData();
          }
        }, (error: any) => { });
      } else {
        this.dataService.PostUpdateStrategyNotification(statdata).pipe(first()).subscribe((data: any) => {
          if (data[0] != "Failed") {
            this.sharedData.getNotificationDataReload();
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 8), '', { timeOut: 5000 });
            this.sharedData.getNotifiData();
          }
        }, (error: any) => { });
      }
    }
  }

  removestrategyRecord() {
    var item = this.clickedrow_Remove;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var statdata = [{ "sid": item['sumId'], "userid": userid, "sumStatus": item['code'] }];
    this.dataService.PostUpdateTradeNotification(statdata).pipe(first()).subscribe(data => {
      if (data[0] != "Failed") {
        this.sharedData.getTradeNotificationDataReload();
        this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
      }
    }, error => { });
  }

  removeallstrategyRecordQueue() {
    var that = this;
    var item = this.clickedrow_Remove;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));


    var allRecord_Comp: any = []; // Using for completed delete
    var allRecord: any = []; // Using for Queue & In progress delete
    var allQueue = [...that.sharedData.getNotificationQueue.value.filter((x: any) => x.displayQueue != 'N')]
    var getCompletedQueue = allQueue.filter((x: any) => x.notifyStatus == 'E');
    var getRemainingQueue = allQueue.filter((x: any) => x.notifyStatus != 'E');
    if (getCompletedQueue.length > 0) {
      getCompletedQueue.forEach(function (item: any, i: any) {
        allRecord_Comp.push({
          "notifyid": item.notifyId,
          "status": 'N',
          "userid": parseInt(userid)
        });
      });
      const sList = this.dataService.PostUpdateStrategyDisplayQueue(allRecord_Comp).pipe(first())
        .subscribe(data => {
          if (data[0] != "Failed") {
            this.sharedData.getNotificationDataReload();
            this.toastr.success(this.sharedData.checkMyAppMessage(0, 9), '', { timeOut: 5000 });
            //this.sharedData.getNotifiData();
          }
        },
          error => { });
    }
    if (getRemainingQueue.length > 0) {
      getRemainingQueue.forEach(function (item: any, i: any) {
        // convert to radians
        allRecord.push({
          "notifyid": item.notifyId,
          "status": 'D',
          "userid": parseInt(userid)
        });
      });

      this.dataService.PostUpdateStrategyNotification(allRecord).pipe(first()).subscribe(data => {
        if (data[0] != "Failed") {
          this.sharedData.getNotificationDataReload();
          this.toastr.success(this.sharedData.checkMyAppMessage(0, 10), '', { timeOut: 5000 });
        }
      }, error => { });
    }
    this.removeallHstrategyRecord();
  }

  removeallHstrategyRecord() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var allRecord_Comp: any = [];
    var allRecord: any = [];
    var allQueue = [...that.sharedData.getHNotificationQueue.value.filter((x: any) => x.displayQueue != 'N')];
    var getCompletedQueue = allQueue.filter((x: any) => x.notifyStatus == 'E');
    var getRemainingQueue = allQueue.filter((x: any) => x.notifyStatus != 'E');
    if (getCompletedQueue.length > 0) {
      getCompletedQueue.forEach(function (item: any, i: any) {
        allRecord_Comp.push({
          "notifyid": item.notifyId,
          "status": 'N',
          "userid": parseInt(userid)
        });
      });
      this.dataService.PostUpdateHShowNotifyQueue(allRecord_Comp).pipe(first()).subscribe(data => {
        if (data[0] != "Failed") {
          this.sharedData.getHNotificationDataReload();
          this.toastr.success(this.sharedData.checkMyAppMessage(0, 9), '', { timeOut: 5000 });
        }
      });
    }
    if (getRemainingQueue.length > 0) {
      getRemainingQueue.forEach(function (item: any, i: any) {
        // convert to radians
        allRecord.push({
          "notifyid": item.notifyId,
          "status": 'D',
          "userid": parseInt(userid)
        });
      });
      this.dataService.PostUpdateHNotification(allRecord).pipe(first()).subscribe(data => {
        if (data[0] != "Failed") {
          this.sharedData.getHNotificationDataReload();
          this.toastr.success(this.sharedData.checkMyAppMessage(0, 10), '', { timeOut: 5000 });
        }
      }, error => { });
    }
  }

  removeallstrategyRecord() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var allRecord_Comp: any = [];
    var allQueue = that.sharedData._getTradeNotificationQueue;
    if (allQueue.length > 0) {
      allQueue.forEach(function (item: any) {
        allRecord_Comp.push({ "sid": item['sumId'], "userid": userid, "sumStatus": item['code'] });
      });
      this.dataService.PostUpdateTradeNotification(allRecord_Comp).pipe(first()).subscribe((data: any) => {
        if (data[0] != "Failed") {
          this.sharedData.getTradeNotificationDataReload();
          this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
        }
      }, (error: any) => { });
    }
  }

  checkAccVal(d: any) {
    if (isNotNullOrUndefined(this.accountService.GetAccounts.value['accounts'])) {
      var fillD = this.accountService.GetAccounts.value['accounts'].filter((x: any) => parseInt(x.id) == parseInt(d.accountId));
      if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) { return fillD[0]['accountVan'] } else { return "" }
    } else { return "" }
  }

  warMsg = ""
  viewIndex(item: any) {
    var that = this;
    //this.itemClicked.push(item);
    //this.sharedData.showMatLoader.next(true);
    if (item.notifyStatus == 'E' && isNotNullOrUndefined(item.dIRefId)) {
      if (that.dirIndexService._getBetaIndex_Direct.length > 0) { that.moveDIView(item); } else {
        that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
          if (data1[0] != "Failed") {
            that.dirIndexService.getBetaIndex_Direct.next(data1);
            that.moveDIView(item);
          }
        }, (error: any) => { });
      }
    }
    else if (item.notifyStatus == 'E') {
      this.cusIndexService.currentSNo.next(item['rowno']);
      this.cusIndexService.selectedCIIndFactsheet.next(item['accountId']);
      var ttype: any = item['accountId'] + " " + item['Name']
      this.startLoadIndex(item['assetId']);
      this.sharedData.userEventTrack('Notification', ttype, ttype, 'view Index click');
    }
  }

  moveDIView(item: any) {
    var that = this;
    that.sharedData.openNotification.next(false);
    that.sharedData.showCircleLoader.next(true);
    that.dirIndexService.startIndexClick_direct.pipe(first())
      .subscribe((res: boolean) => { if (res) { that.dirIndexService.startIndexClick_direct.next(false); } });
    that.dirIndexService.showReviewIndexLoaded.pipe(first())
      .subscribe((res: boolean) => { if (res) { that.dirIndexService.showReviewIndexLoaded.next(false); } });
    if (this.dirIndexService.directIndexBrcmData.value.length > 0) { this.dirIndexService.directIndexBrcmData.next([]); }
    this.dirIndexService.notifyDiClick.next(true);
    if (this.sharedData.checkMyUserType()) { this.router.navigate(["/approvedStrategies"]) }
    else { this.router.navigate(["/directIndexing"]) }
    that.sharedData.userEventTrack('Notification', "Direct Indexing", item.name, 'View indexClick');
    setTimeout(() => { that.DIcheck(item); }, 1000);
  }

  insufficientCountClick(item: any) {
    var that = this;
    this.sharedData.showMatLoader.next(true);
    if (isNotNullOrUndefined(item.dIRefId)) {
      //if (that.dirIndexService._getBetaIndex_prebuilt.length > 0) {
      //  var fObj = this.dirIndexService._getBetaIndex_prebuilt.filter((du:any) => du.id == item.dIRefId);
      //  var Obj = Object.assign({}, fObj[0]);
      //  //this.sharedData.selAccountFactsheet.next(0);
      //  //this.centerGrid_Click(Obj, 'edit');
      //  this.updateNotifyQue(item);
      //} else {
      //  that.dataService.GetStrategyAssetListPrebuilt('B').pipe(first()).subscribe((data1: any) => {
      //    if (data1[0] != "Failed") {
      //      var dtabeta: any;
      //      dtabeta = data1;
      //      dtabeta.forEach((x: any) => {
      //        x.srName = x.name;
      //        x.basedOn = that.dirIndexService.changeBasedOnIndexName(x.name);
      //        return x
      //      });
      //      that.dirIndexService.getBetaIndex_prebuilt.next(dtabeta.map((a: any) => ({ ...a })));
      //      var fObj = this.dirIndexService._getBetaIndex_prebuilt.filter((du: any) => du.id == item.dIRefId);
      //      var Obj = Object.assign({}, fObj[0]);
      //      //this.sharedData.selAccountFactsheet.next(0);
      //      //this.centerGrid_Click(Obj, 'edit');
      //      this.updateNotifyQue(item);
      //    }
      //  }, error => { });
      //}
    } else {
      this.cusIndexService.notifyDiClick.next(false);
      this.cusIndexService.selectedCIIndFactsheet.next(undefined);
      this.cusIndexService.startIndexClick_custom.next(false);
      this.cusIndexService.customizeSelectedIndex_custom.next(item);
      this.cusIndexService.currentSNo.next(item['rowno']);
      this.router.navigate(["customIndexing"]);
      this.updateNotifyQue(item);
    }
  }

  updateNotifyQue(item: any) {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var stat = 'N';
    var statdata = [{ "notifyid": item.notifyId, "status": stat, "userid": parseInt(userid) }];
    this.dataService.PostUpdateStrategyDisplayQueue(statdata).pipe(first()).subscribe(
      data => {
        if (data[0] != "Failed") { this.sharedData.getNotificationDataReload(); };
      }, error => { this.toastr.success(this.sharedData.checkMyAppMessage(0, 11), '', { timeOut: 5000 }); });
  }

  DIcheck(item: any) {
    var fObj = this.dirIndexService._getBetaIndex_Direct.filter((du: any) => du.id == item.dIRefId);
    var Obj = Object.assign({}, fObj[0]);
    this.dirIndexService.selectedDirIndFactsheet.next(item.accountId);
    this.dirIndexService.dirIndSearch(Obj);
  }

  startLoadIndex(assetID: number) {
    var recETFIndex = [...this.sharedData.ETFIndex.value];
    var gridData_Def = [...recETFIndex];
    var dd = gridData_Def.filter(x => x.assetId == assetID);
    if (isNotNullOrUndefined(dd) && dd.length > 0) {
      var d = dd[0];
      d.name = d.etfName;
      d.group = "ETFName";
      d.med = (parseFloat(d.medianCont) * 100).toFixed(1);
      d.indexType = 'Exchange Traded Funds';
      this.cusIndexService.customizeSelectedIndex_custom.next(d);
    } else {
      var ind: any = this.cusIndexService.equityIndexeMasData.value.filter((x: any) => x.assetId == assetID);
      if (ind.length > 0) {
        var countryList: any = {
          assetId: assetID, filteredIndexes: ind[0].name, country: ind[0].country, med: '', countrygroup: ind[0].country, name: ind[0].name, indexType: "Equity Universe", group: "Index"
        }
        this.cusIndexService.customizeSelectedIndex_custom.next(countryList);
      }
    }
    this.sharedData.openNotification.next(false);
    this.cusIndexService.startIndexClick_custom.next(false);
    this.cusIndexService.notifyDiClick.next(true);
    this.router.navigate(["customIndexing"]);
  }

  downloadHis(d: any) {
    var that = this;
    var dt = new Date();
    let userid = parseInt(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
    var ETFIndex = [...that.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
    var indexId = 123;
    if (ETFIndex.length > 0) { dt = new Date(ETFIndex[0]['holdingsdate']); }
    else {
      indexId = this.cusIndexService.getIndexId(d);
      dt = new Date(this.sharedData.equityHoldDate);
    };
    var date = dt.getFullYear() + '-' + that.sharedData.formatedates(dt.getMonth() + 1) + '-' + that.sharedData.formatedates(dt.getDate());
    var data = {
      "accountId": d['accountId'],
      "notifyid": d['notifyId'],
      "assetid": d['assetId'],
      "userid": userid,
      "strategyId": d['slid'],
      "enddate": date,
      "tenYrFlag": d['tenYrFlag'],
      "indexId": indexId,
      "freqflag": d['freqflag']
    };

    var account: string = '';
    var fillD: any = this.accountService.GetAccounts.value['accounts'].filter((x: any) => parseInt(x.id) == parseInt(d['accountId']));
    if (fillD.length > 0) {
      account = ((isNotNullOrUndefined(fillD[0]['accountVan']) ? fillD[0]['accountVan'] : "") + " (" + (isNotNullOrUndefined(fillD[0]['accountTitle']) ? fillD[0]['accountTitle'] : "") + ")");
    }
    this.sharedData.downloadHisExcel(data, d, account);
    that.sharedData.openNotification.next(false);
  }
}
