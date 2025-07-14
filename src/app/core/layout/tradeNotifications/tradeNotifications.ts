import { Component, AfterViewInit, HostListener, AfterViewChecked } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../services/sharedData/shared-data.service';
import { Subscription, first } from 'rxjs';
import { DataService } from '../../services/data/data.service';
import { ToastrService } from 'ngx-toastr';
// @ts-ignore
declare var $;
@Component({
  selector: 'side-tradenotifications',
  templateUrl: './tradeNotifications.html',
  styleUrls: ['./tradeNotifications.scss']
})
export class tradeNotificationsComponent implements AfterViewInit, AfterViewChecked {
  @HostListener('window:resize', ['$event'])
  classFlag = false;
  openNotification: boolean = false;
  
  skullLoader: boolean = true;
  getNotificationQueue: any=[];
  getTradeNotificationQueue: any=[];
  queue:boolean=true;
  inProgress:boolean=true;
  completed: boolean = true;
  myAcclist: any;
  onResize(event:any) {
    var that = this;
    var innerW = event.target.innerWidth;
    
    if (innerW <= 1600) {
      that.classFlag = true;
    } else {
      that.classFlag = false;
    }
  }
  subscriptions = new Subscription();
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    //console.log(target);
    // Check if the click occurred outside of the specific div
    if (this.sharedData._openTradeNotification == true) {
      if (!this.isInsideDiv(target) && !target.classList.contains('keep-visible')) {
        //console.log('InnerDiv');
        if (this.sharedData._openTradeNotification == true) { this.sharedData.openTradeNotification.next(false); };
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
  constructor(public sharedData: SharedDataService, private dataService: DataService, private toastr: ToastrService, public dialog: MatDialog,) { }
 
  ngOnInit() {
    var that = this;
    if (window.innerWidth <= 1600) { that.classFlag = true; } else { that.classFlag = false; }

    // this.dataService.GetSubAccounts().subscribe((data: any[]) => {
    //   that.myAcclist = data;
    //   that.accountService.GetAccounts.next(data);
    // });

    that.sharedData.getTradeNotificationQueue.subscribe(res => {
       that.getTradeNotificationQueue = res.filter((x:any) => x.displayQueue != 'N');
      this.sharedData.getTradeNotificationQueueCount.next(that.getTradeNotificationQueue.length);
      this.skullLoader = false;
    });
    
  }


  checkAccVal(d:any) {
    // var fillD = this.myAcclist['accounts'].filter(x => parseInt(x.id) == parseInt(d.accountId));
    // if (fillD.length > 0 && isNotNullOrUndefined(fillD[0]['accountVan'])) { return fillD[0]['accountVan'] } else { return "" }
  }
  formatName(d:any){
    var name = d
    if (name.length > 10) {
      name = name.slice(0, 10).trim() + "...";
    }
    else {
      name = name;
    }
    return name;
  }
  ngAfterViewInit() {
   
  }
  ngAfterViewChecked() { }

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
  closeNotify() { this.sharedData.openTradeNotification.next(false); };
  
  warMsg =""
  // viewIndex(item) {

  //   this.itemClicked.push(item);
  //   if (item.notifyStatus == 'E') {
  //     this.cusIndexService.currentSList.next("");
  //     this.cusIndexService.customizeSelectedIndex.next(undefined);
  //     this.sharedData.showSpinner_buy.next(true);
  //     this.cusIndexService.showReviewIndex.next(false);
  //     this.sharedData.showMatLoader.next(true);
  //     var d = item.Name +" BasedOn :"+ item.BasedOn ;
  //     this.warMsg = item.Name + " (" + item.shortName + ') ' + "BasedOn" + " " + item.BasedOn + " strategy is not available.";
  //     this.dataService.GetStrategyAssetList(item.assetId, item.Mode).subscribe((res: any) => {
  //       var sData = res.filter((x: any) => x.assetId == item.assetId && x.rowno == item.rowno);
  //       if (sData.length > 0) {
  //         var viewfactsheet = Object.assign({}, sData[0]);
  //         viewfactsheet['accountId'] = item.accountId;
  //         this.cusIndexService.currentSList.next(viewfactsheet);
  //         this.cusIndexService.startIndexClick.next(true);
  //         this.clickedrow_Remove = item;
  //         this.cusIndexService.startCustomIndexClick.next(true);
  //         this.sharedData.notifyIndexClick.next(true);
  //         this.sharedData.notifyClickIndexData.next(viewfactsheet);
  //         this.closeNotify();
  //         this.loadeData(item, d);
  //         // topnav design
  //         var dd = item;
  //         dd['name'] = item.BasedOn;
  //         this.sharedData.navHeaderTitleCustom.next(dd);
  //       } else { $("#viewWarningModel").modal("show"); };
  //     }, error => { this.logger.logError(error, 'GetStrategyAssetList'); });
  //   }
    
  // }
  clickedrow_Remove: any;
  closeNotify_row(item:any) {
    this.clickedrow_Remove = item;
     $("#deletetradeModalRow").modal({ backdrop: false });
     $('#deletetradeModalRow').modal('show');
    $('.modal-backdrop').remove()
  }
  // notifyAdminError(item:any) {
  //   this.clickedrow_Remove = item;
  //   let userid = atob(atob(atob(JSON.parse(sessionStorage.currentUser).userId)));
  //   var statdata =
  //     {
  //       "notifyid": item.notifyId,
  //       "userid": userid
  //     }

  //   const sList = this.dataService.PostNotificationError(statdata)
  //     .pipe(first())
  //     .subscribe(
  //       data => {
  //         if (data[0] != "Failed") {
  //           this.toastr.info(this.sharedData.checkMyAppMessage(0, 6), '', { timeOut: 5000
  //             // disableTimeOut:true
  //            });
  //           //this.sharedData.getNotifiData();
  //           var statdata = [
  //             {
  //               "notifyid": item.notifyId,
  //               "userid": userid,
  //               "status": 'D'
  //             }
  //           ]
  //           const sList = this.dataService.PostUpdateStrategyNotification(statdata)
  //             .pipe(first())
  //             .subscribe(
  //               data => {
  //                 if (data[0] != "Failed") {
  //                   this.sharedData.getNotificationDataReload();
  //                   //this.toastr.success('Successfully removed', '', { timeOut: 5000 });
  //                   //this.sharedData.getNotifiData();
  //                 }
  //               },
  //               error => { });
  //         }
  //       },
  //       error => { });
  // }

   deleteAll_row() {
     $("#deleteAllTradeModalRow").modal({ backdrop: false });
     $('#deleteAllTradeModalRow').modal('show');
  }

   refreshAll_row() {
     $('#showNotifyLoader').show();
     this.sharedData.getTradeNotificationDataReload();
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

   removeallstrategyRecord() {
     var that = this;
     let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     var allRecord_Comp:any = [];
     var allQueue = that.sharedData._getTradeNotificationQueue;
     if (allQueue.length > 0) {
       allQueue.forEach(function (item:any) {
         allRecord_Comp.push({ "sid": item['sumId'], "userid": userid, "sumStatus": item['code'] });
       });
       this.dataService.PostUpdateTradeNotification(allRecord_Comp).pipe(first()).subscribe((data:any) => {
         if (data[0] != "Failed") {
           this.sharedData.getTradeNotificationDataReload();
           this.toastr.success(this.sharedData.checkMyAppMessage(0, 7), '', { timeOut: 5000 });
         }
       }, (error:any)=> { });
     }
   }

  // viewRemovestrategy() {
  //   let userid = atob(atob(atob(JSON.parse(sessionStorage.currentUser).userId)));

  // var item = this.clickedrow_Remove;
  // var stat = 'N';
  //   var statdata = [
  //     {
  //       "notifyid": item.notifyId,
  //       "status": stat,
  //       "userid": parseInt(userid)
  //     }
  //   ]
  //   const sList = this.dataService.PostUpdateStrategyDisplayQueue(statdata)
  //     .pipe(first())
  //     .subscribe(
  //       data => {
  //         if (data[0] != "Failed") {
  //           this.sharedData.getNotificationDataReload();
  //           //this.toastr.success('Successfully removed', '', { timeOut: 5000 });
  //           //this.sharedData.getNotifiData();
  //         }
  //       }, error => { this.toastr.success(this.sharedData.checkMyAppMessage(0, 11), '', { timeOut: 5000 }); });
  // }

  // startLoadIndex(rowno, mode, assetID, ttype) {
  //   var that = this;
  //   this.cusIndexService.openExistingModal.next(false);    
  //   var unSub = this.sharedData.ETFIndex.pipe(first()).subscribe(ETFIndex => {
  //     var recETFIndex = [...ETFIndex];
  //     var gridData_Def = [...recETFIndex];
  //     var dd = gridData_Def.filter(x => x.assetId == assetID);
  //     if (this.sharedData.checkShowLeftTab(3) != 'A' || (isNotNullOrUndefined(dd) && dd.length > 0 && !that.cusIndexService.checkverify_more.value)) { $('#myDeleteModal').modal('show'); }
  //     else if (isNotNullOrUndefined(dd) && dd.length > 0 && that.cusIndexService.checkverify_more.value) {
  //       var d = dd[0];
  //       d.name = d.etfName;
  //       d.group = "ETFName";
  //       d.med = (parseFloat(d.medianCont) * 100).toFixed(1);
  //       d.indexType = 'Exchange Traded Funds';
  //       this.cusIndexService.customizeSelectedIndex.next(d);
  //       var selectedPath = this.cusIndexService.creEtfBrcumPath(d);
  //       this.cusIndexService.bldIndBrcmData.next(selectedPath);
  //       setTimeout(function () { that.startloadData(rowno, mode, assetID, ttype); }.bind(this), 1500)
       
  //     } else {
  //       var ind = this.cusIndexService.myIndEqindex.filter(x => x.assetId == assetID);
  //       var countryList = {
  //         assetId: assetID, filteredIndexes: ind[0].name, country: ind[0].country, med: '', countrygroup: ind[0].country, name: ind[0].name, indexType: "Equity Universe", group: "Index"
  //       }
  //       this.cusIndexService.customizeSelectedIndex.next(countryList);
  //       var brcum = that.cusIndexService.creEquBrcumPath(countryList);
  //       that.cusIndexService.bldIndBrcmData.next(brcum);
  //       setTimeout(function () { that.startloadData(rowno, mode, assetID, ttype); }.bind(this), 1500)
        
  //     }
  //     this.sharedData.userEventTrack('Notification', ttype, ttype, 'view Index click');
  //   });
  //   this.subscriptions.add(unSub);
  // }

  // startloadData(rowno, mode, assetID, main) {
  //   var that = this;
  //   that.viewRemovestrategy();//// remove list from notification
   
  //   that.sharedData.showCenterLoader.next(true);
  //   that.cusIndexService.exclusionMode.next(mode);
  //   that.cusIndexService.applyTax.next("N");
  //   that.cusIndexService.startIndexClick.next(true);
  //   that.cusIndexService.startCustomIndexClick.next(true);
  //   that.sharedData.showSpinner.next(true);
  //   that.sharedData.showRightSideGrid.next(true);
  //   that.cusIndexService.esgRatingValue.next(0);
  //   that.sharedData.GetESGCatStocks();
  //   that.cusIndexService.getStrategyData(rowno, mode);
  //   this.cusIndexService.custStrId.next((that.itemClicked[0]).rowno);
  //   this.router.navigate(["/customIndexing"]); 
  //   this.cusIndexService.checkExistingStrategy.next(that.itemClicked);
  //   setTimeout(x => { that.cusIndexService.customSavedStrategyLoad.next(true) }, 5000);
  // }
  itemClicked = [];
  // loadeData(item,d) {
  //   this.dataService.GetStrategyAssetList(item.assetId, item.Mode).subscribe((listdata: any[]) => {
  //     var fildata = listdata.filter(u => u.rowno == item.rowno && u.assetId == item.assetId);
  //     if (fildata.length > 0) {        
  //       this.cusIndexService.currentSList.next(fildata[0]);
  //       this.startLoadIndex(item.rowno, item.Mode, item.assetId, d);
  //     }
  //   });
  // }

  checkTicker(d:any) { if (isNotNullOrUndefined(d.ticker)) { return d.ticker } else { return 'Equity Universe' } }
}
