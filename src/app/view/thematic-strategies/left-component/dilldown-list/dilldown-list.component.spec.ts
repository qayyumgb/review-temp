import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DilldownListComponent_Thematic } from './dilldown-list.component';

describe('DilldownListComponent', () => {
  let component: DilldownListComponent_Thematic;
  let fixture: ComponentFixture<DilldownListComponent_Thematic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DilldownListComponent_Thematic]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DilldownListComponent_Thematic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
