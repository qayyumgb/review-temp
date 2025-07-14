import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtfUniverseComponent } from './etf-universe.component';

describe('EtfUniverseComponent', () => {
  let component: EtfUniverseComponent;
  let fixture: ComponentFixture<EtfUniverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtfUniverseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtfUniverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
