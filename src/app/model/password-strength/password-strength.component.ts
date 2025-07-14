import { Component, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.component.html',
  styleUrl: './password-strength.component.css'
})
export class PasswordStrengthComponent implements OnChanges{
  @Input() public passwordToCheck: string = '';
  @Output() passwordStrength = new EventEmitter<boolean>();
  bar0: string = '';
  bar1: string = '';
  bar2: string = '';
  bar3: string = '';
  messageColor: string = '';
  msg = '';

  private colors = ['#e32755', 'orangered', 'orange', '#02b502'];

  private static checkStrength(p:any) {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_@`\[\]]/g;

    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /[0-9]+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];

    let passedMatches = 0;
    for (const flag of flags) {
      passedMatches += flag === true ? 1 : 0;
    }

    force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
    force += passedMatches * 10;

    // short password
    force = (p.length <= 6) ? Math.min(force, 10) : force;

    // poor variety of characters
    force = (passedMatches === 1) ? Math.min(force, 10) : force;
    force = (passedMatches === 2) ? Math.min(force, 20) : force;
    force = (passedMatches === 3) ? Math.min(force, 30) : force;
    force = (passedMatches === 4) ? Math.min(force, 40) : force;

    return force;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const password = changes['passwordToCheck'].currentValue;
    // const password = changes.passwordToCheck.currentValue;
    this.setBarColors(4, '#2b2c48');
    if (password) {
      const c = this.getColor(PasswordStrengthComponent.checkStrength(password));
      this.setBarColors(c.idx, c.col);

      const pwdStrength = PasswordStrengthComponent.checkStrength(password);
      pwdStrength === 40 ? this.passwordStrength.emit(true) : this.passwordStrength.emit(false);

      switch (c.idx) {
        case 1:
          this.msg = 'Poor';
          break;
        case 2:
          this.msg = 'Not Good';
          break;
        case 3:
          this.msg = 'Average';
          break;
        case 4:
          this.msg = 'Good';
          break;
      }
    } else {
      this.msg = '';
    }
  }


  private getColor(s:any) {
    let idx = 0;
    if (s <= 10) {
        idx = 0;
    } else if (s <= 20) {
        idx = 1;
    } else if (s <= 30) {
        idx = 2;
    } else if (s <= 40) {
        idx = 3;
    } else {
        idx = 4;
    }
    this.messageColor = this.colors[idx];
    return {
        idx: idx + 1,
        col: this.colors[idx]
    };
  }

  private setBarColors(count: number, col: string) {
    for (let n = 0; n < count; n++) {
        (this as any) ['bar' + n] = col;
    }
  }
}
