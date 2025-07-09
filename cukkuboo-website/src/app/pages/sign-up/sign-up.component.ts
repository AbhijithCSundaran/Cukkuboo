import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { UserService } from '../../services/user/user.service';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ValidationMessagesComponent
  ]
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.maxDate = eighteenYearsAgo;

    this.signUpForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [
          Validators.required,
          Validators.pattern(/^\+?[\d\-]{6,14}$/) // 7–15 chars, + and -
        ]],
        date_of_birth: ['', [Validators.required, this.ageValidator(18)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: [this.passwordMatchValidator] }
    );
  }

  /**
   * Validator to check if user is at least minAge
   */
  ageValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dob = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= minAge ? null : { underage: true };
    };
  }

  /**
   * Validator to check if password and confirmPassword match
   */
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  /**
   * Restrict mobile number to +, -, and digits only
   */
  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^\d+\-]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.signUpForm.get('phone')?.setValue(filteredValue, { emitEvent: false });
  }

  /**
   * Submit registration form
   */
  onSubmit(): void {
    this.signUpForm.markAllAsTouched();

    // Form-level error: password mismatch
    if (this.signUpForm.hasError('passwordMismatch')) {
      this.snackBar.open('Password and Confirm Password do not match.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Any other field-level error
    if (this.signUpForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const formData = this.signUpForm.value;

    this.userService.register(formData).subscribe({
      next: (response) => {
        if (response?.success) {
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
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Something went wrong. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  navigateToSignIn(): void {
    this.router.navigate(['/signin']);
  }
}
