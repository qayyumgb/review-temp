import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleLoaderSvgStandaloneComponent } from './circle-loader-svg.component';

describe('CircleLoaderSvgComponent', () => {
  let component: CircleLoaderSvgStandaloneComponent;
  let fixture: ComponentFixture<CircleLoaderSvgStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircleLoaderSvgStandaloneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircleLoaderSvgStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
