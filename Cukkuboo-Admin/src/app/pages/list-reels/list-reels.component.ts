import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReelsService } from '../../services/reels.service';

@Component({
  selector: 'app-list-reels',
  standalone: true,
  templateUrl: './list-reels.component.html',
  styleUrls: ['./list-reels.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class ListReelsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'title', 'access', 'likes', 'views','status', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  confirmDeleteReel: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageIndex: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private reelsService: ReelsService
  ) {}

  ngOnInit(): void {
    this.listReels(this.pageIndex, this.pageSize, this.searchText);
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.listReels(this.pageIndex, this.pageSize, this.searchText);
    });
  }

  listReels(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.reelsService.listReels(pageIndex, pageSize, search).subscribe({
      next: (response) => {
        this.dataSource.data = response?.data || [];
        this.totalItems = response?.total || 0;
      },
      error: (err) => {
        console.error('Failed to load reels:', err);
        this.showSnackbar('Failed to load reels. Please try again.', 'snackbar-error');
      }
    });
  }

  applyGlobalFilter(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.listReels(this.pageIndex, this.pageSize, this.searchText);
  }

  modalDeleteReel(reel: any): void {
    this.confirmDeleteReel = reel;
  }

  cancelDelete(): void {
    this.confirmDeleteReel = null;
  }

  confirmDelete(): void {
    const reel = this.confirmDeleteReel;
    if (!reel) return;

    this.reelsService.deleteReels(reel.reels_id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(r => r.reels_id !== reel.reels_id);
        this.listReels(this.pageIndex, this.pageSize, this.searchText);
        this.showSnackbar('Reel deleted successfully!', 'snackbar-success');
      },
      error: (err) => {
        console.error('Failed to delete reel:', err);
        this.showSnackbar('Failed to delete reel. Please try again.', 'snackbar-error');
      }
    });

    this.confirmDeleteReel = null;
  }

  showSnackbar(message: string, panelClass: string = 'snackbar-default'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
  formatNumber(value: number): string {
    if (value >= 1_000_000) {
      const truncated = Math.floor((value / 1_000_000) * 10) / 10;
      return truncated + 'M';
    } else if (value >= 1_000) {
      const truncated = Math.floor((value / 1_000) * 10) / 10;
      return truncated + 'K';
    } else {
      return value.toString();
    }
  }


}
