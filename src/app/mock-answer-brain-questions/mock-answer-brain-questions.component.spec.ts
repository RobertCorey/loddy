import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MockAnswerBrainQuestionsComponent } from "./mock-answer-brain-questions.component";

describe("MockAnswerBrainQuestionsComponent", () => {
  let component: MockAnswerBrainQuestionsComponent;
  let fixture: ComponentFixture<MockAnswerBrainQuestionsComponent>;

  beforeEach(waitForAsync(() => {
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
