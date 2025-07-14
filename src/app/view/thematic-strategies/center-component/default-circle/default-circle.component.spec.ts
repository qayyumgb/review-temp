import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultCircleComponent_Thematic } from './default-circle.component';

describe('DefaultCircleComponent', () => {
  let component: DefaultCircleComponent_Thematic;
  let fixture: ComponentFixture<DefaultCircleComponent_Thematic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultCircleComponent_Thematic]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultCircleComponent_Thematic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
