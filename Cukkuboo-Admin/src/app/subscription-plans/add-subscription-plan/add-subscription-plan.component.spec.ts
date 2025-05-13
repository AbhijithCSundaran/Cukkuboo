import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubscriptionPlanComponent } from './add-subscription-plan.component';

describe('AddSubscriptionPlanComponent', () => {
  let component: AddSubscriptionPlanComponent;
  let fixture: ComponentFixture<AddSubscriptionPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSubscriptionPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSubscriptionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
