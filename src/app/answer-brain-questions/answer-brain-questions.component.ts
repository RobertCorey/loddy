import { Component, OnInit, Input } from '@angular/core';
import { IQuestion } from '../types/IQuestion';
import { IAnswer } from '../types/IAnswer';
import { IGameQuestion } from '../types/IGameQuestion';
import { FormControl } from '@angular/forms';
import { GameService } from '../game.service';

/**
 * this should probably be a dumb component that takes in questions and repls with the user then broadcasts the answers
 * up to the smart component which hits whatever api with them
 */
@Component({
  selector: 'app-answer-brain-questions',
  templateUrl: './answer-brain-questions.component.html',
  styleUrls: ['./answer-brain-questions.component.css']
})
export class AnswerBrainQuestionsComponent implements OnInit {
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
