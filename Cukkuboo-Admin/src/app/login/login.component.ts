import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  hoveringEye = false;
  captchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.renderCaptcha();
  }
  renderCaptcha() {
    setTimeout(() => {
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
      } 
      // else
        // this.renderCaptcha()
    }, 500);
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

    const { username, password } = this.loginForm.value;

    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('jwt', 'ebyeygfyhugnuxhzvtvzfbfbcsufs');
      this.snackBar.open('Login successful', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/dashboard']);
    } else {
      this.snackBar.open('Invalid username or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }

    grecaptcha.reset();
    this.captchaToken = null;
  }
}
