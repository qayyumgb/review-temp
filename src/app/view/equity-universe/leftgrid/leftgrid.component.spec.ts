import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftgridComponent } from './leftgrid.component';

describe('LeftgridComponent', () => {
  let component: LeftgridComponent;
  let fixture: ComponentFixture<LeftgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeftgridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeftgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
