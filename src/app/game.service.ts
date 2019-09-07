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
  playerID: string;
  lastGameState: IGame;
  constructor(private afs: AngularFirestore, private router: Router) {}

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
    return this.afs
      .collection('games')
      .doc(this.gameRef)
      .valueChanges()
      .pipe(
        map((x: IGame) => x),
        tap(game => (this.lastGameState = game))
      );
  }

  join(player: { name: string }) {
    const playerWithId = {
      ...player,
      id: shortid.generate(),
      host: !this.lastGameState.players.length
    };
    this.playerID = playerWithId.id;
    return this.afs
      .collection('games')
      .doc(this.gameRef)
      .update({
        players: firestore.FieldValue.arrayUnion(playerWithId)
      });
  }

  startGame() {
    this.afs.collection('games').doc(this.gameRef);
  }
}
