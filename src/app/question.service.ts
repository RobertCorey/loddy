import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { map, take, tap, share } from 'rxjs/operators';
import { of } from 'rxjs';
import { IQuestion } from './types/IQuestion';

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

  getDocument(): AngularFirestoreDocument<unknown> {
    return this.afs.collection('questions').doc(this.documentId);
  }

  private getQuestions() {
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
}
