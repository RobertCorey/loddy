import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GameService } from "../game.service";
import { Observable } from "rxjs";
import { IGame } from "../types/IGame";
import { Game } from "../types/Game";
import { IPlayer } from "../types/IPlayer";
import { IQuestion } from "../types/IQuestion";
import { IGameQuestion } from "../types/IGameQuestion";
import { GameCollectionService } from "../services/game-collection.service";
import { PlayerService } from "../services/player.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit {
  public id;
  public $game: Observable<IGame>;
  public game: Game;
  constructor(
    private route: ActivatedRoute,
    private gameCollectionService: GameCollectionService,
    private gameService: GameService,
    private playerService: PlayerService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.gameCollectionService.setDocumentById(this.id);
    this.$game = this.gameCollectionService.gameState$;
  }

  get localPlayer(): IPlayer {
    return this.playerService.player;
  }
}
