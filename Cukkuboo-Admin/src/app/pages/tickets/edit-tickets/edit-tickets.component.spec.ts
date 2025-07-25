import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTicketsComponent } from './edit-tickets.component';

describe('EditTicketsComponent', () => {
  let component: EditTicketsComponent;
  let fixture: ComponentFixture<EditTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
