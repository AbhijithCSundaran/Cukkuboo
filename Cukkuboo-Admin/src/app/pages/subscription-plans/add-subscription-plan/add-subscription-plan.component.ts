import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../../core/services/validation.service';
import { PlanService } from '../../../services/plan.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-subscription-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ValidationMessagesComponent
  ],
  templateUrl: './add-subscription-plan.component.html',
  styleUrl: './add-subscription-plan.component.scss'
})
export class AddSubscriptionPlanComponent implements OnInit {
  isEditMode = false;
  subscriptionPlanId: string | null = null;
  dataForm!: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private planService: PlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      subscriptionplan_id: [''],
      plan_name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0), ValidationService.floatValidator]],
      offer_price: [null, [Validators.min(0), ValidationService.floatValidator]],
      period: [null, [Validators.required, Validators.min(1)]],
      features: ['', Validators.required]
    });

    this.subscriptionPlanId = this.route.snapshot.paramMap.get('id');
    if (this.subscriptionPlanId) {
      this.isEditMode = true;
      this.loadSubscriptionPlanData(Number(this.subscriptionPlanId));
    }
  }

  loadSubscriptionPlanData(id: number): void {
    this.planService.getPlanById(id).subscribe({
      next: (response) => {
        const data = Array.isArray(response?.data) ? response.data[0] : response.data;
        if (!data) {
          this.showSnackbar('No plan data found.', 'snackbar-error');
          return;
        }

        this.dataForm.patchValue({
          subscriptionplan_id: +data.subscriptionplan_id,
          plan_name: data.plan_name,
          price: +data.price,
          offer_price: +data.discount_price, // mapping backend field to new name
          period: data.period?.toString(),
          features: data.features
        });
      },
      error: (err) => {
        console.error('Error fetching plan by ID:', err);
        this.showSnackbar('Failed to load plan data.', 'snackbar-error');
      }
    });
  }

 saveUser(): void {
  if (this.dataForm.invalid) {
    this.dataForm.markAllAsTouched();
    this.snackBar.open('Please fill all required fields.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
    return;
  }

    const planData = this.dataForm.value;
    const originalPrice = parseFloat(planData.price);
    const offerPrice = parseFloat(planData.offer_price);

    // Validation: Offer price must be strictly less than price
    if (offerPrice && offerPrice >= originalPrice) {
      this.showSnackbar('Offer price must be less than the actual price.', 'snackbar-error');
      return;
    }

    // Send as discount_price to match backend API
    planData.discount_price = offerPrice;

    if (this.isEditMode && this.subscriptionPlanId) {
      planData.subscriptionplan_id = this.subscriptionPlanId;
    }

    this.planService.addPlan(planData).subscribe({
      next: () => {
        const msg = this.isEditMode ? 'Plan updated successfully!' : 'Plan saved successfully!';
        this.showSnackbar(msg, 'snackbar-success');
        this.router.navigate(['/subscription-plans']);
      },
      error: (error) => {
        console.error('Error saving plan:', error);
        this.showSnackbar('Failed to save plan. Please try again.', 'snackbar-error');
      }
    });
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  goBack(): void {
    this.router.navigate(['/subscription-plans']);
  }
}
