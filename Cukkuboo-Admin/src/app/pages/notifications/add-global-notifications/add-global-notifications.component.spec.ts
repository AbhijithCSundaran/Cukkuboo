import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalNotificationsComponent } from './add-global-notifications.component';

describe('AddGlobalNotificationsComponent', () => {
  let component: AddGlobalNotificationsComponent;
  let fixture: ComponentFixture<AddGlobalNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGlobalNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGlobalNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
