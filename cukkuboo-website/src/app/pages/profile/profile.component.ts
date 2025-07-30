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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/components/confirmation-dialog/confirmation-dialog.component';
import{WarningAlertComponent}from'../../warning-alert/warning-alert.component';
import countrycode from '../../../assets/json/countrycode.json';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ValidationMessagesComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule
  ]
})
export class ProfileComponent implements OnInit {

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  deleteAccountForm!: FormGroup;

  userId: number | null = null;
  showProfileInfo = true;
  showChangePassword = false;
  ShowDeleteAccount = false;
  showSignOutModal = false;

  countryCodes = countrycode;
  userData: any;
  initialFormValue: any;

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
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
      username: ['', Validators.required],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{6,15}$')]],
      subscription: [''],
      countryCode: ['', Validators.required]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:  ['', [Validators.required, ValidationService.passwordValidator, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.deleteAccountForm = this.fb.group({
      deleteProfile: ['', Validators.required]
    });

    this.loadUserData();
  }

  loadUserData(): void {
    const data = this.storageService.getItem('userData');
    this.userData = data;
    if (data) {
      this.userId = data.user_id;
      let countryCode = '+91';
      let phoneNumber = data.phone || '';

      if (phoneNumber.includes('-')) {
        const [code, number] = phoneNumber.split('-');
        countryCode = code;
        phoneNumber = number;
      }

      this.profileForm.patchValue({
        username: data.username,
        email: data.email,
        phone: phoneNumber,
        subscription: SubscriptionStatus[Number(data?.subscription_details?.subscription) || 0],
        countryCode: countryCode
      });

      this.initialFormValue = this.profileForm.getRawValue();
    }
  }

  isFormChanged(): boolean {
    return JSON.stringify(this.profileForm.getRawValue()) !== JSON.stringify(this.initialFormValue);
  }

  isPhoneValid(): boolean {
    const phone = this.profileForm.get('phone')?.value;
    return phone?.length >= 7;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const updatedData = {
        ...formValue,
        user_id: this.userId,
        phone: `${formValue.countryCode}-${formValue.phone}`
      };

      this.userService.register(updatedData).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          localStorage.setItem('u_n', updatedData.username || 'User');
          this.storageService.updateItem('username', updatedData.username || 'User');

          const userData = this.storageService.getItem('userData');
          const updatedUserData = { ...userData, ...updatedData };
          this.storageService.updateItem('userData', updatedUserData);

          this.profileForm.markAsPristine();
          this.initialFormValue = this.profileForm.getRawValue();
        },
        error: () => {
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
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  toggleChangePassword(): void {
    this.showProfileInfo = false;
    this.ShowDeleteAccount = false;
    this.showChangePassword = true;


     // Reset password visibility
  this.hideCurrent = true;
  this.hideNew = true;
  this.hideConfirm = true;

  }

  backToProfile(): void {
    this.showProfileInfo = true;
    this.showChangePassword = false;
    this.ShowDeleteAccount = false;
    localStorage.setItem('activeTab', 'profile');

    this.hideCurrent = true;
  this.hideNew = true;
  this.hideConfirm = true;
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
          this.snackBar.open('Password changed successfully', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.backToProfile();
            this.changePasswordForm.reset();
          } else {
          this.snackBar.open('Password update failed.', '', {
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
  const userId = this.userId;
  const authType = this.userData?.auth_type;

  if (authType === 'google') {
    // Call Google account deletion directly (no password)
    this.userService.deleteGoogleAccount(userId!).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.handleSuccessfulDeletion();
        } else {
          this.snackBar.open('Account deletion failed.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: () => {
        this.snackBar.open('Failed to delete Google account.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  } else {
    const password = this.deleteAccountForm.get('deleteProfile')?.value;
    if (!password) return;

    this.userService.deleteAccount(password.trim(), userId!).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.handleSuccessfulDeletion();
        } else {
          this.snackBar.open('Incorrect Password', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      },
      error: () => {
        this.snackBar.open('Failed to delete account.', '', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}


  handleSuccessfulDeletion(): void {
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
  }

  forceLowercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lowercased = input.value.toLowerCase();
    input.value = lowercased;
    this.profileForm.get('email')?.setValue(lowercased);
  }

askToRemoveaccount(): void {
  const dialogRef = this.dialog.open(WarningAlertComponent , {
    data: {
      message: `
       <div class="row justify-content-center black">
    <div class="alert alert-warning col-12" role="alert">
      <h6 class="alert-heading text-center">
        <i class="fa-solid fa-triangle-exclamation"></i> Warning
      </h6>
      <p class="mb-0 text-white text-center">
        All your data, watch history, and subscriptions will be lost. This action is irreversible.
      </p>
      <p  class="mb-0 text-white text-center"> Do you want to continue?</p>
    </div>
  </div>
     
  
      `,
      disableClose: true
    }
  });

  dialogRef.afterOpened().subscribe(() => {
    const dialogEl = document.querySelector('mat-dialog-container');
    if (dialogEl) {
      const confirmBtn = dialogEl.querySelector('#confirm-delete') as HTMLButtonElement;
      const cancelBtn = dialogEl.querySelector('#cancel-delete') as HTMLButtonElement;

      confirmBtn?.addEventListener('click', () => {
        dialogRef.close(true);
      });

      cancelBtn?.addEventListener('click', () => {
        dialogRef.close(false);
      });
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.onDeleteAccount();
    }
  });
}
handleDeleteClick(): void {
  if (this.userData?.auth_type === 'google') {
    this.askToRemoveaccount(); // Direct confirmation for Google users
  } else {
    this.showProfileInfo = false;
    this.showChangePassword = false;
    this.ShowDeleteAccount = true; // Show password form for manual users
  }
}

onSubmitDeleteForm(): void {
  if (this.deleteAccountForm.valid) {
    this.askToRemoveaccount(); // Show final confirmation dialog
  } else {
    this.snackBar.open('Please enter your password.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}



}
