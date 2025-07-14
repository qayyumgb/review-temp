import { TestBed } from '@angular/core/testing';

import { CustomIndexService } from './custom-index.service';

describe('CustomIndexService', () => {
  let service: CustomIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
