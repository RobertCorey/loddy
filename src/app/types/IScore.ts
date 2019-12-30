import { IPlayer } from './IPlayer';
import { IQuestion } from './IQuestion';
import { IGameQuestion } from './IGameQuestion';
export interface IScore {
  playerId: IPlayer['id'];
  score: number;
  questionId: IGameQuestion['id'];
}
