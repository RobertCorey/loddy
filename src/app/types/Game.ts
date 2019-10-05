import { IGame } from './IGame';
import { debug } from 'util';
import { IPlayer } from './IPlayer';
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
}
