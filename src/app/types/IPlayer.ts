export interface IPlayer {
  name: string;
  id: string;
  host: boolean;
  score: number;
}

export const mockPlayerList1: IPlayer[] = [
  {
    name: 'Rob',
    id: '1',
    host: true,
    score: 0
  }
];

export const mockPlayerList3: IPlayer[] = [
  {
    name: 'Rob',
    id: '1',
    host: true,
    score: 0
  },
  {
    name: 'Tom',
    id: '2',
    host: false,
    score: 0
  },
  {
    name: 'Lela',
    id: '3',
    host: false,
    score: 0
  }
];
