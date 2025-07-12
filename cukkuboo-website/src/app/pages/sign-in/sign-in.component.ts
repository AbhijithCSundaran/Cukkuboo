import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule, RouterLink,
    ValidationMessagesComponent
  ]
})
export class SignInComponent {
  loginForm: FormGroup;
  loading = false;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public modalData: any,
    @Optional() @Inject(MatDialogRef<SignInComponent>) public dialogRef: any
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const model = this.loginForm.value;
      this.userService.login(model).subscribe({
        next: (response) => {
          console.log('response from login:', response);

          if (response.success) {
            if (response.data.user_type === 'Customer') {
              localStorage.setItem('t_k', response.data?.jwt_token);
              localStorage.setItem('u_n', response.data?.username || 'User');
              this.storageService.updateItem('userData', response.data);
              this.storageService.updateItem('username', response.data?.username || 'User');
              this.storageService.updateItem('token', response.data?.jwt_token || 'token');
              this.storageService.updateItem('subscription', response.data?.plan_type || 'Free');
              if (this.modalData)
                this.dialogRef.close(response)
              else
                this.router.navigate(['/home']);
            } else {
              this.snackBar.open('Not a customer', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
              });
            }
          } else {
            this.snackBar.open(response.message, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
            const res = {
              "success": true,
              "message": "Login successful (type 1)",
              "data": {
                "user_id": "161",
                "username": "Bruce Wayne",
                "phone": "+917854123625",
                "email": "wayne@gmail.com",
                "isBlocked": true,
                "subscription": "free",
                "user_type": "Customer",
                "createdAt": "2025-07-11 20:38:19",
                "updatedAt": "2025-07-11 18:38:19",
                "lastLogin": "2025-07-12 05:20:52",
                "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTIyOTc2NTIsImV4cCI6MTc1MjMwMTI1MiwiZGF0YSI6eyJ1c2VyX2lkIjoiMTYxIn19.iLCVw9ZKNza8rXwYZ8gNx3Lioe9xtIlYRVxAgauCh58",
                "notifications": 1,
                "subscription_details": {
                  "user_subscription_id": "62",
                  "subscriptionplan_id": "123",
                  "plan_name": "Annual Plan ",
                  "start_date": "2025-07-11",
                  "end_date": "2026-07-11",
                  "subscription": "2"
                }
              }
            }
            debugger;
            this.storageService.updateItem('userData', res.data);
            localStorage.setItem('t_k', response.data?.jwt_token);
            localStorage.setItem('u_n', response.data?.username || 'User');
            this.storageService.updateItem('userData', response.data);
            this.storageService.updateItem('username', response.data?.username || 'User');
            this.storageService.updateItem('token', response.data?.jwt_token || 'token');
            this.storageService.updateItem('subscription', response.data?.plan_type || 'Free');

          }

        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      this.snackBar.open('Invalid email or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }
}
