import { Component, OnInit } from "@angular/core";
import { StateMockerService } from "./state-mocker.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  constructor(private stateMockerService: StateMockerService) {}
  ngOnInit() {
    /**
     * keep in order of appearance
     */
    // this.stateMockerService.fullLobbyAsHost();
    // this.stateMockerService.answerBrainQuestionsInitial();
    this.stateMockerService.firstQuestion();
    // this.stateMockerService.firstQuestionAsBrain();
    // this.stateMockerService.firstScoreScreen();
    // this.stateMockerService.oneAnswerBeforeScoreScreen();
    // this.stateMockerService.scoreScreenNatural();
    // this.stateMockerService.scoreScreen();
  }
}
