import { IPlayer } from './IPlayer';
import { IGameQuestion, getXMockGameQuestions } from './IGameQuestion';
import { IAnswer } from './IAnswer';

export interface IGame {
  status:
    | 'LOBBY'
    | 'BRAIN_QUESTIONS'
    | 'GAME_LOOP'
    | 'IN_PROGRESS'
    | 'FINISHED';
  createdAt: number;
  players: IPlayer[];
  questions?: IGameQuestion[];
  answers?: IAnswer[];
  activeQuestionId?: string;
  answeredQuestions?: string[];
}

export const IGameBrainQuestionsAllAnswered: IGame = {
  status: 'BRAIN_QUESTIONS',
  createdAt: 0,
  players: [],
  questions: [
    { brainId: '1', id: '2', text: 'foo', unit: 'bar' },
    { brainId: '2', id: '3', text: 'foo', unit: 'bar' }
  ],
  answers: [
    { playerId: '1', questionId: '2', text: 'foobar' },
    { playerId: '2', questionId: '2', text: 'foobar' }
  ]
};
