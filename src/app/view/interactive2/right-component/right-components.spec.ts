import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveRightComponent } from './right-components';

describe('PerformanceComponentsComponent', () => {
  let component: InteractiveRightComponent;
  let fixture: ComponentFixture<InteractiveRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractiveRightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InteractiveRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
