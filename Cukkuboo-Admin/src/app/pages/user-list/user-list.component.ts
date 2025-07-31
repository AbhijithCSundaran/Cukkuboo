import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'slNo', 'username', 'phone', 'email', 'status', 'subscription', 'action'
  ];
  dataSource = new MatTableDataSource<any>([]);
  confirmDeleteUserId: number | null = null;
  confirmDeleteUserName: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadUsers(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  loadUsers(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.userService.list(pageIndex, pageSize, search).subscribe({
      next: (response) => {
        if (response.success) {
          this.dataSource.data = response?.data || [];
          this.totalItems = response?.total || 0;
          
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showSnackbar('Failed to load users.', 'snackbar-error');
      }
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.loadUsers(this.pageIndex, this.pageSize, this.searchText);
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
    const id = this.confirmDeleteUserId;
    if (!id) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.showSnackbar('User deleted successfully!', 'snackbar-success');
        this.loadUsers(this.pageIndex, this.pageSize, this.searchText);
        this.cancelDelete();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.showSnackbar('Failed to delete user. Please try again.', 'snackbar-error');
      }
    });
  }

  addNewUser(): void {
    this.router.navigate(['/add-user']);
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
