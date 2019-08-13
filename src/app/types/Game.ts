export interface Game {
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: number;
  players: [];
}
