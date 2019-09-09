import { IQuestion } from './IQuestion';
import { IPlayer } from './IPlayer';

export interface IGameQuestion extends IQuestion {
  brainId: IPlayer['id'];
}
