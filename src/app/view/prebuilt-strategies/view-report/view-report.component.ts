import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrebuildIndexService } from '../../../core/services/moduleService/prebuild-index.service';
import { Subscription, first } from 'rxjs';
import { DataService } from '../../../core/services/data/data.service';
import { SharedDataService, isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrl: './view-report.component.scss'
})
export class ViewReportComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  tabs: any = [];
  filterdData: any = [];
  selected = new FormControl(0);
  constructor(public sharedData: SharedDataService, public preBuiltService: PrebuildIndexService, private datepipe: DatePipe,
    private dataService: DataService, private toastr: ToastrService) { }
  ngOnInit() {
    var that = this;
    this.sharedData.showCircleLoader.next(true);
    if (this.preBuiltService.viewReportData.value.length > 0) { this.loadTab(this.preBuiltService.viewReportData.value); }
    else {
      var viewReportData = this.dataService.PerformaneReport({}).pipe(first()).subscribe((res: any) => {
        this.preBuiltService.viewReportData.next(res);
        this.loadTab(res);
      });
      that.subscriptions.add(viewReportData);
    };

    var select = this.selected.valueChanges.subscribe(value => { this.loadTabData(value); });
    that.subscriptions.add(select);
  }

  loadTab(data: any) {
    this.sharedData.showCircleLoader.next(false);
    var dt = [...data].sort((x, y) => x.sortorder - y.sortorder).map(x => x.productName);
    this.tabs = [...new Set(dt)];
    this.tabs.unshift('All Indexes');
    this.loadTabData(this.selected.value);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  checkIndBM(d: any, key: string) { return (isNotNullOrUndefined(d[key])) ? true : false;  }

  loadTabData(value: any) {
    var cat: string = this.tabs[value];
    this.filterdData= [];
    var dt = [...this.preBuiltService.viewReportData.value].sort((x, y) => x.sortorder - y.sortorder);
    if ('All Indexes' == cat) { this.filterdData = [...dt]; }
    else { this.filterdData = [...dt].filter(x => x.productName == cat) };
  }
  loadingStates: { [key: string]: boolean } = {};
  downClick:any = [];
  downloadFactsheet(d: any) {
    var that = this;
    //that.sharedData.showMatLoader.next(true);
    //console.log(d.ticker);
    this.loadingStates[d.ticker] = true;
    //console.log(this.loadingStates);
    var selIndexName: string = (isNotNullOrUndefined(d['name'])) ? d['name'] : '';
    var indexId: any = (isNotNullOrUndefined(d['parentIndexid'])) ? d['parentIndexid'] : 0;
    if (this.downClick.filter((x:any) => x == indexId).length > 0 || indexId == 0) { } else {
      this.downClick.push(indexId);
      let factsheetParameter = { 'indexId': indexId, };
      var preFact=this.dataService.PrebuilfactsheetdataMonthend(factsheetParameter).subscribe((event) => {
        this.downClick = [this.downClick].filter((c: any) => c != factsheetParameter.indexId);
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], { type: data.body?.type });
        if (downloadedFile.type != "" && (downloadedFile.type == "application/pdf" || downloadedFile.type == "application/octet-stream")) {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = this.sharedData.downloadTitleConvert(selIndexName.replace('New Age Alpha ', 'NAA ')) + "_View_Report_Factsheet.pdf";
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
          //that.sharedData.showMatLoader.next(false);
          that.loadingStates[d.ticker] = false;
        } else {
          //that.sharedData.showMatLoader.next(false);
          that.loadingStates[d.ticker] = false;
          that.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });
        }
      }, error => {
        this.downClick = [this.downClick].filter((c: any) => c != factsheetParameter.indexId);
        //that.sharedData.showMatLoader.next(false);
        that.loadingStates[d.ticker] = false;
        this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      });
      this.subscriptions.add(preFact);
      this.sharedData.userEventTrack("Prebuilt Strategies", "View Report", selIndexName, 'Export Month End Index Factsheet Click');
    }
  }

  checkPerReLoad(type: string) { return (this.downPerClick.filter((x: any) => x == type).length > 0) ? true : false; };
  downPerClick: any = [];
  downloadPerformance(type: string) {
    let d = new Date();
    if (this.checkPerReLoad(type)) { } else {
      this.downPerClick.push(type);
      let factsheetParameter = { "Type": type };
      var dat: any = ([...this.preBuiltService.viewReportData.value].length > 0) ? [...this.preBuiltService.viewReportData.value][0] : null;
      var dDate: string = (isNotNullOrUndefined(dat)) ?
        (type == 'Monthly' && isNotNullOrUndefined(dat['monthlyAsofDate'])) ? dat['monthlyAsofDate'] :
          (type == 'Quarterly' && isNotNullOrUndefined(dat['quarterlyAsofDate'])) ? dat['quarterlyAsofDate'] :
            this.datepipe.transform(d, 'yyyyMMdd') : this.datepipe.transform(d, 'yyyyMMdd');
      var downper=this.dataService.DownloadPerformance(factsheetParameter).subscribe((event) => {
        this.downPerClick = [this.downPerClick].filter((c: any) => c != factsheetParameter.Type);
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], { type: data.body?.type });
        if (downloadedFile.type != "" && (downloadedFile.type == "application/pdf" || downloadedFile.type == "application/octet-stream")) {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = "NAA_Index_" + type + "_Performance_" + dDate +".pdf";
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
        } else {
          this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
            timeOut: 10000,
            positionClass: 'toast-top-center'
          });
        }
      }, error => {
        this.downPerClick = [this.downPerClick].filter((c: any) => c != factsheetParameter.Type);
        this.sharedData.showMatLoader.next(true);
        this.toastr.info("The file download is currently unavailable due to technical issues. Please try again.", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
      });
      this.subscriptions.add(downper);
      this.sharedData.userEventTrack("Prebuilt Strategies", "View Report", type, 'Export Performance Report Click');
    }
  }
}
