import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { IGame } from '../types/IGame';
import { ReplaySubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameCollectionService {
  private gameRef: DocumentReference;
  private _gameState$: Observable<IGame>;
  constructor(private angularFirestore: AngularFirestore) {
    (window as any).foo = this;
    this.setDocumentById('0Akbp8AGAfMsc9pX8WeS');
    this.gameState$.subscribe(console.log);
  }

  private get collection() {
    return this.angularFirestore.collection('games');
  }

  async create() {
    const game: IGame = {
      createdAt: Date.now(),
      players: [],
      status: 'LOBBY'
    };
    this.gameRef = await this.collection.add(game);
  }

  setDocumentById(id: string) {
    this.gameRef = this.collection.doc(id).ref;
  }

  update(partialGame: Partial<IGame>) {
    return this.currentDocument.update(partialGame);
  }

  get currentDocument() {
    if (!this.gameRef) {
      throw Error('game reference not set');
    }
    return this.collection.doc(this.gameRef.id);
  }

  get gameState$() {
    if (!this._gameState$) {
      this._gameState$ = this.currentDocument.valueChanges().pipe(
        map((x: IGame) => x),
        shareReplay(1)
      );
    }
    return this._gameState$;
  }
}
