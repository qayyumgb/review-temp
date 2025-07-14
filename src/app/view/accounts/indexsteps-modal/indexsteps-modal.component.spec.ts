import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexstepsModalComponent } from './indexsteps-modal.component';

describe('IndexstepsModalComponent', () => {
  let component: IndexstepsModalComponent;
  let fixture: ComponentFixture<IndexstepsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexstepsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndexstepsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
