import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../question.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {
  questionText: FormControl = new FormControl('');
  unitText: FormControl = new FormControl('');
  constructor(private qs: QuestionService) {}

  ngOnInit() {}

  submitQuestion() {
    this.qs.addQuestion(this.questionText.value, this.unitText.value);
    console.log(this.questionText.value);
    console.log(this.unitText.value);
  }
}
