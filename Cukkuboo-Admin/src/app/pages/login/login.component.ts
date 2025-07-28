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
  localLoginMode = true; // set to `true` to bypass API call

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
      else
      this.renderCaptcha()
    }, 500);
  }

  login() {
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
   
    if (this.loginForm.valid) {
      var model = this.loginForm.value
      this.userService.login(model).subscribe({
        next: (response) => {
            console.log('response from login:', response);

          if (response.success) {
            // console.log(response)
            if (response.data.user_type == 'admin' || response.data.user_type == 'staff') {
              sessionStorage.setItem('token', response.data?.jwt_token);
              this.snackBar.open('Login successful', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
              });
              this.router.navigate(['/dashboard']);
            }
            else {
              this.snackBar.open('Not an admin', '', {
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

    grecaptcha.reset();
    this.captchaToken = null;
  }
}
// login() {
//   if (!this.captchaToken && this.isProd) {
//     this.snackBar.open('Please complete the CAPTCHA', '', {
//       duration: 3000,
//       verticalPosition: 'top',
//       panelClass: ['snackbar-error']
//     });
//     return;
//   }

//   if (this.loginForm.valid) {
//     const model = this.loginForm.value;

//     // ⬇️ Local login mode for WFH or offline
//     if (this.localLoginMode) {
//       const allowedUser = {
//         email: 'admin@cukuboo.com',
//         password: 'admin123',
//         user_type: 'admin',
//         jwt_token: 'dummy-jwt-token'
//       };

//       if (
//         model.email === allowedUser.email &&
//         model.password === allowedUser.password
//       ) {
//         sessionStorage.setItem('jwt', allowedUser.jwt_token);
//         this.snackBar.open('Login successful (offline mode)', '', {
//           duration: 3000,
//           verticalPosition: 'top',
//           panelClass: ['snackbar-success']
//         });
//         this.router.navigate(['/dashboard']);
//       } else {
//         this.snackBar.open('Invalid credentials (offline mode)', '', {
//           duration: 3000,
//           verticalPosition: 'top',
//           panelClass: ['snackbar-error']
//         });
//       }

//       grecaptcha.reset();
//       this.captchaToken = null;
//       return;
//     }

//     // ⬇️ Regular API login
//     this.userService.login(model).subscribe({
//       next: (response) => {
//         if (response.status) {
//           if (response.user.user_type == 'admin') {
//             sessionStorage.setItem('jwt', response.user?.jwt_token);
//             this.snackBar.open('Login successful', '', {
//               duration: 3000,
//               verticalPosition: 'top',
//               panelClass: ['snackbar-success']
//             });
//             this.router.navigate(['/dashboard']);
//           } else {
//             this.snackBar.open('Not an admin', '', {
//               duration: 3000,
//               verticalPosition: 'top',
//               panelClass: ['snackbar-error']
//             });
//           }
//         } else {
//           this.snackBar.open(response.message, '', {
//             duration: 3000,
//             verticalPosition: 'top',
//             panelClass: ['snackbar-error']
//           });
//         }
//       },
//       error: (error) => {
//         console.error(error);
//       }
//     });

//   } else {
//     this.snackBar.open('Invalid email or password', '', {
//       duration: 3000,
//       verticalPosition: 'top',
//       panelClass: ['snackbar-error']
//     });
//   }

//   grecaptcha.reset();
//   this.captchaToken = null;
// }
// }