import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  SharedDataService,
  isNotNullOrUndefined,
  isNullOrUndefined,
} from '../../../../core/services/sharedData/shared-data.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
@Component({
  selector: '[app-filter-hfactor]',
  standalone: false,
  templateUrl: './h-factor-component.html',
  styleUrl: './h-factor-component.scss',
})
export class FilterHFactorCapComponent implements OnInit {
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  liquidity_Value: any;
  @Output() receiveFilterClose = new EventEmitter<boolean>();
  rangeTo: number = 0;
  rangeFrom: number = 100;
  filterTitle: any;
  /** receive/send data **/
  constructor(public sharedData: SharedDataService) {}
  close() {
    this.receiveFilterClose.emit(true);
  }
  subscriptions = new Subscription();
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  ngOnInit() {
    this.rangeText();
    this.sharedData.circletitle.subscribe((res: any) => {
      console.log(res, 'filterTitle');
      this.filterTitle = res;
    });
    var unSub = this.sharedData.circleRangeData.subscribe((res: any) => {
     
      // this.filterTitle = res['draggingType'];
      if (res.label == 'a') {
        this.rangeFrom = res.value; // Assign dd.value to rangeValuenumber
        const atext = d3
          .select('#hFactor')
          .selectAll('.range_components .header')
          .text('From ');
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--linkColor)')
          .text(this.rangeTo);
        if (this.selectedOption === 'percentage') {
          atext
            .append('tspan')
            .attr('class', '')
            .attr('fill', 'var(--linkColor)')
            .text(' % ');
        }
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--leftSideText)')
          .text(' to ');
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--linkColor)')
          .text(this.rangeFrom);
        if (this.selectedOption === 'percentage') {
          atext
            .append('tspan')
            .attr('class', '')
            .attr('fill', 'var(--linkColor)')
            .text(' % ');
        }
      }
      if (res.label == 'e') {
        this.rangeTo = res.value; // Assign dd.value to rangeValue
        const atext = d3
          .select('#hFactor')
          .selectAll('.range_components .header')
          .text('From ');
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--linkColor)')
          .text(this.rangeTo);
        if (this.selectedOption === 'percentage') {
          atext
            .append('tspan')
            .attr('class', '')
            .attr('fill', 'var(--linkColor)')
            .text(' % ');
        }
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--leftSideText)')
          .text(' to ');
        atext
          .append('tspan')
          .attr('class', '')
          .attr('fill', 'var(--linkColor)')
          .text(this.rangeFrom);
        if (this.selectedOption === 'percentage') {
          atext
            .append('tspan')
            .attr('class', '')
            .attr('fill', 'var(--linkColor)')
            .text(' % ');
        }
      }
    });
    this.subscriptions.add(unSub);
  }
  selectedOption: string | null = 'count';
  selectOption(option: string): void {
    this.selectedOption = option;
    this.rangeText();
  }
  rangeText() {
    const atext = d3
      .select('#hFactor')
      .selectAll('.range_components .header')
      .text('From ');
    atext
      .append('tspan')
      .attr('class', '')
      .attr('fill', 'var(--linkColor)')
      .text(this.rangeTo);
    if (this.selectedOption === 'percentage') {
      atext
        .append('tspan')
        .attr('class', '')
        .attr('fill', 'var(--linkColor)')
        .text(' % ');
    }
    atext
      .append('tspan')
      .attr('class', '')
      .attr('fill', 'var(--leftSideText)')
      .text(' to ');
    atext
      .append('tspan')
      .attr('class', '')
      .attr('fill', 'var(--linkColor)')
      .text(this.rangeFrom);
    if (this.selectedOption === 'percentage') {
      atext
        .append('tspan')
        .attr('class', '')
        .attr('fill', 'var(--linkColor)')
        .text(' % ');
    }
  }
}
