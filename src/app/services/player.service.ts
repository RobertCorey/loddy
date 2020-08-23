import { Injectable } from "@angular/core";
import { IPlayer } from "../types/IPlayer";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  player: IPlayer = { id: null, host: false, name: "observer" };
  constructor() {
    (window as any).ps = this;
  }
  get isHost() {
    return !!this.player.host;
  }
}
