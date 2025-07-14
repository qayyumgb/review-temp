import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullDashPipe'
})
export class NullDashPipePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) { return '-' }
    if (value == "" && args.length > 0 && args[0]=='-') { return '-' }
    else { return value }
  }

}
