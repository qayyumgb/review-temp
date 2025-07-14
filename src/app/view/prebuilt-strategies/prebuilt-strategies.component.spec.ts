import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebuiltStrategiesComponent } from './PrebuiltStrategiesComponent';

describe('PrebuiltStrategiesComponent', () => {
  let component: PrebuiltStrategiesComponent;
  let fixture: ComponentFixture<PrebuiltStrategiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrebuiltStrategiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrebuiltStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
