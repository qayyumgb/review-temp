import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPrebuildComponent } from './custom-prebuild.component';

describe('CustomPrebuildComponent', () => {
  let component: CustomPrebuildComponent;
  let fixture: ComponentFixture<CustomPrebuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomPrebuildComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomPrebuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
