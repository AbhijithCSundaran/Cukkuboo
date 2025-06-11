import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class ListReelsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['slNo', 'title', 'access', 'likes', 'views', 'status', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  confirmDeleteReel: any = null;
  totalItems = 0;
  searchText: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private reelsService: ReelsService
  ) {}

  ngOnInit(): void {
    this.listReels(0, 10, '');
  }

 ngAfterViewInit(): void {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  // Now call listReels only ONCE using paginator values
  this.listReels(this.paginator.pageIndex, this.paginator.pageSize, this.searchText);

  // Listen for pagination
  this.paginator.page.subscribe(() => {
    this.listReels(this.paginator.pageIndex, this.paginator.pageSize, this.searchText);
  });
}


  listReels(pageIndex: number = 0, pageSize: number = 10, search: string = ''): void {
    this.reelsService.listReels(pageIndex, pageSize, search).subscribe({
      next: (response) => {
       
        console.log('API response from listreels():', response);
        this.dataSource.data = response?.data || response || [];

      
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
    this.listReels(0, this.paginator.pageSize || 10, this.searchText);
  }

  addNewReel(): void {
    this.router.navigate(['/add-reel']);
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

  console.log('Deleting reel with id:', reel.id);

  this.reelsService.deleteReels(reel.reels_id).subscribe({
    next: () => {
      console.log('Delete successful, updating dataSource');
      this.dataSource.data = this.dataSource.data.filter(r => r.reels_id !== reel.reels_id);
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
}
