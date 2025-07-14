import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interactive2Component } from './interactive2.component';

describe('Interactive2Component', () => {
  let component: Interactive2Component;
  let fixture: ComponentFixture<Interactive2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Interactive2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Interactive2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
