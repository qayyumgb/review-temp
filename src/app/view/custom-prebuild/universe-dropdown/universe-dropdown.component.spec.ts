import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniverseDropdownComponent } from './universe-dropdown.component';

describe('UniverseDropdownComponent', () => {
  let component: UniverseDropdownComponent;
  let fixture: ComponentFixture<UniverseDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniverseDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniverseDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
