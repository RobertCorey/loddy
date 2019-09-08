import { IPlayer } from './IPlayer';

export interface IGame {
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: number;
  players: IPlayer[];
}
