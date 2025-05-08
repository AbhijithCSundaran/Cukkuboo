import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-subscription-list',
  imports: [MatCardModule,MatFormFieldModule,MatInputModule,MatDatepickerModule,MatSelectModule ],
  templateUrl: './edit-subscription-list.component.html',
  styleUrl: './edit-subscription-list.component.scss'
})
export class EditSubscriptionListComponent {
  selectedUser: string = '';
  selectedPlan: string = '';

 
  constructor(private router: Router) {}

 saveSubscription(): void {
 
  }

  cancel(): void {
  
  }

  
  goBack(): void {
    this.router.navigate(['/subscriptions']);
  }
}