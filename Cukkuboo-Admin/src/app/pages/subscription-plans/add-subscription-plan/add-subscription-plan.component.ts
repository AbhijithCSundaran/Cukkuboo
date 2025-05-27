import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'app-add-subscription-plan',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule,MatInputModule,
    MatCardModule,MatSelectModule,MatDatepickerModule,MatNativeDateModule,
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
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0),ValidationService.floatValidator]],
      period: ['', Validators.required],
      features: ['', Validators.required]
    });

    this.subscriptionPlanId = this.route.snapshot.paramMap.get('id');
    if (this.subscriptionPlanId) {
      this.isEditMode = true;
   
    }
  }

  saveUser(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
    
      return;
    }

    const planData = this.dataForm.value;
    console.log('Saved plan:', planData);
    this.router.navigate(['/subscription-plans']);
  }

  goBack(): void {
    this.router.navigate(['/subscription-plans']);
  }
}
