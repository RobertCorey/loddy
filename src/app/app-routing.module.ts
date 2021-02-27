import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StartGameComponent } from "./start-game/start-game.component";
import { GameComponent } from "./game/game.component";
import { MockComponent } from "./mock/mock.component";
import { QuestionTestingComponent } from "./question-testing/question-testing.component";
import { MockAnswerBrainQuestionsComponent } from "./mock-answer-brain-questions/mock-answer-brain-questions.component";
import { QuestionWithAnswerInputComponent } from "./question-with-answer-input/question-with-answer-input.component";

const appRoutes: Routes = [
  { path: "", redirectTo: "/start", pathMatch: "full" },
  {
    path: "start",
    component: StartGameComponent,
  },
  {
    path: "game/:id",
    component: GameComponent,
    children: [],
  },
  {
    path: "mock",
    component: MockComponent,
  },
  { path: "mock/questions", component: QuestionTestingComponent },
  {
    path: "mock/answerbrainquestions",
    component: MockAnswerBrainQuestionsComponent,
  },
  { path: "mock/qwai", component: QuestionWithAnswerInputComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
