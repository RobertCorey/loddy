import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AnswerBrainQuestionsComponent } from "./answer-brain-questions.component";

describe("AnswerBrainQuestionsComponent", () => {
  let component: AnswerBrainQuestionsComponent;
  let fixture: ComponentFixture<AnswerBrainQuestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerBrainQuestionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerBrainQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
