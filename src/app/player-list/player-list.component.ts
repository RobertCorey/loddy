import { Component, OnInit, Input } from '@angular/core';
import { IPlayer } from '../types/IPlayer';
import { GameService } from '../game.service';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ITotalScore } from '../types/Game';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  public players$: Observable<IPlayer[]>;
  public state$: Observable<ITotalScore[]>;
  constructor(
    private gameService: GameService,
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
    this.players$ = this.gameCollectionService.gameState$.pipe(
      map(game => game.players)
    );

    this.state$ = this.gameCollectionService.gameClass$.pipe(
      map(game => game.sortedTotalScores),
      tap(console.log)
    );
  }

  getPlayerCardClass(player: IPlayer) {
    return player.id === this.playerService.player.id ? 'local' : '';
  }
}
