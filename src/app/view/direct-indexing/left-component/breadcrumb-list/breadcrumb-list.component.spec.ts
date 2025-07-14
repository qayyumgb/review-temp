import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbListComponent } from './breadcrumb-list.component';

describe('BreadcrumbListComponent', () => {
  let component: BreadcrumbListComponent;
  let fixture: ComponentFixture<BreadcrumbListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreadcrumbListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BreadcrumbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
