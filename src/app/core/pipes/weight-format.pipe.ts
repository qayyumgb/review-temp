import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'd3';
import { isNotNullOrUndefined } from '../services/sharedData/shared-data.service';

@Pipe({
  name: 'weightFormat'
})
export class WeightFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else if (args.length > 0 && args[0] == 'per') { return format(",.2f")(value * 100)+'%' }
    else { return format(",.2f")(value)+"%" }
  }

}

@Pipe({
  name: 'weightFormatPerWithDigit'
})
export class WeightFormatPerWithDigitPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "-" }    
    else if (args.length > 0) { return format(args[0])(value) + '%' }
    else { return format(",.1f")(value) + "%" }
  }

}

@Pipe({
  name: 'weightFormatWithKey'
})
export class weightFormatWithKeyPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "0.00%" }
    else if (args.length > 0 && args[0] == 'per') {
      if (isNotNullOrUndefined(value.Weight)) { return format(",.2f")(value * 100) + '%' }
      else { return format(",.2f")(value.weight * 100) + '%' }
    }
    else {
      if (isNotNullOrUndefined(value.Weight)) { return format(",.2f")(value) + '%' }
      else { return format(",.2f")(value.weight) + '%' }
    }
  }

}
