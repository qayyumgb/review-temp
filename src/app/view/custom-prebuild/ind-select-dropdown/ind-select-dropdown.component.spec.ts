import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndSelectDropdownComponent } from './ind-select-dropdown.component';

describe('IndSelectDropdownComponent', () => {
  let component: IndSelectDropdownComponent;
  let fixture: ComponentFixture<IndSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndSelectDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
