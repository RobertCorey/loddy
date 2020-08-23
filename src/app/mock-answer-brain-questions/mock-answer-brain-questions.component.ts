import { Component, OnInit } from "@angular/core";
import { IGameQuestion, getXMockGameQuestions } from "../types/IGameQuestion";

@Component({
  selector: "app-mock-answer-brain-questions",
  templateUrl: "./mock-answer-brain-questions.component.html",
  styleUrls: ["./mock-answer-brain-questions.component.css"],
})
export class MockAnswerBrainQuestionsComponent implements OnInit {
  public gameQuestions: IGameQuestion[] = getXMockGameQuestions(3).map((q) => ({
    ...q,
    brainId: "1",
  }));
  constructor() {}

  ngOnInit() {}
}
