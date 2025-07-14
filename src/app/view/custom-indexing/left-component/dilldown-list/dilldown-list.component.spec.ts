import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DilldownListComponent } from './dilldown-list.component';

describe('DilldownListComponent', () => {
  let component: DilldownListComponent;
  let fixture: ComponentFixture<DilldownListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DilldownListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DilldownListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
