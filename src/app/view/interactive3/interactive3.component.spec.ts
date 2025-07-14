import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interactive3Component } from './interactive3.component';

describe('Interactive3Component', () => {
  let component: Interactive3Component;
  let fixture: ComponentFixture<Interactive3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Interactive3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Interactive3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
