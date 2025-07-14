import { TestBed } from '@angular/core/testing';

import { EtfsUniverseService } from './etfs-universe.service';

describe('EtfsUniverseService', () => {
  let service: EtfsUniverseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtfsUniverseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
