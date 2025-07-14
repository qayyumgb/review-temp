import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatePwdComponent } from './activate-pwd.component';

describe('ActivatePwdComponent', () => {
  let component: ActivatePwdComponent;
  let fixture: ComponentFixture<ActivatePwdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivatePwdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivatePwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
