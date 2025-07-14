import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'd3';
import { isNotNullOrUndefined } from '../services/sharedData/shared-data.service';

@Pipe({
  name: 'priceFormat'
})
export class PriceFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "" }
    else if (args.length > 1) {
      if (isNotNullOrUndefined(args[1])) { return args[1] + "" + format(args[0])(value); }
      else { return format("$"+args[0])(value) }
    } else if (args.length > 0) { return format(args[0])(value) }
    else { return format("$,.2f")(value) }
  }

}
