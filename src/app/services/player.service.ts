import { Injectable } from "@angular/core";
import { IPlayer } from "../types/IPlayer";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  player: IPlayer = { id: null, host: false, name: "observer" };
  private gameId: string;
  constructor() {
    (window as any).ps = this;
  }

  /**
   * Ties this tab's identity to a game so it survives a refresh.
   * sessionStorage is per-tab, so several tabs in one browser can still
   * be different players in the same game.
   */
  bindToGame(gameId: string) {
    if (this.gameId === gameId) {
      return;
    }
    this.gameId = gameId;
    // Identity is per game: restore what this tab had in THIS game, or start
    // over as a prospective joiner (never carry a player across games).
    let restored: IPlayer = null;
    const saved = sessionStorage.getItem(this.storageKey);
    if (saved) {
      try {
        restored = JSON.parse(saved);
      } catch {
        sessionStorage.removeItem(this.storageKey);
      }
    }
    this.player = restored || { id: null, host: false, name: "observer" };
  }

  setPlayer(player: IPlayer) {
    this.player = player;
    if (this.gameId) {
      sessionStorage.setItem(this.storageKey, JSON.stringify(player));
    }
  }

  private get storageKey() {
    return `loddy-player-${this.gameId}`;
  }

  get isHost() {
    return !!this.player.host;
  }
  get isObserver() {
    return !this.player.id;
  }
}
