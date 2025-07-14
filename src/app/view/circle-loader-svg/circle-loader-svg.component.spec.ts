import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleLoaderSvgComponent } from './circle-loader-svg.component';

describe('CircleLoaderSvgComponent', () => {
  let component: CircleLoaderSvgComponent;
  let fixture: ComponentFixture<CircleLoaderSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircleLoaderSvgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircleLoaderSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
