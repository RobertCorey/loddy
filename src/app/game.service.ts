import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import firebase from 'firebase/firebase';
import { Game } from './types/Game';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game: Observable<Game>;
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

  get(gameId: string): Observable<Game> {
    return this.afs
      .collection('games')
      .doc(gameId)
      .valueChanges()
      .pipe(map((x: Game) => x));
  }

  join(gameId: string, player) {
    this.afs
      .collection('games')
      .doc(gameId)
      .update({
        players: firestore.FieldValue.arrayUnion(player)
      });
  }
}
