import { Game, ITotalScore } from "./Game";
import { firstRound } from "src/mocks/game/score-screen/first-round";
import { IGame } from "./IGame";
import { mockPlayerList3 } from "./IPlayer";
import { IScore } from "./IScore";

describe("Game", () => {
  let game: Game;
  beforeEach(() => {});
  describe("#scores", () => {
    it("should handle 2 different answers", () => {
      let result = new Game(firstRound as IGame).currentRoundScores;
      expect(result[0].score).toEqual(0);
      expect(result[1].score).toEqual(100);
    });

    it("should handle dupe answers", () => {
      const dupeAnswer = {
        playerId: "666",
        questionId: "0",
        text: "100",
      };
      let withDupe = {
        ...firstRound,
        answers: [...firstRound.answers, dupeAnswer],
      };
      let result = new Game(withDupe as IGame).currentRoundScores;
      expect(result[0].score).toEqual(0);
      expect(result[1].score).toEqual(0);
      expect(result[2].score).toEqual(100);
    });
  });
  fdescribe("#totalScores", () => {
    let result: ITotalScore[];
    beforeEach(() => {
      const mock = {
        players: mockPlayerList3,
        scores: [
          { playerId: 1, score: 100 },
          { playerId: 1, score: 200 },
        ],
      };
      result = new Game(mock as any).totalScores;
    });

    it("should be of length 3", () => {
      expect(result.length).toEqual(3);
    });
    it("should get player 1s score ", () => {
      expect(result.find((ts) => ts.player.id === "1").score).toEqual(300);
    });
    it("players with no score records should get 0", () => {
      expect(result.find((ts) => ts.player.id === "2").score).toEqual(0);
    });
  });
});
