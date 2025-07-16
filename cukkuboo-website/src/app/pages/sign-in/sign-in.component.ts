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
  step: number = 0;
  emailUsed = '';
  hideNewPassword = true;
  hideConfirmPassword = true;
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  private showSnackbar(message: string, isSuccess: boolean = false): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: isSuccess ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const model = this.loginForm.value;

      this.userService.login(model).subscribe({
        next: (response) => {
          if (response.success === true && response.data?.user_type === 'Customer') {
            localStorage.setItem('t_k', response.data?.jwt_token);
            this.storageService.updateItem('userData', response.data);
            this.storageService.updateItem('username', response.data?.username || 'User');
            this.storageService.updateItem('token', response.data?.jwt_token || 'token');
            this.storageService.updateItem('subscription', SubscriptionStatus[+response.data?.subscription_details?.subscription || 0]);

            this.modalData ? this.dialogRef.close(response) : this.router.navigate(['/home']);
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

  sendEmail(): void {
    const email = this.forgotForm.value.email;
    if (!email) {
      this.showSnackbar('Email is required');
      return;
    }

    this.userService.forgotPassword({ email }).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.showSnackbar('OTP sent to your email', true);
          this.emailUsed = email;
          this.step = 2;
          this.startResendCountdown();
        } else if (response.success === false) {
          this.showSnackbar(response.message || 'User not found');
        }
      },
      error: (error) => {
        const errMsg = error?.error?.message || 'Failed to send OTP';
        if (errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('user not found')) {
          this.showSnackbar('User not found');
        } else {
          this.showSnackbar(errMsg);
        }
      }
    });
  }

  resendOtp(): void {
    if (!this.emailUsed) {
      this.showSnackbar('Email is missing');
      return;
    }

    this.userService.forgotPassword({ email: this.emailUsed }).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.showSnackbar('OTP resent to your email', true);
          this.startResendCountdown();
        } else {
          this.showSnackbar(response.message || 'Failed to resend OTP');
        }
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

  submitOtp(): void {
    const { otp } = this.forgotForm.value;
    if (!otp) {
      this.showSnackbar('Please enter the OTP');
      return;
    }

    this.userService.forgotPassword({ email: this.emailUsed, otp }).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.showSnackbar('OTP verified. Set your new password.', true);
          this.step = 3;
        } else {
          const message = response.message?.toLowerCase() || '';
          if (message.includes('expired')) {
            this.showSnackbar('OTP has expired.');
          } else {
            this.showSnackbar(response.message || 'Invalid OTP');
          }
        }
      },
      error: (error) => {
        const errMsg = error?.error?.message || 'OTP verification failed';
        this.showSnackbar(errMsg);
      }
    });
  }

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
      next: (response) => {
        if (response.success === true) {
          this.showSnackbar('Password reset successful. Please login.', true);
          this.step = 0;
          this.loginForm.patchValue({ email: this.emailUsed });
        } else {
          this.showSnackbar(response.message || 'Failed to reset password');
        }
      },
      error: () => {
        this.showSnackbar('Failed to reset password');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
  const charCode = event.key.charCodeAt(0);
  // Allow only digits (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

}
