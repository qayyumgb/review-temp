import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HfactorComponentComponent } from './hfactor-component.component';

describe('HfactorComponentComponent', () => {
  let component: HfactorComponentComponent;
  let fixture: ComponentFixture<HfactorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HfactorComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HfactorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
