import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs/operators";
import { GameService } from "../game.service";
import { Observable } from "rxjs";
import { IGame } from "../types/IGame";
import { Game } from "../types/Game";
import { IPlayer } from "../types/IPlayer";
import { IQuestion } from "../types/IQuestion";
import { IGameQuestion } from "../types/IGameQuestion";
import { GameCollectionService } from "../services/game-collection.service";
import { PlayerService } from "../services/player.service";

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
    private playerService: PlayerService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.gameCollectionService.setDocumentById(this.id);
    this.playerService.bindToGame(this.id);
    this.$game = this.gameCollectionService.gameState$;
    this.$game.pipe(take(1)).subscribe((game) => {
      if (!game) {
        this.notFound = true; // bad link/id: the doc doesn't exist
        return;
      }
      // If a refreshed host rejoins a game in progress, restart the state
      // machine: the host's tab is the only thing driving status transitions.
      if (
        this.playerService.isHost &&
        game.status !== "LOBBY" &&
        game.status !== "FINISHED"
      ) {
        this.gameService.resumeGameRunner();
      }
    });
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
