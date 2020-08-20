import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { GameService } from "../game.service";
import { Observable } from "rxjs";
import { GameCollectionService } from "../services/game-collection.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-score-screen",
  templateUrl: "./score-screen.component.html",
  styleUrls: ["./score-screen.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreScreenComponent implements OnInit {
  $state: Observable<any>;
  constructor(private gameCollectionService: GameCollectionService) {}

  ngOnInit(): void {
    this.$state = this.gameCollectionService.gameClass$.pipe(
      map((game) => {
        const { currentQuestion, brainAnswerToCurrentQuestion } = game;
        const brain = game.getPlayerById(brainAnswerToCurrentQuestion.playerId);
        return {
          currentQuestion: currentQuestion.text,
          brainName: brain.name,
          brainAnswer: brainAnswerToCurrentQuestion.text,
        };
      })
    );
  }
}
