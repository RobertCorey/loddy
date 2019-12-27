import { TestBed } from '@angular/core/testing';

import { GameCollectionService } from './game-collection.service';

describe('GameCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameCollectionService = TestBed.get(GameCollectionService);
    expect(service).toBeTruthy();
  });
});
