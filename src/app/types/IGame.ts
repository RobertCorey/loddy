import { IPlayer } from './IPlayer';
import { IGameQuestion } from './IGameQuestion';

export interface IGame {
  status: 'LOBBY' | 'BRAIN_QUESTIONS' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: number;
  players: IPlayer[];
  questions?: IGameQuestion[];
  answers?: any[];
}
