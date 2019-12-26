import { Component, OnInit } from '@angular/core';
import { StateMockerService } from './state-mocker.service';
import { Router } from '@angular/router';
import { Game } from './types/Game';
import { onePersonLeftToAnswer } from 'src/mocks/game/one-person-left-to-answer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'loddy';
  constructor(private stateMockerService: StateMockerService) {}
  ngOnInit() {
    //Uncomment for live testing of view
    // this.stateMockerService.onePersonLeftToAnswer();
    //Uncomment for testing pure function
    const game = new Game(onePersonLeftToAnswer as any);
    console.log(game.calculateScore());
  }
}
