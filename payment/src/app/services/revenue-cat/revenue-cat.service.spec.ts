import { TestBed } from '@angular/core/testing';

import { RevenueCatService } from './revenue-cat.service';

describe('RevenueCatService', () => {
  let service: RevenueCatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevenueCatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
