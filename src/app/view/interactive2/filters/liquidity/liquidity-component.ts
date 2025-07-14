import { Component, ElementRef, EventEmitter, Input, Output, ViewChild ,OnInit} from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-filter-liquidity]',
  standalone: false,
  templateUrl: './liquidity-component.html',
  styleUrl: './liquidity-component.scss'
})
export class FilterLiquidityComponent implements OnInit{
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  liquidity_Value: any;
  filterTitle: any;
  @Output() receiveFilterClose = new EventEmitter<boolean>();
  /** receive/send data **/


  constructor(public sharedData: SharedDataService) {

  }
  ngOnInit() {
    this.sharedData.circletitle.subscribe((res: any) => {
      console.log(res, 'filterTitle');
      this.filterTitle = res;
    });
  }
  close() {
    this.receiveFilterClose.emit(true);
  }
}
