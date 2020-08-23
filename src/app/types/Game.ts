import { IGame } from "./IGame";
import { debug } from "util";
import { IPlayer } from "./IPlayer";
import { IScore } from "./IScore";
import { IAnswer } from "./IAnswer";
export interface ITotalScore {
  player: IPlayer;
  score: number;
}

export class Game {
  constructor(private _game: IGame) {}

  get canGameBeStarted() {
    return this._game.status === "LOBBY" && this._game.players.length >= 3;
  }

  get status() {
    return this._game.status;
  }

  get players() {
    return this._game.players;
  }
  isPlayerHost(playerId: string) {
    const host = this._game.players.find((player) => player.host);
    return host.id === playerId;
  }

  getPlayersBrainQuestions(playerId: string) {
    return this._game.questions.filter(
      (question) => question.brainId === playerId
    );
  }

  getUnansweredBrainQuestions(playerId: string) {
    const possible = this.getPlayersBrainQuestions(playerId);
    const answers = this.getPlayersAnswers(playerId);
    return possible.filter((question) => {
      return !answers.find((answer) => answer.questionId === question.id);
    });
  }

  getPlayersAnswers(playerId: IPlayer["id"]) {
    return this._game.answers.filter((answer) => answer.playerId === playerId);
  }

  get currentQuestion() {
    const question = this._game.questions.find(
      (q) => q.id === this._game.activeQuestionId
    );
    return question;
  }

  isPlayerBrain(playerId: string): boolean {
    return this.currentQuestion.brainId === playerId;
  }
  getPlayerById(playerID): IPlayer {
    return this._game.players.find((p) => p.id === playerID);
  }

  getAnswersByQuestionId(questionId: string) {
    return this._game.answers.filter((a) => a.questionId === questionId);
  }

  playerHasAnsweredCurrentQuestion(playerID: IPlayer["id"]) {
    return this.getAnswersByQuestionId(this.currentQuestion.id).find(
      (answer) => answer.playerId === playerID
    );
  }
  /**
   * returns if the player has answered all of their brain questions,
   * used to display status during brain questions stage
   * @param playerId
   */
  playerHasAnsweredAllBrainQuestions(playerId: IPlayer["id"]): boolean {
    return (
      this.getPlayersAnswers(playerId).length >=
      this.getPlayersBrainQuestions(playerId).length
    );
  }

  getPlayersYetToAnswerQuestion() {
    const answerPlayerId = this.getAnswersByQuestionId(
      this.currentQuestion.id
    ).map((a) => a.playerId);
    return this._game.players.filter((p) => !answerPlayerId.includes(p.id));
  }
  getNextQuestionId(): string | false {
    const potentialQuestions = this._game.questions.filter(
      (q) => !this._game.answeredQuestions.includes(q.id)
    );
    if (potentialQuestions.length > 0) {
      return potentialQuestions[0].id;
    } else {
      return false;
    }
  }
  /**
   * Intended for use during score screen. Calculates the score for the current round
   */
  get currentRoundScores(): IScore[] {
    return this.currentRoundScoreInfo.map((scoreInfo) => {
      const { playerId, score, questionId } = scoreInfo;
      return { playerId, score, questionId };
    });
  }
  /**
   * Gets the absolute distance between the players answers and the brains answer
   * and appends it to the answer object, then sorts based on that value
   */
  get currentRoundScoreInfo() {
    const answersWithAbsoluteDistance = this.getAnswersWithAbsoluteDistance();
    const withScoreInfo = this.getAnswersWithPositionAndScore(
      answersWithAbsoluteDistance
    );
    const withPlayer = withScoreInfo.map((si) => {
      return { ...si, player: this.getPlayerById(si.playerId) };
    });
    const totalScores = this.groupedScoresByPlayerId;
    const withTotalScore = withPlayer.map((wp) => ({
      ...wp,
      totalScore: totalScores[wp.playerId],
    }));
    return withTotalScore;
  }

  private getAnswersWithPositionAndScore(
    answersWithAbsoluteDistance: {
      absoluteDistance: number;
      signedDistance: number;
      isBrain: boolean;
      playerId: string;
      questionId: string;
      text: string;
    }[]
  ) {
    let position = -1;
    let last = -Infinity;
    const pointMultiplier = 10;
    const withScoreInfo = answersWithAbsoluteDistance.map((a) => {
      if (a.isBrain) {
        return { ...a, position: 0, score: 0 };
      }
      if (a.absoluteDistance > last) {
        last = a.absoluteDistance;
        position++;
      }
      return {
        ...a,
        position,
        score:
          (answersWithAbsoluteDistance.length - position) * pointMultiplier,
      };
    });
    return withScoreInfo;
  }

  private getAnswersWithAbsoluteDistance() {
    const brainAnswer = this.brainAnswerToCurrentQuestion;
    const nonBrainAnswers = this.nonBrainAnswersToCurrentQuestion;
    const abs = nonBrainAnswers.map((a) => {
      return {
        ...a,
        absoluteDistance: Math.abs(+brainAnswer.text - +a.text),
        signedDistance: +brainAnswer.text - +a.text,
        isBrain: false,
      };
    });
    const withBrain = [
      ...abs,
      { ...brainAnswer, absoluteDistance: 0, isBrain: true, signedDistance: 0 },
    ].sort((a, b) => a.absoluteDistance - b.absoluteDistance);
    return withBrain;
  }

  get totalScores(): ITotalScore[] {
    return this._game.players.map((player) => {
      return { player, score: this.groupedScoresByPlayerId[player.id] || 0 };
    });
  }
  // sorted from highest score to lowest
  get sortedTotalScores(): ITotalScore[] {
    const unsorted = this.totalScores;
    unsorted.sort((a, b) => b.score - a.score);
    return unsorted;
  }

  private get groupedScoresByPlayerId() {
    if (!this._game.scores) {
      return [];
    }
    return this._game.scores.reduce((acc, score) => {
      return {
        ...acc,
        [score.playerId]: (acc[score.playerId] || 0) + score.score,
      };
    }, {});
  }

  get nonBrainAnswersToCurrentQuestion() {
    return this.currentAnswers.filter(
      (q) => q.playerId !== this.currentQuestion.brainId
    );
  }

  get brainAnswerToCurrentQuestion() {
    const answers = this.currentAnswers;
    return answers.find((q) => q.playerId === this.currentQuestion.brainId);
  }

  private get currentAnswers() {
    return this.getAnswersByQuestionId(this.currentQuestion.id);
  }
}
