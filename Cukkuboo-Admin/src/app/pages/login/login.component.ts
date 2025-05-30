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
  isProd: boolean = environment.production
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,

  ) { }

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
      }
      // else
      // this.renderCaptcha()
    }, 500);
  }

  login() {
    debugger;
    if (!this.captchaToken && this.isProd) {
      this.snackBar.open('Please complete the CAPTCHA', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    // if (this.loginForm.invalid) {
    //   this.snackBar.open('Please fill all required fields', '', {
    //     duration: 3000,
    //     verticalPosition: 'top',
    //     panelClass: ['snackbar-error']
    //   });
    //   return;
    // }
    debugger;
    if (this.loginForm.valid) {
      var model = this.loginForm.value
      this.userService.login(model).subscribe({
        next: (response) => {
          console.log(response)
        },
        error: (error) => {
          console.error(error);
          debugger;
        }
      })
     
      localStorage.setItem('jwt', 'ebyeygfyhugnuxhzvtvzfbfbcsufs');
      this.snackBar.open('Login successful', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/dashboard']);
    } else {
      this.snackBar.open('Invalid email or password', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }

    grecaptcha.reset();
    this.captchaToken = null;
  }
}
