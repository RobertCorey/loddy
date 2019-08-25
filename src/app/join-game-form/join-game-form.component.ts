import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-join-game-form',
  templateUrl: './join-game-form.component.html',
  styleUrls: ['./join-game-form.component.css']
})
export class JoinGameFormComponent {
  name: FormControl = new FormControl('');
  constructor() {}
  onSubmit() {
    console.log(this.name.value);
  }
}
