import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-user-list',
  imports: [MatTableModule,CommonModule, MatIconModule ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

  users = [
    {
      name: 'John Doe',
      contact: '123-456-7890',
      email: 'john@example.com',
      country: 'USA',
      status: 'active',
      joindate: new Date('2023-05-01'),
      subscription: 'Premium'
    },
    {
      name: 'Jane Smith',
      contact: '987-654-3210',
      email: 'jane@example.com',
      country: 'UK',
      status: 'inactive',
      joindate: new Date('2024-01-15'),
      subscription: 'Basic'
    }

  ];

  displayedColumns: string[] = ['name', 'contact', 'email', 'country', 'status', 'joindate', 'subscription', 'action'];

  constructor() {}

  ngOnInit(): void {}

  editUser(user: any) {
   
  }

  deleteUser(user: any) {
   
  }
}
