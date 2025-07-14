import { Component, AfterViewInit, OnInit } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'oktaGuide',
    templateUrl: './oktaGuide.html',
     styleUrls: ['./oktaGuide.css']
})

export class oktaGuideComponent implements OnInit, AfterViewInit {
  
  constructor(public sharedData: SharedDataService, public router: Router, public bnIdle: BnNgIdleService) { };
  ngAfterViewInit() { };
  
  ngOnInit() {
    var that = this;
    // that.sharedData.showCircleLoader.next(false);
    try { that.sharedData.showCircleLoader.next(false); } catch (e) { }
    that.sharedData.showCircleLoader.next(false); 
    that.sharedData.showSideNavBar.next(false);
  } 
}
