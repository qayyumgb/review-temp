import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebalanceNavComponent } from './rebalance.component';

describe('RebalanceNavComponent', () => {
  let component: RebalanceNavComponent;
  let fixture: ComponentFixture<RebalanceNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RebalanceNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RebalanceNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
