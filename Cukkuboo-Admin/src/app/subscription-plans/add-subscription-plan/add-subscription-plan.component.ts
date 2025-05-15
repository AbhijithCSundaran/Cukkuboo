import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface SubscriptionPlanForm {
  name: string;
  price: number | null;
  period: string;
  features: string;
}

@Component({
  selector: 'app-add-subscription-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-subscription-plan.component.html',
  styleUrl: './add-subscription-plan.component.scss'
})
export class AddSubscriptionPlanComponent implements OnInit {
  isEditMode = false;
  subscriptionPlanId: string | null = null;

  
  plan: SubscriptionPlanForm = {
    name: '',
    price: null,
    period: '',
    features: ''
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscriptionPlanId = this.route.snapshot.paramMap.get('id');
    if (this.subscriptionPlanId) {
      this.isEditMode = true;
     
    }
  }

  saveUser(): void {
    if (!this.plan.name || this.plan.price === null || !this.plan.period || !this.plan.features) {
      alert('Please fill in all required fields.');
      return;
    }

   
    console.log('Saved plan:', this.plan);
    this.router.navigate(['/subscription-plans']);
  }

  cancel(): void {
    this.router.navigate(['/subscription-plans']);
  }

  goBack(): void {
    this.router.navigate(['/subscription-plans']);
  }
}
