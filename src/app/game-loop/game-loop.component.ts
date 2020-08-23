import { Component, OnInit } from "@angular/core";
import { GameService } from "../game.service";
import { PlayerService } from "../services/player.service";
import { GameCollectionService } from "../services/game-collection.service";
import { map, take, distinctUntilKeyChanged } from "rxjs/operators";
import { combineLatest, Observable, BehaviorSubject } from "rxjs";
import { IGameQuestion } from "../types/IGameQuestion";
import { IPlayer } from "../types/IPlayer";
import { IAnswer } from "../types/IAnswer";
import { firestore } from "firebase";

@Component({
  selector: "app-game-loop",
  templateUrl: "./game-loop.component.html",
  styleUrls: ["./game-loop.component.css"],
})
export class GameLoopComponent implements OnInit {
  currentQuestion$: Observable<IGameQuestion>;
  currentBrain$: Observable<IPlayer>;
  localPlayerIsBrain$: Observable<boolean>;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  answerFormVisible$: Observable<boolean>;
  constructor(
    private gs: GameService,
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {
    (window as any).foo = this;
  }

  ngOnInit() {
    this.currentQuestion$ = this.gameCollectionService.gameClass$.pipe(
      map((game) => game.currentQuestion),
      distinctUntilKeyChanged("id")
    );

    this.currentQuestion$.subscribe((_) => this.updateLoading(false));

    this.currentBrain$ = this.gameCollectionService.gameClass$.pipe(
      map((game) => game.getPlayerById(game.currentQuestion.brainId))
    );
    this.localPlayerIsBrain$ = this.gameCollectionService.gameClass$.pipe(
      map((game) => game.isPlayerBrain(this.playerService.player.id))
    );

    this.answerFormVisible$ = combineLatest(
      this.gameCollectionService.gameClass$.pipe(
        map((game) => {
          return !game.playerHasAnsweredCurrentQuestion(
            this.playerService.player.id
          );
        })
      ),
      this.loading$
    ).pipe(
      map(([question, loading]) => {
        return question && !loading;
      })
    );
  }
  updateLoading(status: boolean) {
    this.loading$.next(status);
  }
  handleAnswer($event) {
    this.updateLoading(true);
    this.currentQuestion$.pipe(take(1)).subscribe((question) => {
      const answer: IAnswer = {
        playerId: this.playerService.player.id,
        questionId: question.id,
        text: $event,
      };
      this.gameCollectionService.update({
        answers: firestore.FieldValue.arrayUnion(answer),
      });
    });
  }

  get playersYetToAnswer() {
    return this.gameCollectionService.gameClass$.pipe(
      map((game) => game.getPlayersYetToAnswerQuestion())
    );
  }
}
