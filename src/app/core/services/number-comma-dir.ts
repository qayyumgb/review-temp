import { Directive, OnDestroy, OnInit,ElementRef,HostListener } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Directive({
  selector: '[inputWithComma]',
  providers: [DecimalPipe]
})
export class NumberCommaDirective  {
  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initialValue = this.el.nativeElement.value;

    // Remove all non-digit characters except for .
    const cleanValue = initialValue.replace(/[^0-9.]/g, '');

    // Split the value into integer and decimal parts (if any)
    const [integerPart, decimalPart] = cleanValue.split('.');

    // Format the integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine the formatted integer part with the decimal part (if any)
    const formattedValue = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;

    // Set the formatted value back to the input element
    this.el.nativeElement.value = formattedValue;

    // Dispatch the input event to update the ngModel binding
    this.el.nativeElement.dispatchEvent(new Event('input'));

    // Prevent the cursor from moving to the end
    event.stopImmediatePropagation();
  }
}
