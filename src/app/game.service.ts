import { Injectable } from "@angular/core";

import { IGame } from "./types/IGame";
import { IPlayer } from "./types/IPlayer";
import firebase from "firebase";

import * as shortid from "shortid";
import { QuestionService } from "./question.service";
import { IAnswer } from "./types/IAnswer";
import { Game } from "./types/Game";
import { GameCollectionService } from "./services/game-collection.service";
import { take, switchMap } from "rxjs/operators";
import { PlayerService } from "./services/player.service";
import { timer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GameService {
  gameRef: any;
  mock: boolean;
  gameRunnerFlag: boolean;
  constructor(
    private qs: QuestionService,
    private gameCollectionService: GameCollectionService,
    private playerService: PlayerService
  ) {
    (window as any).foo = this;
  }

  join(player: { name: string }) {
    return this.gameCollectionService.gameState$.pipe(
      take(1),
      switchMap((game) => {
        const playerWithId = {
          ...player,
          id: shortid.generate(),
          host: !game.players.length,
        };
        this.playerService.player = playerWithId;
        return this.gameCollectionService.update({
          players: firebase.firestore.FieldValue.arrayUnion(playerWithId),
        });
      })
    );
  }

  startLobby() {
    return this.gameCollectionService.gameState$
      .pipe(
        take(1),
        switchMap((game) => {
          return this.qs.getGameQuestions(
            game.players,
            game.players.length * 3
          );
        })
      )
      .subscribe((questions) => {
        if (this.playerService.isHost || this.mock) {
          this.gameCollectionService.update({
            status: "BRAIN_QUESTIONS_RULES",
            questions,
            answers: [],
          } as Partial<IGame>);
          this.initGameRunner();
        }
      });
  }

  addAnswer(answers: IAnswer[]) {
    return this.gameCollectionService.update({
      answers: firebase.firestore.FieldValue.arrayUnion(...answers),
    });
  }
  /**
   * inits observable to gameState changes depending on the game status. Should only ever be active on one client.
   * needs to eventually moved
   */
  initGameRunner() {
    if (this.gameRunnerFlag) {
      throw Error("game runner already started");
    }
    this.gameRunnerFlag = true;
    this.gameCollectionService.gameState$.subscribe((game: IGame) => {
      switch (game.status) {
        case "BRAIN_QUESTIONS_RULES":
          this.handleBrainQuestionsRulesStatus(game);
          break;
        case "BRAIN_QUESTIONS":
          this.handleBrainQuestionsStatus(game);
          break;
        case "GAME_LOOP_RULES":
          this.handleGameLoopRulesStatus(game);
          break;
        case "GAME_LOOP":
          this.handleGameLoopStatus(game);
          break;
        case "SCORE_SCREEN":
          this.handleScoreScreenStatus(game);
          break;
        default:
          break;
      }
    });
  }
  handleGameLoopRulesStatus(game: IGame) {
    timer(10000).subscribe((_) => {
      this.gameCollectionService.update({
        status: "GAME_LOOP",
      });
    });
  }
  handleBrainQuestionsRulesStatus(game: IGame) {
    timer(10000).subscribe((_) => {
      this.gameCollectionService.update({
        status: "BRAIN_QUESTIONS",
      });
    });
  }
  handleScoreScreenStatus(game: IGame) {
    const gameInstance = new Game(game);
    timer(12000).subscribe((_) => {
      const nextQuestionId = gameInstance.getNextQuestionId();
      if (nextQuestionId) {
        this.gameCollectionService.update({
          activeQuestionId: nextQuestionId,
          status: "GAME_LOOP",
        });
      } else {
        this.gameCollectionService.update({
          status: "FINISHED",
        });
      }
    });
  }

  handleGameLoopStatus(game: IGame) {
    const gameInstance = new Game(game);
    const playersLeftCount = gameInstance.getPlayersYetToAnswerQuestion()
      .length;
    if (playersLeftCount === 0) {
      const scores = gameInstance.currentRoundScores;
      this.gameCollectionService.update({
        answeredQuestions: firebase.firestore.FieldValue.arrayUnion(
          game.activeQuestionId
        ),
        status: "SCORE_SCREEN",
        scores: firebase.firestore.FieldValue.arrayUnion(...scores),
      });
    }
  }

  handleBrainQuestionsStatus(game: IGame) {
    const numberOfQuestionsWithBrainAnswers = game.questions.filter(
      (question) =>
        game.answers.some(
          (answer) =>
            answer.playerId === question.brainId &&
            question.id === answer.questionId
        )
    ).length;
    if (numberOfQuestionsWithBrainAnswers === game.questions.length) {
      this.gameCollectionService.update({
        status: "GAME_LOOP_RULES",
        activeQuestionId: game.questions[0].id,
        answeredQuestions: [],
        scores: [],
      } as Partial<IGame>);
    }
  }
}
