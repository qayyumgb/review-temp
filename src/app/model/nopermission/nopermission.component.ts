import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-nopermission',
  templateUrl: './nopermission.component.html',
  styleUrl: './nopermission.component.scss'
})
export class NopermissionComponent implements OnInit {
  constructor(public sharedData: SharedDataService) { }

  ngOnInit() {
    var that = this;
    setTimeout(() => { that.sharedData.showCircleLoader.next(false) }, 1000);
  }

}
