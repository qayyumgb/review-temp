import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCentercircleComponent } from './dashboard-centercircle.component';

describe('DashboardCentercircleComponent', () => {
  let component: DashboardCentercircleComponent;
  let fixture: ComponentFixture<DashboardCentercircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardCentercircleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardCentercircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
