import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { GameService } from "../game.service";

@Component({
  selector: "app-join-game-form",
  templateUrl: "./join-game-form.component.html",
  styleUrls: ["./join-game-form.component.css"],
})
export class JoinGameFormComponent {
  name: FormControl = new FormControl("", Validators.pattern("[a-zA-Z ]*"));
  constructor(private gameService: GameService) {}
  onSubmit() {
    const name = (this.name.value || "").trim();
    if (!name) {
      return; // a whitespace-only name passes the pattern but is invisible
    }
    this.gameService.join({ name }).subscribe({
      error: () => {}, // lobby filled up or started under us; form stays up
    });
  }
}
