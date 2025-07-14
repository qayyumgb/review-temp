import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DontbuyComponent } from './dontbuy.component';

describe('DontbuyComponent', () => {
  let component: DontbuyComponent;
  let fixture: ComponentFixture<DontbuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DontbuyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DontbuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
