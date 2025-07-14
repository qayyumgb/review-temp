import { Component, ElementRef, EventEmitter, Input, Output, ViewChild ,OnInit} from '@angular/core';
import { SharedDataService, isNotNullOrUndefined, isNullOrUndefined } from '../../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../../core/services/data/data.service';
import { GlobalSearchService } from '../../../../core/services/global-search.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
declare var $: any;
import * as d3 from 'd3';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs';

@Component({
  selector: '[app-filter-globalsearch]',
  standalone: false,
  templateUrl: './globalsearch-component.html',
  styleUrl: './globalsearch-component.scss'
})
export class FilterGlobalSearchComponent implements OnInit{
  /** receive/send data **/
  @Input() getComponentsList: any = ''; // Data from the parent component
  liquidity_Value: any;
  filterTitle: any;
  @Output() receiveFilterClose = new EventEmitter<boolean>();
  /** receive/send data **/

  glbSearch = new FormControl('');
  constructor(public sharedData: SharedDataService,private dataService: DataService,private gloSrcService: GlobalSearchService) {

    this.glbSearch.setValidators([noDoubleSpaceValidator()]);
    this.glbSearch.valueChanges.subscribe((srcValue: any) => { this._filter(srcValue) });
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

  searchEnter: boolean = false;
  noDataFound: boolean = false;
  inputValue: string = '';
  showSearchLoader: boolean = false;
  filteredOptions: any = [];
  GlobalSearch: any;
  filtering(ev: any) { this.searchEnter = true; };
  restrictDoubleSpace(event: KeyboardEvent): void {
    const input = this.inputValue;
    const char = event.key;
    if ((char === ' ' && (input.endsWith(' '))) || (char === ' ' && input.trim().length ==0)) { event.preventDefault(); }
  }
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };
  clearInput() {
    this.inputValue = '';
 
  };

    private _filter(value: any) {
      this.filteredOptions = [];
      this.showSearchLoader = true;
      this.searchEnter = false;
      var doubleSpace: boolean = this.glbSearch?.hasError('doubleSpace');
      var max: boolean = this.glbSearch?.hasError('max');
      if (doubleSpace) { this.glbSearch.setValue(value.replaceAll('  ',' ')); }
      try { this.GlobalSearch.unsubscribe(); } catch (e) { }
      if (isNotNullOrUndefined(value) && value != "" && value.trim() != "" && !doubleSpace && !max && this.glbSearch.valid) {
        this.GlobalSearch = this.dataService.GlobalSearch(value).pipe(first())
          .subscribe((res: any) => {
            // this.filteredOptions = [...res];
            const order = ['Equity Universe', 'ETF', 'DirectIndexing', 'PreBuilt', 'Thematic'];
            let groupedData = res.reduce((acc: any, item: any) => {
              let typeGroup = acc.find((group: any) => group.type === item.type);
              if (typeGroup) {
                typeGroup.items.push(item);
              } else {
                acc.push({ type: item.type, items: [item] });
              }
              return acc;
            }, []);
            groupedData.sort((a: any, b: any) => {
              return order.indexOf(a.type) - order.indexOf(b.type);
            });
            this.filteredOptions = groupedData
            //console.log('groupedData', groupedData);
            this.showSearchLoader = false;
            this.noDataFound = res.length === 0;
            if (this.noDataFound) {
              d3.select(".DrilldownSearchBar").classed("no_DF", true);
            } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
            if (this.searchEnter && res.length > 0) {
              var val = { option: { value: res[0] } };
              this.gloSrcEnter(val);
              this.searchEnter = false;
            };
          });
      } else {
        this.noDataFound = !this.glbSearch.valid;
        if (this.noDataFound) {
          d3.select(".DrilldownSearchBar").classed("no_DF", true);
        } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
        this.filteredOptions = []; this.showSearchLoader = false;
      }
    }

    gloSrcEnter(ev: any) {
      if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
        var value: any = ev.option.value;
        if (isNotNullOrUndefined(value['type']) && (value instanceof Object)) {
          this.gloSrcService.gloSrcEnter(value);
          this.glbSearch.reset();
          this.noDataFound = false;
        } else { }
      } else { }
    }
}
export function noDoubleSpaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const hasDoubleSpace = /\s{2,}/.test(value);
    return hasDoubleSpace ? { doubleSpace: true } : null;
  };
}