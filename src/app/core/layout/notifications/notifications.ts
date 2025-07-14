import { Component, AfterViewInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../services/sharedData/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/moduleService/account.service';
import { DataService } from '../../services/data/data.service';
import { DirectIndexService } from '../../services/moduleService/direct-index.service';
import { CustomIndexService } from '../../services/moduleService/custom-index.service';
declare var $: any;
// import { DirectIndexService } from '../../services/moduleService/directindex-data.service';
// import { AccountService } from '../../services/moduleService/account-data.service';
// import { CustomIndexService } from '../../services/moduleService/customindex-data.service';
@Component({
  selector: 'side-notifications',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class notificationsComponent implements AfterViewInit {
  // @HostListener('window:resize', ['$event'])
  // classFlag = false;
  openNotification: boolean = false;
   skullLoader: boolean = true;
  // getNotificationQueue: any;
  // queue:boolean=true;
  // inProgress:boolean=true;
  // completed: boolean = true;
  myAcclist: any;
  // onResize(event:any) {
  //   var that = this;
  //   var innerW = event.target.innerWidth;

  //   if (innerW <= 1600) {
  //     that.classFlag = true;
  //   } else {
  //     that.classFlag = false;
  //   }
  // }
 subscriptions = new Subscription();
 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    //console.log(target);
    // Check if the click occurred outside of the specific div
    if (this.sharedData._openNotification == true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
        //console.log('InnerDiv');
        if (this.sharedData._openNotification == true) { this.sharedData.openNotification.next(false); };
      } else {
        //console.log('InnerDiv1');
      }
    }
  }
  // Helper function to check if an element is inside the specific div
  private isInsideDiv(element: HTMLElement): boolean {
    // Logic to check if element is inside the specific div
    return element.closest('.notify-l') !== null || element.closest('.list-n') !== null || element.closest('.f-right-l') !== null || element.closest('button') !== null;
  }
  constructor(private dataService: DataService,
    public cusIndexService: CustomIndexService,
    public sharedData: SharedDataService,
    private toastr: ToastrService,
    public dialog: MatDialog, public accountService: AccountService,
    public dirIndexService: DirectIndexService, private router: Router) { }

   checkErrorType(d: string) {
     var Er = 'Insufficient Count';
     if (isNotNullOrUndefined(d) && d.toLowerCase().indexOf(Er.toLowerCase()) > -1) { return true } else { return false }
   }
  getNotificationQueue: any = [];
  getHNotificationQueue: any = [];

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  ngOnInit() {
     var that = this;
    // if (window.innerWidth <= 1600) { that.classFlag = true; } else { that.classFlag = false; }
    this.dataService.GetSubAccounts().pipe(first()).subscribe((data: any) => {
       that.myAcclist = data;
       that.accountService.GetAccounts.next(data);
     });
     that.sharedData.getNotificationQueue.subscribe(res => {
       that.getNotificationQueue = [...res.filter((x:any) => x.displayQueue != 'N')];
       that.skullLoader = false;
       this.checkCount();
     });
    that.sharedData.getHNotificationQueue.subscribe(res => {
      that.getHNotificationQueue = [...res.filter((x: any) => x.displayQueue != 'N')];
      this.checkCount();
     });
        
  }

  checkCount() {
    var that = this;
    var notificationCount = that.getNotificationQueue.filter((x: any) => x.notifyStatus == 'E' && x.displayQueue == 'Y');
    var notificationHCount = that.getHNotificationQueue.filter((x: any) => x.notifyStatus == 'E' && x.displayQueue == 'Y');
    var count = notificationCount.length + notificationHCount.length;
    that.sharedData.getNotificationQueueCount.next(count);
  }

   checkAccVal(d:any) {
     if (isNotNullOrUndefined(this.accountService.GetAccounts.value['accounts'])) {
       var fillD = this.accountService.GetAccounts.value['accounts'].filter((x:any) => parseInt(x.id) == parseInt(d.accountId));
       if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) { return fillD[0]['accountVan'] } else { return "" }
     } else { return "" }
   }
  formatName(d:any){
    var name = d
    if (name.length > 40) {
      name = name.slice(0, 40).trim() + "...";
    }
    else {
      name = name;
    }
    return name;
  }
  ngAfterViewInit() {
   
  }
  // ngAfterViewChecked() { }

  modifiedDate(dat:any) {
    if (isNullOrUndefined(dat)) { return ""; } else {
      var iso = dat;
      var date = iso.split('T')[0];
      var datesp = date.substr(5, 2) + '/' + date.substr(8, 2) + '/' + date.substr(0, 4);
      var time = iso.split('T')[1].split('.')[0];
      return datesp + ' ' + time;
      return new Date(dat)
    }
  }
  closeNotify() { this.sharedData.openNotification.next(false); };
  
   warMsg =""
   viewIndex(item:any) {
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
         }, (error:any) => { });
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
    that.sharedData.userEventTrack('My Strategies', "Direct Indexing", item.name, 'View indexClick');
    setTimeout(() => { that.DIcheck(item); }, 1000);
   }

  insufficientCountClick(item:any) {
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

   updateNotifyQue(item:any) {
     let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     var stat = 'N';
     var statdata = [{ "notifyid": item.notifyId, "status": stat, "userid": parseInt(userid) }];
     this.dataService.PostUpdateStrategyDisplayQueue(statdata).pipe(first()).subscribe(
       data => {
         if (data[0] != "Failed") { this.sharedData.getNotificationDataReload(); };
       }, error => { this.toastr.success(this.sharedData.checkMyAppMessage(0, 11), '', { timeOut: 5000 }); });
   }

   DIcheck(item: any) {
     //this.sharedData.showMatLoader.next(true);
     var fObj = this.dirIndexService._getBetaIndex_Direct.filter((du:any) => du.id == item.dIRefId);
     var Obj = Object.assign({}, fObj[0]);
     this.dirIndexService.selectedDirIndFactsheet.next(item.accountId);
     this.dirIndexService.dirIndSearch(Obj);
     //this.dirIndexService.notifyDiClick.next(true);
     //this.centerGrid_Click(Obj);
   }

  // builIndexCalculate(d) {
  //   var that = this;
  //   that.sharedData.tempTaxharvestEnable.next(false);
  //   that.cusIndexService.currentSList.next(d);
  //   ///////////// prebuilt Filters
  //   if (d.taxEffAwareness == "Y") { that.cusIndexService.bldMyIndTaxEffVal.next(1); }
  //   else { that.cusIndexService.bldMyIndTaxEffVal.next(2); };
  //   that.cusIndexService.bldMyIndSelByVal.next(d.selectBy);
  //   that.cusIndexService.enableTrading_factsheet.next('N');
  //   that.cusIndexService.bldMyIndselNoCompVal.next(d.noofComp);
  //   this.cusIndexService.bldMyIndCashTarget.next(d.cashTarget);
  //   this.cusIndexService.bldMyIndRebalanceType.next(d.rebalanceType);
  //   that.cusIndexService.bldMyIndweightByVal.next(d.weightBy);
  //   ///////////// prebuilt Filters
  //   that.cusIndexService.perStatCheck.next(0);
  //   that.cusIndexService.companyExList.next([]);
  //   that.cusIndexService.remCompData.next([]);
  //   that.cusIndexService.AddCompData.next([]);
  //   that.cusIndexService.gicsExList.next([]);
  //   that.cusIndexService.remGicsData.next([]);
  //   that.cusIndexService.scoresExList.next([]);
  //   that.sharedData.prebuiltfilteredData.next([]);
  //   this.cusIndexService.remHFScoreEnable.next(true);
  //   that.cusIndexService.remGicsData.next(that.cusIndexService._remGicsData);
  //   that.cusIndexService.remEsgExcluCatData.next([]);
  //   that.cusIndexService.remEsgExcluCatData.next(that.cusIndexService._remEsgExcluCatData);
  //   that.cusIndexService.exclusionGics.next(that.cusIndexService._exclusionGics);
  //   that.cusIndexService.remCompData.next(that.cusIndexService._remCompData);
  //   that.cusIndexService.exclusionCompData.next(that.cusIndexService._exclusionCompData);
  //   that.cusIndexService.ratingExList.next([]);
  //   that.cusIndexService.ratingExList.next(that.cusIndexService._ratingExList);
  //   that.cusIndexService.esgRatingValue.next(0);
  //   //that.sharedData.customizeSelectedIndex.next(d);
  //   that.cusIndexService.getStrategyData_rebuilt('0', 'A')
  //   this.sharedData.showMatLoader.next(false);
  //   this.sharedData.showRightSideGrid.next(true);
  //   this.dirIndexService.DIdashIndClick = true;
  //   if (this.sharedData.checkMyUserType()) { this.router.navigate(["/approvedStrategies"]) }
  //   else { this.router.navigate(["/directIndexing"]) }
  // }

  // centerGrid_Click(d, type: string='') {
  //   var that = this;
  //   that.cusIndexService.CIGDinit = false;
  //   if (that.sharedData.checkShowLeftTab(12) == 'A') {
  //     var selectedPath = [];
  //     var checkETFIndex = that.sharedData.ETFIndex.value.filter(xx => xx.assetId == d.assetId);
  //     if (checkETFIndex.length > 0) {
  //       d.indexType = 'Exchange Traded Funds';
  //       d.group = 'ETFName';
  //       d.medianCont = 0;
  //     } else {
  //       d.countrygroup = 'USA';
  //       d.country = 'USA';
  //       d.group = 'Index';
  //       d.indexType = 'Equity Universe';
  //       d.med = 0;
  //     }
  //     var brcm1 = [...that.dirIndexService.PrebuiltMainTab].map(a => ({ ...a }))[0];
  //     selectedPath.push(brcm1);
  //     var brcm2 = [...that.dirIndexService.PrebuiltCat].filter((x: any) => { if ([...x.assetLists].filter(y => y == d.assetId).length > 0) { return x } });
  //     if (brcm2.length > 0) { selectedPath.push(brcm2[0]); };
  //     selectedPath.push(d);
  //     that.sharedData.showSpinner_buy.next(false);
  //     that.sharedData.showSpinnerPercentage_buy.next(0);
  //     that.cusIndexService.exclusionFullCompData.next([]);
  //     that.dirIndexService.prebuiltBrcmData.next(selectedPath);
  //     if (d.group == "ETFName" || d.group == "Index") {
  //       that.dirIndexService.getPrebuiltlvlData(d).then(data => {
  //         that.dirIndexService.startIndexClick_pre.next(true);
  //         var dta: any = [...data['menuData']].map(a => ({ ...a }));
  //         dta = dta.filter(d => d.medianCont > 0);
  //         if (d.group == "Index") {
  //           var usingIndexName = that.cusIndexService.myIndEqindex.filter(x => x.assetId == d.assetId);
  //           d.usingName = usingIndexName[0].name;
  //         } else {
  //           var usingIndexName1 = [...that.sharedData._ETFIndex].filter(x => x.assetId == d.assetId);
  //           d.usingName = usingIndexName1[0].ticker;
  //         }
  //         that.dirIndexService.customizeSelectedIndex_prebuilt.next(d);
  //         that.cusIndexService.customizeSelectedIndex.next(d);
  //         that.cusIndexService.exclusionFullCompData.next(data['CompanyList']);
  //         that.cusIndexService.exclusionCompData.next(data['CompanyList']);
  //         that.cusIndexService.CIGDinit = true;
  //         that.cusIndexService.checkInitCILoad();
  //         if (type =='edit'){ that.sharedData.showDIFactsheet.next(false); }else { that.sharedData.showDIFactsheet.next(true); }
  //         that.builIndexCalculate(d);
  //       });
  //       if (this.sharedData.checkMyUserType()) { that.sharedData.userEventTrack('My Strategies', "Approved Strategies", d.name, 'View indexClick'); }
  //       else { that.sharedData.userEventTrack('My Strategies', "Direct Indexing", d.name, 'View indexClick'); }
  //     }
  //   } else { $('#myDeleteModal').modal('show'); }
  // }


   clickedrow_Remove: any;
   closeNotify_row(item:any) {
     this.clickedrow_Remove = item;
     $("#deleteModalRow").modal({ backdrop: false });
     $('#deleteModalRow').modal('show');
     //$('.modal-backdrop').remove()
   }
   notifyAdminError(item:any) {
     this.clickedrow_Remove = item;
     let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     var statdata = { "notifyid": item.notifyId, "userid": userid };
     this.dataService.PostNotificationError(statdata).pipe(first()).subscribe(data => {
           if (data[0] != "Failed") {
             this.toastr.info(this.sharedData.checkMyAppMessage(0, 6), '', { timeOut: 5000});
             var statdata = [{ "notifyid": item.notifyId, "userid": userid, "status": 'D' }];
             this.dataService.PostUpdateStrategyNotification(statdata).pipe(first())
               .subscribe(data => {
                   if (data[0] != "Failed") {
                     this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
                     this.sharedData.getNotificationDataReload();
                   }
                 },error => { });
           }
         },error => { });
   }

  deleteAll_row(title: any, remove: any) {
    $("#deleteAllModalRow").modal({ backdrop: false });
    $('#deleteAllModalRow').modal('show');
  }
  // refreshAll_row() {
  //   $('#showNotifyLoader').show();
  //   this.sharedData.getNotificationDataReload();
  // }
   removestrategyRecord() {
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
  /////////// Remove all Queue indexes
   removeallstrategyRecord() {
     var that = this;
     var item = this.clickedrow_Remove;
     let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));


     var allRecord_Comp:any = []; // Using for completed delete
     var allRecord:any = []; // Using for Queue & In progress delete
     var allQueue = that.getNotificationQueue;
     var getCompletedQueue = allQueue.filter((x:any) => x.notifyStatus == 'E');
     var getRemainingQueue = allQueue.filter((x:any) => x.notifyStatus != 'E');
     if (getCompletedQueue.length > 0) {
       getCompletedQueue.forEach(function (item:any, i:any) {
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
               this.toastr.success(this.sharedData.checkMyAppMessage(0,9), '', { timeOut: 5000 });
               //this.sharedData.getNotifiData();
             }
           },
           error => { });
     }
     if (getRemainingQueue.length > 0) {
       getRemainingQueue.forEach(function (item:any, i:any) {
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
           },error => { });
     }
     this.removeallHstrategyRecord();
  }

  removeallHstrategyRecord() {
     var that = this;
     let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     var allRecord_Comp:any = []; 
     var allRecord:any = [];
     var allQueue = that.getHNotificationQueue;
     var getCompletedQueue = allQueue.filter((x:any) => x.notifyStatus == 'E');
     var getRemainingQueue = allQueue.filter((x:any) => x.notifyStatus != 'E');
     if (getCompletedQueue.length > 0) {
       getCompletedQueue.forEach(function (item:any, i:any) {
         allRecord_Comp.push({
           "notifyid": item.notifyId,
           "status": 'N',
           "userid": parseInt(userid)
         });
       });
       this.dataService.PostUpdateHShowNotifyQueue(allRecord_Comp).pipe(first()).subscribe(data => {
             if (data[0] != "Failed") {
               this.sharedData.getHNotificationDataReload();
               this.toastr.success(this.sharedData.checkMyAppMessage(0,9), '', { timeOut: 5000 });
             }
           });
     }
     if (getRemainingQueue.length > 0) {
       getRemainingQueue.forEach(function (item:any, i:any) {
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
           },error => { });
     }
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

  checkTicker(d: any) { if (isNotNullOrUndefined(d.ticker)) { return d.ticker } else { return 'Equity Universe' } }

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
