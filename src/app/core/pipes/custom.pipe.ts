import { Pipe, PipeTransform } from '@angular/core';
import { isNotNullOrUndefined } from '../services/sharedData/shared-data.service';
import { format } from 'd3';
import moment from 'moment-timezone';
import { FormArray, FormControl } from '@angular/forms';

@Pipe({
  name: 'custom'
})
export class CustomPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

@Pipe({
  name: 'numFormatWithDash'
})
export class numFormatWithDashPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else if (args.length > 0 && args[0] == 'per') { return format(",.2f")(value * 100) }
    else { return format(",.2f")(value) }
  }
}

@Pipe({
  name: 'dateFormat'
})
export class dateFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else if (args.length > 0) { return moment(value).format(args[0]) }
    else { return moment(value).format('MM/DD/YYYY'); }
  }
}

@Pipe({
  name: 'factorFormat'
})
export class factorFormatPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return "0.00" }
    else { return format(",.4f")(value * 100); }
  }
}

@Pipe({
  name: 'factorDashFormat'
})
export class factorGFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (args.length > 0 && parseInt(args[0]) > 0) {
      var factorId = parseInt(args[0]);
      if (factorId == 18 && isNotNullOrUndefined(value['scores'])) { return format(".2f")(value.scores * 100) + "%"; }
      else if (isNotNullOrUndefined(value['factorValue'])) {
        var factorValue: any = value['factorValue'];
        if (factorId == 12) { return format(".2f")(factorValue * 100); }
        else if (factorId == 19 || factorId == 10 || factorId == 4 || factorId == 9 || factorId == 1) { return format(".2f")(factorValue); }
        else if (factorId == 17) {
          let ActVal = factorValue * 1000000;
          return this.CurrencyFormat(ActVal).toString();
        }
        else if (factorId == 2 || factorId == 7 || factorId == 5 || factorId == 8 || factorId == 15 || factorId == 20 ||
          factorId == 14 || factorId == 13 || factorId == 6 || factorId == 21) { return format(".2f")(factorValue * 100) + "%"; }

      } else { return "-" }
    } else { return "-" }
  }


  CurrencyFormat(val:any) {
    return Math.abs(Number(val)) >= 1.0e+12
      ? (Math.abs(Number(val)) / 1.0e+12).toFixed(2) + " T" : Math.abs(Number(val)) >= 1.0e+9
        ? (Math.abs(Number(val)) / 1.0e+9).toFixed(1) + " B" : Math.abs(Number(val)) >= 1.0e+6
          ? (Math.abs(Number(val)) / 1.0e+6).toFixed(1) + " M" : Math.abs(Number(val)) >= 1.0e+3
            ? (Math.abs(Number(val)) / 1.0e+3).toFixed(1) + " K" : Math.abs(Number(val));
  }

}

@Pipe({
  name: 'factorinputFormat'
})
export class factorinputFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (args.length > 0 && parseInt(args[0]) > 0) {
      var factorId = parseInt(args[0]);
      if (isNotNullOrUndefined(value)) {
        var factorValue: any = value;
        if (factorId == 12) {
          //var fVal = format(".2f")(factorValue * 100)
          var fVal = (factorValue * 100).toFixed(2);
          return +fVal;
        }
        else if (factorId == 19 || factorId == 10 || factorId == 4 || factorId == 9 || factorId == 1) {
          //var fVal = format(".2f")(factorValue);
          var fVal1 = (factorValue).toFixed(2);
          return +fVal1;
        }
        else if (factorId == 17) {
          let ActVal = factorValue * 1000000;
          return ActVal;
        }
        else if (factorId == 2 || factorId == 7 || factorId == 5 || factorId == 8 || factorId == 15 || factorId == 20 ||
          factorId == 14 || factorId == 13 || factorId == 6 || factorId == 21) {
          //var fVal = format(".2f")(factorValue * 100);
          var fVal2 = (factorValue * 100).toFixed(2);
          return +fVal2;
        }

      } else { return 0 }
    } else { return 0 }
  }
}


@Pipe({
  name: 'wtFormatPerDig'
})
export class WtFormatPerDigitPipe implements PipeTransform {
  transform(value: any): any {
    if (value == null || value == undefined || value == "") { return "-" }
    else { return format(",.1f")(value*100) + "%" }
  }

}


@Pipe({
  name: 'accountFilter'
})
export class accountFilterPipe implements PipeTransform {
  transform(account: any, query: string): FormControl[] {
    if (!query) { return account; }
    return account.filter((acc: any) => acc['value']['data']['accountVan'].toLowerCase().includes(query.toLowerCase()) || acc['value']['data']['accountTitle'].toLowerCase().includes(query.toLowerCase()));
  }
}
