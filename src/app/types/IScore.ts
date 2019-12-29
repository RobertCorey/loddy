import { IPlayer } from './IPlayer';
export interface IScore {
  playerId: IPlayer['id'];
  score: number;
}
