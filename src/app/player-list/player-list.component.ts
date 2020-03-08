import { Component, OnInit } from '@angular/core';
import { IPlayer } from '../types/IPlayer';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ITotalScore, Game } from '../types/Game';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  public players$: Observable<IPlayer[]>;
  public state$: Observable<ITotalScore[]>;
  game$: Observable<Game>;
  constructor(
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
    this.game$ = this.gameCollectionService.gameClass$;
    this.players$ = this.gameCollectionService.gameState$.pipe(
      map(game => game.players)
    );

    this.state$ = this.gameCollectionService.gameClass$.pipe(
      map(game => game.sortedTotalScores)
    );
  }

  getPlayerCardClass(player: IPlayer) {
    return player.id === this.playerService.player.id ? 'local' : '';
  }
}
