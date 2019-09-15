import { IPlayer } from './IPlayer';

export interface IGame {
  status: 'LOBBY' | 'BRAIN_QUESTIONS' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: number;
  players: IPlayer[];
  questions?: any[];
  answers?: any[];
}
