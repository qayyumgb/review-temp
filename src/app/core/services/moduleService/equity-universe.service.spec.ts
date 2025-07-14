import { TestBed } from '@angular/core/testing';

import { EquityUniverseService } from './equity-universe.service';

describe('EquityUniverseService', () => {
  let service: EquityUniverseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquityUniverseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
