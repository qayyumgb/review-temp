import { TestBed } from '@angular/core/testing';

import { ThematicIndexService } from './thematic-index.service';

describe('ThematicIndexService', () => {
  let service: ThematicIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThematicIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
