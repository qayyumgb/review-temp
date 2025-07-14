import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexstepCircleComponent } from './indexstep-circle.component';

describe('IndexstepCircleComponent', () => {
  let component: IndexstepCircleComponent;
  let fixture: ComponentFixture<IndexstepCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexstepCircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndexstepCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
