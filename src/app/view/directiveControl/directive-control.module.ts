import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoveSpecialCharactersDirective, accountTitleDirective, alphanumCharWithSpaceDirective, alphanumDirective } from './remove-special-characters.directive';

@NgModule({
  declarations: [RemoveSpecialCharactersDirective, alphanumDirective, alphanumCharWithSpaceDirective, accountTitleDirective],
  imports: [CommonModule],
  exports: [RemoveSpecialCharactersDirective, alphanumDirective, alphanumCharWithSpaceDirective, accountTitleDirective]
})
export class DirectiveControlModule { }
