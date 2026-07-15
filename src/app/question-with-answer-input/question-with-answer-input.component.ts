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
    // Keep digits only: scoring does numeric math on this text, and the
    // digitOnly directive can be bypassed by autofill/IME input.
    const value = (this.answerInput.value || "").replace(/[^0-9]/g, "");
    if (!value) {
      return; // an empty answer would silently score as 0
    }
    this.answerEmitter.emit(value);
    this.answerInput.reset();
  }
}
