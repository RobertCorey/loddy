import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';
import { Observable } from 'rxjs';
import { IGame } from '../types/IGame';
import { Game } from '../types/Game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  public id;
  public $game: Observable<IGame>;
  public game: Game;
  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.$game = this.gameService.get(this.id);
    this.$game.subscribe(game => (this.game = new Game(game)));
  }

  get hasPlayerJoined(): boolean {
    return !!this.gameService.localPlayer;
  }

  get isLocalPlayerHost(): boolean {
    return this.gameService.localPlayer.host;
  }

  get canPlayerStartGame(): boolean {
    return this.game.canGameBeStarted && this.isLocalPlayerHost;
  }

  startLobby() {
    this.gameService.startLobby();
  }
}
