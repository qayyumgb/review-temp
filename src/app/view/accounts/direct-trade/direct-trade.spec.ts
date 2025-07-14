import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDirectTradeComponent } from './direct-trade';

describe('AccountDirectTradeComponent', () => {
  let component: AccountDirectTradeComponent;
  let fixture: ComponentFixture<AccountDirectTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountDirectTradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountDirectTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
