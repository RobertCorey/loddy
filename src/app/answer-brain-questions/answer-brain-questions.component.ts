import { Component, OnInit, Input } from '@angular/core';
import { IGameQuestion } from '../types/IGameQuestion';
import { GameService } from '../game.service';
import { IAnswer } from '../types/IAnswer';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IQuestion } from '../types/IQuestion';

@Component({
  selector: 'app-answer-brain-questions',
  templateUrl: './answer-brain-questions.component.html',
  styleUrls: ['./answer-brain-questions.component.css']
})
export class AnswerBrainQuestionsComponent implements OnInit {
  private unansweredBrainQuestions$;
  public currentQuestion$: Observable<IQuestion>;
  constructor(
    private gs: GameService,
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
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
      map(questions => questions[0])
    );

    // this.currentQuestion$.subscribe(console.log);
  }

  // get currentBrainQuestion$() {
  //No this.game here
  // return this.game.getPlayersBrainQuestions(this.localPlayer.id);
  // }

  submit(answers: IAnswer[]) {
    // this.active = false;
    // this.gs.addAnswer(answers);
  }
  handleAnswer($event) {}
}
