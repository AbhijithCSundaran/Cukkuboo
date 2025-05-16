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
    ReactiveFormsModule
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  public UserId: number = 0;
  public userForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.route.params.subscribe((data) => {
      if (data['id']) {
        this.UserId = Number(data['id']);
      }
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      contact: [
        '',
        [
          Validators.pattern(/^\d{0,15}$/), // Only numbers, max 15
          Validators.maxLength(15)
        ]
      ],
      email: ['', [Validators.email]],
      country: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
      status: ['active', Validators.required],
      joinDate: [''],
      subscription: ['free', Validators.required]
    });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      console.log('Form Submitted:', this.userForm.value);
      // Submit form logic here
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onNumberInput(event: any): void {
    const input = event.target;
    const filteredValue = input.value.replace(/[^0-9]/g, '').slice(0, 15);
    input.value = filteredValue;
    this.userForm.get('contact')?.setValue(filteredValue, { emitEvent: false });
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
