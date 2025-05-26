import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubscriptionListComponent } from './edit-subscription-list.component';

describe('EditSubscriptionListComponent', () => {
  let component: EditSubscriptionListComponent;
  let fixture: ComponentFixture<EditSubscriptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSubscriptionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSubscriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
