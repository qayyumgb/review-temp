import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogsWarningComponent } from './dialogs-warning.component';

describe('DialogsWarningComponent', () => {
  let component: DialogsWarningComponent;
  let fixture: ComponentFixture<DialogsWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogsWarningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogsWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
