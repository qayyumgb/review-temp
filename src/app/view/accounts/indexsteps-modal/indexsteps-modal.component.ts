import {
  Component,
  OnInit,
  Inject,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  SharedDataService,
  isNotNullOrUndefined,
  isNullOrUndefined,
} from '../../../core/services/sharedData/shared-data.service';
import { Subscription } from 'rxjs';
import { IndexstepService } from '../../../core/services/indexstep.service';
import { CustomIndexService } from '../../../core/services/moduleService/custom-index.service';
import * as d3 from 'd3';
import { AccountService } from '../../../core/services/moduleService/account.service';

@Component({
  selector: 'app-indexsteps-modal',
  templateUrl: './indexsteps-modal.component.html',
  styleUrl: './indexsteps-modal.component.scss'
})
export class IndexstepsModalComponent implements OnInit{
  subscriptions = new Subscription();
  defaultMarketCurrency: any = '$';
  savedStrategySettingsData: any = [];
  C_AccountDetails_D: any;
  AT_strategyListDetails: any;
  cuselindName = "";
  cuselindTicker = "";
  indexConstructionT: any;
  ////*** Index steps ****/
  indexRulesData: any = [];
  factIndexStepGrp: any = [];
  indexRulesDataRange_W: any;
  factorsGrp: any = [];
  index_const_calcu: number = 0;
  indexrulesCmpy: any = [];
  indexrulesGICS: any = [];
  indexrulesCategory: any = [];
  index_const_select: string = "-";
  index_const_weight: string = "-";
  index_const_tax: string = "-";
  ratingIndexnumber: any = 0;
  cloneStrategyDataText: boolean = false;
  accord_losers_length: number = 0;
  showCircleScores: boolean = false;
  alreadyselected_strategy: any = [];
  cl = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  constructor(
    private dialogref: MatDialogRef<IndexstepsModalComponent>,
    public sharedData: SharedDataService, private indexStepSer: IndexstepService, public cusIndexService: CustomIndexService, public accountService: AccountService,
    @Inject(MAT_DIALOG_DATA) public indexStepsdata: any
  ) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); };

  ngOnInit(): void {
    var that = this;
    that.cuselindName = "";
    that.cuselindTicker = "";
    that.savedStrategySettingsData = this.indexStepsdata.savedStrategySettingsData;
    var getIndexStepsData = this.indexStepsdata.userSteps;
    that.AT_strategyListDetails = getIndexStepsData.strategyListQueueAccs[0];
    that.cuselindName = that.AT_strategyListDetails.Indexname;
    if (isNotNullOrUndefined(that.AT_strategyListDetails.Ticker)) {
      that.cuselindTicker = ' (' + that.AT_strategyListDetails.Ticker + ')';
    }
       this.indexStepSer.getIndexStepsDataCI(getIndexStepsData).then(res => {
      //console.log('getIndexStepsData', res)
      that.indexConstructionT = [{ 'indexStep': res['res'], 'compData': [], 'excludedData': [], 'factIndexStepGrp': res['factIndexStepGrp'] }];
      that.indexRulesData = that.indexConstructionT[0]['indexStep'];
      that.factIndexStepGrp = that.indexConstructionT[0]['factIndexStepGrp'];
      that.factorsGrp = that.indexConstructionT[0]['factIndexStepGrp'];
      that.index_const_calcu = res['res'][0]['removeCompCount'];
      that.loadIndexCons();
       });
    var tradedAcc = this.accountService.tradedStrategyAccount.subscribe(data => { that.alreadyselected_strategy = data; });
    this.subscriptions.add(tradedAcc);

    var clonedStratTrigger = this.cusIndexService.clonedStratTrigger.subscribe(res => { if (res) { that.closeModal(); that.cusIndexService.clonedStratTrigger.next(false); } });
    this.subscriptions.add(clonedStratTrigger);
  }
  function(x:any) { if (x.toFixed(0) != 98) { return true; } else { return false; } }
  checkMarketValueNull(v:any) {
    if (isNullOrUndefined(v)) { return this.C_AccountDetails_D.accountValue } else { return v; }
  }
   loadIndexCons() {
    var that = this;
    var w = 100 - this.indexRulesData[0].range + '%';
    that.indexRulesDataRange_W = 'calc(' + w + ' - 1.2rem)';
    that.indexrulesCmpy = that.indexRulesData[0].strStockkey;
    that.indexrulesGICS = that.indexRulesData[0].strSector;
    that.indexrulesCategory = that.indexRulesData[0].category;
    if (that.indexRulesData[0].weightBy.length > 0) { that.index_const_weight = that.indexRulesData[0].weightBy[0].Name; }
    if (that.indexRulesData[0].selectBy.length > 0) { that.index_const_select = that.indexRulesData[0].selectBy[0].Name; };
    if (that.indexRulesData[0].taxEffAwareness == 'Y') { that.index_const_tax = 'Yes'; }
    else if (that.indexRulesData[0].taxEffAwareness == 'N') { that.index_const_tax = 'No'; }
    else { that.index_const_tax = '-'; }
    this.ratingIndexnumber = that.getRatingSSRval(that.indexRulesData[0].rating);
  }
  closeModal() { this.dialogref.close(); }
  getRatingSSRval(rating: any) {
    if (rating == undefined || rating == null || rating == 'NaN' || rating == "") { return 0; }
    else if (rating == "A+") { return 100; }
    else if (rating == "A") { return 90.97222; }
    else if (rating == "A-") { return 81.94444; }
    else if (rating == "B+") { return 72.91667; }
    else if (rating == "B") { return 63.88889; }
    else if (rating == "B-") { return 54.86111; }
    else if (rating == "C+") { return 45.83333; }
    else if (rating == "C") { return 36.80556; }
    else if (rating == "C-") { return 27.77778; }
    else if (rating == "D+") { return 18.75; }
    else if (rating == "D") { return 9.722222; }
    else if (rating == "D-") { return 0.694444; }
    else { return 0 }
  }
  checkconst_filters() {
    var that = this;
    if (that.indexRulesData[0].strStockkey.length > 0 || that.indexRulesData[0].strSector.length > 0 || that.indexRulesData[0].category.length > 0
      || that.sharedData.getRatingSSRval(that.indexRulesData[0].rating) > 0 || that.accord_losers_length > 0 || that.factorsGrp.length > 0) {
      return true;
    } else { return false; }
  }
  checkfactorName(id:any) {
    var fac_3 = [...this.cusIndexService._factorMasterData].filter(fu => fu.id == id);
    return fac_3[0].displayname;
  }
  checkWeight(d:any) { if (isNotNullOrUndefined(d)) { return d + "%" } else { return d } }
  decimalFormat_2D(d:any) { if (isNotNullOrUndefined(d)) { return d.toFixed(2) } else { return d } }
  convert2digits(val:any, id:any) {
    if (id == 17) { return this.billionconverter(val); } else { return parseFloat(val).toFixed(1); }
  }
  billionconverter(d:any) {
    let ActVal = d * 100000;
    return this.CurrencyFormat(ActVal).toString();
  }
  cloneStrategy() {
     var that = this;
    that.cloneStrategyDataText = true;
    that.cusIndexService.cloneStgyfromAccount(that.alreadyselected_strategy);
    //console.log('cloneStrategy', that.alreadyselected_strategy );
     ////that.dataservice.GetStrategyAssetList(that.alreadyselected_strategy.assetId, that.alreadyselected_strategy.mode).subscribe((listdata: any) => {
     ////  var checkStrategy = listdata;

     ////  if (checkStrategy.length > 0) {
     ////    var fildata = listdata.filter((u:any) => u.assetId == that.alreadyselected_strategy.assetId);
     ////    const lastElement = fildata.slice(-1)[0];
     ////    var rowNo = lastElement.rowno + 1;
     ////    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     ////    var cloneData = [{
     ////      "id": that.alreadyselected_strategy.id,
     ////      "userid": parseInt(userid),
     ////      "slid": 0,
     ////      "rowno": rowNo,
     ////      "mode": that.alreadyselected_strategy.mode
     ////    }]
     ////    that.cloneStrategyPostData(cloneData, rowNo);
     ////  } else {
     ////    //// if no startegy created set rowNo is '0'
     ////    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
     ////    var rowNo: any = 0;
     ////    var cloneData = [{
     ////      "id": that.alreadyselected_strategy.id,
     ////      "userid": parseInt(userid),
     ////      "slid": 0,
     ////      "rowno": rowNo,
     ////      "mode": that.alreadyselected_strategy.mode
     ////    }]
     ////    that.cloneStrategyPostData(cloneData, rowNo);
     ////  }
     ////}, error => { that.cloneStrategyDataText = false; $('#stratergyClick').modal('hide'); $('#myCustomIndErrorModal_review').modal('show'); });

  }
  CurrencyFormat(val:any) {
    return Math.abs(Number(val)) >= 1.0e+12
      ? (Math.abs(Number(val)) / 1.0e+12).toFixed(2) + " T" : Math.abs(Number(val)) >= 1.0e+9
        ? (Math.abs(Number(val)) / 1.0e+9).toFixed(1) + " B" : Math.abs(Number(val)) >= 1.0e+6
          ? (Math.abs(Number(val)) / 1.0e+6).toFixed(1) + " M" : Math.abs(Number(val)) >= 1.0e+3
            ? (Math.abs(Number(val)) / 1.0e+3).toFixed(1) + " K" : Math.abs(Number(val));
  }
  convert2width(start:any, end:any) {
    var st: any = start;
    var en: any = end;
    var wid = parseInt(st) - parseInt(en);
    return wid;
  }
  functionPercentage(x:any) { if (x.toFixed(0) != 98) { return false; } else { return true; } }
  checkshowBorderColor(d:any) {
    let that = this;
    let score = d.score;
    //if (this.cusIndexService.bldMyIndweightByVal.value == 1 || this.cusIndexService.bldMyIndSelByVal.value == 1) {
    //  let livData = [...that.sharedData._selResData].filter(xyz => xyz.stockKey == d.stockKey);
    //  if (livData.length > 0) { score = livData[0].score; };
    //}
    return this.cl(score);
  }
}
