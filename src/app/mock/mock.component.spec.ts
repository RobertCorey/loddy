import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MockComponent } from "./mock.component";

describe("MockComponent", () => {
  let component: MockComponent;
  let fixture: ComponentFixture<MockComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
