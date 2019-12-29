import { Component, OnInit } from '@angular/core';
import { GameCollectionService } from '../services/game-collection.service';
import { GameService } from '../game.service';
import { PlayerService } from '../services/player.service';
import { Observable, from } from 'rxjs';
import { IPlayer } from '../types/IPlayer';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  canPlayerStartGame: boolean = false;
  constructor(
    private gameCollectionService: GameCollectionService,
    private gameService: GameService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.gameCollectionService.gameClass$.subscribe(game => {
      if (game.canGameBeStarted && this.playerService.isHost) {
        this.canPlayerStartGame = true;
      }
    });
  }

  get hasPlayerJoined(): boolean {
    return !!this.playerService.player;
  }

  get players() {
    return this.gameCollectionService.gameState$.pipe(
      map(game => game.players)
    );
  }

  startLobby() {
    this.gameService.startLobby();
  }
}
