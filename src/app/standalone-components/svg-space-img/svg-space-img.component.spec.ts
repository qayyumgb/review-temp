import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgSpaceImgComponent } from './svg-space-img.component';

describe('SvgSpaceImgComponent', () => {
  let component: SvgSpaceImgComponent;
  let fixture: ComponentFixture<SvgSpaceImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgSpaceImgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SvgSpaceImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
