import { IPlayer } from "./IPlayer";
import { IGameQuestion, getXMockGameQuestions } from "./IGameQuestion";
import { IAnswer } from "./IAnswer";
import { IScore } from "./IScore";

export interface IGame {
  status:
    | "LOBBY"
    | "BRAIN_QUESTIONS_RULES"
    | "BRAIN_QUESTIONS"
    | "GAME_LOOP"
    | "GAME_LOOP_RULES"
    | "SCORE_SCREEN"
    | "FINISHED";
  createdAt: number;
  players: IPlayer[];
  questions?: IGameQuestion[];
  answers?: IAnswer[];
  scores?: IScore[];
  // This can also be used as the current "round"
  activeQuestionId?: string;
  answeredQuestions?: string[];
  nextLobby?: string;
  // which question bank the host picked when creating the game
  questionPool?: "all" | "corporate";
  // answer-timer state: the runner stamps a deadline (epoch ms) per phase.
  // answerDeadlineKey is the activeQuestionId during GAME_LOOP, or "BRAIN".
  answerDeadline?: number;
  answerDeadlineKey?: string;
  // per-game overrides for the timer lengths (used by the e2e tests)
  answerSeconds?: number;
  brainSeconds?: number;
  // which player's tab is driving the state machine, and its liveness beacon;
  // any player may claim the runner role once the heartbeat goes stale
  runnerId?: string;
  runnerHeartbeat?: number;
  // Firestore TTL field: old game docs get garbage-collected
  expireAt?: any;
}

export const IGameBrainQuestionsAllAnswered: IGame = {
  status: "BRAIN_QUESTIONS",
  createdAt: 0,
  players: [],
  questions: [
    { brainId: "1", id: "2", text: "foo", unit: "bar", sfw: true },
    { brainId: "2", id: "3", text: "foo", unit: "bar", sfw: true },
  ],
  answers: [
    { playerId: "1", questionId: "2", text: "foobar" },
    { playerId: "2", questionId: "2", text: "foobar" },
  ],
};
