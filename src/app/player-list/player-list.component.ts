import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IPlayer } from '../types/IPlayer';
import { PlayerService } from '../services/player.service';
import { GameCollectionService } from '../services/game-collection.service';
import {
  map,
  filter,
  switchMap,
  mapTo,
  take,
  tap,
  distinctUntilChanged
} from 'rxjs/operators';
import { Observable, timer, merge, from, of, combineLatest } from 'rxjs';
import { ITotalScore, Game } from '../types/Game';

interface PlayerBox {
  player: IPlayer;
  isLocalPlayer: boolean;
  message: string;
  messageClass: string;
  score: number | string;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerListComponent implements OnInit {
  public players$: Observable<IPlayer[]>;
  public state$: Observable<ITotalScore[]>;
  game$: Observable<any>;
  scoreInfo$: Observable<
    {
      position: number;
      score: number;
      absoluteDistance: number;
      playerId: string;
      questionId: string;
      text: string;
    }[]
  >;
  foo$: Observable<string>;
  bar$: Observable<string>;
  constructor(
    private playerService: PlayerService,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {
    this.game$ = this.gameCollectionService.gameClass$.pipe(
      switchMap(game => {
        switch (game.status) {
          case 'LOBBY':
            return this.lobbyState(game);
          case 'BRAIN_QUESTIONS':
            return this.brainQuestionsState(game);
          case 'GAME_LOOP':
            return this.gameLoopState(game);
          case 'SCORE_SCREEN':
            return this.scoreScreenState(game);
          case 'FINISHED':
            return this.finishedState(game);
          default:
            break;
        }
        // return of({});
        return this.gameLoopState(game);
      })
    );
    this.players$ = this.gameCollectionService.gameState$.pipe(
      map(game => game.players)
    );

    this.state$ = this.gameCollectionService.gameClass$.pipe(
      map(game => game.sortedTotalScores)
    );
  }

  finishedState(game: Game): any {
    throw new Error('Method not implemented.');
  }

  scoreScreenState(game: Game): any {
    const scoreScreenInfo = game.currentRoundScoreInfo;
    //Answer
    const answerStage: PlayerBox[] = scoreScreenInfo
      .map(s => {
        return {
          isLocalPlayer: this.isLocalPlayer(s.player),
          message: `Bid: ${s.text}`,
          player: s.player,
          isBrain: s.isBrain,
          score: '',
          messageClass: ''
        };
      })
      .sort((a, b) => +b.score - +a.score);
    //Absolute Distance
    const absoluteDistance: PlayerBox[] = [...scoreScreenInfo]
      .sort((a, b) => b.signedDistance - a.signedDistance)
      .map(s => {
        let message = `Distance: ${s.signedDistance}`;
        if (s.isBrain) {
          message = '';
        } else if (s.signedDistance === 0) {
          message = 'SPOT ON!';
        }
        return {
          isLocalPlayer: this.isLocalPlayer(s.player),
          message,
          player: s.player,
          isBrain: s.isBrain,
          score: '',
          messageClass: ''
        };
      });
    // Position
    const position: PlayerBox[] = [...scoreScreenInfo]
      .sort((a, b) => {
        if (a.isBrain) {
          return -1;
        }
        if (b.isBrain) {
          return 1;
        }
        return a.position - b.position;
      })
      .map(s => {
        let message = `Position: ${s.position}`;
        if (s.isBrain) {
          message = '';
        }
        return {
          isLocalPlayer: this.isLocalPlayer(s.player),
          message,
          player: s.player,
          isBrain: s.isBrain,
          score: '',
          messageClass: ''
        };
      });
    // Points
    const points: PlayerBox[] = [...scoreScreenInfo]
      .sort((a, b) => {
        if (a.isBrain) {
          return -1;
        }
        if (b.isBrain) {
          return 1;
        }
        return a.position - b.position;
      })
      .map(s => {
        let message = `Points Awarded: ${s.score}`;
        if (s.isBrain) {
          message = '';
        }
        return {
          isLocalPlayer: this.isLocalPlayer(s.player),
          message,
          player: s.player,
          isBrain: s.isBrain,
          score: '',
          messageClass: ''
        };
      });

    return merge(
      timer(0).pipe(mapTo(answerStage)),
      timer(3000).pipe(mapTo(absoluteDistance)),
      timer(6000).pipe(mapTo(position)),
      timer(9000).pipe(mapTo(points))
    );
    return of(answerStage);
  }
  brainQuestionsState(game: Game): any {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map(pb => {
        const message = game.playerHasAnsweredAllBrainQuestions(pb.player.id)
          ? 'Waiting for other players to finish answering...'
          : 'Answering...';
        return { ...pb, message, score: '' };
      })
    );
  }
  private lobbyState(game: Game): any {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map(pb => {
        const message = game.isPlayerHost(pb.player.id)
          ? 'Host of the game!'
          : 'Waiting for the host to start the game...';
        return { ...pb, message, score: '' };
      })
    );
  }
  private gameLoopState(game: Game) {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map(pb => {
        let message = '';
        let messageClass = '';
        let isBrain = false;
        if (game.isPlayerBrain(pb.player.id)) {
          isBrain = true;
        } else if (game.playerHasAnsweredCurrentQuestion(pb.player.id)) {
          message = 'Waiting...';
        } else {
          message = 'Thinking...';
        }
        return { ...pb, message, messageClass, isBrain };
      })
    );
  }

  isLocalPlayer(player: IPlayer) {
    return player.id === this.playerService.player.id;
  }

  private getPlayerBox(game: Game): Partial<PlayerBox>[] {
    return game.sortedTotalScores.map(s => {
      return { ...s, isLocalPlayer: this.isLocalPlayer(s.player) };
    });
  }
}
