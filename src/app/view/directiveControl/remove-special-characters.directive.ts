import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appRemoveSpecialCharacters]'
})
export class RemoveSpecialCharactersDirective {
  private previousValue: string = '';
  constructor(private el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement.value;
    if (input !== this.previousValue) {
      var cleanValue = input.replace(/[^/a-zA-Z0-9,'\s&.-]/g, '').trimStart();
      cleanValue = cleanValue.replace(/\t/g, '');
      cleanValue = cleanValue.replaceAll(/\s+/g,' ');
      if (cleanValue.trim().length == 0) { cleanValue = cleanValue.trim() }
      this.el.nativeElement.value = cleanValue;
      this.previousValue = cleanValue;
    }
  }
}

  @Directive({
    selector: '[appalphanumCharacters]'
  })
  export class alphanumDirective {
  private previousValue: string = '';
  constructor(private el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement.value;
    if (input !== this.previousValue) {
      var cleanValue = input.replace(/[^a-zA-Z0-9]/g, '').trimStart();
      cleanValue = cleanValue.replace(/\t/g, '');
      cleanValue = cleanValue.replaceAll(/\s+/g,' ');
      if (cleanValue.trim().length == 0) { cleanValue = cleanValue.trim() }
      this.el.nativeElement.value = cleanValue;
      this.previousValue = cleanValue;
    }
  }

}

@Directive({
  selector: '[appalphanumCharWithSpace]'
})
export class alphanumCharWithSpaceDirective {
  private previousValue: string = '';
  constructor(private el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement.value;
    if (input !== this.previousValue) {
      var cleanValue = input.replace(/[^a-zA-Z0-9\s]/g, '').trimStart();
      cleanValue = cleanValue.replace(/\t/g, '');
      cleanValue = cleanValue.replaceAll(/\s+/g, ' ');
      if (cleanValue.trim().length == 0) { cleanValue = cleanValue.trim() }
      this.el.nativeElement.value = cleanValue;
      this.previousValue = cleanValue;
    }
  }

}

@Directive({
  selector: '[appAccountTitle]'
})
export class accountTitleDirective {
  private previousValue: string = '';
  constructor(private el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement.value;
    if (input !== this.previousValue) {
      var cleanValue = input.replace(/[^_a-zA-Z0-9&,.\s'-]/g, '').trimStart();
      cleanValue = cleanValue.replace(/\t/g, '');
      cleanValue = cleanValue.replaceAll(/\s+/g, ' ');
      if (cleanValue.trim().length == 0) { cleanValue = cleanValue.trim() }
      this.el.nativeElement.value = cleanValue;
      this.previousValue = cleanValue;
    }
  }

}
