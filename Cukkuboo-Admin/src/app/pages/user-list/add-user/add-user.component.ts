import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  public UserId: number = 0;
  public userForm!: FormGroup;
  public hidePassword = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      user_id: [0],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', [Validators.pattern(/^\d{0,15}$/), Validators.maxLength(15)]],
      email: ['', [Validators.email]],
      country: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
      status: ['active', Validators.required],
      subscription: ['free', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.UserId = id ? +id : 0;

    if (this.UserId) {
      this.loadUserData(this.UserId);
    }

    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
  }

  loadUserData(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (response) => {
        console.log('User prefill API response:', response);
        const data = Array.isArray(response?.data) ? response.data[0] : response.data;

        if (data) {
          this.userForm.patchValue({
            user_id: data.user_id,
            username: data.username,
            password: '', 
            phone: data.phone,
            email: data.email,
            country: data.country,
            status: data.status,
            subscription: data.subscription
          });

          const passwordControl = this.userForm.get('password') as FormControl;
          passwordControl.setValidators([]);
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
    if (this.userForm.valid) {
      const model = this.userForm.value;
      this.userService.register(model).subscribe({
        next: (response) => {
          // console.log('Register API success response:', response);
          if (response.status) {
            this.snackBar.open('User registered successfully', '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.router.navigate(['/user-list']);
          }
        },
        error: (error) => {
          console.error('Registration Error:', error);
          const msg = error.error?.message || 'Something went wrong';
          this.snackBar.open(msg, '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.userForm.markAllAsTouched();
      this.snackBar.open('Please correct the form errors.', '', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^0-9]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.userForm.get('phone')?.setValue(filteredValue, { emitEvent: false });
  }

  onCountryInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^a-zA-Z\s]/g, '');
    input.value = filteredValue;
    this.userForm.get('country')?.setValue(filteredValue, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/user-list']);
  }
}
