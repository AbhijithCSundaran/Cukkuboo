import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReelsComponent } from './add-reels.component';

describe('AddReelsComponent', () => {
  let component: AddReelsComponent;
  let fixture: ComponentFixture<AddReelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
