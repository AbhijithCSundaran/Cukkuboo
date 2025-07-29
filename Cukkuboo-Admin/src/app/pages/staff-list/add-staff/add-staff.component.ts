import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { StaffService } from '../../../staff.service';
import { ValidationMessagesComponent } from '../../../core/components/validation-messsage/validaation-message.component';
import { ValidationService } from '../../../core/services/validation.service';
import countrycode from '../../../../assets/json/countrycode.json';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../../core/services/common.service';





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
  selector: 'app-add-staff',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    ValidationMessagesComponent,
    MatTooltipModule
  ],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
})
export class AddStaffComponent {
  public StaffId: number = 0;
  public staffForm!: FormGroup;
  public hidePassword = true;
  public countryCodes = countrycode;
  showPasswordHint = false;



  selectedCountryCode: string = '+91';

  constructor(
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private staffsevice: StaffService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
  ) {


    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.StaffId = +params['id'];
        this.getStaffById(this.StaffId);
      }
    });
  }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.StaffId = id ? +id : 0;
    this.initForm();
    if (this.StaffId) {
      this.getStaffById(this.StaffId);
    }
    const token = sessionStorage.getItem('token');
    console.log('Token from localStorage:', token);
  }
  initForm() {
    this.staffForm = this.fb.group({
      user_id: [0],
      username: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/), Validators.maxLength(15)]],
      countryCode: ['+91', Validators.required],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      password: ['', [ValidationService.passwordValidator]],
      status: ['1', Validators.required],
      join_date: [''],
      user_type: ['staff']
    },
      // { validators: this.passwordValidators }
    );
  }
  passwordValidators(group: AbstractControl): ValidationErrors | null {
    if (!group.value.user_id) {
      group.get('password')?.setValidators([Validators.required, ValidationService.passwordValidator]);
      return { required: true };
    } else {
      group.get('password')?.setValidators(ValidationService.passwordValidator);
      return null;
    }
  }

  forceLowerCaseEmail(event: any): void {
    const inputElement = event.target;
    const currentValue: string = inputElement.value;
    const lowerCaseValue = currentValue.toLowerCase();

    if (currentValue !== lowerCaseValue) {
      const cursorPosition = inputElement.selectionStart;

      // Set lowercased value
      inputElement.value = lowerCaseValue;
      this.staffForm.get('email')?.setValue(lowerCaseValue, { emitEvent: false });

      // Restore cursor position
      inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }


  getStaffById(id: number): void {
    this.staffsevice.getUserById(id).subscribe({
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
          this.staffForm.patchValue({
            user_id: data.user_id || 0,
            username: data.username || '',
            phone: phone || '',
            countryCode: countryCode,
            email: data.email || '',
            user_type: data.user_type || 'staff',
            status: data.status?.toString() || '1',
            join_date: data.join_date ? new Date(data.join_date) : ''
          });

          //  Set validators for password field in edit mode
          // const passwordControl = this.staffForm.get('password') as FormControl;
          // passwordControl.setValidators([
          //   Validators.minLength(8)
          // ]);
          // passwordControl.updateValueAndValidity();

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

  saveStaff(): void {
    debugger;
    if (this.staffForm.valid) {
      const model = this.staffForm.value;
      // Combine country code + phone
      model.phone = `${model.countryCode}-${model.phone}`;
      const payload = {
        ...model,
        join_date: this.formatDateOnly(model.join_date)
      };

      this.staffsevice.register(payload).subscribe({
        next: (response) => {
          if (response.success) {
            const msg = this.StaffId ? 'Staff updated successfully' : 'Staff added successfully';
            this.snackBar.open(msg, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.router.navigate(['/staff-list']);
          }
        },
        error: (error) => {
          const msg = error.error?.message || 'Something went wrong';
          this.snackBar.open(msg, '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.commonService.focusInvalidControl(this.staffForm.controls, this.el.nativeElement)
      this.staffForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  formatDateOnly(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^0-9]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.staffForm.get('phone')?.setValue(filteredValue, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/staff-list']);
  }

}
