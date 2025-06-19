import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SignInService } from '../../sign-in.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sign-in',
  imports: [
    MatSnackBarModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatCheckboxModule,MatButtonModule,
    ValidationMessagesComponent,  CommonModule,  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signInService: SignInService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      var model = this.loginForm.value
      this.signInService.login(model).subscribe({
        next: (response) => {
            console.log('response from login:', response);

          if (response.status) {
            console.log(response)
            if (response.user.user_type == 'Customer') {
              localStorage.setItem('token', response.user?.jwt_token);
              this.snackBar.open('Login successful', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
              });
              this.router.navigate(['/home']);
            }
            else {
              this.snackBar.open('Not a customer', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
              });
            }
          }
          else {
            this.snackBar.open(response.message, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        },
        error: (error) => {
          console.error(error);
          debugger;
        }
      })

    } else {
      this.snackBar.open('Invalid email or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }

    
  }}

