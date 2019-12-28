import { Injectable } from '@angular/core';
import { IPlayer } from '../types/IPlayer';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  player: IPlayer;
  constructor() {
    (window as any).ps = this;
  }
  get isHost() {
    return !!this.player.host;
  }
}
