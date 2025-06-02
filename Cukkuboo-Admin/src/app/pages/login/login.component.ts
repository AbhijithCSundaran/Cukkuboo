import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ValidationService } from '../../core/services/validation.service';
import { environment } from '../../../environments/environment';

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
  isProd: boolean = environment.production;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, ValidationService.emailValidator]],
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
          theme: 'light'
        });
      } else {
        this.renderCaptcha(); // Retry rendering
      }
    }, 500);
  }

  login() {
    if (this.loginForm.invalid) {
      this.snackBar.open('Invalid email or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.isProd && !this.captchaToken) {
      this.snackBar.open('Please complete the CAPTCHA', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const model = this.loginForm.value;

    this.userService.login(model).subscribe({
      next: (response) => {
        if (response.status) {
          if (response.user.user_type === 'admin') {
            localStorage.setItem('jwt', response.user?.jwt_token);
            this.snackBar.open('Login successful', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open('Not an admin', '', {
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
        }

        // Reset CAPTCHA after any response
        if (this.isProd) {
          grecaptcha.reset();
          this.captchaToken = null;
        }
      },
      error: (error) => {
        console.error(error);
        this.snackBar.open('Login failed. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });

        if (this.isProd) {
          grecaptcha.reset();
          this.captchaToken = null;
        }
      }
    });
  }
}
