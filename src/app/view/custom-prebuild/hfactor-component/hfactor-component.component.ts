import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { IndSelectDropdownComponent } from '../ind-select-dropdown/ind-select-dropdown.component';
import { isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-hfactor-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatRadioModule, MatOptionModule, IndSelectDropdownComponent],

  templateUrl: './hfactor-component.component.html',
  styleUrl: './hfactor-component.component.scss'
})
export class HfactorComponentComponent {
  @Input() getFormName: any = ''; // Data from the parent component
  @Input() getUniverseDataList: any = []; // Data from the parent component
  @Input() getUniverseDefaultSelected: string = ''; // Data from the parent component
  @Input() getDefaultWidth: string = ''; // Data from the parent component
  @Output() onSelectionUniverseChanged = new EventEmitter<string>();
  @Output() onFactorDataChanged = new EventEmitter<any>();

  @Input() getFactorMainDataList: any = []; // Data from the parent component

  hfFromValueErr: boolean = false;
  hfToValueErr: boolean = false;
  selectFrom_factor: string = '';
  form: FormGroup = new FormGroup({
    selection: new FormControl(''),
    range: new FormControl(''),
    type: new FormControl('')
  });

  constructor() { }
  ngOnInit() {
    this.form = new FormGroup({
      selection: new FormControl(this.getFactorMainDataList.defaultSelection),
      range: new FormControl(this.getFactorMainDataList.defaultRange),
      type: new FormControl(this.getFactorMainDataList.defaultType),
      fromValue: new FormControl(this.getFactorMainDataList.fromValue),
      toValue: new FormControl(this.getFactorMainDataList.toValue)
    });
    this.form.valueChanges.subscribe(value => { this.onFactorDataChanged.emit(value); });
    this.onFactorDataChanged.emit(this.form.value);
  }
  onToggleAscendingFactor() {
    const newValue = this.form.get('selection')?.value === this.getFactorMainDataList.selectionOptions[1] ? this.getFactorMainDataList.selectionOptions[0] : this.getFactorMainDataList.selectionOptions[1];
    var range = this.form.get('range')?.value;
    if (newValue.trim() == 'Remove' && range == 'range') { this.form.get('range')?.setValue('largest'); }
    this.form.get('selection')?.setValue(newValue);
  }

  checkRangeDis(d: any, place: string) {
    if (isNotNullOrUndefined(d['isDisabled']) && d['isDisabled'] == true) { return d['isDisabled'] } else {
      if (place == 'type') {
        if (isNotNullOrUndefined(d['value']) && d['value'] == "count" && this.form.get('range')?.value == 'range') { return true } else { return d['isDisabled'] }
      } else {
        if (isNotNullOrUndefined(d['value']) && d['value'] == "range" && this.form.get('selection')?.value.trim() == 'Remove') { return true } else { return d['isDisabled'] }
      }
    }
  }

  onOptionChange(event: any, formName: string) {
    this.form.get(formName)?.setValue(event.value);
    var type = this.form.get('type')?.value;
    if (isNotNullOrUndefined(event.value) && event.value == "range" && type == "count") {
      this.form.get('type')?.setValue("percent");
    }
    if (isNotNullOrUndefined(type) && type == "value") {
      this.form.get('fromValue')?.setValue(0.01);
      this.form.get('toValue')?.setValue(0.99);
    } else {
      this.form.get('fromValue')?.setValue(0);
      this.form.get('toValue')?.setValue(100);
    }
    this.hfFromValueErr = false;
    this.hfToValueErr = false;
  }

  receiveMatOptionSelectedList(event: any, formName: string) {
    this.onSelectionUniverseChanged.emit(event);
    this.getUniverseDefaultSelected = event;
  }
  perKeyDown(e: any) {
    var hfType: any = this.form.get('type')?.value;
    if (hfType == 'percent') {
      if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
      if (e.key == '.') { e.preventDefault(); }
      if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode >= 35 && e.keyCode <= 39) || (/^[0-9]*$/.test(e.key))) { } else { e.preventDefault(); }
    } else {
      if (e.key == '0' && e.target?.value.charAt(0) == '0') { e.preventDefault(); }
      if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode >= 35 && e.keyCode <= 39) || (/^[0-9]*$/.test(e.key))) { } else { e.preventDefault(); }
    }

  }
  hfactval(e: any, place: string, selop: string) {
    //var hfFromValue = this.form.get('fromValue')?.value;
    //var hfToInput = this.form.get('toValue')?.value;
    //console.log(hfFromValue, hfToInput);
    //if (selop == 'value' && (parseFloat(hfFromValue) >= parseFloat(hfToInput))) { this.hfError = place }
    //else if (selop == 'per' && parseInt(hfFromValue) >= parseInt(hfToInput)) { this.hfError = place }
    //else if (selop == 'per' && place == 'endval' && 100 < parseInt(hfToInput)) { this.hfError = place }
    //else if (hfFromValue === "" || hfToInput === "") { this.hfError = place }
    //else { this.hfError = '' }
  }

  checkErr(val: any) {
    var hfFromValue: any = this.form.get('fromValue')?.value;
    var hfToValue: any = this.form.get('toValue')?.value;
    var hfType: any = this.form.get('type')?.value;
    if (hfType == 'percent') {
      /** Percentage ***/
      this.hfFromValueErr = (isNotNullOrUndefined(hfFromValue) && hfFromValue < 100) ? false : true;
      this.hfToValueErr = (isNotNullOrUndefined(hfToValue) && hfToValue <= 100) ? false : true;
    } else if (hfType == 'count') {
      /** Count ***/
      this.hfFromValueErr = (isNotNullOrUndefined(hfFromValue) && hfFromValue > 0) ? false : true;
      this.hfToValueErr = (isNotNullOrUndefined(hfToValue)) ? false : true;
    } else {
      /** Value ***/
      this.hfFromValueErr = (isNotNullOrUndefined(hfFromValue) && hfFromValue < 1 && hfFromValue >= 0 && hfFromValue < hfToValue) ? false : true;
      this.hfToValueErr = (isNotNullOrUndefined(hfToValue) && hfToValue > 0 && hfToValue <= 1 && hfFromValue < hfToValue) ? false : true;
    }
  }
}
