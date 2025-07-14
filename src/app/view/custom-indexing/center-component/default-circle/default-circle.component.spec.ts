import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultCircleComponent } from './default-circle.component';

describe('DefaultCircleComponent', () => {
  let component: DefaultCircleComponent;
  let fixture: ComponentFixture<DefaultCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultCircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
