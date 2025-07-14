import { ComponentFixture, TestBed } from '@angular/core/testing';

import { logoutComponent } from './logout.component';

describe('NotFoundPageComponent', () => {
  let component: logoutComponent;
  let fixture: ComponentFixture<logoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [logoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(logoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
