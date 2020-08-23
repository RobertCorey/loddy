import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MockAnswerBrainQuestionsComponent } from "./mock-answer-brain-questions.component";

describe("MockAnswerBrainQuestionsComponent", () => {
  let component: MockAnswerBrainQuestionsComponent;
  let fixture: ComponentFixture<MockAnswerBrainQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MockAnswerBrainQuestionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MockAnswerBrainQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
