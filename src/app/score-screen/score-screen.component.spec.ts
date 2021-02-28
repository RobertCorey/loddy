import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ScoreScreenComponent } from "./score-screen.component";

describe("ScoreScreenComponent", () => {
  let component: ScoreScreenComponent;
  let fixture: ComponentFixture<ScoreScreenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
