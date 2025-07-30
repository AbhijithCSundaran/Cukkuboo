import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../../core/services/validation.service';
import countrycode from '../../../../assets/json/countrycode.json';
import { MatTooltipModule } from '@angular/material/tooltip';



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
  selector: 'app-add-user',
  standalone: true,
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, MatCardModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule,
    CommonModule, MatTooltipModule, ValidationMessagesComponent,
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
})
export class AddUserComponent implements OnInit {
  public UserId: number = 0;
  public userForm!: FormGroup;
  public hidePassword = true;
  public today: Date = new Date();
  public countryCodes = countrycode;
  showPasswordHint = false;

  selectedCountryCode: string = '+91';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.UserId = id ? +id : 0;
    this.initUserForm();
    if (this.UserId) {
      this.loadUserData(this.UserId);
    }
    const token = sessionStorage.getItem('token');
    console.log('Token from localStorage:', token);
  }
  initUserForm() {
    this.userForm = this.fb.group({
      user_id: [0],
      username: ['', Validators.required],
      password: ['', [Validators.required, ValidationService.passwordValidator, Validators.minLength(8)]],
      countryCode: [this.selectedCountryCode, Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/), Validators.maxLength(15)]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      country: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
      date_of_birth: ['', Validators.required],
      status: ['1', Validators.required],
    },
      // { validators: this.passwordValidators }
    );
  }
  // passwordValidators(group: AbstractControl): ValidationErrors | null {
  //   if (!group.value.user_id) {
  //     group.get('password')?.setValidators([Validators.required, ValidationService.passwordValidator]);
  //     return { required: true };
  //   } else {
  //     group.get('password')?.setValidators(ValidationService.passwordValidator);
  //     return null;
  //   }
  // }
  forceLowerCaseEmail(event: any): void {
    const inputElement = event.target;
    const currentValue: string = inputElement.value;
    const lowerCaseValue = currentValue.toLowerCase();

    if (currentValue !== lowerCaseValue) {
      const cursorPosition = inputElement.selectionStart;

      // Set lowercased value
      inputElement.value = lowerCaseValue;
      this.userForm.get('email')?.setValue(lowerCaseValue, { emitEvent: false });

      // Restore cursor position
      inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }


  loadUserData(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        const data = Array.isArray(response?.data) ? response.data[0] : response.data;
        if (data) {
          let countryCode = this.selectedCountryCode;
          let phone = data.phone;
          if (phone.includes('-')) {
            const [code, number] = phone.split('-');
            countryCode = code;
            phone = number;
          }


          // Try to match against country code list
          // const matchedCountry = this.countryCodes.find(c => data.phone?.startsWith(c.dial_code));
          // if (matchedCountry) {
          //   countryCode = matchedCountry.dial_code;
          //   phone = data.phone.replace(matchedCountry.dial_code, '');
          // }

          // Patch the form with user data
          this.userForm.patchValue({
            user_id: data.user_id,
            username: data.username,
            password: '', // Leave password empty in edit mode
            phone: phone,
            email: data.email,
            country: data.country,
            countryCode: countryCode,
            date_of_birth: new Date(data.date_of_birth),
            status: data.status,
            subscription: data.subscription
          });

          //  Set validators for password field in edit mode
          const passwordControl = this.userForm.get('password') as FormControl;
          passwordControl.setValidators([
            Validators.minLength(8), ValidationService.passwordValidator
          ]);
          passwordControl.updateValueAndValidity();

        } else {
          console.warn('User not found for ID:', id);
        }
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.snackBar.open('Failed to load user data', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }


  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  saveUser(): void {
    debugger;
    if (this.userForm.valid) {
      const model = this.userForm.value;
      model.email = model.email.toLowerCase();
      // Format date
      const dob: Date = model.date_of_birth;
      model.date_of_birth = this.formatDate(dob);

      // Combine country code with phone
      model.phone = `${model.countryCode}-${model.phone}`;

      this.userService.register(model).subscribe({
        next: (res) => {
          if (res.success === true) {
            // Registration successful
            this.snackBar.open(res.message || 'User registered successfully', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.router.navigate(['/user-list']);
          } else if (res.success === false) {
            // Registration failed (e.g., user exists)
            if (res.message?.toLowerCase().includes('user already exists')) {
              this.snackBar.open('User already exists.', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
              });
            } else {
              this.snackBar.open(res.message || 'Something went wrong.', '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
              });
            }
          }
        },
        error: (err) => {
          // ⚠️ Actual HTTP/server error
          const errorMessage = err.error?.message || 'Server error occurred';
          this.snackBar.open(errorMessage, '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      // Form is invalid
      this.userForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^0-9]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.userForm.get('phone')?.setValue(filteredValue, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/user-list']);
  }



}
