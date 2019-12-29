import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersYetToAnswerComponent } from './players-yet-to-answer.component';

describe('PlayersYetToAnswerComponent', () => {
  let component: PlayersYetToAnswerComponent;
  let fixture: ComponentFixture<PlayersYetToAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayersYetToAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersYetToAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
