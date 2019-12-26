import { Component, OnInit } from '@angular/core';
import { StateMockerService } from './state-mocker.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'loddy';
  constructor(private stateMockerService: StateMockerService) {}
  ngOnInit() {
    this.stateMockerService.onePersonLeftToAnswer();
  }
}
