import { IGame } from './IGame';
import { debug } from 'util';
import { IPlayer } from './IPlayer';
import { IScore } from './IScore';
export class Game {
  constructor(private _game: IGame) {}

  get canGameBeStarted() {
    return this._game.status === 'LOBBY' && this._game.players.length >= 3;
  }

  isPlayerHost(playerId: string) {
    const host = this._game.players.find(player => player.host);
    return host.id === playerId;
  }

  getPlayersBrainQuestions(playerId: string) {
    return this._game.questions.filter(
      question => question.brainId === playerId
    );
  }

  getUnansweredBrainQuestions(playerId: string) {
    const possible = this.getPlayersBrainQuestions(playerId);
    const answers = this.getPlayersAnswers(playerId);
    return possible.filter(question => {
      return !answers.find(answer => answer.questionId === question.id);
    });
  }

  getPlayersAnswers(playerId: string) {
    return this._game.answers.filter(answer => answer.playerId === playerId);
  }

  get currentQuestion() {
    const question = this._game.questions.find(
      q => q.id === this._game.activeQuestionId
    );
    return question;
  }

  isPlayerBrain(playerId: string): boolean {
    return this.currentQuestion.brainId === playerId;
  }
  getPlayerById(playerID): IPlayer {
    return this._game.players.find(p => p.id === playerID);
  }

  getAnswersByQuestionId(questionId: string) {
    return this._game.answers.filter(a => a.questionId === questionId);
  }

  playerHasAnsweredCurrentQuestion(playerID) {
    return this.getAnswersByQuestionId(this.currentQuestion.id).find(
      answer => answer.playerId === playerID
    );
  }

  getPlayersYetToAnswerQuestion() {
    const answerPlayerId = this.getAnswersByQuestionId(
      this.currentQuestion.id
    ).map(a => a.playerId);
    return this._game.players.filter(p => !answerPlayerId.includes(p.id));
  }
  getNextQuestionId(): string | false {
    const potentialQuestions = this._game.questions.filter(
      q => !this._game.answeredQuestions.includes(q.id)
    );
    if (potentialQuestions.length > 0) {
      return potentialQuestions[0].id;
    } else {
      return false;
    }
  }
  get scores(): IScore[] {
    const brainAnswer = this.brainAnswerToCurrentQuestion;
    const nonBrainAnswers = this.nonBrainAnswersToCurrentQuestion;

    const abs = nonBrainAnswers.map(a => {
      return { ...a, abs: Math.abs(+brainAnswer.text - +a.text) };
    });
    abs.sort((a, b) => b.abs - a.abs);
    let scoreMultiple = -1;
    let last = Infinity;
    let scores = [];
    abs.forEach(ans => {
      if (ans.abs < last) {
        last = ans.abs;
        scoreMultiple++;
      }
      scores = [
        ...scores,
        { playerId: ans.playerId, score: scoreMultiple * 100 }
      ];
    });
    return scores;
  }

  get nonBrainAnswersToCurrentQuestion() {
    return this.currentAnswers.filter(
      q => q.playerId !== this.currentQuestion.brainId
    );
  }

  get brainAnswerToCurrentQuestion() {
    const answers = this.currentAnswers;
    return answers.find(q => q.playerId === this.currentQuestion.brainId);
  }

  private get currentAnswers() {
    return this.getAnswersByQuestionId(this.currentQuestion.id);
  }
}
