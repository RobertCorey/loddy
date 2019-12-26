import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Game } from './types/Game';
import { AngularFirestore } from '@angular/fire/firestore';
import { brainQuestionsStart } from 'src/mocks/game/brain-questions-start';
import { Router } from '@angular/router';
import { onePersonLeftToAnswer } from 'src/mocks/game/one-person-left-to-answer';

@Injectable({
  providedIn: 'root'
})
export class StateMockerService {
  constructor(
    private gs: GameService,
    private afs: AngularFirestore,
    private router: Router
  ) {
    (window as any).mocker = this;
  }

  fillLobby(count: number) {
    new Array(count).fill('').map((_, i) => {
      this.gs.join({ name: `player ${i}` });
    });
  }

  async setupMockState(gameState, localPlayer) {
    await this.router.navigate(['']);
    const gameRef = await this.afs.collection('games').add(gameState);
    this.gs.gameRef = gameRef.id;
    this.gs.localPlayer = localPlayer;

    this.router.navigate(['game', gameRef.id]);
  }

  answerBrainQuestionsInitial() {
    const localPlayer = {
      name: 'a',
      id: 'u1jO_U1P',
      host: true
    };
    this.setupMockState(brainQuestionsStart, localPlayer);
  }

  async onePersonLeftToAnswer() {
    console.log('hurrr');
    await this.setupMockState(
      onePersonLeftToAnswer,
      onePersonLeftToAnswer.players[2]
    );
    this.gs.initGameRunner();
  }
}
