import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePopupComponent } from './performance-popup.component';

describe('PerformancePopupComponent', () => {
  let component: PerformancePopupComponent;
  let fixture: ComponentFixture<PerformancePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformancePopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformancePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
