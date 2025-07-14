import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightPerformanceComponent } from './right-performance.component';

describe('RightPerformanceComponent', () => {
  let component: RightPerformanceComponent;
  let fixture: ComponentFixture<RightPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RightPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
