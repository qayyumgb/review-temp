import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeCamelCase'
})
export class ChangeCamelCasePipe implements PipeTransform {

  transform(value: string): any {
    if (value == null || value == undefined) { return "" } else {
      var tempLower = value.toLowerCase();
      return tempLower.replace(/(^\w{1})|(\s+\w{1})/g, (letter:any) => letter.toUpperCase())
    }
  }

}
