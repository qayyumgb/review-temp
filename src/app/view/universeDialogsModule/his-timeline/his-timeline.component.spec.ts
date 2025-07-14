import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HisTimelineComponent } from './his-timeline.component';

describe('HisTimelineComponent', () => {
  let component: HisTimelineComponent;
  let fixture: ComponentFixture<HisTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HisTimelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HisTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
