import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StaffService } from '../../staff.service';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'username', 'email', 'phone', 'status', 'joiningDate', 'action'];
  dataSource = new MatTableDataSource<any>();
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  confirmDeleteVisible = false;
  confirmDeleteStaff: any = null;

  constructor(
    private router: Router,
    private staffservice: StaffService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getStaffList();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = `${data.username} ${data.role} ${data.email} ${data.phone} ${data.status}`.toLowerCase();
      return dataStr.includes(filter);
    };
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    this.paginator?.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.getStaffList();
    });
  }

  getStaffList(): void {
    this.staffservice.getStaffList(this.pageIndex, this.pageSize, this.searchText).subscribe({
      next: (response) => {
        debugger;
        this.dataSource.data = (response.data || []).map((staff: any) => ({
          ...staff,
          join_date: this.fixDateString(staff.join_date)
        }));
        this.totalItems = response.total || 0;
      },
      error: (err) => {
        console.error('Failed to fetch staff list:', err);
        this.showSnackbar('Failed to fetch staff list.', 'snackbar-error');
      }
    });
  }

  fixDateString(date: string): string {
    if(date=='0000-00-00')
      return "NA";
    const d = new Date(date);
    const offsetDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
    return offsetDate.toISOString()?.split('T')[0];
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchText = input.trim().toLowerCase();
    this.pageIndex = 0;
    this.getStaffList();
  }

  onPageChange(event: PageEvent): void {
    debugger;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getStaffList();
  }

  openDeleteModal(staff: any): void {
    this.confirmDeleteStaff = staff;
    this.confirmDeleteVisible = true;
  }

  cancelDelete(): void {
    this.confirmDeleteVisible = false;
    this.confirmDeleteStaff = null;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteStaff) return;

    this.staffservice.deleteUser(this.confirmDeleteStaff.user_id).subscribe({
      next: () => {
        this.getStaffList();
        this.cancelDelete();
        this.showSnackbar('Staff deleted successfully.', 'snackbar-success');
      },
      error: (err) => {
        console.error('Failed to delete staff:', err);
        this.cancelDelete();
        this.showSnackbar('Failed to delete staff. Please try again.', 'snackbar-error');
      }
    });
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
