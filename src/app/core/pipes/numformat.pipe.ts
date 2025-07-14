import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'd3';

@Pipe({
  name: 'numformat'
})
export class NumformatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) { return 0 }
    else { return value; }
  }

}

@Pipe({
  name: 'percentFormat'
})
export class percentformatPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else { return format(",.2f")(value) + "%" }
  }

}

@Pipe({
  name: 'numValueFormat'
})
export class numValueformatPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else { return format(",.2f")(value) }
  }

}

@Pipe({
  name: 'numValFormat'
})
export class numValformatPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return '0.00' }
    else { return format(",.2f")(value) }
  }

}

@Pipe({
  name: 'markerCapFormat'
})
export class markerCapformatPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else {
      let billion = 1000000000
      var dta = (value / billion);
      return format(",.1f")(dta) + " Bn.";
    }
  }

}

