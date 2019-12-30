import { Game } from './Game';
import { firstRound } from 'src/mocks/game/score-screen/first-round';
import { IGame } from './IGame';

fdescribe('Game', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game(firstRound as IGame);
  });
  describe('#scores', () => {
    let result;
    beforeEach(() => {
      result = game.scores;
    });
    it('should be created', () => {
      expect(result).toBeDefined();
    });
  });
});
