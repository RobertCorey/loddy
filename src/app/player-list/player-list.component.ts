import { Component, OnInit, Input } from '@angular/core';
import { IPlayer } from '../types/IPlayer';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  @Input()
  public players: IPlayer[];
  constructor() {}
  ngOnInit() {}
}
