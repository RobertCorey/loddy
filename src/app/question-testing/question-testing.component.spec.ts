import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTestingComponent } from './question-testing.component';

describe('QuestionTestingComponent', () => {
  let component: QuestionTestingComponent;
  let fixture: ComponentFixture<QuestionTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionTestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
