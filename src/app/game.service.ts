import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { IGame } from './types/Game';
import { IPlayer } from './types/IPlayer';
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
  localPlayer: IPlayer;
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
    return await this.afs
      .collection('games')
      .add(game)
      .then(_ => _.id);
  }

  getCollection() {
    if (!this.gameRef) {
      throw new Error('no game ref');
    }
    return this.afs.collection('games').doc(this.gameRef);
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
}
