import { Injectable } from '@angular/core';

import { IGame } from './types/IGame';
import { IPlayer } from './types/IPlayer';
import { firestore } from 'firebase';

import * as shortid from 'shortid';
import { QuestionService } from './question.service';
import { IAnswer } from './types/IAnswer';
import { Game } from './types/Game';
import { GameCollectionService } from './services/game-collection.service';
import { take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameRef: any;
  localPlayer: IPlayer;
  constructor(
    private qs: QuestionService,
    private gameCollectionService: GameCollectionService
  ) {}

  join(player: { name: string }) {
    return this.gameCollectionService.gameState$.pipe(
      take(1),
      switchMap(game => {
        const playerWithId = {
          ...player,
          id: shortid.generate(),
          host: !game.players.length
        };
        return this.gameCollectionService
          .update({
            players: firestore.FieldValue.arrayUnion(playerWithId)
          })
          .then(_ => (this.localPlayer = playerWithId));
      })
    );
  }

  startLobby() {
    return this.gameCollectionService.gameState$
      .pipe(
        switchMap(game => {
          return this.qs.getGameQuestions(
            game.players,
            game.players.length * 3
          );
        })
      )
      .subscribe(questions => {
        if (this.localPlayer.host) {
          this.gameCollectionService.update({
            status: 'BRAIN_QUESTIONS',
            questions,
            answers: []
          } as Partial<IGame>);
          this.initGameRunner();
        }
      });
  }

  addAnswer(answers: IAnswer[]) {
    return this.gameCollectionService.update({
      answers: firestore.FieldValue.arrayUnion(...answers)
    });
  }

  initGameRunner() {
    this.gameCollectionService.gameState$.subscribe((game: IGame) => {
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
      this.gameCollectionService.update({
        answeredQuestions: firestore.FieldValue.arrayUnion(
          game.activeQuestionId
        )
      });
      const nextQuestionId = gameInstance.getNextQuestionId();
      if (nextQuestionId) {
        this.gameCollectionService.update({ activeQuestionId: nextQuestionId });
      } else {
        this.gameCollectionService.update({ status: 'FINISHED' });
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
      this.gameCollectionService.update({
        status: 'GAME_LOOP',
        activeQuestionId: game.questions[0].id,
        answeredQuestions: []
      } as Partial<IGame>);
    }
  }
}
