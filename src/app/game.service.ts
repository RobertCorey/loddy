import { Injectable } from '@angular/core';

import { IGame } from './types/IGame';
import { IPlayer } from './types/IPlayer';
import { firestore } from 'firebase';

import * as shortid from 'shortid';
import { QuestionService } from './question.service';
import { IAnswer } from './types/IAnswer';
import { Game } from './types/Game';
import { GameCollectionService } from './services/game-collection.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameRef: any;
  localPlayer: IPlayer;
  lastGameState: IGame;
  constructor(
    private qs: QuestionService,
    private gameCollectionService: GameCollectionService
  ) {}

  join(player: { name: string }) {
    const playerWithId = {
      ...player,
      id: shortid.generate(),
      host: !this.lastGameState.players.length
    };
    return this.getDocument()
      .update({
        players: firestore.FieldValue.arrayUnion(playerWithId)
      })
      .then(_ => (this.localPlayer = playerWithId));
  }

  startLobby() {
    this.qs
      .getGameQuestions(
        this.lastGameState.players,
        this.lastGameState.players.length * 3
      )
      .subscribe(questions => {
        this.getDocument().update({
          status: 'BRAIN_QUESTIONS',
          questions,
          answers: []
        } as Partial<IGame>);
        if (this.localPlayer.host) {
          this.initGameRunner();
        }
      });
  }

  addAnswer(answers: IAnswer[]) {
    return this.getDocument().update({
      answers: firestore.FieldValue.arrayUnion(...answers)
    });
  }

  initGameRunner() {
    this.getDocument()
      .valueChanges()
      .subscribe((game: IGame) => {
        switch (game.status) {
          case 'BRAIN_QUESTIONS':
            this.handleBrainQuestionsStatus(game);
            break;
          case 'GAME_LOOP':
            this.handleGameLoopStatus(game);
            break;
          default:
            break;
        }
      });
  }

  handleGameLoopStatus(game: IGame) {
    const gameInstance = new Game(game);
    const playersLeftCount = gameInstance.getPlayersYetToAnswerQuestion()
      .length;
    if (playersLeftCount === 0) {
      this.getDocument().update({
        answeredQuestions: firestore.FieldValue.arrayUnion(
          game.activeQuestionId
        )
      });
      const nextQuestionId = gameInstance.getNextQuestionId();
      if (nextQuestionId) {
        this.update({ activeQuestionId: nextQuestionId });
      } else {
        this.update({ status: 'FINISHED' });
      }
    }
  }

  handleBrainQuestionsStatus(game: IGame) {
    const numberOfQuestionsWithBrainAnswers = game.questions.filter(question =>
      game.answers.some(
        answer =>
          answer.playerId === question.brainId &&
          question.id === answer.questionId
      )
    ).length;
    if (numberOfQuestionsWithBrainAnswers === game.questions.length) {
      this.getDocument().update({
        status: 'GAME_LOOP',
        activeQuestionId: game.questions[0].id,
        answeredQuestions: []
      } as Partial<IGame>);
    }
  }
}
