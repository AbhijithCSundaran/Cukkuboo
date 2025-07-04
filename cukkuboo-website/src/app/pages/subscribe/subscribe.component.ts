import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
  plans: any[] = [];
  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  stopInfiniteScroll: boolean = false;

  constructor(
    private planService: PlanService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadPlans(this.pageIndex, this.pageSize, this.searchText);
  }

  loadPlans(pageIndex: number = 0, pageSize: number = 20, search: string = ''): void {
    this.planService.listPlans(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length) {
            this.plans = [...this.plans, ...res.data];
          } else {
            this.stopInfiniteScroll = true;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load plans:', err);
      }
    });
  }

  subscribeToPlan(plan: any): void {
 

    const model = {
     
      subscriptionplan_id: plan.id
      
    };

    this.subscriptionService.saveSubscription(model).subscribe({
      next: (res) => {
        if (res?.success) {
          alert('Subscription successful!');
        } else {
          alert(res?.message || 'Subscription failed.');
        }
      },
      error: (err) => {
        console.error('Subscription error:', err);
        alert('An error occurred. Please try again.');
      }
    });
  }
}
