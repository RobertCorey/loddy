import { Component, OnInit } from '@angular/core';
import { IGameQuestion } from '../types/IGameQuestion';
import { GameService } from '../game.service';
import { IAnswer } from '../types/IAnswer';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-answer-brain-questions',
  templateUrl: './answer-brain-questions.component.html',
  styleUrls: ['./answer-brain-questions.component.css']
})
export class AnswerBrainQuestionsComponent implements OnInit {
  private unansweredBrainQuestions$;
  public currentQuestion$: Observable<IGameQuestion>;
  public loading: boolean;
  constructor(
    private gs: GameService,
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.playerService.player = {
      name: 'a',
      id: 'u1jO_U1P',
      host: true
    };
    this.unansweredBrainQuestions$ = this.gameCollectionService.gameClass$.pipe(
      map(game =>
        game.getUnansweredBrainQuestions(this.playerService.player.id)
      )
    );
    this.currentQuestion$ = this.unansweredBrainQuestions$.pipe(
      map(questions => questions[0]),
      distinctUntilChanged()
    );

    this.currentQuestion$.subscribe(() => {
      this.loading = false;
    });
    this.gameCollectionService.gameState$.subscribe(console.log);
  }

  handleAnswer($event) {
    const answer: IAnswer = {
      playerId: this.playerService.player.id,
      ...$event
    };
    this.loading = true;
    this.gs.addAnswer([answer]);
  }
}
