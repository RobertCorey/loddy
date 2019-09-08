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

const appRoutes: Routes = [
  { path: '', redirectTo: '/start', pathMatch: 'full' },
  {
    path: 'start',
    component: StartGameComponent
  },
  {
    path: 'game/:id',
    component: GameComponent
  },
  {
    path: 'mock',
    component: MockComponent
  },
  { path: 'mock/questions', component: QuestionTestingComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    StartGameComponent,
    GameComponent,
    JoinGameFormComponent,
    PlayerListComponent,
    MockComponent,
    QuestionTestingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    ReactiveFormsModule
  ],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
