import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeDirectComponent } from './trade-direct.component';

describe('TradeDirectComponent', () => {
  let component: TradeDirectComponent;
  let fixture: ComponentFixture<TradeDirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeDirectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TradeDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
