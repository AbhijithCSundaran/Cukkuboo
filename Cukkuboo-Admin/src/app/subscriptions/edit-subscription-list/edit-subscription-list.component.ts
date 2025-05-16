import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-subscription-list',
  imports: [MatCardModule,MatFormFieldModule,MatInputModule,MatDatepickerModule,MatSelectModule ],
  templateUrl: './edit-subscription-list.component.html',
  styleUrl: './edit-subscription-list.component.scss'
})
export class EditSubscriptionListComponent {
 
  selectedPlan: string = '';
  selectedPeriod: string = '';

 
  constructor(
    private dialogRef: MatDialogRef<EditSubscriptionListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

 saveSubscription(): void {
 
  }

  cancel(): void {
    // this.router.navigate(['/subscriptions']);
    this.dialogRef.close();
  }

  
  goBack(): void {
    // this.router.navigate(['/subscriptions']);
  }
} 