import { Component, OnInit, Input } from '@angular/core';
import { IQuestion } from '../types/IQuestion';
import { IAnswer } from '../types/IAnswer';
import { IGameQuestion } from '../types/IGameQuestion';
import { FormControl } from '@angular/forms';
import { GameService } from '../game.service';

@Component({
  selector: 'app-answer-brain-questions',
  templateUrl: './answer-brain-questions.component.html',
  styleUrls: ['./answer-brain-questions.component.css']
})
export class AnswerBrainQuestionsComponent implements OnInit {
  @Input()
  public questions: IGameQuestion[];
  @Input()
  public playerId: string;
  public answerInput = new FormControl('');
  private answers: IAnswer[] = [];
  constructor(private gs: GameService) {}

  ngOnInit() {
    console.log(this.questions);
  }

  get unansweredQuestionsExist(): boolean {
    return this.answers.length < this.questions.length;
  }

  get currentQuestion(): IGameQuestion {
    return this.questions[this.answers.length];
  }

  submit() {
    this.answers.push({
      playerId: this.playerId,
      questionId: this.currentQuestion.id,
      text: this.answerInput.value
    });
    this.answerInput.reset();
    console.log(this);
  }
}
