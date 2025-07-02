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

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ValidationMessagesComponent,
    MatFormFieldModule,
    MatInputModule
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
  changePasswordForm!: FormGroup;
  initialFormValue: any;



  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,) { }

  ngOnInit(): void {

    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      phone: ['', [Validators.required,
      Validators.pattern('^[0-9]{1,15}$')
      ]],
      subscription: [''],
      country_code: ['+91']


    });
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.loadUserData();
  }


  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        const data = response.data;
        this.userId = data.user_id;
        this.profileForm.patchValue({
          username: data.username,
          email: data.email,
          phone: data.phone,
          subscription: data.subscription,
          country_code: data.country_code || '+91',

        });
        this.initialFormValue = this.profileForm.getRawValue();
      },

      error: (err) => {
        console.error('Error fetching profile', err);
      }
    });
  }
  isFormChanged(): boolean {
    const currentValue = this.profileForm.getRawValue();
    return JSON.stringify(currentValue) !== JSON.stringify(this.initialFormValue);
  }
  //update Profile
  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedData = {
        ...this.profileForm.value,
        user_id: this.userId
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
      console.warn('Form is invalid');
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
  }

  backToProfile(): void {
    this.showProfileInfo = true;
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

      // Build FormData to send to backend
      const formData = new FormData();
      formData.append('oldPassword', currentPassword.trim());
      formData.append('newPassword', newPassword.trim());
      formData.append('confirmPassword', confirmPassword.trim());

      this.userService.changePassword(formData).subscribe({
        next: (res) => {
          if (res.status === 1) {
            this.snackBar.open(res.msg, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.showProfileInfo = true;
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
}
