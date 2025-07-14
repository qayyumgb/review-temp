import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnrealizedGainLossTableComponent } from './unrealized-gain-loss-table.component';

describe('UnrealizedGainLossTableComponent', () => {
  let component: UnrealizedGainLossTableComponent;
  let fixture: ComponentFixture<UnrealizedGainLossTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnrealizedGainLossTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnrealizedGainLossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
