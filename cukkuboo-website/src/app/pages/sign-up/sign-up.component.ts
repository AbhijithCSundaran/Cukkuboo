import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { SignInService } from '../../sign-in.service';
import { Router } from '@angular/router';
import { PlanService } from '../../plan.service'; // ✅ Import your PlanService

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatSnackBarModule,
    ValidationMessagesComponent
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  plans: any[] = []; // Initialize empty and fill from API

  constructor(
    private fb: FormBuilder,
    private signInService: SignInService,
    private snackBar: MatSnackBar,
    private router: Router,
    private planService: PlanService // ✅ Inject PlanService
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      subscriptionPlan: ['', Validators.required] // Start with empty
    });

    this.loadPlans(); // ✅ Load plans from API
  }

  loadPlans(): void {
    this.planService.listPlans(0, 10, '').subscribe({
      next: (res) => {
        if (res?.status && res.data?.length > 0) {
          this.plans = res.data;
          // Optional: set default value if needed
          this.signUpForm.patchValue({ subscriptionPlan: this.plans[0].value });
        }
      },
      error: (err) => {
        console.error('Failed to load plans:', err);
        this.snackBar.open('Failed to load subscription plans', '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const model = this.signUpForm.value;

      this.signInService.register(model).subscribe({
        next: (response) => {
          if (response?.status) {
            this.snackBar.open('Registration successful!', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.signUpForm.reset();
            this.router.navigate(['/signin']);
          } else {
            this.snackBar.open(response?.message || 'Registration failed', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.snackBar.open('Something went wrong. Please try again.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.signUpForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }
}
