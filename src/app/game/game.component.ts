import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { distinctUntilChanged, map, take } from "rxjs/operators";
import { GameService } from "../game.service";
import { Observable } from "rxjs";
import { IGame } from "../types/IGame";
import { Game } from "../types/Game";
import { IPlayer } from "../types/IPlayer";
import { IQuestion } from "../types/IQuestion";
import { IGameQuestion } from "../types/IGameQuestion";
import { GameCollectionService } from "../services/game-collection.service";
import { PlayerService } from "../services/player.service";
import { SoundService } from "../services/sound.service";

declare var twttr: any;

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit {
  public id;
  public $game: Observable<IGame>;
  public game: Game;
  flag: any = true;
  notFound = false;
  constructor(
    private route: ActivatedRoute,
    private gameCollectionService: GameCollectionService,
    private gameService: GameService,
    private playerService: PlayerService,
    private soundService: SoundService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.gameCollectionService.setDocumentById(this.id);
    this.playerService.bindToGame(this.id);
    this.$game = this.gameCollectionService.gameState$;
    this.$game.pipe(take(1)).subscribe((game) => {
      if (!game) {
        this.notFound = true; // bad link/id: the doc doesn't exist
      }
    });
    // Every tab binds to the state machine: only the elected runner acts,
    // everyone else watchdogs the runner's heartbeat and can take over.
    this.gameService.initGameRunner();
    // lo-fi blips on the big beats of the game
    this.$game
      .pipe(
        map((game) => game && game.status),
        distinctUntilChanged()
      )
      .subscribe((status) => {
        if (status === "BRAIN_QUESTIONS" || status === "GAME_LOOP") {
          this.soundService.question();
        } else if (status === "SCORE_SCREEN") {
          this.soundService.score();
        } else if (status === "FINISHED") {
          this.soundService.gameOver();
        }
      });
  }

  countdownDeadline(game: IGame): number | null {
    if (
      game.status === "GAME_LOOP" &&
      game.answerDeadlineKey === game.activeQuestionId
    ) {
      return game.answerDeadline;
    }
    if (
      game.status === "BRAIN_QUESTIONS" &&
      game.answerDeadlineKey === "BRAIN"
    ) {
      return game.answerDeadline;
    }
    return null;
  }

  get localPlayer(): IPlayer {
    return this.playerService.player;
  }

  localPlayerIsHost() {
    return this.playerService.isHost;
  }
  localPlayerIsObserver() {
    return this.playerService.isObserver;
  }

  playerListVisible(game: IGame) {
    if (game.status !== "BRAIN_QUESTIONS_RULES") {
      return true;
    }
    return false;
  }

  playAgain() {
    this.gameCollectionService.playAgain();
  }

  hack() {
    if (typeof twttr !== "undefined" && twttr.widgets) {
      twttr.widgets.load();
    }
    this.flag = false;
    return true;
  }
}
