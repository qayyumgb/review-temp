import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquityUniverseComponent } from './equity-universe.component';

describe('EquityUniverseComponent', () => {
  let component: EquityUniverseComponent;
  let fixture: ComponentFixture<EquityUniverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquityUniverseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquityUniverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
