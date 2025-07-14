import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VscompareComponent } from './vscompare.component';

describe('VscompareComponent', () => {
  let component: VscompareComponent;
  let fixture: ComponentFixture<VscompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VscompareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VscompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
