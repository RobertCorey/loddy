import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-game',
  templateUrl: './start-game.component.html',
  styleUrls: ['./start-game.component.css']
})
export class StartGameComponent implements OnInit {
  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {}

  async startGame() {
    const gameRef = await this.gameService.create();
    this.router.navigate(['game', gameRef]);
  }
}
