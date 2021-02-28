import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { IGame } from "../types/IGame";
import { Observable } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { Game } from "../types/Game";
import { PlayerService } from "./player.service";

@Injectable({
  providedIn: "root",
})
export class GameCollectionService {
  private gameRef: DocumentReference;
  private _gameState$: Observable<IGame>;
  count: number = 0;
  constructor(
    private angularFirestore: AngularFirestore,
    private ps: PlayerService
  ) {
    (window as any).gcs = this;
  }

  private get collection() {
    return this.angularFirestore.collection("games");
  }

  async createAndSetRef() {
    const ref = await this.create();
    this.gameRef = ref;
    return this.gameRef;
  }

  private async create() {
    const game: IGame = {
      createdAt: Date.now(),
      players: [],
      status: "LOBBY",
    };
    const ref = await this.collection.add(game);
    return ref;
  }

  //Allows a lobby of player to play again
  async playAgain() {
    const currentGame = await this.getPromise();
    if (!currentGame.nextLobby) {
      const newGame = await this.create();
      await this.tupdate({ nextLobby: newGame.id });
      this.transferToNewLobby(newGame.id);
    } else {
      this.transferToNewLobby(currentGame.nextLobby);
    }
  }

  private async getPromise(): Promise<IGame> {
    return (await this.currentDocument.get().toPromise()).data() as IGame;
  }

  private transferToNewLobby(lobbyId: string) {
    window.location.href = `/game/${lobbyId}?playerName=${this.ps.player.name}`;
  }

  setDocumentById(id: string) {
    this.gameRef = this.collection.doc(id).ref;
  }

  async tupdate(partialGame: Partial<IGame>) {
    return this.update(partialGame);
  }

  async update(partialGame) {
    return this.currentDocument.update(partialGame);
  }

  get currentDocument() {
    if (!this.gameRef) {
      throw Error("game reference not set");
    }
    return this.collection.doc(this.gameRef.id);
  }

  get gameState$() {
    if (!this._gameState$) {
      this._gameState$ = this.currentDocument.valueChanges().pipe(
        map((x: IGame) => x),
        tap((x) => {
          this.count += 1;
        }),
        shareReplay(1)
      );
    }
    return this._gameState$;
  }

  get gameClass$() {
    return this.gameState$.pipe(map((game) => new Game(game)));
  }
}
