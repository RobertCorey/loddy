import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-question-with-answer-input",
  templateUrl: "./question-with-answer-input.component.html",
  styleUrls: ["./question-with-answer-input.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionWithAnswerInputComponent {
  @Input()
  public unit: string;
  @Output()
  private answerEmitter = new EventEmitter();
  public answerInput = new FormControl("");

  emitAnswer() {
    this.answerEmitter.emit(this.answerInput.value);
    this.answerInput.reset();
  }
}
