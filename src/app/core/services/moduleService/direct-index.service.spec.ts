import { TestBed } from '@angular/core/testing';

import { DirectIndexService } from './direct-index.service';

describe('DirectIndexService', () => {
  let service: DirectIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
