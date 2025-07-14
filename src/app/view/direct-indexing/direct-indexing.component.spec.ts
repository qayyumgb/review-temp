import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectIndexComponent } from './direct-indexing.component';

describe('DirectIndexingComponent', () => {
  let component: DirectIndexComponent;
  let fixture: ComponentFixture<DirectIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DirectIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
