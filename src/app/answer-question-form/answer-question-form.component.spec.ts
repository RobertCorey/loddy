import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AnswerQuestionFormComponent } from "./answer-question-form.component";

describe("AnswerQuestionFormComponent", () => {
  let component: AnswerQuestionFormComponent;
  let fixture: ComponentFixture<AnswerQuestionFormComponent>;

  beforeEach(async(() => {
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
