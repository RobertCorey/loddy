import { Component, Input, OnChanges } from "@angular/core";
import { Observable, timer } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";

@Component({
  selector: "app-countdown",
  template: `
    <div class="countdown" *ngIf="seconds$ | async as s" [class.urgent]="s <= 5">
      ⏰ {{ s }}
    </div>
  `,
  styles: [
    `
      .countdown {
        font-size: 48px;
        text-align: center;
      }
      .countdown.urgent {
        color: #ff5050;
      }
    `,
  ],
})
export class CountdownComponent implements OnChanges {
  /** epoch ms when answers lock; written to the game doc by the runner */
  @Input() deadline: number;
  seconds$: Observable<number>;

  ngOnChanges() {
    const deadline = this.deadline;
    this.seconds$ = timer(0, 250).pipe(
      map(() => Math.max(0, Math.ceil((deadline - Date.now()) / 1000))),
      distinctUntilChanged()
    );
  }
}
