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
import { MatSnackBar } from '@angular/material/snack-bar';




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
  confirmDeleteUserId: number | null = null;
  confirmDeleteUserName: string = '';


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private userService: UserService,private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadUsers();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = `${data.username} ${data.email} ${data.phone} ${data.status} ${data.country}`.toLowerCase();
      return dataStr.includes(filter);
    };
  }

    showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
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

openDeleteModal(id: number, username: string): void {
  this.confirmDeleteUserId = id;
  this.confirmDeleteUserName = username;
}

cancelDelete(): void {
  this.confirmDeleteUserId = null;
  this.confirmDeleteUserName = '';
}

confirmDelete(): void {
   
  if (!this.confirmDeleteUserId) return;

  const id = this.confirmDeleteUserId;
    
  this.userService.deleteUser(id).subscribe({
    next: (response) => {
        console.log('Delete API success:', response);
      this.dataSource.data = this.dataSource.data.filter(user => user.id !== id);
      this.dataSource._updateChangeSubscription();
      this.cancelDelete();
    },
    error: (error) => {
      console.error('Delete failed:', error);
    }
  });
}

  addNewUser(): void {
    this.router.navigate(['/add-user']);
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.filter = input.trim().toLowerCase();
  }
}