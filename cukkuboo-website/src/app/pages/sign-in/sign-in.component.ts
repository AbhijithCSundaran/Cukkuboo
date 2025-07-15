import { Component, Inject, Optional, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { UserService } from '../../services/user/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionStatus } from '../../model/enum';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
    ValidationMessagesComponent
  ]
})
export class SignInComponent implements OnDestroy {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  loading = false;
  hide = true;
  step: number = 0; // 0: Login, 1: Forgot Email, 2: OTP, 3: Reset Password
  emailUsed = '';

  // 👁 Password toggle variables
  hideNewPassword = true;
  hideConfirmPassword = true;

  // ⏳ OTP countdown
  resendCountdown: number = 0;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public modalData: any,
    @Optional() @Inject(MatDialogRef<SignInComponent>) public dialogRef: MatDialogRef<SignInComponent>
  ) {
    // Login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Forgot password form (used in steps 1, 2, and 3)
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // === Snackbar Utility ===
  private showSnackbar(message: string, isSuccess: boolean = false): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: isSuccess ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  // === Login ===
  onSubmit(): void {
    if (this.loginForm.valid) {
      const model = this.loginForm.value;

      this.userService.login(model).subscribe({
        next: (response) => {
          if (response.success && response.data?.user_type === 'Customer') {
            localStorage.setItem('t_k', response.data?.jwt_token);
            this.storageService.updateItem('userData', response.data);
            this.storageService.updateItem('username', response.data?.username || 'User');
            this.storageService.updateItem('token', response.data?.jwt_token || 'token');
            this.storageService.updateItem('subscription', SubscriptionStatus[+response.data?.subscription_details?.subscription || 0]);

            if (this.modalData) {
              this.dialogRef.close(response);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            this.showSnackbar(response.message || 'Invalid email or password');
          }
        },
        error: () => {
          this.showSnackbar('Login error. Please try again.');
        }
      });
    } else {
      this.showSnackbar('Invalid email or password');
    }
  }

  // === Navigation ===
  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  goBackToLogin(): void {
    this.step = 0;
    this.forgotForm.reset();
    this.resendCountdown = 0;
    clearInterval(this.countdownInterval);
  }

  startForgotFlow(): void {
    this.step = 1;
    this.forgotForm.reset();
  }

  // === Step 1: Send OTP ===
sendEmail(): void {
  const email = this.forgotForm.value.email;
  if (!email) {
    this.showSnackbar('Email is required');
    return;
  }

  this.userService.forgotPassword({ email }).subscribe({
    next: () => {
      this.showSnackbar('OTP sent to your email', true);
      this.emailUsed = email;
      this.step = 2;
      this.startResendCountdown();
    },
    error: (error) => {
      const errMsg = error?.error?.message || 'Failed to send OTP';
      
      if (errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('invalid email')) {
        this.showSnackbar('Invalid Mail ID');
      } else {
        this.showSnackbar(errMsg);
      }
    }
  });
}


  // === Step 2: Resend OTP ===
  resendOtp(): void {
    if (!this.emailUsed) {
      this.showSnackbar('Email is missing');
      return;
    }

    this.userService.forgotPassword({ email: this.emailUsed }).subscribe({
      next: () => {
        this.showSnackbar('OTP resent to your email', true);
        this.startResendCountdown();
      },
      error: () => {
        this.showSnackbar('Failed to resend OTP');
      }
    });
  }

  startResendCountdown(): void {
    this.resendCountdown = 60;
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      if (this.resendCountdown > 0) {
        this.resendCountdown--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  // === Step 2: Submit OTP ===
  submitOtp(): void {
    const { otp } = this.forgotForm.value;

    if (!otp) {
      this.showSnackbar('Please enter the OTP');
      return;
    }

    this.userService.forgotPassword({ email: this.emailUsed, otp }).subscribe({
      next: () => {
        this.showSnackbar('OTP verified. Set your new password.', true);
        this.step = 3;
      },
      error: () => {
        this.showSnackbar('Invalid OTP');
      }
    });
  }

  // === Step 3: Reset Password ===
  resetPassword(): void {
    const { new_password, confirm_password, otp } = this.forgotForm.value;

    if (!new_password || !confirm_password) {
      this.showSnackbar('Enter both password fields');
      return;
    }

    if (new_password !== confirm_password) {
      this.showSnackbar('Passwords do not match');
      return;
    }

    const data = {
      email: this.emailUsed,
      otp,
      new_password,
      confirm_password
    };

    this.userService.forgotPassword(data).subscribe({
      next: () => {
        this.showSnackbar('Password reset successful. Please login.', true);
        this.step = 0;
        this.loginForm.patchValue({ email: this.emailUsed });
      },
      error: () => {
        this.showSnackbar('Failed to reset password');
      }
    });
  }

  // === Cleanup ===
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
