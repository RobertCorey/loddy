import { IGame } from './IGame';
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
    this._game.questions.filter(question => question.brainId === playerId);
  }
}
