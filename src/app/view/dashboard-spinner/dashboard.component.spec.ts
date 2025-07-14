import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponentSpinner } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponentSpinner;
  let fixture: ComponentFixture<DashboardComponentSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponentSpinner]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponentSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
