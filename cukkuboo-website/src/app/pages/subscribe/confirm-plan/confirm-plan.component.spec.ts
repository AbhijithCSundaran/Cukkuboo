import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPlanComponent } from './confirm-plan.component';

describe('ConfirmPlanComponent', () => {
  let component: ConfirmPlanComponent;
  let fixture: ComponentFixture<ConfirmPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
