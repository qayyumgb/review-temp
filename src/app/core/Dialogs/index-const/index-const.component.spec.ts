import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexConstComponent } from './index-const.component';

describe('IndexConstComponent', () => {
  let component: IndexConstComponent;
  let fixture: ComponentFixture<IndexConstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexConstComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndexConstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
