import { Component, OnInit } from '@angular/core';
import { mockPlayerList1, mockPlayerList3 } from '../types/IPlayer';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-mock',
  templateUrl: './mock.component.html',
  styleUrls: ['./mock.component.css']
})
export class MockComponent implements OnInit {
  public a: any;
  public b: any;
  public c: any;
  constructor(private qs: QuestionService) {}

  ngOnInit() {
    this.a = mockPlayerList1;
    this.b = mockPlayerList3;
    this.c = [];
  }
}
