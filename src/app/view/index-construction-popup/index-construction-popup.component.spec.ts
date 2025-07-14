import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexConstructionPopupComponent } from './index-construction-popup.component';

describe('IndexConstructionPopupComponent', () => {
  let component: IndexConstructionPopupComponent;
  let fixture: ComponentFixture<IndexConstructionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexConstructionPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndexConstructionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
