import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedStrategiesComponent } from './approved-strategies.component';

describe('ApprovedStrategiesComponent', () => {
  let component: ApprovedStrategiesComponent;
  let fixture: ComponentFixture<ApprovedStrategiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovedStrategiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovedStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
