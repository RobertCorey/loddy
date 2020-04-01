import { Component, OnInit } from '@angular/core';
import { StateMockerService } from './state-mocker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private stateMockerService: StateMockerService) {}
  ngOnInit() {
    // this.stateMockerService.answerBrainQuestionsInitial();
    // this.stateMockerService.fullLobbyAsHost();
    // this.stateMockerService.firstQuestion();
    this.stateMockerService.firstScoreScreen();
  }
}
