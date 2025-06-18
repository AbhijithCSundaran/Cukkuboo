import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-sign-in',
  imports: [
    MatSnackBarModule,ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      if (username === 'admin' && password === 'admin123') {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'], 
          verticalPosition: 'top'
        });
      } else {
        this.snackBar.open('Invalid username or password', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'], 
          verticalPosition: 'top'
        });
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }


}
