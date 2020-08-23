export interface IPlayer {
  name: string;
  id: string;
  host: boolean;
}

export const mockPlayerList1: IPlayer[] = [
  {
    name: "Rob",
    id: "1",
    host: true,
  },
];

export const mockPlayerList3: IPlayer[] = [
  {
    name: "Rob",
    id: "1",
    host: true,
  },
  {
    name: "Tom",
    id: "2",
    host: false,
  },
  {
    name: "Lela",
    id: "3",
    host: false,
  },
];
