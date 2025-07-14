import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightGridComponent } from './right-grid.component';

describe('RightGridComponent', () => {
  let component: RightGridComponent;
  let fixture: ComponentFixture<RightGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RightGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RightGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
