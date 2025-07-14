import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'd3';

@Pipe({name: 'numWithComma'})
export class NumWithCommaPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) { return 0 }
    else {
      if (args.length > 0) {
        var d: any = format(args[0])(value);
        if (args.length > 1) { d + args[1] }
        return d;
      } else { return value }
    }
  }
}

@Pipe({ name: 'numWithCommaRtnNullDash' })
export class NumWithCommaPipeRtnNullDash implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) { return '-' }
    else {
      if (args.length > 0) {
        var d: any = format(args[0])(value);
        if (args.length > 1) { d + args[1] }
        return d;
      } else { return value }
    }
  }
}

@Pipe({ name: 'numWithCommaRtnPercent' })
export class NumWithCommaPipeRtnPercent implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) { return '0.00'+'%' }
    else {
      //if (args.length > 0) {
      //  var d: any = format(args[0])(value);
      //  if (args.length > 1) { d + args[1] }
      //  return d+'%';
      //} else { return value+'%' }
      let formattedValue: string;
      if (args.length > 0) {
        const decimalPlaces = parseInt(args[0], 10);
        const options = {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        };
        formattedValue = new Intl.NumberFormat('en-US', options).format(value);
      } else {
        formattedValue = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        //formattedValue = new Intl.NumberFormat('en-US').format(value);
      }

      if (args.length > 1) {
        return formattedValue + args[1] + '%';
      } else {
        return formattedValue + '%';
      }
    }
  }
}
