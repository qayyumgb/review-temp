import { TestBed } from '@angular/core/testing';

import { PrebuildIndexService } from './prebuild-index.service';

describe('PrebuildIndexService', () => {
  let service: PrebuildIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrebuildIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
