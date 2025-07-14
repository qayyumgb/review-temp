import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomIndexingComponent } from './custom-indexing.component';

describe('CustomIndexingComponent', () => {
  let component: CustomIndexingComponent;
  let fixture: ComponentFixture<CustomIndexingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomIndexingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomIndexingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
