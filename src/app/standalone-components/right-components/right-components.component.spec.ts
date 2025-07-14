import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightComponentsComponent } from './right-components.component';

describe('RightComponentsComponent', () => {
  let component: RightComponentsComponent;
  let fixture: ComponentFixture<RightComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightComponentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RightComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
