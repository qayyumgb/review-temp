import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonErrorDialogComponent } from './common-error-dialog.component';

describe('CommonErrorDialogComponent', () => {
  let component: CommonErrorDialogComponent;
  let fixture: ComponentFixture<CommonErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonErrorDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommonErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
