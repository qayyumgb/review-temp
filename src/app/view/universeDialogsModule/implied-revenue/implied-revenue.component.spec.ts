import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpliedRevenueComponent } from './implied-revenue.component';

describe('ImpliedRevenueComponent', () => {
  let component: ImpliedRevenueComponent;
  let fixture: ComponentFixture<ImpliedRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImpliedRevenueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpliedRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
