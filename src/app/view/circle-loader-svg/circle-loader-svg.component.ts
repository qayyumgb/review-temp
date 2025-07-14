import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-circle-loader-svg',
  templateUrl: './circle-loader-svg.component.html',
  styleUrl: './circle-loader-svg.component.scss'
})
export class CircleLoaderSvgComponent {
  classFlag: boolean = false;
  showCenterLoader: boolean = false;
  subscriptions = new Subscription();
  constructor(public sharedData: SharedDataService) {

  }
  ngOnInit() {
    var that = this;
    if (window.innerWidth >= 1350) {
      that.classFlag = true;
    } else {
      that.classFlag = false;
    }
    var unSub_showSVGLoader = this.sharedData.showCenterLoader.subscribe(data => { that.showCenterLoader = data; });
    that.subscriptions.add(unSub_showSVGLoader);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
