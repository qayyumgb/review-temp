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
  selector: 'app-universe-dropdown',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './universe-dropdown.component.html',
  styleUrl: './universe-dropdown.component.scss'
})
export class UniverseDropdownComponent {
  @Input() universeDataList: any = ''; // Data from the parent component
  universe: any = new FormControl();
  universeList: any = [];
  selectedUniverse: any = [];
  @Output() universeSelectedList = new EventEmitter<string>();
  constructor() { }
  ngOnInit() {
    var that = this;
  }
  universeChange(ev: any) {
    if (isNotNullOrUndefined(ev.value)) {
      this.selectedUniverse = ev.value;
      this.universeSelectedList.emit(this.selectedUniverse);
      //console.log(ev.value);
    }
  }
}
