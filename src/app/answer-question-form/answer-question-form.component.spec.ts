import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AnswerQuestionFormComponent } from "./answer-question-form.component";

describe("AnswerQuestionFormComponent", () => {
  let component: AnswerQuestionFormComponent;
  let fixture: ComponentFixture<AnswerQuestionFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerQuestionFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
