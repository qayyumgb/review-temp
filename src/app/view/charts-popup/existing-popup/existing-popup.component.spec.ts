import { ComponentFixture, TestBed } from '@angular/core/testing';

import { existingPopupComponent } from './existing-popup.component';

describe('PerformancePopupComponent', () => {
  let component: existingPopupComponent;
  let fixture: ComponentFixture<existingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [existingPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(existingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
