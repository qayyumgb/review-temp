import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountLeftComponent } from './account-left.component';

describe('AccountLeftComponent', () => {
  let component: AccountLeftComponent;
  let fixture: ComponentFixture<AccountLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountLeftComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
