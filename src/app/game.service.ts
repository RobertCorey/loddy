import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { Game } from './types/Game';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private afs: AngularFirestore, private router: Router) {}

  async create() {
    const game: Game = {
      createdAt: Date.now(),
      players: [],
      status: 'LOBBY'
    };
    const gameRef = await this.afs
      .collection('games')
      .add(game)
      .then(_ => _.id);
    return gameRef;
  }

  get(gameId: string) {
    return this.afs
      .collection('games')
      .doc(gameId)
      .valueChanges();
  }
}
