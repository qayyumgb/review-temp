import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceComponentsComponent } from './performance-components.component';

describe('PerformanceComponentsComponent', () => {
  let component: PerformanceComponentsComponent;
  let fixture: ComponentFixture<PerformanceComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceComponentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
