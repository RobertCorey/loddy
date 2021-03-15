import { Component, OnInit } from "@angular/core";
import { GameCollectionService } from "../services/game-collection.service";
import { GameService } from "../game.service";
import { PlayerService } from "../services/player.service";
import { map } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.scss"],
})
export class LobbyComponent implements OnInit {
  canPlayerStartGame: boolean = false;
  route: string;
  constructor(
    private gameCollectionService: GameCollectionService,
    private gameService: GameService,
    private playerService: PlayerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    document.querySelector("#tinyads_banner").remove();
    this.gameCollectionService.gameClass$.subscribe((game) => {
      if (game.canGameBeStarted && this.playerService.isHost) {
        this.canPlayerStartGame = true;
      }
    });
    this.route = window.location.href.split("?")[0];
    const snapshot = this.activatedRoute.snapshot;
    const name = snapshot.queryParamMap.get("playerName");
    if (name) {
      this.gameService
        .join({ name })
        .toPromise()
        .then(() => {
          this.router.navigateByUrl(
            `/game/${window.location.pathname.split("/")[2]}`,
            { replaceUrl: true }
          );
        });
    }
  }

  get hasPlayerJoined(): boolean {
    return !!(this.playerService.player && this.playerService.player.id);
  }

  get localPlayerId(): string {
    return this.playerService.player.id;
  }
  get state$() {
    return this.gameCollectionService.gameClass$.pipe(
      map((game) => {
        return {
          numberOfPlayers: game.players.length,
        };
      })
    );
  }

  get players() {
    return this.gameCollectionService.gameState$.pipe(
      map((game) => game.players)
    );
  }

  startLobby() {
    this.gameService.startLobby();
  }
}
