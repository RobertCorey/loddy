import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { IGame } from './types/Game';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { firestore } from 'firebase';

import * as shortid from 'shortid';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameRef: any;
  localPlayer: any;
  playerID: string;
  lastGameState: IGame;
  constructor(private afs: AngularFirestore, private router: Router) {
    (window as any).gs = this;
  }

  async create() {
    const game: IGame = {
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

  get(gameRef: string): Observable<IGame> {
    this.gameRef = gameRef;
    return this.getCollection()
      .valueChanges()
      .pipe(
        map((x: IGame) => x),
        tap(game => (this.lastGameState = game))
      );
  }

  getCollection() {
    if (!this.gameRef) {
      throw new Error('no game ref');
    }
    return this.afs.collection('games').doc(this.gameRef);
  }

  join(player: { name: string }) {
    const playerWithId = {
      ...player,
      id: shortid.generate(),
      host: !this.lastGameState.players.length
    };
    return this.getCollection()
      .update({
        players: firestore.FieldValue.arrayUnion(playerWithId)
      })
      .then(_ => (this.localPlayer = playerWithId));
  }
  startGame() {
    this.afs.collection('games').doc(this.gameRef);
  }
}
