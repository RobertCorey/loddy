import { Component, OnInit } from "@angular/core";
import { IGameQuestion } from "../types/IGameQuestion";
import { GameService } from "../game.service";
import { IAnswer } from "../types/IAnswer";
import { PlayerService } from "../services/player.service";
import { GameCollectionService } from "../services/game-collection.service";
import { map, distinctUntilChanged, take } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-answer-brain-questions",
  templateUrl: "./answer-brain-questions.component.html",
  styleUrls: ["./answer-brain-questions.component.css"],
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
    this.unansweredBrainQuestions$ = this.gameCollectionService.gameClass$.pipe(
      map((game) =>
        game.getUnansweredBrainQuestions(this.playerService.player.id)
      )
    );
    this.currentQuestion$ = this.unansweredBrainQuestions$.pipe(
      map((questions) => questions[0]),
      distinctUntilChanged()
    );

    this.currentQuestion$.subscribe(() => {
      this.loading = false;
    });
  }

  handleAnswer($event) {
    this.currentQuestion$.pipe(take(1)).subscribe((question) => {
      const answer: IAnswer = {
        questionId: question.id,
        playerId: this.playerService.player.id,
        text: $event,
      };
      this.loading = true;
      this.gs.addAnswer([answer]);
    });
  }
}
