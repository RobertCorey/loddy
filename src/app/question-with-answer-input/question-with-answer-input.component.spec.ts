import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { QuestionWithAnswerInputComponent } from "./question-with-answer-input.component";

describe("QuestionWithAnswerInputComponent", () => {
  let component: QuestionWithAnswerInputComponent;
  let fixture: ComponentFixture<QuestionWithAnswerInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionWithAnswerInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionWithAnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
