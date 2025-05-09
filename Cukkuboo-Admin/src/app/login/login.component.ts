import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  login() {
    if (this.username === 'admin' && this.password === 'admin') {
      //  success message snackbar
      this.snackBar.open('Login successful', 'Close', {
        duration: 3000,
        verticalPosition: 'top'  
      });
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid username or password';
      //  error message snackbar
      this.snackBar.open('Invalid username or password', 'Close', {
        duration: 3000,
        verticalPosition: 'top'  
      });
    }
  }
}
