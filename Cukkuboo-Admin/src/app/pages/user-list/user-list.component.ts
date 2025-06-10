import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';



@Component({
  selector: 'app-user-list',
  imports: [RouterLink, MatTableModule, CommonModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatInputModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = [
    'slNo',
    'username',
    'phone',
    'email',
    'country',
    'status',

    'subscription',
    'action',
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = `${data.username} ${data.email} ${data.phone} ${data.status} ${data.country}`.toLowerCase();
      return dataStr.includes(filter);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.userService.list().subscribe({
      next: (response) => {
        console.log('API response from loadUsers():', response);
        this.dataSource.data = response.data;
      },
      error: (error) => {
        console.error('Failed to fetch user list:', error);
      },
    });
  }

  deleteUser(user: any): void {
    const index = this.dataSource.data.indexOf(user);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
    }
  }

  addNewUser(): void {
    this.router.navigate(['/add-user']);
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.filter = input.trim().toLowerCase();
  }
}