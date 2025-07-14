import { TestBed } from '@angular/core/testing';

import { IndexstepService } from './indexstep.service';

describe('IndexstepService', () => {
  let service: IndexstepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexstepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
