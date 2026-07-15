import { Injectable } from "@angular/core";

import { IGame } from "./types/IGame";
import firebase from "firebase";

import * as shortid from "shortid";
import { QuestionService } from "./question.service";
import { IAnswer } from "./types/IAnswer";
import { Game } from "./types/Game";
import { GameCollectionService } from "./services/game-collection.service";
import { take, switchMap } from "rxjs/operators";
import { PlayerService } from "./services/player.service";
import { from, Observable, timer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GameService {
  gameRef: any;
  mock: boolean;
  /** the gameState$ stream the runner is currently driving, if any */
  private runnerBoundTo: Observable<IGame>;
  private scheduledTimerKeys = new Set<string>();
  constructor(
    private qs: QuestionService,
    private gameCollectionService: GameCollectionService,
    private playerService: PlayerService
  ) {
    (window as any).foo = this;
  }

  join(player: { name: string }) {
    const name = (player.name || "").trim();
    const playerWithId = {
      name,
      id: shortid.generate(),
      host: false,
    };
    // The transaction decides who is host and enforces the lobby rules;
    // computing host from a client snapshot let two joiners both claim it.
    return from(this.gameCollectionService.joinGame(playerWithId)).pipe(
      switchMap((joined) => {
        this.playerService.setPlayer(joined);
        return from([joined]);
      })
    );
  }

  startLobby() {
    return this.gameCollectionService.gameState$
      .pipe(
        take(1),
        switchMap((game) => {
          if (game.status !== "LOBBY" && !this.mock) {
            return from([]); // double-click, or a stale button
          }
          return this.qs.getGameQuestions(game.players);
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
    const stream = this.gameCollectionService.gameState$;
    if (this.runnerBoundTo === stream) {
      return; // already driving this game
    }
    this.runnerBoundTo = stream;
    this.scheduledTimerKeys.clear();
    stream.subscribe((game: IGame) => {
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

  /**
   * Restarts the host's state machine after a page refresh. Without this a
   * host reload would stall the game forever: nothing else advances statuses.
   */
  resumeGameRunner() {
    this.initGameRunner();
  }

  /**
   * Runs `action` once, `ms` after this game state is first seen. Snapshots
   * re-emit (local write + server ack), so a naive timer per emission stacks
   * duplicates; the key dedupes them, and the status re-check after the delay
   * keeps a stale timer from yanking the game backwards.
   */
  private scheduleTransition(
    key: string,
    ms: number,
    expectedStatus: IGame["status"],
    action: (current: IGame) => void
  ) {
    if (this.scheduledTimerKeys.has(key)) {
      return;
    }
    this.scheduledTimerKeys.add(key);
    timer(ms).subscribe(() => {
      this.gameCollectionService.gameState$
        .pipe(take(1))
        .subscribe((current) => {
          if (current.status === expectedStatus) {
            action(current);
          }
        });
    });
  }

  handleGameLoopRulesStatus(game: IGame) {
    this.scheduleTransition("GAME_LOOP_RULES", 10000, "GAME_LOOP_RULES", () => {
      this.gameCollectionService.update({
        status: "GAME_LOOP",
      });
    });
  }
  handleBrainQuestionsRulesStatus(game: IGame) {
    this.scheduleTransition(
      "BRAIN_QUESTIONS_RULES",
      10000,
      "BRAIN_QUESTIONS_RULES",
      () => {
        this.gameCollectionService.update({
          status: "BRAIN_QUESTIONS",
        });
      }
    );
  }
  handleScoreScreenStatus(game: IGame) {
    this.scheduleTransition(
      `SCORE_SCREEN:${game.activeQuestionId}`,
      12000,
      "SCORE_SCREEN",
      (current) => {
        const nextQuestionId = new Game(current).getNextQuestionId();
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
      }
    );
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
