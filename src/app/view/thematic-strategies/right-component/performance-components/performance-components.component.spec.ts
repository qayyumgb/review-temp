import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceComponentsThematic } from './performance-components.component';

describe('PerformanceComponentsComponent', () => {
  let component: PerformanceComponentsThematic;
  let fixture: ComponentFixture<PerformanceComponentsThematic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceComponentsThematic]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceComponentsThematic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
