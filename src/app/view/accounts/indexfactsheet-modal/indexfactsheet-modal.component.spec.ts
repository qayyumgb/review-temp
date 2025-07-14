import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexfactsheetModalComponent } from './indexfactsheet-modal.component';

describe('IndexfactsheetModalComponent', () => {
  let component: IndexfactsheetModalComponent;
  let fixture: ComponentFixture<IndexfactsheetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexfactsheetModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndexfactsheetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
