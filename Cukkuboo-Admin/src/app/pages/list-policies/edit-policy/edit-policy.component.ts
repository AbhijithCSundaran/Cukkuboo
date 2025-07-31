import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PoliciesService } from '../../../services/policies.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-policy',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    MatSelectModule
  ],
  templateUrl: './edit-policy.component.html',
  styleUrls: ['./edit-policy.component.scss']
})
export class EditPolicyComponent implements OnInit {
  public policyForm!: FormGroup;
  public policyId: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private policiesService: PoliciesService
  ) {}

  ngOnInit(): void {
    this.policyForm = this.fb.group({
      type: ['', Validators.required], // You can default or leave blank
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.policyId = id ? +id : 0;

    if (this.policyId) {
      this.loadPolicyData(this.policyId);
    }
  }

  loadPolicyData(id: number): void {
    this.policiesService.getPolicyById(id).subscribe(
      (res) => {
        if (res?.success && res.data) {
          const data = res.data;
          this.policyForm.patchValue({
            type: data.type || '',
            title: data.title || '',
            content: data.content || ''
          });
        } else {
          this.snackBar.open('Failed to load policy details.', 'Close', { duration: 3000 });
        }
      },
      (err) => {
        this.snackBar.open('Error fetching policy data.', 'Close', { duration: 3000 });
      }
    );
  }

  savePolicy(): void {
    if (this.policyForm.invalid) {
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
      return;
    }

    const { type, title, content } = this.policyForm.value;

    this.policiesService.createPolicy(type, title, content).subscribe(
      (res) => {
        if (res?.success) {
          this.snackBar.open(res.message || 'Policy saved successfully.', 'Close', { duration: 3000 });
          this.router.navigate(['/list-policies']);
        } else {
          this.snackBar.open('Failed to save policy.', 'Close', { duration: 3000 });
        }
      },
      (err) => {
        this.snackBar.open('Error while saving policy.', 'Close', { duration: 3000 });
      }
    );
  }
}
