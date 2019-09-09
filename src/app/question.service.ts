import * as shuffle from 'lodash.shuffle';
import * as samp from 'lodash.sample';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { map, take, tap, share, reduce } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { IQuestion, getXMockQuestions } from './types/IQuestion';
import { IPlayer } from './types/IPlayer';
import { IGameQuestion } from './types/IGameQuestion';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private documentId: string;
  private questions: IQuestion[];
  constructor(private afs: AngularFirestore) {
    this.documentId = 's9MSZSgZzN6gMUYTmVmA';
    this.getQuestions();
  }
  getCollection() {
    return this.afs.collection('questions');
  }
  getDocument(): AngularFirestoreDocument<unknown> {
    return this.getCollection().doc(this.documentId);
  }

  private getQuestions(): Observable<IQuestion[]> {
    if (this.questions) {
      return of(this.questions);
    } else {
      return this.getDocument()
        .valueChanges()
        .pipe(
          take(1),
          map((document: { questions: IQuestion[] }) => {
            return document.questions;
          }),
          tap((questions: IQuestion[]) => {
            this.questions = questions;
          })
        );
    }
  }

  public getGameQuestions(
    players: IPlayer[],
    numberOfQuestions: number = 10
  ): Observable<IGameQuestion[]> {
    const compileQuestion = (question: string, playerName: string) =>
      question.replace('#player', playerName);

    const assignBrainsToQuestions = (
      questions: IQuestion[],
      players: IPlayer[]
    ): IGameQuestion[] => {
      return questions.map((question, index) => {
        question.text = compileQuestion(question.text, samp(players).name);
        const brainId = players[index % players.length].id;
        return { ...question, brainId };
      });
    };

    return this.getQuestions().pipe(
      map(shuffle),
      map((shuffledQuestions: IQuestion[]) =>
        shuffledQuestions.slice(0, numberOfQuestions)
      ),
      map((shuffledQuestions: IQuestion[]) =>
        assignBrainsToQuestions(shuffledQuestions, players)
      )
    );
  }

  public addQuestion(text: string, unit: string) {
    this.getDocument().update({
      questions: firestore.FieldValue.arrayUnion({ text, unit })
    });
  }
}
