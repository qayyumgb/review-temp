import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiNotificationsComponent } from './multi-notifications.component';

describe('MultiNotificationsComponent', () => {
  let component: MultiNotificationsComponent;
  let fixture: ComponentFixture<MultiNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
