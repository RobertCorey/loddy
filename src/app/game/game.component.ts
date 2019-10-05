import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';
import { Observable } from 'rxjs';
import { IGame } from '../types/IGame';
import { Game } from '../types/Game';
import { IPlayer } from '../types/IPlayer';
import { IQuestion } from '../types/IQuestion';
import { IGameQuestion } from '../types/IGameQuestion';

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

  get localPlayer(): IPlayer {
    return this.gameService.localPlayer;
  }

  get brainQuestions(): IGameQuestion[] {
    return this.game.getPlayersBrainQuestions(this.localPlayer.id);
  }

  get currentQuestion(): IGameQuestion {
    return this.game.currentQuestion;
  }

  get localPlayerIsBrain(): boolean {
    return this.game.isPlayerBrain(this.localPlayer.id);
  }

  startLobby() {
    this.gameService.startLobby();
  }
}
