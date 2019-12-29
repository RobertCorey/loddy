import { Component, OnInit, Input } from '@angular/core';
import { IPlayer } from '../types/IPlayer';

@Component({
  selector: 'app-players-yet-to-answer',
  templateUrl: './players-yet-to-answer.component.html',
  styleUrls: ['./players-yet-to-answer.component.css']
})
export class PlayersYetToAnswerComponent implements OnInit {
  @Input() players: IPlayer[];
  constructor() {}

  ngOnInit() {}
}
