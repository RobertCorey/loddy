import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoddyButtonComponent } from './loddy-button.component';

describe('LoddyButtonComponent', () => {
  let component: LoddyButtonComponent;
  let fixture: ComponentFixture<LoddyButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoddyButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoddyButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
