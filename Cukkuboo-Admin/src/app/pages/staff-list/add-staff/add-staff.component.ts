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

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [
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
    private fb: FormBuilder
  ) {
    this.route.params.subscribe((data) => {
      if (data['id']) {
        this.StaffId = Number(data['id']);
        // TODO: load staff data by id and patch form
      }
    });

    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      contact: [
        '',
        [
          Validators.pattern(/^\d{0,15}$/), // Only numbers max 15 digits
          Validators.maxLength(15)
        ]
      ],
      email: ['', [Validators.email]],
     
      password: ['', Validators.required],
      status: ['active', Validators.required],
      joinDate: [''],
      role: ['', Validators.required] 
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  saveStaff(): void {
    if (this.staffForm.valid) {
      console.log('Staff Form Submitted:', this.staffForm.value);
      // TODO: Add your submit logic here (e.g., call backend API)
    } else {
      this.staffForm.markAllAsTouched();
    }
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^0-9]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.staffForm.get('contact')?.setValue(filteredValue, { emitEvent: false });
  }

  onCountryInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^a-zA-Z\s]/g, '');
    input.value = filteredValue;
    this.staffForm.get('country')?.setValue(filteredValue, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/staff-list']); // Adjust route as needed
  }
}

