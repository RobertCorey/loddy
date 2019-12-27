import { Injectable } from '@angular/core';
import { IPlayer } from '../types/IPlayer';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  player: IPlayer;

  get isHost() {
    return !!this.player.host;
  }
}
