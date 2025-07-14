import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from '../../../environments/environment';
import { first } from 'rxjs';
import { DataService } from './data/data.service';

@Injectable({
  providedIn: 'root'
})
export class UsertrackService {
  private api_url = environment.api_url;
  constructor(private http: HttpClient, private deviceService: DeviceDetectorService, private dataService: DataService) { }

  ProcInsertEvent(category: any, eventLabel: any, eventValue: any, mode: any) {
    var that = this;
    if (window.location.hostname != "localhost") {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      var data = {
        "userId": userid,
        "date": new Date(),
        "sessionId": sessionStorage.getItem('trackingId'),
        "source": "(direct)",
        "medium": "(none)",
        "channelGrouping": "Direct",
        "campaign": "(not set)",
        "keyword": "(not set)",
        "landingPagePath": window.location.pathname,
        "hostname": window.location.host,
        "eventCategory": category,
        "eventAction": mode,
        "eventLabel": eventLabel,
        "eventValue": eventValue,
        "eventCount": 1
      }
      try {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        this.http.post(this.api_url + `/UserTrack/InsertEvent`, data, httpOptions).pipe(first())
          .subscribe((data: any) => { }, (error: any) => { });
      } catch (e) { }
    }
  }

  ProcInsertSession() {
    var that = this;
    if (window.location.hostname != "localhost") {
      let deviceCategory = "";
      if (that.deviceService.isDesktop(that.deviceService.userAgent)) deviceCategory = "desktop";
      if (that.deviceService.isMobile(that.deviceService.userAgent)) deviceCategory = "mobile";
      if (that.deviceService.isTablet(that.deviceService.userAgent)) deviceCategory = "tablet";

      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));

      var data = {
        "sessionId": sessionStorage.getItem('trackingId'),
        "deviceCategory": deviceCategory,
        "platform": that.deviceService.os,
        "dataSource": "web",
        "date": new Date(),
        "userId": userid,
        "id": 0
      }
      try {
        this.dataService.InsertSession(data).pipe(first()).subscribe(data => {},error => {});
      } catch (e) { }
    }

  }
}
