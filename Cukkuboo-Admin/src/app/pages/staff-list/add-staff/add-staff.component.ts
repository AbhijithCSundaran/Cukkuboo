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
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../../staff.service';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent {
  public StaffId: number = 0;
  public staffForm: FormGroup;
  public hidePassword = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private staffsevice: StaffService,
     private snackBar: MatSnackBar
  ) {
    this.staffForm = this.fb.group({
      username: ['', Validators.required],
      phone: ['', [Validators.pattern(/^\d{0,15}$/), Validators.maxLength(15)]],
      email: ['', [Validators.email]],
      password: ['', Validators.required],
      status: ['active', Validators.required],
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
        this.staffForm.patchValue({
          username: res?.username|| '',
         phone: res?.phone || '',
          email: res?.email || '',
          user_type: res?.role || 'staff' ,
          status: res?.status || 'active',
          join_date: res?.join_date ? new Date(res.join_date) : ''
        });

        // Remove password control in edit mode
        this.staffForm.removeControl('password');
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
  debugger;
  if (this.staffForm.valid) {
    const model = this.staffForm.value;

    // Format join_date to avoid timezone issues
    const payload = {
      ...model,
      join_date: this.formatDateOnly(model.join_date)
    };

    this.staffsevice.register(payload).subscribe({
      next: (response) => {
        console.log('Register API success response:', response);
        if (response.status) {
          this.snackBar.open('User registered successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/staff-list']);
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
    this.staffForm.markAllAsTouched();
    this.snackBar.open('Please correct the form errors.', '', {
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
