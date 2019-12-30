import { Game } from './Game';
import { firstRound } from 'src/mocks/game/score-screen/first-round';
import { IGame } from './IGame';

fdescribe('Game', () => {
  let game: Game;
  beforeEach(() => {});
  describe('#scores', () => {
    it('should handle 2 different answers', () => {
      let result = new Game(firstRound as IGame).scores;
      expect(result[0].score).toEqual(0);
      expect(result[1].score).toEqual(100);
    });

    it('should handle dupe answers', () => {
      const dupeAnswer = {
        playerId: '666',
        questionId: '0',
        text: '100'
      };
      let withDupe = {
        ...firstRound,
        answers: [...firstRound.answers, dupeAnswer]
      };
      let result = new Game(withDupe as IGame).scores;
      expect(result[0].score).toEqual(0);
      expect(result[1].score).toEqual(0);
      expect(result[2].score).toEqual(100);
      console.log(result);
    });
  });
});
