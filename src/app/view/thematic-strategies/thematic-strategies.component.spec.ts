import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThematicStrategiesComponent } from './thematic-strategies.component';

describe('ThematicStrategiesComponent', () => {
  let component: ThematicStrategiesComponent;
  let fixture: ComponentFixture<ThematicStrategiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThematicStrategiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThematicStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
