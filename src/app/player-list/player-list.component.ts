import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { IPlayer } from "../types/IPlayer";
import { PlayerService } from "../services/player.service";
import { GameCollectionService } from "../services/game-collection.service";
import { map, switchMap, mapTo } from "rxjs/operators";
import { Observable, timer, merge, of } from "rxjs";
import { ITotalScore, Game } from "../types/Game";

interface PlayerBox {
  player?: IPlayer;
  isLocalPlayer?: boolean;
  message?: string;
  messageClass?: string;
  score?: number | string;
  emoji?: string;
}

@Component({
  selector: "app-player-list",
  templateUrl: "./player-list.component.html",
  styleUrls: ["./player-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      switchMap((game) => {
        switch (game.status) {
          case "LOBBY":
            return this.lobbyState(game);
          case "BRAIN_QUESTIONS":
            return this.brainQuestionsState(game);
          case "GAME_LOOP":
            return this.gameLoopState(game);
          case "SCORE_SCREEN":
            return this.scoreScreenState(game);
          case "FINISHED":
            return this.finishedState(game);
          default:
            break;
        }
        return this.gameLoopState(game);
      })
    );
    this.players$ = this.gameCollectionService.gameState$.pipe(
      map((game) => game.players)
    );

    this.state$ = this.gameCollectionService.gameClass$.pipe(
      map((game) => game.sortedTotalScores)
    );
  }

  finishedState(game: Game): any {
    const partialPlayerBox = this.getPlayerBox(game);
    const final = partialPlayerBox.map((p, index) => {
      let message;
      switch (index) {
        case 0:
          message = "1st";
          break;
        case 1:
          message = "2nd";
          break;
        case 2:
          message = "3rd";
          break;
        default:
          message = `${index + 1}th`;
          break;
      }
      message += " place!";
      return { ...p, message, isBrain: false, messageClass: "" };
    });
    return of(final);
  }

  scoreScreenState(game: Game): any {
    const signedDistanceToEmojiDistance = (signedDistance) => {
      if (signedDistance < 0) return `${Math.abs(signedDistance)} over!`;
      if (signedDistance > 0) return `${signedDistance} under!`;
      return `spoton`;
    };

    const scoreScreenInfo = game.currentRoundScoreInfo;
    //Answer
    const answerStage: PlayerBox[] = scoreScreenInfo
      .map((s) => {
        const bid = s.text;
        const points = s.score;
        return {
          isLocalPlayer: this.isLocalPlayer(s.player),
          scoreScreen: {
            bid,
            signedDistance: signedDistanceToEmojiDistance(s.signedDistance),
            points,
          },
          emoji: s.isBrain ? "🧠" : "",
          player: s.player,
          isBrain: s.isBrain,
          score: points ? `+${points}` : "",
          messageClass: "",
          hidePlace: true,
        };
      })
      .filter((x) => !x.isBrain)
      .sort((a, b) => +b.score - +a.score);

    return of(answerStage);
  }
  brainQuestionsState(game: Game): any {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map((pb) => {
        const emoji = game.playerHasAnsweredAllBrainQuestions(pb.player.id)
          ? "😐"
          : "🤔";
        return { ...pb, emoji, score: "20" };
      })
    );
  }
  private lobbyState(game: Game): Observable<PlayerBox[]> {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map((pb) => {
        return { ...pb, score: "" };
      })
    );
  }

  private gameLoopState(game: Game) {
    const partialPlayerBox = this.getPlayerBox(game);
    return of(
      partialPlayerBox.map((pb) => {
        let message = "";
        let messageClass = "";
        let emoji = "";
        let isBrain = false;
        if (game.isPlayerBrain(pb.player.id)) {
          isBrain = true;
          emoji = "🧠";
        } else if (game.playerHasAnsweredCurrentQuestion(pb.player.id)) {
          emoji = "😐";
        } else {
          emoji = "🤔";
        }
        return { ...pb, message, messageClass, isBrain, emoji };
      })
    );
  }

  isLocalPlayer(player: IPlayer) {
    return player.id === this.playerService.player.id;
  }

  private getPlayerBox(game: Game): Partial<PlayerBox>[] {
    return game.sortedTotalScores.map((s) => {
      return { ...s, isLocalPlayer: this.isLocalPlayer(s.player) };
    });
  }
}
