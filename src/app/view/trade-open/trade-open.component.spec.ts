import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeOpenComponent } from './trade-open.component';

describe('TradeOpenComponent', () => {
  let component: TradeOpenComponent;
  let fixture: ComponentFixture<TradeOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeOpenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TradeOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
