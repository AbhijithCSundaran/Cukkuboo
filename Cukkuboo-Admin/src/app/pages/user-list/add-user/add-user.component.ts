import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
    MatSnackBarModule
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  public UserId: number = 0;
  public userForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe((data) => {
      if (data['id']) {
        this.UserId = Number(data['id']);
      }
    });

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: [
        '',
        [
          Validators.pattern(/^\d{0,15}$/),
          Validators.maxLength(15)
        ]
      ],
      email: ['', [Validators.email]],
      country: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
      status: ['active', Validators.required],
      user_type: ['customer'],
      subscription: ['free', Validators.required]
    });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const model = this.userForm.value;
      debugger;
      this.userService.register(model).subscribe({
        next: (response) => {
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
          var msg = error.error?.message || 'Something went wrong'
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
