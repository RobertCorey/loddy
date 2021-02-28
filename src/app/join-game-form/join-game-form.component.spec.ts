import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { JoinGameFormComponent } from "./join-game-form.component";

describe("JoinGameFormComponent", () => {
  let component: JoinGameFormComponent;
  let fixture: ComponentFixture<JoinGameFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JoinGameFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinGameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
