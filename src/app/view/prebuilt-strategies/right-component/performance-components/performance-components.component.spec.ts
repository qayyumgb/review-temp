import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceComponentsComponent_Prebuilt } from './performance-components.component';

describe('PerformanceComponentsComponent', () => {
  let component: PerformanceComponentsComponent_Prebuilt;
  let fixture: ComponentFixture<PerformanceComponentsComponent_Prebuilt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceComponentsComponent_Prebuilt]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceComponentsComponent_Prebuilt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
