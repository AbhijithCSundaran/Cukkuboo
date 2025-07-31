import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
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
export class TicketsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'name', 'email', 'phone', 'status', 'action'];
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
    private snackBar: MatSnackBar,
    private ticketsService: TicketsService
  ) {}

  ngOnInit(): void {
    this.loadTickets(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadTickets(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  loadTickets(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.ticketsService.listTickets(pageIndex, pageSize, search).subscribe({
      next: (response) => {
        if (response.success) {
          this.dataSource.data = response.data || [];
          this.totalItems = response.total || 0;
        }
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.showSnackbar('Failed to load tickets.', 'snackbar-error');
      }
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.loadTickets(this.pageIndex, this.pageSize, this.searchText);
  }

  openDeleteModal(id: number, name: string): void {
    this.confirmDeleteUserId = id;
    this.confirmDeleteUserName = name;
  }

  cancelDelete(): void {
    this.confirmDeleteUserId = null;
    this.confirmDeleteUserName = '';
  }

  confirmDelete(): void {
    if (this.confirmDeleteUserId !== null) {
      this.ticketsService.deleteTicket(this.confirmDeleteUserId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackbar(response.message || 'Ticket deleted successfully.', 'snackbar-success');
            this.loadTickets(this.pageIndex, this.pageSize, this.searchText);
          } else {
            this.showSnackbar('Failed to delete ticket.', 'snackbar-error');
          }
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showSnackbar('Error occurred while deleting ticket.', 'snackbar-error');
          this.cancelDelete();
        }
      });
    }
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
