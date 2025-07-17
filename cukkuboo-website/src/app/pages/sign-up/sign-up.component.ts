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
import {
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  NativeDateAdapter
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { UserService } from '../../services/user/user.service';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../core/services/validation.service';

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
    ValidationMessagesComponent
  ]
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate: Date = new Date();
  selectedCountryCode: string = '+91';

  public countryCodes = [
    { name: 'Afghanistan', dial_code: '+93', code: 'AF' },
    { name: 'Albania', dial_code: '+355', code: 'AL' },
    { name: 'Algeria', dial_code: '+213', code: 'DZ' },
    { name: 'Andorra', dial_code: '+376', code: 'AD' },
    { name: 'Angola', dial_code: '+244', code: 'AO' },
    { name: 'Argentina', dial_code: '+54', code: 'AR' },
    { name: 'Armenia', dial_code: '+374', code: 'AM' },
    { name: 'Australia', dial_code: '+61', code: 'AU' },
    { name: 'Austria', dial_code: '+43', code: 'AT' },
    { name: 'Azerbaijan', dial_code: '+994', code: 'AZ' },
    { name: 'Bahamas', dial_code: '+1-242', code: 'BS' },
    { name: 'Bahrain', dial_code: '+973', code: 'BH' },
    { name: 'Bangladesh', dial_code: '+880', code: 'BD' },
    { name: 'Belarus', dial_code: '+375', code: 'BY' },
    { name: 'Belgium', dial_code: '+32', code: 'BE' },
    { name: 'Belize', dial_code: '+501', code: 'BZ' },
    { name: 'Benin', dial_code: '+229', code: 'BJ' },
    { name: 'Bhutan', dial_code: '+975', code: 'BT' },
    { name: 'Bolivia', dial_code: '+591', code: 'BO' },
    { name: 'Bosnia and Herzegovina', dial_code: '+387', code: 'BA' },
    { name: 'Botswana', dial_code: '+267', code: 'BW' },
    { name: 'Brazil', dial_code: '+55', code: 'BR' },
    { name: 'Brunei', dial_code: '+673', code: 'BN' },
    { name: 'Bulgaria', dial_code: '+359', code: 'BG' },
    { name: 'Burkina Faso', dial_code: '+226', code: 'BF' },
    { name: 'Burundi', dial_code: '+257', code: 'BI' },
    { name: 'Cambodia', dial_code: '+855', code: 'KH' },
    { name: 'Cameroon', dial_code: '+237', code: 'CM' },
    { name: 'Canada', dial_code: '+1', code: 'CA' },
    { name: 'Chad', dial_code: '+235', code: 'TD' },
    { name: 'Chile', dial_code: '+56', code: 'CL' },
    { name: 'China', dial_code: '+86', code: 'CN' },
    { name: 'Colombia', dial_code: '+57', code: 'CO' },
    { name: 'Costa Rica', dial_code: '+506', code: 'CR' },
    { name: 'Croatia', dial_code: '+385', code: 'HR' },
    { name: 'Cuba', dial_code: '+53', code: 'CU' },
    { name: 'Cyprus', dial_code: '+357', code: 'CY' },
    { name: 'Czech Republic', dial_code: '+420', code: 'CZ' },
    { name: 'Denmark', dial_code: '+45', code: 'DK' },
    { name: 'Djibouti', dial_code: '+253', code: 'DJ' },
    { name: 'Dominican Republic', dial_code: '+1-809', code: 'DO' },
    { name: 'Ecuador', dial_code: '+593', code: 'EC' },
    { name: 'Egypt', dial_code: '+20', code: 'EG' },
    { name: 'El Salvador', dial_code: '+503', code: 'SV' },
    { name: 'Estonia', dial_code: '+372', code: 'EE' },
    { name: 'Ethiopia', dial_code: '+251', code: 'ET' },
    { name: 'Fiji', dial_code: '+679', code: 'FJ' },
    { name: 'Finland', dial_code: '+358', code: 'FI' },
    { name: 'France', dial_code: '+33', code: 'FR' },
    { name: 'Germany', dial_code: '+49', code: 'DE' },
    { name: 'Ghana', dial_code: '+233', code: 'GH' },
    { name: 'Greece', dial_code: '+30', code: 'GR' },
    { name: 'Guatemala', dial_code: '+502', code: 'GT' },
    { name: 'Honduras', dial_code: '+504', code: 'HN' },
    { name: 'Hong Kong', dial_code: '+852', code: 'HK' },
    { name: 'Hungary', dial_code: '+36', code: 'HU' },
    { name: 'Iceland', dial_code: '+354', code: 'IS' },
    { name: 'India', dial_code: '+91', code: 'IN' },
    { name: 'Indonesia', dial_code: '+62', code: 'ID' },
    { name: 'Iran', dial_code: '+98', code: 'IR' },
    { name: 'Iraq', dial_code: '+964', code: 'IQ' },
    { name: 'Ireland', dial_code: '+353', code: 'IE' },
    { name: 'Israel', dial_code: '+972', code: 'IL' },
    { name: 'Italy', dial_code: '+39', code: 'IT' },
    { name: 'Jamaica', dial_code: '+1-876', code: 'JM' },
    { name: 'Japan', dial_code: '+81', code: 'JP' },
    { name: 'Jordan', dial_code: '+962', code: 'JO' },

  ];
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
        countryCode: [this.selectedCountryCode, Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
        date_of_birth: ['', [Validators.required, this.ageValidator(18)]],
        password: ['', [Validators.required, Validators.minLength(8), ValidationService.passwordValidator]],
        confirmPassword: ['', Validators.required]
      },
      { validators: [this.passwordConfirming] }
    );
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

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  passwordConfirming(group: AbstractControl): null | { [key: string]: boolean } {
    const passwordControl = group.get('password');
    const confirmPasswordControl = group.get('confirmPassword');
    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }
    const password = passwordControl.value;
    const confirmPassword = confirmPasswordControl.value;
    if (password && confirmPassword && password !== confirmPassword) {
      confirmPasswordControl.setErrors({ passwordsMismatch: true }); // Set the error on the `confirm_password` control
      return { passwordsMismatch: true };
    } else if (!confirmPassword) {
      confirmPasswordControl.setErrors({ required: true }); // Clear the error if passwords match
      return { required: true };
    } else {
      confirmPasswordControl.setErrors(null); // Clear the error if passwords match
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

    const formData = this.signUpForm.value;
    formData.phone = `${formData.countryCode}${formData.phone}`;

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
