import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorComponent } from './factor.component';

describe('FactorComponent', () => {
  let component: FactorComponent;
  let fixture: ComponentFixture<FactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FactorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
