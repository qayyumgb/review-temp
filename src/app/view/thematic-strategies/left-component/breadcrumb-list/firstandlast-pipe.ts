import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstAndLast'
})
export class FirstAndLastPipe implements PipeTransform {
  transform(value: any[]): any[] {
    if (!Array.isArray(value) || value.length === 0) {
      return [];
    } else if (value.length === 1) {
      return [value[0]];
    } else {
      return [value[0], value[1]];
    }
  }
}
