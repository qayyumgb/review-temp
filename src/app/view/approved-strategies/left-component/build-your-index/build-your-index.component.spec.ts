import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildYourIndexComponent } from './build-your-index.component';

describe('BuildYourIndexComponent', () => {
  let component: BuildYourIndexComponent;
  let fixture: ComponentFixture<BuildYourIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuildYourIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildYourIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
