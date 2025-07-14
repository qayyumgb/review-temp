import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCircleComponent } from './strategy-circle.component';

describe('StrategyCircleComponent', () => {
  let component: StrategyCircleComponent;
  let fixture: ComponentFixture<StrategyCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StrategyCircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StrategyCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
