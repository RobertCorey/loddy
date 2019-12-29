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
import { PlayerService } from './services/player.service';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gameRef: any;
  mock: boolean;
  constructor(
    private qs: QuestionService,
    private gameCollectionService: GameCollectionService,
    private playerService: PlayerService
  ) {
    (window as any).foo = this;
  }

  join(player: { name: string }) {
    return this.gameCollectionService.gameState$.pipe(
      take(1),
      switchMap(game => {
        const playerWithId = {
          ...player,
          id: shortid.generate(),
          host: !game.players.length
        };
        this.playerService.player = playerWithId;
        return this.gameCollectionService.update({
          players: firestore.FieldValue.arrayUnion(playerWithId)
        });
      })
    );
  }

  startLobby() {
    return this.gameCollectionService.gameState$
      .pipe(
        take(1),
        switchMap(game => {
          return this.qs.getGameQuestions(
            game.players,
            game.players.length * 3
          );
        })
      )
      .subscribe(questions => {
        if (this.playerService.isHost || this.mock) {
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
      console.log(game.status);
      switch (game.status) {
        case 'BRAIN_QUESTIONS':
          this.handleBrainQuestionsStatus(game);
          break;
        case 'GAME_LOOP':
          this.handleGameLoopStatus(game);
          break;
        case 'SCORE_SCREEN':
          this.handleScoreScreenStatus(game);
          break;
        default:
          break;
      }
    });
  }
  handleScoreScreenStatus(game: IGame) {
    const gameInstance = new Game(game);
    timer(3000).subscribe(_ => {
      const nextQuestionId = gameInstance.getNextQuestionId();
      if (nextQuestionId) {
        this.gameCollectionService.update({
          activeQuestionId: nextQuestionId,
          status: 'GAME_LOOP'
        });
      } else {
        this.gameCollectionService.update({
          status: 'FINISHED'
        });
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
        ),
        status: 'SCORE_SCREEN'
      });
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
