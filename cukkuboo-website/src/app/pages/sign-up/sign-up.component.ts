import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  NativeDateAdapter
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user/user.service';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../core/services/validation.service';
import countrycode from '../../../assets/json/countrycode.json';

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = this._to2digit(date.getDate());
      const month = this._to2digit(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return super.format(date, displayFormat);
  }

  private _to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    ValidationMessagesComponent
  ]
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate: Date = new Date();
  showPasswordHint = false;

  public countryCodes = countrycode;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.maxDate = eighteenYearsAgo;

    this.signUpForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, ValidationService.emailValidator]],
        countryCode: ['+91', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
        date_of_birth: ['', [Validators.required, this.ageValidator(18)]],
        password: ['', [Validators.required, ValidationService.passwordValidator]],
        confirmPassword: ['', [Validators.required, ]]
      },
      // { validators: [this.passwordConfirming] }
    );
  }

  forceLowerCaseEmail(): void {
    const emailControl = this.signUpForm.get('email');
    const currentValue = emailControl?.value || '';
    const lowerCased = currentValue.toLowerCase();
    if (currentValue !== lowerCased) {
      emailControl?.setValue(lowerCased, { emitEvent: false });
    }
  }

  ageValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dob = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= minAge ? null : { underage: true };
    };
  }

  passwordConfirming(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      group.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^\d]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.signUpForm.get('phone')?.setValue(filteredValue, { emitEvent: false });
  }

  onSubmit(): void {
    this.signUpForm.markAllAsTouched();

    if (this.signUpForm.hasError('passwordMismatch')) {
      this.snackBar.open('Password and Confirm Password do not match.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.signUpForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const formValue = this.signUpForm.value;
    const formData = {
      ...formValue,
      phone: `${formValue.countryCode}-${formValue.phone}`
    };

    this.userService.register(formData).subscribe({
      next: (response) => {
        if (response?.success) {
          this.snackBar.open('Registration successful!', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          this.signUpForm.reset();
          this.router.navigate(['/signin']);
        } else {
          this.snackBar.open(response?.message || 'Registration failed', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Something went wrong. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  navigateToSignIn(): void {
    this.router.navigate(['/signin']);
  }
}
