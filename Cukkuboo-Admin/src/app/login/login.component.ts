import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';
  hoveringEye = false;
  captchaToken: string | null = null;

  constructor(private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    debugger;
    if ((window as any).grecaptcha) {
      (window as any).grecaptcha.render('recaptcha-container', {
        sitekey: '6LeoL5UpAAAAABy-sNgzr_XHc2vWl2Kpr45VHWey',
        callback: (response: any) => {
          this.captchaToken = response;
        },
        'expired-callback': () => {
          this.captchaToken = null;
        },
        theme: 'dark'
      });
    } else {
      // Wait and retry or add listener for script load
    }
  }

  login() {
    if (!this.captchaToken) {
      this.snackBar.open('Please complete the CAPTCHA', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.username === 'admin' && this.password === 'admin') {
      localStorage.setItem('jwt', 'ebyeygfyhugnuxhzvtvzfbfbcsufs');
      this.snackBar.open('Login successful', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid username or password';
      this.snackBar.open('Invalid username or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }

    // Reset CAPTCHA after login attempt
    grecaptcha.reset();
    this.captchaToken = null;
  }
}
