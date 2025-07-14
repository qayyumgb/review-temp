import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterCircleComponent } from './center-circle.component';

describe('CenterCircleComponent', () => {
  let component: CenterCircleComponent;
  let fixture: ComponentFixture<CenterCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CenterCircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
