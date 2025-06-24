import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';

import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';

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
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ValidationMessagesComponent
  ]
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;


  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  navigateToSignIn() {
    this.router.navigate(['/signin']);
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const model = this.signUpForm.value;
      this.userService.register(model).subscribe({
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
