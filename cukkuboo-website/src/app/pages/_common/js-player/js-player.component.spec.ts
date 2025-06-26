import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsPlayerComponent } from './js-player.component';

describe('JsPlayerComponent', () => {
  let component: JsPlayerComponent;
  let fixture: ComponentFixture<JsPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
