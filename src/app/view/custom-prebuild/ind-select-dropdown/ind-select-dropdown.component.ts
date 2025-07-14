import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { isNotNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';

@Component({
  selector: 'app-ind-select-dropdown',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ind-select-dropdown.component.html',
  styleUrl: './ind-select-dropdown.component.scss'
})
export class IndSelectDropdownComponent {
  @Input() getFormName: any = ''; // Data from the parent component
  @Input() getDataList: any = []; // Data from the parent component
  @Input() getDefaultSelected: string = ''; // Data from the parent component
  @Input() getDefaultWidth: string = ''; // Data from the parent component
  @Output() onSelectionChanged = new EventEmitter<string>();
 
  constructor() { }
  ngOnInit() {
    var that = this;
  }
  onSelectionChange() {
    this.onSelectionChanged.emit(this.getDefaultSelected);
  }
}
