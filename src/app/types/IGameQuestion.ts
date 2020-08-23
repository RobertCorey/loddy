import { IQuestion, getXMockQuestions } from "./IQuestion";
import { IPlayer } from "./IPlayer";

export interface IGameQuestion extends IQuestion {
  brainId: IPlayer["id"];
  id: string;
}

export const getXMockGameQuestions = (num): IGameQuestion[] => {
  return getXMockQuestions(num).map(
    (question, index): IGameQuestion => {
      return { ...question, brainId: index.toString(), id: index.toString() };
    }
  );
};
