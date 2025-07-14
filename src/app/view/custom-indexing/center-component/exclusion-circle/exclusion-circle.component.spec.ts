import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExclusionCircleComponent } from './exclusion-circle.component';

describe('ExclusionCircleComponent', () => {
  let component: ExclusionCircleComponent;
  let fixture: ComponentFixture<ExclusionCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExclusionCircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExclusionCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
