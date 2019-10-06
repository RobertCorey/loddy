import { Component, OnInit, Input } from '@angular/core';
import { IGameQuestion } from '../types/IGameQuestion';
import { FormControl } from '@angular/forms';
import { IAnswer } from '../types/IAnswer';
import { GameService } from '../game.service';

@Component({
  selector: 'app-answer-question-form',
  templateUrl: './answer-question-form.component.html',
  styleUrls: ['./answer-question-form.component.css']
})
export class AnswerQuestionFormComponent implements OnInit {
  @Input()
  public questions: IGameQuestion[];
  public answerInput = new FormControl('');
  private answers: IAnswer[] = [];
  constructor(private gs: GameService) {}

  ngOnInit() {}

  get unansweredQuestionsExist(): boolean {
    return this.answers.length < this.questions.length;
  }

  get currentQuestion(): IGameQuestion {
    return this.questions[this.answers.length];
  }

  submit() {
    this.answers = [
      ...this.answers,
      {
        playerId: this.currentQuestion.brainId,
        questionId: this.currentQuestion.id,
        text: this.answerInput.value
      }
    ];
    this.answerInput.reset();
    if (!this.unansweredQuestionsExist) {
      this.gs.addAnswer(this.answers);
    }
  }
}
