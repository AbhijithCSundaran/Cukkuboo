import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AbstractControl, ValidationErrors } from '@angular/forms';
// Your custom service
import { StaffService } from '../../../staff.service';


export function strictEmailValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value;

  // Skip validation if field is empty — let 'required' handle it
  if (!email) return null;

  const regex = /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;
  const knownTLDs = ['com', 'org', 'net', 'in', 'co', 'io'];

  if (!regex.test(email)) return { strictEmail: true };

  const tld = email.split('.').pop()?.toLowerCase();
  if (!tld || !knownTLDs.includes(tld)) return { strictEmail: true };

  return null;
}






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
    MatSnackBarModule
  ],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent {
  public StaffId: number = 0;
  public staffForm: FormGroup;
  public hidePassword = true;



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
  selectedCountryCode: string = '+91';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private staffsevice: StaffService,
    private snackBar: MatSnackBar
  ) {
    this.staffForm = this.fb.group({
      user_id: [0],
      username: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/), Validators.maxLength(15)]],
      countryCode: [this.selectedCountryCode, Validators.required],
      // email: ['', [Validators.email]],
      email: ['', [Validators.required, strictEmailValidator]],
      password: ['', Validators.required],
      status: ['1', Validators.required],
      join_date: [''],
      user_type: ['staff']
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.StaffId = +params['id'];
        this.getStaffById(this.StaffId);
      }
    });
  }

  getStaffById(id: number): void {
    this.staffsevice.getUserById(id).subscribe({
      next: (res) => {
        const data = res?.data;
        if (data) {

           let countryCode = this.selectedCountryCode;
         let phone = data.phone;

        // Try to match against country code list
        const matchedCountry = this.countryCodes.find(c => data.phone?.startsWith(c.dial_code));
        if (matchedCountry) {
          countryCode = matchedCountry.dial_code;
          phone = data.phone.replace(matchedCountry.dial_code, '');
        }
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

          // Make password optional in edit mode
          const passwordControl = this.staffForm.get('password') as FormControl;
          passwordControl.setValidators([]);
          passwordControl.updateValueAndValidity();
        }
      },
      error: (err) => {
        console.error('Failed to fetch user', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  saveStaff(): void {
    if (this.staffForm.valid) {
      const model = this.staffForm.value;
      // Combine country code + phone
      model.phone  = `${model.countryCode}${model.phone}`;
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
