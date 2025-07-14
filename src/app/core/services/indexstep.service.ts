import { Injectable } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from './sharedData/shared-data.service';
import { first } from 'rxjs';
import { DataService } from './data/data.service';
import { CustomIndexService } from './moduleService/custom-index.service';
import { max, min, scaleLinear } from 'd3';
import { DirectIndexService } from './moduleService/direct-index.service';

@Injectable({
  providedIn: 'root'
})
export class IndexstepService {

  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, private dataService: DataService, public dirIndexService: DirectIndexService,) { }

  GetUserSteps(notifyId:any, type:any) {
    return new Promise<any>((resolve, reject) => {
      if (type == 'CI') {
        this.dataService.GetUserSteps(notifyId).pipe(first()).subscribe((data: any) => {
          if (isNotNullOrUndefined(data['strategyListQueueAccs']) && data['strategyListQueueAccs'].length == 0) { reject([]) }
          else if (isNotNullOrUndefined(data)) { this.getIndexStepsDataCI(data).then((res:any) => { resolve(res) }); }
          else { reject([]) }
        }, (error: any) => { reject([]) });
      } else {
        this.getIndexStepsDataDI(notifyId).then((res: any) => { resolve(res) });
      }
    });
  }

  getIndexStepsDataDI(data:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      var sData = that.cusIndexService.BuildMyIndexOptions.filter((d: any) => ((d.Id == data['selectBy']) && (d.Type == 'S')));
      var wData = that.cusIndexService.BuildMyIndexOptions.filter((d: any) => ((d.Id == data['weightBy']) && (d.Type == 'W')));
      var index = that.dirIndexService.getBetaIndex_Direct.value.filter((d: any) => ((d.assetId == data['assetId'])));
      var removeCompCount: number = parseInt(data['noofComp']);
      if (index.length > 0 && (isNotNullOrUndefined(index[0]['indextotalcount']))){ removeCompCount = (parseInt(index[0]['indextotalcount']) - parseInt(data['noofComp'])) }
      var indexId = 123;
      var dt = {
        'strSector': [],
        'strStockkey': [],
        'assetid': data['assetId'],
        'indexId': indexId,
        'range': 0,
        "strExStockkey": [],
        'tenYrFlag': 1,
        'enddate': '',
        "rating": 0,
        "category": [],
        'cashTarget': (isNotNullOrUndefined(data['cashTarget']))? data['cashTarget']:2,
        "taxflag": data['taxEffAwareness'],
        "selectBy": sData,
        "noofComp": data['noofComp'],
        "weightBy": wData,
        "taxEffAwareness": data['taxEffAwareness'],
        "PostStrategyFactorsData": [],
        'strData': data,
        "removeCompCount": removeCompCount   // need to correction
      };
      resolve({ 'res': [dt], 'factIndexStepGrp': [] });
    });
  }

  getIndexStepsDataCI(notifyData:any) {
    var that = this;
    return new Promise<any>((resolve, reject) => {
      var factIndexSteps = notifyData['factIndexSteps'];
      var remComp:any = [];
      [...factIndexSteps].filter(u => u.stype == "C").forEach((rC) => { remComp.push(rC) });
      var remGics: any = [];
      [...factIndexSteps].filter(u => u.stype == "G").forEach((rG) => { remGics.push(rG) });
      var remEsgCat: any = [];
      [...factIndexSteps].filter(u => u.stype == "CT").forEach((CT) => { remEsgCat.push(CT) });

      var rating = 0;
      var ratingData = [...factIndexSteps].filter(u => u.stype == "R");
      if (ratingData.length) {
        if (isNullOrUndefined(ratingData[0].value) || ratingData[0].value == "") { rating = 0; }
        else { rating = (this.sharedData.getRatingSSRval(ratingData[0].value) * 100) };
      }

      var strData = notifyData['strategyListQueueAccs'][0];
      var sData = [];
      if (isNullOrUndefined(strData['selectedByName'])) {
        sData = that.cusIndexService.BuildMyIndexOptions.filter((d: any) => ((d.Id == strData['selectBy']) && (d.Type == 'S')));
      } else {
        sData = [{ Id: strData['selectBy'], Name: strData['selectedByName'], Type: 'S' }];
      }

      var wData = [];
      if (isNullOrUndefined(strData['weightedByName'])) {
        wData = that.cusIndexService.BuildMyIndexOptions.filter((d: any) => ((d.Id == strData['weightBy']) && (d.Type == 'W')));
      } else {
        wData = [{ Id: strData['weightBy'], Name: strData['weightedByName'], Type: 'W' }];
      }

      var factorsData: any = [];
      [...factIndexSteps].filter(u => u.stype == "F").forEach((CT) => { factorsData.push(CT); });
      var factIndexStepGrp: any = []
      if (factorsData.length > 0) { factorsData.forEach((d:any) => { factIndexStepGrp.push(that.getMinMaxGrps(d)); }); }


      var data = {
        'strSector': remGics,
        'strStockkey': remComp,
        'assetid': strData['assetId'],
        'indexId': strData['indexId'],
        'range': 0,
        'dontSell': strData['donotsellcount'],
        'restrictedList': strData['restrictedlistcount'],
        "strExStockkey": [],
        'tenYrFlag': 1,
        'enddate': '',
        "rating": that.sharedData.checkRangeTxt(rating),
        "category": remEsgCat,
        "taxflag": strData['taxEffAwareness'],
        'cashTarget': strData['cashTarget'],
        "selectBy": sData,
        "noofComp": strData['noofComp'],
        "weightBy": wData,
        "taxEffAwareness": strData['taxEffAwareness'],
        "PostStrategyFactorsData": factorsData,
        "removeCompCount": (strData['indextotalcount'] - strData['noofComp']),
        'strData': strData
      };
      resolve({ 'res': [data], 'factIndexStepGrp': factIndexStepGrp });
    });
  }

  getMinMaxGrps(factor: any) {
    var factData: any = Object.assign({}, factor);
    try {
      if (factor.perorval == 1) {
        var dmin: any = min([factor['orgTopValue'], factor['orgBottomValue']]);
        var dmax: any = max([factor['orgTopValue'], factor['orgBottomValue']]);
        var per = scaleLinear().domain([dmin, dmax]).range([0, 100]);
        factData['sRange'] = per(factor['startval']);
        factData['eRange'] = per(factor['endval']);
        var difRange = (factData['eRange'] - factData['sRange'])
        if (difRange < 15) {
          factData['sRange'] = 30;
          factData['eRange'] = 60;
        }

        if (factor.factorid == 3 || factor.factorid == 19 || factor.factorid == 10 || factor.factorid == 4 ||
          factor.factorid == 9 || factor.factorid == 1 || factor.factorid == 17 || factor.factorid == 18) {
          factData['dmin'] = dmin;
          factData['dmax'] = dmax;
        }
        else if (factor.factorid == 11 || factor.factorid == 2 || factor.factorid == 7 || factor.factorid == 5 ||
          factor.factorid == 8 || factor.factorid == 15 || factor.factorid == 16 || factor.factorid == 20 ||
          factor.factorid == 14 || factor.factorid == 13 || factor.factorid == 6 || factor.factorid == 21) {
          factData['dmin'] = dmin * 100;
          factData['dmax'] = dmax * 100;
          factData['startval'] = factData['startval'] * 100;
          factData['endval'] = factData['endval'] * 100;
        } else {
          factData['dmin'] = dmin;
          factData['dmax'] = dmax;
        }
      } else { }
    } catch (e) { }
    return factData;
  }

}
