import { Component, OnInit } from "@angular/core";
import { QuestionService } from "../question.service";
import { mockPlayerList3 } from "../types/IPlayer";

@Component({
  selector: "app-question-testing",
  templateUrl: "./question-testing.component.html",
  styleUrls: ["./question-testing.component.css"],
})
export class QuestionTestingComponent implements OnInit {
  constructor(private qs: QuestionService) {
    (window as any).qs = this.qs;
  }

  ngOnInit() {
    console.log(mockPlayerList3);
    this.qs.getGameQuestions(mockPlayerList3, 10).subscribe((a) => {
      console.log(a);
    });
  }
}
