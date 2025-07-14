import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewFactsheetComponent } from './review-factsheet.component';

describe('ReviewFactsheetComponent', () => {
  let component: ReviewFactsheetComponent;
  let fixture: ComponentFixture<ReviewFactsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewFactsheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewFactsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
