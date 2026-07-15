import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { IGame } from "../types/IGame";
import { IPlayer } from "../types/IPlayer";
import { Observable } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { Game } from "../types/Game";
import { PlayerService } from "./player.service";

const MAX_PLAYERS = 8;

@Injectable({
  providedIn: "root",
})
export class GameCollectionService {
  private gameRef: DocumentReference;
  private _gameState$: Observable<IGame>;
  private playAgainInFlight = false;
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
    this._gameState$ = null; // a new game means a new document stream
    this.gameRef = ref;
    return this.gameRef;
  }

  private async create() {
    const ref = await this.collection.add(this.freshGame());
    return ref;
  }

  private freshGame(): IGame {
    return {
      createdAt: Date.now(),
      players: [],
      status: "LOBBY",
    };
  }

  /**
   * Adds the player inside a transaction so concurrent joins serialize:
   * exactly one player becomes host, the 8-player cap holds, and nobody can
   * slip in after the game has started. Rejects if the lobby is closed.
   */
  async joinGame(player: IPlayer): Promise<IPlayer> {
    const firestore = this.angularFirestore.firestore;
    const docRef = firestore.collection("games").doc(this.currentDocumentId);
    if (!player.name) {
      throw new Error("a name is required to join");
    }
    return firestore.runTransaction(async (tx) => {
      const game = (await tx.get(docRef)).data() as IGame;
      if (!game || game.status !== "LOBBY") {
        throw new Error("this game has already started");
      }
      if (game.players.length >= MAX_PLAYERS) {
        throw new Error("this game is full");
      }
      const joined = { ...player, host: !game.players.length };
      tx.update(docRef, { players: [...game.players, joined] });
      return joined;
    });
  }

  /**
   * Allows a lobby of players to play again. The nextLobby pointer is set in
   * a transaction so simultaneous clicks (or a double-click) can't split the
   * party across two different lobbies.
   */
  async playAgain() {
    if (this.playAgainInFlight) {
      return;
    }
    this.playAgainInFlight = true;
    try {
      const firestore = this.angularFirestore.firestore;
      const docRef = firestore.collection("games").doc(this.currentDocumentId);
      const newId = this.angularFirestore.createId();
      const lobbyId = await firestore.runTransaction(async (tx) => {
        const game = (await tx.get(docRef)).data() as IGame;
        if (game && game.nextLobby) {
          return game.nextLobby;
        }
        tx.set(firestore.collection("games").doc(newId), this.freshGame());
        tx.update(docRef, { nextLobby: newId });
        return newId;
      });
      this.transferToNewLobby(lobbyId);
    } catch {
      this.playAgainInFlight = false;
    }
  }

  private transferToNewLobby(lobbyId: string) {
    window.location.href = `/game/${lobbyId}?playerName=${encodeURIComponent(
      this.ps.player.name
    )}`;
  }

  setDocumentById(id: string) {
    if (this.gameRef && this.gameRef.id !== id) {
      this._gameState$ = null; // new game, new document stream
    }
    this.gameRef = this.collection.doc(id).ref;
  }

  async tupdate(partialGame: Partial<IGame>) {
    return this.update(partialGame);
  }

  async update(partialGame) {
    return this.currentDocument.update(partialGame);
  }

  private get currentDocumentId() {
    if (!this.gameRef) {
      throw Error("game reference not set");
    }
    return this.gameRef.id;
  }

  get currentDocument() {
    return this.collection.doc(this.currentDocumentId);
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
