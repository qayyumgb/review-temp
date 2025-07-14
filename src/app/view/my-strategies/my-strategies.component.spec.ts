import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStrategiesComponent } from './my-strategies.component';

describe('MyStrategiesComponent', () => {
  let component: MyStrategiesComponent;
  let fixture: ComponentFixture<MyStrategiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyStrategiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
