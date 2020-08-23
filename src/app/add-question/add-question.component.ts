import { Component, OnInit } from "@angular/core";
import { QuestionService } from "../question.service";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-add-question",
  templateUrl: "./add-question.component.html",
  styleUrls: ["./add-question.component.css"],
})
export class AddQuestionComponent implements OnInit {
  addQuestionForm = new FormGroup({
    questionText: new FormControl(""),
    unitText: new FormControl(""),
  });
  constructor(private qs: QuestionService) {}

  ngOnInit() {}

  submitQuestion() {
    this.addQuestionForm.disable();
    const values = this.addQuestionForm.value;
    this.qs.addQuestion(values.questionText, values.unitText).then(() => {
      this.addQuestionForm.enable();
      this.addQuestionForm.reset();
    });
  }
}
