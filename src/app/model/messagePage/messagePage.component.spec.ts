import { ComponentFixture, TestBed } from '@angular/core/testing';

import { messagePageComponent } from './messagePage.component';

describe('messagePageComponent', () => {
  let component: messagePageComponent;
  let fixture: ComponentFixture<messagePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [messagePageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(messagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
