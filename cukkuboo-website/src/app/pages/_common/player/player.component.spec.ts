import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalyerComponent } from './player.component';

describe('PalyerComponent', () => {
  let component: PalyerComponent;
  let fixture: ComponentFixture<PalyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PalyerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PalyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
