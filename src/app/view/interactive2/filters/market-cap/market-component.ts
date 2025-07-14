import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-filter-market]',
  standalone: false,
  templateUrl: './market-component.html',
  styleUrl: './market-component.scss'
})
export class FilterMarketCapComponent {
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  liquidity_Value: any;
  @Output() receiveFilterClose = new EventEmitter<boolean>();
  /** receive/send data **/


  constructor(public sharedData: SharedDataService) {

  }
  close() {
    this.receiveFilterClose.emit(true);
  }
}
