import { Component, OnInit } from "@angular/core";
import { GameService } from "../game.service";
import { Router } from "@angular/router";
import { StateMockerService } from "../state-mocker.service";
import { GameCollectionService } from "../services/game-collection.service";

@Component({
  selector: "app-start-game",
  templateUrl: "./start-game.component.html",
  styleUrls: ["./start-game.component.scss"],
})
export class StartGameComponent implements OnInit {
  constructor(
    private router: Router,
    private gameCollectionService: GameCollectionService
  ) {}

  ngOnInit() {}

  async startGame() {
    const gameRef = await this.gameCollectionService.createAndSetRef();
    this.router.navigate(["game", gameRef.id]);
  }
}
