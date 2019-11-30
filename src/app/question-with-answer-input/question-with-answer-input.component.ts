import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IAnswer } from '../types/IAnswer';
import { IGameQuestion } from '../types/IGameQuestion';

@Component({
  selector: 'app-question-with-answer-input',
  templateUrl: './question-with-answer-input.component.html',
  styleUrls: ['./question-with-answer-input.component.scss']
})
export class QuestionWithAnswerInputComponent {
  @Input()
  public question: IGameQuestion;
  @Output()
  private answerEmitter = new EventEmitter<IAnswer>();
  public answerInput = new FormControl('');

  emitAnswer() {
    this.answerInput.reset();
    this.answerEmitter.emit(this.answerInput.value);
  }
}
