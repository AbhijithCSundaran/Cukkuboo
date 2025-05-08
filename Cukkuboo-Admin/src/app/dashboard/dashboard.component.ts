import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table'; 

@Component({
  selector: 'app-dashboard',
  imports: [
  
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalSubscribers = 1050;
  subscribersThisMonth = 120;
  totalMovies = 340;
  monthlyRevenue = 12500;

  topMovies = [
    { title: 'Movie A', views: 9200 },
    { title: 'Movie B', views: 8800 },
    { title: 'Movie C', views: 8500 },
    // ... up to 10
  ];

  latestContent = [
    { title: 'New Movie 1', addedOn: '2025-05-08' },
    { title: 'New Show 2', addedOn: '2025-05-07' },
    // ...
  ];

  constructor() {}

  ngOnInit(): void {}
}
