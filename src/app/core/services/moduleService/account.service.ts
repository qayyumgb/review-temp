import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { DataService } from '../data/data.service';
import { isNotNullOrUndefined } from '../sharedData/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  GetAccounts: BehaviorSubject<any>;
  _GetAccounts: any = [];
  restrictedListAllData: BehaviorSubject<any>;
  _restrictedListAllData: any = [];
  restrictedListData: BehaviorSubject<any>;
  _restrictedListData: any = [];
  refreshAccount: BehaviorSubject<boolean>;
  _refreshAccount: boolean = false;
  
  tradedStrategyAccount: BehaviorSubject<any>;
  _tradedStrategyAccount: any = [];
  constructor(private dataService: DataService) {
    this.GetAccounts = new BehaviorSubject<any>(this._GetAccounts);
    this.GetAccounts.subscribe(data => { this._GetAccounts = data; });
    
    this.restrictedListAllData = new BehaviorSubject<any>(this._restrictedListAllData);
    this.restrictedListAllData.subscribe(data => { this._restrictedListAllData = data; });

    this.restrictedListData = new BehaviorSubject<any>(this._restrictedListData);
    this.restrictedListData.subscribe(data => { this._restrictedListData = data; });

    this.refreshAccount = new BehaviorSubject<any>(this._refreshAccount);
    this.refreshAccount.subscribe(data => { this._refreshAccount = data; });

    this.tradedStrategyAccount = new BehaviorSubject<any>(this._tradedStrategyAccount);
    this.tradedStrategyAccount.subscribe(data => { this._tradedStrategyAccount = data; });
  }

  getAccountDt(accountId: any) {
    var that = this;
    this.dataService.GetSubAccounts().pipe(first()).subscribe((data: any) => {
      that.GetAccounts.next(data);
      if (isNotNullOrUndefined(accountId) && accountId > 0) { that.GetDBPershing(accountId).then(dt => { }); }
    }, error => { });
  }

  GetDBPershing(accID:any) {
    var that = this;
    return new Promise((resolve, reject) => {
      this.dataService.GetSubAccounts_DBPershing(accID).pipe(first()).subscribe((res: any) => {
        if (isNotNullOrUndefined(res['accounts']) && res['accounts'].length > 0) {
          var data = that._GetAccounts;
          var indexF = data['accounts'].findIndex((x:any) => x.accountId == res['accounts'][0]['accountId']);
          if (indexF > -1) {
            data['accounts'][indexF] = res['accounts'][0];
            data['ledger'][indexF] = res['ledger'][0];
            data['summary'][indexF] = res['summary'][0];
            that.GetAccounts.next(data);
          }
        }
        resolve(res);
      }, error => { resolve([]); });
    });
  }

  resetService() {
    this.GetAccounts.next([]);
    this.restrictedListAllData.next([]);
    this.restrictedListData.next([]);
    this.restrictedListData.next(false);
  }
}
