import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterLiquidityComponent } from './liquidity-component';

describe('RightComponentsComponent', () => {
  let component: FilterLiquidityComponent;
  let fixture: ComponentFixture<FilterLiquidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterLiquidityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterLiquidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
