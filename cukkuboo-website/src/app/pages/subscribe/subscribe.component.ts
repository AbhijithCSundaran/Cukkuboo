import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-subscribe',
  imports: [ CommonModule],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.scss'
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
    ) { }
 ngOnInit(): void {
    this.loadPlans(this.pageIndex, this.pageSize, this.searchText);
  }

   loadPlans(pageIndex: number = 0, pageSize: number = 20, search: string = '') {
    this.planService.listPlans(pageIndex, pageSize, search).subscribe({
      next: (res) => {
        if (res?.success) {
          if (res.data.length)
            this.plans = [...this.plans, ...res.data];
          
          else
            this.stopInfiniteScroll = true;
        }
      }
    });
  }

  }
