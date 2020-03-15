import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Game } from './types/Game';
import { AngularFirestore } from '@angular/fire/firestore';
import { brainQuestionsStart } from 'src/mocks/game/brain-questions-start';
import { Router } from '@angular/router';
import { PlayerService } from './services/player.service';
import { fullLobby } from 'src/mocks/game/full-lobby';
import { firstQuestion } from 'src/mocks/game/game-loop/first-question';
import { firstRound } from 'src/mocks/game/score-screen/first-round';

@Injectable({
  providedIn: 'root'
})
export class StateMockerService {
  constructor(
    private gs: GameService,
    private afs: AngularFirestore,
    private router: Router,
    private playerService: PlayerService
  ) {
    (window as any).mocker = this;
  }

  fillLobby(count: number) {
    new Array(count).fill('').map((_, i) => {
      this.gs.join({ name: `player ${i}` });
    });
  }

  async setupMockState(gameState, localPlayer) {
    this.playerService.player = localPlayer;
    const gameRef = await this.afs.collection('games').add(gameState);
    this.gs.gameRef = gameRef.id;

    await this.router.navigate(['game', gameRef.id]);
    this.gs.mock = true;
  }
  answerBrainQuestionsInitial() {
    const localPlayer = {
      name: 'a',
      id: 'u1jO_U1P',
      host: true
    };
    this.setupMockState(brainQuestionsStart, localPlayer);
  }

  fullLobbyAsHost() {
    const localPlayer = {
      host: true,
      id: 'hW3CuubX',
      name: 'rob'
    };
    this.setupMockState(fullLobby, localPlayer);
  }
  /**
   * first question of game loop as last player to answer
   */
  firstQuestion() {
    this.setupMockState(firstQuestion, firstQuestion.players[1]);
  }

  firstScoreScreen() {
    this.setupMockState(firstRound, firstRound.players[0]);
  }
}
