import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/TempStorage/storageService';
import { ValidationService } from '../../core/services/validation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ValidationMessagesComponent } from '../../core/components/validation-messsage/validaation-message.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SubscriptionStatus } from '../../model/enum';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ValidationMessagesComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;
  profileForm!: FormGroup;
  userId: number | null = null;
  showProfileInfo: boolean = true;
  showChangePassword: boolean = false;
  changePasswordForm!: FormGroup;
  initialFormValue: any;
  ShowDeleteAccount: boolean = false;
  deleteAccountForm!: FormGroup;
  showSignOutModal: boolean = false;

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
    private userService: UserService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const activeTab = localStorage.getItem('activeTab');
    const savedView = localStorage.getItem('showProfileInfo');
    this.showProfileInfo = savedView !== 'false';

    this.showProfileInfo = false;
    this.showChangePassword = false;
    this.ShowDeleteAccount = false;

    if (activeTab === 'changePassword') {
      this.showChangePassword = true;
    } else if (activeTab === 'deleteAccount') {
      this.ShowDeleteAccount = true;
    } else {
      this.showProfileInfo = true;
    }

    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{6,15}$')]],
      subscription: [''],
      country_code: ['+91']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), ValidationService.passwordValidator]],
      confirmPassword: ['', Validators.required]
    });

    this.deleteAccountForm = this.fb.group({
      deleteProfile: ['', Validators.required]
    });

    this.loadUserData();
  }

  loadUserData(): void {
    const data = this.storageService.getItem('userData');
    if (data) {
      this.userId = data.user_id;
      let countryCode = '+91';
      let phoneNumber = data.phone || '';

      for (const country of this.countryCodes) {
        if (data.phone?.startsWith(country.dial_code)) {
          countryCode = country.dial_code;
          phoneNumber = data.phone.replace(country.dial_code, '');
          break;
        }
      }

      this.profileForm.patchValue({
        username: data.username,
        email: data.email,
        phone: phoneNumber,
        subscription: SubscriptionStatus[Number(data?.subscription_details?.subscription) || 0],
        country_code: countryCode
      });

      this.initialFormValue = this.profileForm.getRawValue();
    }
  }

  isFormChanged(): boolean {
    const currentValue = this.profileForm.getRawValue();
    return JSON.stringify(currentValue) !== JSON.stringify(this.initialFormValue);
  }

  isPhoneValid(): boolean {
    const phone = this.profileForm.get('phone')?.value;
    return phone?.length >= 7;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const updatedData = {
        ...this.profileForm.value,
        user_id: this.userId,
        phone: formValue.country_code + formValue.phone
      };

      this.userService.register(updatedData).subscribe({
        next: (res) => {
          this.snackBar.open('Profile updated successfully.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          localStorage.setItem('u_n', updatedData?.username || 'User');
          this.storageService.updateItem('username', updatedData?.username || 'User');
          this.profileForm.markAsPristine();
          this.initialFormValue = this.profileForm.getRawValue();
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.snackBar.open('Failed to update profile.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.snackBar.open('Form is invalid', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  toggleChangePassword(): void {
    this.showProfileInfo = false;
    this.ShowDeleteAccount = false;
    this.showChangePassword = true;
  }

  backToProfile(): void {
    this.showProfileInfo = true;
    this.showChangePassword = false;
    this.ShowDeleteAccount = false;
    localStorage.setItem('activeTab', 'profile');
  }

  toggleDeleteAccount(): void {
    this.showProfileInfo = false;
    this.showChangePassword = false;
    this.ShowDeleteAccount = true;
  }

  onChangePassword(): void {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

      if (newPassword !== confirmPassword) {
        this.snackBar.open('New passwords do not match.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        return;
      }

      const model = {
        oldPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      };

      this.userService.changePassword(model).subscribe({
        next: (res) => {
          if (res.success === 'true') {
            this.snackBar.open(res.msg, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.showProfileInfo = true;
            this.showChangePassword = false;
            localStorage.setItem('activeTab', 'profile');
            this.changePasswordForm.reset();
          } else {
            this.snackBar.open(res.msg, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        },
        error: () => {
          this.snackBar.open('Something went wrong. Please try again.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  onDeleteAccount(): void {
    const password = this.deleteAccountForm.get('deleteProfile')?.value;
    if (!password) return;

    const userId = this.userId;

    this.userService.deleteAccount(password.trim(), userId!).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.snackBar.open('Account deleted successfully.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          localStorage.clear();
          this.storageService.updateItem('token', '');
          this.storageService.updateItem('userData', null);
          this.storageService.updateItem('username', '');

          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Incorrect Password', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        this.snackBar.open('Failed to Delete.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  // ✅ Add this method to fix your error
  forceLowercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lowercased = input.value.toLowerCase();
    input.value = lowercased;
    this.profileForm.get('email')?.setValue(lowercased);
  }
}
