import { Component, OnInit, Input } from '@angular/core';
import { IGameQuestion } from '../types/IGameQuestion';
import { GameService } from '../game.service';
import { IAnswer } from '../types/IAnswer';

@Component({
  selector: 'app-answer-brain-questions',
  templateUrl: './answer-brain-questions.component.html',
  styleUrls: ['./answer-brain-questions.component.css']
})
export class AnswerBrainQuestionsComponent implements OnInit {
  @Input()
  public questions: IGameQuestion[];
  public active = true;
  constructor(private gs: GameService) {}

  ngOnInit() {}

  submit(answers: IAnswer[]) {
    this.active = false;
    this.gs.addAnswer(answers);
  }
  get localPlayerId() {
    return this.gs.localPlayer.id;
  }
}
