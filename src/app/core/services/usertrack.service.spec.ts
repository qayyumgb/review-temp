import { TestBed } from '@angular/core/testing';

import { UsertrackService } from './usertrack.service';

describe('UsertrackService', () => {
  let service: UsertrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsertrackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
