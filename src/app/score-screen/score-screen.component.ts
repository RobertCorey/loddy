import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import { map } from 'rxjs/operators';
import { ITotalScore } from '../types/Game';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-score-screen',
  templateUrl: './score-screen.component.html',
  styleUrls: ['./score-screen.component.scss']
})
export class ScoreScreenComponent implements OnInit {
  totalScores$: Observable<ITotalScore[]>;
  constructor(
    private gs: GameService,
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
    this.totalScores$ = this.gameCollectionService.gameClass$.pipe(
      map(game => game.totalScores.reverse())
    );
  }
}
