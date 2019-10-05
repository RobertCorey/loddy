import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Game } from './types/Game';

@Injectable({
  providedIn: 'root'
})
export class StateMockerService {
  constructor(private gs: GameService) {}

  fillLobby(count: number) {
    new Array(count).fill('').map((_, i) => {
      this.gs.join({ name: `player ${i}` });
    });
  }
}
