import { TestBed } from '@angular/core/testing';

import { UserSubscriptionService  } from './subscription.service';

describe('UserSubscriptionService ', () => {
  let service: UserSubscriptionService ;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSubscriptionService );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
