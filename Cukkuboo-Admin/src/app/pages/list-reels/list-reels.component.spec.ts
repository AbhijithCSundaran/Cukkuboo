import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReelsComponent } from './list-reels.component';

describe('ListReelsComponent', () => {
  let component: ListReelsComponent;
  let fixture: ComponentFixture<ListReelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListReelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListReelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
