import { Component, OnInit } from '@angular/core';
import { mockPlayerList1, mockPlayerList3 } from '../types/IPlayer';
import { QuestionService } from '../question.service';
import { GameService } from '../game.service';
import { StateMockerService } from '../state-mocker.service';
import { IGameBrainQuestionsAllAnswered } from '../types/IGame';

@Component({
  selector: 'app-mock',
  templateUrl: './mock.component.html',
  styleUrls: ['./mock.component.css']
})
export class MockComponent implements OnInit {
  public a: any;
  public b: any;
  public c: any;
  constructor(
    private qs: QuestionService,
    private gs: GameService,
    private sm: StateMockerService
  ) {
    (window as any).gs = this.gs;
    (window as any).sm = this.sm;
  }

  ngOnInit() {
    this.a = mockPlayerList1;
    this.b = mockPlayerList3;
    this.c = [];
    this.gs.handleBrainQuestionsStatus(IGameBrainQuestionsAllAnswered);
  }
}
