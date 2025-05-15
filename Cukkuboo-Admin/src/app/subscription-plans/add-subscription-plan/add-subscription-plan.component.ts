import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



@Component({
  selector: 'app-add-subscription-plan',
  imports: [ MatFormFieldModule ,MatInputModule,MatCardModule,MatSelectModule, MatDatepickerModule,MatNativeDateModule ],
  templateUrl: './add-subscription-plan.component.html',
  styleUrl: './add-subscription-plan.component.scss'
})
export class AddSubscriptionPlanComponent {
  isEditMode = false;
  subscriptionPlanId: string | null = null;

  constructor(private router: Router,private route: ActivatedRoute) {}

  ngOnInit(): void {
    
  

    
     this.subscriptionPlanId = this.route.snapshot.paramMap.get('id');
     if (this. subscriptionPlanId) {
       this.isEditMode = true;
      
     }
  }
  
  
  

  saveUser(): void {
 
  }

  cancel(): void {
    this.router.navigate(['/subscription-plans']);
  
  }

  
  goBack(): void {
    this.router.navigate(['/subscription-plans']);
  }

}
