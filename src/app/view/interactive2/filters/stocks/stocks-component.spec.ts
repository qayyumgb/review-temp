import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterStocksComponent } from './stocks-component';

describe('RightComponentsComponent', () => {
  let component: FilterStocksComponent;
  let fixture: ComponentFixture<FilterStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterStocksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
