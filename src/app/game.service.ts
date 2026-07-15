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
import { from, Observable, Subscription, timer } from "rxjs";

// Answer-timer defaults; a game doc can override them (the e2e tests do)
const GUESS_SECONDS = 30;
const BRAIN_SECONDS = 90;
// grace so an answer submitted at the buzzer (or from a client with a
// slightly-off clock) beats the runner's blank-fill
const TIMER_GRACE_MS = 3000;

// Runner liveness: the driving tab beats every HEARTBEAT_MS. A watchdog
// claims the role when the beat VALUE hasn't changed for RUNNER_STALE_MS of
// its own local time — clocks are never compared across devices.
const HEARTBEAT_MS = 5000;
const RUNNER_STALE_MS = 25000;

const IN_PROGRESS_STATUSES: IGame["status"][] = [
  "BRAIN_QUESTIONS_RULES",
  "BRAIN_QUESTIONS",
  "GAME_LOOP_RULES",
  "GAME_LOOP",
  "SCORE_SCREEN",
];

@Injectable({
  providedIn: "root",
})
export class GameService {
  gameRef: any;
  mock: boolean;
  /** the gameState$ stream the runner is currently driving, if any */
  private runnerBoundTo: Observable<IGame>;
  private runnerSub: Subscription;
  private watchdogSub: Subscription;
  private heartbeatSub: Subscription;
  private takeoverInFlight = false;
  private scheduledTimerKeys = new Set<string>();
  /** watchdog state: the last heartbeat value seen, and when (local clock) */
  private lastSeenBeat: number = null;
  private lastBeatChangeAt = 0;
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
          return this.qs.getGameQuestions(
            game.players,
            game.questionPool || "all"
          );
        })
      )
      .subscribe((questions) => {
        if (this.playerService.isHost || this.mock) {
          this.gameCollectionService.update({
            status: "BRAIN_QUESTIONS_RULES",
            questions,
            answers: [],
            runnerId: this.playerService.player.id,
            runnerHeartbeat: Date.now(),
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
   * Binds this tab to the game's state machine. Safe (and intended) to call
   * on EVERY player's tab: only the tab whose player id matches the game's
   * runnerId acts; everyone else runs a watchdog that claims the runner role
   * if its heartbeat goes stale (e.g. the host closed their laptop).
   */
  initGameRunner() {
    const stream = this.gameCollectionService.gameState$;
    if (this.runnerBoundTo === stream) {
      return; // already bound to this game
    }
    this.runnerBoundTo = stream;
    if (this.runnerSub) {
      this.runnerSub.unsubscribe();
    }
    if (this.watchdogSub) {
      this.watchdogSub.unsubscribe();
    }
    this.ensureHeartbeat(false);
    this.scheduledTimerKeys.clear();
    this.lastSeenBeat = null;
    this.lastBeatChangeAt = 0;
    this.runnerSub = stream.subscribe((game: IGame) => {
      if (!game) {
        return;
      }
      const driving = this.isRunner(game);
      this.ensureHeartbeat(
        driving && IN_PROGRESS_STATUSES.includes(game.status)
      );
      if (!driving) {
        return;
      }
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
    // The watchdog needs its own clock: when the runner dies there are no
    // more snapshot emissions to react to.
    this.watchdogSub = timer(HEARTBEAT_MS, HEARTBEAT_MS).subscribe(() => {
      stream.pipe(take(1)).subscribe((game) => this.maybeTakeOver(game));
    });
  }

  /**
   * Restarts the state machine after a page refresh. Without this a
   * runner reload would stall the game forever: nothing else advances statuses.
   */
  resumeGameRunner() {
    this.initGameRunner();
  }

  private isRunner(game: IGame): boolean {
    if (this.mock) {
      return true;
    }
    const me = this.playerService.player;
    if (!game.runnerId) {
      // games started before runner election existed: the host drives
      return this.playerService.isHost;
    }
    return !!(me && me.id === game.runnerId);
  }

  private maybeTakeOver(game: IGame) {
    if (!game || !IN_PROGRESS_STATUSES.includes(game.status)) {
      return;
    }
    if (this.isRunner(game) || this.takeoverInFlight) {
      return;
    }
    const me = this.playerService.player;
    if (!me || !me.id || !game.players.some((p) => p.id === me.id)) {
      return; // observers don't drive games
    }
    // Staleness = the heartbeat VALUE hasn't changed for RUNNER_STALE_MS of
    // OUR OWN elapsed time. Never compare another device's clock to ours: a
    // skewed clock would hijack a healthy runner or block a takeover.
    const beat = game.runnerHeartbeat || 0;
    if (beat !== this.lastSeenBeat) {
      this.lastSeenBeat = beat;
      this.lastBeatChangeAt = Date.now();
      return;
    }
    if (Date.now() - this.lastBeatChangeAt < RUNNER_STALE_MS) {
      return;
    }
    this.takeoverInFlight = true;
    // fresh reign, fresh timers: cleared BEFORE the claim so the first
    // post-claim snapshot re-arms everything exactly once
    this.scheduledTimerKeys.clear();
    this.gameCollectionService
      .claimRunner(me.id, beat)
      .catch(() => false)
      .then(() => {
        this.takeoverInFlight = false;
      });
  }

  private ensureHeartbeat(active: boolean) {
    if (active && !this.heartbeatSub) {
      this.heartbeatSub = timer(0, HEARTBEAT_MS).subscribe(() => {
        this.gameCollectionService
          .update({ runnerHeartbeat: Date.now() })
          .catch(() => {});
      });
    } else if (!active && this.heartbeatSub) {
      this.heartbeatSub.unsubscribe();
      this.heartbeatSub = null;
    }
  }

  /**
   * A state-machine write that only commits if this tab still holds the
   * runner role and the game is still in the expected state — checked
   * against a transactional (server-fresh) read, not our local cache.
   */
  private fencedUpdate(
    expected: {
      status: IGame["status"];
      activeQuestionId?: string;
      answerDeadlineKey?: string;
    },
    compute: (fresh: IGame) => { [field: string]: any } | null
  ) {
    const me = this.playerService.player;
    this.gameCollectionService
      .runnerUpdate((me && me.id) || null, expected, compute)
      .catch(() => {}); // offline or contended: someone else will drive
  }

  /**
   * Runs `action` once, `ms` after this game state is first seen. Snapshots
   * re-emit (local write + server ack), so a naive timer per emission stacks
   * duplicates; the key dedupes them. The callback no-ops if this tab has
   * since bound to a different game (stale timers must never cross games).
   */
  private scheduleTransition(key: string, ms: number, action: () => void) {
    if (this.scheduledTimerKeys.has(key)) {
      return;
    }
    this.scheduledTimerKeys.add(key);
    const boundStream = this.runnerBoundTo;
    timer(ms).subscribe(() => {
      if (boundStream !== this.runnerBoundTo) {
        return; // this tab moved on to a different game
      }
      action();
    });
  }

  /**
   * Stamps an answer deadline on the game doc (so every client can render a
   * countdown) and arms the runner-side timer that force-advances the game
   * when it expires. A resumed or newly elected runner keeps the original
   * deadline instead of granting extra time.
   */
  private armAnswerTimer(
    game: IGame,
    key: string,
    deadlineKey: string,
    seconds: number,
    onExpired: () => void
  ) {
    if (this.scheduledTimerKeys.has(key)) {
      return;
    }
    this.scheduledTimerKeys.add(key);
    const deadline =
      game.answerDeadlineKey === deadlineKey && game.answerDeadline
        ? game.answerDeadline
        : Date.now() + seconds * 1000;
    if (game.answerDeadlineKey !== deadlineKey) {
      this.gameCollectionService.update({
        answerDeadline: deadline,
        answerDeadlineKey: deadlineKey,
      } as Partial<IGame>);
    }
    const boundStream = this.runnerBoundTo;
    timer(Math.max(0, deadline - Date.now()) + TIMER_GRACE_MS).subscribe(
      () => {
        if (boundStream !== this.runnerBoundTo) {
          return; // this tab moved on to a different game
        }
        onExpired();
      }
    );
  }

  handleGameLoopRulesStatus(game: IGame) {
    this.scheduleTransition("GAME_LOOP_RULES", 10000, () => {
      this.fencedUpdate({ status: "GAME_LOOP_RULES" }, () => ({
        status: "GAME_LOOP",
      }));
    });
  }
  handleBrainQuestionsRulesStatus(game: IGame) {
    this.scheduleTransition("BRAIN_QUESTIONS_RULES", 10000, () => {
      this.fencedUpdate({ status: "BRAIN_QUESTIONS_RULES" }, () => ({
        status: "BRAIN_QUESTIONS",
      }));
    });
  }
  handleScoreScreenStatus(game: IGame) {
    const questionId = game.activeQuestionId;
    this.scheduleTransition(`SCORE_SCREEN:${questionId}`, 12000, () => {
      this.fencedUpdate(
        { status: "SCORE_SCREEN", activeQuestionId: questionId },
        (fresh) => {
          const nextQuestionId = new Game(fresh).getNextQuestionId();
          if (nextQuestionId) {
            return { activeQuestionId: nextQuestionId, status: "GAME_LOOP" };
          }
          return { status: "FINISHED" };
        }
      );
    });
  }

  handleGameLoopStatus(game: IGame) {
    const gameInstance = new Game(game);
    const playersLeftCount = gameInstance.getPlayersYetToAnswerQuestion()
      .length;
    if (playersLeftCount === 0) {
      const questionId = game.activeQuestionId;
      this.fencedUpdate(
        { status: "GAME_LOOP", activeQuestionId: questionId },
        (fresh) => {
          const freshGame = new Game(fresh);
          if (freshGame.getPlayersYetToAnswerQuestion().length > 0) {
            return null; // recheck against server truth before scoring
          }
          return {
            answeredQuestions: firebase.firestore.FieldValue.arrayUnion(
              questionId
            ),
            status: "SCORE_SCREEN",
            scores: firebase.firestore.FieldValue.arrayUnion(
              ...freshGame.currentRoundScores
            ),
          };
        }
      );
      return;
    }
    // Stragglers get a blank answer (worst rank, zero points) at the buzzer
    // so one closed tab can't hang the whole game. The fenced re-read means
    // an answer that lands at the buzzer wins over the blank.
    const questionId = game.activeQuestionId;
    this.armAnswerTimer(
      game,
      `ANSWER_TIMER:${questionId}`,
      questionId,
      game.answerSeconds || GUESS_SECONDS,
      () => {
        this.fencedUpdate(
          {
            status: "GAME_LOOP",
            activeQuestionId: questionId,
            answerDeadlineKey: questionId,
          },
          (fresh) => {
            const late = new Game(fresh).getPlayersYetToAnswerQuestion();
            if (!late.length) {
              return null;
            }
            return {
              answers: firebase.firestore.FieldValue.arrayUnion(
                ...late.map((p) => ({
                  playerId: p.id,
                  questionId,
                  text: "",
                }))
              ),
            };
          }
        );
      }
    );
  }

  handleBrainQuestionsStatus(game: IGame) {
    const unansweredBrainQuestions = (current: IGame) =>
      current.questions.filter(
        (question) =>
          !current.answers.some(
            (answer) =>
              answer.playerId === question.brainId &&
              question.id === answer.questionId
          )
      );
    if (unansweredBrainQuestions(game).length === 0) {
      this.fencedUpdate({ status: "BRAIN_QUESTIONS" }, (fresh) => {
        if (unansweredBrainQuestions(fresh).length > 0) {
          return null;
        }
        return {
          status: "GAME_LOOP_RULES",
          activeQuestionId: fresh.questions[0].id,
          answeredQuestions: [],
          scores: [],
        } as Partial<IGame>;
      });
      return;
    }
    // A brain who never answers gets their questions dropped at the buzzer:
    // a made-up "truth" is worse than a slightly shorter game.
    this.armAnswerTimer(
      game,
      "BRAIN_TIMER",
      "BRAIN",
      game.brainSeconds || BRAIN_SECONDS,
      () => {
        this.fencedUpdate(
          { status: "BRAIN_QUESTIONS", answerDeadlineKey: "BRAIN" },
          (fresh) => {
            const unanswered = unansweredBrainQuestions(fresh);
            if (!unanswered.length) {
              return null;
            }
            const remaining = fresh.questions.filter(
              (q) => !unanswered.includes(q)
            );
            if (remaining.length) {
              return { questions: remaining };
            }
            // everyone bailed; there is no game left to play
            return { status: "FINISHED" };
          }
        );
      }
    );
  }
}
