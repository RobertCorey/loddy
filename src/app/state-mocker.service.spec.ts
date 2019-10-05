import { TestBed } from '@angular/core/testing';

import { StateMockerService } from './state-mocker.service';

describe('StateMockerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StateMockerService = TestBed.get(StateMockerService);
    expect(service).toBeTruthy();
  });
});
