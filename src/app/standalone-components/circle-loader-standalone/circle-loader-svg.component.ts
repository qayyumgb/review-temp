import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-circle-loader-standalone',
  standalone: true,
  imports: [],
  templateUrl: './circle-loader-svg.component.html',
  styleUrl: './circle-loader-svg.component.scss'
})
export class CircleLoaderSvgStandaloneComponent {
  classFlag: boolean = false;
  showCenterLoader: boolean = false;
  subscriptions = new Subscription();
  constructor() {

  }
  ngOnInit() {
    var that = this;
    if (window.innerWidth >= 1350) {
      that.classFlag = true;
    } else {
      that.classFlag = false;
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
