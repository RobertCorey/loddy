import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { StartGameComponent } from './start-game/start-game.component';
import { Routes, RouterModule } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { GameComponent } from './game/game.component';
import { JoinGameFormComponent } from './join-game-form/join-game-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PlayerListComponent } from './player-list/player-list.component';
import { MockComponent } from './mock/mock.component';
import { QuestionTestingComponent } from './question-testing/question-testing.component';
import { AddQuestionComponent } from './add-question/add-question.component';
import { AnswerBrainQuestionsComponent } from './answer-brain-questions/answer-brain-questions.component';
import { MockAnswerBrainQuestionsComponent } from './mock-answer-brain-questions/mock-answer-brain-questions.component';
import { AnswerQuestionFormComponent } from './answer-question-form/answer-question-form.component';
import { QuestionWithAnswerInputComponent } from './question-with-answer-input/question-with-answer-input.component';
import { GameLoopComponent } from './game-loop/game-loop.component';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    StartGameComponent,
    GameComponent,
    JoinGameFormComponent,
    PlayerListComponent,
    MockComponent,
    QuestionTestingComponent,
    AddQuestionComponent,
    AnswerBrainQuestionsComponent,
    MockAnswerBrainQuestionsComponent,
    AnswerQuestionFormComponent,
    QuestionWithAnswerInputComponent,
    GameLoopComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    ReactiveFormsModule
  ],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
