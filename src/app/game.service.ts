import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { Game } from './types/Game';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase';

import * as shortid from 'shortid';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameRef: any;
  playerID: string;
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

  get(gameRef: string): Observable<Game> {
    this.gameRef = gameRef;
    return this.afs
      .collection('games')
      .doc(this.gameRef)
      .valueChanges()
      .pipe(map((x: Game) => x));
  }

  join(player: { name: string }) {
    const playerWithId = { ...player, id: shortid.generate() };
    this.playerID = playerWithId.id;
    return this.afs
      .collection('games')
      .doc(this.gameRef)
      .update({
        players: firestore.FieldValue.arrayUnion(playerWithId)
      });
  }
}
