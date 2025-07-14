import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogsErrorComponent } from './dialogs-error.component';

describe('DialogsErrorComponent', () => {
  let component: DialogsErrorComponent;
  let fixture: ComponentFixture<DialogsErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogsErrorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
